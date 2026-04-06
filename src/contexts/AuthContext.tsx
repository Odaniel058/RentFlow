import React, { createContext, useContext, useMemo, useState } from "react";
import { CompanySettings, createInitialTenantData, TenantSeedMode } from "@/data/mock-data";

interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  tenantId: string;
}

interface RegisteredUser extends User {
  password: string;
}

interface TenantWorkspace {
  id: string;
  company: string;
  seedMode: TenantSeedMode;
  createdAt: string;
}

interface SignupPayload {
  name: string;
  company: string;
  email: string;
  password: string;
  seedMode?: TenantSeedMode;
  settings?: Partial<CompanySettings>;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  getTenantWorkspace: (tenantId: string) => TenantWorkspace | undefined;
}

const SESSION_KEY = "rentflow_session_v2";
const USERS_KEY = "rentflow_registered_users_v2";
const TENANTS_KEY = "rentflow_tenants_v2";
const LEGACY_SESSION_KEY = "cinegear_session_v2";
const LEGACY_USERS_KEY = "cinegear_registered_users_v2";
const LEGACY_TENANTS_KEY = "cinegear_tenants_v2";
const TENANT_STORE_KEY = "rentflow_tenant_store_v2";
const LEGACY_TENANT_STORE_KEY = "cinegear_tenant_store_v2";

const defaultTenant: TenantWorkspace = {
  id: "TENANT-DEMO",
  company: "RentFlow Rentals",
  seedMode: "demo",
  createdAt: "2026-03-16T09:00:00.000Z",
};

const defaultUsers: RegisteredUser[] = [
  {
    id: "USR-001",
    email: "admin@rentflow.app",
    password: "rentflow123",
    name: "Administrador",
    company: defaultTenant.company,
    tenantId: defaultTenant.id,
  },
];

const AuthContext = createContext<AuthContextType | null>(null);

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const getStoredTenants = () => {
  const stored = localStorage.getItem(TENANTS_KEY);
  if (stored) {
    return safeParse<TenantWorkspace[]>(stored, [defaultTenant]);
  }

  const legacy = localStorage.getItem(LEGACY_TENANTS_KEY);
  if (legacy) {
    localStorage.setItem(TENANTS_KEY, legacy);
    localStorage.removeItem(LEGACY_TENANTS_KEY);
    return safeParse<TenantWorkspace[]>(legacy, [defaultTenant]);
  }

  localStorage.setItem(TENANTS_KEY, JSON.stringify([defaultTenant]));
  return [defaultTenant];
};

const getStoredUsers = () => {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) {
    return safeParse<RegisteredUser[]>(stored, defaultUsers);
  }

  const legacy = localStorage.getItem(LEGACY_USERS_KEY);
  if (legacy) {
    localStorage.setItem(USERS_KEY, legacy);
    localStorage.removeItem(LEGACY_USERS_KEY);
    return safeParse<RegisteredUser[]>(legacy, defaultUsers);
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
};

const sanitizeUser = (user: RegisteredUser): User => ({
  id: user.id,
  email: user.email,
  name: user.name,
  company: user.company,
  tenantId: user.tenantId,
});

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "tenant";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(SESSION_KEY) ?? localStorage.getItem(LEGACY_SESSION_KEY);
    if (stored && !localStorage.getItem(SESSION_KEY)) {
      localStorage.setItem(SESSION_KEY, stored);
      localStorage.removeItem(LEGACY_SESSION_KEY);
    }
    return safeParse<User | null>(stored, null);
  });

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      login: async (email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const users = getStoredUsers();
        const existing = users.find((item) => item.email.toLowerCase() === email.toLowerCase());

        if (!existing || existing.password !== password) {
          throw new Error("Email ou senha inválidos.");
        }

        const nextUser = sanitizeUser(existing);
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      signup: async ({ name, company, email, password, seedMode = "empty", settings }) => {
        await new Promise((resolve) => setTimeout(resolve, 900));

        if (password.length < 8) {
          throw new Error("A senha precisa ter pelo menos 8 caracteres.");
        }

        const users = getStoredUsers();
        if (users.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("Já existe uma conta com esse email.");
        }

        const tenants = getStoredTenants();
        const tenantId = `TENANT-${slugify(company)}-${Date.now().toString(36)}`;
        const nextTenant: TenantWorkspace = {
          id: tenantId,
          company,
          seedMode,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(TENANTS_KEY, JSON.stringify([nextTenant, ...tenants]));

        const nextRegisteredUser: RegisteredUser = {
          id: `USR-${String(users.length + 1).padStart(3, "0")}`,
          email,
          password,
          name,
          company,
          tenantId,
        };

        const updatedUsers = [...users, nextRegisteredUser];
        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

        const nextTenantStoreRaw =
          localStorage.getItem(TENANT_STORE_KEY) ??
          localStorage.getItem(LEGACY_TENANT_STORE_KEY) ??
          "{}";
        const nextTenantStore = safeParse<Record<string, ReturnType<typeof createInitialTenantData>>>(nextTenantStoreRaw, {});
        const nextTenantData = createInitialTenantData(seedMode, company);
        nextTenantData.settings = {
          ...nextTenantData.settings,
          companyName: company,
          contactName: name,
          ...settings,
          equipmentCategories:
            settings?.equipmentCategories?.filter(Boolean) ??
            nextTenantData.settings.equipmentCategories,
        };
        localStorage.setItem(
          TENANT_STORE_KEY,
          JSON.stringify({
            ...nextTenantStore,
            [tenantId]: nextTenantData,
          }),
        );
        localStorage.removeItem(LEGACY_TENANT_STORE_KEY);

        const nextUser = sanitizeUser(nextRegisteredUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
      requestPasswordReset: async (email) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const users = getStoredUsers();
        const existing = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
        if (!existing) {
          throw new Error("Nenhuma conta encontrada para esse email.");
        }
      },
      getTenantWorkspace: (tenantId) => getStoredTenants().find((tenant) => tenant.id === tenantId),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

