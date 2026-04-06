import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  RotateCcw,
  ScrollText,
  Sparkles,
} from "lucide-react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  eachDayOfInterval,
  endOfWeek as dateEndOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  parseISO,
  startOfMonth as dateStartOfMonth,
  startOfWeek as dateStartOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTransition } from "@/components/PageTransition";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useAppData } from "@/contexts/AppDataContext";
import { AgendaEvent, AgendaEventType } from "@/data/mock-data";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalAsideCard, ModalHero, ModalSection } from "@/components/ui/modal-shell";
import { toast } from "sonner";

/* ─── helpers ─── */
const EVENT_COLORS: Record<string, string> = {
  pickup: "hsl(217 91% 60%)",
  return: "hsl(142 71% 45%)",
  reservation: "hsl(43 85% 55%)",
};

interface DayBag {
  date: Date;
  isCurrentMonth: boolean;
  events: AgendaEvent[];
}

type AgendaView = "calendar" | "list";
type AgendaFilter = "all" | AgendaEventType;

const AgendaPage: React.FC = () => {
  const { state, upsertAgendaEvent } = useAppData();
  const [view, setView] = useState<AgendaView>("calendar");
  const [filter, setFilter] = useState<AgendaFilter>("all");
  const [focusDate, setFocusDate] = useState(new Date());

  /* ─── calendar grid ─── */
  const calendarStart = useMemo(() => {
    const start = dateStartOfMonth(focusDate);
    return dateStartOfWeek(start, { weekStartsOn: 0 });
  }, [focusDate]);

  const calendarEnd = useMemo(() => {
    const end = endOfMonth(focusDate);
    return dateEndOfWeek(end, { weekStartsOn: 0 });
  }, [focusDate]);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(
      (date) => ({
        date,
        isCurrentMonth: isSameMonth(date, focusDate),
        events: [],
      }),
    ) as DayBag[];
  }, [calendarStart, calendarEnd, focusDate]);

  // Map events to their matching calendar days
  const enrichedDays = useMemo(() => {
    const allEvents = state.agendaEvents.filter(
      (event) => filter === "all" || event.type === filter,
    );

    // build reservation spans too
    const reservationEvents = state.reservations
      .filter((r) => r.status !== "cancelled")
      .flatMap((r) => {
        const start = parseISO(`${r.pickupDate}T12:00:00`);
        const end = parseISO(`${r.returnDate}T12:00:00`);
        return eachDayOfInterval({ start, end }).map((d) => ({
          date: format(d, "yyyy-MM-dd"),
          clientName: r.clientName,
          equipment: r.equipment,
          type: "reservation" as AgendaEventType,
          status: r.status === "quote" ? "pending" : r.status === "in_progress" ? "confirmed" : "confirmed",
          title: r.id,
          reservationId: r.id,
          clientId: r.clientId,
        })) as Omit<AgendaEvent, "id"> & { date: string }[];
      });

    const dayMap = new Map<string, (AgendaEvent | Omit<AgendaEvent, "id" | "reservationId" | "clientId">)[]>();
    allEvents.forEach((ev) => {
      if (!dayMap.has(ev.date)) dayMap.set(ev.date, []);
      dayMap.get(ev.date)!.push(ev);
    });
    reservationEvents.forEach((ev) => {
      if (!dayMap.has(ev.date)) dayMap.set(ev.date, []);
      // dedupe by title
      const existing = dayMap.get(ev.date)!;
      if (!existing.some((x) => x.title === ev.title)) {
        dayMap.set(ev.date, [...existing, { ...ev, id: `rv-${ev.date}-${ev.title}` }]);
      }
    });

    return days.map((d) => {
      const key = format(d.date, "yyyy-MM-dd");
      return { ...d, events: dayMap.get(key) ?? [] };
    });
  }, [days, filter, state.agendaEvents, state.reservations]);

  /* ─── list view helpers ─── */
  const range = useMemo(() => {
    if (view === "list") {
      const monthStart = dateStartOfMonth(focusDate);
      const monthEnd = endOfMonth(focusDate);
      return { start: monthStart, end: monthEnd };
    }
    return { start: focusDate, end: focusDate };
  }, [focusDate, view]);

  const visibleEvents = useMemo(() => {
    const base = state.agendaEvents.filter(
      (event) => filter === "all" || event.type === filter,
    );
    return base
      .filter((event) =>
        isWithinInterval(parseISO(`${event.date}T12:00:00`), {
          start: range.start,
          end: range.end,
        }),
      )
      .sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`));
  }, [filter, range.end, range.start, state.agendaEvents]);

  const grouped = useMemo(
    () =>
      visibleEvents.reduce<Record<string, AgendaEvent[]>>((accumulator, event) => {
        if (!accumulator[event.date]) accumulator[event.date] = [];
        accumulator[event.date].push(event);
        return accumulator;
      }, {}),
    [visibleEvents],
  );

  const orderedDates = Object.keys(grouped).sort();
  const selectedIdRef = useState<string | null>(state.agendaEvents[0]?.id ?? null);
  const [selectedId, setSelectedId] = selectedIdRef;
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "pickup" as AgendaEventType,
    reservationId: "",
    clientName: "",
    title: "Novo evento",
    description: "",
    notes: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    status: "pending" as AgendaEvent["status"],
  });

  const currentMonthLabel = format(focusDate, "MMMM 'de' yyyy", { locale: ptBR });
  const currentWeekLabel = `Semana de ${format(range.start, "dd 'de' MMM", { locale: ptBR })}`;

  /* ─── handlers ─── */
  const handleMoveDate = (direction: "prev" | "next") => {
    const factor = direction === "next" ? 1 : -1;
    setFocusDate((current) => {
      if (view === "calendar") return addMonths(current, factor);
      if (view === "list") return addMonths(current, factor);
      return addWeeks(current, factor);
    });
  };

  const openCreate = () => {
    setForm({
      type: "pickup",
      reservationId: "",
      clientName: "",
      title: "Novo evento",
      description: "",
      notes: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "09:00",
      status: "pending",
    });
    setEditorOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!form.clientName || !form.date || !form.time || !form.title) {
      toast.error("Preencha os dados essenciais do evento.");
      return;
    }

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    upsertAgendaEvent({
      type: form.type,
      reservationId: form.reservationId || undefined,
      clientName: form.clientName,
      equipment: ["Evento manual"],
      date: form.date,
      time: form.time,
      status: form.status,
      title: form.title,
      description: form.description,
      notes: form.notes,
    });
    setSaving(false);
    toast.success("Evento adicionado a agenda.");
    setEditorOpen(false);
  };

  /* ─── stats ─── */
  const monthEventCount = enrichedDays.reduce((sum, d) => sum + d.events.length, 0);
  const monthPickupCount = enrichedDays.reduce(
    (sum, d) => sum + d.events.filter((e) => e.type === "pickup").length,
    0,
  );
  const monthReturnCount = enrichedDays.reduce(
    (sum, d) => sum + d.events.filter((e) => e.type === "return").length,
    0,
  );

  const selected = state.agendaEvents.find((ev) => ev.id === selectedId) ?? null;

  /* ─── render ─── */
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
            <p className="mt-1 text-sm text-muted-foreground">Controle de periodo com calendario visual e detalhe de evento.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setFocusDate(new Date())} className="rounded-xl gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Hoje
            </Button>
            <Button className="gradient-gold text-primary-foreground rounded-xl" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5 mr-2" /> Novo evento
            </Button>
          </div>
        </motion.div>

        {/* Toolbar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-4 premium-shadow">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {/* view switcher with layoutId */}
              <div className="flex items-center gap-1.5 p-1 bg-surface rounded-xl border border-border/50">
                {([{ value: "calendar" as const, label: "Calendario" }, { value: "list" as const, label: "Lista" }]).map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setView(item.value)}
                    className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${view === item.value ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {view === item.value && (
                      <motion.div layoutId="agenda-view-pill" className="absolute inset-0 gradient-gold rounded-lg" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* date navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleMoveDate("prev")} className="h-9 w-9 rounded-lg">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="rounded-xl border border-border/60 bg-surface/50 px-4 py-1.5 min-w-[140px] text-center">
                  <p className="text-sm font-semibold capitalize">{view === "calendar" ? currentMonthLabel : currentWeekLabel}</p>
                </div>
                <Button variant="outline" size="icon" onClick={() => handleMoveDate("next")} className="h-9 w-9 rounded-lg">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* type filter */}
              <div className="flex items-center gap-1 p-1 bg-surface rounded-xl border border-border/50">
                {([{ value: "all" as const, label: "Todos" }, { value: "pickup" as const, label: "Retiradas" }, { value: "return" as const, label: "Devolucoes" }, { value: "reservation" as const, label: "Reservas" }]).map((item) => (
                  <motion.button
                    key={item.value}
                    onClick={() => setFilter(item.value)}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === item.value ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {filter === item.value && (
                      <motion.div layoutId="agenda-filter-pill" className="absolute inset-0 gradient-gold rounded-lg" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { icon: CalendarRange, label: "Eventos no mes", value: monthEventCount, color: "text-primary" },
            { icon: ArrowUpRight, label: "Retiradas", value: monthPickupCount, color: "text-info" },
            { icon: ArrowDownLeft, label: "Devolucoes", value: monthReturnCount, color: "text-success" },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              whileHover={{ y: -2 }}
              className="glass-card p-4 premium-shadow text-center flex flex-col items-center gap-1 group hover:border-primary/25 transition-all duration-300"
            >
              <Icon className={`h-4 w-4 ${color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm text-muted-foreground">{label}</span>
              <motion.span className="font-display text-xl font-bold" initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.04, type: "spring" }}>
                {value}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── CALENDAR VIEW ─── */}
        {view === "calendar" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="glass-card p-4 sm:p-6 premium-shadow">
            {/* Day-of-week header */}
            <div className="grid grid-cols-7 gap-px mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                <div key={day} className="text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px">
              <AnimatePresence>
                {enrichedDays.map((day, i) => (
                  <motion.div
                    key={format(day.date, "yyyy-MM-dd")}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.008, duration: 0.15 }}
                    onClick={() => {
                      setFocusDate(day.date);
                      // show events for this day in the detail panel
                      if (day.events.length > 0) {
                        setSelectedId(day.events[0].id);
                      }
                    }}
                    className={`min-h-[80px] sm:min-h-[96px] rounded-xl border transition-all cursor-pointer group relative flex flex-col p-1.5 sm:p-2 ${
                      isToday(day.date)
                        ? "border-primary/40 bg-primary/5"
                        : day.isCurrentMonth
                          ? "border-border/40 bg-background/60 hover:border-primary/30 hover:bg-surface/50"
                          : "border-border/20 bg-muted/20 opacity-40 hover:opacity-100"
                    }`}
                  >
                    {/* Date number */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs sm:text-sm font-semibold ${
                        isToday(day.date) ? "text-primary" : day.isCurrentMonth ? "text-foreground/80" : "text-muted-foreground/30"
                      }`}>
                        {format(day.date, "d")}
                      </span>
                      {day.events.length > 0 && (
                        <span className="text-[10px] text-muted-foreground/60 font-medium">
                          {day.events.length}
                        </span>
                      )}
                    </div>

                    {/* Event dots */}
                    {day.events.length > 0 && (
                      <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
                        {day.events.slice(0, 3).map((ev) => (
                          <div
                            key={ev.id}
                            className="h-[18px] rounded px-1 flex items-center gap-1 text-[10px] font-medium truncate"
                            style={{
                              background: `${EVENT_COLORS[ev.type] || "hsl(43 85% 55%)"}18`,
                              borderLeft: `2px solid ${EVENT_COLORS[ev.type] || "hsl(43 85% 55%)"}`,
                              color: EVENT_COLORS[ev.type] || "hsl(43 85% 55%)",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(ev.id);
                            }}
                          >
                            <span className="truncate">{ev.type === "pickup" ? "Ret" : ev.type === "return" ? "Dev" : ev.title}</span>
                          </div>
                        ))}
                        {day.events.length > 3 && (
                          <div className="text-[10px] text-muted-foreground font-semibold px-1">+{day.events.length - 3} mais</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ─── LIST VIEW ─── */}
        {view === "list" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              {orderedDates.length ? (
                orderedDates.map((date) => (
                  <motion.div key={date} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <CalendarDays className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold capitalize">{format(parseISO(`${date}T12:00:00`), "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
                        <p className="text-xs text-muted-foreground">{grouped[date].length} evento(s)</p>
                      </div>
                    </div>
                    <div className="ml-[52px] space-y-3">
                      <AnimatePresence>
                        {grouped[date].map((event, idx) => (
                          <motion.button
                            key={event.id}
                            type="button"
                            onClick={() => setSelectedId(event.id)}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.005, y: -1 }}
                            className={`w-full text-left glass-card p-4 premium-shadow transition-all rounded-xl ${
                              selectedId === event.id
                                ? "border-primary/40 bg-primary/8 shadow-[inset_3px_0_0_0_hsl(var(--primary)/0.5)]"
                                : "hover:premium-shadow-lg hover:border-border/60"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <motion.div
                                  whileHover={{ scale: 1.15 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                    event.type === "pickup"
                                      ? "bg-info/10 text-info"
                                      : event.type === "return"
                                        ? "bg-success/10 text-success"
                                        : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {event.type === "pickup"
                                    ? <ArrowUpRight className="h-4 w-4" />
                                    : event.type === "return"
                                      ? <ArrowDownLeft className="h-4 w-4" />
                                      : <CalendarDays className="h-4 w-4" />}
                                </motion.div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium">{event.title || event.clientName}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                    {event.clientName}{" "}
                                    {event.equipment?.length > 0 && (
                                      <span className="opacity-60">• {event.equipment.join(", ")}</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-medium">{event.time}</p>
                                <StatusBadge status={event.status} />
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="Nenhum evento no periodo"
                  description="Mude os filtros ou adicione um evento manualmente."
                  action={{ label: "Adicionar evento", onClick: openCreate, icon: Plus }}
                />
              )}
            </div>

            {/* Detail panel */}
            <div className="glass-card p-6 premium-shadow h-fit xl:sticky xl:top-8">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">Detalhe do evento</p>
                        <h3 className="text-xl font-semibold">{selected.title || selected.clientName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selected.type === "pickup" ? "Retirada" : selected.type === "return" ? "Devolucao" : "Reserva"}
                        </p>
                      </div>
                      <StatusBadge status={selected.status} />
                    </div>

                    <div className="rounded-xl border border-border/60 bg-surface/40 p-4">
                      <p className="mb-1 text-xs text-muted-foreground">Quando</p>
                      <p className="text-sm font-medium">{formatDateTime(selected.date, selected.time)}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Equipamentos envolvidos</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.equipment.map((item) => (
                          <span key={item} className="rounded-full border border-border/60 bg-surface px-3 py-1 text-xs text-muted-foreground">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium">Status</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(["pending", "confirmed", "completed"] as const).map((status) => {
                          const active = selected.status === status;
                          return (
                            <button
                              key={status}
                              onClick={() => {
                                upsertAgendaEvent({ ...selected, status });
                                toast.success("Status atualizado.");
                              }}
                              className={`h-8 rounded-lg text-xs font-medium transition-all ${
                                active
                                  ? status === "confirmed"
                                    ? "bg-primary/10 text-primary border border-primary/30"
                                    : "bg-muted/60 text-foreground border border-border/50"
                                  : "border border-border/50 bg-background text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {status === "pending" ? "Pendente" : status === "confirmed" ? "Confirmado" : "Concluido"}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selected.notes && (
                      <div className="rounded-xl border border-border/60 bg-surface/30 p-4">
                        <p className="mb-2 text-sm font-medium">Notas</p>
                        <p className="text-sm text-muted-foreground">{selected.notes}</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-detail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="py-8 text-center"
                  >
                    <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Selecione um evento para ver o detalhe.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ─── Editor dialog ─── */}
        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden p-0">
            <div className="grid max-h-[92vh] overflow-hidden xl:grid-cols-[0.9fr_1.5fr]">
              <div className="border-b border-border/60 p-8 xl:border-b-0 xl:border-r">
                <ModalHero
                  eyebrow="Agenda operacional"
                  title="Novo evento da agenda"
                  description="Crie eventos com contexto real e notas internas."
                />
                <div className="mt-6 space-y-4">
                  <ModalAsideCard title="Tipo de evento" description="Retirada, devolucao ou reserva.">
                    <span className="text-sm font-medium">{form.type === "pickup" ? "Retirada" : form.type === "return" ? "Devolucao" : "Reserva"}</span>
                  </ModalAsideCard>
                </div>
              </div>

              <div className="overflow-y-auto p-8">
                <div className="space-y-6">
                  <ModalSection title="Dados principais" description="">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as AgendaEventType }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                          <option value="pickup">Retirada</option>
                          <option value="return">Devolucao</option>
                          <option value="reservation">Reserva</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Titulo do evento</Label>
                        <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Cliente</Label>
                        <Input value={form.clientName} onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))} />
                      </div>
                    </div>
                  </ModalSection>

                  <ModalSection title="Quando acontece" description="">
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Hora</Label>
                        <Input type="time" value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AgendaEvent["status"] }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                          <option value="pending">Pendente</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="completed">Concluido</option>
                        </select>
                      </div>
                    </div>
                  </ModalSection>

                  <ModalSection title="Detalhes" description="">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Descricao</Label>
                        <Textarea rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Observacoes</Label>
                        <Textarea rows={4} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
                      </div>
                    </div>
                  </ModalSection>
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-border/60 pt-6">
                  <Button variant="outline" onClick={() => setEditorOpen(false)}>
                    Cancelar
                  </Button>
                  <Button className="gradient-gold text-primary-foreground" onClick={handleSaveEvent} disabled={saving}>
                    {saving ? <Clock3 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Salvar evento
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default AgendaPage;
