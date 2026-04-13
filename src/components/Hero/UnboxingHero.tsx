import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "../../styles/hero.css";

/* ── Cinema camera SVG illustration ── */
const CameraIllustration: React.FC = () => (
  <svg
    width="300"
    height="198"
    viewBox="0 0 300 198"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Cinema camera"
  >
    <defs>
      <linearGradient id="ub-camBody" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#2c2c2e" />
        <stop offset="100%" stopColor="#1a1a1c" />
      </linearGradient>
      <linearGradient id="ub-handle" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#3a3a3c" />
        <stop offset="100%" stopColor="#2a2a2c" />
      </linearGradient>
      <linearGradient id="ub-sidePanel" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#252527" />
        <stop offset="100%" stopColor="#1c1c1e" />
      </linearGradient>
      <radialGradient id="ub-lensRing" cx="38%" cy="38%">
        <stop offset="0%" stopColor="#3d3d3f" />
        <stop offset="100%" stopColor="#1a1a1c" />
      </radialGradient>
      <radialGradient id="ub-lensGlass" cx="32%" cy="32%">
        <stop offset="0%" stopColor="#1e1e20" />
        <stop offset="60%" stopColor="#0d0d0f" />
        <stop offset="100%" stopColor="#050507" />
      </radialGradient>
      <radialGradient id="ub-lensPupil" cx="35%" cy="35%">
        <stop offset="0%" stopColor="#0a0a0c" />
        <stop offset="100%" stopColor="#020204" />
      </radialGradient>
      <filter id="ub-bodyShadow" x="-10%" y="-10%" width="130%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor="#000" floodOpacity="0.35" />
      </filter>
      <filter id="ub-handleShadow" x="-5%" y="-10%" width="115%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.2" />
      </filter>
    </defs>

    {/* Top handle */}
    <rect x="56" y="4" width="168" height="34" rx="11" fill="url(#ub-handle)" filter="url(#ub-handleShadow)" />
    <rect x="65" y="8" width="150" height="5" rx="2.5" fill="rgba(255,255,255,0.06)" />
    <rect x="65" y="15" width="150" height="3" rx="1.5" fill="rgba(0,0,0,0.12)" />
    {/* Handle grip texture */}
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={70 + i * 11} y="20" width="5" height="12" rx="1.5" fill="rgba(0,0,0,0.18)" />
    ))}

    {/* Record button on handle */}
    <circle cx="246" cy="21" r="8" fill="#1a1a1c" />
    <circle cx="246" cy="21" r="6" fill="#FF3B30" />
    <circle cx="244" cy="19" r="2.5" fill="rgba(255,255,255,0.28)" />

    {/* Main body */}
    <rect x="8" y="36" width="216" height="142" rx="12" fill="url(#ub-camBody)" filter="url(#ub-bodyShadow)" />

    {/* Body highlight top edge */}
    <rect x="8" y="36" width="216" height="2" rx="1" fill="rgba(255,255,255,0.08)" />

    {/* Vent slits on body right */}
    {[0,1,2,3,4].map((i) => (
      <rect key={i} x="162" y={50 + i * 10} width="54" height="3" rx="1.5" fill="rgba(255,255,255,0.04)" />
    ))}

    {/* Lens housing circle */}
    <circle cx="95" cy="107" r="62" fill="#141416" />
    <circle cx="95" cy="107" r="58" fill="url(#ub-lensRing)" />
    {/* Ring markings */}
    {Array.from({ length: 16 }).map((_, i) => {
      const angle = (i * 22.5 * Math.PI) / 180;
      const r1 = 54, r2 = 58;
      return (
        <line
          key={i}
          x1={95 + r1 * Math.cos(angle)}
          y1={107 + r1 * Math.sin(angle)}
          x2={95 + r2 * Math.cos(angle)}
          y2={107 + r2 * Math.sin(angle)}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
      );
    })}
    <circle cx="95" cy="107" r="48" fill="#0f0f11" />
    <circle cx="95" cy="107" r="44" fill="url(#ub-lensGlass)" />
    <circle cx="95" cy="107" r="30" fill="url(#ub-lensPupil)" />
    <circle cx="95" cy="107" r="14" fill="#020204" />
    {/* Lens reflection highlight */}
    <ellipse cx="79" cy="91" rx="9" ry="6" fill="white" opacity="0.14" transform="rotate(-20 79 91)" />
    <ellipse cx="112" cy="122" rx="5" ry="3" fill="white" opacity="0.07" transform="rotate(-20 112 122)" />
    {/* Lens ring glow */}
    <circle cx="95" cy="107" r="44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

    {/* Side control panel */}
    <rect x="216" y="36" width="56" height="142" rx="10" fill="url(#ub-sidePanel)" />
    <rect x="216" y="36" width="2" height="142" fill="rgba(0,0,0,0.2)" />

    {/* LCD screen on panel */}
    <rect x="222" y="50" width="44" height="34" rx="5" fill="#0a0f16" />
    <rect x="224" y="52" width="40" height="30" rx="3" fill="#0d1520" />
    {/* Screen content */}
    <rect x="227" y="56" width="22" height="2.5" rx="1.25" fill="rgba(0,113,227,0.7)" />
    <rect x="227" y="61" width="32" height="2" rx="1" fill="rgba(255,255,255,0.22)" />
    <rect x="227" y="65" width="26" height="2" rx="1" fill="rgba(255,255,255,0.16)" />
    <rect x="227" y="69" width="18" height="2" rx="1" fill="rgba(255,255,255,0.1)" />

    {/* Control buttons */}
    <circle cx="234" cy="101" r="6" fill="#2a2a2c" />
    <circle cx="234" cy="101" r="4" fill="#1e1e20" />
    <circle cx="254" cy="101" r="6" fill="#2a2a2c" />
    <circle cx="254" cy="101" r="4" fill="#1e1e20" />

    <circle cx="234" cy="118" r="5" fill="#222224" />
    <circle cx="254" cy="118" r="5" fill="#222224" />
    <circle cx="244" cy="132" r="7" fill="#1e1e20" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    <circle cx="244" cy="132" r="4" fill="#181818" />

    {/* Brand plate on body */}
    <rect x="150" y="104" width="58" height="16" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
    <text x="179" y="116" fontSize="7" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="1.5">CINEMA</text>

    {/* Bottom mounting rail */}
    <rect x="24" y="174" width="188" height="8" rx="3" fill="#111113" />
    <rect x="44" y="175" width="20" height="5" rx="1.5" fill="rgba(255,255,255,0.06)" />
    <rect x="152" y="175" width="20" height="5" rx="1.5" fill="rgba(255,255,255,0.06)" />
    <rect x="100" y="174" width="12" height="8" rx="1" fill="#0d0d0f" />
  </svg>
);

/* ── Main component ── */
export const UnboxingHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  /* Lid lifts: 0 → 0.38 */
  const rawLidRotateX = useTransform(scrollYProgress, [0, 0.38], [0, -115]);
  const lidRotateX = useSpring(rawLidRotateX, { stiffness: 70, damping: 18, restDelta: 0.001 });
  const rawLidY = useTransform(scrollYProgress, [0, 0.38], [0, -90]);
  const lidY = useSpring(rawLidY, { stiffness: 70, damping: 18 });
  const lidOpacity = useTransform(scrollYProgress, [0.28, 0.44], [1, 0]);

  /* Tissue unfolds: 0.1 → 0.44 */
  const tissueOpacity = useTransform(scrollYProgress, [0.1, 0.44], [1, 0]);
  const tissueScaleY = useTransform(scrollYProgress, [0.1, 0.44], [1, 0.25]);

  /* Camera rises: 0.3 → 0.76 */
  const rawCameraY = useTransform(scrollYProgress, [0.3, 0.76], [72, -155]);
  const cameraY = useSpring(rawCameraY, { stiffness: 55, damping: 14, restDelta: 0.001 });
  const cameraOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const rawCameraScale = useTransform(scrollYProgress, [0.3, 0.72], [0.82, 1]);
  const cameraScale = useSpring(rawCameraScale, { stiffness: 55, damping: 14 });

  /* Shadow: 0.5 → 0.85 */
  const rawShadowOpacity = useTransform(scrollYProgress, [0.5, 0.85], [0, 0.22]);
  const shadowOpacity = useSpring(rawShadowOpacity, { stiffness: 40, damping: 12 });
  const rawShadowScale = useTransform(scrollYProgress, [0.5, 0.85], [0.3, 1.15]);
  const shadowScale = useSpring(rawShadowScale, { stiffness: 40, damping: 12 });

  /* Headline: 0.76 → 0.93 */
  const headlineOpacity = useTransform(scrollYProgress, [0.76, 0.93], [0, 1]);
  const headlineY = useTransform(scrollYProgress, [0.76, 0.93], [36, 0]);

  /* Sub/CTA: 0.87 → 1.0 */
  const ctaOpacity = useTransform(scrollYProgress, [0.87, 1.0], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.87, 1.0], [20, 0]);

  /* Scroll hint fades out */
  const hintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div ref={containerRef} style={{ height: "285vh" }} className="unboxing-root">
      {/* ── Sticky viewport ── */}
      <div
        className="sticky top-0 h-screen overflow-hidden bg-white"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      >
        {/* Radial light source above */}
        <div className="unboxing-light" aria-hidden />

        {/* Scene */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* 3D perspective container for lid rotation */}
          <div style={{ perspective: "900px", perspectiveOrigin: "50% 60%" }}>
            <div style={{ position: "relative", width: 320, height: 340 }}>

              {/* Camera ground shadow */}
              <motion.div
                aria-hidden
                className="camera-surface-shadow"
                style={{
                  position: "absolute",
                  bottom: 50,
                  left: "50%",
                  x: "-50%",
                  width: 220,
                  height: 22,
                  opacity: shadowOpacity,
                  scale: shadowScale,
                }}
              />

              {/* Camera illustration */}
              <motion.div
                style={{
                  position: "absolute",
                  top: 18,
                  left: "50%",
                  x: "-50%",
                  y: cameraY,
                  opacity: cameraOpacity,
                  scale: cameraScale,
                  zIndex: 10,
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.22))",
                }}
              >
                <CameraIllustration />
              </motion.div>

              {/* Box body */}
              <div
                className="product-box-body"
                style={{
                  position: "absolute",
                  bottom: 36,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 268,
                  height: 192,
                  overflow: "hidden",
                }}
              >
                {/* Tissue paper */}
                <motion.div
                  className="box-tissue"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 88,
                    scaleY: tissueScaleY,
                    opacity: tissueOpacity,
                    transformOrigin: "top",
                  }}
                >
                  <div style={{ position: "absolute", top: 24, left: 32, right: 32, height: 1, background: "rgba(0,0,0,0.04)" }} />
                  <div style={{ position: "absolute", top: 48, left: 48, right: 48, height: 1, background: "rgba(0,0,0,0.04)" }} />
                  <div style={{ position: "absolute", top: 68, left: 56, right: 56, height: 1, background: "rgba(0,0,0,0.04)" }} />
                </motion.div>
                {/* Inner gradient */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.025) 100%)",
                  pointerEvents: "none",
                }} />
              </div>

              {/* Box lid */}
              <motion.div
                className="product-box-lid"
                style={{
                  position: "absolute",
                  bottom: 224,
                  left: "50%",
                  x: "-50%",
                  width: 284,
                  height: 56,
                  transformOrigin: "50% 100%",
                  rotateX: lidRotateX,
                  y: lidY,
                  opacity: lidOpacity,
                  zIndex: 20,
                }}
              >
                {/* Lid brand groove */}
                <div style={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 80,
                  height: 3,
                  borderRadius: 2,
                  background: "rgba(0,0,0,0.06)",
                }} />
              </motion.div>
            </div>
          </div>

          {/* Headline */}
          <motion.div
            style={{
              opacity: headlineOpacity,
              y: headlineY,
              textAlign: "center",
              marginTop: 48,
              padding: "0 24px",
              maxWidth: 680,
            }}
          >
            <h1
              className="ap-hero-headline"
              style={{ fontSize: "clamp(2.8rem, 5.5vw, 4.5rem)" }}
            >
              Professional gear.<br />
              <span className="ap-hero-accent">Zero hassle.</span>
            </h1>
          </motion.div>

          {/* Subtitle + CTA */}
          <motion.div
            style={{
              opacity: ctaOpacity,
              y: ctaY,
              textAlign: "center",
              marginTop: 20,
              padding: "0 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
            }}
          >
            <p style={{
              fontSize: 18,
              color: "#6e6e73",
              maxWidth: 460,
              lineHeight: 1.55,
              fontFamily: "system-ui, -apple-system, 'Inter', sans-serif",
            }}>
              Gerencie sua locadora audiovisual com precisão e leveza profissional.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Link to="/signup">
                <motion.div
                  whileHover={{ opacity: 0.88 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "14px 28px",
                    borderRadius: 980,
                    background: "#0071E3",
                    color: "#fff",
                    fontFamily: "system-ui, -apple-system, 'Inter', sans-serif",
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                >
                  Criar conta grátis
                  <ArrowRight size={15} />
                </motion.div>
              </Link>
              <Link to="/login">
                <motion.div
                  whileHover={{ background: "rgba(0,0,0,0.06)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "14px 28px",
                    borderRadius: 980,
                    border: "1px solid #E8E8ED",
                    background: "rgba(0,0,0,0.02)",
                    color: "#1D1D1F",
                    fontFamily: "system-ui, -apple-system, 'Inter', sans-serif",
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  Entrar
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          style={{
            position: "absolute",
            bottom: 36,
            left: "50%",
            x: "-50%",
            opacity: hintOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
          aria-hidden
        >
          <span style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "#aeaeb2",
            textTransform: "uppercase",
            fontFamily: "system-ui, sans-serif",
          }}>
            Scroll
          </span>
          <div className="scroll-hint-line" />
        </motion.div>
      </div>
    </div>
  );
};
