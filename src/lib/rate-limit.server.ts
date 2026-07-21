import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Sliding-window rate limiter backed by the `rate_limits` table.
 * Returns true when the request is allowed, false when over quota.
 */
export async function checkRateLimit(
  bucket: string,
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc("rate_limit_check", {
      _bucket: bucket,
      _key: key,
      _max: max,
      _window_seconds: windowSeconds,
    });
    if (error) {
      console.warn("[rate-limit] rpc error, allowing:", error.message);
      return true;
    }
    return data === true;
  } catch (e) {
    console.warn("[rate-limit] unexpected error, allowing:", e);
    return true;
  }
}

export function getClientIp(request: Request): string {
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

export async function isDuplicateFeedback(
  projectId: string,
  message: string,
  windowSeconds = 60,
): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin.rpc("feedback_is_duplicate", {
      _project_id: projectId,
      _message: message,
      _window_seconds: windowSeconds,
    });
    return data === true;
  } catch {
    return false;
  }
}
