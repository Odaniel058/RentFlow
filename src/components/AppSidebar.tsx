import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import {
  BarChart3,
  Boxes,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Film,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  ScrollText,
  Settings,
  Sun,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", aliases: [] },
  { label: "Invent\u00e1rio", icon: Package, path: "/inventory", aliases: [] },
  { label: "Reservas", icon: CalendarDays, path: "/reservations", aliases: [] },
  { label: "Propostas", icon: FileText, path: "/quotes", aliases: [] },
  { label: "Agenda", icon: CalendarDays, path: "/calendar", aliases: ["/agenda"] },
  { label: "Clientes", icon: Users, path: "/clients", aliases: [] },
  { label: "Kits", icon: Boxes, path: "/kits", aliases: [] },
  { label: "Contratos", icon: ScrollText, path: "/contracts", aliases: [] },
  { label: "Financeiro", icon: DollarSign, path: "/finance", aliases: ["/financial"] },
  { label: "Relat\u00f3rios", icon: BarChart3, path: "/reports", aliases: [] },
  { label: "Configura\u00e7\u00f5es", icon: Settings, path: "/settings", aliases: [] },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onToggleMobile,
  onCloseMobile,
}) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const themeBtnRef = useRef<HTMLButtonElement>(null);

  const handleThemeToggle = () => {
    const btn = themeBtnRef.current;
    if (!btn) { toggleTheme(); return; }

    const rect = btn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const maxR = Math.ceil(Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY)
    ));

    const bgColor = theme === 'dark' ? 'hsl(0 0% 99%)' : 'hsl(224 14% 5%)';
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;inset:0;z-index:9999;pointer-events:none;background:${bgColor};clip-path:circle(0px at ${originX}px ${originY}px);will-change:clip-path;`;
    document.body.appendChild(overlay);

    // Force reflow then expand
    overlay.getBoundingClientRect();
    overlay.style.transition = 'clip-path 430ms cubic-bezier(0.4,0,0.6,1)';
    overlay.style.clipPath = `circle(${maxR}px at ${originX}px ${originY}px)`;

    // Toggle theme at peak
    setTimeout(() => toggleTheme(), 420);

    // Contract back
    setTimeout(() => {
      overlay.style.transition = 'clip-path 380ms cubic-bezier(0.4,0,0.6,1)';
      overlay.style.clipPath = `circle(0px at ${originX}px ${originY}px)`;
    }, 460);

    // Remove overlay
    setTimeout(() => overlay.remove(), 860);
  };

  const sidebarContent = (
    <motion.aside
      animate={{ width: isMobile ? 296 : collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-full flex flex-col relative overflow-hidden"
      style={{
        background: 'hsl(var(--sidebar-background))',
        borderRight: '1px solid hsl(var(--sidebar-border))',
      }}
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--gold)) 0%, transparent 60%)`,
        }}
      />

      {/* Logo / Brand */}
      <div className="flex items-center justify-between gap-3 px-3.5 h-16 border-b border-sidebar-border relative z-10">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 min-w-0 group"
          onClick={onCloseMobile}
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0 animate-glow-pulse"
          >
            <Film className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </motion.div>

          <AnimatePresence initial={false}>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -8, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -8, width: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="min-w-0 overflow-hidden"
              >
                <p
                  className="font-bold text-base tracking-tight whitespace-nowrap font-display"
                  style={{ color: 'hsl(var(--sidebar-foreground))' }}
                >
                  RentFlow
                </p>
                <p className="text-[10px] text-muted-foreground truncate font-medium tracking-wide uppercase opacity-60">
                  {user?.company}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={onCloseMobile}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 relative z-10">
        {navItems.map((item, idx) => {
          const active =
            location.pathname === item.path ||
            item.aliases.includes(location.pathname) ||
            (item.path === "/quotes" && location.pathname.startsWith("/quotes/"));

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3, ease: "easeOut" }}
            >
              <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
            <Link
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  active
                    ? "sidebar-item-active text-primary border border-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--gold) / 0.1), hsl(var(--gold) / 0.05))',
                      border: '1px solid hsl(var(--gold) / 0.2)',
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <motion.div
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className={`flex-shrink-0 relative z-10 ${active ? "text-primary" : ""}`}
                >
                  <item.icon className="h-[17px] w-[17px]" strokeWidth={active ? 2.5 : 1.75} />
                </motion.div>

                <AnimatePresence initial={false}>
                  {(!collapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden relative z-10 tracking-tight"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active dot indicator when collapsed */}
                {collapsed && !isMobile && active && (
                  <motion.div
                    layoutId="dot-indicator"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-primary"
                  />
                )}
              </Link>
              </TooltipTrigger>
              {collapsed && !isMobile && (
                <TooltipContent side="right" className="glass-card border-border/60 text-xs font-medium px-3 py-1.5">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-sidebar-border p-2 space-y-0.5 relative z-10">
        {/* User info (expanded only) */}
        <AnimatePresence>
          {(!collapsed || isMobile) && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-2.5 py-2 mb-1"
            >
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          ref={themeBtnRef}
          onClick={handleThemeToggle}
          className="w-full flex items-center gap-3 h-10 px-2.5 rounded-xl hover:bg-sidebar-accent transition-colors duration-200 text-sm font-medium text-sidebar-foreground"
        >
          {/* Day/Night pill */}
          <div className={`theme-toggle-pill ${theme === 'dark' ? 'theme-pill--dark' : 'theme-pill--light'}`}>
            {/* Stars (dark only) */}
            {theme === 'dark' && (
              <>
                <span className="theme-star" style={{ width: 2.5, height: 2.5, top: 5, right: 8, opacity: 0.9 }} />
                <span className="theme-star" style={{ width: 2, height: 2, top: 12, right: 13, opacity: 0.65 }} />
                <span className="theme-star" style={{ width: 2, height: 2, top: 6, right: 18, opacity: 0.75 }} />
              </>
            )}
            {/* Sliding thumb */}
            <motion.div
              className="theme-toggle-thumb"
              animate={{ x: theme === 'dark' ? 2 : 22 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div key="moon"
                    initial={{ rotate: -40, scale: 0.4, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 40, scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Moon className="h-2.5 w-2.5 text-sky-300" strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  <motion.div key="sun"
                    initial={{ rotate: 90, scale: 0.4, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -90, scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Sun className="h-2.5 w-2.5 text-amber-500" strokeWidth={2.5} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Label */}
          <AnimatePresence initial={false}>
            {(!collapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 text-sm rounded-xl text-destructive hover:text-destructive hover:bg-destructive/8"
          onClick={logout}
        >
          <LogOut className="h-[17px] w-[17px] flex-shrink-0" strokeWidth={1.75} />
          <AnimatePresence initial={false}>
            {(!collapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        {!isMobile && (
          <Button
            variant="ghost"
            className="w-full justify-center h-9 rounded-xl mt-1"
            onClick={onToggleCollapsed}
          >
            <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </Button>
        )}
      </div>
    </motion.aside>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <motion.div
        className="md:hidden fixed top-4 left-4 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full h-10 w-10 premium-shadow-lg bg-card/90 backdrop-blur-xl border border-border/50"
          onClick={onToggleMobile}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-0 h-screen z-30">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-[296px]"
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

