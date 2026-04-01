import { Equipment, EquipmentStatus, Reservation } from "@/data/mock-data";

export const INVENTORY_STATUS_OPTIONS: Array<{ value: EquipmentStatus; label: string }> = [
  { value: "available", label: "Disponivel" },
  { value: "reserved", label: "Reservado" },
  { value: "maintenance", label: "Manutencao" },
];

const DEFAULT_CATEGORY_OPTIONS = [
  "Cameras",
  "Lentes",
  "Iluminacao",
  "Audio",
  "Grip",
  "Monitores",
  "Acessorios",
];

const normalizeCategoryKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const dedupeCategoryOptions = (categories: string[]) => {
  const unique = new Map<string, string>();

  categories
    .map((category) => category.trim())
    .filter(Boolean)
    .forEach((category) => {
      const key = normalizeCategoryKey(category);
      if (!unique.has(key)) {
        unique.set(key, category);
      }
    });

  return [...unique.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
};

export const getInventoryCategoryOptions = (equipment: Equipment[], customCategories: string[] = []) =>
  dedupeCategoryOptions([
    ...DEFAULT_CATEGORY_OPTIONS,
    ...customCategories,
    ...equipment.map((item) => item.category).filter(Boolean),
  ]);

export const getOperationalEquipmentStatus = (
  equipment: Equipment,
  reservations: Reservation[],
  referenceDate = new Date().toISOString().slice(0, 10),
): EquipmentStatus => {
  if (equipment.status === "maintenance") {
    return "maintenance";
  }

  if (equipment.status === "reserved") {
    return "reserved";
  }

  const hasReservationInPeriod = reservations.some(
    (reservation) =>
      (reservation.status === "approved" || reservation.status === "in_progress") &&
      reservation.equipmentIds.includes(equipment.id) &&
      reservation.returnDate >= referenceDate,
  );

  return hasReservationInPeriod ? "reserved" : "available";
};
