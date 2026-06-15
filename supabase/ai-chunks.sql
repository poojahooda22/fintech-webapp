-- AI assistant: the searchable library. Run once in the Supabase SQL Editor.
-- Every report and insight gets chopped into small passages ("cards"). Each card
-- stores its text, where it came from, a meaning fingerprint, and a keyword index.
-- This same store powers both the assistant and the real search box.

-- Capabilities Postgres needs:
create extension if not exists vector;        -- meaning-match (pgvector)
create extension if not exists pg_trgm;       -- typo / partial-word match
create extension if not exists fuzzystrmatch; -- sound-alike match (used by a later follow-up)

create table if not exists public.doc_chunks (
  id          bigint generated always as identity primary key,
  surface     text not null check (surface in ('report','insight')),  -- which tab it came from
  parent_slug text not null,                                          -- the report/insight it belongs to
  category    text not null,
  title       text not null,
  source_url  text,                                                   -- the primary source to cite
  chunk_index int  not null,                                          -- order within its parent
  content     text not null,                                          -- the passage itself
  embedding   vector(1536),                                           -- OpenAI text-embedding-3-small fingerprint
  fts         tsvector generated always as (to_tsvector('english', content)) stored,  -- keyword index
  created_at  timestamptz not null default now(),
  unique (surface, parent_slug, chunk_index)
);

-- Meaning-match catalog: HNSW index for fast nearest-neighbor over fingerprints (cosine).
create index if not exists doc_chunks_embedding_idx
  on public.doc_chunks using hnsw (embedding vector_cosine_ops);

-- Keyword catalog (full-text) and typo catalog (trigram).
create index if not exists doc_chunks_fts_idx  on public.doc_chunks using gin (fts);
create index if not exists doc_chunks_trgm_idx on public.doc_chunks using gin (content gin_trgm_ops);

-- Content is open, so reads are public (same posture as reports/insights).
-- Writes happen through the SQL editor or the service role, never the public key.
alter table public.doc_chunks enable row level security;
drop policy if exists "doc_chunks_public_read" on public.doc_chunks;
create policy "doc_chunks_public_read" on public.doc_chunks for select using (true);

-- The librarian's lookup: blend meaning-match and keyword-match into one ranking
-- with Reciprocal Rank Fusion, and return the best passages for a question.
create or replace function public.match_chunks(
  query_text      text,
  query_embedding vector(1536),
  match_count     int default 6,
  rrf_k           int default 50
)
returns table (
  id bigint, surface text, parent_slug text, category text,
  title text, source_url text, content text, score real
)
language sql stable
as $$
  with semantic as (
    select dc.id, row_number() over (order by dc.embedding <=> query_embedding) as rank
    from public.doc_chunks dc
    where dc.embedding is not null
    order by dc.embedding <=> query_embedding
    limit 40
  ),
  lexical as (
    select dc.id,
           row_number() over (
             order by ts_rank_cd(dc.fts, websearch_to_tsquery('english', query_text)) desc
           ) as rank
    from public.doc_chunks dc
    where dc.fts @@ websearch_to_tsquery('english', query_text)
    limit 40
  ),
  fused as (
    select coalesce(s.id, l.id) as id,
           coalesce(1.0 / (rrf_k + s.rank), 0) + coalesce(1.0 / (rrf_k + l.rank), 0) as score
    from semantic s
    full outer join lexical l on s.id = l.id
  )
  select dc.id, dc.surface, dc.parent_slug, dc.category, dc.title, dc.source_url, dc.content,
         f.score::real
  from fused f
  join public.doc_chunks dc on dc.id = f.id
  order by f.score desc
  limit match_count;
$$;

grant usage on schema public to anon, authenticated;
grant select on public.doc_chunks to anon, authenticated;
grant execute on function public.match_chunks(text, vector, int, int) to anon, authenticated;
notify pgrst, 'reload schema';
