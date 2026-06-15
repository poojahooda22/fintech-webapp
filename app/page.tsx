import Link from 'next/link'
import { ArrowRight, FileText, Link2, LineChart, GraduationCap, type LucideIcon } from 'lucide-react'
import { CATEGORIES } from '@/lib/research/reports'

interface Offer {
  readonly icon: LucideIcon
  readonly title: string
  readonly body: string
}

const OFFERS: readonly Offer[] = [
  {
    icon: FileText,
    title: 'Institutional-grade, rebuilt open',
    body: 'We reconstruct the analysis a bank research desk would write, from sources anyone is free to open. The depth of a terminal, none of the gate.',
  },
  {
    icon: Link2,
    title: 'Every number cites its source',
    body: 'No claim floats on its own. Each figure links straight to the Federal Reserve, the Treasury, the ECB, or the paper behind it, so you can check the work.',
  },
  {
    icon: LineChart,
    title: 'Real data, live where it matters',
    body: 'Live charts pulled from open feeds, each labeled with its real frequency and as-of date. A quarterly read is never dressed up as real time.',
  },
  {
    icon: GraduationCap,
    title: 'The academic layer',
    body: 'A bank can cite its own brand. We cite the frontier instead: the working papers from Harvard, MIT, Stanford, Oxford, and the wider research literature.',
  },
]

export default function Home() {
  return (
    <main className="max-w-page mx-auto px-xl py-5xl flex flex-col gap-6xl">
      <section className="flex flex-col gap-xl max-w-width-xl">
        <span className="text-xs font-medium uppercase tracking-wide text-foreground-brand">
          Open market research
        </span>
        <h1 className="text-display-lg font-semibold text-foreground tracking-tight leading-tight">
          The world of markets, open to everyone
        </h1>
        <p className="text-base text-foreground-secondary leading-relaxed">
          The research big banks reserve for institutional clients, rebuilt from the world&rsquo;s
          open data and elite academic sources, cited line by line, and free for every investor.
        </p>
        <div className="flex flex-wrap items-center gap-lg pt-sm">
          <Link
            href="/global-research"
            className="inline-flex items-center gap-sm h-10 px-xl rounded-md bg-background-brand-solid text-foreground-on-brand text-sm font-semibold hover:bg-background-brand-solid-hover transition-colors focus-visible:outline-none focus-visible:shadow-focus-ring-brand-xs"
          >
            Explore Global Research
            <ArrowRight className="w-4 h-4 stroke-[1.8]" />
          </Link>
          <span className="text-xs text-foreground-muted">
            No login, no paywall. Educational, not advice.
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        <div className="rounded-xl border border-primary bg-background-secondary p-2xl flex flex-col gap-md">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            The problem
          </span>
          <h2 className="text-lg font-semibold text-foreground">Top-tier research is locked away</h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            The best market research sits behind bank logins and paywalls, priced for institutions.
            Individual investors get the headline, almost never the analysis behind it.
          </p>
        </div>
        <div className="rounded-xl border border-primary bg-background-secondary p-2xl flex flex-col gap-md">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            The gap
          </span>
          <h2 className="text-lg font-semibold text-foreground">The raw data is open, but scattered</h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Central banks, regulators, the IMF, and universities publish a vast amount of open data
            and research. It is fragmented, technical, and never assembled into a view you can read.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-xl">
        <div className="flex flex-col gap-xxs">
          <h2 className="text-xl font-semibold text-foreground">What this platform does</h2>
          <p className="text-sm text-foreground-muted">
            We close that gap. The depth of a bank desk, built on sources you can open yourself.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
          {OFFERS.map((o) => {
            const Icon = o.icon
            return (
              <div
                key={o.title}
                className="rounded-xl border border-primary bg-background-secondary p-2xl flex flex-col gap-md"
              >
                <span className="w-9 h-9 rounded-md bg-background-active flex items-center justify-center">
                  <Icon className="w-4 h-4 stroke-[1.6] text-foreground-brand" />
                </span>
                <h3 className="text-sm font-semibold text-foreground">{o.title}</h3>
                <p className="text-xs text-foreground-secondary leading-relaxed">{o.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-lg">
        <h2 className="text-base font-semibold text-foreground">Coverage across every asset class</h2>
        <div className="flex flex-wrap gap-sm">
          {CATEGORIES.map((c) => (
            <span
              key={c}
              className="inline-flex items-center h-7 px-md rounded-full border border-primary bg-background-secondary text-xs text-foreground-secondary"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-primary bg-background-secondary p-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-xl">
        <div className="flex flex-col gap-xxs">
          <h2 className="text-lg font-semibold text-foreground">Start reading the research</h2>
          <p className="text-sm text-foreground-secondary">
            Dozens of analyst-grade reports, live data, and a source under every claim.
          </p>
        </div>
        <Link
          href="/global-research"
          className="inline-flex items-center gap-sm h-10 px-xl rounded-md bg-background-brand-solid text-foreground-on-brand text-sm font-semibold hover:bg-background-brand-solid-hover transition-colors focus-visible:outline-none focus-visible:shadow-focus-ring-brand-xs shrink-0"
        >
          Open Global Research
          <ArrowRight className="w-4 h-4 stroke-[1.8]" />
        </Link>
      </section>
    </main>
  )
}
