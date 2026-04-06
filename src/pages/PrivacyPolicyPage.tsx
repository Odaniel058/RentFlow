import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, ArrowLeft, Shield, Mail, Building2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-cinematic opacity-60" />
      <div className="absolute inset-x-0 top-0 h-[38rem] cinematic-beam opacity-40" />

      {/* Nav */}
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Politica de Privacidade
            </h1>
            <p className="text-sm text-white/60 mt-1">Como tratamos e protegemos seus dados</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-10 text-sm text-white/50">
          <span className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" />Atualizado em 05/04/2026</span>
          <span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />RentFlow LTDA.</span>
        </div>

        {/* Content */}
        <div className="space-y-10 text-white/75 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Quem Somos</h2>
            <p>O RentFlow e uma plataforma de gestao para locadoras de equipamentos audiovisuais, desenvolvida com foco em seguranca, privacidade e conformidade com a Lei Geral de Protecao de Dados (LGPD - Lei n. 13.709/2018).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Dados Coletados</h2>
            <p className="mb-3">Coletamos e tratamos os seguintes tipos de dados:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Dados de identificacao:</strong> nome, email e telefone do usuario da conta.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Dados da empresa:</strong> razao social, CNPJ, endereco e telefone.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Dados de clientes finais:</strong> informacoes cadastradas pelos usuarios da plataforma sobre seus proprios clientes (nomes, contatos, documentos).</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Dados de uso:</strong> informacoes de navegacao, interacao com a plataforma e logs de acesso.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Dados tecnicos:</strong> endereco IP, tipo de navegador, sistema operacional e cookies.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Finalidade do Tratamento</h2>
            <p className="mb-3">Seus dados sao utilizados para:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Fornecer e manter a plataforma funcional.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Gerenciar contas, acessos e permissoes da equipe.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Permitir a gestao de inventario, reservas, orcamentos e contratos.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Enviar notificacoes e comunicacoes relacionadas ao servico.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Melhorar a experiencia e desenvolver novas funcionalidades.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Cumprir obrigacoes legais e regulatorias.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Isolamento de Dados por Locadora</h2>
            <p className="mb-3">Cada locadora opera em um workspace completamente isolado. Nenhuma informacao de uma conta e compartilhada ou acessivel por outra conta na plataforma. Os dados sao segregados a nivel de armazenamento e acesso.</p>
            <p>Os usuarios de uma locadora nao tem acesso aos dados de clientes, equipamentos, reservas ou qualquer outra informacao de outra locadora.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Seguranca dos Dados</h2>
            <p className="mb-3">Adotamos medidas tecnicas e organizacionais para proteger seus dados:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Criptografia SSL/TLS:</strong> toda comunicacao entre voce e o servidor e protegida.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Controle de acesso:</strong> permissoes por nivel de usuario com autenticacao segura.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Backup automatico:</strong> dados copiados diariamente com capacidade de restauracao.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Monitoramento:</strong> infraestrutura monitorada continuamente com alertas automaticos.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Compartilhamento de Dados</h2>
            <p><strong>Nao compartilhamos, vendemos ou transferimos seus dados para terceiros</strong>, exceto quando necessario para a prestacao do servico (ex.: servidores de hospedagem) ou por exigencia legal. Nenhum dado de seus clientes e utilizado para qualquer finalidade alem da gestao da sua propria locadora.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Retencao de Dados</h2>
            <p>Seus dados sao mantidos enquanto sua conta estiver ativa. Em caso de cancelamento, os dados permanecem disponiveis para exportacao por 30 dias e sao eliminados definitivamente apos 90 dias, salvo obrigacao legal de retencao.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Seus Direitos (LGPD)</h2>
            <p className="mb-3">Como titular de dados, voce tem direito a:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Acesso:</strong> saber quais dados temos sobre voce.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Correcao:</strong> solicitar correcao de dados incompletos, inexatos ou desatualizados.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Exclusao:</strong> pedir a eliminacao dos seus dados pessoais.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Portabilidade:</strong> solicitar a transferencia dos seus dados para outro servico.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Revogacao:</strong> retirar o consentimento a qualquer momento, sem prejuizo da licitude do tratamento anterior.</span></li>
            </ul>
            <p className="mt-3">Para exercer seus direitos, entre em contato pelo email <a href="mailto:contato@rentflow.app" className="text-primary hover:underline">contato@rentflow.app</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Cookies</h2>
            <p className="mb-3">Utilizamos cookies e tecnologias semelhantes para:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Essenciais:</strong> funcionamento da autenticacao e preferencias do usuario.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Funcionais:</strong> lembrar configuracoes como tema e idioma.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span><strong>Analiticos:</strong> entender como a plataforma e utilizada para melhorias.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Alteracoes nesta Politica</h2>
            <p>Podemos atualizar esta politica periodicamente. Alteracoes significativas serao comunicadas por email ou aviso na plataforma. A data da ultima atualizacao sera sempre indicada no inicio deste documento.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contato</h2>
            <p>Para duvidas sobre privacidade ou para exercer seus direitos:</p>
            <div className="mt-4 p-5 rounded-2xl border border-white/10 bg-white/5">
              <p className="flex items-center gap-2 text-white mb-2"><Mail className="h-4 w-4 text-primary" /> contato@rentflow.app</p>
            </div>
          </section>
        </div>

        {/* Back */}
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

export default PrivacyPolicyPage;
