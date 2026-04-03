import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/contexts/AppDataContext";
import { AppSidebar } from "./AppSidebar";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { CommandPalette } from "./CommandPalette";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inventory": "Inventario",
  "/reservations": "Reservas",
  "/quotes": "Propostas",
  "/calendar": "Agenda",
  "/clients": "Clientes",
  "/kits": "Kits",
  "/contracts": "Contratos",
  "/finance": "Financeiro",
  "/reports": "Relatorios",
  "/settings": "Configuracoes",
};

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const { isBootstrapping } = useAppData();
  const location = useLocation();

  const pageTitle =
    PAGE_TITLES[location.pathname] ??
    Object.entries(PAGE_TITLES).find(([key]) => location.pathname.startsWith(key))?.[1] ??
    "RentFlow";

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="grid gap-6">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl md:col-span-2" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background overflow-x-hidden">
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((current) => !current)}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen((current) => !current)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-md sm:px-5 lg:px-8">
          <p className="truncate pl-10 text-sm font-semibold text-muted-foreground md:pl-0">{pageTitle}</p>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Buscar...</span>
              <kbd className="ml-1 border border-border/60 rounded px-1 py-0.5 font-mono text-[10px] bg-muted/50">Ctrl K</kbd>
            </button>
            <NotificationsDropdown />
            <div className="hidden md:flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/80 px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full gradient-gold text-[10px] font-bold text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <span className="text-xs font-medium">{user?.name}</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1600px] p-4 sm:p-5 md:pt-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
};
