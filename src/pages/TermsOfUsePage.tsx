import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, ArrowLeft, FileText, Mail, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfUsePage = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-cinematic opacity-60" />
      <div className="absolute inset-x-0 top-0 h-[38rem] cinematic-beam opacity-40" />

      <nav className="fixed top-0 inset-x-0 z-50">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="nav-shell">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="brand-badge">
                <Film className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-base tracking-tight">RentFlow</span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="rounded-xl gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao inicio
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-3xl px-4 pt-32 pb-24 sm:px-6"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Termos de Uso
            </h1>
            <p className="text-sm text-white/60 mt-1">Regras de utilizacao da plataforma</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-10 text-sm text-white/50">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Atualizado em 05/04/2026</span>
        </div>

        <div className="space-y-10 text-white/75 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Aceitacao dos Termos</h2>
            <p>Ao acessar e utilizar a plataforma RentFlow, voce concorda integralmente com estes Termos de Uso. Se nao concordar com qualquer disposicao, nao utilize a plataforma. Os presentes termos constituem um acordo vinculativo entre o usuario e o RentFlow.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Descricao do Servico</h2>
            <p className="mb-3">O RentFlow e uma plataforma SaaS (Software as a Service) de gestao para locadoras de equipamentos audiovisuais, que oferece:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Gestao de inventario de equipamentos.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Controle de reservas, retiradas e devolucoes.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Criacao de orcamentos e contratos.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Gestao de clientes e equipes.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Relatorios e indicadores financeiros.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Agenda e calendario operacional.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Conta e Responsabilidades</h2>
            <p className="mb-3">Para utilizar o servico, e necessario criar uma conta com informacoes verdadeiras e atualizadas. O titular da conta e responsavel por:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Manter a confidencialidade das credenciais de acesso.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Todas as atividades realizadas atraves da conta.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Notificar imediatamente qualquer acesso nao autorizado.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Nao compartilhar a conta com pessoas nao autorizadas.</span></li>
            </ul>
            <p className="mt-3">O RentFlow reserva-se o direito de suspender ou encerrar contas que violem estes termos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Planos e Pagamento</h2>
            <p className="mb-3">O servico e oferecido nos planos descritos na pagina de precos, que incluem:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Starter:</strong> para locadoras em fase inicial, ate 1 usuario e 50 equipamentos.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Business:</strong> para operacoes em crescimento, ate 5 usuarios e 300 equipamentos.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Enterprise:</strong> para grandes locadoras com necessidades customizadas.</span></li>
            </ul>
            <p className="mt-3">O periodo de teste gratuito dura 14 dias. Apos o termino, e necessario assinar um plano para continuar usando a plataforma. Cobrancas sao realizadas conforme o plano selecionado.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Periodo de Teste Gratuito</h2>
            <p>Durante os 14 dias de teste gratuito, todas as funcionalidades do plano selecionado ficam disponiveis. Nao e necessario cartao de credito para iniciar o teste. Ao final do periodo, o usuario pode optar por assinar um plano ou ter seus dados disponibilizados para exportacao por 30 dias.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Cancelamento e Encerramento</h2>
            <p className="mb-3">O usuario pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais. Apos o cancelamento:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>O acesso continua ate o final do periodo ja pago.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Os dados ficam disponiveis para exportacao por 30 dias.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Os dados sao eliminados definitivamente apos 90 dias.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Propriedade Intelectual</h2>
            <p>Todos os direitos de propriedade intelectual relacionados ao RentFlow, incluindo codigo, design, marcas, logotipos e conteudo, sao de propriedade exclusiva do RentFlow LTDA. O usuario recebe uma licenca limitada, nao exclusiva e intransferivel para usar a plataforma conforme estes termos. E vedada a reproducao, distribuicao ou modificacao nao autorizada.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Conduta Proibida</h2>
            <p className="mb-3">O usuario nao deve:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Utilizar a plataforma para fins ilicitos ou nao autorizados.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Tentar acessar, modificar ou excluir dados de outras contas.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Realizar engenharia reversa, descompilar ou tentar extrair o codigo-fonte.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Utilizar a plataforma de forma que comprometa a seguranca ou disponibilidade.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Cadastrar informacoes falsas de clientes ou equipamentos.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Disponibilidade e SLA</h2>
            <p>Buscamos manter a disponibilidade da plataforma em 99,9% do tempo. No entanto, interrupcoes planejadas para manutencao podem ocorrer e serao comunicadas com antecedencia. O RentFlow nao se responsabiliza por indisponibilidade decorrente de fatores externos, como falhas de provedores de internet.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Limitacao de Responsabilidade</h2>
            <p>O RentFlow e fornecido "como esta". A plataforma nao se responsabiliza por danos diretos ou indiretos decorrentes do uso ou impossibilidade de uso, incluindo perda de dados, lucros cessantes ou interrupcao de operacoes. O usuario e responsavel pelos dados que cadastra na plataforma e pelo uso adequado das funcionalidades. A responsabilidade maxima do RentFlow em qualquer reclamacao e limitada ao valor pago pelo usuario nos ultimos 12 meses.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Alteracoes nos Termos</h2>
            <p>O RentFlow pode modificar estes Termos de Uso periodicamente. Alteracoes significativas serao comunicadas ao usuario por email ou aviso na plataforma com pelo menos 30 dias de antecedencia. O uso continuado da plataforma apos as alteracoes constitui aceitacao dos novos termos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Legisricao Aplicavel e Foro</h2>
            <p>Estes termos sao regidos pela legislacao brasileira. Para a resolucao de controversias, fica eleito o foro da comarca da sede do RentFlow, com exclusao de qualquer outro, por mais privilegiado que seja.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Contato</h2>
            <p>Para duvidas sobre estes termos:</p>
            <div className="mt-4 p-5 rounded-2xl border border-white/10 bg-white/5">
              <p className="flex items-center gap-2 text-white mb-2"><Mail className="h-4 w-4 text-primary" /> contato@rentflow.app</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Link to="/">
            <Button variant="outline" className="rounded-xl gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              Voltar a pagina inicial
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfUsePage;
