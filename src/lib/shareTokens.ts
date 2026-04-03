const SHARE_KEY = "rentflow_share_tokens";

interface ShareEntry {
  tenantId: string;
  quoteId: string;
  createdAt: string;
}

type ShareStore = Record<string, ShareEntry>;

const readStore = (): ShareStore => {
  try {
    const s = localStorage.getItem(SHARE_KEY);
    return s ? (JSON.parse(s) as ShareStore) : {};
  } catch {
    return {};
  }
};

export const createShareToken = (tenantId: string, quoteId: string): string => {
  // Reuse existing token for the same quote if one exists
  const store = readStore();
  const existing = Object.entries(store).find(([, v]) => v.tenantId === tenantId && v.quoteId === quoteId);
  if (existing) return existing[0];

  const token = [
    Math.random().toString(36).slice(2, 6),
    Math.random().toString(36).slice(2, 6),
    Math.random().toString(36).slice(2, 6),
  ].join("-");

  store[token] = { tenantId, quoteId, createdAt: new Date().toISOString() };
  localStorage.setItem(SHARE_KEY, JSON.stringify(store));
  return token;
};

export const getShareEntry = (token: string): ShareEntry | null => {
  return readStore()[token] ?? null;
};
