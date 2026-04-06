import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertCircle, CalendarCheck, CheckCircle2, CreditCard, DollarSign, Download, FileText, XCircle, TrendingUp, ArrowUpRight } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { KPICard } from "@/components/KPICard";
import { useAppData } from "@/contexts/AppDataContext";
import { formatCurrency } from "@/lib/format";
import { downloadCsv, downloadReportPdf } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 border-border/60 text-xs">
      <p className="text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? formatCurrency(p.value) : p.value}</p>
      ))}
    </div>
  );
};

const ReportsPage: React.FC = () => {
  const { state, analytics } = useAppData();
  const [period, setPeriod] = useState("current");

  const reservations = useMemo(() => {
    if (period === "annual") return state.reservations;
    if (period === "feb") return state.reservations.filter((r) => r.pickupDate.startsWith("2026-02"));
    if (period === "mar") return state.reservations.filter((r) => r.pickupDate.startsWith("2026-03"));
    return state.reservations.filter((r) => r.pickupDate.startsWith("2026-03"));
  }, [period, state.reservations]);

  const revenue = reservations.filter((r) => r.status !== "cancelled").reduce((sum, r) => sum + r.totalValue, 0);
  const averageTicket = reservations.length ? Math.round(revenue / reservations.length) : 0;
  const completed = reservations.filter((r) => r.status === "completed").length;
  const cancelled = reservations.filter((r) => r.status === "cancelled").length;
  const outstanding = reservations.filter((r) => r.status === "approved" || r.status === "in_progress").reduce((sum, r) => sum + r.totalValue * 0.25, 0);

  const exportCsv = () => {
    downloadCsv(
      "relatorio-rentflow.csv",
      ["Reserva", "Cliente", "Status", "Valor", "Retirada", "Devolucao"],
      reservations.map((r) => [r.id, r.clientName, r.status, r.totalValue, r.pickupDate, r.returnDate]),
    );
  };

  const periodLabels: Record<string, string> = {
    current: "Marco 2026",
    feb: "Fevereiro 2026",
    mar: "Marco 2026",
    annual: "Anual 2026",
  };

  const exportPdf = async () => {
    const toastId = toast.loading("Gerando PDF...");
    try {
      await downloadReportPdf({
        periodLabel: periodLabels[period] ?? period,
        reservations,
        settings: state.settings,
        kpis: { revenue, count: reservations.length, averageTicket, outstanding: Math.round(outstanding), completed, cancelled },
        monthlyRevenue: analytics.monthlyRevenue,
        reservationStatus: analytics.reservationStatus,
        equipmentUsage: analytics.equipmentUsage,
      });
      toast.success("PDF gerado com sucesso.", { id: toastId });
    } catch {
      toast.error("Erro ao gerar o PDF. Tente novamente.", { id: toastId });
    }
  };

  const topEq = analytics.equipmentUsage[0];
  const topEquipPercent = topEq ? Math.round((topEq.count / Math.max(1, analytics.equipmentUsage[0]?.count ?? 1)) * 100) : 0;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-surface/80 to-background p-6 sm:p-8"
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-1">Relatorios e indicadores</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Visao analitica da operacao</h1>
              <p className="text-sm text-muted-foreground mt-1">Compare periodos, avalie tendencias e exporte dados.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportCsv} className="rounded-xl gap-1.5">
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportPdf} className="rounded-xl gap-1.5 gradient-gold text-primary-foreground border-0">
                <Download className="h-4 w-4" /> PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Period filter with animated pill */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-4 premium-shadow">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { value: "current", label: "Mes atual" },
              { value: "feb", label: "Fevereiro" },
              { value: "mar", label: "Marco" },
              { value: "annual", label: "Anual" },
            ].map((item) => (
              <motion.button
                key={item.value}
                onClick={() => setPeriod(item.value)}
                className={`relative px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${period === item.value ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {period === item.value && (
                  <motion.div layoutId="report-period-pill" className="absolute inset-0 gradient-gold rounded-xl" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span>{periodLabels[period]}</span>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { icon: DollarSign, title: "Faturamento", value: formatCurrency(revenue), change: "+12%", changeType: "positive" as const },
              { icon: CalendarCheck, title: "Reservas", value: String(reservations.length), change: "+8", changeType: "positive" as const },
              { icon: CreditCard, title: "Ticket medio", value: formatCurrency(averageTicket) },
              { icon: AlertCircle, title: "Em aberto", value: formatCurrency(Math.round(outstanding)), changeType: "negative" as const },
              { icon: CheckCircle2, title: "Concluidas", value: String(completed), change: "Operacao entregue", changeType: "positive" as const },
              { icon: XCircle, title: "Canceladas", value: String(cancelled), change: "Acompanhe o churn", changeType: "negative" as const },
            ].map((kpi, i) => (
              <KPICard key={kpi.title} icon={kpi.icon} title={kpi.title} value={kpi.value} change={kpi.change} changeType={kpi.changeType} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 premium-shadow">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-sm">Faturamento por mes</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Receita mensal acumulada</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-lg gradient-gold-text">{formatCurrency(analytics.monthlyRevenue.reduce((s, d) => s + d.revenue, 0))}</p>
                <p className="text-xs text-success">Total acumulado</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.monthlyRevenue} barSize={32}>
                <defs>
                  <linearGradient id="repBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(43,90%,62%)" />
                    <stop offset="100%" stopColor="hsl(43,70%,38%)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--primary)/0.06)", radius: 6 }} />
                <Bar dataKey="revenue" fill="url(#repBarGrad)" radius={[6, 6, 0, 0]} name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 premium-shadow flex flex-col">
            <div className="mb-2">
              <h3 className="font-display font-semibold text-sm">Status das reservas</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Distribuicao atual</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={analytics.reservationStatus} innerRadius={55} outerRadius={82} paddingAngle={4} dataKey="value" stroke="none">
                  {analytics.reservationStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} reservas`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              {analytics.reservationStatus.map((status) => (
                <div key={status.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: status.fill }} />
                  <span className="text-muted-foreground">{status.name}: {status.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Equipment ranking */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6 premium-shadow">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-sm">Equipamentos mais alugados</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Ranking por numero de locacoes</p>
            </div>
            {topEq && (
              <div className="flex items-center gap-2 text-xs">
                <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">Top 1:</span>
                <span className="font-semibold">{topEq.name}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {analytics.equipmentUsage.map((equipment, index) => (
                <motion.div
                  key={equipment.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.04, duration: 0.35 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 rounded-xl px-2 py-2 transition-colors hover:bg-surface/50"
                >
                  <span className="text-xs text-muted-foreground/60 w-6 text-right">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{equipment.name}</span>
                      <span className="text-xs text-muted-foreground">{equipment.count} locacoes</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-2 rounded-full gradient-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${(equipment.count / Math.max(1, analytics.equipmentUsage[0]?.count ?? 1)) * 100}%` }}
                        transition={{ delay: 0.4 + index * 0.05, duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold gradient-gold-text min-w-[88px] text-right">{formatCurrency(Math.round(equipment.revenue))}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ReportsPage;
