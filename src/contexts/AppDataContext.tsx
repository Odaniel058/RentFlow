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
  Reservation,
  calculateQuoteTotal,
  createInitialTenantData,
  createSeededAppData,
  getEquipmentUsageSeries,
  getKPIs,
  getMonthlyRevenueSeries,
  getReservationStatusSeries,
  initialAppData,
} from "@/data/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { logActivity } from "@/lib/activityLog";

const STORAGE_KEY = "rentflow_tenant_store_v2";
const LEGACY_STORAGE_KEY = "cinegear_app_data";
const LEGACY_TENANT_STORE_KEY = "cinegear_tenant_store_v2";

const emptyClientAddress = (): ClientAddress => ({
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
});

type Upsert<T extends { id: string }> = Omit<T, "id"> & { id?: string };
type TenantStore = Record<string, AppDataState>;

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

const AppDataContext = createContext<AppDataContextType | null>(null);

const createId = (prefix: string, records: { id: string }[]) => {
  const highestSequence = records.reduce((max, record) => {
    const [, rawNumber] = record.id.split("-");
    const parsed = Number(rawNumber);
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
  }, 0);

  return `${prefix}-${String(highestSequence + 1).padStart(3, "0")}`;
};

const upsertRecord = <T extends { id: string }>(records: T[], payload: Upsert<T>, prefix: string): T => {
  if (payload.id) {
    const existing = records.find((record) => record.id === payload.id);
    if (existing) {
      return { ...existing, ...payload };
    }
  }

  return { ...payload, id: createId(prefix, records) } as T;
};

const normalizeClientRecord = (client: Partial<Client> & { id: string }): Client => {
  const type = client.type === "individual" || client.type === "company"
    ? client.type
    : "company";
  const contactName = client.contactName?.trim() || client.name?.trim() || "Cliente";
  const legalName = client.legalName?.trim() || "";
  const tradeName = client.tradeName?.trim() || "";
  const company =
    client.company?.trim() ||
    (type === "company" ? legalName || tradeName || contactName : "Pessoa Fisica");

  return {
    id: client.id,
    type,
    name: client.name?.trim() || tradeName || legalName || contactName,
    company,
    contactName,
    tradeName,
    legalName,
    stateRegistration: client.stateRegistration?.trim() || "",
    financialContact: client.financialContact?.trim() || contactName,
    phone: client.phone?.trim() || "",
    secondaryPhone: client.secondaryPhone?.trim() || "",
    email: client.email?.trim() || "",
    financialEmail: client.financialEmail?.trim() || "",
    document: client.document?.trim() || "",
    website: client.website?.trim() || "",
    notes: client.notes?.trim() || "",
    address: {
      ...emptyClientAddress(),
      ...(client.address ?? {}),
    },
  };
};

const normalizeEquipmentRecord = (equipment: Equipment): Equipment => ({
  ...equipment,
  status:
    equipment.status === "reserved"
      ? "reserved"
      : equipment.status === "maintenance"
        ? "maintenance"
        : equipment.status === "available"
          ? "available"
          : "maintenance",
});

const normalizeTenantState = (tenantState: AppDataState): AppDataState => ({
  ...tenantState,
  equipment: tenantState.equipment.map((equipment) => normalizeEquipmentRecord(equipment)),
  clients: tenantState.clients.map((client) => normalizeClientRecord(client)),
  settings: {
    ...tenantState.settings,
    equipmentCategories: tenantState.settings.equipmentCategories?.filter(Boolean) ?? [],
  },
});

const readStore = (): TenantStore => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored) as TenantStore;
    return Object.fromEntries(
      Object.entries(parsed).map(([tenantId, tenantState]) => [tenantId, normalizeTenantState(tenantState)]),
    );
  }

  const legacyTenantStore = localStorage.getItem(LEGACY_TENANT_STORE_KEY);
  if (legacyTenantStore) {
    localStorage.setItem(STORAGE_KEY, legacyTenantStore);
    localStorage.removeItem(LEGACY_TENANT_STORE_KEY);
    const parsed = JSON.parse(legacyTenantStore) as TenantStore;
    return Object.fromEntries(
      Object.entries(parsed).map(([tenantId, tenantState]) => [tenantId, normalizeTenantState(tenantState)]),
    );
  }

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy) {
    const migratedStore: TenantStore = {
      "TENANT-DEMO": normalizeTenantState(JSON.parse(legacy) as AppDataState),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedStore));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migratedStore;
  }

  const demoStore: TenantStore = {
    "TENANT-DEMO": createSeededAppData(initialAppData.settings.companyName),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoStore));
  return demoStore;
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, getTenantWorkspace } = useAuth();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [store, setStore] = useState<TenantStore>({});

  useEffect(() => {
    if (!user) {
      setStore({});
      setIsBootstrapping(false);
      return;
    }

    setIsBootstrapping(true);
    const existingStore = readStore();
    const workspace = getTenantWorkspace(user.tenantId);
    const currentTenantState =
      existingStore[user.tenantId] ??
      createInitialTenantData(workspace?.seedMode ?? "empty", workspace?.company ?? user.company);

    const nextStore =
      existingStore[user.tenantId]
        ? existingStore
        : {
            ...existingStore,
            [user.tenantId]: currentTenantState,
          };

    setStore(nextStore);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
    setIsBootstrapping(false);
  }, [getTenantWorkspace, user]);

  const state = user ? store[user.tenantId] ?? createInitialTenantData("empty", user.company) : initialAppData;

  useEffect(() => {
    if (!isBootstrapping && user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  }, [isBootstrapping, store, user]);

  const analytics = useMemo(
    () => ({
      kpis: getKPIs(state.reservations),
      monthlyRevenue: getMonthlyRevenueSeries(state.reservations),
      reservationStatus: getReservationStatusSeries(state.reservations),
      equipmentUsage: getEquipmentUsageSeries(state.reservations),
    }),
    [state.reservations],
  );

  const updateTenantState = (updater: (current: AppDataState) => AppDataState) => {
    if (!user) return;
    setStore((currentStore) => {
      const currentState = currentStore[user.tenantId] ?? createInitialTenantData("empty", user.company);
      return {
        ...currentStore,
        [user.tenantId]: updater(currentState),
      };
    });
  };

  const contextValue = useMemo<AppDataContextType>(
    () => ({
      state,
      isBootstrapping,
      analytics,
      upsertEquipment: (payload) => {
        const record = upsertRecord(state.equipment, payload, "EQ");
        updateTenantState((current) => ({
          ...current,
          equipment: payload.id
            ? current.equipment.map((item) => (item.id === payload.id ? record : item))
            : [record, ...current.equipment],
        }));
        if (user && !payload.id) logActivity(user.tenantId, user.name, "created", "equipment", record.id, `Equipamento adicionado: ${record.name}`);
        return record;
      },
      deleteEquipment: (id) => {
        updateTenantState((current) => ({
          ...current,
          equipment: current.equipment.filter((item) => item.id !== id),
          kits: current.kits.map((kit) => ({
            ...kit,
            itemIds: kit.itemIds.filter((itemId) => itemId !== id),
            items: kit.items.filter((itemName) => itemName !== current.equipment.find((equipment) => equipment.id === id)?.name),
          })),
        }));
      },
      upsertClient: (payload) => {
        const record = upsertRecord(state.clients, payload, "CL");
        updateTenantState((current) => ({
          ...current,
          clients: payload.id
            ? current.clients.map((item) => (item.id === payload.id ? record : item))
            : [record, ...current.clients],
        }));
        if (user && !payload.id) logActivity(user.tenantId, user.name, "created", "client", record.id, `Cliente cadastrado: ${record.name}`);
        return record;
      },
      deleteClient: (id) => {
        updateTenantState((current) => ({
          ...current,
          clients: current.clients.filter((item) => item.id !== id),
        }));
      },
      upsertReservation: (payload) => {
        const record = upsertRecord(state.reservations, payload, "RES");
        updateTenantState((current) => ({
          ...current,
          reservations: payload.id
            ? current.reservations.map((item) => (item.id === payload.id ? record : item))
            : [record, ...current.reservations],
        }));
        if (user) logActivity(user.tenantId, user.name, payload.id ? "updated" : "created", "reservation", record.id, payload.id ? `Reserva atualizada: ${record.clientName}` : `Nova reserva para ${record.clientName}`);
        return record;
      },
      deleteReservation: (id) => {
        const target = state.reservations.find((r) => r.id === id);
        updateTenantState((current) => ({
          ...current,
          reservations: current.reservations.filter((item) => item.id !== id),
          agendaEvents: current.agendaEvents.filter((item) => item.reservationId !== id),
          contracts: current.contracts.filter((item) => item.reservationId !== id),
        }));
        if (user && target) logActivity(user.tenantId, user.name, "deleted", "reservation", id, `Reserva removida: ${target.clientName}`);
      },
      upsertQuote: (payload) => {
        const record = upsertRecord(
          state.quotes,
          { ...payload, total: calculateQuoteTotal(payload.items, payload.discount) },
          "ORC",
        );
        updateTenantState((current) => ({
          ...current,
          quotes: payload.id
            ? current.quotes.map((item) => (item.id === payload.id ? record : item))
            : [record, ...current.quotes],
        }));
        if (user && !payload.id) logActivity(user.tenantId, user.name, "created", "quote", record.id, `Proposta criada para ${record.clientName}`);
        return record;
      },
      deleteQuote: (id) => {
        updateTenantState((current) => ({
          ...current,
          quotes: current.quotes.filter((item) => item.id !== id),
        }));
      },
      convertQuoteToReservation: (quoteId) => {
        const quote = state.quotes.find((item) => item.id === quoteId);
        if (!quote) return null;

        const record: Reservation = {
          id: createId("RES", state.reservations),
          clientId: quote.clientId,
          clientName: quote.clientName,
          equipmentIds: quote.items.map((item) => item.refId),
          equipment: quote.items.map((item) => item.name),
          pickupDate: quote.rentalStartDate,
          returnDate: quote.rentalEndDate,
          totalValue: quote.total,
          status: "approved",
          notes: quote.notes,
        };

        updateTenantState((current) => ({
          ...current,
          reservations: [record, ...current.reservations],
          quotes: current.quotes.map((item) => (item.id === quoteId ? { ...item, status: "converted" } : item)),
          agendaEvents: [
            {
              id: createId("EVT", current.agendaEvents),
              type: "reservation",
              reservationId: record.id,
              clientId: record.clientId,
              clientName: record.clientName,
              equipment: record.equipment,
              date: record.pickupDate,
              time: "09:00",
              status: "confirmed",
            },
            ...current.agendaEvents,
          ],
        }));

        if (user) logActivity(user.tenantId, user.name, "converted", "quote", quoteId, `Proposta convertida em reserva: ${quote.clientName}`);
        return record;
      },
      upsertKit: (payload) => {
        const record = upsertRecord(state.kits, payload, "KIT");
        updateTenantState((current) => ({
          ...current,
          kits: payload.id
            ? current.kits.map((item) => (item.id === payload.id ? record : item))
            : [record, ...current.kits],
        }));
        return record;
      },
      deleteKit: (id) => {
        updateTenantState((current) => ({
          ...current,
          kits: current.kits.filter((item) => item.id !== id),
        }));
      },
      upsertContract: (payload) => {
        const prevContract = payload.id ? state.contracts.find((c) => c.id === payload.id) : undefined;
        const record = upsertRecord(state.contracts, payload, "CTR");
        updateTenantState((current) => ({
          ...current,
          contracts: payload.id
            ? current.contracts.map((item) => (item.id === payload.id ? record : item))
            : [record, ...current.contracts],
        }));
        if (user) {
          if (!payload.id) logActivity(user.tenantId, user.name, "created", "contract", record.id, `Contrato gerado`);
          else if (payload.status === "signed" && prevContract?.status !== "signed") logActivity(user.tenantId, user.name, "signed", "contract", record.id, `Contrato assinado`);
        }
        return record;
      },
      deleteContract: (id) => {
        updateTenantState((current) => ({
          ...current,
          contracts: current.contracts.filter((item) => item.id !== id),
        }));
      },
      upsertAgendaEvent: (payload) => {
        const record = upsertRecord(state.agendaEvents, payload, "EVT");
        updateTenantState((current) => ({
          ...current,
          agendaEvents: payload.id
            ? current.agendaEvents.map((item) => (item.id === payload.id ? record : item))
            : [record, ...current.agendaEvents],
        }));
        return record;
      },
      deleteAgendaEvent: (id) => {
        updateTenantState((current) => ({
          ...current,
          agendaEvents: current.agendaEvents.filter((item) => item.id !== id),
        }));
      },
      updateSettings: (payload) => {
        updateTenantState((current) => ({ ...current, settings: payload }));
      },
      resetData: () => {
        if (!user) return;
        const workspace = getTenantWorkspace(user.tenantId);
        updateTenantState(() => createInitialTenantData(workspace?.seedMode ?? "empty", workspace?.company ?? user.company));
      },
    }),
    [analytics, getTenantWorkspace, isBootstrapping, state, user],
  );

  return <AppDataContext.Provider value={contextValue}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return ctx;
};
