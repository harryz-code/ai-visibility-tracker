/**
 * Alias-aware brand matching. Final authority for metrics is the judge;
 * this helper is used for seed fixtures and quick checks.
 */
export function matchBrand(
  text: string,
  brands: { name: string; aliases: string[] }[],
): { brand: string; matched_alias: string } | null {
  const lower = text.toLowerCase();
  // Prefer longer aliases first to avoid partial collisions
  const candidates = brands.flatMap((b) =>
    [b.name, ...b.aliases]
      .map((a) => ({ brand: b.name, alias: a }))
      .sort((a, b) => b.alias.length - a.alias.length),
  );

  for (const c of candidates) {
    const alias = c.alias.toLowerCase();
    if (!alias) continue;
    // word-boundary-ish match
    const re = new RegExp(
      `(^|[^a-z0-9])${escapeRegExp(alias)}([^a-z0-9]|$)`,
      "i",
    );
    if (re.test(lower)) {
      return { brand: c.brand, matched_alias: c.alias };
    }
  }
  return null;
}

export function findAllBrandMentions(
  text: string,
  brands: { name: string; aliases: string[] }[],
): { brand: string; matched_alias: string }[] {
  const found: { brand: string; matched_alias: string }[] = [];
  const seen = new Set<string>();
  // Check each brand independently
  for (const b of brands) {
    const m = matchBrand(text, [b]);
    if (m && !seen.has(m.brand)) {
      seen.add(m.brand);
      found.push(m);
    }
  }
  return found;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
