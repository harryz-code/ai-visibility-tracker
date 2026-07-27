"use client";

import { INDUSTRIES, OTHER_CATEGORY } from "@/lib/workspace/types";

type Props = {
  value: string;
  otherValue?: string;
  onChange: (category: string, other?: string) => void;
  id?: string;
};

export function CategorySelect({ value, otherValue = "", onChange, id }: Props) {
  const isOther = value === OTHER_CATEGORY;

  return (
    <div className="space-y-2">
      <select
        id={id}
        className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
        value={isOther || value === OTHER_CATEGORY ? OTHER_CATEGORY : value}
        onChange={(e) => {
          const next = e.target.value;
          onChange(next, next === OTHER_CATEGORY ? otherValue : "");
        }}
      >
        {INDUSTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
        <option value={OTHER_CATEGORY}>{OTHER_CATEGORY}</option>
      </select>
      {isOther && (
        <input
          className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
          placeholder="Describe your industry…"
          value={otherValue}
          onChange={(e) => onChange(OTHER_CATEGORY, e.target.value)}
          required
        />
      )}
    </div>
  );
}
