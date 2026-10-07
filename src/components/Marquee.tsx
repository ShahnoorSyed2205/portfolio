/** The single marquee on the page: brand values and the three meanings of 369. Decorative, so hidden from assistive tech. */
export function Marquee({ items }: { items: readonly string[] }) {
  const row = [...items, ...items];
  return (
    <div aria-hidden="true" className="marquee overflow-hidden border-y border-white/10 bg-ink-900/60 py-6">
      <div className="marquee-track flex gap-0 whitespace-nowrap">
        {[0, 1].map((n) => (
          <ul key={n} className="flex shrink-0 items-center">
            {row.map((w, i) => (
              <li key={`${n}-${i}`} className="flex items-center">
                <span className="px-8 font-display text-3xl font-extrabold tracking-tight text-fg/90 md:text-4xl">{w}</span>
                <span className="h-8 w-px bg-gradient-to-b from-transparent via-gold to-transparent" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
