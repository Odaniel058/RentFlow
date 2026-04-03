import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, CalendarClock, CalendarX, CheckCircle2, Clock, FileText, Package, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityEntry, getActivityLog } from "@/lib/activityLog";

const timeAgo = (iso: string): string => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
};

const ENTRY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "reservation:created": { icon: CalendarCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
  "reservation:updated": { icon: CalendarClock, color: "text-blue-400", bg: "bg-blue-400/10" },
  "reservation:deleted": { icon: CalendarX, color: "text-muted-foreground", bg: "bg-muted" },
  "quote:created":       { icon: FileText,     color: "text-purple-500",  bg: "bg-purple-500/10" },
  "quote:converted":     { icon: CheckCircle2, color: "text-purple-400",  bg: "bg-purple-400/10" },
  "contract:created":    { icon: FileText,     color: "text-green-500",   bg: "bg-green-500/10" },
  "contract:signed":     { icon: CheckCircle2, color: "text-green-500",   bg: "bg-green-500/10" },
  "equipment:created":   { icon: Package,      color: "text-yellow-500",  bg: "bg-yellow-500/10" },
  "client:created":      { icon: UserPlus,     color: "text-teal-500",    bg: "bg-teal-500/10" },
};

const DEFAULT_META = { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" };

export const ActivityFeed: React.FC<{ limit?: number }> = ({ limit = 10 }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    const refresh = () => setEntries(getActivityLog(user.tenantId).slice(0, limit));
    refresh();
    window.addEventListener("rentflow:activity", refresh);
    return () => window.removeEventListener("rentflow:activity", refresh);
  }, [user, limit]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Clock className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium">Nenhuma atividade registrada</p>
        <p className="text-xs text-muted-foreground mt-1">As ações aparecerão aqui conforme você usa o sistema.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <AnimatePresence initial={false}>
        {entries.map((entry, i) => {
          const metaKey = `${entry.entity}:${entry.action}`;
          const meta = ENTRY_META[metaKey] ?? DEFAULT_META;
          const Icon = meta.icon;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.035 }}
              className="flex items-start gap-3 py-2.5 px-2 rounded-xl hover:bg-muted/40 transition-colors"
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">{entry.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{entry.userName} · {timeAgo(entry.timestamp)}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
