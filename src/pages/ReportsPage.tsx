import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertCircle, CalendarCheck, CheckCircle2, CreditCard, DollarSign, Download, FileText, XCircle } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { KPICard } from "@/components/KPICard";
import { useAppData } from "@/contexts/AppDataContext";
import { formatCurrency } from "@/lib/format";
import { downloadCsv } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ReportsPage: React.FC = () => {
  const { state, analytics } = useAppData();
  const [period, setPeriod] = useState("current");

  const reservations = useMemo(() => {
    if (period === "annual") return state.reservations;
    if (period === "feb") return state.reservations.filter((reservation) => reservation.pickupDate.startsWith("2026-02"));
    if (period === "mar") return state.reservations.filter((reservation) => reservation.pickupDate.startsWith("2026-03"));
    return state.reservations.filter((reservation) => reservation.pickupDate.startsWith("2026-03"));
  }, [period, state.reservations]);

  const revenue = reservations.filter((reservation) => reservation.status !== "cancelled").reduce((sum, reservation) => sum + reservation.totalValue, 0);
  const averageTicket = reservations.length ? Math.round(revenue / reservations.length) : 0;
  const completed = reservations.filter((reservation) => reservation.status === "completed").length;
  const cancelled = reservations.filter((reservation) => reservation.status === "cancelled").length;
  const outstanding = reservations.filter((reservation) => reservation.status === "approved" || reservation.status === "in_progress").reduce((sum, reservation) => sum + reservation.totalValue * 0.25, 0);

  const exportCsv = () => {
    downloadCsv(
      "relatorio-rentflow.csv",
      ["Reserva", "Cliente", "Status", "Valor", "Retirada", "Devolução"],
      reservations.map((reservation) => [reservation.id, reservation.clientName, reservation.status, reservation.totalValue, reservation.pickupDate, reservation.returnDate]),
    );
  };

  const exportPdf = () => {
    toast.success("Relatório pronto para exportação em PDF. Use as métricas e gráficos desta tela como base visual.");
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-sm text-muted-foreground mt-1">Indicadores por período, comparação visual e exportações.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportPdf}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <FileText className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="glass-card p-4 premium-shadow">
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "current", label: "Mês atual" },
              { value: "feb", label: "Fevereiro" },
              { value: "mar", label: "Março" },
              { value: "annual", label: "Anual" },
            ].map((item) => (
              <Button key={item.value} variant={period === item.value ? "default" : "outline"} size="sm" onClick={() => setPeriod(item.value)} className={period === item.value ? "gradient-gold text-primary-foreground" : ""}>
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard icon={DollarSign} title="Faturamento" value={formatCurrency(revenue)} change="+12%" changeType="positive" index={0} />
          <KPICard icon={CalendarCheck} title="Reservas" value={String(reservations.length)} change="+8" changeType="positive" index={1} />
          <KPICard icon={CreditCard} title="Ticket médio" value={formatCurrency(averageTicket)} index={2} />
          <KPICard icon={AlertCircle} title="Em aberto" value={formatCurrency(Math.round(outstanding))} changeType="negative" index={3} />
          <KPICard icon={CheckCircle2} title="Concluídas" value={String(completed)} change="Operação entregue" changeType="positive" index={4} />
          <KPICard icon={XCircle} title="Canceladas" value={String(cancelled)} change="Acompanhe o churn" changeType="negative" index={5} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 premium-shadow">
            <h3 className="text-sm font-semibold mb-4">Faturamento por mês</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 premium-shadow">
            <h3 className="text-sm font-semibold mb-4">Status das reservas</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={analytics.reservationStatus} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                  {analytics.reservationStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} reservas`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {analytics.reservationStatus.map((status) => (
                <div key={status.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ background: status.fill }} />
                  <span className="text-muted-foreground">{status.name}: {status.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 premium-shadow">
          <h3 className="text-sm font-semibold mb-4">Equipamentos mais alugados</h3>
          <div className="space-y-3">
            {analytics.equipmentUsage.map((equipment, index) => (
              <div key={equipment.name} className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-6">#{index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{equipment.name}</span>
                    <span className="text-xs text-muted-foreground">{equipment.count} locações</span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-1.5">
                    <div className="h-1.5 rounded-full gradient-gold" style={{ width: `${(equipment.count / Math.max(1, analytics.equipmentUsage[0]?.count ?? 1)) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold gradient-gold-text min-w-[88px] text-right">{formatCurrency(Math.round(equipment.revenue))}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ReportsPage;
