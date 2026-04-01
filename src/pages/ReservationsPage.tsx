import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Search, Plus, Pencil, Ban, Eye, ArrowRight, Clock3, ReceiptText, Sparkles, Radio } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { StatusBadge } from "@/components/StatusBadge";
import { ClientSearchSelect } from "@/components/clients/ClientSearchSelect";
import { useAppData } from "@/contexts/AppDataContext";
import { Reservation, ReservationStatus } from "@/data/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const statuses: Array<{ value: ReservationStatus | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "quote", label: "Orcamento" },
  { value: "approved", label: "Aprovado" },
  { value: "in_progress", label: "Em andamento" },
  { value: "completed", label: "Finalizado" },
  { value: "cancelled", label: "Cancelado" },
];

const timeline: ReservationStatus[] = ["quote", "approved", "in_progress", "completed"];

const ReservationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, upsertReservation } = useAppData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");
  const [period, setPeriod] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(state.reservations[0]?.id ?? null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ clientId: "", equipmentIds: [] as string[], pickupDate: "2026-03-20", returnDate: "2026-03-22", status: "quote" as ReservationStatus, notes: "" });

  const filtered = state.reservations.filter((item) => {
    const searchValue = search.toLowerCase();
    const matchesSearch = !searchValue || item.clientName.toLowerCase().includes(searchValue) || item.id.toLowerCase().includes(searchValue);
    if (!matchesSearch) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (period === "today" && item.pickupDate !== "2026-03-16") return false;
    if (period === "week" && !["2026-03-16", "2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20", "2026-03-21", "2026-03-22"].includes(item.pickupDate)) return false;
    return true;
  });

  const selected = state.reservations.find((item) => item.id === selectedId) ?? filtered[0] ?? null;
  const selectedClient = state.clients.find((item) => item.id === form.clientId);
  const selectedEquipment = state.equipment.filter((item) => form.equipmentIds.includes(item.id));
  const days = Math.max(1, Math.ceil((new Date(`${form.returnDate}T12:00:00`).getTime() - new Date(`${form.pickupDate}T12:00:00`).getTime()) / 86400000));
  const totalValue = selectedEquipment.reduce((sum, item) => sum + item.dailyRate * days, 0);

  const reservationStats = useMemo(() => {
    const approved = state.reservations.filter((item) => item.status === "approved").length;
    const active = state.reservations.filter((item) => item.status === "in_progress").length;
    const quotes = state.reservations.filter((item) => item.status === "quote").length;
    const revenue = state.reservations.filter((item) => item.status !== "cancelled").reduce((sum, item) => sum + item.totalValue, 0);
    return { approved, active, quotes, revenue };
  }, [state.reservations]);

  const openEdit = (reservation: Reservation) => {
    setEditingId(reservation.id);
    setSelectedId(reservation.id);
    setForm({ clientId: reservation.clientId, equipmentIds: reservation.equipmentIds, pickupDate: reservation.pickupDate, returnDate: reservation.returnDate, status: reservation.status, notes: reservation.notes });
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!form.clientId || !form.pickupDate || !form.returnDate || !form.equipmentIds.length) return toast.error("Preencha cliente, periodo e equipamentos.");
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    const record = upsertReservation({ id: editingId ?? undefined, clientId: form.clientId, clientName: selectedClient?.name ?? "Cliente", equipmentIds: form.equipmentIds, equipment: selectedEquipment.map((item) => item.name), pickupDate: form.pickupDate, returnDate: form.returnDate, totalValue, status: form.status, notes: form.notes });
    setSelectedId(record.id);
    setEditorOpen(false);
    setEditingId(null);
    setSaving(false);
    toast.success("Reserva atualizada.");
  };

  const updateStatus = (reservation: Reservation, nextStatus: ReservationStatus) => {
    upsertReservation({ ...reservation, status: nextStatus });
    setSelectedId(reservation.id);
    toast.success(`Reserva ${reservation.id} atualizada para ${nextStatus}.`);
  };

  const cancelReservation = () => {
    if (!cancelTarget) return;
    upsertReservation({ ...cancelTarget, status: "cancelled" });
    toast.success(`Reserva ${cancelTarget.id} cancelada.`);
    setCancelTarget(null);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[28px] border border-border/50 bg-card px-6 py-7 premium-shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(202,157,45,0.18),_transparent_30%),linear-gradient(160deg,rgba(10,14,24,0.96),rgba(16,20,28,0.98))]" />
          <div className="absolute inset-0 hero-grid-bg opacity-30" />
          <div className="relative z-10 flex flex-col gap-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary"><Sparkles className="h-3.5 w-3.5" />Reservation Flow</div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">Reservas com leitura de pipeline, janela operacional e valor em jogo.</h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">Novas operacoes comerciais agora nascem no composer unico. Aqui voce acompanha e ajusta a reserva operacional.</p>
              </div>
              <div className="flex flex-wrap gap-3 self-start">
                <Button variant="gold" size="lg" onClick={() => navigate("/quotes/new")}><Plus className="h-4 w-4" />Nova proposta / reserva</Button>
                <Button variant="outline" size="lg" onClick={() => selected && openEdit(selected)} disabled={!selected}><Pencil className="h-4 w-4" />Editar reserva</Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[{ label: "Aprovadas", value: reservationStats.approved, helper: "aguardando operacao", icon: ReceiptText }, { label: "Em andamento", value: reservationStats.active, helper: "jobs ativos agora", icon: Radio }, { label: "Em orcamento", value: reservationStats.quotes, helper: "pedidos em decisao", icon: Clock3 }, { label: "Valor em pipeline", value: formatCurrency(reservationStats.revenue), helper: "reservas nao canceladas", icon: CalendarDays }].map((item, index) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * index }} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{item.label}</p><div className="rounded-xl bg-white/8 p-2 text-primary"><item.icon className="h-4 w-4" /></div></div>
                  <p className="font-display text-2xl font-bold text-white">{item.value}</p><p className="mt-1 text-xs text-white/55">{item.helper}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-6">
            <div className="glass-card p-4 premium-shadow">
              <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por cliente ou codigo..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ReservationStatus | "all")} className="h-10 rounded-xl border border-input bg-background px-3 text-sm">{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
                  <select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm"><option value="all">Todo periodo</option><option value="today">Retiradas de hoje</option><option value="week">Proximos 7 dias</option></select>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">{statuses.map((item) => <button key={item.value} type="button" onClick={() => setStatusFilter(item.value as ReservationStatus | "all")} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${statusFilter === item.value ? "border-primary/30 bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "border-border/60 bg-surface/50 text-muted-foreground hover:border-primary/20 hover:text-foreground"}`}>{item.label}</button>)}</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((reservation, index) => (
                <motion.button key={reservation.id} type="button" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} onClick={() => setSelectedId(reservation.id)} className={`group rounded-[24px] border p-5 text-left transition-all duration-300 ${selectedId === reservation.id ? "border-primary/30 bg-primary/6 premium-shadow-lg" : "border-border/60 bg-card premium-shadow hover:-translate-y-1 hover:border-primary/20 hover:premium-shadow-lg"}`}>
                  <div className="mb-4 flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{reservation.id}</p><h3 className="mt-2 text-lg font-semibold">{reservation.clientName}</h3></div><StatusBadge status={reservation.status} /></div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between gap-3"><span>Periodo</span><span className="font-medium text-foreground">{formatDate(reservation.pickupDate)} → {formatDate(reservation.returnDate)}</span></div>
                    <div className="flex items-center justify-between gap-3"><span>Itens</span><span className="font-medium text-foreground">{reservation.equipment.length}</span></div>
                    <div className="flex items-center justify-between gap-3"><span>Valor</span><span className="font-semibold gradient-gold-text">{formatCurrency(reservation.totalValue)}</span></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">{reservation.equipment.slice(0, 2).map((item) => <span key={item} className="rounded-full border border-border/60 bg-surface px-3 py-1 text-[11px] text-muted-foreground">{item}</span>)}{reservation.equipment.length > 2 && <span className="rounded-full border border-border/60 bg-surface px-3 py-1 text-[11px] text-muted-foreground">+{reservation.equipment.length - 2} itens</span>}</div>
                  <div className="mt-5 flex justify-end gap-2 opacity-70 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); setSelectedId(reservation.id); }}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); openEdit(reservation); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); setCancelTarget(reservation); }}><Ban className="h-4 w-4" /></Button>
                  </div>
                </motion.button>
              ))}
            </div>

            {filtered.length === 0 && <div className="glass-card p-14 premium-shadow text-center text-muted-foreground"><CalendarDays className="mx-auto mb-3 h-10 w-10 opacity-40" /><p className="text-sm font-medium">Nenhuma reserva encontrada</p><p className="mt-1 text-xs">Crie uma nova proposta no composer ou ajuste os filtros.</p></div>}
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 premium-shadow xl:sticky xl:top-8">
              {selected ? (
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4"><div><p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">Reserva selecionada</p><h3 className="text-2xl font-semibold">{selected.id}</h3><p className="text-sm text-muted-foreground">{selected.clientName}</p></div><StatusBadge status={selected.status} /></div>
                  <div className="rounded-2xl border border-border/60 bg-surface/40 p-4"><p className="mb-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">Pipeline</p><div className="space-y-3">{timeline.map((step, index) => { const stepReached = timeline.indexOf(selected.status) >= index || (selected.status === "cancelled" && step === "quote"); return <div key={step} className="flex items-center gap-3"><div className={`h-3 w-3 rounded-full ${stepReached ? "bg-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.12)]" : "bg-border"}`} /><span className={`text-sm ${stepReached ? "text-foreground" : "text-muted-foreground"}`}>{statuses.find((item) => item.value === step)?.label}</span>{index < timeline.length - 1 ? <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" /> : null}</div>; })}</div></div>
                  <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-border/60 bg-surface/40 p-4"><p className="text-xs text-muted-foreground">Periodo</p><p className="mt-1 text-sm font-medium">{formatDate(selected.pickupDate)}</p><p className="text-sm font-medium">{formatDate(selected.returnDate)}</p></div><div className="rounded-2xl border border-border/60 bg-surface/40 p-4"><p className="text-xs text-muted-foreground">Valor total</p><p className="mt-1 font-display text-2xl font-bold gradient-gold-text">{formatCurrency(selected.totalValue)}</p></div></div>
                  <div className="space-y-2"><p className="text-sm font-medium">Equipamentos</p><div className="flex flex-wrap gap-2">{selected.equipment.map((item) => <span key={item} className="rounded-full border border-border/60 bg-surface px-3 py-1 text-xs text-muted-foreground">{item}</span>)}</div></div>
                  <div className="space-y-2"><Label>Status rapido</Label><div className="grid grid-cols-2 gap-2">{statuses.filter((item) => item.value !== "all").map((item) => <Button key={item.value} variant="outline" size="sm" onClick={() => updateStatus(selected, item.value as ReservationStatus)}>{item.label}</Button>)}</div></div>
                  <div className="rounded-2xl border border-border/60 bg-surface/30 p-4"><p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Notas</p><p className="mt-2 text-sm text-muted-foreground">{selected.notes || "Sem observacoes."}</p></div>
                </div>
              ) : (
                <div className="py-8 text-center"><CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">Selecione uma reserva para visualizar a timeline.</p></div>
              )}
            </div>
          </div>
        </section>

        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="max-w-5xl glass-card premium-shadow-lg">
            <DialogHeader><DialogTitle>{editingId ? "Editar reserva" : "Reserva manual"}</DialogTitle><p className="text-sm text-muted-foreground">O fluxo comercial principal agora nasce no composer unico. Use esta janela para ajustes operacionais.</p></DialogHeader>
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-2"><Label>Cliente</Label><ClientSearchSelect clients={state.clients} value={form.clientId} onChange={(clientId) => setForm((current) => ({ ...current, clientId }))} /></div>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Status</Label><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ReservationStatus }))} className="h-10 rounded-xl border border-input bg-background px-3 text-sm w-full">{statuses.filter((item) => item.value !== "all").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                <div className="space-y-2"><Label>Data de retirada</Label><Input type="date" value={form.pickupDate} onChange={(event) => setForm((current) => ({ ...current, pickupDate: event.target.value }))} /></div>
                <div className="space-y-2"><Label>Data de devolucao</Label><Input type="date" value={form.returnDate} onChange={(event) => setForm((current) => ({ ...current, returnDate: event.target.value }))} /></div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Equipamentos</Label>
              <div className="grid sm:grid-cols-2 gap-2 max-h-56 overflow-auto rounded-2xl border border-border/60 p-3 bg-surface/40">
                {state.equipment.map((item) => {
                  const checked = form.equipmentIds.includes(item.id);
                  return (
                    <label key={item.id} className="flex items-start gap-3 rounded-xl border border-border/50 p-3 cursor-pointer hover:bg-surface">
                      <input type="checkbox" checked={checked} onChange={(event) => setForm((current) => ({ ...current, equipmentIds: event.target.checked ? [...current.equipmentIds, item.id] : current.equipmentIds.filter((equipmentId) => equipmentId !== item.id) }))} className="mt-1" />
                      <div className="min-w-0"><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{formatCurrency(item.dailyRate)} / dia • {item.status}</p></div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2"><Label>Observacoes</Label><Textarea rows={4} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><p className="text-sm font-medium mb-1">Resumo da reserva</p><p className="text-sm text-muted-foreground">{selectedEquipment.length} itens • {days} diaria(s)</p><p className="text-lg font-semibold gradient-gold-text mt-2">{formatCurrency(totalValue)}</p></div>
            <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setEditorOpen(false)}>Cancelar</Button><Button variant="gold" onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar reserva"}</Button></div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
          <AlertDialogContent className="glass-card premium-shadow-lg">
            <AlertDialogHeader><AlertDialogTitle>Cancelar reserva</AlertDialogTitle><AlertDialogDescription>A reserva continuara salva para relatorios, mas o status sera marcado como cancelado.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction onClick={cancelReservation}>Confirmar cancelamento</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
};

export default ReservationsPage;
