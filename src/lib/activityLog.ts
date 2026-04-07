import { supabase } from "@/lib/supabase";

export type ActivityAction = "created" | "updated" | "deleted" | "converted" | "signed";
export type ActivityEntity = "reservation" | "quote" | "contract" | "equipment" | "client";

export interface ActivityEntry {
  id: string;
  timestamp: string;
  userName: string;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId: string;
  description: string;
}

export const logActivity = (
  tenantId: string,
  userName: string,
  action: ActivityAction,
  entity: ActivityEntity,
  entityId: string,
  description: string,
): void => {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tenant_id: tenantId,
    timestamp: new Date().toISOString(),
    user_name: userName,
    action,
    entity,
    entity_id: entityId,
    description,
  };

  // Fire and forget
  supabase.from("activity_log").insert(entry).then(() => {
    window.dispatchEvent(new CustomEvent("rentflow:activity"));
  });
};

export const getActivityLog = async (tenantId: string): Promise<ActivityEntry[]> => {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("timestamp", { ascending: false })
    .limit(100);

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    timestamp: r.timestamp,
    userName: r.user_name,
    action: r.action as ActivityAction,
    entity: r.entity as ActivityEntity,
    entityId: r.entity_id,
    description: r.description,
  }));
};
