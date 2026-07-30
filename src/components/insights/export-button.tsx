"use client";

import { IconDownload } from "@/components/icons";

export function ExportButton({
  label,
  filename,
  data,
  format = "json",
}: {
  label: string;
  filename: string;
  data: unknown;
  format?: "json" | "csv";
}) {
  function download() {
    let body = "";
    let mime = "application/json";
    let ext = "json";
    if (format === "csv" && Array.isArray(data)) {
      mime = "text/csv";
      ext = "csv";
      const rows = data as Record<string, unknown>[];
      if (rows.length === 0) return;
      const keys = Object.keys(rows[0]);
      body = [
        keys.join(","),
        ...rows.map((r) =>
          keys
            .map((k) => {
              const v = r[k];
              const s = typeof v === "string" ? v : JSON.stringify(v ?? "");
              return `"${s.replaceAll('"', '""')}"`;
            })
            .join(","),
        ),
      ].join("\n");
    } else {
      body = JSON.stringify(data, null, 2);
    }
    const blob = new Blob([body], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex h-btn-sm items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-muted"
    >
      <IconDownload size={16} />
      {label}
    </button>
  );
}
