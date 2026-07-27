import { cn } from "@/lib/utils";

const MODEL_META: Record<
  string,
  { letter: string; bg: string; label: string }
> = {
  openai: { letter: "O", bg: "bg-chart-openai", label: "OpenAI" },
  anthropic: { letter: "C", bg: "bg-chart-anthropic", label: "Claude" },
  claude: { letter: "C", bg: "bg-chart-anthropic", label: "Claude" },
  gemini: { letter: "G", bg: "bg-chart-gemini", label: "Gemini" },
  perplexity: { letter: "P", bg: "bg-chart-perplexity", label: "Perplexity" },
};

type Props = {
  model: string;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
};

export function ModelBadge({
  model,
  size = "sm",
  showLabel = false,
  className,
}: Props) {
  const key = model.toLowerCase();
  const meta = MODEL_META[key] ?? {
    letter: model.charAt(0).toUpperCase(),
    bg: "bg-ink-muted",
    label: model,
  };
  const dim = size === "md" ? "h-7 w-7 text-[13px]" : "h-5 w-5 text-[10px]";

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-display font-semibold text-white",
          dim,
          meta.bg,
        )}
        title={meta.label}
      >
        {meta.letter}
      </span>
      {showLabel && (
        <span className="text-sm capitalize text-ink">{meta.label}</span>
      )}
    </span>
  );
}
