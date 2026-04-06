import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppLayout } from "@/components/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { BackToTop } from "@/components/BackToTop";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import ReservationsPage from "./pages/ReservationsPage";
import QuotesPage from "./pages/QuotesPage";
import QuoteComposerPage from "./pages/QuoteComposerPage";
import AgendaPage from "./pages/AgendaPage";
import ClientsPage from "./pages/ClientsPage";
import KitsPage from "./pages/KitsPage";
import ContractsPage from "./pages/ContractsPage";
import FinancialPage from "./pages/FinancialPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import PublicQuotePage from "./pages/PublicQuotePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AppDataProvider>
          <TooltipProvider>
            <HashRouter>
              <ErrorBoundary>
                <Toaster />
                <Sonner
                  position="bottom-right"
                  toastOptions={{
                    classNames: {
                      toast:
                        "!bg-card/95 !border-border/60 !backdrop-blur-xl !shadow-[0_0_0_1px_hsl(var(--border)/0.5),0_12px_40px_-8px_hsl(0_0%_0%/0.25)] !rounded-2xl",
                      title: "!font-semibold !text-foreground !text-sm",
                      description: "!text-muted-foreground !text-xs",
                      actionButton: "!bg-primary !text-primary-foreground",
                      cancelButton: "!bg-muted !text-muted-foreground",
                    },
                  }}
                />
                <CookieConsentBanner />
                <BackToTop />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/features" element={<LandingPage />} />
                  <Route path="/how-it-works" element={<LandingPage />} />
                  <Route path="/benefits" element={<LandingPage />} />
                  <Route path="/security" element={<LandingPage />} />
                  <Route path="/pricing" element={<LandingPage />} />
                  <Route path="/faq" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/entrar" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/cadastro" element={<SignupPage />} />
                  <Route path="/proposta/:token" element={<PublicQuotePage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfUsePage />} />
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/inventario" element={<InventoryPage />} />
                    <Route path="/reservations" element={<ReservationsPage />} />
                    <Route path="/locacoes" element={<ReservationsPage />} />
                    <Route path="/reservas" element={<ReservationsPage />} />
                    <Route path="/quotes" element={<QuotesPage />} />
                    <Route path="/propostas" element={<QuotesPage />} />
                    <Route path="/orcamentos" element={<QuotesPage />} />
                    <Route path="/quotes/new" element={<QuoteComposerPage />} />
                    <Route path="/propostas/nova" element={<QuoteComposerPage />} />
                    <Route path="/orcamentos/novo" element={<QuoteComposerPage />} />
                    <Route path="/quotes/:quoteId/edit" element={<QuoteComposerPage />} />
                    <Route path="/propostas/:quoteId/editar" element={<QuoteComposerPage />} />
                    <Route path="/calendar" element={<AgendaPage />} />
                    <Route path="/agenda" element={<AgendaPage />} />
                    <Route path="/calendario" element={<AgendaPage />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/clientes" element={<ClientsPage />} />
                    <Route path="/kits" element={<KitsPage />} />
                    <Route path="/contracts" element={<ContractsPage />} />
                    <Route path="/contratos" element={<ContractsPage />} />
                    <Route path="/finance" element={<FinancialPage />} />
                    <Route path="/financial" element={<FinancialPage />} />
                    <Route path="/financeiro" element={<FinancialPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/relatorios" element={<ReportsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/configuracoes" element={<SettingsPage />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </HashRouter>
          </TooltipProvider>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
