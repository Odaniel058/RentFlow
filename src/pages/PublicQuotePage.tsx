import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, FileText, Loader2, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";
import { getShareEntry } from "@/lib/shareTokens";
import { supabase, isSupabaseConfigured, missingSupabaseEnvMessage } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface QuoteItem {
  id: string;
  name: string;
  quantity: number;
  dailyRate: number;
  days: number;
}

interface RawQuote {
  id: string;
  clientName: string;
  items: QuoteItem[];
  total: number;
  discount: number;
  status: string;
  notes: string;
  rentalStartDate: string;
  rentalEndDate: string;
  validUntil: string;
}

interface RawSettings {
  companyName: string;
  email?: string;
  phone?: string;
}

const PublicQuotePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<RawQuote | null>(null);
  const [settings, setSettings] = useState<RawSettings | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setConfigError(missingSupabaseEnvMessage);
      setLoading(false);
      return;
    }

    const load = async () => {
      const entry = await getShareEntry(token);
      if (!entry) {
        setLoading(false);
        return;
      }

      setTenantId(entry.tenantId);

      const [{ data: quoteRow }, { data: itemRows }, { data: settingsRow }] = await Promise.all([
        supabase
          .from("quotes")
          .select("id, client_name, status, total, discount, notes, created_at_date, rental_start_date, rental_end_date, valid_until")
          .eq("id", entry.quoteId)
          .single(),
        supabase
          .from("quote_items")
          .select("id, name, quantity, daily_rate, days")
          .eq("quote_id", entry.quoteId),
        supabase
          .from("company_settings")
          .select("company_name, email, phone")
          .eq("tenant_id", entry.tenantId)
          .single(),
      ]);

      if (!quoteRow) {
        setLoading(false);
        return;
      }

      const mappedQuote: RawQuote = {
        id: quoteRow.id,
        clientName: quoteRow.client_name,
        status: quoteRow.status,
        total: Number(quoteRow.total),
        discount: Number(quoteRow.discount),
        notes: quoteRow.notes,
        rentalStartDate: quoteRow.rental_start_date,
        rentalEndDate: quoteRow.rental_end_date,
        validUntil: quoteRow.valid_until,
        items: (itemRows ?? []).map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          dailyRate: Number(i.daily_rate),
          days: i.days,
        })),
      };

      setQuote(mappedQuote);
      setStatus(mappedQuote.status);
      setSettings(settingsRow ? { companyName: settingsRow.company_name, email: settingsRow.email ?? undefined, phone: settingsRow.phone ?? undefined } : null);
      setLoading(false);
    };

    load();
  }, [token]);

  const handleAccept = async () => {
    if (!quote || !tenantId || !supabase) return;
    await supabase.from("quotes").update({ status: "approved" }).eq("id", quote.id);
    setStatus("approved");
  };

  const handleReject = async () => {
    if (!quote || !tenantId || !supabase) return;
    await supabase.from("quotes").update({ status: "rejected" }).eq("id", quote.id);
    setStatus("rejected");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md rounded-3xl border border-amber-500/30 bg-card p-8 text-center shadow-2xl">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-400" />
          <h1 className="text-xl font-semibold">Configuracao do Supabase pendente</h1>
          <p className="mt-3 text-sm text-muted-foreground">{configError}</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <XCircle className="h-14 w-14 text-muted-foreground/30 mx-auto" />
          <h1 className="text-xl font-semibold">Proposta nao encontrada</h1>
          <p className="text-sm text-muted-foreground">Este link e invalido ou a proposta foi removida.</p>
        </div>
      </div>
    );
  }

  const isResolved = status === "approved" || status === "rejected" || status === "converted";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg gradient-gold flex items-center justify-center text-sm font-bold text-primary-foreground">
              {settings?.companyName?.charAt(0)?.toUpperCase() ?? "R"}
            </div>
            <span className="font-semibold text-sm">{settings?.companyName ?? "RentFlow"}</span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{quote.id}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {status === "approved" && (
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5 flex items-center gap-4">
            <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
            <div>
              <p className="font-semibold text-green-600 dark:text-green-400">Proposta aceita!</p>
              <p className="text-sm text-muted-foreground mt-0.5">Nossa equipe entrara em contato para confirmar os detalhes.</p>
            </div>
          </div>
        )}
        {status === "rejected" && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex items-center gap-4">
            <XCircle className="h-6 w-6 text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-600 dark:text-red-400">Proposta recusada</p>
              <p className="text-sm text-muted-foreground mt-0.5">Se mudar de ideia, entre em contato conosco.</p>
            </div>
          </div>
        )}
        {status === "converted" && (
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 flex items-center gap-4">
            <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
            <div>
              <p className="font-semibold">Proposta ja aprovada</p>
              <p className="text-sm text-muted-foreground mt-0.5">Esta proposta ja foi convertida em reserva.</p>
            </div>
          </div>
        )}

        <div className="glass-card p-6 premium-shadow space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Proposta comercial</p>
              <h1 className="text-2xl font-bold">{quote.clientName}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Periodo: {formatDate(quote.rentalStartDate)} {"->"} {formatDate(quote.rentalEndDate)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Valido ate</p>
              <p className="text-sm font-medium mt-0.5">{formatDate(quote.validUntil)}</p>
            </div>
          </div>
          {(settings?.phone || settings?.email) && (
            <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
              {[settings.phone, settings.email].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />Itens da proposta
          </h2>
          {quote.items.map((item) => (
            <div key={item.id} className="glass-card p-4 premium-shadow flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.quantity}x · {item.days} diaria{item.days !== 1 ? "s" : ""} · {formatCurrency(item.dailyRate)}/dia
                </p>
              </div>
              <p className="font-semibold shrink-0">{formatCurrency(item.quantity * item.dailyRate * item.days)}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 premium-shadow space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(quote.total + quote.discount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Desconto</span>
            <span>- {formatCurrency(quote.discount)}</span>
          </div>
          <div className="border-t border-border/50 pt-4 flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold gradient-gold-text">{formatCurrency(quote.total)}</span>
          </div>
        </div>

        {quote.notes && (
          <div className="glass-card p-5 premium-shadow">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Observacoes</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{quote.notes}</p>
          </div>
        )}

        {!isResolved && (
          <div className="glass-card p-6 premium-shadow flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" className="rounded-xl" onClick={handleReject}>
              <ThumbsDown className="h-4 w-4 mr-2" />Recusar
            </Button>
            <Button className="gradient-gold text-primary-foreground rounded-xl" onClick={handleAccept}>
              <ThumbsUp className="h-4 w-4 mr-2" />Aceitar proposta
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicQuotePage;

