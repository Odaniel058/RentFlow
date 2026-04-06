import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Globe, Mail, MapPin, Phone, Plus, Search, Users, Pencil, Trash2, Landmark, BriefcaseBusiness, MessageSquareText } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useAppData } from "@/contexts/AppDataContext";
import { Client } from "@/data/mock-data";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ClientEditorDialog from "@/components/clients/ClientEditorDialog";
import { getAvatarGradient, getInitials } from "@/lib/avatar";

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, upsertClient, deleteClient } = useAppData();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(state.clients[0]?.id ?? null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    const searchValue = search.toLowerCase();
    return state.clients.filter((client) => {
      const haystack = [
        client.name,
        client.company,
        client.contactName,
        client.tradeName,
        client.legalName,
        client.email,
        client.document,
      ]
        .join(" ")
        .toLowerCase();
      return !searchValue || haystack.includes(searchValue);
    });
  }, [search, state.clients]);

  useEffect(() => {
    setSelectedId((current) => {
      if (current && filtered.some((client) => client.id === current)) {
        return current;
      }
      return filtered[0]?.id ?? state.clients[0]?.id ?? null;
    });
  }, [filtered, state.clients]);

  const selected = state.clients.find((client) => client.id === selectedId) ?? filtered[0] ?? null;
  const selectedReservations = useMemo(
    () => state.reservations.filter((reservation) => reservation.clientId === selected?.id),
    [selected?.id, state.reservations],
  );

  const totalSpent = selectedReservations.reduce((sum, reservation) => sum + reservation.totalValue, 0);

  const openCreate = () => {
    setEditingClient(null);
    setEditorOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setSelectedId(client.id);
    setEditorOpen(true);
  };

  const handleSave = async (payload: Omit<Client, "id">, id?: string) => {
    const record = upsertClient({ ...payload, id });
    setSelectedId(record.id);
    setEditingClient(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteClient(deleteTarget.id);
    if (selectedId === deleteTarget.id) setSelectedId(null);
    setDeleteTarget(null);
    toast.success("Cliente excluído.");
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="mt-1 text-sm text-muted-foreground">Cadastro empresarial completo com dados fiscais, contato financeiro e endereço detalhado.</p>
          </div>
          <Button className="gradient-gold text-primary-foreground" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo cliente
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar cliente, razão social, contato, email ou documento..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
            </div>
            <div className="space-y-3">
              {filtered.map((client, index) => {
                const reservations = state.reservations.filter((reservation) => reservation.clientId === client.id);
                const companyLabel = client.type === "company" ? client.tradeName || client.legalName || client.company : "Pessoa Física";

                return (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -1 }}
                    className={`glass-card p-4 transition-all duration-200 cursor-pointer ${
                      selectedId === client.id
                        ? "border-primary/35 bg-primary/6 premium-shadow-lg"
                        : "premium-shadow hover:border-primary/15 hover:premium-shadow-lg"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <button type="button" className="flex flex-1 items-center gap-3 text-left" onClick={() => setSelectedId(client.id)}>
                        <motion.div
                          animate={selectedId === client.id ? { scale: 1.08 } : { scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className={`flex h-11 w-11 items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 ${
                            selectedId === client.id ? "ring-2 ring-primary/30 ring-offset-1 ring-offset-background" : ""
                          }`}
                          style={{ background: getAvatarGradient(client.contactName) }}
                        >
                          <span className="text-sm font-bold text-white drop-shadow-sm">{getInitials(client.contactName)}</span>
                        </motion.div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium">{client.contactName}</p>
                            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-primary">
                              {client.type === "company" ? "PJ" : "PF"}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3 shrink-0" />
                            {companyLabel}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{client.document}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(client)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(client)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <span>{reservations.length} reservas</span>
                      <span className="text-right">{formatCurrency(reservations.reduce((sum, reservation) => sum + reservation.totalValue, 0))}</span>
                    </div>
                  </motion.div>
                );
              })}

              {filtered.length === 0 ? (
                <div className="glass-card p-14 premium-shadow text-center text-muted-foreground">
                  <Users className="mx-auto mb-3 h-10 w-10 opacity-40" />
                  <p className="text-sm font-medium">Nenhum cliente encontrado</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="glass-card h-fit p-6 premium-shadow xl:sticky xl:top-8">
            {selected ? (
              <div className="space-y-5">
                <div className="text-center">
                  <div
                    className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-primary/10"
                    style={{ background: getAvatarGradient(selected.contactName) }}
                  >
                    <span className="text-2xl font-bold text-white drop-shadow-sm">{getInitials(selected.contactName)}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{selected.contactName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selected.type === "company" ? selected.tradeName || selected.legalName || selected.company : "Pessoa Física"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/60 bg-surface/40 p-4 text-center">
                    <p className="text-lg font-semibold">{selectedReservations.length}</p>
                    <p className="text-xs text-muted-foreground">Reservas</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-surface/40 p-4 text-center">
                    <p className="text-lg font-semibold gradient-gold-text">{formatCurrency(totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">Total gasto</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{selected.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{selected.phone}</span>
                  </div>
                  {selected.secondaryPhone ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquareText className="h-4 w-4" />
                      <span>{selected.secondaryPhone}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Landmark className="h-4 w-4" />
                    <span>{selected.document}</span>
                  </div>
                  {selected.type === "company" && selected.legalName ? (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <BriefcaseBusiness className="mt-0.5 h-4 w-4" />
                      <div>
                        <p>{selected.legalName}</p>
                        {selected.stateRegistration ? <p className="text-xs">IE {selected.stateRegistration}</p> : null}
                      </div>
                    </div>
                  ) : null}
                  {(selected.address.street || selected.address.city) ? (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4" />
                      <div>
                        <p>
                          {[selected.address.street, selected.address.number].filter(Boolean).join(", ")}
                          {selected.address.complement ? ` - ${selected.address.complement}` : ""}
                        </p>
                        <p className="text-xs">
                          {[selected.address.district, selected.address.city, selected.address.state].filter(Boolean).join(" • ")}
                          {selected.address.zipCode ? ` • ${selected.address.zipCode}` : ""}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {selected.website ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>{selected.website}</span>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-xl border border-border/60 bg-surface/30 p-4">
                  <p className="mb-2 text-sm font-medium">Financeiro</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Responsável: {selected.financialContact || "Não informado"}</p>
                    <p>Email: {selected.financialEmail || "Não informado"}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-surface/30 p-4">
                  <p className="mb-2 text-sm font-medium">Observações internas</p>
                  <p className="text-sm text-muted-foreground">{selected.notes || "Sem observações registradas."}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Histórico de reservas</p>
                  {selectedReservations.length ? (
                    selectedReservations.slice(0, 4).map((reservation) => (
                      <button key={reservation.id} type="button" onClick={() => navigate("/reservations")} className="w-full rounded-xl border border-border/60 bg-surface/40 p-4 text-left hover:bg-surface transition-colors">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium">{reservation.id}</p>
                            <p className="text-xs text-muted-foreground">{reservation.equipment.join(", ")}</p>
                          </div>
                          <span className="text-sm font-semibold">{formatCurrency(reservation.totalValue)}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Ainda sem reservas vinculadas.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Selecione um cliente para ver detalhes.</p>
              </div>
            )}
          </div>
        </div>

        <ClientEditorDialog
          open={editorOpen}
          editingClient={editingClient}
          onOpenChange={(open) => {
            setEditorOpen(open);
            if (!open) setEditingClient(null);
          }}
          onSave={handleSave}
        />

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent className="glass-card premium-shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
              <AlertDialogDescription>
                O histórico continuará disponível em reservas já criadas, mas o cadastro será removido desta lista.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
};

export default ClientsPage;
