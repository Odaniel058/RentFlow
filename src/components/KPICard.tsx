import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type KPIAccent = 'gold' | 'info' | 'success' | 'warning' | 'danger';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  index?: number;
  onClick?: () => void;
  accent?: KPIAccent;
  hasRecentActivity?: boolean;
}

const ACCENT_CONFIG: Record<KPIAccent, {
  iconBg: string;
  iconColor: string;
  glow: string;
  cardBg: string;
  borderHover: string;
}> = {
  gold: {
    iconBg: 'icon-bg-gold',
    iconColor: 'hsl(43 90% 62%)',
    glow: 'hsl(43 90% 57% / 0.15)',
    cardBg: 'card-accent-gold',
    borderHover: 'hsl(43 90% 57% / 0.35)',
  },
  info: {
    iconBg: 'icon-bg-info',
    iconColor: 'hsl(217 94% 68%)',
    glow: 'hsl(217 94% 62% / 0.15)',
    cardBg: 'card-accent-info',
    borderHover: 'hsl(217 94% 62% / 0.35)',
  },
  success: {
    iconBg: 'icon-bg-success',
    iconColor: 'hsl(142 68% 52%)',
    glow: 'hsl(142 68% 43% / 0.15)',
    cardBg: 'card-accent-success',
    borderHover: 'hsl(142 68% 43% / 0.35)',
  },
  warning: {
    iconBg: 'icon-bg-warning',
    iconColor: 'hsl(38 94% 58%)',
    glow: 'hsl(38 94% 52% / 0.15)',
    cardBg: 'card-accent-warning',
    borderHover: 'hsl(38 94% 52% / 0.35)',
  },
  danger: {
    iconBg: 'icon-bg-danger',
    iconColor: 'hsl(0 80% 62%)',
    glow: 'hsl(0 72% 51% / 0.15)',
    cardBg: 'card-accent-danger',
    borderHover: 'hsl(0 72% 51% / 0.35)',
  },
};

// Animated number counter
const AnimatedValue: React.FC<{ value: string }> = ({ value }) => {
  const [displayed, setDisplayed] = useState('0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const match = value.match(/^([R$\s]*)([0-9.,]+)(.*)$/);
    if (!match) { setDisplayed(value); return; }

    const [, prefix, numStr, suffix] = match;
    const target = parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(target)) { setDisplayed(value); return; }

    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(target * eased);
      const formatted = new Intl.NumberFormat('pt-BR').format(current);
      setDisplayed(`${prefix}${formatted}${suffix}`);
      if (progress < 1) requestAnimationFrame(tick);
    };

    const timer = setTimeout(() => requestAnimationFrame(tick), 200);
    return () => clearTimeout(timer);
  }, [value]);

  return <span>{displayed}</span>;
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  index = 0,
  onClick,
  accent = 'gold',
  hasRecentActivity = false,
}) => {
  const cfg = ACCENT_CONFIG[accent];
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), { stiffness: 280, damping: 28 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), { stiffness: 280, damping: 28 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const ChangeIcon = changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : Minus;

  const changeColor =
    changeType === 'positive' ? 'metric-chip-positive' :
    changeType === 'negative' ? 'metric-chip-negative' :
    'metric-chip-neutral';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 28, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.09, duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`kpi-card glass-card p-5 premium-shadow group relative overflow-hidden ${cfg.cardBg} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Live activity pulse */}
      {hasRecentActivity && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>
      )}

      {/* Left accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: changeType === 'positive'
            ? 'linear-gradient(180deg, hsl(142 68% 43%), hsl(142 68% 52%))'
            : changeType === 'negative'
            ? 'linear-gradient(180deg, hsl(0 72% 51%), hsl(0 80% 62%))'
            : `linear-gradient(180deg, hsl(var(--gold-dark)), hsl(var(--gold-light)))`,
        }}
      />

      {/* Shimmer sweep on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 shimmer-effect" />
      </div>

      {/* Ambient glow on hover */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-2xl"
        style={{ background: cfg.glow }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/65 font-display">
            {title}
          </p>
          <motion.div
            whileHover={{ rotate: 12, scale: 1.12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 14 }}
            className={`p-2.5 rounded-xl border transition-all duration-300 ${cfg.iconBg}`}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </motion.div>
        </div>

        {/* Value */}
        <div className="mb-3">
          <p className="stat-value text-[1.8rem] text-foreground">
            <AnimatedValue value={value} />
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 flex-wrap">
          {change && (
            <div className={`metric-chip-premium ${changeColor} flex items-center gap-1`}>
              <ChangeIcon className="h-2.5 w-2.5" />
              <span>{change}</span>
            </div>
          )}
          {subtitle && (
            <span className="text-[11px] text-muted-foreground/55">{subtitle}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
