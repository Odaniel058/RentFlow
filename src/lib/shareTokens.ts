import { supabase, isSupabaseConfigured, missingSupabaseEnvMessage } from "@/lib/supabase";

interface ShareEntry {
  tenantId: string;
  quoteId: string;
  createdAt: string;
}

export const createShareToken = async (tenantId: string, quoteId: string): Promise<string> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(missingSupabaseEnvMessage);
  }

  const { data: existing } = await supabase
    .from("share_tokens")
    .select("token")
    .eq("tenant_id", tenantId)
    .eq("quote_id", quoteId)
    .single();

  if (existing?.token) return existing.token;

  const token = [
    Math.random().toString(36).slice(2, 6),
    Math.random().toString(36).slice(2, 6),
    Math.random().toString(36).slice(2, 6),
  ].join("-");

  await supabase.from("share_tokens").insert({ token, tenant_id: tenantId, quote_id: quoteId });
  return token;
};

export const getShareEntry = async (token: string): Promise<ShareEntry | null> => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn(missingSupabaseEnvMessage);
    return null;
  }

  const { data } = await supabase
    .from("share_tokens")
    .select("tenant_id, quote_id, created_at")
    .eq("token", token)
    .single();

  if (!data) return null;
  return { tenantId: data.tenant_id, quoteId: data.quote_id, createdAt: data.created_at };
};
