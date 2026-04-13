/**
 * LensFlare — cinematic light burst that fires once on page load.
 *
 * Anatomy:
 *  1. Central hot core  (bright radial, blurs out)
 *  2. Horizontal shaft  (long thin gradient)
 *  3. Vertical shaft    (same, 90° rotated)
 *  4. Four diagonal     45° rays
 *  5. Scattered orbs    (secondary chromatic aberration dots)
 *  6. Outer haze ring   (wide soft glow)
 */
import React, { memo } from "react";
import { motion } from "framer-motion";

interface LensFlareProps {
  /** Whether the flare has been triggered */
  active: boolean;
}

/* ── helper: a single secondary orb ── */
const Orb: React.FC<{
  delay: number; size: number; x: string; y: string;
  color: string; blur: number;
}> = ({ delay, size, x, y, color, blur }) => (
  <motion.div
    style={{
      position: "absolute",
      left: x, top: y,
      width: size, height: size,
      borderRadius: "50%",
      background: color,
      filter: `blur(${blur}px)`,
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 0.7, 0], scale: [0, 1, 0.4] }}
    transition={{ delay, duration: 1.1, ease: "easeOut" }}
  />
);

/* ── helper: a light ray ── */
const Ray: React.FC<{
  angle: number; length: number; width: number;
  delay: number; color: string;
}> = ({ angle, length, width, delay, color }) => (
  <motion.div
    style={{
      position: "absolute",
      left: "50%", top: "50%",
      width: length,
      height: width,
      transformOrigin: "0% 50%",
      transform: `rotate(${angle}deg) translateY(-50%)`,
      background: color,
      pointerEvents: "none",
    }}
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{ scaleX: [0, 1, 0.6, 0], opacity: [0, 0.9, 0.5, 0] }}
    transition={{ delay, duration: 0.9, ease: [0.2, 1, 0.4, 1] }}
  />
);

export const LensFlare: React.FC<LensFlareProps> = memo(({ active }) => {
  if (!active) return null;

  const goldShaft  = "linear-gradient(90deg, transparent, rgba(200,169,110,0.9), rgba(240,220,160,1), rgba(200,169,110,0.9), transparent)";
  const whiteShaft = "linear-gradient(90deg, transparent, rgba(255,255,240,0.6), rgba(255,255,255,0.9), rgba(255,255,240,0.6), transparent)";

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      {/* 1 — Outer haze ring */}
      <motion.div
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: 600, height: 600,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(200,169,110,0.22) 0%, rgba(200,169,110,0.05) 40%, transparent 70%)",
          filter: "blur(24px)",
        }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0, 1, 0.6, 0], scale: [0.3, 1.4, 1.1, 0.8] }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* 2 — Hot core */}
      <motion.div
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: 80, height: 80,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, #fff 0%, rgba(240,220,160,0.9) 30%, rgba(200,169,110,0.4) 60%, transparent 80%)",
          filter: "blur(6px)",
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0.8, 0], scale: [0, 1.2, 0.9, 0.5] }}
        transition={{ duration: 0.85, ease: [0.2, 1, 0.4, 1] }}
      />

      {/* 3 — Horizontal shaft (primary) */}
      <Ray angle={0}   length={900} width={2}   delay={0.05} color={goldShaft}  />
      {/* 4 — Horizontal shaft (secondary, wider softer) */}
      <Ray angle={0}   length={700} width={6}   delay={0.08} color="linear-gradient(90deg, transparent, rgba(200,169,110,0.2), rgba(200,169,110,0.4), rgba(200,169,110,0.2), transparent)" />
      {/* 5 — Vertical shaft */}
      <Ray angle={90}  length={600} width={1.5} delay={0.06} color={whiteShaft} />
      {/* 6 — Diagonal rays */}
      <Ray angle={45}  length={320} width={1}   delay={0.10} color="linear-gradient(90deg, transparent, rgba(200,169,110,0.5), transparent)" />
      <Ray angle={-45} length={280} width={1}   delay={0.12} color="linear-gradient(90deg, transparent, rgba(200,169,110,0.4), transparent)" />
      <Ray angle={135} length={240} width={0.8} delay={0.14} color="linear-gradient(90deg, transparent, rgba(200,169,110,0.3), transparent)" />
      <Ray angle={-135}length={260} width={0.8} delay={0.14} color="linear-gradient(90deg, transparent, rgba(200,169,110,0.3), transparent)" />

      {/* 7 — Secondary orbs (chromatic aberration simulation) */}
      <Orb delay={0.15} size={24} x="62%"  y="42%"  color="rgba(180,140,200,0.5)" blur={4} />
      <Orb delay={0.18} size={16} x="38%"  y="56%"  color="rgba(140,200,220,0.4)" blur={3} />
      <Orb delay={0.20} size={10} x="70%"  y="52%"  color="rgba(200,169,110,0.6)" blur={2} />
      <Orb delay={0.22} size={8}  x="30%"  y="46%"  color="rgba(240,220,160,0.5)" blur={2} />
      <Orb delay={0.16} size={36} x="55%"  y="60%"  color="rgba(200,169,110,0.15)" blur={10} />

      {/* 8 — Anamorphic streak (horizontal, very thin, very long) */}
      <motion.div
        style={{
          position: "absolute",
          left: 0, top: "50%",
          width: "100%", height: 1,
          transform: "translateY(-50%)",
          background: "linear-gradient(90deg, transparent 0%, rgba(200,169,110,0.15) 20%, rgba(240,220,160,0.7) 50%, rgba(200,169,110,0.15) 80%, transparent 100%)",
          filter: "blur(0.5px)",
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 0.8, 0] }}
        transition={{ delay: 0.04, duration: 1.0, ease: "easeOut" }}
      />
    </div>
  );
});

LensFlare.displayName = "LensFlare";
