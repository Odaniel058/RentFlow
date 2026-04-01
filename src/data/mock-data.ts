export type EquipmentStatus = "available" | "reserved" | "maintenance";
export type ReservationStatus = "quote" | "approved" | "in_progress" | "completed" | "cancelled";
export type QuoteStatus = "draft" | "sent" | "approved" | "rejected" | "converted";
export type ContractStatus = "draft" | "signed" | "active" | "completed";
export type AgendaEventType = "pickup" | "return" | "reservation";
export type AgendaEventStatus = "pending" | "confirmed" | "completed";
export type ThemePreference = "dark" | "light";
export type TenantSeedMode = "demo" | "empty";
export type ClientType = "individual" | "company";

export interface ClientAddress {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: EquipmentStatus;
  dailyRate: number;
  location: string;
  notes: string;
  supplier?: string;
  acquisitionDate?: string;
  acquisitionCost?: number;
}

export interface Client {
  id: string;
  type: ClientType;
  name: string;
  company: string;
  contactName: string;
  tradeName: string;
  legalName: string;
  stateRegistration: string;
  financialContact: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  financialEmail: string;
  document: string;
  website: string;
  notes: string;
  address: ClientAddress;
}

export interface QuoteLineItem {
  id: string;
  type: "equipment" | "kit";
  refId: string;
  name: string;
  quantity: number;
  dailyRate: number;
  days: number;
}

export interface Reservation {
  id: string;
  clientId: string;
  clientName: string;
  equipmentIds: string[];
  equipment: string[];
  pickupDate: string;
  returnDate: string;
  totalValue: number;
  status: ReservationStatus;
  notes: string;
}

export interface Kit {
  id: string;
  name: string;
  itemIds: string[];
  items: string[];
  dailyRate: number;
  description: string;
}

export interface Contract {
  id: string;
  reservationId: string;
  clientId: string;
  clientName: string;
  status: ContractStatus;
  createdAt: string;
  value: number;
  content: string;
}

export interface Quote {
  id: string;
  clientId: string;
  clientName: string;
  items: QuoteLineItem[];
  status: QuoteStatus;
  total: number;
  createdAt: string;
  rentalStartDate: string;
  rentalEndDate: string;
  validUntil: string;
  notes: string;
  discount: number;
}

export interface AgendaEvent {
  id: string;
  type: AgendaEventType;
  reservationId?: string;
  clientId?: string;
  clientName: string;
  equipment: string[];
  date: string;
  time: string;
  status: AgendaEventStatus;
  title?: string;
  description?: string;
  notes?: string;
}

export interface CompanySettings {
  companyName: string;
  logoUrl: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  contactName: string;
  themePreference: ThemePreference;
  equipmentCategories: string[];
}

export interface AppDataState {
  equipment: Equipment[];
  clients: Client[];
  reservations: Reservation[];
  kits: Kit[];
  contracts: Contract[];
  quotes: Quote[];
  agendaEvents: AgendaEvent[];
  settings: CompanySettings;
}

export const defaultCompanySettings: CompanySettings = {
  companyName: "RentFlow Rentals",
  logoUrl: "",
  cnpj: "12.345.678/0001-90",
  phone: "(11) 4000-2026",
  email: "contato@rentflow.app",
  address: "Rua das Câmeras, 123 - Vila Madalena, São Paulo - SP",
  contactName: "Gabriel Costa",
  themePreference: "dark",
  equipmentCategories: ["Cameras", "Lentes", "Iluminacao", "Audio", "Grip", "Monitores", "Acessorios"],
};

export const equipmentSeed: Equipment[] = [
  { id: "EQ-001", name: "Sony FX6", category: "Câmeras", brand: "Sony", model: "FX6", serialNumber: "SN-FX6-001", status: "available", dailyRate: 800, location: "Estúdio A", notes: "Full-frame cinema camera com kit base.", supplier: "Sony Pro Center", acquisitionDate: "2025-02-10", acquisitionCost: 42000 },
  { id: "EQ-002", name: "Canon C70", category: "Câmeras", brand: "Canon", model: "C70", serialNumber: "SN-C70-001", status: "reserved", dailyRate: 650, location: "Estúdio A", notes: "Corpo principal da linha RF.", supplier: "Canon Brasil", acquisitionDate: "2025-03-18", acquisitionCost: 36000 },
  { id: "EQ-003", name: "RED Komodo 6K", category: "Câmeras", brand: "RED", model: "Komodo 6K", serialNumber: "SN-RED-001", status: "available", dailyRate: 1200, location: "Estúdio B", notes: "Kit de produção compacta para publicidade.", supplier: "Cine Import", acquisitionDate: "2024-11-03", acquisitionCost: 68000 },
  { id: "EQ-004", name: "ARRI Alexa Mini LF", category: "Câmeras", brand: "ARRI", model: "Alexa Mini LF", serialNumber: "SN-ARRI-001", status: "maintenance", dailyRate: 3500, location: "Manutenção", notes: "Em revisão preventiva do sensor.", supplier: "ARRI Rental", acquisitionDate: "2024-06-21", acquisitionCost: 290000 },
  { id: "EQ-005", name: "Sony 24-70mm f/2.8 GM II", category: "Lentes", brand: "Sony", model: "24-70mm f/2.8 GM II", serialNumber: "SN-L24-001", status: "available", dailyRate: 180, location: "Estúdio A", notes: "Lente zoom padrão premium.", supplier: "Sony Pro Center", acquisitionDate: "2025-01-15", acquisitionCost: 12800 },
  { id: "EQ-006", name: "Canon RF 50mm f/1.2L", category: "Lentes", brand: "Canon", model: "RF 50mm f/1.2L", serialNumber: "SN-L50-001", status: "available", dailyRate: 200, location: "Estúdio A", notes: "Lente prime para look comercial.", supplier: "Canon Brasil", acquisitionDate: "2025-02-01", acquisitionCost: 14200 },
  { id: "EQ-007", name: "Aputure 600d Pro", category: "Iluminação", brand: "Aputure", model: "600d Pro", serialNumber: "SN-AP6-001", status: "available", dailyRate: 250, location: "Estúdio B", notes: "Inclui case e softbox.", supplier: "Aputure Dealer", acquisitionDate: "2024-08-14", acquisitionCost: 9800 },
  { id: "EQ-008", name: "ARRI SkyPanel S60-C", category: "Iluminação", brand: "ARRI", model: "SkyPanel S60-C", serialNumber: "SN-SKY-001", status: "reserved", dailyRate: 450, location: "Estúdio A", notes: "Painel RGBW com flight case.", supplier: "ARRI Rental", acquisitionDate: "2024-09-10", acquisitionCost: 28000 },
  { id: "EQ-009", name: "Sennheiser MKH 416", category: "Áudio", brand: "Sennheiser", model: "MKH 416", serialNumber: "SN-MK4-001", status: "available", dailyRate: 120, location: "Estúdio A", notes: "Microfone shotgun com blimp.", supplier: "Audio Pack", acquisitionDate: "2025-01-29", acquisitionCost: 5200 },
  { id: "EQ-010", name: "Sound Devices MixPre-6 II", category: "Áudio", brand: "Sound Devices", model: "MixPre-6 II", serialNumber: "SN-MP6-001", status: "available", dailyRate: 200, location: "Estúdio A", notes: "Gravador de campo com timecode.", supplier: "Audio Pack", acquisitionDate: "2025-02-14", acquisitionCost: 7800 },
  { id: "EQ-011", name: "DJI Ronin 4D", category: "Grip", brand: "DJI", model: "Ronin 4D", serialNumber: "SN-RN4-001", status: "available", dailyRate: 350, location: "Estúdio B", notes: "Gimbal com follow focus.", supplier: "DJI Enterprise", acquisitionDate: "2024-12-02", acquisitionCost: 47000 },
  { id: "EQ-012", name: "SmallHD Cine 7", category: "Monitores", brand: "SmallHD", model: "Cine 7", serialNumber: "SN-SH7-001", status: "available", dailyRate: 180, location: "Estúdio A", notes: "Monitor 7 polegadas com suporte.", supplier: "Monitor Lab", acquisitionDate: "2025-01-07", acquisitionCost: 11800 },
  { id: "EQ-013", name: "Blackmagic ATEM Mini Pro", category: "Acessórios", brand: "Blackmagic", model: "ATEM Mini Pro", serialNumber: "SN-BM-001", status: "available", dailyRate: 150, location: "Estúdio B", notes: "Switcher para live streaming.", supplier: "Blackmagic Brasil", acquisitionDate: "2024-10-18", acquisitionCost: 4100 },
  { id: "EQ-014", name: "Sigma 18-35mm f/1.8 Art", category: "Lentes", brand: "Sigma", model: "18-35mm f/1.8 Art", serialNumber: "SN-SIG-001", status: "available", dailyRate: 150, location: "Estúdio A", notes: "Zoom rápido para setups compactos.", supplier: "Sigma Dealer", acquisitionDate: "2025-01-05", acquisitionCost: 5800 },
  { id: "EQ-015", name: "Godox AD600 Pro", category: "Iluminação", brand: "Godox", model: "AD600 Pro", serialNumber: "SN-GD6-001", status: "maintenance", dailyRate: 180, location: "Externo", notes: "Em manutenção por reposição de bateria.", supplier: "Light House", acquisitionDate: "2024-07-11", acquisitionCost: 6200 },
];

export const clientsSeed: Client[] = [
  {
    id: "CL-001",
    type: "company",
    name: "Mendes Produções",
    company: "Mendes Produções LTDA",
    contactName: "Rafael Mendes",
    tradeName: "Mendes Produções",
    legalName: "Mendes Produções Audiovisuais LTDA",
    stateRegistration: "114.223.991.118",
    financialContact: "Patricia Mendes",
    phone: "(11) 99876-5432",
    secondaryPhone: "(11) 98888-1122",
    email: "rafael@mendesproducoes.com",
    financialEmail: "financeiro@mendesproducoes.com",
    document: "12.345.678/0001-90",
    website: "https://mendesproducoes.com",
    notes: "Cliente recorrente de publicidade e branded content.",
    address: {
      zipCode: "05409-000",
      street: "Rua Capote Valente",
      number: "1450",
      complement: "Conjunto 62",
      district: "Pinheiros",
      city: "São Paulo",
      state: "SP",
    },
  },
  {
    id: "CL-002",
    type: "company",
    name: "Studio ACS",
    company: "Studio ACS LTDA",
    contactName: "Ana Clara Silva",
    tradeName: "Studio ACS",
    legalName: "Studio ACS Produções LTDA",
    stateRegistration: "",
    financialContact: "Ana Clara Silva",
    phone: "(11) 98765-4321",
    secondaryPhone: "(11) 98111-2345",
    email: "ana@studioacs.com",
    financialEmail: "financeiro@studioacs.com",
    document: "23.456.789/0001-01",
    website: "https://studioacs.com",
    notes: "Atende campanhas de moda e still.",
    address: {
      zipCode: "01310-100",
      street: "Avenida Paulista",
      number: "900",
      complement: "Sala 21",
      district: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    },
  },
  {
    id: "CL-003",
    type: "company",
    name: "Costa Filmes",
    company: "Costa Filmes EIRELI",
    contactName: "Bruno Costa",
    tradeName: "Costa Filmes",
    legalName: "Costa Filmes Produções LTDA",
    stateRegistration: "",
    financialContact: "Marina Costa",
    phone: "(21) 99654-3210",
    secondaryPhone: "(21) 98877-6543",
    email: "bruno@costafilmes.com",
    financialEmail: "financeiro@costafilmes.com",
    document: "34.567.890/0001-12",
    website: "",
    notes: "Produções long-form e streaming.",
    address: {
      zipCode: "20031-170",
      street: "Rua da Quitanda",
      number: "86",
      complement: "8 andar",
      district: "Centro",
      city: "Rio de Janeiro",
      state: "RJ",
    },
  },
  {
    id: "CL-004",
    type: "company",
    name: "Rodrigues Media",
    company: "Rodrigues Media LTDA",
    contactName: "Camila Rodrigues",
    tradeName: "Rodrigues Media",
    legalName: "Rodrigues Media Conteúdo LTDA",
    stateRegistration: "062.113.445.0077",
    financialContact: "Camila Rodrigues",
    phone: "(31) 98543-2109",
    secondaryPhone: "(31) 98888-4433",
    email: "camila@rodriguesmedia.com",
    financialEmail: "financeiro@rodriguesmedia.com",
    document: "45.678.901/0001-23",
    website: "https://rodriguesmedia.com",
    notes: "Demanda frequente de kits compactos e luz.",
    address: {
      zipCode: "30140-071",
      street: "Rua dos Aimorés",
      number: "1120",
      complement: "",
      district: "Funcionários",
      city: "Belo Horizonte",
      state: "MG",
    },
  },
  {
    id: "CL-005",
    type: "company",
    name: "DA Audiovisual",
    company: "DA Audiovisual LTDA",
    contactName: "Diego Almeida",
    tradeName: "DA Audiovisual",
    legalName: "DA Audiovisual Produções LTDA",
    stateRegistration: "",
    financialContact: "Fernanda Almeida",
    phone: "(41) 97432-1098",
    secondaryPhone: "(41) 99122-3344",
    email: "diego@daaudiovisual.com",
    financialEmail: "financeiro@daaudiovisual.com",
    document: "56.789.012/0001-34",
    website: "",
    notes: "Cliente de captação externa e eventos.",
    address: {
      zipCode: "80420-000",
      street: "Rua Brigadeiro Franco",
      number: "1661",
      complement: "",
      district: "Centro",
      city: "Curitiba",
      state: "PR",
    },
  },
  {
    id: "CL-006",
    type: "individual",
    name: "Fernanda Lima",
    company: "Pessoa Física",
    contactName: "Fernanda Lima",
    tradeName: "",
    legalName: "",
    stateRegistration: "",
    financialContact: "Fernanda Lima",
    phone: "(51) 96321-0987",
    secondaryPhone: "(51) 99777-1111",
    email: "fernanda@limastudios.com",
    financialEmail: "",
    document: "123.456.789-09",
    website: "https://limastudios.com",
    notes: "Freelancer de direção e produção.",
    address: {
      zipCode: "90570-001",
      street: "Rua Padre Chagas",
      number: "80",
      complement: "",
      district: "Moinhos de Vento",
      city: "Porto Alegre",
      state: "RS",
    },
  },
];

export const kitsSeed: Kit[] = [
  { id: "KIT-001", name: "Kit Sony FX6", itemIds: ["EQ-001", "EQ-005", "EQ-012", "EQ-009"], items: ["Sony FX6", "Sony 24-70mm f/2.8 GM II", "SmallHD Cine 7", "Sennheiser MKH 416"], dailyRate: 1200, description: "Kit completo para produção documental e branded content." },
  { id: "KIT-002", name: "Kit Iluminação Estúdio", itemIds: ["EQ-007", "EQ-008", "EQ-015"], items: ["Aputure 600d Pro", "ARRI SkyPanel S60-C", "Godox AD600 Pro"], dailyRate: 750, description: "Pacote para set interno com flexibilidade de luz." },
  { id: "KIT-003", name: "Kit Áudio Pro", itemIds: ["EQ-009", "EQ-010"], items: ["Sennheiser MKH 416", "Sound Devices MixPre-6 II"], dailyRate: 280, description: "Captação externa com gravação redundante." },
  { id: "KIT-004", name: "Kit RED Cinema", itemIds: ["EQ-003", "EQ-011", "EQ-012"], items: ["RED Komodo 6K", "DJI Ronin 4D", "SmallHD Cine 7"], dailyRate: 1500, description: "Configuração de cinema leve para publicidade e clipes." },
];

export const reservationsSeed: Reservation[] = [
  { id: "RES-001", clientId: "CL-001", clientName: "Rafael Mendes", equipmentIds: ["EQ-001", "EQ-005", "EQ-007"], equipment: ["Sony FX6", "Sony 24-70mm f/2.8 GM II", "Aputure 600d Pro"], pickupDate: "2026-03-16", returnDate: "2026-03-19", totalValue: 3690, status: "in_progress", notes: "Retirada confirmada com motorista próprio." },
  { id: "RES-002", clientId: "CL-003", clientName: "Bruno Costa", equipmentIds: ["EQ-003", "EQ-012", "EQ-011"], equipment: ["RED Komodo 6K", "SmallHD Cine 7", "DJI Ronin 4D"], pickupDate: "2026-03-17", returnDate: "2026-03-20", totalValue: 5190, status: "approved", notes: "Equipe retira no balcão às 10h." },
  { id: "RES-003", clientId: "CL-002", clientName: "Ana Clara Silva", equipmentIds: ["EQ-002", "EQ-008"], equipment: ["Canon C70", "ARRI SkyPanel S60-C"], pickupDate: "2026-03-18", returnDate: "2026-03-22", totalValue: 4400, status: "approved", notes: "Precisa NF até a véspera da retirada." },
  { id: "RES-004", clientId: "CL-005", clientName: "Diego Almeida", equipmentIds: ["EQ-001", "EQ-009", "EQ-010"], equipment: ["Sony FX6", "Sennheiser MKH 416", "Sound Devices MixPre-6 II"], pickupDate: "2026-03-14", returnDate: "2026-03-16", totalValue: 2240, status: "completed", notes: "Projeto finalizado sem avarias." },
  { id: "RES-005", clientId: "CL-004", clientName: "Camila Rodrigues", equipmentIds: ["EQ-002", "EQ-006"], equipment: ["Canon C70", "Canon RF 50mm f/1.2L"], pickupDate: "2026-03-20", returnDate: "2026-03-23", totalValue: 2550, status: "quote", notes: "Aguardando aprovação do cliente." },
  { id: "RES-006", clientId: "CL-006", clientName: "Fernanda Lima", equipmentIds: ["EQ-013"], equipment: ["Blackmagic ATEM Mini Pro"], pickupDate: "2026-03-15", returnDate: "2026-03-16", totalValue: 300, status: "cancelled", notes: "Cancelado por mudança de escopo." },
  { id: "RES-007", clientId: "CL-001", clientName: "Rafael Mendes", equipmentIds: ["EQ-004", "EQ-008"], equipment: ["ARRI Alexa Mini LF", "ARRI SkyPanel S60-C"], pickupDate: "2026-03-25", returnDate: "2026-03-30", totalValue: 19750, status: "approved", notes: "Precisa seguro liberado antes da retirada." },
];

export const quotesSeed: Quote[] = [
  {
    id: "ORC-001",
    clientId: "CL-004",
    clientName: "Camila Rodrigues",
    items: [
      { id: "QL-001", type: "equipment", refId: "EQ-002", name: "Canon C70", quantity: 1, dailyRate: 650, days: 3 },
      { id: "QL-002", type: "equipment", refId: "EQ-006", name: "Canon RF 50mm f/1.2L", quantity: 1, dailyRate: 200, days: 3 },
    ],
    status: "sent",
    total: 2550,
    createdAt: "2026-03-14",
    rentalStartDate: "2026-03-20",
    rentalEndDate: "2026-03-22",
    validUntil: "2026-03-21",
    notes: "Produção comercial com equipe enxuta.",
    discount: 0,
  },
  {
    id: "ORC-002",
    clientId: "CL-001",
    clientName: "Rafael Mendes",
    items: [
      { id: "QL-003", type: "equipment", refId: "EQ-004", name: "ARRI Alexa Mini LF", quantity: 1, dailyRate: 3500, days: 5 },
      { id: "QL-004", type: "equipment", refId: "EQ-008", name: "ARRI SkyPanel S60-C", quantity: 1, dailyRate: 450, days: 5 },
    ],
    status: "approved",
    total: 19750,
    createdAt: "2026-03-12",
    rentalStartDate: "2026-03-25",
    rentalEndDate: "2026-03-30",
    validUntil: "2026-03-19",
    notes: "Longa-metragem com seguro e operador.",
    discount: 0,
  },
  {
    id: "ORC-003",
    clientId: "CL-006",
    clientName: "Fernanda Lima",
    items: [
      { id: "QL-005", type: "equipment", refId: "EQ-001", name: "Sony FX6", quantity: 1, dailyRate: 800, days: 2 },
      { id: "QL-006", type: "equipment", refId: "EQ-007", name: "Aputure 600d Pro", quantity: 2, dailyRate: 250, days: 2 },
    ],
    status: "draft",
    total: 2600,
    createdAt: "2026-03-16",
    rentalStartDate: "2026-03-24",
    rentalEndDate: "2026-03-25",
    validUntil: "2026-03-23",
    notes: "Evento corporativo indoor.",
    discount: 0,
  },
  {
    id: "ORC-004",
    clientId: "CL-003",
    clientName: "Bruno Costa",
    items: [{ id: "QL-007", type: "equipment", refId: "EQ-003", name: "RED Komodo 6K", quantity: 1, dailyRate: 1200, days: 7 }],
    status: "converted",
    total: 8400,
    createdAt: "2026-03-05",
    rentalStartDate: "2026-03-18",
    rentalEndDate: "2026-03-24",
    validUntil: "2026-03-12",
    notes: "Série documental para streaming.",
    discount: 0,
  },
  {
    id: "ORC-005",
    clientId: "CL-002",
    clientName: "Ana Clara Silva",
    items: [{ id: "QL-008", type: "kit", refId: "KIT-002", name: "Kit Iluminação Estúdio", quantity: 1, dailyRate: 750, days: 4 }],
    status: "rejected",
    total: 3000,
    createdAt: "2026-03-10",
    rentalStartDate: "2026-03-19",
    rentalEndDate: "2026-03-22",
    validUntil: "2026-03-17",
    notes: "Sessão fotográfica remarcada.",
    discount: 0,
  },
];

export const contractsSeed: Contract[] = [
  { id: "CTR-001", reservationId: "RES-001", clientId: "CL-001", clientName: "Rafael Mendes", status: "active", createdAt: "2026-03-15", value: 3690, content: "Contrato ativo para retirada da Sony FX6 e acessórios." },
  { id: "CTR-002", reservationId: "RES-004", clientId: "CL-005", clientName: "Diego Almeida", status: "completed", createdAt: "2026-03-13", value: 2240, content: "Contrato finalizado sem pendências." },
  { id: "CTR-003", reservationId: "RES-002", clientId: "CL-003", clientName: "Bruno Costa", status: "signed", createdAt: "2026-03-16", value: 5190, content: "Contrato assinado digitalmente e aguardando retirada." },
  { id: "CTR-004", reservationId: "RES-003", clientId: "CL-002", clientName: "Ana Clara Silva", status: "draft", createdAt: "2026-03-17", value: 4400, content: "Rascunho pronto para revisão comercial." },
];

export const agendaEventsSeed: AgendaEvent[] = [
  { id: "EVT-001", type: "pickup", reservationId: "RES-001", clientId: "CL-001", clientName: "Rafael Mendes", equipment: ["Sony FX6", "Sony 24-70mm"], date: "2026-03-16", time: "09:00", status: "confirmed", title: "Retirada confirmada", description: "Equipe retira no balcão principal.", notes: "" },
  { id: "EVT-002", type: "return", reservationId: "RES-004", clientId: "CL-005", clientName: "Diego Almeida", equipment: ["Sony FX6", "MKH 416"], date: "2026-03-16", time: "14:00", status: "pending", title: "Devolução prevista", description: "Checagem rápida na chegada.", notes: "" },
  { id: "EVT-003", type: "pickup", reservationId: "RES-002", clientId: "CL-003", clientName: "Bruno Costa", equipment: ["RED Komodo 6K", "Ronin 4D"], date: "2026-03-17", time: "10:00", status: "confirmed", title: "Retirada de cinema", description: "Separar acessórios adicionais.", notes: "" },
  { id: "EVT-004", type: "pickup", reservationId: "RES-003", clientId: "CL-002", clientName: "Ana Clara Silva", equipment: ["Canon C70", "SkyPanel"], date: "2026-03-18", time: "08:30", status: "pending", title: "Pickup em aprovação", description: "Aguardando NF e confirmação final.", notes: "" },
  { id: "EVT-005", type: "return", reservationId: "RES-001", clientId: "CL-001", clientName: "Rafael Mendes", equipment: ["Sony FX6", "Sony 24-70mm"], date: "2026-03-19", time: "17:00", status: "pending", title: "Devolução programada", description: "Conferir sensor e acessórios.", notes: "" },
  { id: "EVT-006", type: "return", reservationId: "RES-002", clientId: "CL-003", clientName: "Bruno Costa", equipment: ["RED Komodo 6K", "Ronin 4D"], date: "2026-03-20", time: "16:00", status: "pending", title: "Retorno de diária longa", description: "Checar desgaste do kit de movimento.", notes: "" },
];

const cloneEquipment = (records: Equipment[]) => records.map((record) => ({ ...record }));
const cloneClients = (records: Client[]) => records.map((record) => ({ ...record, address: { ...record.address } }));
const cloneReservations = (records: Reservation[]) => records.map((record) => ({ ...record, equipmentIds: [...record.equipmentIds], equipment: [...record.equipment] }));
const cloneKits = (records: Kit[]) => records.map((record) => ({ ...record, itemIds: [...record.itemIds], items: [...record.items] }));
const cloneContracts = (records: Contract[]) => records.map((record) => ({ ...record }));
const cloneQuotes = (records: Quote[]) =>
  records.map((record) => ({
    ...record,
    items: record.items.map((item) => ({ ...item })),
  }));
const cloneAgendaEvents = (records: AgendaEvent[]) => records.map((record) => ({ ...record, equipment: [...record.equipment] }));

export const createEmptyAppData = (companyName = "Nova locadora"): AppDataState => ({
  equipment: [],
  clients: [],
  reservations: [],
  kits: [],
  contracts: [],
  quotes: [],
  agendaEvents: [],
  settings: {
    ...defaultCompanySettings,
    companyName,
    email: "",
    phone: "",
    cnpj: "",
    address: "",
    contactName: "",
    equipmentCategories: [...defaultCompanySettings.equipmentCategories],
  },
});

export const createSeededAppData = (companyName = defaultCompanySettings.companyName): AppDataState => ({
  equipment: cloneEquipment(equipmentSeed),
  clients: cloneClients(clientsSeed),
  reservations: cloneReservations(reservationsSeed),
  kits: cloneKits(kitsSeed),
  contracts: cloneContracts(contractsSeed),
  quotes: cloneQuotes(quotesSeed),
  agendaEvents: cloneAgendaEvents(agendaEventsSeed),
  settings: {
    ...defaultCompanySettings,
    companyName,
  },
});

export const createInitialTenantData = (mode: TenantSeedMode, companyName: string) =>
  mode === "demo" ? createSeededAppData(companyName) : createEmptyAppData(companyName);

export const initialAppData: AppDataState = createSeededAppData(defaultCompanySettings.companyName);

export interface KPISet {
  monthlyRevenue: number;
  projectedRevenue: number;
  averageTicket: number;
  approvedReservations: number;
  outstandingAmount: number;
}

export const calculateQuoteTotal = (items: QuoteLineItem[], discount = 0) => {
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.dailyRate * item.days, 0);
  return Math.max(0, subtotal - discount);
};

export const getMonthlyRevenueSeries = (reservations: Reservation[]) => {
  const months = [
    { label: "Out", key: "2025-10" },
    { label: "Nov", key: "2025-11" },
    { label: "Dez", key: "2025-12" },
    { label: "Jan", key: "2026-01" },
    { label: "Fev", key: "2026-02" },
    { label: "Mar", key: "2026-03" },
  ];

  return months.map((month, index) => {
    const revenue = reservations
      .filter((reservation) => reservation.pickupDate.startsWith(month.key) && reservation.status !== "cancelled")
      .reduce((sum, reservation) => sum + reservation.totalValue, 0);

    return {
      month: month.label,
      revenue,
      projected: Math.round(revenue * (index === months.length - 1 ? 1.22 : 1.08)),
    };
  });
};

export const getReservationStatusSeries = (reservations: Reservation[]) => {
  const statusMap: Array<{ key: ReservationStatus; name: string; fill: string }> = [
    { key: "approved", name: "Aprovadas", fill: "hsl(43, 74%, 49%)" },
    { key: "in_progress", name: "Em andamento", fill: "hsl(217, 91%, 60%)" },
    { key: "completed", name: "Finalizadas", fill: "hsl(142, 71%, 45%)" },
    { key: "cancelled", name: "Canceladas", fill: "hsl(0, 84%, 60%)" },
    { key: "quote", name: "Orçamento", fill: "hsl(240, 5%, 55%)" },
  ];

  return statusMap.map((entry) => ({
    name: entry.name,
    value: reservations.filter((reservation) => reservation.status === entry.key).length,
    fill: entry.fill,
  }));
};

export const getEquipmentUsageSeries = (reservations: Reservation[]) => {
  const counts = new Map<string, { name: string; count: number; revenue: number }>();

  reservations.forEach((reservation) => {
    reservation.equipment.forEach((itemName) => {
      const entry = counts.get(itemName) ?? { name: itemName, count: 0, revenue: 0 };
      entry.count += 1;
      entry.revenue += reservation.totalValue / Math.max(1, reservation.equipment.length);
      counts.set(itemName, entry);
    });
  });

  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
};

export const getKPIs = (reservations: Reservation[]): KPISet => {
  const activeRevenue = reservations.filter((reservation) => reservation.status !== "cancelled");
  const monthlyRevenue = activeRevenue
    .filter((reservation) => reservation.pickupDate.startsWith("2026-03"))
    .reduce((sum, reservation) => sum + reservation.totalValue, 0);
  const approvedReservations = reservations.filter((reservation) => reservation.status === "approved").length;
  const projectedRevenue = Math.round(monthlyRevenue * 1.18);
  const outstandingAmount = reservations
    .filter((reservation) => reservation.status === "approved" || reservation.status === "in_progress")
    .reduce((sum, reservation) => sum + reservation.totalValue * 0.25, 0);
  const averageTicket = activeRevenue.length
    ? Math.round(activeRevenue.reduce((sum, reservation) => sum + reservation.totalValue, 0) / activeRevenue.length)
    : 0;

  return {
    monthlyRevenue,
    projectedRevenue,
    averageTicket,
    approvedReservations,
    outstandingAmount: Math.round(outstandingAmount),
  };
};
