import React from "react";
import { Boxes, Package } from "lucide-react";
import { Kit, QuoteLineItem } from "@/data/mock-data";
import { getQuoteItemKitItems } from "@/lib/quotes";

interface QuoteKitBreakdownProps {
  item: QuoteLineItem;
  kits: Kit[];
  className?: string;
}

export const QuoteKitBreakdown: React.FC<QuoteKitBreakdownProps> = ({ item, kits, className = "" }) => {
  const kitItems = getQuoteItemKitItems(item, kits);

  if (!kitItems.length) {
    return null;
  }

  return (
    <div className={`mt-3 rounded-2xl border border-border/50 bg-background/40 p-3 ${className}`.trim()}>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Boxes className="h-3.5 w-3.5 text-primary" />
        <span>Composicao do kit</span>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
          {item.quantity}x kit
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {kitItems.map((kitItem) => (
          <div key={`${item.id}-${kitItem}`} className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Package className="h-3.5 w-3.5" />
              {kitItem}
            </span>
            <span>{item.quantity}x no projeto</span>
          </div>
        ))}
      </div>
    </div>
  );
};
