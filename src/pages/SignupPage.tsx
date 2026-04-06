import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  Box,
  Building2,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Film,
  LayoutDashboard,
  LoaderCircle,
  Search,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Step = 1 | 2;
type OnboardingStage = "form" | "welcome" | "tutorial";
type LegalModal = "terms" | "privacy" | null;

interface SignupForm {
  cnpj: string;
  legalName: string;
  tradeName: string;
  phone: string;
  commercialEmail: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  ownerName: string;
  loginEmail: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

const INITIAL_FORM: SignupForm = {
  cnpj: "",
  legalName: "",
  tradeName: "",
  phone: "",
  commercialEmail: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  ownerName: "",
  loginEmail: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

const DDD_BY_STATE: Record<string, string> = {
  AC: "68",
  AL: "82",
  AP: "96",
  AM: "92",
  BA: "71",
  CE: "85",
  DF: "61",
  ES: "27",
  GO: "62",
  MA: "98",
  MT: "65",
  MS: "67",
  MG: "31",
  PA: "91",
  PB: "83",
  PR: "41",
  PE: "81",
  PI: "86",
  RJ: "21",
  RN: "84",
  RS: "51",
  RO: "69",
  RR: "95",
  SC: "48",
  SP: "11",
  SE: "79",
  TO: "63",
};

const tutorialSteps = [
  { title: "Inventário", description: "Cadastre seus equipamentos aqui.", icon: Box, target: "inventory" as const },
  { title: "Clientes", description: "Gerencie seus clientes e contratos.", icon: Users, target: "clients" as const },
  { title: "Locações", description: "Crie e acompanhe suas locações em tempo real.", icon: CalendarDays, target: "reservations" as const },
  { title: "Dashboard", description: "Aqui você acompanha tudo de uma vez.", icon: LayoutDashboard, target: "dashboard" as const },
];

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

const formatCnpj = (value: string) => {
  const digits = normalizeDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const formatZipCode = (value: string) => {
  const digits = normalizeDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
};

const formatPhone = (value: string) => {
  const digits = normalizeDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const getPhoneWithStateCode = (phone: string, state: string) => {
  const digits = normalizeDigits(phone);
  if (digits.length >= 10) return formatPhone(digits);
  const ddd = DDD_BY_STATE[state.toUpperCase()] ?? "11";
  if (!digits) return `(${ddd}) `;
  return formatPhone(`${ddd}${digits}`.slice(0, 11));
};

const validateCnpj = (value: string) => {
  const digits = normalizeDigits(value);
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;
  const calc = (size: number) => {
    let sum = 0;
    let weight = size - 7;
    for (let i = 0; i < size; i += 1) {
      sum += Number(digits[i]) * weight;
      weight -= 1;
      if (weight < 2) weight = 9;
    }
    const result = 11 - (sum % 11);
    return result > 9 ? 0 : result;
  };
  return calc(12) === Number(digits[12]) && calc(13) === Number(digits[13]);
};

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return { label: "Fraca", width: "33%", className: "bg-red-500" };
  if (score <= 3) return { label: "Média", width: "66%", className: "bg-amber-400" };
  return { label: "Forte", width: "100%", className: "bg-emerald-500" };
};

const SignupPage: React.FC = () => {
  const { isAuthenticated, signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [stage, setStage] = useState<OnboardingStage>("form");
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cnpjFeedback, setCnpjFeedback] = useState("");
  const [formError, setFormError] = useState("");
  const [modal, setModal] = useState<LegalModal>(null);
  const [submittedName, setSubmittedName] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<SignupForm>(INITIAL_FORM);

  useEffect(() => {
    if (stage !== "welcome") return undefined;
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.35 } });
    const timer = window.setTimeout(() => setStage("tutorial"), 3600);
    return () => window.clearTimeout(timer);
  }, [stage]);

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  if (isAuthenticated && stage === "form") return <Navigate to="/dashboard" replace />;

  const updateField = <K extends keyof SignupForm>(key: K, value: SignupForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const markTouched = (key: keyof SignupForm) => {
    setTouched((current) => ({ ...current, [key]: true }));
  };

  const errors = {
    cnpj: touched.cnpj && !validateCnpj(form.cnpj) ? "Informe um CNPJ válido." : "",
    legalName: touched.legalName && !form.legalName.trim() ? "Razão social obrigatória." : "",
    ownerName: touched.ownerName && !form.ownerName.trim() ? "Nome do responsável obrigatório." : "",
    loginEmail:
      touched.loginEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.loginEmail)
        ? "Informe um email válido."
        : "",
    password: touched.password && form.password.length < 8 ? "A senha deve ter pelo menos 8 caracteres." : "",
    confirmPassword:
      touched.confirmPassword && form.confirmPassword !== form.password ? "As senhas precisam ser iguais." : "",
    acceptedTerms:
      touched.acceptedTerms && !form.acceptedTerms ? "Você precisa aceitar os termos para continuar." : "",
  };

  const canAdvance = validateCnpj(form.cnpj) && !!form.legalName.trim();
  const canSubmit =
    !!form.ownerName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.loginEmail) &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword &&
    form.acceptedTerms;

  const activeTarget = tutorialSteps[tutorialStep]?.target;

  const lookupCnpj = async () => {
    markTouched("cnpj");
    if (!validateCnpj(form.cnpj)) {
      setCnpjFeedback("Confira o CNPJ antes de buscar.");
      return;
    }
    setLoadingCnpj(true);
    setCnpjFeedback("");
    try {
      const cleanCnpj = normalizeDigits(form.cnpj);
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`);
      if (!response.ok) throw new Error("CNPJ não encontrado.");
      const data = await response.json();
      const state = data?.estabelecimento?.estado?.sigla ?? "";
      const rawPhone = `${data?.estabelecimento?.ddd1 ?? ""}${data?.estabelecimento?.telefone1 ?? ""}`;
      setForm((current) => ({
        ...current,
        legalName: data?.razao_social ?? current.legalName,
        tradeName: data?.estabelecimento?.nome_fantasia ?? current.tradeName,
        phone: getPhoneWithStateCode(rawPhone || current.phone, state || current.state),
        commercialEmail: data?.estabelecimento?.email ?? current.commercialEmail,
        zipCode: formatZipCode(data?.estabelecimento?.cep ?? current.zipCode),
        street: data?.estabelecimento?.logradouro ?? current.street,
        number: data?.estabelecimento?.numero ?? current.number,
        complement: data?.estabelecimento?.complemento ?? current.complement,
        district: data?.estabelecimento?.bairro ?? current.district,
        city: data?.estabelecimento?.cidade?.nome ?? current.city,
        state: state || current.state,
      }));
      setCnpjFeedback("Dados carregados. Você ainda pode editar qualquer campo.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível consultar este CNPJ agora.";
      setCnpjFeedback(message);
    } finally {
      setLoadingCnpj(false);
    }
  };

  const handleNextStep = () => {
    markTouched("cnpj");
    markTouched("legalName");
    if (!canAdvance) return;
    setStep(2);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    ["ownerName", "loginEmail", "password", "confirmPassword", "acceptedTerms"].forEach((key) =>
      markTouched(key as keyof SignupForm),
    );
    if (!canSubmit) return;

    setLoadingSubmit(true);
    setFormError("");
    try {
      await signup({
        name: form.ownerName.trim(),
        company: form.tradeName.trim() || form.legalName.trim(),
        email: form.loginEmail.trim(),
        password: form.password,
        seedMode: "empty",
        settings: {
          companyName: form.tradeName.trim() || form.legalName.trim(),
          contactName: form.ownerName.trim(),
          cnpj: form.cnpj,
          phone: form.phone,
          email: form.commercialEmail || form.loginEmail.trim(),
          address: [form.street, form.number, form.district, `${form.city} - ${form.state}`]
            .filter(Boolean)
            .join(", "),
        },
      });
      setSubmittedName(form.tradeName.trim() || form.legalName.trim());
      setStage("welcome");
      toast.success("Conta criada com sucesso.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível criar sua conta.";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#1a1a1a] text-foreground">
      <div className="flex min-h-screen">
        <aside className="relative hidden w-[48%] overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,166,35,0.18),transparent_28%),linear-gradient(160deg,#101010_0%,#1a1a1a_62%,#111111_100%)]" />
          <div className="absolute inset-0 hero-grid-bg opacity-20" />
          <div className="relative z-10 flex w-full flex-col justify-between p-14">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5A623] text-black shadow-[0_0_40px_rgba(245,166,35,0.25)]">
                <Film className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-bold">RentFlow</p>
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Rental operations</p>
              </div>
            </Link>

            <div className="max-w-md space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-5xl font-bold leading-[1.05]"
              >
                Coloque sua locadora para rodar com um onboarding rápido e elegante.
              </motion.h1>
              <p className="max-w-sm text-sm leading-7 text-white/60">
                Cadastre a empresa, configure o acesso e já entre sabendo onde cadastrar equipamentos,
                clientes, locações e contratos.
              </p>
            </div>

            <p className="text-xs text-white/40">© {new Date().getFullYear()} RentFlow</p>
          </div>
        </aside>

        <main className="relative flex flex-1 items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,166,35,0.08),transparent_24%)]" />
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-5xl"
          >
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5A623] text-black">
                <Film className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold">RentFlow</span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/30 shadow-[0_20px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                <AnimatePresence mode="wait">
                  {stage === "form" ? (
                    <motion.div
                      key="signup-form"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.35 }}
                      className="p-6 sm:p-8"
                    >
                      <div className="mb-8 flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5A623]/15 text-[#F5A623]">
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                              <h1 className="font-display text-2xl font-bold">Criar conta</h1>
                              <p className="text-sm text-white/55">Sua operação começa aqui.</p>
                            </div>
                          </div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                            Etapa {step} de 2
                          </p>
                        </div>
                        <span className="rounded-full border border-[#F5A623]/25 bg-[#F5A623]/10 px-3 py-1 text-xs text-[#F5A623]">
                          {step === 1 ? "Dados da empresa" : "Dados de acesso"}
                        </span>
                      </div>

                      <div className="mb-8 h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          animate={{ width: step === 1 ? "50%" : "100%" }}
                          transition={{ duration: 0.35 }}
                          className="h-full rounded-full bg-[#F5A623]"
                        />
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                          {step === 1 ? (
                            <motion.div
                              key="step-company"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-4"
                            >
                              <div>
                                <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">CNPJ*</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={form.cnpj}
                                    onChange={(event) => updateField("cnpj", formatCnpj(event.target.value))}
                                    onBlur={() => markTouched("cnpj")}
                                    placeholder="00.000.000/0000-00"
                                    className={cn("h-11 border-white/10 bg-white/5", errors.cnpj && "border-red-500")}
                                  />
                                  <Button type="button" onClick={lookupCnpj} className="h-11 min-w-28 bg-[#F5A623] text-black hover:bg-[#f8b84f]">
                                    {loadingCnpj ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    <span className="ml-2">Buscar</span>
                                  </Button>
                                </div>
                                {errors.cnpj ? <p className="mt-1 text-xs text-red-400">{errors.cnpj}</p> : null}
                                {cnpjFeedback ? <p className="mt-1 text-xs text-white/55">{cnpjFeedback}</p> : null}
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Razão social*</Label>
                                  <Input value={form.legalName} onChange={(event) => updateField("legalName", event.target.value)} onBlur={() => markTouched("legalName")} className={cn("h-11 border-white/10 bg-white/5", errors.legalName && "border-red-500")} />
                                  {errors.legalName ? <p className="mt-1 text-xs text-red-400">{errors.legalName}</p> : null}
                                </div>
                                <div>
                                  <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Nome fantasia</Label>
                                  <Input value={form.tradeName} onChange={(event) => updateField("tradeName", event.target.value)} className="h-11 border-white/10 bg-white/5" />
                                </div>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Telefone</Label>
                                  <Input value={form.phone} onChange={(event) => updateField("phone", formatPhone(event.target.value))} className="h-11 border-white/10 bg-white/5" placeholder="(11) 99999-9999" />
                                </div>
                                <div>
                                  <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Email comercial</Label>
                                  <Input value={form.commercialEmail} onChange={(event) => updateField("commercialEmail", event.target.value)} className="h-11 border-white/10 bg-white/5" placeholder="contato@suaempresa.com" />
                                </div>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-[0.8fr_1.4fr_0.6fr]">
                                <div>
                                  <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">CEP</Label>
                                  <Input value={form.zipCode} onChange={(event) => updateField("zipCode", formatZipCode(event.target.value))} className="h-11 border-white/10 bg-white/5" />
                                </div>
                                <div>
                                  <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Endereço</Label>
                                  <Input value={form.street} onChange={(event) => updateField("street", event.target.value)} className="h-11 border-white/10 bg-white/5" />
                                </div>
                                <div>
                                  <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Número</Label>
                                  <Input value={form.number} onChange={(event) => updateField("number", event.target.value)} className="h-11 border-white/10 bg-white/5" />
                                </div>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Complemento</Label>
                                  <Input value={form.complement} onChange={(event) => updateField("complement", event.target.value)} className="h-11 border-white/10 bg-white/5" />
                                </div>
                                <div>
                                  <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Bairro</Label>
                                  <Input value={form.district} onChange={(event) => updateField("district", event.target.value)} className="h-11 border-white/10 bg-white/5" />
                                </div>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                                <div>
                                  <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Cidade</Label>
                                  <Input value={form.city} onChange={(event) => updateField("city", event.target.value)} className="h-11 border-white/10 bg-white/5" />
                                </div>
                                <div>
                                  <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Estado</Label>
                                  <Input value={form.state} onChange={(event) => updateField("state", event.target.value.toUpperCase().slice(0, 2))} className="h-11 border-white/10 bg-white/5" />
                                </div>
                              </div>

                              <div className="flex justify-end pt-2">
                                <Button type="button" onClick={handleNextStep} className="h-11 bg-[#F5A623] px-6 text-black hover:bg-[#f8b84f]">
                                  Próximo <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="step-access"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-4"
                            >
                              <div>
                                <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Nome do responsável*</Label>
                                <Input value={form.ownerName} onChange={(event) => updateField("ownerName", event.target.value)} onBlur={() => markTouched("ownerName")} className={cn("h-11 border-white/10 bg-white/5", errors.ownerName && "border-red-500")} />
                                {errors.ownerName ? <p className="mt-1 text-xs text-red-400">{errors.ownerName}</p> : null}
                              </div>

                              <div>
                                <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Email de login*</Label>
                                <Input value={form.loginEmail} onChange={(event) => updateField("loginEmail", event.target.value)} onBlur={() => markTouched("loginEmail")} className={cn("h-11 border-white/10 bg-white/5", errors.loginEmail && "border-red-500")} />
                                {errors.loginEmail ? <p className="mt-1 text-xs text-red-400">{errors.loginEmail}</p> : null}
                              </div>

                              <div>
                                <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Senha*</Label>
                                <div className="relative">
                                  <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => updateField("password", event.target.value)} onBlur={() => markTouched("password")} className={cn("h-11 border-white/10 bg-white/5 pr-11", errors.password && "border-red-500")} placeholder="Mínimo 8 caracteres" />
                                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-white">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                                <div className="mt-3 rounded-full bg-white/10">
                                  <motion.div animate={{ width: passwordStrength.width }} className={cn("h-2 rounded-full", passwordStrength.className)} />
                                </div>
                                <p className="mt-1 text-xs text-white/55">Força da senha: {passwordStrength.label}</p>
                                {errors.password ? <p className="mt-1 text-xs text-red-400">{errors.password}</p> : null}
                              </div>

                              <div>
                                <Label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/55">Confirmar senha*</Label>
                                <div className="relative">
                                  <Input type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} onBlur={() => markTouched("confirmPassword")} className={cn("h-11 border-white/10 bg-white/5 pr-11", errors.confirmPassword && "border-red-500")} />
                                  <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-white">
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                                {errors.confirmPassword ? <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p> : null}
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-start gap-3">
                                  <Checkbox checked={form.acceptedTerms} onCheckedChange={(checked) => updateField("acceptedTerms", checked === true)} onBlur={() => markTouched("acceptedTerms")} className="mt-1 border-white/40 data-[state=checked]:bg-[#F5A623] data-[state=checked]:text-black" />
                                  <div className="space-y-1 text-sm text-white/70">
                                    <p>
                                      Li e aceito os{" "}
                                      <button type="button" className="text-[#F5A623] underline underline-offset-4" onClick={() => setModal("terms")}>
                                        Termos de Uso
                                      </button>{" "}
                                      e a{" "}
                                      <button type="button" className="text-[#F5A623] underline underline-offset-4" onClick={() => setModal("privacy")}>
                                        Política de Privacidade
                                      </button>
                                      .
                                    </p>
                                    {errors.acceptedTerms ? <p className="text-xs text-red-400">{errors.acceptedTerms}</p> : null}
                                  </div>
                                </div>
                              </div>

                              {formError ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{formError}</div> : null}

                              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-11 justify-start text-white/70 hover:bg-white/5 hover:text-white">
                                  ← Voltar
                                </Button>
                                <Button type="submit" disabled={!canSubmit || loadingSubmit} className="h-11 bg-[#F5A623] px-6 text-black hover:bg-[#f8b84f] disabled:bg-[#F5A623]/45 disabled:text-black/70">
                                  {loadingSubmit ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Criar conta"}
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </form>
                    </motion.div>
                  ) : stage === "welcome" ? (
                    <motion.div
                      key="welcome"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      className="flex min-h-[640px] flex-col items-center justify-center gap-6 p-8 text-center"
                    >
                      <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/18 text-emerald-400">
                        <CheckCircle2 className="h-14 w-14" />
                      </motion.div>
                      <div className="space-y-2">
                        <h2 className="font-display text-3xl font-bold">Bem-vinda, {submittedName}! 🎉</h2>
                        <p className="text-white/60">Sua locadora está pronta no RentFlow.</p>
                      </div>
                      <div className="w-full max-w-sm space-y-3">
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3.2, ease: "linear" }} className="h-full rounded-full bg-[#F5A623]" />
                        </div>
                        <p className="text-sm text-white/55">Preparando tudo para o seu primeiro acesso...</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="tutorial"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative min-h-[640px] overflow-hidden p-5 sm:p-6"
                    >
                      <div className="relative z-0 rounded-[24px] border border-white/10 bg-[#101010] p-4">
                        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5A623] text-black">
                              <Film className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-display font-semibold">RentFlow</p>
                              <p className="text-xs uppercase tracking-[0.24em] text-white/35">Workspace pronto</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => navigate("/dashboard")} className="text-xs text-white/45 transition hover:text-white">
                            Pular tutorial
                          </button>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/35 p-3">
                            {[
                              { key: "inventory", label: "Inventário", icon: Box },
                              { key: "clients", label: "Clientes", icon: Users },
                              { key: "reservations", label: "Locações", icon: CalendarDays },
                              { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                            ].map((item) => (
                              <div
                                key={item.key}
                                className={cn(
                                  "relative rounded-2xl border border-transparent px-4 py-3 text-sm text-white/65 transition",
                                  activeTarget === item.key &&
                                    "z-[2] border-[#F5A623] bg-[#F5A623]/12 text-white shadow-[0_0_0_1px_rgba(245,166,35,0.15)] ring-2 ring-[#F5A623]/50",
                                )}
                              >
                                <item.icon className="mb-2 h-4 w-4 text-[#F5A623]" />
                                {item.label}
                              </div>
                            ))}
                          </div>

                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              {[1, 2, 3, 4].map((card) => (
                                <div key={card} className={cn("relative rounded-2xl border border-white/10 bg-black/35 p-4", activeTarget === "dashboard" && "z-[2] ring-2 ring-[#F5A623]")}>
                                  <div className="mb-3 h-2 w-16 rounded-full bg-[#F5A623]/35" />
                                  <div className="h-16 rounded-xl bg-white/5" />
                                </div>
                              ))}
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                              <div className="mb-3 h-2 w-20 rounded-full bg-white/15" />
                              <div className="grid gap-3 md:grid-cols-3">
                                {[1, 2, 3].map((line) => (
                                  <div key={line} className="h-20 rounded-xl bg-white/5" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 z-[1] bg-black/55" />
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={tutorialStep}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="absolute bottom-6 left-6 right-6 z-10 rounded-[24px] border border-[#F5A623]/20 bg-[#121212]/95 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:left-auto sm:right-6 sm:w-[360px]"
                        >
                          <div className="mb-4 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5A623]/15 text-[#F5A623]">
                                {React.createElement(tutorialSteps[tutorialStep].icon, { className: "h-6 w-6" })}
                              </div>
                              <div>
                                <p className="text-sm uppercase tracking-[0.24em] text-white/35">Passo {tutorialStep + 1}</p>
                                <h3 className="font-display text-xl font-semibold">{tutorialSteps[tutorialStep].title}</h3>
                              </div>
                            </div>
                            <button type="button" onClick={() => navigate("/dashboard")} className="text-xs text-white/45 transition hover:text-white">
                              Pular tutorial
                            </button>
                          </div>

                          <p className="mb-5 text-sm leading-6 text-white/70">{tutorialSteps[tutorialStep].description}</p>

                          <div className="mb-5 flex gap-2">
                            {tutorialSteps.map((_, index) => (
                              <span key={index} className={cn("h-2.5 w-2.5 rounded-full bg-white/20", tutorialStep === index && "bg-[#F5A623]")} />
                            ))}
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              onClick={() =>
                                tutorialStep === tutorialSteps.length - 1
                                  ? navigate("/dashboard")
                                  : setTutorialStep((current) => current + 1)
                              }
                              className="h-11 bg-[#F5A623] px-5 text-black hover:bg-[#f8b84f]"
                            >
                              {tutorialStep === tutorialSteps.length - 1 ? "Começar agora" : "Próximo"}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col justify-between rounded-[28px] border border-white/10 bg-black/20 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.25)]">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.32em] text-white/40">Fluxo guiado</p>
                  <h2 className="font-display text-3xl font-bold leading-tight">Cadastro inteligente com dados da empresa e onboarding visual.</h2>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    O formulário puxa os dados principais pelo CNPJ, mantém tudo editável e leva você direto
                    para um tour guiado dentro do produto.
                  </p>
                </div>

                <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="space-y-4">
                    {[
                      "Busca automática de dados da empresa pelo CNPJ",
                      "Validação inline e senha com indicador de força",
                      "Boas-vindas animada com confete leve",
                      "Tutorial interativo antes de entrar no dashboard",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-white/70">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F5A623]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-5 text-sm text-white/55">
                    Já tem uma conta?{" "}
                    <Link to="/login" className="font-medium text-[#F5A623] transition hover:text-[#ffd27f]">
                      Entrar
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </main>
      </div>

      <Dialog open={modal !== null} onOpenChange={(open) => setModal(open ? modal : null)}>
        <DialogContent className="max-w-xl border-white/10 bg-[#121212]">
          <DialogHeader>
            <DialogTitle>{modal === "terms" ? "Termos de Uso" : "Política de Privacidade"}</DialogTitle>
            <DialogDescription>
              {modal === "terms"
                ? "Resumo simples dos termos para início da operação no RentFlow."
                : "Resumo simples sobre como os dados cadastrais serão utilizados no fluxo local."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-6 text-white/70">
            <p>Este ambiente foi pensado para onboarding rápido, com dados editáveis e persistência local do workspace.</p>
            <p>Você pode revisar as informações da empresa, atualizar os dados nas configurações e seguir operando normalmente após o primeiro acesso.</p>
            <p>Ao continuar, você confirma que tem autorização para cadastrar a empresa e criar o acesso inicial da conta.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignupPage;
