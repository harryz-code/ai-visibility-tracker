"use client";

import { useMemo, useState } from "react";
import { useInsights } from "@/components/insights/context";
import { DeltaPill } from "@/components/insights/badges";
import { ExportButton } from "@/components/insights/export-button";
import { IconAbsent, IconClose, IconPresent, IconWin, IconLose } from "@/components/icons";
import { ModelBadge } from "@/components/model-badge";
import type { InsightPromptRow } from "@/lib/demo/insights";
import { cn } from "@/lib/utils";

export default function InsightsPromptsPage() {
  const { data, filters } = useInsights();
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});
  const [drill, setDrill] = useState<InsightPromptRow | null>(null);

  const groups = useMemo(() => {
    return data.topicGroups.filter((g) => {
      if (filters.topic !== "all" && g.topic !== filters.topic) return false;
      if (filters.platform !== "all") {
        return g.prompts.some((p) => p.bestModel === filters.platform);
      }
      return true;
    });
  }, [data.topicGroups, filters]);

  function toggle(topic: string) {
    setOpenTopics((s) => ({ ...s, [topic]: !s[topic] }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-muted">
          {data.promptResults.length} prompts · group by topic
        </p>
        <ExportButton
          label="Export answers"
          filename="avt-prompt-answers"
          data={data.promptResults}
          format="json"
        />
      </div>

      <div className="overflow-hidden rounded-[12px] border border-border bg-surface card-shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-3">Topic / Prompt</th>
              <th>Visibility Rank</th>
              <th>Visibility Score</th>
              <th>Avg Position</th>
              <th>Citation Share</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const open = openTopics[g.topic] ?? true;
              return (
                <TopicBlock
                  key={g.topic}
                  group={g}
                  open={open}
                  onToggle={() => toggle(g.topic)}
                  onOpenPrompt={setDrill}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {drill && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-md overflow-y-auto bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-ink">Sample drilldown</h2>
              <button
                type="button"
                className="rounded-md p-1 text-ink-muted hover:text-ink"
                onClick={() => setDrill(null)}
                aria-label="Close"
              >
                <IconClose size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-ink-body">{drill.text}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                  drill.win
                    ? "bg-success-muted text-success"
                    : "bg-danger-muted text-danger",
                )}
              >
                {drill.win ? <IconWin size={12} /> : <IconLose size={12} />}
                {drill.win ? "Win" : "Lose"}
              </span>
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-ink-muted">
                {drill.topic}
              </span>
            </div>
            <ul className="mt-6 space-y-4">
              {drill.samples.map((s) => (
                <li
                  key={s.model}
                  className="rounded-[12px] border border-border p-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <ModelBadge model={s.model} showLabel />
                    <span
                      className={
                        s.mentioned
                          ? "inline-flex items-center gap-1 text-success"
                          : "inline-flex items-center gap-1 text-ink-muted"
                      }
                    >
                      {s.mentioned ? (
                        <IconPresent size={14} />
                      ) : (
                        <IconAbsent size={14} />
                      )}
                      {s.mentioned ? "Present" : "Absent"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs italic text-ink-muted">
                    {s.snippet}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function TopicBlock({
  group,
  open,
  onToggle,
  onOpenPrompt,
}: {
  group: {
    topic: string;
    prompts: InsightPromptRow[];
    visibilityRank: number;
    visibilityScore: number;
    avgPosition: number;
    citationShare: number;
    deltas: InsightPromptRow["deltas"];
  };
  open: boolean;
  onToggle: () => void;
  onOpenPrompt: (p: InsightPromptRow) => void;
}) {
  return (
    <>
      <tr className="border-t border-border bg-surface-muted/40">
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={onToggle}
            className="font-semibold text-ink"
          >
            {open ? "▾" : "▸"} {group.topic}{" "}
            <span className="font-normal text-ink-muted">
              ({group.prompts.length} prompts)
            </span>
          </button>
        </td>
        <td className="tabular-nums">#{group.visibilityRank}</td>
        <td>
          <span className="tabular-nums font-medium">
            {group.visibilityScore}%
          </span>{" "}
          <DeltaPill value={group.deltas.visibilityScore} />
        </td>
        <td>
          <span className="tabular-nums">{group.avgPosition}</span>{" "}
          <DeltaPill value={group.deltas.avgPosition} suffix="" invert />
        </td>
        <td>
          <span className="tabular-nums">{group.citationShare}%</span>{" "}
          <DeltaPill value={group.deltas.citationShare} />
        </td>
      </tr>
      {open &&
        group.prompts.map((p) => (
          <tr
            key={p.id}
            className="cursor-pointer border-t border-border hover:bg-primary-muted/40"
            onClick={() => onOpenPrompt(p)}
          >
            <td className="max-w-md truncate px-4 py-2.5 pl-10 text-ink-body">
              {p.text}
            </td>
            <td className="tabular-nums text-ink-muted">#{p.visibilityRank}</td>
            <td>
              <span className="tabular-nums">{p.visibilityScore}%</span>{" "}
              <DeltaPill value={p.deltas.visibilityScore} />
            </td>
            <td>
              <span className="tabular-nums">{p.avgPosition}</span>{" "}
              <DeltaPill value={p.deltas.avgPosition} suffix="" invert />
            </td>
            <td>
              <span className="tabular-nums">{p.citationShare}%</span>{" "}
              <DeltaPill value={p.deltas.citationShare} />
            </td>
          </tr>
        ))}
    </>
  );
}
