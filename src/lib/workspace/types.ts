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
    category: string;
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

export const DEFAULT_CATEGORIES = [
  "BNPL",
  "Neobank",
  "CRM",
  "HRIS",
  "Payroll",
  "Accounting",
  "E-commerce platform",
  "Email marketing",
  "CDN",
  "Observability",
  "Feature flags",
  "Auth",
  "Payments",
  "Lending",
  "Insurance",
  "Travel booking",
  "Food delivery",
  "Ride hail",
  "Project management",
  "Design tools",
] as const;

export function emptyWorkspace(): WorkspaceState {
  return {
    version: 1,
    completedOnboarding: false,
    brand: {
      url: "",
      name: "",
      market: "United States",
      language: "English",
      category: "BNPL",
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
