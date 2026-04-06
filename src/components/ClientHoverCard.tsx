import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useAppData } from '@/contexts/AppDataContext';
import { formatCurrency } from '@/lib/format';
import { getAvatarGradient, getInitials } from '@/lib/avatar';
import { Mail, Phone, Building2 } from 'lucide-react';

interface ClientHoverCardProps {
  clientName: string;
  clientId?: string;
  children: React.ReactNode;
}

export const ClientHoverCard: React.FC<ClientHoverCardProps> = ({ clientName, clientId, children }) => {
  const { state } = useAppData();

  const client = clientId
    ? state.clients.find(c => c.id === clientId)
    : state.clients.find(c => c.name === clientName || c.contactName === clientName);

  const reservations = state.reservations.filter(r => r.clientId === client?.id);
  const totalSpent = reservations.reduce((sum, r) => sum + r.totalValue, 0);

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className="cursor-default hover:underline decoration-dashed decoration-primary/50 underline-offset-4 transition-colors">
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        className="glass-card premium-shadow border-border/50 w-72 p-0 overflow-hidden"
        side="top"
        align="start"
      >
        {/* Header with gradient */}
        <div className="p-4 pb-3 flex items-center gap-3" style={{ background: client ? `${getAvatarGradient(client.contactName)}22` : undefined }}>
          <div
            className="h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
            style={{ background: getAvatarGradient(client?.contactName ?? clientName) }}
          >
            {getInitials(client?.contactName ?? clientName)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{client?.contactName ?? clientName}</p>
            {client?.company && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                {client.company}
              </p>
            )}
          </div>
        </div>

        {client ? (
          <div className="px-4 pb-4 space-y-3">
            {/* Contact */}
            <div className="space-y-1.5">
              {client.email && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 flex-shrink-0 text-primary/60" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3 flex-shrink-0 text-primary/60" />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="rounded-xl bg-surface border border-border/40 px-3 py-2 text-center">
                <p className="text-base font-bold font-display">{reservations.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Reservas</p>
              </div>
              <div className="rounded-xl bg-surface border border-border/40 px-3 py-2 text-center">
                <p className="text-sm font-bold font-display gradient-gold-text">{formatCurrency(totalSpent)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Total gasto</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-4 pt-1">
            <p className="text-xs text-muted-foreground">Cliente não encontrado no sistema.</p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
