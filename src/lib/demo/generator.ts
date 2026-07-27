import type {
  IntentType,
  WorkspaceCompetitor,
  WorkspacePrompt,
} from "@/lib/workspace/types";

const SERVICES_BY_CATEGORY: Record<string, string[]> = {
  CPG: [
    "Brand tracking",
    "Retail media",
    "Product discovery",
    "Shopper insights",
    "Category leadership",
  ],
  "Financial Services": [
    "Digital banking",
    "Payments",
    "Lending",
    "Wealth management",
    "Fraud prevention",
  ],
  Retail: [
    "Ecommerce",
    "Omnichannel retail",
    "Loyalty programs",
    "In-store experience",
    "Marketplace selling",
  ],
  "Media & Entertainment": [
    "Streaming",
    "Content discovery",
    "Ad platforms",
    "Creator tools",
    "Live events",
  ],
  Technology: [
    "SaaS platforms",
    "Developer tools",
    "Cloud infrastructure",
    "Cybersecurity",
    "AI software",
  ],
  Hospitality: [
    "Hotels",
    "Travel booking",
    "Guest experience",
    "Property management",
    "Loyalty",
  ],
  "QSRs & Restaurants": [
    "Quick service",
    "Delivery apps",
    "Loyalty & rewards",
    "Kitchen ops",
    "Menu innovation",
  ],
  "Home Services": [
    "Home maintenance",
    "HVAC",
    "Cleaning",
    "Moving",
    "Home improvement",
  ],
  "Alcohol & Spirits": [
    "Spirits brands",
    "Craft beer",
    "Wine discovery",
    "DTCs",
    "On-premise",
  ],
  "Consumer Electronics": [
    "Smartphones",
    "Wearables",
    "Smart home",
    "Audio",
    "Computing hardware",
  ],
  Gaming: [
    "Console games",
    "PC gaming",
    "Mobile games",
    "Esports",
    "Game platforms",
  ],
  Fitness: [
    "Gyms",
    "Wearables",
    "Fitness apps",
    "Supplements",
    "At-home training",
  ],
  Insurance: [
    "Auto insurance",
    "Home insurance",
    "Health insurance",
    "Life insurance",
    "Insurtech",
  ],
  Sports: [
    "Teams & leagues",
    "Sports media",
    "Apparel",
    "Ticketing",
    "Fan engagement",
  ],
  "Betting & Prediction Markets": [
    "Sports betting",
    "Prediction markets",
    "Fantasy sports",
    "Odds & data",
    "Responsible gaming",
  ],
  "Beauty & Personal Care": [
    "Skincare",
    "Makeup",
    "Haircare",
    "Fragrance",
    "Clean beauty",
  ],
  Education: [
    "Edtech",
    "Online courses",
    "Tutoring",
    "Higher ed",
    "Corporate learning",
  ],
  BNPL: [
    "Buy now pay later",
    "Installment checkout",
    "Pay in 4",
    "Point-of-sale financing",
    "Merchant BNPL integrations",
  ],
  default: [
    "Core product",
    "Competitor benchmarking",
    "Category discovery",
    "Trust & compliance",
    "How-to education",
  ],
};

const COMPETITORS_BY_CATEGORY: Record<
  string,
  { name: string; domain: string }[]
> = {
  BNPL: [
    { name: "Klarna", domain: "klarna.com" },
    { name: "Afterpay", domain: "afterpay.com" },
    { name: "Sezzle", domain: "sezzle.com" },
    { name: "PayPal Pay in 4", domain: "paypal.com" },
    { name: "Zip", domain: "zip.co" },
    { name: "Affirm", domain: "affirm.com" },
  ],
  Neobank: [
    { name: "Mercury", domain: "mercury.com" },
    { name: "Relay", domain: "relayfi.com" },
    { name: "Brex", domain: "brex.com" },
    { name: "Ramp", domain: "ramp.com" },
    { name: "Novo", domain: "novo.co" },
  ],
  CRM: [
    { name: "Salesforce", domain: "salesforce.com" },
    { name: "HubSpot", domain: "hubspot.com" },
    { name: "Pipedrive", domain: "pipedrive.com" },
    { name: "Close", domain: "close.com" },
  ],
  default: [
    { name: "Competitor A", domain: "example-a.com" },
    { name: "Competitor B", domain: "example-b.com" },
    { name: "Competitor C", domain: "example-c.com" },
    { name: "Competitor D", domain: "example-d.com" },
  ],
};

type PromptSeed = { intentType: IntentType; templates: string[] };

function seedsForCategory(category: string, services: string[]): PromptSeed[] {
  const svc = services[0] ?? category.toLowerCase();
  const svc2 = services[1] ?? "tools";
  return [
    {
      intentType: "category_query",
      templates: [
        `best ${category.toLowerCase()} apps 2026?`,
        `what ${svc.toLowerCase()} should i use`,
        `top ${category.toLowerCase()} options in the us`,
        `${svc.toLowerCase()} recommendations?`,
        `who leads in ${svc2.toLowerCase()}`,
        `popular ${category.toLowerCase()} products right now`,
      ],
    },
    {
      intentType: "comparison",
      templates: [
        `{brand} vs {competitor} which is better`,
        `{competitor} or {brand} for online shopping`,
        `{brand} compared to {competitor}`,
        `is {brand} better than {competitor}`,
      ],
    },
    {
      intentType: "best_for",
      templates: [
        `best ${category.toLowerCase()} for small businesses`,
        `best ${svc.toLowerCase()} for fashion sites`,
        `best ${svc2.toLowerCase()} for first-time buyers`,
        `${category.toLowerCase()} for high ticket items`,
      ],
    },
    {
      intentType: "alternative",
      templates: [
        `alternatives to {competitor}`,
        `what's like {competitor} but cheaper`,
        `{competitor} alternatives us`,
        `options instead of {competitor}`,
      ],
    },
    {
      intentType: "trust",
      templates: [
        `is {brand} legit`,
        `does {brand} report to credit bureaus`,
        `{brand} customer reviews honest?`,
        `safe to use {brand}?`,
      ],
    },
    {
      intentType: "howto",
      templates: [
        `how does ${category.toLowerCase()} work`,
        `how to get approved for ${svc.toLowerCase()}`,
        `how to compare ${category.toLowerCase()} fees`,
        `${svc.toLowerCase()} setup guide`,
      ],
    },
  ];
}

/** Intent mix: 30/20/20/10/10/10 across ~N prompts */
const MIX: { intentType: IntentType; weight: number }[] = [
  { intentType: "category_query", weight: 0.3 },
  { intentType: "comparison", weight: 0.2 },
  { intentType: "best_for", weight: 0.2 },
  { intentType: "alternative", weight: 0.1 },
  { intentType: "trust", weight: 0.1 },
  { intentType: "howto", weight: 0.1 },
];

const UNAIDED: IntentType[] = ["category_query", "best_for", "howto"];

export function suggestedServices(category: string): string[] {
  return [
    ...(SERVICES_BY_CATEGORY[category] ?? SERVICES_BY_CATEGORY.default),
  ];
}

export function suggestedCompetitors(
  category: string,
  trackedBrand?: string,
): WorkspaceCompetitor[] {
  const list =
    COMPETITORS_BY_CATEGORY[category] ?? COMPETITORS_BY_CATEGORY.default;
  return list
    .filter(
      (c) =>
        !trackedBrand ||
        c.name.toLowerCase() !== trackedBrand.toLowerCase(),
    )
    .map((c, i) => ({
      id: `comp-${i}-${c.domain}`,
      name: c.name,
      domain: c.domain,
      selected: i < 3,
    }));
}

export function generatePromptCorpus(opts: {
  brandName: string;
  category: string;
  services: string[];
  competitors: { name: string }[];
  count?: number;
}): WorkspacePrompt[] {
  const count = opts.count ?? 30;
  const seeds = seedsForCategory(opts.category, opts.services);
  const competitorNames =
    opts.competitors.length > 0
      ? opts.competitors.map((c) => c.name)
      : ["Klarna", "Afterpay"];

  const prompts: WorkspacePrompt[] = [];
  let n = 0;

  for (const { intentType, weight } of MIX) {
    const target = Math.max(1, Math.round(count * weight));
    const pool = seeds.find((s) => s.intentType === intentType)?.templates ?? [];
    for (let i = 0; i < target && prompts.length < count; i++) {
      const tmpl = pool[i % pool.length];
      const competitor = competitorNames[i % competitorNames.length];
      let text = tmpl
        .replaceAll("{brand}", opts.brandName)
        .replaceAll("{competitor}", competitor);
      if (UNAIDED.includes(intentType)) {
        // Guard: strip tracked brand name if it slipped in
        const re = new RegExp(opts.brandName, "ig");
        text = text.replace(re, opts.category.toLowerCase());
      }
      if (i >= pool.length) text = `${text} (${Math.floor(i / pool.length) + 1})`;
      prompts.push({
        id: `gen-${String(++n).padStart(3, "0")}`,
        text,
        intentType,
        selected: true,
      });
    }
  }

  return prompts;
}
