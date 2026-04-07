import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  AgendaEvent,
  AppDataState,
  Client,
  ClientAddress,
  CompanySettings,
  Contract,
  Equipment,
  Kit,
  Quote,
  QuoteLineItem,
  Reservation,
  calculateQuoteTotal,
  createSeededAppData,
  getEquipmentUsageSeries,
  getKPIs,
  getMonthlyRevenueSeries,
  getReservationStatusSeries,
  initialAppData,
} from "@/data/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { logActivity } from "@/lib/activityLog";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Upsert<T extends { id: string }> = Omit<T, "id"> & { id?: string };

interface AppDataContextType {
  state: AppDataState;
  isBootstrapping: boolean;
  analytics: {
    kpis: ReturnType<typeof getKPIs>;
    monthlyRevenue: ReturnType<typeof getMonthlyRevenueSeries>;
    reservationStatus: ReturnType<typeof getReservationStatusSeries>;
    equipmentUsage: ReturnType<typeof getEquipmentUsageSeries>;
  };
  upsertEquipment: (payload: Upsert<Equipment>) => Equipment;
  deleteEquipment: (id: string) => void;
  upsertClient: (payload: Upsert<Client>) => Client;
  deleteClient: (id: string) => void;
  upsertReservation: (payload: Upsert<Reservation>) => Reservation;
  deleteReservation: (id: string) => void;
  upsertQuote: (payload: Upsert<Quote>) => Quote;
  deleteQuote: (id: string) => void;
  convertQuoteToReservation: (quoteId: string) => Reservation | null;
  upsertKit: (payload: Upsert<Kit>) => Kit;
  deleteKit: (id: string) => void;
  upsertContract: (payload: Upsert<Contract>) => Contract;
  deleteContract: (id: string) => void;
  upsertAgendaEvent: (payload: Upsert<AgendaEvent>) => AgendaEvent;
  deleteAgendaEvent: (id: string) => void;
  updateSettings: (payload: CompanySettings) => void;
  resetData: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptyClientAddress = (): ClientAddress => ({
  zipCode: "", street: "", number: "", complement: "", district: "", city: "", state: "",
});

const createId = (prefix: string, records: { id: string }[]) => {
  const max = records.reduce((m, r) => {
    const n = Number(r.id.split("-")[1]);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
};

const upsertRecord = <T extends { id: string }>(records: T[], payload: Upsert<T>, prefix: string): T => {
  if (payload.id) {
    const existing = records.find((r) => r.id === payload.id);
    if (existing) return { ...existing, ...payload };
  }
  return { ...payload, id: createId(prefix, records) } as T;
};

// ─── DB ↔ App converters ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbToEquipment = (r: any): Equipment => ({
  id: r.id, name: r.name, category: r.category, brand: r.brand, model: r.model,
  serialNumber: r.serial_number, status: r.status, dailyRate: Number(r.daily_rate),
  location: r.location, notes: r.notes, supplier: r.supplier ?? undefined,
  acquisitionDate: r.acquisition_date ?? undefined, acquisitionCost: r.acquisition_cost ?? undefined,
});

const equipmentToDb = (tenantId: string, r: Equipment) => ({
  id: r.id, tenant_id: tenantId, name: r.name, category: r.category, brand: r.brand,
  model: r.model, serial_number: r.serialNumber, status: r.status,
  daily_rate: r.dailyRate, location: r.location, notes: r.notes,
  supplier: r.supplier ?? null, acquisition_date: r.acquisitionDate ?? null,
  acquisition_cost: r.acquisitionCost ?? null,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbToClient = (r: any): Client => ({
  id: r.id, type: r.type, name: r.name, company: r.company, contactName: r.contact_name,
  tradeName: r.trade_name, legalName: r.legal_name, stateRegistration: r.state_registration,
  financialContact: r.financial_contact, phone: r.phone, secondaryPhone: r.secondary_phone,
  email: r.email, financialEmail: r.financial_email, document: r.document,
  website: r.website, notes: r.notes,
  address: {
    zipCode: r.address_zip_code, street: r.address_street, number: r.address_number,
    complement: r.address_complement, district: r.address_district,
    city: r.address_city, state: r.address_state,
  },
});

const clientToDb = (tenantId: string, r: Client) => ({
  id: r.id, tenant_id: tenantId, type: r.type, name: r.name, company: r.company,
  contact_name: r.contactName, trade_name: r.tradeName, legal_name: r.legalName,
  state_registration: r.stateRegistration, financial_contact: r.financialContact,
  phone: r.phone, secondary_phone: r.secondaryPhone, email: r.email,
  financial_email: r.financialEmail, document: r.document, website: r.website,
  notes: r.notes, address_zip_code: r.address?.zipCode ?? "",
  address_street: r.address?.street ?? "", address_number: r.address?.number ?? "",
  address_complement: r.address?.complement ?? "", address_district: r.address?.district ?? "",
  address_city: r.address?.city ?? "", address_state: r.address?.state ?? "",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbToReservation = (r: any): Reservation => ({
  id: r.id, clientId: r.client_id, clientName: r.client_name,
  equipmentIds: r.equipment_ids ?? [], equipment: r.equipment ?? [],
  pickupDate: r.pickup_date, returnDate: r.return_date,
  totalValue: Number(r.total_value), status: r.status, notes: r.notes,
});

const reservationToDb = (tenantId: string, r: Reservation) => ({
  id: r.id, tenant_id: tenantId, client_id: r.clientId, client_name: r.clientName,
  equipment_ids: r.equipmentIds, equipment: r.equipment,
  pickup_date: r.pickupDate, return_date: r.returnDate,
  total_value: r.totalValue, status: r.status, notes: r.notes,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbToKit = (r: any): Kit => ({
  id: r.id, name: r.name, itemIds: r.item_ids ?? [], items: r.items ?? [],
  dailyRate: Number(r.daily_rate), description: r.description,
});

const kitToDb = (tenantId: string, r: Kit) => ({
  id: r.id, tenant_id: tenantId, name: r.name, item_ids: r.itemIds,
  items: r.items, daily_rate: r.dailyRate, description: r.description,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbToQuote = (r: any, items: QuoteLineItem[]): Quote => ({
  id: r.id, clientId: r.client_id, clientName: r.client_name, status: r.status,
  total: Number(r.total), createdAt: r.created_at_date,
  rentalStartDate: r.rental_start_date, rentalEndDate: r.rental_end_date,
  validUntil: r.valid_until, notes: r.notes, discount: Number(r.discount), items,
});

const quoteToDb = (tenantId: string, r: Quote) => ({
  id: r.id, tenant_id: tenantId, client_id: r.clientId, client_name: r.clientName,
  status: r.status, total: r.total, created_at_date: r.createdAt,
  rental_start_date: r.rentalStartDate, rental_end_date: r.rentalEndDate,
  valid_until: r.validUntil, notes: r.notes, discount: r.discount,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbToQuoteItem = (r: any): QuoteLineItem => ({
  id: r.id, type: r.type, refId: r.ref_id, name: r.name,
  quantity: r.quantity, dailyRate: Number(r.daily_rate), days: r.days,
});

const quoteItemToDb = (tenantId: string, quoteId: string, item: QuoteLineItem) => ({
  id: item.id, quote_id: quoteId, tenant_id: tenantId, type: item.type,
  ref_id: item.refId, name: item.name, quantity: item.quantity,
  daily_rate: item.dailyRate, days: item.days,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbToContract = (r: any): Contract => ({
  id: r.id, reservationId: r.reservation_id, clientId: r.client_id,
  clientName: r.client_name, status: r.status, createdAt: r.created_at_date,
  value: Number(r.value), content: r.content,
});

const contractToDb = (tenantId: string, r: Contract) => ({
  id: r.id, tenant_id: tenantId, reservation_id: r.reservationId,
  client_id: r.clientId, client_name: r.clientName, status: r.status,
  created_at_date: r.createdAt, value: r.value, content: r.content,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbToAgendaEvent = (r: any): AgendaEvent => ({
  id: r.id, type: r.type, reservationId: r.reservation_id ?? undefined,
  clientId: r.client_id ?? undefined, clientName: r.client_name,
  equipment: r.equipment ?? [], date: r.date, time: r.time, status: r.status,
  title: r.title ?? undefined, description: r.description ?? undefined,
  notes: r.notes ?? undefined,
});

const agendaEventToDb = (tenantId: string, r: AgendaEvent) => ({
  id: r.id, tenant_id: tenantId, type: r.type,
  reservation_id: r.reservationId ?? null, client_id: r.clientId ?? null,
  client_name: r.clientName, equipment: r.equipment,
  date: r.date, time: r.time, status: r.status,
  title: r.title ?? null, description: r.description ?? null, notes: r.notes ?? null,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbToSettings = (r: any): CompanySettings => ({
  companyName: r.company_name, logoUrl: r.logo_url, cnpj: r.cnpj,
  phone: r.phone, email: r.email, address: r.address, contactName: r.contact_name,
  themePreference: r.theme_preference, equipmentCategories: r.equipment_categories ?? [],
});

const settingsToDb = (tenantId: string, s: CompanySettings) => ({
  tenant_id: tenantId, company_name: s.companyName, logo_url: s.logoUrl,
  cnpj: s.cnpj, phone: s.phone, email: s.email, address: s.address,
  contact_name: s.contactName, theme_preference: s.themePreference,
  equipment_categories: s.equipmentCategories,
});

// ─── Fetch all tenant data from Supabase ──────────────────────────────────────

const fetchTenantData = async (tenantId: string): Promise<AppDataState> => {
  const [
    { data: equipmentRows },
    { data: clientRows },
    { data: reservationRows },
    { data: kitRows },
    { data: quoteRows },
    { data: quoteItemRows },
    { data: contractRows },
    { data: agendaRows },
    { data: settingsRow },
  ] = await Promise.all([
    supabase.from("equipment").select("*").eq("tenant_id", tenantId).order("created_at"),
    supabase.from("clients").select("*").eq("tenant_id", tenantId).order("created_at"),
    supabase.from("reservations").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false }),
    supabase.from("kits").select("*").eq("tenant_id", tenantId).order("created_at"),
    supabase.from("quotes").select("*").eq("tenant_id", tenantId).order("created_at_date", { ascending: false }),
    supabase.from("quote_items").select("*").eq("tenant_id", tenantId),
    supabase.from("contracts").select("*").eq("tenant_id", tenantId).order("created_at_date", { ascending: false }),
    supabase.from("agenda_events").select("*").eq("tenant_id", tenantId).order("date"),
    supabase.from("company_settings").select("*").eq("tenant_id", tenantId).single(),
  ]);

  const itemsByQuote = (quoteItemRows ?? []).reduce<Record<string, QuoteLineItem[]>>((acc, item) => {
    acc[item.quote_id] = [...(acc[item.quote_id] ?? []), dbToQuoteItem(item)];
    return acc;
  }, {});

  return {
    equipment: (equipmentRows ?? []).map(dbToEquipment),
    clients: (clientRows ?? []).map(dbToClient),
    reservations: (reservationRows ?? []).map(dbToReservation),
    kits: (kitRows ?? []).map(dbToKit),
    quotes: (quoteRows ?? []).map((r) => dbToQuote(r, itemsByQuote[r.id] ?? [])),
    contracts: (contractRows ?? []).map(dbToContract),
    agendaEvents: (agendaRows ?? []).map(dbToAgendaEvent),
    settings: settingsRow ? dbToSettings(settingsRow) : initialAppData.settings,
  };
};

// ─── Seed demo data into Supabase ─────────────────────────────────────────────

const seedDemoData = async (tenantId: string, companyName: string) => {
  const seeded = createSeededAppData(companyName);

  const equipmentInserts = seeded.equipment.map((e) => equipmentToDb(tenantId, e));
  const clientInserts = seeded.clients.map((c) => clientToDb(tenantId, c));

  await Promise.all([
    supabase.from("equipment").insert(equipmentInserts),
    supabase.from("clients").insert(clientInserts),
    supabase.from("company_settings").upsert(settingsToDb(tenantId, seeded.settings)),
  ]);

  if (seeded.reservations.length > 0) {
    await supabase.from("reservations").insert(seeded.reservations.map((r) => reservationToDb(tenantId, r)));
  }
  if (seeded.quotes.length > 0) {
    await supabase.from("quotes").insert(seeded.quotes.map((q) => quoteToDb(tenantId, q)));
    const allItems = seeded.quotes.flatMap((q) =>
      q.items.map((item) => quoteItemToDb(tenantId, q.id, item))
    );
    if (allItems.length > 0) await supabase.from("quote_items").insert(allItems);
  }
  if (seeded.kits.length > 0) {
    await supabase.from("kits").insert(seeded.kits.map((k) => kitToDb(tenantId, k)));
  }
  if (seeded.contracts.length > 0) {
    await supabase.from("contracts").insert(seeded.contracts.map((c) => contractToDb(tenantId, c)));
  }
  if (seeded.agendaEvents.length > 0) {
    await supabase.from("agenda_events").insert(seeded.agendaEvents.map((e) => agendaEventToDb(tenantId, e)));
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AppDataContext = createContext<AppDataContextType | null>(null);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [state, setState] = useState<AppDataState>(initialAppData);

  useEffect(() => {
    if (!user) {
      setState(initialAppData);
      setIsBootstrapping(false);
      return;
    }

    setIsBootstrapping(true);
    fetchTenantData(user.tenantId).then(async (data) => {
      // If no equipment exists and seedMode is demo, seed the data
      if (data.equipment.length === 0 && user.seedMode === "demo") {
        await seedDemoData(user.tenantId, user.company);
        const seeded = await fetchTenantData(user.tenantId);
        setState(seeded);
      } else {
        setState(data);
      }
      setIsBootstrapping(false);
    });
  }, [user]);

  const analytics = useMemo(
    () => ({
      kpis: getKPIs(state.reservations),
      monthlyRevenue: getMonthlyRevenueSeries(state.reservations),
      reservationStatus: getReservationStatusSeries(state.reservations),
      equipmentUsage: getEquipmentUsageSeries(state.reservations),
    }),
    [state.reservations],
  );

  // Optimistic update: update local state immediately, fire Supabase write in background
  const mutate = (updater: (current: AppDataState) => AppDataState) => {
    setState(updater);
  };

  const contextValue = useMemo<AppDataContextType>(
    () => ({
      state,
      isBootstrapping,
      analytics,

      upsertEquipment: (payload) => {
        const record = upsertRecord(state.equipment, payload, "EQ");
        mutate((s) => ({
          ...s,
          equipment: payload.id
            ? s.equipment.map((i) => (i.id === payload.id ? record : i))
            : [record, ...s.equipment],
        }));
        if (!user) return record;
        const dbRow = equipmentToDb(user.tenantId, record);
        supabase.from("equipment").upsert(dbRow);
        if (!payload.id) logActivity(user.tenantId, user.name, "created", "equipment", record.id, `Equipamento adicionado: ${record.name}`);
        return record;
      },

      deleteEquipment: (id) => {
        mutate((s) => ({
          ...s,
          equipment: s.equipment.filter((i) => i.id !== id),
          kits: s.kits.map((kit) => ({
            ...kit,
            itemIds: kit.itemIds.filter((iid) => iid !== id),
            items: kit.items.filter((name) => name !== s.equipment.find((e) => e.id === id)?.name),
          })),
        }));
        if (!user) return;
        supabase.from("equipment").delete().eq("id", id);
      },

      upsertClient: (payload) => {
        const record = upsertRecord(state.clients, payload, "CL");
        const normalized: Client = {
          ...record,
          address: { ...emptyClientAddress(), ...(record.address ?? {}) },
        };
        mutate((s) => ({
          ...s,
          clients: payload.id
            ? s.clients.map((i) => (i.id === payload.id ? normalized : i))
            : [normalized, ...s.clients],
        }));
        if (!user) return normalized;
        supabase.from("clients").upsert(clientToDb(user.tenantId, normalized));
        if (!payload.id) logActivity(user.tenantId, user.name, "created", "client", normalized.id, `Cliente cadastrado: ${normalized.name}`);
        return normalized;
      },

      deleteClient: (id) => {
        mutate((s) => ({ ...s, clients: s.clients.filter((i) => i.id !== id) }));
        if (!user) return;
        supabase.from("clients").delete().eq("id", id);
      },

      upsertReservation: (payload) => {
        const record = upsertRecord(state.reservations, payload, "RES");
        mutate((s) => ({
          ...s,
          reservations: payload.id
            ? s.reservations.map((i) => (i.id === payload.id ? record : i))
            : [record, ...s.reservations],
        }));
        if (!user) return record;
        supabase.from("reservations").upsert(reservationToDb(user.tenantId, record));
        logActivity(user.tenantId, user.name, payload.id ? "updated" : "created", "reservation", record.id,
          payload.id ? `Reserva atualizada: ${record.clientName}` : `Nova reserva para ${record.clientName}`);
        return record;
      },

      deleteReservation: (id) => {
        const target = state.reservations.find((r) => r.id === id);
        mutate((s) => ({
          ...s,
          reservations: s.reservations.filter((i) => i.id !== id),
          agendaEvents: s.agendaEvents.filter((i) => i.reservationId !== id),
          contracts: s.contracts.filter((i) => i.reservationId !== id),
        }));
        if (!user) return;
        // Contracts cascade via FK, agenda_events deleted explicitly
        supabase.from("agenda_events").delete().eq("reservation_id", id);
        supabase.from("reservations").delete().eq("id", id);
        if (target) logActivity(user.tenantId, user.name, "deleted", "reservation", id, `Reserva removida: ${target.clientName}`);
      },

      upsertQuote: (payload) => {
        const record = upsertRecord(
          state.quotes,
          { ...payload, total: calculateQuoteTotal(payload.items, payload.discount) },
          "ORC",
        );
        mutate((s) => ({
          ...s,
          quotes: payload.id
            ? s.quotes.map((i) => (i.id === payload.id ? record : i))
            : [record, ...s.quotes],
        }));
        if (!user) return record;
        supabase.from("quotes").upsert(quoteToDb(user.tenantId, record)).then(async () => {
          // Delete existing items and re-insert
          await supabase.from("quote_items").delete().eq("quote_id", record.id);
          if (record.items.length > 0) {
            await supabase.from("quote_items").insert(
              record.items.map((item) => quoteItemToDb(user.tenantId, record.id, item))
            );
          }
        });
        if (!payload.id) logActivity(user.tenantId, user.name, "created", "quote", record.id, `Proposta criada para ${record.clientName}`);
        return record;
      },

      deleteQuote: (id) => {
        mutate((s) => ({ ...s, quotes: s.quotes.filter((i) => i.id !== id) }));
        if (!user) return;
        // quote_items cascade via FK
        supabase.from("quotes").delete().eq("id", id);
      },

      convertQuoteToReservation: (quoteId) => {
        const quote = state.quotes.find((i) => i.id === quoteId);
        if (!quote) return null;

        const record: Reservation = {
          id: createId("RES", state.reservations),
          clientId: quote.clientId,
          clientName: quote.clientName,
          equipmentIds: quote.items.map((i) => i.refId),
          equipment: quote.items.map((i) => i.name),
          pickupDate: quote.rentalStartDate,
          returnDate: quote.rentalEndDate,
          totalValue: quote.total,
          status: "approved",
          notes: quote.notes,
        };

        const agendaEvent: AgendaEvent = {
          id: createId("EVT", state.agendaEvents),
          type: "reservation",
          reservationId: record.id,
          clientId: record.clientId,
          clientName: record.clientName,
          equipment: record.equipment,
          date: record.pickupDate,
          time: "09:00",
          status: "confirmed",
        };

        mutate((s) => ({
          ...s,
          reservations: [record, ...s.reservations],
          quotes: s.quotes.map((i) => (i.id === quoteId ? { ...i, status: "converted" } : i)),
          agendaEvents: [agendaEvent, ...s.agendaEvents],
        }));

        if (user) {
          supabase.from("reservations").insert(reservationToDb(user.tenantId, record));
          supabase.from("quotes").update({ status: "converted" }).eq("id", quoteId);
          supabase.from("agenda_events").insert(agendaEventToDb(user.tenantId, agendaEvent));
          logActivity(user.tenantId, user.name, "converted", "quote", quoteId, `Proposta convertida em reserva: ${quote.clientName}`);
        }

        return record;
      },

      upsertKit: (payload) => {
        const record = upsertRecord(state.kits, payload, "KIT");
        mutate((s) => ({
          ...s,
          kits: payload.id
            ? s.kits.map((i) => (i.id === payload.id ? record : i))
            : [record, ...s.kits],
        }));
        if (!user) return record;
        supabase.from("kits").upsert(kitToDb(user.tenantId, record));
        return record;
      },

      deleteKit: (id) => {
        mutate((s) => ({ ...s, kits: s.kits.filter((i) => i.id !== id) }));
        if (!user) return;
        supabase.from("kits").delete().eq("id", id);
      },

      upsertContract: (payload) => {
        const prevContract = payload.id ? state.contracts.find((c) => c.id === payload.id) : undefined;
        const record = upsertRecord(state.contracts, payload, "CTR");
        mutate((s) => ({
          ...s,
          contracts: payload.id
            ? s.contracts.map((i) => (i.id === payload.id ? record : i))
            : [record, ...s.contracts],
        }));
        if (!user) return record;
        supabase.from("contracts").upsert(contractToDb(user.tenantId, record));
        if (!payload.id) logActivity(user.tenantId, user.name, "created", "contract", record.id, `Contrato gerado`);
        else if (payload.status === "signed" && prevContract?.status !== "signed")
          logActivity(user.tenantId, user.name, "signed", "contract", record.id, `Contrato assinado`);
        return record;
      },

      deleteContract: (id) => {
        mutate((s) => ({ ...s, contracts: s.contracts.filter((i) => i.id !== id) }));
        if (!user) return;
        supabase.from("contracts").delete().eq("id", id);
      },

      upsertAgendaEvent: (payload) => {
        const record = upsertRecord(state.agendaEvents, payload, "EVT");
        mutate((s) => ({
          ...s,
          agendaEvents: payload.id
            ? s.agendaEvents.map((i) => (i.id === payload.id ? record : i))
            : [record, ...s.agendaEvents],
        }));
        if (!user) return record;
        supabase.from("agenda_events").upsert(agendaEventToDb(user.tenantId, record));
        return record;
      },

      deleteAgendaEvent: (id) => {
        mutate((s) => ({ ...s, agendaEvents: s.agendaEvents.filter((i) => i.id !== id) }));
        if (!user) return;
        supabase.from("agenda_events").delete().eq("id", id);
      },

      updateSettings: (payload) => {
        mutate((s) => ({ ...s, settings: payload }));
        if (!user) return;
        supabase.from("company_settings").upsert(settingsToDb(user.tenantId, payload));
      },

      resetData: async () => {
        if (!user) return;
        // Delete all tenant data (cascade handles children)
        await Promise.all([
          supabase.from("agenda_events").delete().eq("tenant_id", user.tenantId),
          supabase.from("contracts").delete().eq("tenant_id", user.tenantId),
          supabase.from("quote_items").delete().eq("tenant_id", user.tenantId),
          supabase.from("quotes").delete().eq("tenant_id", user.tenantId),
          supabase.from("reservations").delete().eq("tenant_id", user.tenantId),
          supabase.from("kits").delete().eq("tenant_id", user.tenantId),
          supabase.from("clients").delete().eq("tenant_id", user.tenantId),
          supabase.from("equipment").delete().eq("tenant_id", user.tenantId),
        ]);
        if (user.seedMode === "demo") {
          await seedDemoData(user.tenantId, user.company);
        }
        const fresh = await fetchTenantData(user.tenantId);
        setState(fresh);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [analytics, isBootstrapping, state, user],
  );

  return <AppDataContext.Provider value={contextValue}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
};
