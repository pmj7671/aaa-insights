/**
 * Competitive benchmark — own brand vs. tracked competitors across the headline
 * metrics.
 * Requirements: R-27 / O-9 (benchmark own vs competitors over a period),
 * E-14 (sparse competitor data shows no value rather than a misleading number).
 *
 * Pure comparison over pre-computed per-brand metrics; collection/period-scoping
 * is upstream.
 */
export interface BrandMetrics {
  brandId: string;
  brandName: string;
  type: 'own' | 'competitor';
  brandLoveIndex?: number | null;
  trustIndex?: number | null;
  avgRating?: number | null;
  negSentimentShare?: number | null;
}

type MetricKey = 'brandLoveIndex' | 'trustIndex' | 'avgRating' | 'negSentimentShare';

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'brandLoveIndex', label: 'Brand Love Index' },
  { key: 'trustIndex', label: 'Trust Index' },
  { key: 'avgRating', label: 'Average rating' },
  { key: 'negSentimentShare', label: 'Negative sentiment share' },
];

export interface CompetitorCell {
  brandId: string;
  brandName: string;
  value: number | null;
  /** own − competitor, or null when either side is missing (E-14). */
  deltaVsOwn: number | null;
}

export interface BenchmarkRow {
  metric: string;
  own: number | null;
  competitors: CompetitorCell[];
}

export interface Benchmark {
  own: BrandMetrics;
  rows: BenchmarkRow[];
}

/**
 * Build the benchmark from a set of per-brand metrics. Returns null if there is
 * no `own` brand. A missing metric on either side yields a null value / null
 * delta (never a fabricated comparison — E-14).
 */
export function benchmark(brands: readonly BrandMetrics[]): Benchmark | null {
  const own = brands.find((b) => b.type === 'own');
  if (!own) return null;
  const competitors = brands.filter((b) => b.type === 'competitor');

  const rows: BenchmarkRow[] = METRICS.map(({ key, label }) => {
    const ownValue = own[key] ?? null;
    return {
      metric: label,
      own: ownValue,
      competitors: competitors.map((c) => {
        const value = c[key] ?? null;
        const deltaVsOwn = ownValue == null || value == null ? null : Math.round((ownValue - value) * 100) / 100;
        return { brandId: c.brandId, brandName: c.brandName, value, deltaVsOwn };
      }),
    };
  });

  return { own, rows };
}
