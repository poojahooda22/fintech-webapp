// Maps a report or insight slug to the FRED series whose live chart it carries.
// Kept central so the generated content files (reports.ts, insights.ts) stay
// untouched and regenerable. A slug only appears here when a real daily series
// genuinely matches its topic; report-driven categories have no entry.

export const REPORT_FRED: Record<string, string> = {
  'global-curves-term-premium-back-bear-steepening-2026': 'T10Y2Y',
  'credit-spreads-at-cycle-tights-default-cycle-shallow': 'BAMLH0A0HYM2',
  'sp500-concentration-ai-capex-2026': 'SP500',
  'oil-hormuz-war-premium-bleeding-out-on-ceasefire': 'DCOILBRENTEU',
  'us-growth-nowcast-labor-may-2026': 'UNRATE',
  'repo-sofr-srf-reserves-after-qt': 'WRESBAL',
  'stock-bond-correlation-60-40-portfolio-construction-2026': 'VIXCLS',
  'stablecoins-tokenization-genius-mica-implementation': 'CBBTCUSD',
}

export const INSIGHT_FRED: Record<string, string> = {
  '2026-equity-highs-ai-concentration-regime': 'SP500',
  'zero-day-options-pass-60-percent-spx-retail-half-2026': 'VIXCLS',
  'housing-market-may-2026-affordability-thaw-reit-rebound': 'MORTGAGE30US',
  'consumer-investor-sentiment-divergence-2026': 'UMCSENT',
  'imf-gfsr-ofr-2026-nbfi-leverage-valuation-risk': 'NFCI',
  'stablecoins-tokenization-institutional-rails-2026': 'CBBTCUSD',
}
