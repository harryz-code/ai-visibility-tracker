/** Industry glyph paths from AVT Design System v1 */

export const INDUSTRY_GLYPHS: Record<string, string> = {
  CPG: `<rect x="4" y="7" width="16" height="13" rx="1.5"/><path d="M4 10h16M9 7V5h6v2"/>`,
  "Financial Services": `<path d="M4 10 12 4l8 6"/><path d="M5 10v9M19 10v9M9 10v9M15 10v9"/><path d="M3 20h18"/>`,
  Retail: `<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>`,
  "Media & Entertainment": `<circle cx="12" cy="12" r="8"/><path d="M10 9l5 3-5 3V9Z" fill="currentColor" stroke="none"/>`,
  Technology: `<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3"/>`,
  Hospitality: `<path d="M4 18v-6a2 2 0 0 1 2-2h8a4 4 0 0 1 4 4v4"/><path d="M4 15h16M4 18v1M20 18v1"/><path d="M7 10V8h4v2"/>`,
  "QSRs & Restaurants": `<path d="M7 3v7M5 3v4a2 2 0 0 0 4 0V3M7 10v11"/><path d="M16 3c-2 1-2 5-2 7h4V3h-2Z"/><path d="M16 10v11"/>`,
  "Home Services": `<path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>`,
  "Alcohol & Spirits": `<path d="M6 4h12l-5 7v6"/><path d="M9 20h8"/><path d="M13 17v3"/>`,
  "Consumer Electronics": `<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M11 18h2"/>`,
  Gaming: `<path d="M8 9h8a4 4 0 0 1 4 4l-1 3a2.5 2.5 0 0 1-4 1l-1-2H10l-1 2a2.5 2.5 0 0 1-4-1l-1-3a4 4 0 0 1 4-4Z"/><path d="M7 13h2M8 12v2"/><circle cx="15.5" cy="12.5" r=".6" fill="currentColor" stroke="none"/><circle cx="17" cy="14" r=".6" fill="currentColor" stroke="none"/>`,
  Fitness: `<path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/>`,
  Insurance: `<path d="M12 3s7 2 7 4v5c0 4-3 7-7 8-4-1-7-4-7-8V7c0-2 7-4 7-4Z"/>`,
  Sports: `<circle cx="12" cy="12" r="8"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3M7 7l2 2M17 7l-2 2M7 17l2-2M17 17l-2-2"/>`,
  "Betting & Prediction Markets": `<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>`,
  "Beauty & Personal Care": `<path d="M12 4c3 5 5 7 5 10a5 5 0 0 1-10 0c0-3 2-5 5-10Z"/>`,
  Education: `<path d="M12 5 3 9l9 4 9-4-9-4Z"/><path d="M7 11v4c0 1.5 2.5 3 5 3s5-1.5 5-3v-4"/>`,
  Other: `<circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none"/>`,
};

export function IndustryGlyph({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  const paths = INDUSTRY_GLYPHS[name];
  if (!paths) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  );
}
