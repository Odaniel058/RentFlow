import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Download, Eye, FileText, Loader2, Package, Percent, Save, Sparkles, WandSparkles } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { StatusBadge } from "@/components/StatusBadge";
import { ClientSearchSelect } from "@/components/clients/ClientSearchSelect";
import { QuoteKitBreakdown } from "@/components/quotes/QuoteKitBreakdown";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Quote, QuoteLineItem, QuoteStatus, calculateQuoteTotal } from "@/data/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";
import { getQuoteItemLabel } from "@/lib/quotes";
import { downloadQuotePdf, previewQuoteDocument, printQuote } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";

const steps = [
  { id: "client", title: "Cliente", description: "Busque e selecione o cliente ideal" },
  { id: "items", title: "Itens", description: "Monte equipamentos e kits" },
  { id: "period", title: "Periodo", description: "Defina locacao e validade" },
  { id: "pricing", title: "Valores", description: "Ajuste quantidade e diaria" },
  { id: "terms", title: "Condicoes", description: "Desconto e observacoes" },
  { id: "review", title: "Revisao", description: "Confira antes de enviar" },
  { id: "delivery", title: "Entrega", description: "Salvar, PDF e conversao" },
] as const;

type QuoteWizardForm = {
  clientId: string;
  items: QuoteLineItem[];
  rentalStartDate: string;
  rentalEndDate: string;
  validUntil: string;
  notes: string;
  discount: number;
  status: QuoteStatus;
};

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (base: string, amount: number) => {
  const date = new Date(`${base}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
};
const createLine = (type: "equipment" | "kit", refId = "", name = "", dailyRate = 0): QuoteLineItem => ({ id: `line-${Math.random().toString(16).slice(2, 8)}`, type, refId, name, quantity: 1, dailyRate, days: 1 });
const createEmptyForm = (): QuoteWizardForm => {
  const baseDate = today();
  return { clientId: "", items: [], rentalStartDate: plusDays(baseDate, 2), rentalEndDate: plusDays(baseDate, 3), validUntil: plusDays(baseDate, 7), notes: "", discount: 0, status: "draft" };
};

const surfaceCard = "rounded-[28px] border border-border/60 bg-surface/40 p-5";

const QuoteComposerPage: React.FC = () => {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const { state, upsertQuote, convertQuoteToReservation } = useAppData();
  const editingQuote = state.quotes.find((quote) => quote.id === quoteId);
  const draftStorageKey = `rentflow_quote_wizard_${user?.tenantId ?? "guest"}_${quoteId ?? "new"}`;

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<QuoteWizardForm>(createEmptyForm());
  const [actionLoading, setActionLoading] = useState<"draft" | "save" | "send" | "convert" | null>(null);
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    if (quoteId && !editingQuote) {
      toast.error("Orcamento nao encontrado para edicao.");
      navigate("/quotes", { replace: true });
      return;
    }
    const storedDraft = localStorage.getItem(draftStorageKey);
    if (storedDraft) {
      const parsed = JSON.parse(storedDraft) as { step: number; form: QuoteWizardForm };
      setForm(parsed.form);
      setActiveStep(parsed.step);
      return;
    }
    if (editingQuote) {
      setForm({ clientId: editingQuote.clientId, items: editingQuote.items.map((item) => ({ ...item })), rentalStartDate: editingQuote.rentalStartDate, rentalEndDate: editingQuote.rentalEndDate, validUntil: editingQuote.validUntil, notes: editingQuote.notes, discount: editingQuote.discount, status: editingQuote.status });
      return;
    }
    setForm((current) => ({
      ...createEmptyForm(),
      clientId: state.clients.some((client) => client.id === current.clientId) ? current.clientId : "",
    }));
  }, [draftStorageKey, editingQuote, navigate, quoteId, state.clients]);

  const selectedClient = state.clients.find((client) => client.id === form.clientId) ?? null;
  const subtotal = useMemo(() => calculateQuoteTotal(form.items, 0), [form.items]);
  const total = useMemo(() => calculateQuoteTotal(form.items, form.discount), [form.discount, form.items]);
  const selectedQuoteStatus = editingQuote?.status ?? form.status;
  const progress = ((activeStep + 1) / steps.length) * 100;

  const previewQuote: Quote = useMemo(() => ({
    id: editingQuote?.id ?? "PREVIA",
    clientId: form.clientId,
    clientName: selectedClient?.name ?? "Cliente nao selecionado",
    items: form.items,
    createdAt: editingQuote?.createdAt ?? today(),
    rentalStartDate: form.rentalStartDate,
    rentalEndDate: form.rentalEndDate,
    validUntil: form.validUntil,
    notes: form.notes,
    discount: form.discount,
    total,
    status: editingQuote?.status ?? form.status,
  }), [editingQuote, form, selectedClient, total]);

  const exportContext = useMemo(() => ({ quote: previewQuote, settings: state.settings, client: selectedClient ?? undefined, equipment: state.equipment, kits: state.kits }), [previewQuote, selectedClient, state.equipment, state.kits, state.settings]);
  const saveLocalDraft = (step = activeStep) => localStorage.setItem(draftStorageKey, JSON.stringify({ step, form }));
  const clearLocalDraft = () => localStorage.removeItem(draftStorageKey);

  const selectItem = (type: "equipment" | "kit", refId: string) => {
    const source = type === "equipment" ? state.equipment : state.kits;
    const selected = source.find((item) => item.id === refId);
    if (!selected) return;
    setForm((current) => {
      const existing = current.items.find((item) => item.refId === refId && item.type === type);
      if (existing) return { ...current, items: current.items.map((item) => item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item) };
      return { ...current, items: [...current.items, createLine(type, selected.id, selected.name, selected.dailyRate)] };
    });
  };

  const updateLine = (lineId: string, changes: Partial<QuoteLineItem>) => setForm((current) => ({ ...current, items: current.items.map((line) => line.id === lineId ? { ...line, ...changes } : line) }));
  const removeLine = (lineId: string) => setForm((current) => ({ ...current, items: current.items.filter((item) => item.id !== lineId) }));

  const validateStep = (stepIndex: number) => {
    if (stepIndex === 0 && !form.clientId) return "Selecione um cliente para continuar.";
    if (stepIndex === 1 && !form.items.length) return "Adicione pelo menos um equipamento ou kit.";
    if (stepIndex === 2 && (!form.rentalStartDate || !form.rentalEndDate || !form.validUntil)) return "Preencha o periodo da locacao e a validade do orcamento.";
    if (stepIndex === 2 && form.rentalEndDate < form.rentalStartDate) return "A data final da locacao nao pode ser anterior a inicial.";
    if (stepIndex === 3 && form.items.some((item) => !item.quantity || !item.days || item.dailyRate < 0)) return "Revise quantidades, diarias e valores antes de avancar.";
    return "";
  };

  const goNext = () => {
    const error = validateStep(activeStep);
    setValidationMessage(error);
    if (error) return toast.error(error);
    const nextStep = Math.min(steps.length - 1, activeStep + 1);
    setActiveStep(nextStep);
    saveLocalDraft(nextStep);
  };

  const persistQuote = async (status: QuoteStatus) => {
    const blockingStep = steps.findIndex((_, index) => validateStep(index));
    if (blockingStep !== -1) {
      const error = validateStep(blockingStep);
      setActiveStep(blockingStep);
      setValidationMessage(error);
      toast.error(error);
      return null;
    }
    const currentAction = status === "draft" ? "draft" : status === "sent" ? "send" : "save";
    setActionLoading(currentAction);
    await new Promise((resolve) => setTimeout(resolve, 550));
    const record = upsertQuote({ id: editingQuote?.id, clientId: form.clientId, clientName: selectedClient?.name ?? "Cliente", items: form.items, createdAt: editingQuote?.createdAt ?? today(), rentalStartDate: form.rentalStartDate, rentalEndDate: form.rentalEndDate, validUntil: form.validUntil, notes: form.notes, discount: form.discount, total, status });
    setForm((current) => ({ ...current, status }));
    clearLocalDraft();
    setActionLoading(null);
    toast.success(status === "sent" ? "Proposta salva e marcada como enviada." : "Rascunho salvo com sucesso.");
    return record;
  };

  const handlePreview = () => {
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    previewQuoteDocument(exportContext);
    toast.success("Previa documental aberta em nova janela.");
  };

  const handlePdf = async () => {
    const record = (await persistQuote(form.status === "sent" ? "sent" : "draft")) ?? previewQuote;
    await downloadQuotePdf({ quote: record, settings: state.settings, client: selectedClient ?? undefined, equipment: state.equipment, kits: state.kits });
    toast.success("PDF gerado com sucesso.");
  };

  const handleConvert = async () => {
    const record = editingQuote ?? (await persistQuote("sent"));
    if (!record?.id) return;
    setActionLoading("convert");
    await new Promise((resolve) => setTimeout(resolve, 450));
    const reservation = convertQuoteToReservation(record.id);
    setActionLoading(null);
    if (reservation) {
      clearLocalDraft();
      toast.success(`Proposta convertida na reserva ${reservation.id}.`);
      navigate("/reservations");
    }
  };

  const renderItemCard = (item: QuoteLineItem, removable = false) => (
    <div key={item.id} className="rounded-2xl border border-border/50 bg-background/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">{item.quantity}x {item.name}</p>
          <p className="text-xs text-muted-foreground">{getQuoteItemLabel(item)} • {item.days} diarias • {formatCurrency(item.dailyRate)}/dia</p>
        </div>
        {removable ? <Button variant="ghost" size="sm" onClick={() => removeLine(item.id)}>Remover</Button> : <p className="font-semibold">{formatCurrency(item.quantity * item.days * item.dailyRate)}</p>}
      </div>
      <QuoteKitBreakdown item={item} kits={state.kits} />
    </div>
  );

  const stepContent = () => {
    if (activeStep === 0) return (
      <div className="space-y-5">
        <div className={surfaceCard}>
          <p className="text-sm font-semibold">Busca de cliente</p>
          <p className="mt-1 text-xs text-muted-foreground">Localize o cliente por nome, empresa, documento ou email para nao depender de listas longas.</p>
          <div className="mt-4">
            <ClientSearchSelect clients={state.clients} value={form.clientId} onChange={(clientId) => setForm((current) => ({ ...current, clientId }))} />
          </div>
        </div>
        {selectedClient ? (
          <div className="rounded-[28px] border border-primary/20 bg-primary/5 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Resumo do cliente</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">Contato</p><p className="mt-1 font-medium">{selectedClient.name}</p><p className="text-sm text-muted-foreground">{selectedClient.company}</p></div>
              <div><p className="text-xs text-muted-foreground">Dados</p><p className="mt-1 text-sm">{selectedClient.document}</p><p className="text-sm text-muted-foreground">{selectedClient.email}</p><p className="text-sm text-muted-foreground">{selectedClient.phone}</p></div>
            </div>
          </div>
        ) : null}
      </div>
    );

    if (activeStep === 1) return (
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <div className={surfaceCard}>
            <div className="mb-4 flex items-center gap-2"><Package className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Equipamentos disponiveis</h3></div>
            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {state.equipment.map((equipment) => (
                <button key={equipment.id} type="button" onClick={() => selectItem("equipment", equipment.id)} className="w-full rounded-2xl border border-border/50 bg-background/40 p-4 text-left transition-all hover:border-primary/20">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-medium">{equipment.name}</p><p className="mt-1 text-xs text-muted-foreground">{equipment.brand} • {equipment.category}</p></div><span className="text-sm font-semibold gradient-gold-text">{formatCurrency(equipment.dailyRate)}</span></div>
                </button>
              ))}
            </div>
          </div>
          <div className={surfaceCard}>
            <div className="mb-4 flex items-center gap-2"><WandSparkles className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Kits premium</h3></div>
            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {state.kits.map((kit) => (
                <button key={kit.id} type="button" onClick={() => selectItem("kit", kit.id)} className="w-full rounded-2xl border border-border/50 bg-background/40 p-4 text-left transition-all hover:border-primary/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{kit.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{kit.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">{kit.items.map((kitItem) => <span key={`${kit.id}-${kitItem}`} className="rounded-full border border-border/60 bg-surface px-2.5 py-1 text-[11px] text-muted-foreground">{kitItem}</span>)}</div>
                    </div>
                    <span className="text-sm font-semibold gradient-gold-text">{formatCurrency(kit.dailyRate)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-[28px] border border-border/60 bg-background/30 p-5">
          <h3 className="mb-4 text-sm font-semibold">Itens ja selecionados</h3>
          <div className="space-y-3">{form.items.length ? form.items.map((item) => renderItemCard(item, true)) : <p className="text-sm text-muted-foreground">Escolha os itens que irao compor a proposta.</p>}</div>
        </div>
      </div>
    );

    if (activeStep === 2) return (
      <div className="grid gap-5 lg:grid-cols-3">
        <div className={`${surfaceCard} space-y-2`}><Label>Inicio da locacao</Label><Input type="date" value={form.rentalStartDate} onChange={(event) => setForm((current) => ({ ...current, rentalStartDate: event.target.value }))} /></div>
        <div className={`${surfaceCard} space-y-2`}><Label>Fim da locacao</Label><Input type="date" value={form.rentalEndDate} onChange={(event) => setForm((current) => ({ ...current, rentalEndDate: event.target.value }))} /></div>
        <div className={`${surfaceCard} space-y-2`}><Label>Validade da proposta</Label><Input type="date" value={form.validUntil} onChange={(event) => setForm((current) => ({ ...current, validUntil: event.target.value }))} /></div>
      </div>
    );

    if (activeStep === 3) return (
      <div className="space-y-4">
        {form.items.map((item) => (
          <div key={item.id} className="grid gap-4 rounded-[28px] border border-border/60 bg-surface/40 p-5 xl:grid-cols-[1.2fr_0.6fr_0.6fr_0.7fr_auto]">
            <div><p className="font-medium">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{getQuoteItemLabel(item)} • ref {item.refId}</p><QuoteKitBreakdown item={item} kits={state.kits} className="xl:max-w-[26rem]" /></div>
            <div className="space-y-2"><Label>Quantidade</Label><Input type="number" min={1} value={item.quantity} onChange={(event) => updateLine(item.id, { quantity: Number(event.target.value) })} /></div>
            <div className="space-y-2"><Label>Diarias</Label><Input type="number" min={1} value={item.days} onChange={(event) => updateLine(item.id, { days: Number(event.target.value) })} /></div>
            <div className="space-y-2"><Label>Valor/dia</Label><Input type="number" min={0} value={item.dailyRate} onChange={(event) => updateLine(item.id, { dailyRate: Number(event.target.value) })} /></div>
            <div className="flex items-end"><Button variant="ghost" onClick={() => removeLine(item.id)}>Excluir</Button></div>
          </div>
        ))}
      </div>
    );

    if (activeStep === 4) return (
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[28px] border border-primary/20 bg-primary/5 p-5 space-y-4">
          <div className="flex items-center gap-2"><Percent className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Ajustes comerciais</h3></div>
          <div className="space-y-2"><Label>Desconto aplicado</Label><Input type="number" min={0} value={form.discount} onChange={(event) => setForm((current) => ({ ...current, discount: Number(event.target.value) }))} /></div>
          <div className="rounded-2xl border border-border/50 bg-background/40 p-4"><p className="text-xs text-muted-foreground">Impacto no total</p><p className="mt-1 text-xl font-semibold gradient-gold-text">{formatCurrency(total)}</p></div>
        </div>
        <div className={`${surfaceCard} space-y-2`}><Label>Observacoes da proposta</Label><Textarea rows={10} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Condicoes comerciais, frete, operador, seguro, montagem, observacoes internas..." /></div>
      </div>
    );

    if (activeStep === 5) return (
      <div className="space-y-5">
        <div className={surfaceCard}>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Revisao final</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div><p className="text-xs text-muted-foreground">Cliente</p><p className="mt-1 font-medium">{selectedClient?.name ?? "Nao selecionado"}</p></div>
            <div><p className="text-xs text-muted-foreground">Locacao</p><p className="mt-1 font-medium">{formatDate(form.rentalStartDate)} ate {formatDate(form.rentalEndDate)}</p></div>
            <div><p className="text-xs text-muted-foreground">Validade</p><p className="mt-1 font-medium">{formatDate(form.validUntil)}</p></div>
          </div>
        </div>
        <div className={surfaceCard}><h3 className="mb-4 text-sm font-semibold">Itens e totais</h3><div className="space-y-3">{form.items.map((item) => renderItemCard(item))}</div></div>
      </div>
    );

    return (
      <div className="space-y-5">
        <div className="rounded-[28px] border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Publicacao da proposta</h3></div>
          <p className="mt-2 text-sm text-muted-foreground">Salve como rascunho, marque como enviado, gere PDF profissional ou converta em reserva quando o cliente aprovar.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Button variant="outline" className="h-12 rounded-2xl" onClick={handlePreview}><Eye className="h-4 w-4 mr-2" />Visualizar previa</Button>
          <Button variant="outline" className="h-12 rounded-2xl" onClick={handlePdf}><Download className="h-4 w-4 mr-2" />Gerar PDF</Button>
          <Button variant="outline" className="h-12 rounded-2xl" onClick={() => printQuote(exportContext)}><FileText className="h-4 w-4 mr-2" />Abrir impressao</Button>
          <Button className="h-12 rounded-2xl gradient-gold text-primary-foreground" onClick={handleConvert} disabled={actionLoading === "convert" || form.items.length === 0}>{actionLoading === "convert" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Converter em reserva</Button>
        </div>
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <button type="button" onClick={() => navigate("/quotes")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Voltar para propostas</button>
            <div className="mt-4 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-bold tracking-tight">{editingQuote ? "Editar proposta" : "Nova proposta / reserva"}</h1>{editingQuote ? <StatusBadge status={selectedQuoteStatus} /> : null}</div>
            <p className="mt-2 text-sm text-muted-foreground">Fluxo unico para proposta comercial e futura reserva, com busca de cliente, composicao de kits e conversao sem retrabalho.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { saveLocalDraft(); toast.success("Rascunho local salvo nesta etapa."); }}><Save className="h-4 w-4 mr-2" />Salvar etapa</Button>
            <Button variant="outline" onClick={handlePreview}><Eye className="h-4 w-4 mr-2" />Visualizar previa</Button>
          </div>
        </div>

        <div className="rounded-[32px] border border-border/60 bg-card/70 p-5 premium-shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Progresso do wizard</p><p className="mt-2 text-lg font-semibold">{steps[activeStep].title}</p></div><p className="text-sm text-muted-foreground">{activeStep + 1} de {steps.length}</p></div>
          <div className="mt-5 h-2 rounded-full bg-muted/50"><motion.div className="h-full rounded-full gradient-gold" animate={{ width: `${progress}%` }} /></div>
          <div className="mt-5 grid gap-3 xl:grid-cols-7">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isDone = index < activeStep;
              return (
                <button key={step.id} type="button" onClick={() => { if (index <= activeStep) { setActiveStep(index); setValidationMessage(""); } }} className={`rounded-2xl border px-4 py-3 text-left transition-all ${isActive ? "border-primary/40 bg-primary/10" : isDone ? "border-primary/20 bg-primary/5" : "border-border/50 bg-background/30"}`}>
                  <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>{isDone ? <Check className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}</div>
                  <p className="mt-3 text-sm font-semibold">{step.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[32px] border border-border/60 bg-card/70 p-6 premium-shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Etapa atual</p><h2 className="mt-2 text-2xl font-semibold">{steps[activeStep].title}</h2></div><div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">{steps[activeStep].description}</div></div>
            {validationMessage ? <Alert className="mt-5 border-destructive/30 bg-destructive/10 text-sm text-destructive">{validationMessage}</Alert> : null}
            <div className="mt-6 min-h-[420px]"><AnimatePresence mode="wait"><motion.div key={steps[activeStep].id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}>{stepContent()}</motion.div></AnimatePresence></div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" onClick={() => { const previousStep = Math.max(0, activeStep - 1); setActiveStep(previousStep); setValidationMessage(""); saveLocalDraft(previousStep); }} disabled={activeStep === 0}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => persistQuote("draft")} disabled={actionLoading !== null}>{actionLoading === "draft" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Salvar rascunho</Button>
                {activeStep < steps.length - 1 ? <Button className="gradient-gold text-primary-foreground" onClick={goNext}>Continuar<ArrowRight className="h-4 w-4 ml-2" /></Button> : <>
                  <Button variant="outline" onClick={() => persistQuote("sent")} disabled={actionLoading !== null}>{actionLoading === "send" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Salvar e enviar</Button>
                  <Button className="gradient-gold text-primary-foreground" onClick={() => persistQuote("draft")} disabled={actionLoading !== null}>{actionLoading === "save" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Finalizar</Button>
                </>}
              </div>
            </div>
          </div>

          <div ref={previewRef} className="space-y-6">
            <div className="rounded-[32px] border border-primary/20 bg-primary/5 p-6 premium-shadow">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Resumo ao vivo</p>
              <h3 className="mt-3 text-xl font-semibold">{selectedClient?.name ?? "Selecione um cliente"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{selectedClient?.company ?? "O cliente aparece aqui assim que for definido."}</p>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-border/50 bg-background/40 p-4"><p className="text-xs text-muted-foreground">Locacao</p><p className="mt-1 font-medium">{formatDate(form.rentalStartDate)} ate {formatDate(form.rentalEndDate)}</p></div>
                <div className="rounded-2xl border border-border/50 bg-background/40 p-4"><p className="text-xs text-muted-foreground">Validade</p><p className="mt-1 font-medium">{formatDate(form.validUntil)}</p></div>
              </div>
            </div>
            <div className="rounded-[32px] border border-border/60 bg-card/70 p-6 premium-shadow-lg backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Previa da proposta</p><h3 className="mt-2 text-xl font-semibold">{previewQuote.id}</h3></div><StatusBadge status={selectedQuoteStatus} /></div>
              <div className="mt-5 space-y-3">{form.items.length ? form.items.map((item) => renderItemCard(item)) : <p className="text-sm text-muted-foreground">Os itens escolhidos aparecem aqui em tempo real.</p>}</div>
              <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Desconto</span><span>{formatCurrency(form.discount)}</span></div><div className="flex items-center justify-between text-lg font-semibold"><span>Total</span><span className="gradient-gold-text">{formatCurrency(total)}</span></div></div>
              <div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={handlePreview}><Eye className="h-4 w-4 mr-2" />Previa</Button><Button variant="outline" size="sm" onClick={handlePdf}><Download className="h-4 w-4 mr-2" />PDF</Button><Button variant="outline" size="sm" onClick={() => printQuote(exportContext)}><FileText className="h-4 w-4 mr-2" />Impressao</Button></div>
              <div className="mt-5 rounded-2xl border border-border/50 bg-background/40 p-4"><p className="mb-2 text-sm font-medium">Observacoes</p><p className="text-sm text-muted-foreground">{form.notes || "Sem observacoes adicionais por enquanto."}</p></div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default QuoteComposerPage;
