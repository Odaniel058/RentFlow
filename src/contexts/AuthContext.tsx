import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured, missingSupabaseEnvMessage } from "@/lib/supabase";
import { CompanySettings, TenantSeedMode } from "@/data/mock-data";

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  tenantId: string;
  seedMode: TenantSeedMode;
}

export interface TenantWorkspace {
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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  getTenantWorkspace: (tenantId: string) => TenantWorkspace | undefined;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "tenant";

const loadUserFromSession = async (authId: string, email: string): Promise<User | null> => {
  if (!supabase) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("name, company, tenant_id")
    .eq("id", authId)
    .single();

  if (error || !profile) return null;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("seed_mode")
    .eq("id", profile.tenant_id)
    .single();

  return {
    id: authId,
    email,
    name: profile.name,
    company: profile.company,
    tenantId: profile.tenant_id,
    seedMode: (tenant?.seed_mode as TenantSeedMode) ?? "empty",
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workspace, setWorkspace] = useState<TenantWorkspace | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const loaded = await loadUserFromSession(session.user.id, session.user.email ?? "");
        setUser(loaded);
        if (loaded) {
          setWorkspace({
            id: loaded.tenantId,
            company: loaded.company,
            seedMode: loaded.seedMode,
            createdAt: "",
          });
        }
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setWorkspace(null);
      } else if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        const loaded = await loadUserFromSession(session.user.id, session.user.email ?? "");
        setUser(loaded);
        if (loaded) {
          setWorkspace({
            id: loaded.tenantId,
            company: loaded.company,
            seedMode: loaded.seedMode,
            createdAt: "",
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) throw new Error(missingSupabaseEnvMessage);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Email ou senha invalidos.");

    const authUser = data.user;
    if (!authUser) {
      throw new Error("Nao foi possivel carregar a sessao da conta.");
    }

    const loaded = await loadUserFromSession(authUser.id, authUser.email ?? email);
    if (!loaded) {
      await supabase.auth.signOut();
      throw new Error("Conta encontrada, mas o perfil da locadora nao foi configurado no banco.");
    }
  };

  const signup = async ({ name, company, email, password, seedMode = "empty", settings }: SignupPayload) => {
    if (!isSupabaseConfigured || !supabase) throw new Error(missingSupabaseEnvMessage);
    if (password.length < 8) throw new Error("A senha precisa ter pelo menos 8 caracteres.");

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        throw new Error("Ja existe uma conta com esse email.");
      }
      throw new Error(error.message);
    }

    const authUser = data.user;
    if (!authUser) throw new Error("Falha ao criar conta.");

    const tenantId = `TENANT-${slugify(company)}-${Date.now().toString(36)}`;

    const { error: tenantError } = await supabase.from("tenants").insert({
      id: tenantId,
      company,
      seed_mode: seedMode,
    });
    if (tenantError) throw new Error("Falha ao criar workspace: " + tenantError.message);

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authUser.id,
      name,
      company,
      tenant_id: tenantId,
    });
    if (profileError) throw new Error("Falha ao criar perfil: " + profileError.message);

    await supabase.from("company_settings").insert({
      tenant_id: tenantId,
      company_name: settings?.companyName ?? company,
      logo_url: settings?.logoUrl ?? "",
      cnpj: settings?.cnpj ?? "",
      phone: settings?.phone ?? "",
      email: settings?.email ?? "",
      address: settings?.address ?? "",
      contact_name: settings?.contactName ?? name,
      theme_preference: settings?.themePreference ?? "dark",
      equipment_categories: JSON.stringify(
        settings?.equipmentCategories?.filter(Boolean) ?? [
          "Cameras",
          "Lentes",
          "Iluminacao",
          "Audio",
          "Acessorios",
          "Suportes",
          "Monitores",
          "Baterias",
        ],
      ),
    });

    setWorkspace({ id: tenantId, company, seedMode, createdAt: new Date().toISOString() });
  };

  const logout = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.auth.signOut();
  };

  const requestPasswordReset = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) throw new Error(missingSupabaseEnvMessage);

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error("Nenhuma conta encontrada para esse email.");
  };

  const getTenantWorkspace = (tenantId: string): TenantWorkspace | undefined => {
    if (workspace?.id === tenantId) return workspace;
    return undefined;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        requestPasswordReset,
        getTenantWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
