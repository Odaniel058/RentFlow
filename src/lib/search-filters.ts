export interface SavedFilter {
  id: string;
  name: string;
  category?: string;
  brand?: string;
  status?: string;
  minRate?: number;
  maxRate?: number;
  searchText?: string;
  createdAt: number;
}

const STORAGE_KEY = "rentflow_saved_filters";

export const getStorageKey = (tenantId: string) => `${STORAGE_KEY}_${tenantId}`;

export function getSavedFilters(tenantId: string): SavedFilter[] {
  try {
    const stored = localStorage.getItem(getStorageKey(tenantId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveFilter(tenantId: string, filter: SavedFilter): void {
  const filters = getSavedFilters(tenantId);
  const existing = filters.findIndex((f) => f.id === filter.id);

  if (existing >= 0) {
    filters[existing] = filter;
  } else {
    filters.push(filter);
  }

  localStorage.setItem(getStorageKey(tenantId), JSON.stringify(filters));
}

export function deleteFilter(tenantId: string, filterId: string): void {
  const filters = getSavedFilters(tenantId);
  const updated = filters.filter((f) => f.id !== filterId);
  localStorage.setItem(getStorageKey(tenantId), JSON.stringify(updated));
}

export function generateFilterId(): string {
  return `filter_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
