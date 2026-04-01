import React, { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Client } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ClientSearchSelectProps {
  clients: Client[];
  value: string;
  onChange: (clientId: string) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export const ClientSearchSelect: React.FC<ClientSearchSelectProps> = ({
  clients,
  value,
  onChange,
  placeholder = "Buscar cliente por nome, empresa ou documento...",
  emptyMessage = "Nenhum cliente encontrado para a busca atual.",
}) => {
  const [query, setQuery] = useState("");

  const selectedClient = clients.find((client) => client.id === value) ?? null;

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return clients;
    }

    return clients.filter((client) =>
      [client.name, client.company, client.contactName, client.document, client.email]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedQuery)),
    );
  }, [clients, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-10"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {selectedClient ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cliente selecionado</p>
              <p className="mt-2 text-sm font-semibold">{selectedClient.name}</p>
              <p className="text-xs text-muted-foreground">{selectedClient.company}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {selectedClient.email} - {selectedClient.phone}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
                setQuery("");
              }}
            >
              Limpar
            </Button>
          </div>
        </div>
      ) : null}

      <div className="max-h-80 space-y-3 overflow-auto pr-1">
        {filteredClients.length ? (
          filteredClients.map((client) => {
            const isSelected = client.id === value;
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => {
                  onChange(client.id);
                  setQuery("");
                }}
                className={`w-full rounded-[24px] border p-4 text-left transition-all ${
                  isSelected
                    ? "border-primary/40 bg-primary/10 premium-shadow"
                    : "border-border/60 bg-surface/40 hover:border-primary/20 hover:bg-surface/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{client.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{client.company}</p>
                  </div>
                  {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>{client.email}</p>
                  <p>{client.phone}</p>
                  <p>{client.document}</p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-surface/30 p-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};
