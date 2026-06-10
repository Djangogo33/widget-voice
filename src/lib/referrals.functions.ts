import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const applyReferralCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ code: z.string().trim().min(1).max(32) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: applied, error } = await supabaseAdmin.rpc("apply_referral", {
      _new_user_id: context.userId,
      _code: data.code.toUpperCase(),
    });
    if (error) throw new Error(error.message);
    return { applied: !!applied };
  });

export const validatePromoCode = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ code: z.string().trim().min(1).max(32) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = data.code.toUpperCase();
    const { data: row } = await supabaseAdmin
      .from("promo_codes")
      .select("code, discount_percent, max_uses, used_count, expires_at")
      .eq("code", code)
      .maybeSingle();

    if (!row) return { valid: false as const, reason: "Code not found" };
    if (row.expires_at && new Date(row.expires_at) < new Date())
      return { valid: false as const, reason: "Code expired" };
    if (row.max_uses != null && row.used_count >= row.max_uses)
      return { valid: false as const, reason: "Code fully redeemed" };

    return {
      valid: true as const,
      code: row.code,
      discount_percent: row.discount_percent,
    };
  });
