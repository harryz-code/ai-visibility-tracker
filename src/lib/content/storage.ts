"use client";

export const CONTENT_PROJECTS_KEY = "avt.content.projects";
export const CONTENT_FAVORITES_KEY = "avt.content.favorites";

export type ContentStatus = "Draft" | "Completed" | "Generating";

export type ContentTemplateId =
  | "smart"
  | "blog"
  | "listicle"
  | "guide"
  | "howto"
  | "comparison";

export type ContentTemplate = {
  id: ContentTemplateId;
  name: string;
  description: string;
  intents: ("Informational" | "Comparative" | "Social" | "Transactional")[];
};

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: "smart",
    name: "Smart Suggestion",
    description: "AVT picks the highest-leverage format from your gaps.",
    intents: ["Informational", "Comparative"],
  },
  {
    id: "blog",
    name: "Blog Post",
    description: "Long-form article optimized for answer citations.",
    intents: ["Informational"],
  },
  {
    id: "listicle",
    name: "Listicle",
    description: "Numbered roundup for comparison and best-of prompts.",
    intents: ["Informational", "Comparative"],
  },
  {
    id: "guide",
    name: "Ultimate Guide",
    description: "Comprehensive pillar page for category queries.",
    intents: ["Informational"],
  },
  {
    id: "howto",
    name: "How-To",
    description: "Step-by-step workflow content for operator prompts.",
    intents: ["Informational", "Transactional"],
  },
  {
    id: "comparison",
    name: "Comparison",
    description: "Side-by-side brand vs alternatives.",
    intents: ["Comparative", "Transactional"],
  },
];

export const WORKFLOW_STEPS = [
  "Starting",
  "Gather citations",
  "Research",
  "Outline",
  "Brief",
  "Metadata",
  "Draft",
  "Review",
  "Done",
] as const;

export type ContentProject = {
  id: string;
  title: string;
  templateId: ContentTemplateId;
  status: ContentStatus;
  updatedAt: string;
  topic: string;
  prompts: string[];
  platforms: string[];
  topCitedPages: string[];
  brandKit: string;
  audience: string;
  instructions: string;
  brief: string;
  draft: string;
  workflowStep: number;
};

export type ContentConfig = {
  topic: string;
  prompts: string[];
  platforms: string[];
  topCitedPages: string[];
  brandKit: string;
  audience: string;
  instructions: string;
  templateId: ContentTemplateId;
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadContentProjects(): ContentProject[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(CONTENT_PROJECTS_KEY), []);
}

export function saveContentProjects(projects: ContentProject[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONTENT_PROJECTS_KEY, JSON.stringify(projects));
}

export function loadFavorites(): ContentTemplateId[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(CONTENT_FAVORITES_KEY), []);
}

export function saveFavorites(ids: ContentTemplateId[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONTENT_FAVORITES_KEY, JSON.stringify(ids));
}

export function seedFixtureProjects(brand: string, topic: string): ContentProject[] {
  const now = new Date().toISOString();
  return [
    {
      id: "seed-1",
      title: `${brand} category visibility brief`,
      templateId: "guide",
      status: "Completed",
      updatedAt: now,
      topic,
      prompts: [`Best ${topic} options`, `${brand} vs alternatives`],
      platforms: ["openai", "perplexity"],
      topCitedPages: [],
      brandKit: "",
      audience: "Category buyers",
      instructions: "",
      brief: `Strategic overview for ${brand} on ${topic}.`,
      draft: `Draft article covering how ${brand} shows up in AI answers for ${topic}.`,
      workflowStep: 8,
    },
    {
      id: "seed-2",
      title: `How to evaluate ${topic}`,
      templateId: "howto",
      status: "Draft",
      updatedAt: now,
      topic,
      prompts: [`How does ${brand} work`],
      platforms: ["openai", "anthropic"],
      topCitedPages: [],
      brandKit: "",
      audience: "Operators",
      instructions: "",
      brief: "",
      draft: "",
      workflowStep: 3,
    },
  ];
}

export function buildBriefText(cfg: ContentConfig, brand: string): string {
  return [
    `# Content Brief — ${cfg.topic}`,
    "",
    `Brand: ${brand}`,
    `Template: ${CONTENT_TEMPLATES.find((t) => t.id === cfg.templateId)?.name ?? cfg.templateId}`,
    "",
    "## Strategic overview",
    `Produce content that improves AI answer visibility for ${brand} around “${cfg.topic}”.`,
    "",
    "## Target prompts",
    ...cfg.prompts.map((p) => `- ${p}`),
    "",
    "## Platforms",
    ...cfg.platforms.map((p) => `- ${p}`),
    "",
    "## Top-cited pages to reference",
    ...(cfg.topCitedPages.length
      ? cfg.topCitedPages.map((u) => `- ${u}`)
      : ["- (none selected)"]),
    "",
    "## Audience",
    cfg.audience || "General category researchers",
    "",
    "## Brand kit notes",
    cfg.brandKit || "Use workspace brand voice.",
    "",
    "## Additional instructions",
    cfg.instructions || "None",
  ].join("\n");
}
