import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { TenantSeedMode } from "@/data/mock-data";
import { ArrowRight, Film, Eye, EyeOff, CheckCircle2, Database, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";

const STEPS = ["Dados", "Empresa", "Acesso"];

const seedOptions = [
  {
    value: "empty" as const,
    icon: Database,
    title: "Começar vazio",
    description: "Inventário e módulos iniciam limpos, prontos para sua operação real.",
  },
  {
    value: "demo" as const,
    icon: Sparkles,
    title: "Demo isolada",
    description: "Cria dados de exemplo dentro da sua conta para explorar o sistema.",
  },
];

const SignupPage: React.FC = () => {
  const { isAuthenticated, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName]               = useState("");
  const [company, setCompany]         = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [seedMode, setSeedMode]       = useState<TenantSeedMode>("empty");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  // Track which fields have been touched for visual feedback
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup({ name, company, email, password, seedMode });
      toast.success("Conta criada com sucesso! Bem-vindo ao RentFlow.");
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível criar a conta.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fieldProps = (field: string) => ({
    onFocus: () => setTouched(t => ({ ...t, [field]: true })),
  });

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
        <div className="absolute inset-0 gradient-cinematic" />
        <div className="absolute inset-0 hero-grid-bg opacity-30" />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 50% at 20% 30%, hsl(var(--gold)/0.12) 0%, transparent 70%)"
        }} />

        {/* Animated circles */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/10 pointer-events-none"
            style={{
              width: 200 + i * 140,
              height: 200 + i * 140,
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4 + i * 1.5, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 6 }}
              className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center animate-glow-pulse"
            >
              <Film className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </motion.div>
            <span className="font-display font-bold text-lg">RentFlow</span>
          </Link>

          <div className="space-y-8 max-w-xs">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="font-display text-4xl font-bold tracking-tight leading-[1.1] mb-4">
                Comece a<br />
                <span className="gradient-gold-text">crescer</span><br />
                hoje.
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Configure sua locadora em menos de 5 minutos. Sem cartão de crédito.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="space-y-3"
            >
              {[
                "Workspace isolado por locadora",
                "Persistência local completa",
                "Todos os módulos incluídos",
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </div>

          <p className="text-xs text-muted-foreground/50">© {new Date().getFullYear()} RentFlow</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto relative">
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/3 blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px] relative z-10 py-8"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center">
              <Film className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">RentFlow</span>
          </div>

          <div className="glass-card premium-shadow-lg p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight">Criar conta</h1>
                <p className="text-xs text-muted-foreground">Cadastre sua locadora no RentFlow</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Seu nome
                  </Label>
                  <Input
                    placeholder="Nome do responsável"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="h-11"
                    required
                    {...fieldProps("name")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Locadora
                  </Label>
                  <Input
                    placeholder="Nome da locadora"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="h-11"
                    required
                    {...fieldProps("company")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="operacao@sualocadora.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11"
                  required
                  {...fieldProps("email")}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-11 pr-11"
                    required
                    {...fieldProps("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password strength */}
                {password.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 mt-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          password.length >= (i + 1) * 3
                            ? i < 2 ? "bg-warning" : "bg-success"
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Seed mode selection */}
              <div className="space-y-2.5 pt-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Como iniciar
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {seedOptions.map(({ value, icon: Icon, title, description }) => (
                    <motion.button
                      key={value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSeedMode(value)}
                      className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                        seedMode === value
                          ? "border-primary/40 bg-primary/8 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
                          : "border-border/60 bg-background/40 hover:border-primary/20"
                      }`}
                    >
                      {seedMode === value && (
                        <motion.div
                          layoutId="seed-indicator"
                          className="absolute inset-0 rounded-2xl border border-primary/30 bg-primary/5"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10">
                        <Icon className={`h-4 w-4 mb-2 ${seedMode === value ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.75} />
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert className="border-destructive/30 bg-destructive/8 text-sm text-destructive py-2.5">
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full h-11 gradient-gold text-primary-foreground font-bold border-0 rounded-xl gold-glow gap-2 hover:opacity-95 mt-1"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <>Criar conta <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </motion.div>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-primary font-semibold hover:opacity-80 transition-opacity">
                Entrar
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
