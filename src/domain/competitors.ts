/**
 * Competitor configuration — define and manage the competitor brands to track.
 * Requirements: R-24 (define/manage competitors: names, aliases, products,
 * sources), I-8. Generic & configurable (D-10).
 */
export interface Competitor {
  brandId: string;
  name: string;
  aliases: string[];
  products?: string[];
  tracked: boolean;
}

/** Add a competitor, replacing any existing one with the same brandId (no duplicates). */
export function addCompetitor(list: readonly Competitor[], competitor: Competitor): Competitor[] {
  return [...list.filter((c) => c.brandId !== competitor.brandId), competitor];
}

/** Remove a competitor by brandId. */
export function removeCompetitor(list: readonly Competitor[], brandId: string): Competitor[] {
  return list.filter((c) => c.brandId !== brandId);
}

/** The currently tracked competitors. */
export function trackedCompetitors(list: readonly Competitor[]): Competitor[] {
  return list.filter((c) => c.tracked);
}

/** Whether a piece of text refers to a competitor by its name or an alias (case-insensitive). */
export function matchesBrand(competitor: Competitor, text: string): boolean {
  const t = text.toLowerCase();
  return [competitor.name, ...competitor.aliases].some((n) => n.trim() !== '' && t.includes(n.toLowerCase()));
}
