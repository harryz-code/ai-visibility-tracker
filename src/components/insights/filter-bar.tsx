"use client";

import type { DateRange } from "@/lib/demo/insights";
import { cn } from "@/lib/utils";

export type InsightsFilters = {
  range: DateRange;
  vsPrevious: boolean;
  topic: string;
  platform: string;
};

type Props = {
  value: InsightsFilters;
  onChange: (next: InsightsFilters) => void;
  topics?: string[];
  platforms?: { id: string; label: string }[];
  className?: string;
};

export function InsightsFilterBar({
  value,
  onChange,
  topics = [],
  platforms = [],
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-border pb-3",
        className,
      )}
    >
      <select
        className="focus-ring h-btn-sm rounded-lg border border-border bg-surface px-2.5 text-sm"
        value={value.range}
        onChange={(e) =>
          onChange({ ...value, range: e.target.value as DateRange })
        }
      >
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
      </select>
      <label className="inline-flex h-btn-sm items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-sm text-ink-body">
        <input
          type="checkbox"
          checked={value.vsPrevious}
          onChange={(e) =>
            onChange({ ...value, vsPrevious: e.target.checked })
          }
        />
        vs. Previous Period
      </label>
      {topics.length > 0 && (
        <select
          className="focus-ring h-btn-sm rounded-lg border border-border bg-surface px-2.5 text-sm"
          value={value.topic}
          onChange={(e) => onChange({ ...value, topic: e.target.value })}
        >
          <option value="all">All topics</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}
      {platforms.length > 0 && (
        <select
          className="focus-ring h-btn-sm rounded-lg border border-border bg-surface px-2.5 text-sm"
          value={value.platform}
          onChange={(e) => onChange({ ...value, platform: e.target.value })}
        >
          <option value="all">All platforms</option>
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
