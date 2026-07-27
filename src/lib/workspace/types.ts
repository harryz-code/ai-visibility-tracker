export type IntentType =
  | "category_query"
  | "comparison"
  | "best_for"
  | "alternative"
  | "trust"
  | "howto";

export type CompanyRole =
  | "agency"
  | "consultant"
  | "in_house"
  | "other";

export type CompanySize = "1-10" | "11-50" | "50-200" | "200+";

export type ModelProvider = "openai" | "anthropic" | "gemini" | "perplexity";

export type WorkspaceCompetitor = {
  id: string;
  name: string;
  domain: string;
  selected: boolean;
};

export type WorkspacePrompt = {
  id: string;
  text: string;
  intentType: IntentType;
  selected: boolean;
};

export type WorkspaceState = {
  version: 1;
  completedOnboarding: boolean;
  brand: {
    url: string;
    name: string;
    market: string;
    language: string;
    /** Selected industry from INDUSTRIES, or "Other" */
    category: string;
    /** Free-text when category === "Other" */
    categoryOther: string;
  };
  company: {
    role: CompanyRole | null;
    size: CompanySize | null;
    foundUs: string;
  };
  services: string[];
  competitors: WorkspaceCompetitor[];
  prompts: WorkspacePrompt[];
  models: ModelProvider[];
  cadence: "weekly" | "daily";
  plan: "free" | "solo" | "team";
  updatedAt: string;
};

export const WORKSPACE_KEY = "avt.workspace";

/** Industry list for onboarding / reports (+ Other with free text). */
export const INDUSTRIES = [
  "CPG",
  "Financial Services",
  "Retail",
  "Media & Entertainment",
  "Technology",
  "Hospitality",
  "QSRs & Restaurants",
  "Home Services",
  "Alcohol & Spirits",
  "Consumer Electronics",
  "Gaming",
  "Fitness",
  "Insurance",
  "Sports",
  "Betting & Prediction Markets",
  "Beauty & Personal Care",
  "Education",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const OTHER_CATEGORY = "Other";

/** @deprecated use INDUSTRIES — kept as alias for imports */
export const DEFAULT_CATEGORIES = [...INDUSTRIES, OTHER_CATEGORY] as const;

export function resolveCategoryLabel(brand: {
  category: string;
  categoryOther?: string;
}): string {
  if (brand.category === OTHER_CATEGORY) {
    return brand.categoryOther?.trim() || OTHER_CATEGORY;
  }
  return brand.category;
}

export function emptyWorkspace(): WorkspaceState {
  return {
    version: 1,
    completedOnboarding: false,
    brand: {
      url: "",
      name: "",
      market: "United States",
      language: "English",
      category: "Financial Services",
      categoryOther: "",
    },
    company: {
      role: null,
      size: null,
      foundUs: "",
    },
    services: [],
    competitors: [],
    prompts: [],
    models: ["openai", "anthropic", "gemini", "perplexity"],
    cadence: "weekly",
    plan: "solo",
    updatedAt: new Date().toISOString(),
  };
}
