import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  CalendarCheck,
  CreditCard,
  DollarSign,
  Download,
  TrendingUp,
  Sparkles,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { KPICard } from "@/components/KPICard";
import { useAppData } from "@/contexts/AppDataContext";
import { formatCurrency } from "@/lib/format";
import { downloadCsv } from "@/lib/export";
import { Button } from "@/components/ui/button";

const FinancialPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, analytics } = useAppData();
  const [view, setView] = useState<"monthly" | "annual">("monthly");

  const pendingReservations = useMemo(
    () => state.reservations.filter((reservation) => reservation.status === "approved" || reservation.status === "in_progress"),
    [state.reservations],
  );

  const chartData = useMemo(() => {
    if (view === "annual") {
      return analytics.monthlyRevenue.map((item) => ({
        ...item,
        month: item.month,
        revenue: Math.round(item.revenue * 1.8),
        projected: Math.round(item.projected * 1.75),
      }));
    }
    return analytics.monthlyRevenue;
  }, [analytics.monthlyRevenue, view]);

  const outstandingTotal = pendingReservations.reduce((sum, reservation) => sum + Math.round(reservation.totalValue * 0.25), 0);

  const today = new Date().toISOString().slice(0, 10);

  const agingBuckets = useMemo(() => {
    const active = state.reservations.filter((r) => r.status !== "cancelled" && r.status !== "completed");
    const buckets = [
      { label: "A vencer", sublabel: "Retorno futuro", colorText: "text-green-500",  colorBg: "bg-green-500",  amount: 0, count: 0 },
      { label: "1 – 30 dias",  sublabel: "Atenção",        colorText: "text-yellow-500", colorBg: "bg-yellow-500", amount: 0, count: 0 },
      { label: "31 – 60 dias", sublabel: "Urgente",         colorText: "text-orange-500", colorBg: "bg-orange-500", amount: 0, count: 0 },
      { label: "61+ dias",     sublabel: "Crítico",         colorText: "text-red-500",    colorBg: "bg-red-500",    amount: 0, count: 0 },
    ];
    active.forEach((r) => {
      const overdue = Math.floor((new Date(today).getTime() - new Date(r.returnDate).getTime()) / 86_400_000);
      const v = r.totalValue;
      if (overdue <= 0)       { buckets[0].amount += v; buckets[0].count++; }
      else if (overdue <= 30) { buckets[1].amount += v; buckets[1].count++; }
      else if (overdue <= 60) { buckets[2].amount += v; buckets[2].count++; }
      else                    { buckets[3].amount += v; buckets[3].count++; }
    });
    return buckets;
  }, [state.reservations, today]);

  const agingTotal = agingBuckets.reduce((sum, b) => sum + b.amount, 0);

  const exportFinanceCsv = () => {
    downloadCsv(
      "financeiro-rentflow.csv",
      ["Reserva", "Cliente", "Status", "Valor", "Retirada", "Devolução"],
      pendingReservations.map((reservation) => [
        reservation.id,
        reservation.clientName,
        reservation.status,
        reservation.totalValue,
        reservation.pickupDate,
        reservation.returnDate,
      ]),
    );
  };

  const financeMoments = [
    { title: "Cobranças quentes", value: pendingReservations.length, helper: "pedem acompanhamento hoje", icon: AlertCircle },
    { title: "Ticket premium", value: formatCurrency(analytics.kpis.averageTicket), helper: "média por reserva ativa", icon: Wallet },
    { title: "Aprovadas", value: analytics.kpis.approvedReservations, helper: "geram caixa em breve", icon: CalendarCheck },
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[28px] border border-border/50 bg-card px-6 py-7 premium-shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(202,157,45,0.16),_transparent_28%),linear-gradient(160deg,rgba(13,17,27,0.96),rgba(17,20,28,0.98))]" />
          <div className="absolute inset-0 hero-grid-bg opacity-30" />

          <div className="relative z-10 flex flex-col gap-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Finance Command
                </div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Financeiro com leitura executiva, projeção viva e cobranças acionáveis.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                  Saia do modo tabela. Veja fluxo, previsão e urgência comercial em uma interface mais clara para decisões rápidas.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
                  <div className="relative flex">
                    {[
                      { value: "monthly", label: "Visão mensal" },
                      { value: "annual", label: "Visão anual" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setView(option.value as "monthly" | "annual")}
                        className={`relative z-10 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                          view === option.value ? "text-primary-foreground" : "text-white/65 hover:text-white"
                        }`}
                      >
                        {view === option.value && (
                          <motion.span
                            layoutId="finance-view-pill"
                            className="absolute inset-0 rounded-xl gradient-gold"
                            transition={{ type: "spring", stiffness: 360, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={exportFinanceCsv}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {financeMoments.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * index }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{item.title}</p>
                    <div className="rounded-xl bg-white/8 p-2 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="font-display text-2xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-white/55">{item.helper}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KPICard icon={DollarSign} title="Faturamento mensal" value={formatCurrency(analytics.kpis.monthlyRevenue)} change="+12%" changeType="positive" subtitle="vs. mês anterior" index={0} />
          <KPICard icon={TrendingUp} title="Receita prevista" value={formatCurrency(analytics.kpis.projectedRevenue)} change="projeção dinâmica" changeType="neutral" index={1} />
          <KPICard icon={CreditCard} title="Ticket médio" value={formatCurrency(analytics.kpis.averageTicket)} change="+5%" changeType="positive" index={2} />
          <KPICard icon={AlertCircle} title="Valor em aberto" value={formatCurrency(analytics.kpis.outstandingAmount)} change={`${pendingReservations.length} cobranças`} changeType="negative" index={3} onClick={() => navigate("/reservations")} />
          <KPICard icon={CalendarCheck} title="Reservas aprovadas" value={String(analytics.kpis.approvedReservations)} change="+3 este mês" changeType="positive" index={4} onClick={() => navigate("/reservations")} />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 premium-shadow">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Aging de recebíveis</h3>
              <p className="text-sm text-muted-foreground">Distribuição do valor em aberto por faixa de vencimento da devolução.</p>
            </div>
            <div className="rounded-full border border-border/60 bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground shrink-0">
              {formatCurrency(agingTotal)} total
            </div>
          </div>

          {/* Stacked bar */}
          {agingTotal > 0 && (
            <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-6">
              {agingBuckets.filter((b) => b.amount > 0).map((b) => (
                <div
                  key={b.label}
                  className={`${b.colorBg} opacity-75 transition-all duration-500`}
                  style={{ width: `${(b.amount / agingTotal) * 100}%` }}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {agingBuckets.map((b) => (
              <div key={b.label} className="rounded-2xl border border-border/50 bg-surface/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${b.colorBg}`} />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{b.label}</p>
                </div>
                <div>
                  <p className={`text-xl font-bold ${b.amount > 0 ? b.colorText : "text-muted-foreground/40"}`}>
                    {formatCurrency(b.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.count} reserva{b.count !== 1 ? "s" : ""} · {b.sublabel}
                  </p>
                </div>
                <div className="h-1 rounded-full bg-border/40">
                  <div
                    className={`h-1 rounded-full ${b.colorBg} transition-all duration-700`}
                    style={{ width: agingTotal > 0 ? `${(b.amount / agingTotal) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 premium-shadow">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Receita realizada</h3>
                  <p className="text-sm text-muted-foreground">Leitura limpa do comportamento de caixa em {view === "monthly" ? "meses recentes" : "escala anualizada"}.</p>
                </div>
                <div className="rounded-full border border-border/60 bg-surface px-3 py-1 text-xs text-muted-foreground">
                  {view === "monthly" ? "Atual" : "Annualizado"}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={310}>
                <BarChart data={chartData} barCategoryGap={22}>
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--primary) / 0.07)", radius: 18 }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const value = Number(payload[0]?.value ?? 0);
                      return (
                        <div className="glass-card min-w-[150px] p-3 premium-shadow-lg">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                          <p className="mt-2 text-lg font-semibold gradient-gold-text">{formatCurrency(value)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">receita consolidada</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="revenue" radius={[12, 12, 4, 4]} maxBarSize={46}>
                    {chartData.map((entry) => (
                      <Cell key={entry.month} fill={entry.revenue >= entry.projected ? "hsl(var(--gold-light))" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-card p-6 premium-shadow">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Linha de projeção</h3>
                  <p className="text-sm text-muted-foreground">Realizado vs. previsto com menos ruído visual e foco nos desvios relevantes.</p>
                </div>
                <div className="rounded-full border border-border/60 bg-surface px-3 py-1 text-xs text-muted-foreground">
                  atualizado agora
                </div>
              </div>

              <ResponsiveContainer width="100%" height={310}>
                <LineChart data={chartData}>
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const revenue = Number(payload[0]?.value ?? 0);
                      const projected = Number(payload[1]?.value ?? 0);
                      return (
                        <div className="glass-card min-w-[180px] p-3 premium-shadow-lg">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">Realizado</span>
                              <span className="font-semibold">{formatCurrency(revenue)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">Previsto</span>
                              <span className="font-semibold">{formatCurrency(projected)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 5, fill: "hsl(var(--gold-light))", strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="projected" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="6 6" dot={{ r: 2.5, fill: "hsl(var(--muted-foreground))", strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="glass-card p-6 premium-shadow">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Cobranças em aberto</h3>
                  <p className="text-sm text-muted-foreground">Itens que pedem follow-up financeiro e logístico.</p>
                </div>
                <div className="rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                  {formatCurrency(outstandingTotal)}
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {pendingReservations.map((reservation, index) => (
                    <motion.button
                      key={reservation.id}
                      type="button"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => navigate("/reservations")}
                      className="group w-full rounded-2xl border border-border/50 bg-surface/60 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-surface premium-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">{reservation.clientName}</p>
                          <p className="text-xs text-muted-foreground">{reservation.id} • {reservation.equipment.join(", ")}</p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                      <div className="mt-4 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Parcela estimada</p>
                          <p className="font-semibold gradient-gold-text">{formatCurrency(Math.round(reservation.totalValue * 0.25))}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {reservation.status === "approved" ? "Aguardando retirada" : "Em andamento"}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default FinancialPage;
