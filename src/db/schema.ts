import {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";

/**
 * RLS intent (enforced in Supabase SQL policies, not Drizzle):
 * - workspace_members only see their workspace's brands/metrics
 * - completions readable by service role only (immutable raw asset)
 */

export const intentTypeEnum = pgEnum("intent_type", [
  "category_query",
  "comparison",
  "best_for",
  "alternative",
  "trust",
  "howto",
]);

export const runStatusEnum = pgEnum("run_status", [
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "running",
  "ready",
  "failed",
]);

export const planEnum = pgEnum("plan", ["free", "solo", "team"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
]);

export const modelEnum = pgEnum("model", [
  "openai",
  "anthropic",
  "gemini",
  "perplexity",
]);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  market: text("market").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  aliases: text("aliases").array().notNull().default([]),
  domain: text("domain"),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const prompts = pgTable("prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  text: text("text").notNull(),
  intentType: intentTypeEnum("intent_type").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const runs = pgTable("runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  status: runStatusEnum("status").notNull().default("pending"),
  sampleN: integer("sample_n").notNull().default(8),
  totalCostUsd: doublePrecision("total_cost_usd").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** IMMUTABLE append-only store of raw model completions. Never mutate or delete. */
export const completions = pgTable(
  "completions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .notNull()
      .references(() => runs.id),
    promptId: uuid("prompt_id")
      .notNull()
      .references(() => prompts.id),
    model: modelEnum("model").notNull(),
    sampleN: integer("sample_n").notNull(),
    rawText: text("raw_text").notNull(),
    citedUrls: jsonb("cited_urls").$type<string[]>().notNull().default([]),
    latencyMs: integer("latency_ms"),
    costUsd: doublePrecision("cost_usd").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("completions_run_prompt_model_sample_uidx").on(
      t.runId,
      t.promptId,
      t.model,
      t.sampleN,
    ),
  ],
);

export type MentionExtraction = {
  brand: string;
  matched_alias: string;
  position: number;
  sentiment: -1 | 0 | 1;
  rec_strength: 0 | 1 | 2 | 3;
  quote: string;
};

export const extractions = pgTable("extractions", {
  id: uuid("id").defaultRandom().primaryKey(),
  completionId: uuid("completion_id")
    .notNull()
    .references(() => completions.id),
  judgeVersion: text("judge_version").notNull(),
  mentions: jsonb("mentions").$type<MentionExtraction[]>().notNull().default([]),
  citedUrls: jsonb("cited_urls").$type<string[]>().notNull().default([]),
  refused: boolean("refused").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const metricsDaily = pgTable(
  "metrics_daily",
  {
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    model: modelEnum("model").notNull(),
    date: date("date").notNull(),
    mentionRate: doublePrecision("mention_rate").notNull(),
    mentionRateCiLow: doublePrecision("mention_rate_ci_low").notNull(),
    mentionRateCiHigh: doublePrecision("mention_rate_ci_high").notNull(),
    avgPosition: doublePrecision("avg_position"),
    shareOfVoice: doublePrecision("share_of_voice").notNull(),
    citationShare: jsonb("citation_share")
      .$type<Record<string, number>>()
      .notNull()
      .default({}),
    sampleCount: integer("sample_count").notNull().default(0),
  },
  (t) => [
    primaryKey({
      columns: [t.brandId, t.categoryId, t.model, t.date],
    }),
  ],
);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(),
  plan: planEnum("plan").notNull().default("free"),
  trackedBrandId: uuid("tracked_brand_id").references(() => brands.id),
  competitorIds: uuid("competitor_ids").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    userId: text("user_id").notNull(),
    role: text("role").notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.workspaceId, t.userId] })],
);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: subscriptionStatusEnum("status").notNull().default("trialing"),
  plan: planEnum("plan").notNull().default("solo"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Free / paid report snapshots for shareable URLs */
export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  brandName: text("brand_name").notNull(),
  categoryName: text("category_name").notNull(),
  email: text("email"),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  status: reportStatusEnum("status").notNull().default("ready"),
  runId: uuid("run_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Per-email daily cap for free report generation. */
export const reportRateLimits = pgTable(
  "report_rate_limits",
  {
    email: text("email").notNull(),
    day: date("day").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.email, t.day] })],
);

/** Significance-gated alerts surfaced in the dashboard. */
export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brands.id),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  significant: boolean("significant").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
