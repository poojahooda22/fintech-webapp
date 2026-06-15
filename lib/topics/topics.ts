import { REPORTS, type Report } from '@/lib/research/reports'
import { INSIGHTS, type Insight } from '@/lib/insights/insights'

// Cross-cutting topic library, modeled on the Morgan Stanley "View More Topics"
// tree plus our own themes. Topics are a tagging layer over every piece of
// content, not extra tabs: one report can sit under several topics.
export interface TopicGroup {
  readonly group: string
  readonly topics: readonly string[]
}

export const TOPIC_GROUPS: readonly TopicGroup[] = [
  {
    group: 'Markets and Economy',
    topics: [
      'Consumer Spending',
      'Earnings',
      'Employment',
      'Housing',
      'Inflation',
      'Interest Rates',
      'Liquidity',
      'Mergers and Acquisitions',
      'Public Policy',
      'Recession',
      'Volatility',
    ],
  },
  {
    group: 'Personal Finance',
    topics: ['Budgeting', 'Estate Planning', 'Giving Back', 'Retirement', 'Student Loans', 'Taxes', 'Wealth Transfer'],
  },
  {
    group: 'Sectors and Industries',
    topics: [
      'Agriculture',
      'Automotive',
      'Energy',
      'Infrastructure',
      'Manufacturing',
      'Materials',
      'Media and Entertainment',
      'Real Estate',
      'Technology',
      'Telecommunications',
      'Transportation',
      'Travel',
      'Utilities',
    ],
  },
  {
    group: 'Global Markets',
    topics: ['Africa', 'Asia', 'Australia', 'China', 'Europe', 'India', 'Japan', 'Latin America', 'United States'],
  },
  {
    group: 'Themes',
    topics: [
      'Artificial Intelligence',
      'Digital Assets',
      'Macroeconomics',
      'Market Structure',
      'Private Markets',
      'Technology and Disruption',
      'Wealth Management',
    ],
  },
  {
    group: 'Sustainability',
    topics: ['Climate Change', 'ESG Investing', 'Inclusive Growth', 'Sustainable Finance'],
  },
]

export const ALL_TOPICS: readonly string[] = TOPIC_GROUPS.flatMap((g) => g.topics)

export function slugifyTopic(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function topicFromSlug(slug: string): string | undefined {
  return ALL_TOPICS.find((t) => slugifyTopic(t) === slug)
}

// Multi-character keywords keep substring matching safe (no two-letter false
// positives). A topic with no entry falls back to its own lowercased name.
const TOPIC_KEYWORDS: Record<string, string[]> = {
  Inflation: ['inflation', 'cpi', 'pce', 'breakeven', 'disinflation'],
  'Interest Rates': ['interest rate', 'policy rate', 'fed funds', 'rate cut', 'rate hike', 'yield curve', 'treasury yield', 'bond yield'],
  Housing: ['housing', 'home price', 'mortgage', 'case-shiller', 'residential'],
  Employment: ['employment', 'unemployment', 'payroll', 'jobs report', 'labor market'],
  Earnings: ['earnings', 'profit', 'margin', 'free cash flow'],
  Liquidity: ['liquidity', 'reserves', 'repo', 'sofr', 'funding market'],
  'Mergers and Acquisitions': ['merger', 'acquisition', 'm&a', 'takeover', 'buyout'],
  'Public Policy': ['policy', 'tariff', 'fiscal', 'regulation', 'government', 'basel'],
  Recession: ['recession', 'hard landing', 'soft landing', 'downturn'],
  Volatility: ['volatility', 'vix'],
  'Consumer Spending': ['consumer spending', 'retail sales', 'household', 'consumer cash'],
  Retirement: ['retirement', '401k', 'pension'],
  'Estate Planning': ['estate planning', 'inheritance'],
  'Wealth Transfer': ['wealth transfer', 'great wealth', 'generational'],
  Taxes: ['withholding tax', ' tax ', 'taxation'],
  'Real Estate': ['real estate', 'reit', 'commercial real estate', 'office', 'data center', 'property'],
  Technology: ['technology', 'software', 'semiconductor', 'chip', 'cloud'],
  'Artificial Intelligence': ['artificial intelligence', 'capex', 'hyperscaler', 'agentic', 'ai infrastructure', 'ai spending', 'ai capex'],
  'Technology and Disruption': ['disruption', 'fintech', 'tokeniz', 'stablecoin', 'blockchain', 'payment'],
  Materials: ['materials', 'copper', 'metals', 'gold', 'silver'],
  Energy: ['energy', 'oil', 'crude', 'brent', 'natural gas', 'opec'],
  Transportation: ['transportation', 'shipping', 'logistics', 'freight'],
  Travel: ['travel', 'tourism', 'hotel', 'airline'],
  Automotive: ['automotive', 'vehicle', 'car sales', ' ev '],
  Manufacturing: ['manufacturing', 'factory', 'industrial', 'onshoring'],
  Telecommunications: ['telecom', 'broadband', '5g'],
  Utilities: ['utilities', 'power grid', 'electricity'],
  'Media and Entertainment': ['media', 'entertainment', 'gaming', 'streaming'],
  Agriculture: ['agriculture', 'crop', 'farm', 'grain'],
  Infrastructure: ['infrastructure', 'construction'],
  China: ['china', 'chinese', 'yuan', 'renminbi', 'pboc'],
  India: ['india', 'indian', 'rupee', 'sensex', 'nifty'],
  Japan: ['japan', 'japanese', 'yen', 'boj', 'jgb'],
  Europe: ['europe', 'euro area', 'ecb', 'eurozone', 'bund'],
  'United States': ['united states', 'u.s.', 'federal reserve', 'treasury'],
  Asia: ['asia', 'korea', 'taiwan'],
  'Latin America': ['latin america', 'brazil', 'mexico'],
  Africa: ['africa'],
  Australia: ['australia', 'aussie'],
  'Climate Change': ['climate', 'carbon', 'emissions'],
  'ESG Investing': ['esg', 'sustainable investing'],
  'Sustainable Finance': ['sustainable finance', 'green bond'],
  'Inclusive Growth': ['inclusive growth'],
  Macroeconomics: ['gdp', 'nowcast', 'macro'],
  'Market Structure': ['market structure', 'clearing', 'basis trade', 'portfolio trading', 'etf flow', 'private credit'],
  'Digital Assets': ['bitcoin', 'crypto', 'stablecoin', 'tokeniz', 'ethereum', 'digital asset'],
  'Private Markets': ['private equity', 'private credit', 'venture', 'dry powder', 'secondaries'],
  'Wealth Management': ['wealth management', 'hnw', 'advisor', 'great wealth transfer'],
}

function keywordsFor(topic: string): string[] {
  return TOPIC_KEYWORDS[topic] ?? [topic.toLowerCase()]
}

function topicsForText(text: string): string[] {
  const hay = ` ${text.toLowerCase()} `
  return ALL_TOPICS.filter((topic) => keywordsFor(topic).some((kw) => hay.includes(kw)))
}

function reportText(r: Report): string {
  return `${r.category} ${r.title} ${r.summary} ${(r.keyPoints ?? []).join(' ')}`
}
function insightText(i: Insight): string {
  return `${i.category} ${i.title} ${i.summary} ${(i.keyPoints ?? []).join(' ')}`
}

export interface TopicMatches {
  readonly reports: readonly Report[]
  readonly insights: readonly Insight[]
}

export function getTopicMatches(topic: string): TopicMatches {
  return {
    reports: REPORTS.filter((r) => topicsForText(reportText(r)).includes(topic)),
    insights: INSIGHTS.filter((i) => topicsForText(insightText(i)).includes(topic)),
  }
}

export function topicCount(topic: string): number {
  const m = getTopicMatches(topic)
  return m.reports.length + m.insights.length
}
