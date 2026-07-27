"use client";

import { INDUSTRIES, OTHER_CATEGORY } from "@/lib/workspace/types";
import { IndustryGlyph } from "@/components/industry-icons";
import { cn } from "@/lib/utils";

const TILE_STYLES = [
  "bg-[var(--tile-1)] text-[var(--tile-1-ink)]",
  "bg-[var(--tile-2)] text-[var(--tile-2-ink)]",
  "bg-[var(--tile-3)] text-[var(--tile-3-ink)]",
  "bg-[var(--tile-4)] text-[var(--tile-4-ink)]",
  "bg-[var(--tile-5)] text-[var(--tile-5-ink)]",
];

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
                onChange(
                  industry,
                  industry === OTHER_CATEGORY ? otherValue : "",
                )
              }
              className={cn(
                "flex items-center gap-2 rounded-[12px] border px-2.5 py-2.5 text-left text-xs font-medium transition",
                selected
                  ? "border-primary bg-primary-muted text-primary"
                  : "border-border bg-surface text-ink hover:border-border-strong hover:bg-[var(--primary-muted-2)]",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]",
                  TILE_STYLES[i % TILE_STYLES.length],
                )}
              >
                <IndustryGlyph name={industry} />
              </span>
              <span className="leading-snug">{industry}</span>
            </button>
          );
        })}
      </div>
      {value === OTHER_CATEGORY && (
        <input
          className="focus-ring w-full rounded-[12px] border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
          placeholder="Describe your industry…"
          value={otherValue}
          onChange={(e) => onChange(OTHER_CATEGORY, e.target.value)}
          required
        />
      )}
    </div>
  );
}
