// Per-user daily cap on Anthropic calls (see supabase/migration_scale.sql).
import { todayStr } from "@/lib/constants";
import { zonedNow } from "@/lib/serverDate";

export const AI_DAILY_LIMIT = { encourage: 3, reward_comment: 10 };

// true = go ahead (one use is recorded); false = over today's limit.
// If the SQL function isn't installed yet, allow the call rather than break the app.
export async function takeAiQuota(supabase, kind) {
  const { data, error } = await supabase.rpc("use_ai_quota", {
    p_kind: kind,
    p_day: todayStr(zonedNow()),
    p_limit: AI_DAILY_LIMIT[kind],
  });
  if (error) {
    console.warn("[ai-quota] check skipped:", error.message);
    return true;
  }
  return data === true;
}
