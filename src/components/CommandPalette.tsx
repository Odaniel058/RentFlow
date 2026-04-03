import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, FileText, Package, Search, Users2, X } from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";

interface CommandItem {
  id: string;
  label: string;
  sublabel: string;
  category: string;
  icon: React.ElementType;
  iconColor: string;
  path: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { state } = useAppData();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const q = query.toLowerCase().trim();

    const clients = state.clients
      .filter((c) => !q || c.name.toLowerCase().includes(q) || (c.company ?? "").toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({
        id: `client-${c.id}`,
        label: c.name,
        sublabel: c.company || c.email || c.id,
        category: "Clientes",
        icon: Users2,
        iconColor: "text-teal-500",
        path: "/clients",
      }));

    const reservations = state.reservations
      .filter((r) => !q || r.clientName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
      .slice(0, 4)
      .map((r) => ({
        id: `res-${r.id}`,
        label: r.clientName,
        sublabel: `${r.id} · ${r.pickupDate} → ${r.returnDate}`,
        category: "Reservas",
        icon: CalendarCheck,
        iconColor: "text-blue-500",
        path: "/reservations",
      }));

    const equipment = state.equipment
      .filter(
        (e) =>
          !q ||
          e.name.toLowerCase().includes(q) ||
          (e.brand ?? "").toLowerCase().includes(q) ||
          (e.category ?? "").toLowerCase().includes(q),
      )
      .slice(0, 4)
      .map((e) => ({
        id: `eq-${e.id}`,
        label: e.name,
        sublabel: [e.brand, e.category].filter(Boolean).join(" · "),
        category: "Equipamentos",
        icon: Package,
        iconColor: "text-yellow-500",
        path: "/inventory",
      }));

    const quotes = state.quotes
      .filter((q_) => !q || q_.clientName.toLowerCase().includes(q) || q_.id.toLowerCase().includes(q))
      .slice(0, 3)
      .map((q_) => ({
        id: `quote-${q_.id}`,
        label: q_.clientName,
        sublabel: `${q_.id} · ${q_.status}`,
        category: "Propostas",
        icon: FileText,
        iconColor: "text-purple-500",
        path: "/quotes",
      }));

    return [...clients, ...reservations, ...equipment, ...quotes];
  }, [query, state.clients, state.reservations, state.equipment, state.quotes]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const grouped = useMemo(() => {
    const map: Record<string, CommandItem[]> = {};
    items.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return map;
  }, [items]);

  const handleSelect = (item: CommandItem) => {
    navigate(item.path);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, items.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && items[selectedIndex]) handleSelect(items[selectedIndex]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, items, selectedIndex, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pointer-events-auto w-full max-w-xl rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar clientes, reservas, equipamentos..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto py-2">
                {items.length === 0 ? (
                  <div className="py-12 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {query ? `Nenhum resultado para "${query}"` : "Digite para buscar"}
                    </p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, categoryItems]) => (
                    <div key={category}>
                      <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                        {category}
                      </p>
                      {categoryItems.map((item) => {
                        const flatIndex = items.indexOf(item);
                        const Icon = item.icon;
                        const isSelected = flatIndex === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(flatIndex)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-muted" : "hover:bg-muted/50"}`}
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background border border-border/50">
                              <Icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.label}</p>
                              <p className="text-xs text-muted-foreground truncate">{item.sublabel}</p>
                            </div>
                            {isSelected && (
                              <kbd className="hidden sm:flex items-center text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
                                ↵
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/50 bg-muted/20">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="border border-border/60 rounded px-1 py-0.5 font-mono bg-background">↑↓</kbd>
                    navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="border border-border/60 rounded px-1 py-0.5 font-mono bg-background">↵</kbd>
                    abrir
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="border border-border/60 rounded px-1 py-0.5 font-mono bg-background">Esc</kbd>
                    fechar
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {items.length} resultado{items.length !== 1 ? "s" : ""}
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
