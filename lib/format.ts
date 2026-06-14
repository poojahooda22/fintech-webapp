export function fmtUsdTrillions(n: number): string {
  return `$${(n / 1e12).toFixed(2)}T`
}

export function fmtNum(n: number, digits = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function fmtSignedPct(n: number, digits = 1): string {
  const s = n >= 0 ? '+' : ''
  return `${s}${n.toFixed(digits)}%`
}
