import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  iconClass?: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void; icon?: LucideIcon };
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  iconClass,
  title,
  description,
  action,
  className,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.45 }}
    className={cn(
      "flex flex-col items-center justify-center py-16 px-8 text-center rounded-2xl border border-dashed border-border/60 bg-background/40",
      className,
    )}
  >
    <div className={cn("w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5", iconClass)}>
      <Icon className="h-7 w-7 text-muted-foreground/40" />
    </div>
    <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
    <p className="text-xs text-muted-foreground max-w-xs mb-5 leading-relaxed">{description}</p>
    {action && (
      <Button
        size="sm"
        onClick={action.onClick}
        className="gradient-gold text-primary-foreground rounded-xl text-xs gap-1.5"
      >
        {action.icon && <action.icon className="h-3.5 w-3.5" />}
        {action.label}
      </Button>
    )}
    {children}
  </motion.div>
);
