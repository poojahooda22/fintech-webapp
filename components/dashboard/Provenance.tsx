import type { Provenance } from '@/lib/sources/types'

// The line under every chart. This is the credibility primitive: it names the
// open source, the license, the cadence, and links out to the data.
export function ProvenanceLine({ source, license, url, frequency, asOf }: Provenance) {
  return (
    <p className="text-xxs text-foreground-muted leading-relaxed">
      source:{' '}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground-brand hover:underline"
      >
        {source}
      </a>{' '}
      &middot; {license} &middot; {frequency} &middot; as of {asOf}
    </p>
  )
}
