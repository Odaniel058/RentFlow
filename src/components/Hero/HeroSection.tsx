import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

import { ParticleField } from "./ParticleField";
import { LensFlare } from "./LensFlare";
import { CameraModel } from "./CameraModel";
import "../../styles/hero.css";

type Phase = "black" | "flare" | "camera" | "ring" | "copy" | "full";

const LINE_1 = "Gestao que funciona";
const LINE_2 = "no ritmo do set.";

const STATS = [
  { value: "420+", label: "Locadoras" },
  { value: "32k+", label: "Equipamentos" },
  { value: "99,9%", label: "Uptime" },
];

const Word: React.FC<{ word: string; delay: number; show: boolean }> = ({
  word,
  delay,
  show,
}) => (
  <motion.span
    style={{ display: "inline-block", overflow: "hidden", marginRight: "0.22em" }}
    initial={false}
  >
    <motion.span
      style={{ display: "inline-block" }}
      animate={show ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
      transition={{ delay, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      {word}
    </motion.span>
  </motion.span>
);

export const HeroSection: React.FC = () => {
  const [phase, setPhase] = useState<Phase>("black");
  const sectionRef = useRef<HTMLElement>(null);

  /* ── Mouse tracking for camera rotation ── */
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseRotY = useSpring(useTransform(rawMouseX, [-600, 600], [-10, 10]), { stiffness: 40, damping: 20 });
  const mouseRotX = useSpring(useTransform(rawMouseY, [-400, 400], [6, -6]), { stiffness: 40, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawMouseX.set(e.clientX - rect.left - rect.width / 2);
    rawMouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  useEffect(() => {
    const times: [Phase, number][] = [
      ["flare", 300],
      ["camera", 800],
      ["ring", 1500],
      ["copy", 1900],
      ["full", 2300],
    ];
    const ids = times.map(([p, ms]) => setTimeout(() => setPhase(p), ms));
    return () => ids.forEach(clearTimeout);
  }, []);

  const showCopy = phase === "copy" || phase === "full";
  const assembled = phase !== "black" && phase !== "flare";
  const words1 = LINE_1.split(" ");
  const words2 = LINE_2.split(" ");
  const allWords = [...words1, ...words2];

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="hero-root"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div className="hero-grain" aria-hidden />
      <div className="hero-scanline" aria-hidden />
      <ParticleField />

      <div aria-hidden>
        <div
          className="hero-glow-orb"
          style={{
            width: 600,
            height: 600,
            right: "6%",
            top: "12%",
            background: "radial-gradient(circle, rgba(200,169,110,0.06) 0%, transparent 65%)",
          }}
        />
        <div
          className="hero-glow-orb"
          style={{
            width: 460,
            height: 460,
            left: "3%",
            bottom: "12%",
            background: "radial-gradient(circle, rgba(26,26,46,0.34) 0%, transparent 72%)",
          }}
        />
      </div>

      <LensFlare active={phase !== "black"} />

      <AnimatePresence>
        {phase === "black" && (
          <motion.div
            key="blackout"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: "absolute", inset: 0, background: "#0A0A0A", zIndex: 50 }}
          />
        )}
      </AnimatePresence>

      <div
        className="hero-layout"
        style={{
          flex: 1,
          display: "flex",
          width: "100%",
          maxWidth: 1120,
          margin: "0 auto",
          padding: "100px 32px 40px",
          alignItems: "center",
          position: "relative",
          zIndex: 20,
          gap: 40,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <motion.div
            animate={{ opacity: showCopy ? 1 : 0, y: showCopy ? 0 : 16 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 99,
              border: "1px solid rgba(200,169,110,0.25)",
              background: "rgba(200,169,110,0.06)",
              padding: "6px 14px",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#C8A96E",
                boxShadow: "0 0 8px rgba(200,169,110,0.7)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span
              className="font-dmono"
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "#C8A96E",
                textTransform: "uppercase",
              }}
            >
              Plataforma para Locadoras Audiovisuais
            </span>
          </motion.div>

          <h1
            className="font-bebas"
            style={{
              fontSize: "clamp(3.4rem, 7vw, 6.4rem)",
              lineHeight: 0.95,
              letterSpacing: "0.01em",
              color: "#F0EBE0",
              marginBottom: 28,
              maxWidth: 720,
            }}
          >
            <span style={{ display: "block" }}>
              {words1.map((w, i) => (
                <Word key={i} word={w} delay={i * 0.07} show={showCopy} />
              ))}
            </span>
            <span
              style={{
                display: "block",
                background: "linear-gradient(90deg, #C8A96E, #F0D898, #C8A96E)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {words2.map((w, i) => (
                <Word
                  key={i}
                  word={w}
                  delay={(words1.length + i) * 0.07}
                  show={showCopy}
                />
              ))}
            </span>
          </h1>

          <motion.p
            animate={{ opacity: showCopy ? 1 : 0, y: showCopy ? 0 : 20 }}
            transition={{ duration: 0.6, delay: allWords.length * 0.07 + 0.1 }}
            style={{
              fontSize: 16,
              lineHeight: 1.65,
              color: "rgba(240,235,224,0.48)",
              fontFamily: "'DM Sans', system-ui",
              marginBottom: 36,
              maxWidth: 500,
            }}
          >
            Do inventario ao financeiro, das reservas aos contratos, tudo integrado
            para que sua locadora opere com a precisao que um set de cinema exige.
          </motion.p>

          <motion.div
            animate={{ opacity: showCopy ? 1 : 0, y: showCopy ? 0 : 20 }}
            transition={{ duration: 0.55, delay: allWords.length * 0.07 + 0.25 }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}
          >
            <Link to="/signup" data-hover>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 32px rgba(200,169,110,0.45)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 24px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #8B6A30, #C8A96E, #E8C988)",
                  border: "none",
                  color: "#0A0A0A",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: "0.02em",
                  fontFamily: "'DM Sans', system-ui",
                }}
              >
                Comecar gratuitamente
                <ArrowRight size={15} />
              </motion.button>
            </Link>

            <Link to="/login" data-hover>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "13px 24px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(240,235,224,0.65)",
                  fontSize: 14,
                  fontFamily: "'DM Sans', system-ui",
                }}
              >
                Entrar na conta
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            animate={{ opacity: phase === "full" ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}
          >
            {STATS.map((s, i) => (
              <div key={i}>
                <p
                  className="font-bebas"
                  style={{
                    fontSize: 28,
                    lineHeight: 1,
                    color: "#C8A96E",
                    letterSpacing: "0.03em",
                  }}
                >
                  {s.value}
                </p>
                <p
                  className="font-dmono"
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.18em",
                    color: "rgba(240,235,224,0.35)",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
            <div style={{ flex: 1, minWidth: 140, height: 1, background: "rgba(200,169,110,0.12)" }} />
            <p
              className="font-dmono"
              style={{
                fontSize: 9,
                color: "rgba(240,235,224,0.25)",
                letterSpacing: "0.12em",
                whiteSpace: "nowrap",
              }}
            >
              14 dias gratis · sem cartao
            </p>
          </motion.div>
        </div>

        {/* ── Camera 3D ── */}
        <motion.div
          className="hidden lg:flex"
          animate={{ opacity: assembled ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            flexShrink: 0,
            position: "relative",
            width: 400,
            height: 300,
            perspective: "900px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* Ambient glow behind the camera */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: -40,
              background: "radial-gradient(ellipse at 55% 50%, rgba(200,169,110,0.08) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          {/* Floating wrapper */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <CameraModel
              mouseRotX={mouseRotX}
              mouseRotY={mouseRotY}
              assembled={assembled}
            />
          </motion.div>
          {/* Ground reflection */}
          <motion.div
            animate={{ opacity: assembled ? 0.18 : 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 200,
              height: 12,
              borderRadius: "50%",
              background: "rgba(200,169,110,0.5)",
              filter: "blur(12px)",
            }}
          />
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: phase === "full" ? 0.4 : 0 }}
        transition={{ delay: 0.4 }}
        className="hero-scroll-hint"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          paddingBottom: 28,
          position: "relative",
          zIndex: 20,
        }}
      >
        <p
          className="font-dmono"
          style={{
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "rgba(200,169,110,0.5)",
            textTransform: "uppercase",
          }}
        >
          Role para continuar
        </p>
        <ChevronDown size={14} color="rgba(200,169,110,0.5)" />
      </motion.div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          insetInline: 0,
          height: 80,
          background: "linear-gradient(to bottom, transparent, var(--background, #09090b))",
          pointerEvents: "none",
          zIndex: 15,
        }}
      />
    </section>
  );
};
