import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  index?: number;
  onClick?: () => void;
  accentColor?: string;
  hasRecentActivity?: boolean;
}

// Animated number counter
const AnimatedValue: React.FC<{ value: string }> = ({ value }) => {
  const [displayed, setDisplayed] = useState('0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Extract numeric part and prefix/suffix
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
      // Ease out expo
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
  hasRecentActivity = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [7, -7]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-7, 7]), { stiffness: 300, damping: 30 });

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

  const changeIcon = changeType === 'positive'
    ? TrendingUp
    : changeType === 'negative'
    ? TrendingDown
    : Minus;
  const ChangeIcon = changeIcon;

  const changeColor =
    changeType === 'positive'
      ? 'text-emerald-400'
      : changeType === 'negative'
      ? 'text-red-400'
      : 'text-muted-foreground';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`kpi-card glass-card p-5 premium-shadow group relative overflow-hidden ${
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
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: changeType === 'positive'
            ? 'hsl(142 65% 42%)'
            : changeType === 'negative'
            ? 'hsl(0 72% 51%)'
            : 'linear-gradient(180deg, hsl(var(--gold-dark)), hsl(var(--gold-light)))',
        }}
      />

      {/* Shimmer sweep on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 shimmer-effect" />
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Corner glow */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70 font-display">
            {title}
          </p>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/15 group-hover:bg-primary/15 group-hover:border-primary/25 transition-colors duration-300"
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </motion.div>
        </div>

        {/* Value */}
        <div className="mb-2">
          <p className="text-[1.75rem] font-bold tracking-tight text-foreground font-display leading-none">
            <AnimatedValue value={value} />
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2">
          {change && (
            <div className={`flex items-center gap-1 text-xs font-medium ${changeColor}`}>
              <ChangeIcon className="h-3 w-3" />
              <span>{change}</span>
            </div>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground/60">{subtitle}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
