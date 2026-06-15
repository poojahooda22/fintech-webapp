export function KeyTakeaways({ points }: { readonly points: readonly string[] }) {
  if (points.length === 0) return null
  return (
    <section className="rounded-xl border border-primary bg-background-secondary p-xl flex flex-col gap-md">
      <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
        Key takeaways
      </span>
      <ul className="flex flex-col gap-sm">
        {points.map((point) => (
          <li
            key={point.slice(0, 32)}
            className="flex gap-md text-sm text-foreground-secondary leading-relaxed"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground-brand" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
