import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  FileText,
  Film,
  KeyRound,
  Lock,
  Menu,
  Package,
  RefreshCw,
  Server,
  Shield,
  ShieldCheck,
  Star,
  Users,
  X,
  Zap,
  Clock,
  Building2,
  Camera,
  Mic,
  Lightbulb,
  Aperture,
  Radio,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BackToTop } from "@/components/BackToTop";
import { UnboxingHero } from "@/components/Hero/UnboxingHero";

/* ─── Data ─── */

const features = [
  {
    icon: Package,
    title: "Inventário Completo",
    desc: "Gerencie câmeras, lentes, iluminação, áudio e acessórios com status em tempo real e histórico de uso.",
  },
  {
    icon: CalendarDays,
    title: "Reservas e Agenda",
    desc: "Controle retiradas, devoluções e disponibilidade com calendário visual intuitivo.",
  },
  {
    icon: DollarSign,
    title: "Financeiro Integrado",
    desc: "Orçamentos, faturamento, receita prevista e indicadores financeiros em um só lugar.",
  },
];

const steps = [
  {
    num: "01",
    title: "Cadastre seus equipamentos",
    desc: "Adicione câmeras, lentes, iluminação e acessórios ao inventário com todas as informações técnicas.",
  },
  {
    num: "02",
    title: "Receba solicitações",
    desc: "Crie orçamentos profissionais em minutos e converta em reservas aprovadas.",
  },
  {
    num: "03",
    title: "Gerencie a operação",
    desc: "Acompanhe retiradas, devoluções e manutenções na agenda visual integrada.",
  },
  {
    num: "04",
    title: "Acompanhe resultados",
    desc: "Veja faturamento, relatórios detalhados e métricas financeiras em tempo real.",
  },
];

const equipment = [
  {
    icon: Camera,
    name: "Câmeras Cinema",
    category: "Câmeras",
    gradient: "linear-gradient(135deg, #1c2a3a 0%, #0d1a2a 100%)",
    accent: "#0071E3",
  },
  {
    icon: Aperture,
    name: "Lentes Esféricas",
    category: "Óptica",
    gradient: "linear-gradient(135deg, #1a1a24 0%, #0f0f18 100%)",
    accent: "#636366",
  },
  {
    icon: Lightbulb,
    name: "Iluminação LED",
    category: "Luz",
    gradient: "linear-gradient(135deg, #1f1a0a 0%, #140f00 100%)",
    accent: "#FF9F0A",
  },
  {
    icon: Mic,
    name: "Sistemas de Áudio",
    category: "Áudio",
    gradient: "linear-gradient(135deg, #0a1a1a 0%, #001212 100%)",
    accent: "#30D158",
  },
  {
    icon: Radio,
    name: "Drones & Aéreo",
    category: "Aéreo",
    gradient: "linear-gradient(135deg, #1a0a1a 0%, #120012 100%)",
    accent: "#BF5AF2",
  },
  {
    icon: Package,
    name: "Grip & Suporte",
    category: "Grip",
    gradient: "linear-gradient(135deg, #1a1218 0%, #120c10 100%)",
    accent: "#FF375F",
  },
];

const testimonials = [
  {
    name: "Rodrigo Faria",
    role: "LuzAction Rentals",
    stars: 5,
    text: "O RentFlow organizou nossa agenda, inventário e operação sem complicar o fluxo da equipe.",
  },
  {
    name: "Camila Dutra",
    role: "Studio Norte",
    stars: 5,
    text: "A rotina de orçamentos e acompanhamento dos clientes ficou muito mais clara e profissional.",
  },
  {
    name: "Marcos Aurélio",
    role: "Frame Rental",
    stars: 5,
    text: "A plataforma faz sentido para locadora. Não é só bonita, ela ajuda no dia a dia mesmo.",
  },
];

const securityPillars = [
  { icon: Lock, title: "Criptografia SSL/TLS", desc: "Comunicação protegida com 256 bits — padrão bancário." },
  { icon: ShieldCheck, title: "Conformidade LGPD", desc: "Desenvolvido segundo os princípios da Lei Geral de Proteção de Dados." },
  { icon: Server, title: "Dados isolados", desc: "Cada locadora opera em workspace completamente separado." },
  { icon: KeyRound, title: "Controle de acesso", desc: "Permissões por nível de usuário e histórico de ações." },
  { icon: RefreshCw, title: "Backups diários", desc: "Cópias automáticas todos os dias. Restauração rápida e completa." },
  { icon: Eye, title: "Monitoramento 24/7", desc: "Infraestrutura monitorada continuamente. SLA 99,9% garantido." },
];

const trustBadges = ["LGPD Compliant", "SSL 256-bit", "Dados Isolados", "Backup Diário", "Uptime 99,9%"];

const faqs = [
  {
    q: "Preciso instalar alguma coisa?",
    a: "Não. O RentFlow é 100% na nuvem. Acesse pelo navegador em qualquer computador, notebook ou tablet — sem instalação, sem atualizações manuais.",
  },
  {
    q: "Meus dados e os dos meus clientes ficam seguros?",
    a: "Sim. Todos os dados são criptografados com SSL 256-bit e armazenados em servidores seguros. Sua conta é completamente isolada de outras empresas. A plataforma segue os princípios da LGPD.",
  },
  {
    q: "Posso migrar minha planilha atual para o RentFlow?",
    a: "Sim. Nossa equipe oferece suporte na importação de planilhas Excel e dados de sistemas legados. O onboarding guiado ajuda a cadastrar equipamentos e clientes rapidamente.",
  },
  {
    q: "Quantos usuários posso ter na minha equipe?",
    a: "Depende do plano. O Starter comporta 1 usuário, o Business até 5, e o Enterprise é ilimitado — ideal para equipes grandes.",
  },
  {
    q: "O que acontece quando os 14 dias de teste acabam?",
    a: "Você escolhe o plano e continua sem interrupção. Se decidir não assinar, seus dados ficam disponíveis para exportação por 30 dias. Sem cobranças surpresa.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Não há fidelidade mínima. Cancele quando quiser, sem multas ou taxas adicionais.",
  },
];

const plans = [
  {
    name: "Starter",
    icon: Package,
    price: { monthly: "197", annual: "157" },
    desc: "Para locadoras em fase inicial.",
    items: [
      "Até 50 equipamentos",
      "1 usuário",
      "Reservas e orçamentos",
      "Gestão de clientes",
      "Relatórios básicos em PDF",
      "Suporte por e-mail",
    ],
    cta: "Começar grátis",
    highlighted: false,
    badge: null,
  },
  {
    name: "Business",
    icon: BarChart3,
    price: { monthly: "497", annual: "397" },
    desc: "Para operações em crescimento.",
    items: [
      "Até 300 equipamentos",
      "Até 5 usuários",
      "Tudo do Starter",
      "Contratos com assinatura digital",
      "Gestão financeira completa",
      "Relatórios avançados e exportação",
      "Agenda e calendário visual",
      "Suporte prioritário por chat",
    ],
    cta: "Começar grátis",
    highlighted: true,
    badge: "Mais popular",
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: { monthly: null, annual: null },
    desc: "Para grandes locadoras com múltiplas equipes.",
    items: [
      "Equipamentos ilimitados",
      "Usuários ilimitados",
      "Tudo do Business",
      "Integrações customizadas",
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

/* ─── Counting animation ─── */
const Counter: React.FC<{ to: number; prefix?: string; suffix?: string }> = ({ to, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
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
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString("pt-BR")}{suffix}
    </span>
  );
};

/* ─── Fade-in wrapper ─── */
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.65, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ─── Main Page ─── */
const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const reduceMotion = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  /* Auto-rotate testimonials */
  useEffect(() => {
    const id = window.setInterval(
      () => setActiveTestimonial((p) => (p + 1) % testimonials.length),
      4500,
    );
    return () => window.clearInterval(id);
  }, []);

  /* Lock scroll when mobile menu open */
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileMenuOpen]);

  /* Step scroll activation */
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const observers = stepRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(i); },
        { threshold: 0.5 },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const navLinks = [
    { href: "#features", label: "Funcionalidades" },
    { href: "#how-it-works", label: "Como funciona" },
    { href: "#showcase", label: "Equipamentos" },
    { href: "#security", label: "Segurança" },
    { href: "#faq", label: "FAQ" },
    { href: "#pricing", label: "Preços" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-white overflow-x-hidden" style={{ color: "#1D1D1F" }}>
      {/* ── Scroll progress bar ── */}
      <motion.div
        className="scroll-progress-bar"
        style={{ scaleX: progressScale, transformOrigin: "0% 50%" }}
      />

      {/* ══════════════════════════════════════════════════════ NAV */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 inset-x-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="nav-shell">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="brand-badge">
                <Film className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-base tracking-tight" style={{ color: "#1D1D1F", fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}>
                RentFlow
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm transition-colors"
                  style={{ color: "#6e6e73", fontFamily: "system-ui, sans-serif" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#1D1D1F")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6e6e73")}
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-full text-sm" style={{ color: "#1D1D1F" }}>
                  Entrar
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  size="sm"
                  className="rounded-full text-sm font-medium px-5"
                  style={{ background: "#0071E3", color: "#fff", border: "none" }}
                >
                  Criar conta
                </Button>
              </Link>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl"
              onClick={() => setMobileMenuOpen((p) => !p)}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-x-4 top-[88px] z-50 md:hidden"
              style={{
                borderRadius: 24,
                border: "1px solid #E8E8ED",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(20px)",
                padding: "16px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              }}
            >
              <div className="space-y-1">
                {navLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl px-4 py-3 text-sm transition"
                    style={{ color: "#1D1D1F" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="mt-4 grid gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="h-11 w-full rounded-2xl text-sm">Entrar</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="h-11 w-full rounded-2xl text-sm" style={{ background: "#0071E3", color: "#fff", border: "none" }}>
                    Criar conta
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════ HERO (Scroll-driven unboxing) */}
      <UnboxingHero />

      {/* ══════════════════════════════════════════════════════ STATS STRIP */}
      <section className="ap-stats-strip py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { prefix: "", value: 420, suffix: "+", label: "Locadoras ativas" },
              { prefix: "", value: 32000, suffix: "+", label: "Equipamentos gerenciados" },
              { prefix: "", value: 99, suffix: ",9%", label: "Uptime garantido" },
              { prefix: "14", value: 0, suffix: " dias", label: "Teste grátis" },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.07} className="stat-column">
                <p
                  className="text-4xl font-semibold"
                  style={{ color: "#1D1D1F", fontFamily: "system-ui, -apple-system, 'Inter', sans-serif", letterSpacing: "-0.025em" }}
                >
                  {stat.value > 0 ? (
                    <Counter to={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  ) : (
                    `${stat.prefix}${stat.suffix}`
                  )}
                </p>
                <p className="mt-1.5 text-sm" style={{ color: "#6e6e73" }}>{stat.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ FEATURES */}
      <section id="features" className="py-28" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="text-center mb-16">
            <p className="text-sm font-medium mb-3" style={{ color: "#0071E3", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Funcionalidades
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light"
              style={{ color: "#1D1D1F", letterSpacing: "-0.025em", lineHeight: 1.08, fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}
            >
              Tudo que sua locadora precisa.
            </h2>
            <p className="mt-5 text-lg max-w-xl mx-auto" style={{ color: "#6e6e73", lineHeight: 1.55 }}>
              Ferramentas completas pensadas para o dia a dia das locadoras audiovisuais.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div className="ap-feature-card h-full">
                  <div className="ap-feature-icon">
                    <f.icon className="h-5 w-5" style={{ color: "#0071E3" }} />
                  </div>
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: "#1D1D1F", fontFamily: "system-ui, -apple-system, 'Inter', sans-serif", letterSpacing: "-0.015em" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6e6e73" }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ HOW IT WORKS */}
      <section id="how-it-works" className="py-28" style={{ background: "#F5F5F7" }}>
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="text-center mb-20">
            <p className="text-sm font-medium mb-3" style={{ color: "#0071E3", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Como funciona
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light"
              style={{ color: "#1D1D1F", letterSpacing: "-0.025em", lineHeight: 1.08, fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}
            >
              Quatro passos para digitalizar<br className="hidden sm:block" /> sua locadora.
            </h2>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Steps list with progress line */}
            <div className="hiw-track relative pl-16 space-y-8">
              <div
                className="hiw-progress"
                style={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
              />
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  ref={(el) => { stepRefs.current[i] = el; }}
                  className="flex gap-5 items-start"
                >
                  <div
                    className={`hiw-step-num ${activeStep >= i ? "active" : ""}`}
                    style={{ marginTop: 2, marginLeft: -48 - 24 }}
                  >
                    {step.num}
                  </div>
                  <motion.div
                    animate={{ opacity: activeStep >= i ? 1 : 0.4 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <h3
                      className="text-xl font-semibold mb-2"
                      style={{ color: "#1D1D1F", fontFamily: "system-ui, -apple-system, 'Inter', sans-serif", letterSpacing: "-0.015em" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6e6e73" }}>{step.desc}</p>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Visual summary card */}
            <FadeIn delay={0.2}>
              <div
                style={{
                  borderRadius: 24,
                  border: "1px solid #E8E8ED",
                  background: "#fff",
                  padding: "2.5rem",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                <p className="text-xs font-medium mb-5" style={{ color: "#0071E3", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Visão geral
                </p>
                <div className="space-y-4">
                  {[
                    { label: "Equipamentos registrados", value: 156, color: "#0071E3" },
                    { label: "Taxa de ocupação", value: 78, color: "#30D158" },
                    { label: "Orçamentos aprovados", value: 92, color: "#FF9F0A" },
                    { label: "Satisfação dos clientes", value: 97, color: "#BF5AF2" },
                  ].map(({ label, value, color }, i) => (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm" style={{ color: "#6e6e73" }}>{label}</span>
                        <span className="text-sm font-medium" style={{ color: "#1D1D1F" }}>{value}{label.includes("registrados") ? "" : "%"}</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 99, background: "#F5F5F7" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${label.includes("registrados") ? 78 : value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                          style={{ height: "100%", borderRadius: 99, background: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6" style={{ borderTop: "1px solid #F5F5F7" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs" style={{ color: "#aeaeb2" }}>Faturamento do mês</p>
                      <p className="text-2xl font-semibold mt-0.5" style={{ color: "#1D1D1F", letterSpacing: "-0.02em" }}>R$ 45.600</p>
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        borderRadius: 8,
                        background: "rgba(48,209,88,0.1)",
                        padding: "4px 10px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#30D158",
                      }}
                    >
                      ↑ 18%
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ EQUIPMENT SHOWCASE */}
      <section id="showcase" className="py-28" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="text-center mb-16">
            <p className="text-sm font-medium mb-3" style={{ color: "#0071E3", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Equipamentos
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light"
              style={{ color: "#1D1D1F", letterSpacing: "-0.025em", lineHeight: 1.08, fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}
            >
              Gerencie todo tipo de gear.
            </h2>
            <p className="mt-5 text-lg max-w-lg mx-auto" style={{ color: "#6e6e73" }}>
              Câmeras, lentes, luz, áudio, drones — tudo em um inventário organizado.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((item, i) => (
              <FadeIn key={item.name} delay={i * 0.07}>
                <div className="ap-equip-card">
                  <div className="equip-img-wrap" style={{ background: item.gradient }}>
                    <div className="ap-equip-img w-full h-full flex items-center justify-center" style={{ minHeight: 160 }}>
                      <div style={{ position: "relative" }}>
                        <item.icon
                          style={{ color: item.accent, width: 48, height: 48, opacity: 0.9 }}
                          strokeWidth={1.25}
                        />
                        <div
                          aria-hidden
                          style={{
                            position: "absolute",
                            inset: -20,
                            borderRadius: "50%",
                            background: `radial-gradient(circle, ${item.accent}22 0%, transparent 70%)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
                    <p className="font-medium text-sm" style={{ color: "#1D1D1F" }}>{item.name}</p>
                    <p
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        marginTop: 4,
                        borderRadius: 6,
                        background: "#F5F5F7",
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#6e6e73",
                      }}
                    >
                      {item.category}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ TESTIMONIALS */}
      <section className="py-28" style={{ background: "#F5F5F7" }}>
        <div className="mx-auto max-w-4xl px-6">
          <FadeIn className="text-center mb-12">
            <h2
              className="text-4xl sm:text-5xl font-light"
              style={{ color: "#1D1D1F", letterSpacing: "-0.025em", lineHeight: 1.08, fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}
            >
              Quem usa no dia a dia.
            </h2>
          </FadeIn>

          <div className="relative" style={{ minHeight: 260 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="ap-testimonial"
              >
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: testimonials[activeTestimonial].stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4" style={{ fill: "#FF9F0A", color: "#FF9F0A" }} />
                  ))}
                </div>
                <p
                  className="text-xl sm:text-2xl font-light"
                  style={{ color: "#1D1D1F", letterSpacing: "-0.015em", lineHeight: 1.45, fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}
                >
                  "{testimonials[activeTestimonial].text}"
                </p>
                <p className="mt-6 font-semibold text-sm" style={{ color: "#1D1D1F" }}>
                  {testimonials[activeTestimonial].name}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "#aeaeb2", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {testimonials[activeTestimonial].role}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length)}
              aria-label="Depoimento anterior"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "1px solid #E8E8ED", background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ChevronLeft className="h-4 w-4" style={{ color: "#6e6e73" }} />
            </motion.button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`testimonial-dot${i === activeTestimonial ? " active" : ""}`}
                  aria-label={`Ver depoimento ${i + 1}`}
                />
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setActiveTestimonial((p) => (p + 1) % testimonials.length)}
              aria-label="Próximo depoimento"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "1px solid #E8E8ED", background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ChevronRight className="h-4 w-4" style={{ color: "#6e6e73" }} />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ SECURITY */}
      <section id="security" className="py-28" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="text-center mb-16">
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                borderRadius: 99, border: "1px solid rgba(0,113,227,0.2)",
                background: "rgba(0,113,227,0.06)", padding: "5px 14px",
                fontSize: 11, fontWeight: 600, color: "#0071E3",
                letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16,
              }}
            >
              <ShieldCheck className="h-3 w-3" />
              Segurança e conformidade
            </div>
            <h2
              className="text-4xl sm:text-5xl font-light"
              style={{ color: "#1D1D1F", letterSpacing: "-0.025em", lineHeight: 1.08, fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}
            >
              Seus dados protegidos.<br className="hidden sm:block" /> Nossa responsabilidade.
            </h2>
            <p className="mt-5 text-lg max-w-xl mx-auto" style={{ color: "#6e6e73" }}>
              Segurança de nível bancário para que você foque no que importa.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {securityPillars.map((pillar, i) => (
              <FadeIn key={pillar.title} delay={i * 0.07}>
                <div
                  style={{
                    borderRadius: 16, border: "1px solid #E8E8ED",
                    background: "#FAFAFA", padding: "1.5rem",
                    display: "flex", gap: "1rem", alignItems: "flex-start",
                    transition: "border-color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,113,227,0.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E8E8ED")}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "rgba(0,113,227,0.08)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <pillar.icon className="h-4.5 w-4.5" style={{ width: 18, height: 18, color: "#0071E3" }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: "#1D1D1F" }}>{pillar.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "#6e6e73" }}>{pillar.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div
              style={{
                borderRadius: 20, border: "1px solid #E8E8ED",
                background: "#FAFAFA", padding: "2rem",
                display: "flex", flexWrap: "wrap", gap: "1.5rem",
                alignItems: "center", justifyContent: "space-between",
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" style={{ color: "#0071E3" }} />
                  <span className="text-xs font-semibold" style={{ color: "#0071E3", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Certificações & Garantias
                  </span>
                </div>
                <p className="font-semibold" style={{ color: "#1D1D1F" }}>
                  Conformidade que empresas grandes exigem
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {trustBadges.map((badge) => (
                  <div key={badge} className="security-badge">
                    <Check className="h-3 w-3" style={{ color: "#0071E3" }} />
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ PRICING */}
      <section id="pricing" className="py-28" style={{ background: "#F5F5F7" }}>
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="text-center mb-12">
            <h2
              className="text-4xl sm:text-5xl font-light mb-5"
              style={{ color: "#1D1D1F", letterSpacing: "-0.025em", lineHeight: 1.08, fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}
            >
              Simples e transparente.
            </h2>
            <p className="text-lg mb-8" style={{ color: "#6e6e73" }}>
              14 dias grátis. Sem cartão de crédito. Cancele quando quiser.
            </p>

            {/* Billing toggle */}
            <div className="billing-toggle">
              <button
                onClick={() => setBillingAnnual(false)}
                className={`billing-toggle-btn ${!billingAnnual ? "active" : ""}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingAnnual(true)}
                className={`billing-toggle-btn ${billingAnnual ? "active" : ""}`}
              >
                Anual
                <span
                  style={{
                    marginLeft: 6, borderRadius: 6,
                    background: "rgba(48,209,88,0.15)", padding: "1px 7px",
                    fontSize: 11, fontWeight: 700, color: "#30D158",
                  }}
                >
                  −20%
                </span>
              </button>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {plans.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.1}>
                <div className={`ap-plan-card${plan.highlighted ? " highlighted" : ""} h-full`}>
                  {plan.badge && (
                    <div
                      style={{
                        display: "inline-block", borderRadius: 99,
                        background: "#0071E3", color: "#fff",
                        padding: "3px 12px", fontSize: 11, fontWeight: 600,
                        marginBottom: 16, letterSpacing: "0.04em",
                      }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-5">
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: plan.highlighted ? "#0071E3" : "#F5F5F7",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <plan.icon
                        className="h-5 w-5"
                        style={{ color: plan.highlighted ? "#fff" : "#6e6e73" }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: "#1D1D1F" }}>{plan.name}</h3>
                      <p className="text-xs" style={{ color: "#aeaeb2" }}>{plan.desc}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    {plan.price.monthly ? (
                      <div className="flex items-end gap-1">
                        <span className="text-sm" style={{ color: "#aeaeb2", marginBottom: 4 }}>R$</span>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={billingAnnual ? "a" : "m"}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.18 }}
                            style={{
                              fontSize: 48, fontWeight: 600, lineHeight: 1,
                              letterSpacing: "-0.03em", color: "#1D1D1F",
                              fontFamily: "system-ui, -apple-system, 'Inter', sans-serif",
                            }}
                          >
                            {billingAnnual ? plan.price.annual : plan.price.monthly}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-sm mb-1" style={{ color: "#aeaeb2" }}>/mês</span>
                      </div>
                    ) : (
                      <p className="text-2xl font-semibold" style={{ color: "#1D1D1F" }}>Sob consulta</p>
                    )}
                    {billingAnnual && plan.price.annual && (
                      <p className="text-xs mt-1" style={{ color: "#30D158", fontWeight: 600 }}>
                        Economia de R$ {(Number(plan.price.monthly) - Number(plan.price.annual)) * 12}/ano
                      </p>
                    )}
                  </div>

                  <ul className="flex-1 space-y-2.5 mb-7">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check
                          className="h-4 w-4 mt-0.5 shrink-0"
                          style={{ color: plan.highlighted ? "#0071E3" : "#30D158" }}
                        />
                        <span className="text-sm" style={{ color: "#6e6e73", lineHeight: 1.45 }}>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="w-full h-11 rounded-2xl text-sm font-medium"
                      style={
                        plan.highlighted
                          ? { background: "#0071E3", color: "#fff", border: "none" }
                          : { background: "transparent", border: "1px solid #E8E8ED", color: "#1D1D1F" }
                      }
                    >
                      {plan.cta}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ FAQ */}
      <section id="faq" className="py-28" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-2xl px-6">
          <FadeIn className="text-center mb-14">
            <h2
              className="text-4xl sm:text-5xl font-light mb-5"
              style={{ color: "#1D1D1F", letterSpacing: "-0.025em", lineHeight: 1.08, fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}
            >
              Perguntas frequentes.
            </h2>
            <p className="text-lg" style={{ color: "#6e6e73" }}>
              Tire suas dúvidas antes de começar.
            </p>
          </FadeIn>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <AccordionItem
                  value={`faq-${i}`}
                  style={{
                    borderRadius: 16, border: "1px solid #E8E8ED",
                    background: "#FAFAFA", paddingLeft: "1.25rem", paddingRight: "1.25rem",
                    overflow: "hidden",
                  }}
                  className="data-[state=open]:border-[rgba(0,113,227,0.3)]"
                >
                  <AccordionTrigger
                    className="py-4 text-left hover:no-underline text-sm font-medium"
                    style={{ color: "#1D1D1F" }}
                  >
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed" style={{ color: "#6e6e73" }}>
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </FadeIn>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ CTA */}
      <section className="py-28" style={{ background: "#F5F5F7" }}>
        <div className="mx-auto max-w-5xl px-6">
          <FadeIn>
            <div className="ap-cta-shell">
              <p
                className="text-sm font-medium mb-4"
                style={{ color: "#0071E3", letterSpacing: "0.06em", textTransform: "uppercase" }}
              >
                Comece agora
              </p>
              <h2
                className="text-4xl sm:text-6xl font-light mb-5"
                style={{ color: "#1D1D1F", letterSpacing: "-0.025em", lineHeight: 1.05, fontFamily: "system-ui, -apple-system, 'Inter', sans-serif" }}
              >
                Experimente grátis<br className="hidden sm:block" /> por 14 dias.
              </h2>
              <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: "#6e6e73", lineHeight: 1.55 }}>
                Sem cartão de crédito. Sem compromisso. Cancele quando quiser.
              </p>
              <Link to="/signup">
                <motion.div
                  whileHover={{ opacity: 0.88 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "16px 36px", borderRadius: 980,
                    background: "#0071E3", color: "#fff",
                    fontFamily: "system-ui, -apple-system, 'Inter', sans-serif",
                    fontSize: 17, fontWeight: 500, cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                >
                  Criar conta da locadora
                  <ArrowRight size={18} />
                </motion.div>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ FOOTER */}
      <footer style={{ background: "#fff", borderTop: "1px solid #E8E8ED" }}>
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  style={{ width: 36, height: 36, borderRadius: 10, background: "#0071E3", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Film className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-base" style={{ color: "#1D1D1F" }}>RentFlow</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#6e6e73" }}>
                Sistema de gestão profissional para locadoras de equipamentos audiovisuais.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4" style={{ color: "#1D1D1F" }}>Produto</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "#features", label: "Funcionalidades" },
                  { href: "#pricing", label: "Preços" },
                  { href: "#how-it-works", label: "Como funciona" },
                  { href: "#faq", label: "FAQ" },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm transition-colors" style={{ color: "#6e6e73" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#1D1D1F")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#6e6e73")}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4" style={{ color: "#1D1D1F" }}>Empresa</h4>
              <ul className="space-y-2.5">
                <li><Link to="/privacy" className="text-sm" style={{ color: "#6e6e73" }}>Privacidade</Link></li>
                <li><Link to="/terms" className="text-sm" style={{ color: "#6e6e73" }}>Termos de Uso</Link></li>
                <li><a href="mailto:contato@rentflow.app" className="text-sm" style={{ color: "#6e6e73" }}>Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4" style={{ color: "#1D1D1F" }}>Começar</h4>
              <p className="text-sm mb-4" style={{ color: "#6e6e73" }}>14 dias grátis, sem cartão de crédito.</p>
              <Link to="/signup">
                <Button
                  size="sm"
                  className="rounded-full w-full text-sm font-medium"
                  style={{ background: "#0071E3", color: "#fff", border: "none" }}
                >
                  Criar conta grátis
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div
            className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: "1px solid #E8E8ED" }}
          >
            <p className="text-xs" style={{ color: "#aeaeb2" }}>© 2026 RentFlow. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4 text-xs" style={{ color: "#aeaeb2" }}>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-foreground transition-colors">Termos</Link>
              <span>·</span>
              <a href="mailto:contato@rentflow.app" className="hover:text-foreground transition-colors">Email</a>
            </div>
          </div>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
};

export default LandingPage;
