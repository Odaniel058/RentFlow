import React, { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/contexts/AppDataContext";
import { AppSidebar } from "./AppSidebar";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { CommandPalette } from "./CommandPalette";
import { Breadcrumb } from "./Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

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
  const [directorMode, setDirectorMode] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { isBootstrapping } = useAppData();
  const location = useLocation();
  const konamiRef = useRef<string[]>([]);

  // Spotlight effect: track mouse → CSS custom props
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--spotlight-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--spotlight-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Konami Code easter egg
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      konamiRef.current = [...konamiRef.current, e.key].slice(-KONAMI.length);
      if (konamiRef.current.join(',') === KONAMI.join(',')) {
        konamiRef.current = [];
        setDirectorMode(prev => {
          const next = !prev;
          document.documentElement.classList.toggle('director-mode', next);
          toast(next ? '🎬 Modo Diretor ativado' : '🎬 Modo normal restaurado', {
            description: next ? 'Pressione ESC ou ↑↑↓↓←→←→BA para sair' : undefined,
            duration: 4000,
          });
          return next;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ESC exits director mode
  useEffect(() => {
    if (!directorMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDirectorMode(false);
        document.documentElement.classList.remove('director-mode');
        toast('🎬 Modo normal restaurado', { duration: 2000 });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [directorMode]);

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
      <div className="flex min-h-screen bg-background">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex w-[260px] flex-col border-r border-border/40 p-4 gap-3 bg-sidebar-background">
          <div className="flex items-center gap-3 h-16 border-b border-border/40 -mx-4 px-4 mb-2">
            <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
            <Skeleton className="h-4 w-24 rounded-lg" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" style={{ opacity: 1 - i * 0.08 }} />
          ))}
          <div className="mt-auto pt-4 border-t border-border/40 space-y-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-36 rounded-xl" />
              <Skeleton className="h-4 w-56 rounded-lg" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28 rounded-xl" />
              <Skeleton className="h-8 w-28 rounded-xl" />
              <Skeleton className="h-8 w-36 rounded-xl" />
            </div>
          </div>

          {/* Today cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <Skeleton className="h-8 w-28 rounded-lg" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
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
        {/* ── Premium header ── */}
        <div className="header-frosted header-gradient-line relative sticky top-0 z-20 flex h-16 items-center justify-between gap-3 px-4 sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <span className="font-display text-sm font-bold tracking-tight text-foreground">
                {pageTitle}
              </span>
            </div>
            <div className="hidden md:block w-px h-4 bg-border/60" />
            <div className="pl-10 md:pl-0">
              <Breadcrumb />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            {/* Search bar */}
            <motion.button
              onClick={() => setCmdOpen(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="hidden items-center gap-2 rounded-xl border border-border/50 bg-surface/50 px-3 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/25 hover:bg-surface hover:text-foreground md:flex"
              style={{ boxShadow: 'inset 0 1px 0 hsl(0 0% 100%/0.04)' }}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="w-28">Buscar...</span>
              <kbd className="ml-1 rounded-md border border-border/50 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70">
                ⌘K
              </kbd>
            </motion.button>

            <NotificationsDropdown />

            {/* User chip */}
            <div className="hidden items-center gap-2.5 rounded-xl border border-border/50 bg-surface/50 px-2.5 py-1.5 transition-all duration-200 hover:border-border/80 hover:bg-surface md:flex"
              style={{ boxShadow: 'inset 0 1px 0 hsl(0 0% 100%/0.04)' }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 420, damping: 14 }}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg gradient-gold text-[11px] font-bold text-primary-foreground"
                style={{ boxShadow: '0 0 12px hsl(var(--gold)/0.25)' }}
              >
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </motion.div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-semibold leading-tight">{user?.name}</span>
                <span className="truncate text-[10px] leading-tight text-muted-foreground/70">{user?.company}</span>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-[1600px] p-4 sm:p-5 md:pt-6 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      {directorMode && <div className="director-grain" />}
    </div>
  );
};
