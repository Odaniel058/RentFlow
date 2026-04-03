import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  DollarSign,
  Eye,
  Film,
  FileText,
  KeyRound,
  Lock,
  Package,
  Play,
  RefreshCw,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const features = [
  {
    icon: Package,
    title: "Inventario Completo",
    desc: "Gerencie cameras, lentes, iluminacao, audio e acessorios com status em tempo real.",
  },
  {
    icon: CalendarDays,
    title: "Reservas e Agenda",
    desc: "Controle retiradas, devolucoes e disponibilidade com calendario visual.",
  },
  {
    icon: FileText,
    title: "Orcamentos e Contratos",
    desc: "Crie orcamentos profissionais, gere PDFs e converta em reservas.",
  },
  {
    icon: Users,
    title: "CRM de Clientes",
    desc: "Historico completo de clientes, empresas e produtoras.",
  },
  {
    icon: DollarSign,
    title: "Financeiro",
    desc: "Faturamento, receita prevista, cobrancas e indicadores em um so lugar.",
  },
  {
    icon: BarChart3,
    title: "Relatorios",
    desc: "Analises detalhadas por periodo com exportacao em PDF e CSV.",
  },
];

const steps = [
  {
    num: "01",
    title: "Cadastre seus equipamentos",
    desc: "Adicione cameras, lentes, iluminacao e acessorios ao inventario.",
  },
  {
    num: "02",
    title: "Receba solicitacoes",
    desc: "Crie orcamentos rapidos e converta em reservas aprovadas.",
  },
  {
    num: "03",
    title: "Gerencie a operacao",
    desc: "Acompanhe retiradas, devolucoes e manutencoes na agenda.",
  },
  {
    num: "04",
    title: "Acompanhe resultados",
    desc: "Veja faturamento, relatorios e metricas financeiras.",
  },
];

const benefits = [
  { icon: Zap, title: "Rapido e intuitivo", desc: "Interface moderna para equipes ageis." },
  { icon: Shield, title: "Seguro e confiavel", desc: "Dados isolados por locadora, acesso controlado." },
  { icon: Clock, title: "Economize tempo", desc: "Automacoes e fluxos que reduzem trabalho manual." },
  { icon: CheckCircle2, title: "Profissional", desc: "Orcamentos e contratos com visual premium." },
];

const testimonials = [
  {
    name: "Rodrigo Faria",
    role: "LuzAction Rentals",
    text: "O RentFlow ajudou a organizar agenda, inventario e operacao sem complicar o fluxo da equipe.",
  },
  {
    name: "Camila Dutra",
    role: "Studio Norte",
    text: "A rotina de orcamentos e acompanhamento dos clientes ficou muito mais clara e profissional.",
  },
  {
    name: "Marcos Aurelio",
    role: "Frame Rental",
    text: "A plataforma faz sentido para locadora. Nao e so bonita, ela ajuda no dia a dia mesmo.",
  },
];

const securityPillars = [
  {
    icon: Lock,
    title: "Criptografia SSL/TLS",
    desc: "Toda comunicacao entre voce e o servidor e protegida com criptografia de 256 bits, o mesmo padrao usado por bancos.",
  },
  {
    icon: ShieldCheck,
    title: "Conformidade LGPD",
    desc: "Plataforma desenvolvida seguindo os principios da Lei Geral de Protecao de Dados. Seus dados e os de seus clientes protegidos por lei.",
  },
  {
    icon: Server,
    title: "Dados isolados por empresa",
    desc: "Cada locadora opera em um workspace completamente isolado. Nenhuma informacao e compartilhada entre contas.",
  },
  {
    icon: KeyRound,
    title: "Controle de acesso",
    desc: "Permissoes por nivel de usuario, autenticacao segura e historico de acoes para rastreabilidade total da equipe.",
  },
  {
    icon: RefreshCw,
    title: "Backups automaticos diarios",
    desc: "Seus dados sao copiados automaticamente todos os dias. Em caso de qualquer incidente, a restauracao e rapida e completa.",
  },
  {
    icon: Eye,
    title: "Monitoramento 24/7",
    desc: "Infraestrutura monitorada continuamente com alertas automaticos. SLA de 99,9% de disponibilidade garantido por contrato.",
  },
];

const trustBadges = [
  { label: "LGPD Compliant" },
  { label: "SSL 256-bit" },
  { label: "Dados Isolados" },
  { label: "Backup Diario" },
  { label: "Uptime 99,9%" },
  { label: "Zero Compartilhamento" },
];

const faqs = [
  {
    q: "Preciso instalar alguma coisa?",
    a: "Nao. O RentFlow e 100% na nuvem. Acesse pelo navegador em qualquer computador, notebook ou tablet — sem instalacao, sem atualizacoes manuais.",
  },
  {
    q: "Meus dados e os dos meus clientes ficam seguros?",
    a: "Sim. Todos os dados sao criptografados com SSL 256-bit e armazenados em servidores seguros. Sua conta e completamente isolada de outras empresas. A plataforma segue os principios da LGPD.",
  },
  {
    q: "Posso migrar minha planilha ou sistema atual para o RentFlow?",
    a: "Sim. Nossa equipe oferece suporte na importacao de planilhas Excel e dados de sistemas legados. O onboarding guiado ajuda a cadastrar equipamentos e clientes rapidamente.",
  },
  {
    q: "Quantos usuarios posso ter na minha equipe?",
    a: "Depende do plano escolhido. O Starter comporta 1 usuario, o Business ate 5, e o Enterprise e ilimitado — ideal para equipes grandes com diferentes niveis de acesso.",
  },
  {
    q: "O que acontece quando os 14 dias de teste acabam?",
    a: "Voce escolhe o plano ideal e continua sem interrupcao. Se decidir nao assinar, seus dados ficam disponiveis para exportacao por 30 dias. Sem cobrancas surpresa.",
  },
  {
    q: "O sistema funciona para qualquer tipo de equipamento audiovisual?",
    a: "Sim. O RentFlow e flexivel para cameras, lentes, iluminacao, audio, drones, geradores, grip e qualquer categoria que voce precise cadastrar. As categorias sao totalmente personalizaveis.",
  },
  {
    q: "Tem suporte em portugues?",
    a: "Sim, todo o suporte e em portugues. O plano Starter tem suporte por e-mail, o Business por chat prioritario e o Enterprise tem gerente de conta dedicado com SLA garantido.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Nao ha fidelidade minima. Cancele quando quiser, sem multas ou taxas adicionais. Seus dados podem ser exportados a qualquer momento.",
  },
];

const plans = [
  {
    name: "Starter",
    icon: Package,
    price: { monthly: "197", annual: "157" },
    desc: "Para locadoras em fase inicial que querem organizar a operacao.",
    items: [
      "Ate 50 equipamentos cadastrados",
      "1 usuario",
      "Reservas e orcamentos",
      "Gestao de clientes",
      "Relatorios basicos em PDF",
      "Suporte por e-mail",
    ],
    cta: "Comecar gratis",
    highlighted: false,
    badge: null,
  },
  {
    name: "Business",
    icon: BarChart3,
    price: { monthly: "497", annual: "397" },
    desc: "Para operacoes em crescimento que precisam de mais controle e equipe.",
    items: [
      "Ate 300 equipamentos cadastrados",
      "Ate 5 usuarios",
      "Tudo do Starter",
      "Contratos com assinatura digital",
      "Gestao financeira completa",
      "Relatorios avancados e exportacao",
      "Agenda e calendario visual",
      "Suporte prioritario por chat",
    ],
    cta: "Comecar gratis",
    highlighted: true,
    badge: "Mais popular",
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: { monthly: null, annual: null },
    desc: "Para grandes locadoras com multiplas equipes e necessidades customizadas.",
    items: [
      "Equipamentos ilimitados",
      "Usuarios ilimitados",
      "Tudo do Business",
      "Integracoes customizadas",
      "Gerente de conta dedicado",
      "SLA 99,9% de uptime",
      "Onboarding personalizado",
      "Suporte 24/7 com SLA garantido",
    ],
    cta: "Falar com especialista",
    highlighted: false,
    badge: null,
  },
];

const heroStats = [
  { label: "Inventario", value: "156 itens" },
  { label: "Reservas", value: "48 ativas" },
  { label: "Ticket medio", value: "R$ 950" },
  { label: "Faturamento", value: "R$ 45.600" },
];

const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const duration = 1400;
        const start = performance.now();

        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setCount(Math.round(to * ease));
          if (p < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.45 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
};

const FloatingParticle = ({ delay, x, size }: { delay: number; x: number; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/20 pointer-events-none"
    style={{ width: size, height: size, left: `${x}%`, bottom: "-10px" }}
    animate={{ y: [0, -620], opacity: [0, 0.55, 0] }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: "linear" }}
  />
);

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const reduceMotion = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, reduceMotion ? 0 : -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, reduceMotion ? 1 : 0.2]);
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [billingAnnual, setBillingAnnual] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4200);
    return () => window.clearInterval(interval);
  }, []);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
      <motion.div className="scroll-progress-bar" style={{ scaleX: progressScale, transformOrigin: "0% 50%" }} />

      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="nav-shell">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="brand-badge">
                <Film className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-base tracking-tight">RentFlow</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Funcionalidades
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Como funciona
              </a>
              <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Para Locadoras
              </a>
              <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Seguranca
              </a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Precos
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  Entrar
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-xl gradient-gold text-primary-foreground hover:opacity-90">
                  Criar conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 gradient-cinematic" />
        <div className="absolute inset-0 hero-grid-bg opacity-60" />
        <div className="absolute inset-0 hero-radial-fade" />
        <div className="absolute inset-x-0 top-0 h-[38rem] cinematic-beam opacity-70" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 18 }).map((_, i) => (
            <FloatingParticle key={i} delay={i * 0.4} x={5 + i * 5} size={2 + (i % 4)} />
          ))}
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 pb-24 pt-32 sm:px-6 lg:grid-cols-[1.02fr_0.98fr]"
        >
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary"
            >
              <Sparkles className="h-3 w-3" />
              Plataforma para locadoras audiovisuais
            </motion.div>

            <motion.h1
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 font-display text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl"
            >
              Gerencie sua locadora
              <span className="block gradient-gold-text">audiovisual em um so lugar</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.65 }}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl"
            >
              Controle inventario, reservas, clientes e faturamento com um sistema feito para locadoras de equipamentos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.55 }}
              className="mt-9 flex flex-col gap-4 sm:flex-row"
            >
              <Link to="/signup">
                <Button size="lg" className="h-14 rounded-2xl px-8 text-base gradient-gold text-primary-foreground hover:opacity-90">
                  Criar conta da locadora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-14 rounded-2xl border-white/15 bg-white/5 px-8 text-base text-white hover:bg-white/10">
                  <Play className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
              </Link>
            </motion.div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm text-white/70">
              {[
                { icon: Shield, text: "Dados seguros" },
                { icon: Zap, text: "Fluxo agil" },
                { icon: Clock, text: "Menos trabalho manual" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <Icon className="h-4 w-4 text-primary" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="hero-dashboard-shell"
          >
            <div className="hero-dashboard-glow" />
            <div className="hero-dashboard-header">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-primary/80">Dashboard preview</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">Visao geral da locadora</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                operacao em andamento
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {heroStats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + index * 0.08, duration: 0.45 }}
                  className="dashboard-panel"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="dashboard-panel dashboard-panel-large mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Performance</p>
                  <p className="mt-2 text-3xl font-semibold text-white">Resumo operacional</p>
                </div>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>

              <div className="mt-6 space-y-4">
                {[76, 54, 88, 63].map((value, index) => (
                  <div key={index} className="dashboard-bar-row">
                    <span className="w-24 text-xs text-white/50">Indicador {index + 1}</span>
                    <div className="dashboard-bar-track">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ delay: 0.85 + index * 0.08, duration: 0.7 }}
                        className="dashboard-bar-fill"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/45">
          <motion.div animate={reduceMotion ? undefined : { y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-surface/70 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-4">
          {[
            { value: 156, suffix: "", label: "equipamentos cadastrados" },
            { value: 48, suffix: "", label: "reservas em andamento" },
            { value: 950, suffix: "", label: "ticket medio" },
            { value: 45600, suffix: "", label: "faturamento de referencia" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="stat-column"
            >
              <p className="font-display text-4xl font-bold gradient-gold-text">
                {item.label === "faturamento de referencia" ? "R$ " : ""}
                <Counter to={item.value} suffix={item.label === "ticket medio" ? "" : ""} />
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="features" className="py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Tudo que sua locadora precisa</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ferramentas completas para gerenciar equipamentos, clientes e operacao.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="feature-premium-card"
              >
                <div className="feature-premium-orb" />
                <div className="feature-icon-wrap">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-surface/50 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Como funciona</h2>
            <p className="text-muted-foreground text-lg">Quatro passos para digitalizar sua locadora.</p>
          </motion.div>

          <div className="workflow-shell">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="workflow-card"
              >
                <div className="workflow-step">{step.num}</div>
                <h3 className="mt-6 font-display text-2xl font-bold tracking-tight">{step.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Feito para locadoras</h2>
            <p className="text-muted-foreground text-lg">O sistema que entende o dia a dia da sua operacao.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="feature-premium-card text-center"
              >
                <div className="feature-icon-wrap mx-auto">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-border/50 bg-surface/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Quem usa no dia a dia</h2>
            <p className="text-muted-foreground text-lg">Feedback de quem vive a operacao de locacao.</p>
          </motion.div>

          <div className="relative min-h-[18rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.45 }}
                className="testimonial-stage"
              >
                <div className="flex justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mt-8 font-display text-2xl md:text-4xl tracking-tight">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <p className="mt-8 text-base font-semibold">{testimonials[activeTestimonial].name}</p>
                <p className="mt-1 text-sm uppercase tracking-[0.16em] text-muted-foreground">
                  {testimonials[activeTestimonial].role}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((item, index) => (
              <button
                key={item.name}
                onClick={() => setActiveTestimonial(index)}
                className={index === activeTestimonial ? "testimonial-dot active" : "testimonial-dot"}
                aria-label={`Ver depoimento ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="py-24 border-t border-border/50 bg-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary mb-6">
              <ShieldCheck className="h-3 w-3" />
              Seguranca e conformidade
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Seus dados protegidos.<br className="hidden sm:block" /> Nossa responsabilidade.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Empresas grandes confiam no RentFlow porque seguranca nao e opcional. E a base de tudo que construimos.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {securityPillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="flex gap-4 rounded-2xl border border-border/60 bg-background/60 p-6 hover:border-primary/30 transition-colors duration-200"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <pillar.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold tracking-tight mb-2">{pillar.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{pillar.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border/60 bg-background/60 p-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold uppercase tracking-widest text-primary">Certificacoes e garantias</span>
                </div>
                <h3 className="font-display text-2xl font-bold tracking-tight mb-2">
                  Conformidade que empresas grandes exigem
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  Atendemos os requisitos de seguranca e privacidade necessarios para operar com produtoras, emissoras e grandes empresas do setor audiovisual.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {trustBadges.map((badge) => (
                  <div
                    key={badge.label}
                    className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5"
                  >
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-xs font-semibold tracking-wide">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="pricing" className="py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Planos para cada tamanho de operacao</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comece gratis por 14 dias. Sem cartao de credito. Cancele quando quiser.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-border bg-surface/60 p-1.5">
              <button
                onClick={() => setBillingAnnual(false)}
                className={`rounded-xl px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  !billingAnnual
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingAnnual(true)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  billingAnnual
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Anual
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-500">
                  -20%
                </span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? "border-primary/60 bg-primary/5 shadow-[0_0_40px_-8px_hsl(var(--primary)/0.3)]"
                    : "border-border/60 bg-surface/50 hover:border-border"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full gradient-gold px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.highlighted ? "gradient-gold" : "bg-muted"}`}>
                    <plan.icon className={`h-5 w-5 ${plan.highlighted ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.desc}</p>
                  </div>
                </div>

                <div className="mb-8">
                  {plan.price.monthly ? (
                    <div className="flex items-end gap-1">
                      <span className="text-sm text-muted-foreground mt-1">R$</span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={billingAnnual ? "annual" : "monthly"}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="font-display text-5xl font-bold tracking-tight"
                        >
                          {billingAnnual ? plan.price.annual : plan.price.monthly}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-sm text-muted-foreground mb-1">/mes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-display text-3xl font-bold tracking-tight">Sob consulta</span>
                    </div>
                  )}
                  {billingAnnual && plan.price.annual && (
                    <p className="mt-1 text-xs text-green-500 font-medium">
                      Voce economiza R$ {(Number(plan.price.monthly) - Number(plan.price.annual)) * 12}/ano
                    </p>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-8">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.name === "Enterprise" ? "/signup" : "/signup"}>
                  <Button
                    size="lg"
                    className={`w-full h-12 rounded-2xl text-sm font-semibold ${
                      plan.highlighted
                        ? "gradient-gold text-primary-foreground hover:opacity-90"
                        : "border border-border bg-background hover:bg-muted"
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center text-sm text-muted-foreground"
          >
            Todos os planos incluem 14 dias gratis sem necessidade de cartao de credito.{" "}
            <a href="#" className="text-primary underline-offset-4 hover:underline">
              Ver todos os detalhes dos planos
            </a>
          </motion.p>
        </div>
      </section>

      <section id="faq" className="py-24 border-t border-border/50 bg-surface/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Perguntas frequentes</h2>
            <p className="text-muted-foreground text-lg">
              Tire suas duvidas antes de comecar. Se nao encontrar o que precisa, fale com a gente.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="rounded-2xl border border-border/60 bg-background/60 px-6 data-[state=open]:border-primary/40 transition-colors duration-200"
                >
                  <AccordionTrigger className="py-5 text-left font-semibold hover:no-underline hover:text-primary transition-colors [&[data-state=open]]:text-primary">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12 text-center rounded-2xl border border-border/60 bg-background/60 p-8"
          >
            <p className="font-semibold mb-1">Ainda tem duvidas?</p>
            <p className="text-sm text-muted-foreground mb-5">
              Nossa equipe responde em ate 2 horas uteis. Fale com a gente diretamente.
            </p>
            <Link to="/signup">
              <Button variant="outline" className="rounded-xl border-primary/40 text-primary hover:bg-primary/5">
                Entrar em contato
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="cta-shell">
            <div className="cta-glow" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                Comece agora gratuitamente
              </h2>
              <p className="mt-5 text-lg text-white/70 max-w-xl mx-auto">
                Crie sua conta e teste o RentFlow. Sem compromisso, sem cartao de credito.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" className="gradient-gold text-primary-foreground hover:opacity-90 px-10 h-12 text-base">
                    Criar conta da locadora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="h-12 px-8 border-white/15 bg-white/5 text-white hover:bg-white/10">
                    Entrar
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 bg-surface/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-gold flex items-center justify-center">
              <Film className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">RentFlow</span>
          </div>
          <p className="text-xs text-muted-foreground">(c) 2026 RentFlow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
