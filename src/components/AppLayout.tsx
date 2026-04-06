import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/contexts/AppDataContext";
import { AppSidebar } from "./AppSidebar";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { CommandPalette } from "./CommandPalette";
import { Breadcrumb } from "./Breadcrumb";
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
  const { isBootstrapping } = useAppData();
  const location = useLocation();

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

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
          <div className="grid gap-6 md:grid-cols-3">
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
        <div className="relative sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border/40 bg-background/90 px-4 backdrop-blur-md after:pointer-events-none after:absolute after:inset-x-8 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-border/80 after:to-transparent sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <p className="hidden truncate font-display text-base font-semibold tracking-tight md:block">{pageTitle}</p>
            <div className="pl-10 md:pl-0">
              <Breadcrumb />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden items-center gap-2 rounded-xl border border-border/60 bg-surface/60 px-3 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-surface hover:text-foreground md:flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Buscar...</span>
              <kbd className="ml-2 rounded-lg border border-border/60 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/80">Ctrl K</kbd>
            </button>
            <NotificationsDropdown />
            <div className="hidden items-center gap-2.5 rounded-xl border border-border/60 bg-surface/60 px-3 py-1.5 transition-colors duration-200 hover:border-border md:flex">
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full gradient-gold text-[11px] font-bold text-primary-foreground"
              >
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </motion.div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-semibold leading-tight">{user?.name}</span>
                <span className="truncate text-[10px] leading-tight text-muted-foreground">{user?.company}</span>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-auto max-w-[1600px] p-4 sm:p-5 md:pt-6 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
};
