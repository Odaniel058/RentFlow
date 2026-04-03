import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Copy, Download, Eye, FileText, Link2, Plus, Printer, Search, RefreshCcw, ThumbsDown, CheckCircle2, Pencil, WandSparkles } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { StatusBadge } from "@/components/StatusBadge";
import { QuoteKitBreakdown } from "@/components/quotes/QuoteKitBreakdown";
import { useAppData } from "@/contexts/AppDataContext";
import { Quote, QuoteStatus } from "@/data/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";
import { downloadQuotePdf, previewQuoteDocument, printQuote } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { createShareToken } from "@/lib/shareTokens";
import { toast } from "sonner";

const statuses: Array<{ value: QuoteStatus | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Rascunho" },
  { value: "sent", label: "Enviado" },
  { value: "approved", label: "Aprovado" },
  { value: "rejected", label: "Recusado" },
  { value: "converted", label: "Convertido" },
];

const QuotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, upsertQuote, convertQuoteToReservation } = useAppData();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const filtered = useMemo(() => state.quotes.filter((quote) => {
    const matchesSearch = !search || quote.clientName.toLowerCase().includes(search.toLowerCase()) || quote.id.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter !== "all" && quote.status !== statusFilter) return false;
    return true;
  }), [search, state.quotes, statusFilter]);

  useEffect(() => {
    setSelectedId((current) => current && filtered.some((quote) => quote.id === current) ? current : filtered[0]?.id ?? state.quotes[0]?.id ?? null);
  }, [filtered, state.quotes]);

  const selected = state.quotes.find((quote) => quote.id === selectedId) ?? filtered[0] ?? null;
  const selectedClient = selected ? state.clients.find((client) => client.id === selected.clientId) : undefined;
  const selectedExportContext = selected ? { quote: selected, settings: state.settings, client: selectedClient, equipment: state.equipment, kits: state.kits } : null;

  const updateStatus = (quote: Quote, status: QuoteStatus) => {
    upsertQuote({ ...quote, status });
    toast.success(`Proposta ${quote.id} atualizada.`);
  };

  const handleConvert = (quote: Quote) => {
    const reservation = convertQuoteToReservation(quote.id);
    if (reservation) toast.success(`Proposta convertida na reserva ${reservation.id}.`);
  };

  const handleShare = (quote: Quote) => {
    if (!user) return;
    const token = createShareToken(user.tenantId, quote.id);
    const url = `${window.location.origin}${window.location.pathname}#/proposta/${token}`;
    setShareUrl(url);
    setShareDialogOpen(true);
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl).then(() => toast.success("Link copiado!")).catch(() => toast.error("Erro ao copiar."));
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Propostas</h1>
            <p className="mt-1 text-sm text-muted-foreground">Fluxo comercial centralizado para proposta, PDF e conversao em reserva.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate("/quotes/new")}><WandSparkles className="mr-2 h-4 w-4" />Abrir composer</Button>
            <Button className="gradient-gold text-primary-foreground hover:opacity-90" onClick={() => navigate("/quotes/new")}><Plus className="mr-2 h-4 w-4" />Nova proposta / reserva</Button>
          </div>
        </div>

        <div className="glass-card p-4 premium-shadow">
          <div className="grid gap-3 xl:grid-cols-[1.8fr_1fr]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por cliente ou codigo..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as QuoteStatus | "all")} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <div className="grid gap-4">
            {filtered.map((quote, index) => (
              <motion.button key={quote.id} type="button" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={`glass-card p-5 premium-shadow cursor-pointer text-left transition-all ${selectedId === quote.id ? "border-primary/30 bg-primary/5" : "hover:premium-shadow-lg"}`} onClick={() => setSelectedId(quote.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12"><FileText className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="flex items-center gap-2"><span className="text-sm font-mono text-muted-foreground">{quote.id}</span><StatusBadge status={quote.status} /></div>
                      <p className="mt-1 text-sm font-medium">{quote.clientName}</p>
                      <p className="text-xs text-muted-foreground">Locacao {formatDate(quote.rentalStartDate)} ate {formatDate(quote.rentalEndDate)}</p>
                      <p className="text-xs text-muted-foreground">Emitido em {formatDate(quote.createdAt)} • valido ate {formatDate(quote.validUntil)}</p>
                    </div>
                  </div>
                  <div className="text-right"><p className="text-lg font-bold gradient-gold-text">{formatCurrency(quote.total)}</p><p className="text-xs text-muted-foreground">{quote.items.length} item(ns)</p></div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-4">
                  {quote.items.map((item) => <span key={item.id} className="rounded-full border border-border/60 bg-surface px-3 py-1 text-xs text-muted-foreground">{item.quantity}x {item.name} • {item.days}d</span>)}
                </div>
              </motion.button>
            ))}
            {filtered.length === 0 ? <div className="glass-card p-14 premium-shadow text-center text-muted-foreground"><FileText className="mx-auto mb-3 h-10 w-10 opacity-40" /><p className="text-sm font-medium">Nenhuma proposta encontrada</p><p className="mt-1 text-xs">Crie uma proposta no composer ou ajuste os filtros.</p></div> : null}
          </div>

          <div className="glass-card h-fit p-6 premium-shadow xl:sticky xl:top-8">
            {selected ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">Previa da proposta</p><h3 className="text-xl font-semibold">{selected.id}</h3><p className="text-sm text-muted-foreground">{selected.clientName}</p></div>
                  <StatusBadge status={selected.status} />
                </div>
                <div className="rounded-xl border border-border/60 bg-surface/30 p-4 text-sm">
                  <p className="font-medium">Periodo</p>
                  <p className="mt-1 text-muted-foreground">{formatDate(selected.rentalStartDate)} ate {formatDate(selected.rentalEndDate)}</p>
                  <p className="mt-3 font-medium">Validade</p>
                  <p className="mt-1 text-muted-foreground">{formatDate(selected.validUntil)}</p>
                </div>
                <div className="space-y-3">
                  {selected.items.map((item) => (
                    <div key={item.id} className="rounded-xl border border-border/60 bg-surface/40 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.quantity}x • {item.days} diarias • {formatCurrency(item.dailyRate)}/dia</p></div>
                        <p className="text-sm font-semibold">{formatCurrency(item.quantity * item.dailyRate * item.days)}</p>
                      </div>
                      <QuoteKitBreakdown item={item} kits={state.kits} />
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Desconto</span><span>{formatCurrency(selected.discount)}</span></div>
                  <div className="flex items-center justify-between text-base font-semibold"><span>Total final</span><span className="gradient-gold-text">{formatCurrency(selected.total)}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/quotes/${selected.id}/edit`)}><Pencil className="mr-2 h-4 w-4" />Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => handleConvert(selected)} disabled={selected.status === "converted"}><RefreshCcw className="mr-2 h-4 w-4" />Converter</Button>
                  <Button variant="outline" size="sm" onClick={() => updateStatus(selected, "approved")}><CheckCircle2 className="mr-2 h-4 w-4" />Aprovar</Button>
                  <Button variant="outline" size="sm" onClick={() => updateStatus(selected, "rejected")}><ThumbsDown className="mr-2 h-4 w-4" />Recusar</Button>
                  <Button variant="outline" size="sm" onClick={() => selectedExportContext && printQuote(selectedExportContext)}><Printer className="mr-2 h-4 w-4" />Imprimir</Button>
                  <Button variant="outline" size="sm" onClick={() => selectedExportContext && downloadQuotePdf(selectedExportContext)}><Download className="mr-2 h-4 w-4" />Baixar PDF</Button>
                  <Button variant="outline" size="sm" className="col-span-2 gradient-gold text-primary-foreground border-0" onClick={() => handleShare(selected)}><Link2 className="mr-2 h-4 w-4" />Gerar link para cliente</Button>
                </div>
                <div className="rounded-xl border border-border/60 bg-surface/30 p-4"><p className="mb-2 text-sm font-medium">Observacoes</p><p className="text-sm text-muted-foreground">{selected.notes || "Sem observacoes adicionais."}</p></div>
                <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Fluxo principal acontece na pagina dedicada.</span><Button variant="ghost" size="sm" onClick={() => selectedExportContext && previewQuoteDocument(selectedExportContext)}><Eye className="mr-2 h-4 w-4" />Abrir previa</Button></div>
              </div>
            ) : (
              <div className="py-8 text-center"><FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">Selecione uma proposta para ver a previa completa.</p></div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-lg glass-card premium-shadow">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Link2 className="h-4 w-4" />Link público da proposta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Envie este link para o cliente. Ele pode visualizar a proposta e responder (aceitar ou recusar) sem precisar de login.
            </p>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={copyShareUrl} className="shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
              <p>• O link é permanente e reutilizável para esta proposta</p>
              <p>• Quando o cliente aceitar, o status atualiza automaticamente</p>
              <p>• Funciona apenas no mesmo dispositivo/navegador (demo)</p>
            </div>
            <Button className="w-full gradient-gold text-primary-foreground border-0" onClick={copyShareUrl}>
              <Copy className="mr-2 h-4 w-4" />Copiar link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default QuotesPage;
