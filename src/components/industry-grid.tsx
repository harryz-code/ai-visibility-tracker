"use client";

import { INDUSTRIES, OTHER_CATEGORY } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";

const TILE_COLORS = [
  "bg-orange-100 text-orange-800",
  "bg-sky-100 text-sky-800",
  "bg-emerald-100 text-emerald-800",
  "bg-pink-100 text-pink-800",
];

const GLYPHS: Record<string, string> = {
  CPG: "🛒",
  "Financial Services": "🏛",
  Retail: "🛍",
  "Media & Entertainment": "🎬",
  Technology: "💻",
  Hospitality: "🔔",
  "QSRs & Restaurants": "🍔",
  "Home Services": "🏠",
  "Alcohol & Spirits": "🍸",
  "Consumer Electronics": "🖥",
  Gaming: "🎮",
  Fitness: "🏋",
  Insurance: "🛡",
  Sports: "🏆",
  "Betting & Prediction Markets": "🎲",
  "Beauty & Personal Care": "✨",
  Education: "🎓",
  Other: "＋",
};

type Props = {
  value: string;
  otherValue?: string;
  onChange: (category: string, other?: string) => void;
};

export function IndustryGrid({ value, otherValue = "", onChange }: Props) {
  const options = [...INDUSTRIES, OTHER_CATEGORY];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((industry, i) => {
          const selected = value === industry;
          return (
            <button
              key={industry}
              type="button"
              onClick={() =>
                onChange(industry, industry === OTHER_CATEGORY ? otherValue : "")
              }
              className={cn(
                "flex items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left text-xs font-medium transition",
                selected
                  ? "border-primary bg-primary-muted text-primary"
                  : "border-border bg-surface text-ink hover:border-border-strong",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm",
                  TILE_COLORS[i % TILE_COLORS.length],
                )}
              >
                {GLYPHS[industry] ?? "•"}
              </span>
              <span className="leading-snug">{industry}</span>
            </button>
          );
        })}
      </div>
      {value === OTHER_CATEGORY && (
        <input
          className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
          placeholder="Describe your industry…"
          value={otherValue}
          onChange={(e) => onChange(OTHER_CATEGORY, e.target.value)}
          required
        />
      )}
    </div>
  );
}
