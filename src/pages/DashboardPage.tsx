import React, { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Area, AreaChart } from "recharts";
import { AlertCircle, ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarCheck, Clock, CreditCard, DollarSign, Plus, Sparkles, TrendingUp, Wrench } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { ActivityFeed } from "@/components/ActivityFeed";
import { useAppData } from "@/contexts/AppDataContext";
import { formatCurrency, formatDate } from "@/lib/format";
import { getActivityLog } from "@/lib/activityLog";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/MagneticButton";
import { toast } from "sonner";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return <div className="glass-card px-3 py-2.5 border-border/60 premium-shadow text-xs"><p className="text-muted-foreground mb-1 font-medium">{label}</p>{payload.map((p: any) => <p key={p.name} className="font-semibold" style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? formatCurrency(p.value) : p.value}</p>)}</div>;
};

const periodOptions = [{ value: "month", label: "Mes" }, { value: "quarter", label: "Trimestre" }, { value: "year", label: "Ano" }];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, analytics } = useAppData();
  const { user } = useAuth();
  const [period, setPeriod] = useState("month");

  const [recentActivity, setRecentActivity] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!user?.tenantId) return;
    getActivityLog(user.tenantId).then((log) => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      setRecentActivity(new Set(log.filter(e => new Date(e.timestamp).getTime() > twoHoursAgo).map(e => e.entity)));
    });
  }, [user?.tenantId]);

  // Confetti on first visit of the session (only if there's revenue)
  useEffect(() => {
    if (sessionStorage.getItem('rf-confetti-fired')) return;
    if (analytics.kpis.monthlyRevenue <= 0) return;
    const timer = setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.25, x: 0.65 },
        colors: ['#C8A234', '#E8C468', '#9A7420', '#FFD700', '#F5CC60'],
        shapes: ['circle', 'square'],
        scalar: 0.9,
      });
      sessionStorage.setItem('rf-confetti-fired', '1');
    }, 1400);
    return () => clearTimeout(timer);
  }, [analytics.kpis.monthlyRevenue]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  const todayPickups = state.agendaEvents.filter((event) => event.date === todayStr && event.type === "pickup");
  const todayReturns = state.agendaEvents.filter((event) => event.date === todayStr && event.type === "return");
  const upcomingRes = state.reservations.filter((reservation) => reservation.status === "approved").slice(0, 4);
  const maintenanceEq = state.equipment.filter((equipment) => equipment.status === "maintenance");
  const chartData = useMemo(() => period === "quarter" ? analytics.monthlyRevenue.slice(-3) : period === "year" ? analytics.monthlyRevenue : analytics.monthlyRevenue.slice(-6), [analytics.monthlyRevenue, period]);

  return (
    <PageTransition>
      <div className="space-y-7">
        {/* ── Page Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="section-eyebrow mb-2">
              <Sparkles className="h-3 w-3" />
              Operação em tempo real
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1 text-pretty">
              Visão geral da locadora — reservas, receita e atividade recente.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ label: "Nova proposta", path: "/quotes/new" }, { label: "Clientes", path: "/clients" }, { label: "Reservas", path: "/reservations" }].map(({ label, path }) => (
              <MagneticButton key={label} strength={20}>
                <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 border-border/60 hover:border-primary/25" onClick={() => navigate(path)}>
                  <Plus className="h-3.5 w-3.5" />{label}
                </Button>
              </MagneticButton>
            ))}
            <MagneticButton strength={25}>
              <Button size="sm" className="gradient-gold text-primary-foreground border-0 rounded-xl text-xs gap-1.5 gold-glow" onClick={() => navigate("/inventory")}>
                <Plus className="h-3.5 w-3.5" />Novo equipamento
              </Button>
            </MagneticButton>
          </div>
        </div>

        {/* ── Hoje ── */}
        <div className="grid lg:grid-cols-2 gap-5">
          {[
            { title: "Retiradas hoje", icon: ArrowUpRight, iconCls: "icon-bg-info", events: todayPickups, empty: "Nenhuma retirada hoje.", path: "/calendar" },
            { title: "Devoluções hoje", icon: ArrowDownLeft, iconCls: "icon-bg-success", events: todayReturns, empty: "Nenhuma devolução hoje.", path: "/calendar" },
          ].map(({ title, icon: Icon, iconCls, events, empty, path }) => (
            <motion.button key={title} type="button"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              whileHover={{ y: -3 }}
              onClick={() => navigate(path)}
              className="glass-card p-6 premium-shadow text-left hover:premium-shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${iconCls}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="font-display font-semibold text-sm">{title}</h3>
                  {events.length > 0 && (
                    <span className="text-[10px] font-bold bg-primary/12 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                      {events.length}
                    </span>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/35 group-hover:text-primary/60 transition-colors" />
              </div>
              <div className="space-y-2">
                {events.length ? events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-surface/60 border border-border/35 premium-row">
                    <div>
                      <p className="text-sm font-semibold">{event.clientName}</p>
                      <p className="text-xs text-muted-foreground/70 truncate max-w-[200px]">{event.equipment.join(", ")}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-xs text-muted-foreground mb-1">{event.time}</p>
                      <StatusBadge status={event.status} />
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground/60 py-6 text-center">{empty}</p>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* ── Reservas + Manutenção ── */}
        <div className="grid lg:grid-cols-2 gap-5">
          <motion.button type="button"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            whileHover={{ y: -3 }}
            onClick={() => navigate("/reservations")}
            className="glass-card p-6 premium-shadow text-left hover:premium-shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl border icon-bg-gold">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <h3 className="font-display font-semibold text-sm">Próximas reservas</h3>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/35 group-hover:text-primary/60 transition-colors" />
            </div>
            <div className="space-y-2">
              {upcomingRes.length ? upcomingRes.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 rounded-xl bg-surface/60 border border-border/35 premium-row">
                  <div>
                    <p className="text-sm font-semibold">{reservation.clientName}</p>
                    <p className="text-xs text-muted-foreground/70">{formatDate(reservation.pickupDate)} → {formatDate(reservation.returnDate)}</p>
                  </div>
                  <span className="text-sm font-bold gradient-gold-text flex-shrink-0 ml-3">{formatCurrency(reservation.totalValue)}</span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground/60 py-6 text-center">Sem reservas aprovadas.</p>
              )}
            </div>
          </motion.button>

          <motion.button type="button"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            whileHover={{ y: -3 }}
            onClick={() => { navigate("/inventory"); toast.success("Itens em manutenção destacados no inventário."); }}
            className="glass-card p-6 premium-shadow text-left hover:premium-shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl border icon-bg-warning">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <h3 className="font-display font-semibold text-sm">Manutenção</h3>
                {maintenanceEq.length > 0 && (
                  <span className="text-[10px] font-bold bg-warning/12 text-warning border border-warning/22 px-2 py-0.5 rounded-full">
                    {maintenanceEq.length}
                  </span>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/35 group-hover:text-warning/60 transition-colors" />
            </div>
            <div className="space-y-2">
              {maintenanceEq.length ? maintenanceEq.map((equipment) => (
                <div key={equipment.id} className="flex items-center justify-between p-3 rounded-xl bg-surface/60 border border-border/35 premium-row">
                  <div>
                    <p className="text-sm font-semibold">{equipment.name}</p>
                    <p className="text-xs text-muted-foreground/70">{equipment.brand} · {equipment.category}</p>
                  </div>
                  <StatusBadge status="maintenance" />
                </div>
              )) : (
                <p className="text-sm text-muted-foreground/60 py-6 text-center">Nenhum equipamento em manutenção.</p>
              )}
            </div>
          </motion.button>
        </div>

        {/* ── Period picker ── */}
        <div className="flex items-center gap-2">
          <span className="section-eyebrow">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/70 inline-block" />
            Período
          </span>
          <div className="flex items-center gap-1 p-1 bg-surface/70 rounded-xl w-fit border border-border/40"
            style={{ boxShadow: 'inset 0 1px 0 hsl(0 0% 100%/0.04)' }}
          >
            {periodOptions.map(({ value, label }) => (
              <motion.button key={value} onClick={() => setPeriod(value)}
                className={`relative px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  period === value ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {period === value && (
                  <motion.div layoutId="period-pill"
                    className="absolute inset-0 gradient-gold rounded-lg"
                    style={{ boxShadow: '0 2px 10px hsl(var(--gold)/0.3)' }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard icon={DollarSign} title="Faturamento" value={formatCurrency(analytics.kpis.monthlyRevenue)} change="+12%" changeType="positive" subtitle="vs. mês ant." index={0} accent="success" onClick={() => navigate("/finance")} hasRecentActivity={recentActivity.has("quote") || recentActivity.has("reservation")} />
          <KPICard icon={TrendingUp} title="Receita prevista" value={formatCurrency(analytics.kpis.projectedRevenue)} change="Projeção dinâmica" changeType="neutral" index={1} accent="info" onClick={() => navigate("/reports")} />
          <KPICard icon={CreditCard} title="Ticket médio" value={formatCurrency(analytics.kpis.averageTicket)} change="+5%" changeType="positive" subtitle="por reserva" index={2} accent="gold" onClick={() => navigate("/finance")} />
          <KPICard icon={CalendarCheck} title="Reservas" value={String(analytics.kpis.approvedReservations)} change="+3" changeType="positive" subtitle="em aberto" index={3} accent="info" onClick={() => navigate("/reservations")} hasRecentActivity={recentActivity.has("reservation")} />
          <KPICard icon={AlertCircle} title="Em aberto" value={formatCurrency(analytics.kpis.outstandingAmount)} change="pendente" changeType="negative" index={4} accent="danger" onClick={() => navigate("/finance")} />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2 glass-card p-6 premium-shadow card-accent-gold">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="section-eyebrow mb-1"><span className="w-1.5 h-1.5 rounded-full bg-primary/70 inline-block mr-1" />Faturamento mensal</p>
                <p className="text-xs text-muted-foreground/60">Receita por período</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-xl gradient-gold-text">{formatCurrency(analytics.kpis.monthlyRevenue)}</p>
                <p className="text-xs text-success mt-0.5 font-medium">↑ 12% este mês</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={28}>
                <defs>
                  <linearGradient id="goldBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(43,90%,62%)" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(43,70%,38%)" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--primary)/0.06)", radius: 6 }} />
                <Bar dataKey="revenue" fill="url(#goldBarGradient)" radius={[6, 6, 0, 0]} name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 premium-shadow flex flex-col card-accent-info">
            <div className="mb-4">
              <p className="section-eyebrow mb-1"><span className="w-1.5 h-1.5 rounded-full bg-info/70 inline-block mr-1" />Reservas por status</p>
              <p className="text-xs text-muted-foreground/60">Distribuição atual</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={analytics.reservationStatus} innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value" stroke="none">{analytics.reservationStatus.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}</Pie>
                <Tooltip formatter={(value: number) => `${value} reservas`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1.5 mt-auto">{analytics.reservationStatus.map((status) => <div key={status.name} className="flex items-center gap-1.5 text-xs"><div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: status.fill }} /><span className="text-muted-foreground truncate">{status.name}: {status.value}</span></div>)}</div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6 premium-shadow card-accent-success">
          <div className="flex items-center gap-4 mb-5">
            <div>
              <p className="section-eyebrow mb-1"><span className="w-1.5 h-1.5 rounded-full bg-success/70 inline-block mr-1" />Receita prevista vs realizada</p>
              <p className="text-xs text-muted-foreground/60">Comparativo mensal do ano</p>
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block rounded" />Realizado</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-muted-foreground/50 inline-block rounded border-dashed" />Previsto</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.monthlyRevenue}>
              <defs>
                <linearGradient id="areaGoldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43,85%,55%)" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="hsl(43,85%,55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(43,85%,55%)" strokeWidth={2.5} fill="url(#areaGoldGradient)" dot={{ fill: "hsl(43,85%,55%)", r: 3, strokeWidth: 0 }} name="Realizado" />
              <Line type="monotone" dataKey="projected" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} strokeDasharray="6 4" name="Previsto" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 premium-shadow">
          <div className="mb-5">
            <p className="section-eyebrow mb-1"><span className="availability-dot live inline-block mr-1.5" />Atividade recente</p>
            <p className="text-xs text-muted-foreground/60">Histórico de ações realizadas no sistema</p>
          </div>
          <ActivityFeed limit={8} />
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;
