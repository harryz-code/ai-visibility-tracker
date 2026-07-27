# AI Visibility Tracker (AVT)

Measure how brands appear in AI assistant answers (ChatGPT, Claude, Gemini, Perplexity) — with multi-sample measurement, confidence intervals, and versioned extraction.

> Draft README — architecture and methodology charts land in a later commit.

## Stack

- Next.js 15 (App Router) + TypeScript
- Postgres via Supabase + Drizzle ORM
- Inngest (waves, judging, rollups)
- Recharts (CI charts)

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Status

Scaffold only. Schema, runner, judge, dashboard, and free report ship in subsequent commits.
