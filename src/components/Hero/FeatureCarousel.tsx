/**
 * FeatureCarousel — features orbit the camera in a CSS 3D ring.
 *
 * Desktop:
 *   - N cards arranged at equal angles around a circle of `RADIUS` px
 *   - The ring's rotateY drives the orbit (auto-rotates + drag-interactive)
 *   - Cards further back (negative Z) are dimmed + scaled down for depth
 *   - Drag an invisible overlay to spin; release adds velocity inertia
 *
 * Mobile (< 768 px):
 *   - Horizontal scroll snap row, no 3D at all
 *
 * No external dependencies beyond Framer Motion.
 */
import React, { useRef, memo } from "react";
import { motion, useMotionValue, useSpring, useAnimationFrame } from "framer-motion";
import {
  Package, CalendarDays, Users,
  DollarSign, BarChart3, FileText,
} from "lucide-react";

/* ── Card dimensions ── */
const CARD_W  = 148;
const CARD_H  = 108;
const RADIUS  = 260;   // px — orbit radius
const AUTO_DEG_PER_S = 14; // degrees / second for auto-rotation

/* ── Feature definitions ── */
const FEATURES = [
  {
    icon:  Package,
    label: "Inventário",
    desc:  "Controle de estoque em tempo real",
    color: "#C8A96E",
  },
  {
    icon:  CalendarDays,
    label: "Reservas",
    desc:  "Agenda visual e disponibilidade",
    color: "#8BB8D0",
  },
  {
    icon:  Users,
    label: "Clientes",
    desc:  "CRM e histórico completo",
    color: "#A8C8A0",
  },
  {
    icon:  DollarSign,
    label: "Financeiro",
    desc:  "Receita, cobranças e indicadores",
    color: "#C8A96E",
  },
  {
    icon:  BarChart3,
    label: "Relatórios",
    desc:  "Análises por período exportáveis",
    color: "#D0A0A8",
  },
  {
    icon:  FileText,
    label: "Contratos",
    desc:  "Orçamentos e assinatura digital",
    color: "#C8B890",
  },
];

/* ── Single orbital card ── */
interface CardProps {
  icon:    React.ElementType;
  label:   string;
  desc:    string;
  color:   string;
  angle:   number;   // degrees — static slot angle
  visible: boolean;
}
const OrbitalCard: React.FC<CardProps> = memo(({ icon: Icon, label, desc, color, angle, visible }) => {
  const rad = (angle * Math.PI) / 180;
  /* z value tells us how close to viewer (cos of angle, peaks at 0°/360°) */
  const zNorm  = Math.cos(rad);  // −1 (back) … +1 (front)
  const scaleV = 0.68 + zNorm * 0.32;   // 0.68 – 1.00
  const alphaV = 0.30 + zNorm * 0.70;   // 0.30 – 1.00

  return (
    <div
      className="carousel-slot"
      style={{
        /* Each slot is a pivot at the ring centre; translateZ pushes it out */
        transform:  `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
        width:      CARD_W,
        height:     CARD_H,
        marginLeft: -CARD_W / 2,
        marginTop:  -CARD_H / 2,
      }}
    >
      <motion.div
        className="feat-glass"
        style={{
          width:  CARD_W,
          height: CARD_H,
          borderRadius: 14,
          padding: "14px 14px 12px",
          scale: scaleV,
          opacity: visible ? alphaV : 0,
          /* Backface hidden on the card itself prevents ghost renders */
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
        whileHover={{
          scale: scaleV * 1.06,
          opacity: Math.min(alphaV * 1.2, 1),
          transition: { duration: 0.2 },
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 34, height: 34,
            borderRadius: 9,
            background:   `${color}18`,
            border:       `1px solid ${color}40`,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            marginBottom: 9,
          }}
        >
          <Icon size={17} color={color} strokeWidth={1.6} />
        </div>

        {/* Label */}
        <p
          className="font-dmono"
          style={{
            fontSize:      11,
            fontWeight:    500,
            letterSpacing: "0.08em",
            color:         "#F0EBE0",
            marginBottom:  4,
            lineHeight:    1.2,
          }}
        >
          {label}
        </p>

        {/* Description */}
        <p
          style={{
            fontSize:   10,
            lineHeight: 1.4,
            color:      "rgba(240,235,224,0.42)",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {desc}
        </p>

        {/* Amber bottom line */}
        <div
          style={{
            position:   "absolute",
            bottom:     0,
            left:       "20%",
            right:      "20%",
            height:     1.5,
            background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
            borderRadius: "0 0 14px 14px",
          }}
        />
      </motion.div>
    </div>
  );
});
OrbitalCard.displayName = "OrbitalCard";

/* ══════════════════════════════════════════════════════════════════════════ */
/* MAIN COMPONENT                                                            */
/* ══════════════════════════════════════════════════════════════════════════ */
interface FeatureCarouselProps {
  visible: boolean;
}

export const FeatureCarousel: React.FC<FeatureCarouselProps> = memo(({ visible }) => {
  /* ── Rotation state ── */
  const rawRot   = useMotionValue(0);   // source of truth (no spring lag)
  const rotation = useSpring(rawRot, { stiffness: 55, damping: 22 }); // smoothed

  /* ── Auto-rotation — synced to Framer Motion's render loop ── */
  const isDragging = useRef(false);

  useAnimationFrame((_, delta) => {
    if (!isDragging.current) {
      rawRot.set(rawRot.get() + (AUTO_DEG_PER_S * delta) / 1000);
    }
  });

  /* ── Drag interaction ── */
  const dragStartRaw = useRef(0);
  const onDragStart = () => {
    isDragging.current   = true;
    dragStartRaw.current = rawRot.get();
  };
  const onDrag = (_: PointerEvent, info: { delta: { x: number } }) => {
    rawRot.set(rawRot.get() + info.delta.x * 0.45);
  };
  const onDragEnd = (_: PointerEvent, info: { velocity: { x: number } }) => {
    /* Kick with inertia, then resume auto-rotate */
    rawRot.set(rawRot.get() + info.velocity.x * 0.06);
    setTimeout(() => { isDragging.current = false; }, 600);
  };

  /* ── Base angle per slot ── */
  const slotAngles = FEATURES.map((_, i) => (i / FEATURES.length) * 360);

  return (
    <>
      {/* ── Desktop: CSS 3D ring — owns its OWN perspective so it never
           clips through the camera which lives in a separate context ── */}
      <div
        className="hero-scene-wrap"
        style={{
          perspective:       "960px",
          perspectiveOrigin: "50% 44%",
          position:          "absolute",
          inset:             0,
        }}
      >
        {/* Drag-capture overlay — sits above everything, invisible */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          onDragStart={onDragStart as never}
          onDrag={onDrag as never}
          onDragEnd={onDragEnd as never}
          style={{
            position:  "absolute",
            inset:     0,
            cursor:    "grab",
            zIndex:    10,
            touchAction: "pan-y",
          }}
          whileDrag={{ cursor: "grabbing" }}
        />

        {/* The ring — rotateY drives card orbit */}
        <motion.div
          className="carousel-ring"
          style={{
            position:    "absolute",
            left:        "50%",
            top:         "50%",
            width:       0,
            height:      0,
            rotateY:     rotation,
          }}
        >
          {FEATURES.map((f, i) => (
            <OrbitalCard
              key={f.label}
              {...f}
              angle={slotAngles[i]}
              visible={visible}
            />
          ))}
        </motion.div>

        {/* Ring label */}
        <motion.p
          className="font-dmono"
          animate={{ opacity: visible ? 0.3 : 0 }}
          transition={{ delay: 0.3 }}
          style={{
            position:  "absolute",
            bottom:    16,
            left:      "50%",
            transform: "translateX(-50%)",
            fontSize:  10,
            letterSpacing: "0.25em",
            color:     "#C8A96E",
            whiteSpace:"nowrap",
            textTransform: "uppercase",
          }}
        >
          ← arraste para girar →
        </motion.p>
      </div>

      {/* ── Mobile: horizontal scroll ── */}
      <div className="hero-carousel-mobile">
        {FEATURES.map(f => (
          <div
            key={f.label}
            className="carousel-mobile-card feat-glass"
            style={{
              width: 148, minWidth: 148, height: 108,
              borderRadius: 14,
              padding: "14px 14px 12px",
              flexShrink: 0,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: `${f.color}18`, border: `1px solid ${f.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8,
            }}>
              <f.icon size={16} color={f.color} strokeWidth={1.6} />
            </div>
            <p style={{ fontSize: 11, fontWeight: 500, color: "#F0EBE0", marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>{f.label}</p>
            <p style={{ fontSize: 10, color: "rgba(240,235,224,0.42)", fontFamily: "'DM Mono', monospace", lineHeight: 1.4 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
});

FeatureCarousel.displayName = "FeatureCarousel";
