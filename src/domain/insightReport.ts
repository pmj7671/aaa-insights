/**
 * Insight report — a plain-language answer to "what should I know and do", with
 * ranked actions, assembled from the analysis outputs.
 * Requirements: R-18 / O-5 (insight report with narrative, metrics, themes,
 * sentiment, Love, Trust, Love×Trust, quotes, ranked actions), principle 1
 * ("insight over dashboards").
 */
export type ActionPriority = 'high' | 'medium' | 'low';

export interface RankedAction {
  priority: ActionPriority;
  action: string;
  rationale: string;
}

export interface InsightReportInput {
  brandName: string;
  brandLoveIndex: number | null;
  trustIndex: number | null;
  /** At-risk respondent count from the Love×Trust segmentation. */
  atRiskCount?: number;
  negSentimentShare?: number | null;
  topThemes?: { label: string; count: number }[];
  topGripe?: { aspect: string; gripes: number };
}

export interface InsightReport {
  brandName: string;
  headline: string;
  metrics: { brandLoveIndex: number | null; trustIndex: number | null; negSentimentShare: number | null };
  topThemes: { label: string; count: number }[];
  actions: RankedAction[];
}

const PRIORITY_ORDER: Record<ActionPriority, number> = { high: 0, medium: 1, low: 2 };

/**
 * Derive ranked actions from the signals. Negative trust and at-risk customers
 * are high priority; a dominant gripe or elevated negative sentiment is medium;
 * a healthy picture yields a reinforce/advocacy action.
 */
export function rankActions(input: InsightReportInput): RankedAction[] {
  const actions: RankedAction[] = [];

  if (input.trustIndex != null && input.trustIndex < 0) {
    actions.push({ priority: 'high', action: 'Rebuild trust', rationale: 'Trust Index is negative' });
  }
  if ((input.atRiskCount ?? 0) > 0) {
    actions.push({ priority: 'high', action: 'Triage at-risk customers', rationale: `${input.atRiskCount} respondents in the At-risk quadrant` });
  }
  if (input.topGripe && input.topGripe.gripes > 0) {
    actions.push({ priority: 'medium', action: `Address ${input.topGripe.aspect}`, rationale: 'Most-cited gripe' });
  }
  if (input.negSentimentShare != null && input.negSentimentShare >= 30) {
    actions.push({ priority: 'medium', action: 'Investigate negative sentiment', rationale: `Negative sentiment share is ${input.negSentimentShare}%` });
  }
  if (input.brandLoveIndex != null && input.brandLoveIndex > 0 && (input.atRiskCount ?? 0) === 0) {
    actions.push({ priority: 'low', action: 'Activate advocates', rationale: 'Positive Brand Love with no acute risk' });
  }

  return actions.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

/** Assemble the full insight report (R-18). */
export function assembleInsightReport(input: InsightReportInput): InsightReport {
  const love = input.brandLoveIndex;
  const headline =
    love == null
      ? `${input.brandName}: no stated Brand Love data in scope`
      : love >= 0
        ? `${input.brandName} customers lean positive (Love Index ${love})`
        : `${input.brandName} customers lean negative (Love Index ${love})`;

  return {
    brandName: input.brandName,
    headline,
    metrics: {
      brandLoveIndex: input.brandLoveIndex,
      trustIndex: input.trustIndex,
      negSentimentShare: input.negSentimentShare ?? null,
    },
    topThemes: input.topThemes ?? [],
    actions: rankActions(input),
  };
}
