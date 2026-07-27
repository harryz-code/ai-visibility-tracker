"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "./config";

export { isSupabaseConfigured };

/** Browser client for client components. Returns null when Supabase env vars are unset (fixture mode). */
export function createClient() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
