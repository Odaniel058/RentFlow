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

const activityKey = (tenantId: string) => `rentflow_activity_${tenantId}`;
const MAX_ENTRIES = 100;

export const logActivity = (
  tenantId: string,
  userName: string,
  action: ActivityAction,
  entity: ActivityEntity,
  entityId: string,
  description: string,
): void => {
  const entry: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    userName,
    action,
    entity,
    entityId,
    description,
  };
  const existing = getActivityLog(tenantId);
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(activityKey(tenantId), JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("rentflow:activity"));
};

export const getActivityLog = (tenantId: string): ActivityEntry[] => {
  try {
    const stored = localStorage.getItem(activityKey(tenantId));
    return stored ? (JSON.parse(stored) as ActivityEntry[]) : [];
  } catch {
    return [];
  }
};
