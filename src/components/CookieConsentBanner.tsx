import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "rentflow_cookie_consent";

export const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[100] pointer-events-none"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-[101] max-w-lg rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl premium-shadow-lg overflow-hidden"
          >
            <div className="p-5">
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">Uso de Cookies</h3>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Utilizamos cookies essenciais para o funcionamento da plataforma e cookies funcionais para melhorar sua experiencia. Ao continuar navegando, voce concorda com o uso de cookies.
              </p>

              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4 p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground space-y-2"
                >
                  <p><strong>Essenciais:</strong> autenticacao, seguranca e preferencias.</p>
                  <p><strong>Funcionais:</strong> tema, idioma e configuracoes salvas.</p>
                  <p><strong>Analiticos:</strong> dados anonimos para melhorias na experiencia.</p>
                  <p className="pt-1">
                    Saiba mais na nossa <Link to="/privacy" className="text-primary underline-offset-4 hover:underline">Politica de Privacidade</Link>.
                  </p>
                </motion.div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDecline}
                  className="flex-1 h-9 rounded-xl text-xs font-medium border border-border bg-background hover:bg-muted transition-colors"
                >
                  Somente essenciais
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex-1 h-9 rounded-xl text-xs font-semibold gradient-gold text-primary-foreground flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  Aceitar todos
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setExpanded((c) => !c)}
                className="mt-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors w-full text-center"
              >
                {expanded ? "Ver menos" : "Mais detalhes sobre os cookies"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
