/**
 * ParticleField — dust motes floating in cinematography set light
 * ~32 particles with randomised position, size, drift speed and opacity.
 * Purely declarative Framer Motion — no canvas, no RAF loop.
 */
import React, { memo } from "react";
import { motion } from "framer-motion";

interface Particle {
  id:       number;
  x:        number;  // % from left
  y:        number;  // % from top
  size:     number;  // px
  duration: number;  // s for one drift cycle
  delay:    number;  // s initial delay
  driftX:   number;  // px horizontal drift
  driftY:   number;  // px vertical drift (negative = upward)
  opacity:  number;
}

/* Seed particles once at module level so they're stable across re-renders */
const SEED: Particle[] = Array.from({ length: 32 }, (_, i) => {
  // Deterministic-ish using index math so SSR matches client
  const t = i * 137.508; // golden-angle stepping
  return {
    id:       i,
    x:        ((Math.sin(t) + 1) / 2) * 100,
    y:        ((Math.cos(t * 0.7) + 1) / 2) * 100,
    size:     0.8 + (i % 5) * 0.5,       // 0.8 – 2.8 px
    duration: 7 + (i % 7) * 1.8,         // 7 – 18.8 s
    delay:    (i % 9) * 0.6,             // 0 – 4.8 s
    driftX:   (Math.sin(i) * 22),        // −22 … +22 px
    driftY:   -(18 + (i % 6) * 10),     // −18 … −68 px  (always up)
    opacity:  0.06 + (i % 4) * 0.07,    // 0.06 – 0.27
  };
});

export const ParticleField: React.FC = memo(() => (
  <div
    aria-hidden
    style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 5 }}
  >
    {SEED.map(p => (
      <motion.span
        key={p.id}
        style={{
          position:    "absolute",
          left:        `${p.x}%`,
          top:         `${p.y}%`,
          width:       p.size,
          height:      p.size,
          borderRadius:"50%",
          background:  "rgba(200, 169, 110, 0.8)",
          boxShadow:   `0 0 ${p.size * 3}px rgba(200, 169, 110, 0.5)`,
        }}
        animate={{
          x:       [0, p.driftX, p.driftX * 0.4, 0],
          y:       [0, p.driftY * 0.5, p.driftY, p.driftY * 1.3],
          opacity: [0, p.opacity, p.opacity * 0.7, 0],
          scale:   [0.5, 1, 0.8, 0.3],
        }}
        transition={{
          duration: p.duration,
          delay:    p.delay,
          repeat:   Infinity,
          ease:     "easeInOut",
          /* Each keyframe at equal intervals */
          times:    [0, 0.3, 0.7, 1],
        }}
      />
    ))}
  </div>
));

ParticleField.displayName = "ParticleField";
