import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Eye, Plus, Printer, ScrollText } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { StatusBadge } from "@/components/StatusBadge";
import { useAppData } from "@/contexts/AppDataContext";
import { Contract, ContractStatus } from "@/data/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";
import { downloadContractPdf, printContract } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const templateContract = (reservationId: string, clientName: string) =>
  `Contrato gerado automaticamente para a reserva ${reservationId}, vinculada ao cliente ${clientName}. As partes concordam com a devolucao integral dos itens nas mesmas condicoes da retirada.`;

const AnimatedNumber = ({ value, decimals = 2 }: { value: number; decimals?: number }) => {
  const formatted = formatCurrency(value);
  const chars = formatted.split("");
  return (
    <span className="inline-flex">
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.025, type: "spring", stiffness: 200, damping: 15 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

const ContractsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, upsertContract } = useAppData();
  const [selectedId, setSelectedId] = useState<string | null>(state.contracts[0]?.id ?? null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState({
    reservationId: state.reservations[0]?.id ?? "",
    status: "draft" as ContractStatus,
    content: templateContract(state.reservations[0]?.id ?? "RES-001", state.reservations[0]?.clientName ?? "Cliente"),
  });

  const selected = state.contracts.find((contract) => contract.id === selectedId) ?? null;

  const handleGenerate = useCallback(() => {
    const reservation = state.reservations.find((item) => item.id === form.reservationId);
    if (!reservation) {
      toast.error("Selecione uma reserva valida para gerar o contrato.");
      return;
    }

    const record = upsertContract({
      reservationId: reservation.id,
      clientId: reservation.clientId,
      clientName: reservation.clientName,
      status: form.status,
      createdAt: "2026-03-16",
      value: reservation.totalValue,
      content: form.content || templateContract(reservation.id, reservation.clientName),
    });
    setSelectedId(record.id);
    setEditorOpen(false);
    toast.success("Contrato gerado com sucesso.");
  }, [state.reservations, form, upsertContract]);

  const updateStatus = useCallback((contract: Contract, status: ContractStatus) => {
    upsertContract({ ...contract, status });
    setSelectedId(contract.id);
    toast.success("Status do contrato atualizado.");
  }, [upsertContract]);

  const activeStatuses = ["draft", "signed", "active", "completed"] as const;
  const statusLabels: Record<string, string> = { draft: "Rascunho", signed: "Assinado", active: "Ativo", completed: "Concluido" };
  const statusColors: Record<string, string> = {
    draft: "from-muted-foreground/70 to-muted-foreground/40",
    signed: "from-blue-500/70 to-blue-400/40",
    active: "from-primary/70 to-primary/40",
    completed: "from-green-500/70 to-green-400/40",
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-surface/80 to-background p-6 sm:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <motion.h1
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Contratos com forca legal
              </motion.h1>
              <motion.p
                className="text-sm text-muted-foreground mt-1 max-w-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                Gere, avalie e exporte contratos vinculados as reservas.
              </motion.p>
            </div>
            <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button className="gradient-gold text-primary-foreground shadow-md hover:shadow-lg transition-shadow">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo contrato
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl glass-card premium-shadow-lg">
                <DialogHeader>
                  <DialogTitle>Gerar contrato a partir de reserva</DialogTitle>
                  <p className="text-sm text-muted-foreground">Prepare o contrato com mais contexto antes de imprimir ou baixar o PDF.</p>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reserva</Label>
                    <select
                      value={form.reservationId}
                      onChange={(event) => {
                        const reservation = state.reservations.find((item) => item.id === event.target.value);
                        setForm((current) => ({
                          ...current,
                          reservationId: event.target.value,
                          content: templateContract(reservation?.id ?? "", reservation?.clientName ?? "Cliente"),
                        }));
                      }}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm w-full"
                    >
                      {state.reservations.map((reservation) => (
                        <option key={reservation.id} value={reservation.id}>
                          {reservation.id} &bull; {reservation.clientName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      value={form.status}
                      onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ContractStatus }))}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm w-full"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="signed">Assinado</option>
                      <option value="active">Ativo</option>
                      <option value="completed">Concluido</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Conteudo do contrato</Label>
                    <Textarea rows={8} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setEditorOpen(false)}>
                      Cancelar
                    </Button>
                    <Button className="gradient-gold text-primary-foreground" onClick={handleGenerate}>
                      Gerar contrato
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <div className="grid xl:grid-cols-[1.2fr_1fr] gap-6">
          <div className="glass-card premium-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Contrato</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Reserva</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Valor</th>
                  </tr>
                </thead>
                <AnimatePresence mode="popLayout">
                  <tbody>
                    {state.contracts.map((contract, index) => (
                      <motion.tr
                        key={contract.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                        transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 25 }}
                        whileHover={{ backgroundColor: "hsl(var(--primary)/0.06)" }}
                        className={`border-b border-border/50 cursor-pointer transition-shadow duration-200 ${
                          selectedId === contract.id
                            ? "bg-primary/5 shadow-[inset_3px_0_0_0_hsl(var(--primary)/0.6)]"
                            : "hover:shadow-[inset_3px_0_0_0_hsl(var(--primary)/0.2)]"
                        }`}
                        onClick={() => setSelectedId(contract.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ScrollText className="h-4 w-4 text-primary" />
                            <span className="text-sm font-mono">{contract.id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{contract.reservationId}</td>
                        <td className="px-4 py-3 text-sm font-medium">{contract.clientName}</td>
                        <td className="px-4 py-3"><StatusBadge status={contract.status} /></td>
                        <td className="px-4 py-3 text-sm font-semibold text-right">{formatCurrency(contract.value)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </AnimatePresence>
              </table>
            </div>
          </div>

          <div className="glass-card p-6 premium-shadow h-fit xl:sticky xl:top-8 xl:max-h-[calc(100vh-4rem)] xl:overflow-y-auto">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="space-y-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <motion.p
                        className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.05 }}
                      >
                        Detalhe do contrato
                      </motion.p>
                      <motion.h3
                        className="text-xl font-semibold"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 }}
                      >
                        {selected.id}
                      </motion.h3>
                      <motion.p
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.12 }}
                      >
                        {selected.clientName}
                      </motion.p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <StatusBadge status={selected.status} />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      className="rounded-xl border border-border/60 bg-surface/40 p-4"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <p className="text-xs text-muted-foreground mb-1">Reserva</p>
                      <p className="text-sm font-medium">{selected.reservationId}</p>
                    </motion.div>
                    <motion.div
                      className="rounded-xl border border-border/60 bg-surface/40 p-4"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.14 }}
                    >
                      <p className="text-xs text-muted-foreground mb-1">Emissao</p>
                      <p className="text-sm font-medium">{formatDate(selected.createdAt)}</p>
                    </motion.div>
                  </div>

                  <motion.div
                    className="rounded-xl border border-primary/20 bg-primary/5 p-4"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.18 }}
                  >
                    <p className="text-xs text-muted-foreground mb-1">Valor</p>
                    <p className="text-2xl font-semibold gradient-gold-text">
                      <AnimatedNumber value={selected.value} />
                    </p>
                  </motion.div>

                  <div className="space-y-2">
                    <Label>Status rapido</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {activeStatuses.map((status) => (
                        <Button
                          key={status}
                          variant={selected.status === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateStatus(selected, status)}
                          className={`relative overflow-hidden transition-colors ${
                            selected.status === status
                              ? `bg-gradient-to-r ${statusColors[status]} text-white border-0 shadow-sm`
                              : ""
                          }`}
                        >
                          {selected.status === status && (
                            <motion.span
                              layoutId="active-status-indicator"
                              className="absolute inset-0 bg-white/10"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{statusLabels[status]}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    className="rounded-xl border border-border/60 bg-surface/30 p-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 }}
                  >
                    <p className="text-sm font-medium mb-2">Conteudo</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.content}</p>
                  </motion.div>

                  <motion.div
                    className="grid grid-cols-2 gap-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                  >
                    <Button variant="outline" size="sm" onClick={() => printContract(selected, state.reservations.find((reservation) => reservation.id === selected.reservationId), state.settings)}>
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadContractPdf(selected, state.reservations.find((reservation) => reservation.id === selected.reservationId), state.settings)}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/clients")}>
                      <Eye className="h-4 w-4 mr-2" />
                      Cliente
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/reservations")}>
                      <Eye className="h-4 w-4 mr-2" />
                      Reserva
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-12"
                >
                  <ScrollText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Selecione um contrato para visualizar.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ContractsPage;
