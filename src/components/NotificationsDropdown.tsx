import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CalendarClock,
  CheckCheck,
  ChevronRight,
  FileText,
  Package,
  X,
} from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType = "warning" | "info" | "alert" | "success";

interface AppNotification {
  id: string;
  type: NotifType;
  icon: React.ElementType;
  title: string;
  desc: string;
  link: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const readKey = (tenantId: string) => `rentflow_notif_read_${tenantId}`;

const getRead = (tenantId: string): Set<string> => {
  try {
    const stored = localStorage.getItem(readKey(tenantId));
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const saveRead = (tenantId: string, ids: Set<string>) => {
  localStorage.setItem(readKey(tenantId), JSON.stringify([...ids]));
};

const TYPE_STYLES: Record<NotifType, { dot: string; icon: string; bg: string }> = {
  warning: {
    dot: "bg-yellow-500",
    icon: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  alert: {
    dot: "bg-red-500",
    icon: "text-red-500",
    bg: "bg-red-500/10",
  },
  info: {
    dot: "bg-blue-500",
    icon: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  success: {
    dot: "bg-green-500",
    icon: "text-green-500",
    bg: "bg-green-500/10",
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

const useNotifications = (): AppNotification[] => {
  const { state } = useAppData();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  return useMemo(() => {
    const notifications: AppNotification[] = [];

    // Equipment in maintenance
    const inMaintenance = state.equipment.filter((e) => e.status === "maintenance");
    if (inMaintenance.length > 0) {
      notifications.push({
        id: `maintenance-${inMaintenance.map((e) => e.id).join("-")}`,
        type: "warning",
        icon: Package,
        title: `${inMaintenance.length} equipamento${inMaintenance.length > 1 ? "s" : ""} em manutencao`,
        desc: inMaintenance.slice(0, 2).map((e) => e.name).join(", ") + (inMaintenance.length > 2 ? ` e mais ${inMaintenance.length - 2}` : ""),
        link: "/inventory",
      });
    }

    // Pickups today
    const pickupsToday = state.reservations.filter(
      (r) => r.pickupDate === today && (r.status === "approved" || r.status === "in_progress"),
    );
    pickupsToday.forEach((r) => {
      notifications.push({
        id: `pickup-today-${r.id}`,
        type: "info",
        icon: CalendarCheck,
        title: `Retirada hoje: ${r.clientName}`,
        desc: `${r.equipment.slice(0, 2).join(", ")}${r.equipment.length > 2 ? ` +${r.equipment.length - 2}` : ""}`,
        link: "/reservations",
      });
    });

    // Returns today
    const returnsToday = state.reservations.filter(
      (r) => r.returnDate === today && r.status === "in_progress",
    );
    returnsToday.forEach((r) => {
      notifications.push({
        id: `return-today-${r.id}`,
        type: "alert",
        icon: CalendarClock,
        title: `Devolucao hoje: ${r.clientName}`,
        desc: `${r.equipment.slice(0, 2).join(", ")}${r.equipment.length > 2 ? ` +${r.equipment.length - 2}` : ""}`,
        link: "/reservations",
      });
    });

    // Pickups tomorrow
    const pickupsTomorrow = state.reservations.filter(
      (r) => r.pickupDate === tomorrow && r.status === "approved",
    );
    if (pickupsTomorrow.length > 0) {
      notifications.push({
        id: `pickup-tomorrow-${pickupsTomorrow.map((r) => r.id).join("-")}`,
        type: "info",
        icon: CalendarCheck,
        title: `${pickupsTomorrow.length} retirada${pickupsTomorrow.length > 1 ? "s" : ""} amanha`,
        desc: pickupsTomorrow.map((r) => r.clientName).slice(0, 2).join(", "),
        link: "/calendar",
      });
    }

    // Stale quotes (sent > 5 days ago, no response)
    const fiveDaysAgo = new Date(Date.now() - 5 * 86_400_000).toISOString().slice(0, 10);
    const staleQuotes = state.quotes.filter(
      (q) => q.status === "sent" && q.createdAt.slice(0, 10) <= fiveDaysAgo,
    );
    if (staleQuotes.length > 0) {
      notifications.push({
        id: `stale-quotes-${staleQuotes.map((q) => q.id).join("-")}`,
        type: "alert",
        icon: FileText,
        title: `${staleQuotes.length} proposta${staleQuotes.length > 1 ? "s" : ""} sem resposta`,
        desc: `Enviada${staleQuotes.length > 1 ? "s" : ""} ha mais de 5 dias: ${staleQuotes.map((q) => q.clientName).slice(0, 2).join(", ")}`,
        link: "/quotes",
      });
    }

    // Draft contracts linked to approved reservations
    const approvedIds = new Set(
      state.reservations.filter((r) => r.status === "approved").map((r) => r.id),
    );
    const pendingContracts = state.contracts.filter(
      (c) => c.status === "draft" && approvedIds.has(c.reservationId),
    );
    if (pendingContracts.length > 0) {
      notifications.push({
        id: `pending-contracts-${pendingContracts.map((c) => c.id).join("-")}`,
        type: "warning",
        icon: FileText,
        title: `${pendingContracts.length} contrato${pendingContracts.length > 1 ? "s" : ""} pendente${pendingContracts.length > 1 ? "s" : ""} de assinatura`,
        desc: "Reservas aprovadas com contrato em rascunho.",
        link: "/contracts",
      });
    }

    return notifications;
  }, [state.equipment, state.reservations, state.quotes, state.contracts, today, tomorrow]);
};

// ─── Component ────────────────────────────────────────────────────────────────

export const NotificationsDropdown: React.FC = () => {
  const { user } = useAuth();
  const notifications = useNotifications();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<Set<string>>(() =>
    user ? getRead(user.tenantId) : new Set(),
  );

  const unreadCount = notifications.filter((n) => !read.has(n.id)).length;

  const markAllRead = () => {
    if (!user) return;
    const all = new Set(notifications.map((n) => n.id));
    saveRead(user.tenantId, all);
    setRead(all);
  };

  const dismiss = (id: string) => {
    if (!user) return;
    const next = new Set(read).add(id);
    saveRead(user.tenantId, next);
    setRead(next);
  };

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Notificacoes"
      >
        <Bell className="h-4 w-4" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Notificacoes</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-500/15 border border-red-500/25 text-red-500 px-2 py-0.5 text-xs font-bold">
                      {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Marcar todas
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[26rem] overflow-y-auto divide-y divide-border/40">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <Bell className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tudo em dia</p>
                      <p className="text-xs text-muted-foreground mt-1">Nenhuma notificacao no momento.</p>
                    </div>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isRead = read.has(notif.id);
                    const styles = TYPE_STYLES[notif.type];
                    return (
                      <div
                        key={notif.id}
                        className={`relative flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 ${isRead ? "opacity-60" : ""}`}
                      >
                        {!isRead && (
                          <span className={`absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                        )}
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${styles.bg}`}>
                          <notif.icon className={`h-4 w-4 ${styles.icon}`} />
                        </div>
                        <Link
                          to={notif.link}
                          onClick={() => { dismiss(notif.id); setOpen(false); }}
                          className="flex-1 min-w-0 group"
                        >
                          <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-2">
                            {notif.desc}
                          </p>
                        </Link>
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <Link
                            to={notif.link}
                            onClick={() => { dismiss(notif.id); setOpen(false); }}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => dismiss(notif.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Dispensar"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-border/50 px-4 py-2.5">
                  <Link
                    to="/reservations"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Ver todas as reservas
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
