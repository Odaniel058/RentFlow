import { Kit, QuoteLineItem } from "@/data/mock-data";

export const getQuoteItemKitItems = (item: QuoteLineItem, kits: Kit[]) => {
  if (item.type !== "kit") {
    return [];
  }

  return kits.find((kit) => kit.id === item.refId)?.items ?? [];
};

export const getQuoteItemLabel = (item: QuoteLineItem) => (item.type === "kit" ? "Kit" : "Equipamento");
