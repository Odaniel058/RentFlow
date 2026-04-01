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

export const getInventoryCategoryOptions = (equipment: Equipment[]) =>
  [...new Set([...DEFAULT_CATEGORY_OPTIONS, ...equipment.map((item) => item.category).filter(Boolean)])].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );

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
