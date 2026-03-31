import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Film, Eye, EyeOff, KeyRound, Camera, Aperture, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";

const FLOATING = [
  { Icon: Camera,   top: "12%",  left: "8%",  size: 48, delay: 0 },
  { Icon: Video,    top: "55%",  left: "5%",  size: 36, delay: 0.8 },
  { Icon: Aperture, top: "78%",  left: "18%", size: 56, delay: 0.4 },
  { Icon: Film,     top: "25%",  left: "82%", size: 40, delay: 1.2 },
  { Icon: Camera,   top: "68%",  left: "88%", size: 32, delay: 0.6 },
  { Icon: Video,    top: "88%",  left: "60%", size: 44, delay: 1.0 },
];

const LoginPage: React.FC = () => {
  const { isAuthenticated, login, requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]               = useState("admin@rentflow.app");
  const [password, setPassword]         = useState("rentflow123");
  const [resetEmail, setResetEmail]     = useState("admin@rentflow.app");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError]               = useState("");
  const [resetOpen, setResetOpen]       = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused]   = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      toast.success("Login realizado com sucesso.");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await requestPasswordReset(resetEmail);
      toast.success("Fluxo de recuperação iniciado.");
      setResetOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar recuperação.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <div className="absolute inset-0 gradient-cinematic" />
        <div className="absolute inset-0 hero-grid-bg opacity-40" />
        <div className="absolute inset-0 hero-radial-fade" />

        {FLOATING.map(({ Icon, top, left, size, delay }, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/10 pointer-events-none"
            style={{ top, left }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
            transition={{
              opacity: { delay, duration: 1 },
              scale:   { delay, duration: 1 },
              y: { delay: delay + 0.5, duration: 5 + i * 0.7, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Icon size={size} strokeWidth={0.8} />
          </motion.div>
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

          <div className="space-y-8 max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="font-display text-4xl font-bold tracking-tight leading-[1.1] mb-4">
                Bem-vindo de<br />
                <span className="gradient-gold-text">volta.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Acesse o painel da sua locadora e continue de onde parou.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="glass-card p-5 border-primary/15"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gold" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Conta demo</p>
              </div>
              <div className="space-y-1 font-mono text-sm text-foreground/80">
                <p>admin@rentflow.app</p>
                <p>rentflow123</p>
              </div>
            </motion.div>
          </div>

          <p className="text-xs text-muted-foreground/50">© {new Date().getFullYear()} RentFlow</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-primary/3 blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] relative z-10"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center">
              <Film className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">RentFlow</span>
          </div>

          <div className="glass-card premium-shadow-lg p-8">
            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Entrar</h1>
              <p className="text-sm text-muted-foreground">Acesse o dashboard da sua locadora.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <div className={`relative rounded-xl border transition-all duration-200 ${emailFocused ? "border-primary/60 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]" : "border-border"}`}>
                  <Input
                    id="email" type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Senha
                  </Label>
                  <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                    <DialogTrigger asChild>
                      <button type="button" className="text-xs text-primary hover:opacity-75 transition-opacity font-medium">
                        Esqueci a senha
                      </button>
                    </DialogTrigger>
                    <DialogContent className="glass-card premium-shadow-lg">
                      <DialogHeader>
                        <DialogTitle className="font-display">Recuperar acesso</DialogTitle>
                        <DialogDescription>Informe o email para iniciar o fluxo de recuperação.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleReset} className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="resetEmail">Email da conta</Label>
                          <Input id="resetEmail" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full gradient-gold text-primary-foreground border-0 gap-2" disabled={resetLoading}>
                          <KeyRound className="h-4 w-4" />
                          {resetLoading ? "Enviando..." : "Enviar recuperação"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className={`relative rounded-xl border transition-all duration-200 ${passFocused ? "border-primary/60 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]" : "border-border"}`}>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-11 pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={showPassword ? "hide" : "show"}
                        initial={{ scale: 0.7, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.7, opacity: 0, rotate: 15 }}
                        transition={{ duration: 0.15 }}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
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
                  className="w-full h-11 gradient-gold text-primary-foreground font-bold border-0 rounded-xl gold-glow gap-2 hover:opacity-95"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <>Entrar <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </motion.div>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Não tem uma conta?{" "}
              <Link to="/signup" className="text-primary font-semibold hover:opacity-80 transition-opacity">
                Criar conta
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
