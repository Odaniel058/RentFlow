import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  memo,
} from "react";
import { motion, useMotionValue, useTransform, MotionValue } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   Config
───────────────────────────────────────────────────────────────────────── */
const TOTAL_FRAMES = 240;
const FRAME_DIR = `${import.meta.env.BASE_URL}frames/ezgif-8b954a38dc083fd9-png-split/`;

const frameUrl = (i: number) =>
  `${FRAME_DIR}ezgif-frame-${String(i + 1).padStart(3, "0")}.png`;

/* ─────────────────────────────────────────────────────────────────────────
   Overlay – text block that fades in/out based on scroll progress
───────────────────────────────────────────────────────────────────────── */
interface OverlayProps {
  progress: MotionValue<number>;
  enter: number;
  peak: number;
  exit: number;
  className?: string;
  children: React.ReactNode;
}

const Overlay = memo(
  ({ progress, enter, peak, exit, className = "", children }: OverlayProps) => {
    const safeEnter = Math.max(0, enter - 0.001);
    const safeExit = Math.max(peak + 0.001, exit - 0.04);

    const opacity = useTransform(
      progress,
      [safeEnter, peak, safeExit, exit],
      [0, 1, 1, 0],
    );
    const y = useTransform(progress, [safeEnter, peak], [28, 0]);

    return (
      <motion.div
        style={{ opacity, y }}
        className={`absolute pointer-events-none select-none ${className}`}
      >
        {children}
      </motion.div>
    );
  },
);
Overlay.displayName = "Overlay";

/* ─────────────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────────────── */
export const FilmSequenceHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  /* Image store – plain refs, zero re-renders on scroll */
  const images  = useRef<HTMLImageElement[]>([]);
  const loaded  = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));
  const curIdx  = useRef(0);
  const rafId   = useRef<number | null>(null);

  const [firstReady,   setFirstReady]   = useState(false);
  const [loadFraction, setLoadFraction] = useState(0);

  /**
   * scrollProgress is a MotionValue manually driven by the window scroll
   * listener below. Using useMotionValue + window.addEventListener is
   * intentional: Framer Motion's useScroll relies on the scroll container
   * being the element itself or window, and breaks when any ancestor has
   * overflow:hidden (a known browser/spec behaviour that turns the ancestor
   * into a new scroll container, detaching position:sticky children).
   */
  const scrollProgress = useMotionValue(0);

  /* ── Preload all 240 frames ─────────────────────────────────────────── */
  useEffect(() => {
    let done = 0;
    images.current = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = frameUrl(i);
      img.onload = () => {
        loaded.current[i] = true;
        done++;
        if (i === 0) setFirstReady(true);
        if (done % 12 === 0 || done === TOTAL_FRAMES)
          setLoadFraction(done / TOTAL_FRAMES);
      };
      return img;
    });
    return () => { images.current.forEach((img) => { img.onload = null; }); };
  }, []);

  /* ── Draw a single frame to the canvas ─────────────────────────────── */
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    /* Nearest-loaded fallback */
    let idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
    if (!loaded.current[idx]) {
      for (let d = 1; d < TOTAL_FRAMES; d++) {
        const lo = idx - d, hi = idx + d;
        if (lo >= 0 && loaded.current[lo])            { idx = lo; break; }
        if (hi < TOTAL_FRAMES && loaded.current[hi])  { idx = hi; break; }
      }
    }
    const img = images.current[idx];
    if (!img || !loaded.current[idx]) return;

    /* Cover-scale: always fill canvas, crop centre */
    const cw = canvas.width, ch = canvas.height;
    const imgAR = img.naturalWidth / img.naturalHeight;
    const canAR = cw / ch;
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (imgAR > canAR) { sw = sh * canAR;  sx = (img.naturalWidth  - sw) / 2; }
    else               { sh = sw / canAR;  sy = (img.naturalHeight - sh) / 2; }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    curIdx.current = idx;
  }, []);

  /* ── Resize canvas to device-pixel-ratio-aware physical pixels ──────── */
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.floor(window.innerWidth  * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      /* CSS size must match logical viewport so it covers the sticky div */
      canvas.style.width  = "100%";
      canvas.style.height = "100%";
      drawFrame(curIdx.current);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame]);

  /* ── Draw frame 0 as soon as it decodes ────────────────────────────── */
  useEffect(() => {
    if (firstReady) drawFrame(0);
  }, [firstReady, drawFrame]);

  /* ── Window scroll → scroll progress → frame index ─────────────────── */
  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect     = el.getBoundingClientRect();
    const elH      = el.offsetHeight;
    const vh       = window.innerHeight;
    const scrollable = elH - vh;           // total scrollable distance inside container
    if (scrollable <= 0) return;

    // rect.top is 0 when container top aligns with viewport top,
    // negative once we've scrolled past it.
    const p = Math.max(0, Math.min(1, -rect.top / scrollable));

    scrollProgress.set(p);

    const target = Math.round(p * (TOTAL_FRAMES - 1));
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      drawFrame(target);
      rafId.current = null;
    });
  }, [drawFrame, scrollProgress]);

  useEffect(() => {
    onScroll(); // Sync immediately on mount (handles restored scroll positions)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [onScroll]);

  /* ── Derived opacity values for UI chrome ───────────────────────────── */
  const scrollHintOpacity = useTransform(scrollProgress, [0, 0.04], [1, 0]);
  const introOpacity      = useTransform(scrollProgress, [0, 0.02, 0.06, 0.09], [1, 1, 1, 0]);

  /* ─────────────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────────────────  */
  return (
    <>
      {/*
        The outer div is the "scroll track" – 500 vh gives enough room to
        scrub through all 240 frames at a comfortable pace.

        IMPORTANT: no overflow on this element or any ancestor that would
        intercept the window scroll (overflow:clip on the page container is
        safe; overflow:hidden is not).
      */}
      <div ref={containerRef} style={{ position: "relative", height: "500vh" }}>

        {/* ── Sticky canvas viewport ────────────────────────────────── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            width: "100%",
            overflow: "hidden",   /* safe: overflow on the STICKY element itself is fine */
            background: "#050505",
          }}
        >
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />

          {/* Film-grain overlay */}
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
              backgroundRepeat: "repeat",
              backgroundSize: "200px 200px",
              mixBlendMode: "overlay",
              opacity: 0.55,
            }}
          />

          {/* Edge vignette */}
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background:
                "radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(5,5,5,0.6) 100%)",
            }}
          />

          {/* Bottom gradient — bleeds into the next section */}
          <div
            aria-hidden
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: "20vh", pointerEvents: "none",
              background: "linear-gradient(to bottom, transparent, #050505)",
            }}
          />

          {/* ── Loading indicator ───────────────────────────────────── */}
          {!firstReady && (
            <div
              style={{
                position: "absolute", inset: 0, display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
              }}
            >
              <p
                style={{
                  fontSize: 10, letterSpacing: "0.28em", color: "rgba(255,255,255,0.28)",
                  fontFamily: "Inter, system-ui", textTransform: "uppercase",
                }}
              >
                Carregando
              </p>
              <div
                style={{
                  width: 180, height: 1, background: "rgba(255,255,255,0.07)",
                  borderRadius: 999, overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg,#14B8A6,#F97316)",
                    width: `${loadFraction * 100}%`,
                    transition: "width 0.25s ease",
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Intro text (fades out almost immediately) ───────────── */}
          <motion.div
            style={{ opacity: introOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none select-none"
          >
            <p
              style={{
                fontSize: 10, letterSpacing: "0.26em", color: "#14B8A6",
                fontFamily: "Inter, system-ui", textTransform: "uppercase", marginBottom: 28,
              }}
            >
              Plataforma para Locadoras Audiovisuais
            </p>
            <h1
              style={{
                fontFamily: "Inter, system-ui", fontWeight: 800,
                fontSize: "clamp(3rem, 8vw, 7.5rem)", lineHeight: 0.92,
                letterSpacing: "-0.04em", color: "#ffffff",
              }}
            >
              Gestão<br />
              <span
                style={{
                  background: "linear-gradient(95deg,#14B8A6 0%,#F97316 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Cinematográfica
              </span>
            </h1>
            <p
              style={{
                marginTop: 20, fontFamily: "Inter, system-ui", fontSize: 15,
                lineHeight: 1.6, color: "rgba(255,255,255,0.36)", letterSpacing: "-0.01em",
                maxWidth: 380,
              }}
            >
              A plataforma para locadoras audiovisuais.
            </p>
          </motion.div>

          {/* ── Parallax text overlays ───────────────────────────────── */}

          {/* 1 — bottom-left */}
          <Overlay
            progress={scrollProgress}
            enter={0.07} peak={0.13} exit={0.26}
            className="bottom-[14vh] left-[5vw] max-w-[44vw]"
          >
            <p style={{
              fontFamily: "Inter, system-ui", fontWeight: 800,
              fontSize: "clamp(1.8rem, 3.6vw, 3.4rem)", lineHeight: 1.02,
              letterSpacing: "-0.035em", color: "#ffffff",
            }}>
              Gerencie<br />
              <span style={{ color: "#14B8A6" }}>seu equipamento.</span>
            </p>
          </Overlay>

          {/* 2 — bottom-right */}
          <Overlay
            progress={scrollProgress}
            enter={0.30} peak={0.37} exit={0.51}
            className="bottom-[14vh] right-[5vw] max-w-[44vw] text-right"
          >
            <p style={{
              fontFamily: "Inter, system-ui", fontWeight: 800,
              fontSize: "clamp(1.8rem, 3.6vw, 3.4rem)", lineHeight: 1.02,
              letterSpacing: "-0.035em", color: "#ffffff",
            }}>
              Alugue<br />
              <span style={{ color: "#F97316" }}>com confiança.</span>
            </p>
          </Overlay>

          {/* 3 — top-left */}
          <Overlay
            progress={scrollProgress}
            enter={0.54} peak={0.61} exit={0.75}
            className="top-[15vh] left-[5vw] max-w-[44vw]"
          >
            <p style={{
              fontFamily: "Inter, system-ui", fontWeight: 800,
              fontSize: "clamp(1.8rem, 3.6vw, 3.4rem)", lineHeight: 1.02,
              letterSpacing: "-0.035em", color: "#ffffff",
            }}>
              Precisão<br />
              <span style={{
                background: "linear-gradient(90deg,#14B8A6,#F97316)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>de set.</span>
            </p>
          </Overlay>

          {/* 4 — final CTA, centred */}
          <Overlay
            progress={scrollProgress}
            enter={0.82} peak={0.88} exit={1.01}
            className="inset-0 flex flex-col items-center justify-center"
          >
            {/* Re-enable pointer events only for the CTA block */}
            <div className="flex flex-col items-center pointer-events-auto">
              <p style={{
                fontFamily: "Inter, system-ui", fontWeight: 900,
                fontSize: "clamp(4rem, 13vw, 11rem)", lineHeight: 0.88,
                letterSpacing: "-0.055em", color: "#ffffff", textAlign: "center",
              }}>
                RentFlow
              </p>
              <div style={{
                marginTop: 16, height: 2, width: 96, borderRadius: 999,
                background: "linear-gradient(90deg,#14B8A6,#F97316)",
              }} />
              <p style={{
                marginTop: 20, fontFamily: "Inter, system-ui", fontSize: 15,
                color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em",
                textAlign: "center", maxWidth: 300,
              }}>
                Gerencie sua locadora audiovisual com precisão e leveza.
              </p>
              <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(20,184,166,0.38)" }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "12px 28px", borderRadius: 999,
                      background: "linear-gradient(135deg,#14B8A6,#0D9488)",
                      color: "#fff", fontFamily: "Inter, system-ui",
                      fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em",
                      border: "none", cursor: "pointer",
                    }}
                  >
                    Começar gratuitamente <ArrowRight size={14} />
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "12px 28px", borderRadius: 999,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.65)", fontFamily: "Inter, system-ui",
                      fontSize: 14, fontWeight: 500, cursor: "pointer",
                    }}
                  >
                    Entrar na conta
                  </motion.button>
                </Link>
              </div>
            </div>
          </Overlay>

          {/* ── Scroll hint ──────────────────────────────────────────── */}
          <motion.div
            style={{ opacity: scrollHintOpacity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none"
            aria-hidden
          >
            <p style={{
              fontSize: 9, letterSpacing: "0.26em", color: "rgba(255,255,255,0.28)",
              fontFamily: "Inter, system-ui", textTransform: "uppercase",
            }}>
              Role para explorar
            </p>
            <motion.div
              animate={{ scaleY: [1, 0.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 1, height: 40,
                background: "linear-gradient(to bottom,#14B8A6,transparent)",
                transformOrigin: "top",
                borderRadius: 999,
              }}
            />
          </motion.div>

          {/* ── Scroll progress bar (bottom edge) ───────────────────── */}
          <motion.div
            style={{ scaleX: scrollProgress, transformOrigin: "0% 50%" }}
            className="absolute bottom-0 left-0 w-full h-[2px] pointer-events-none"
            aria-hidden
          >
            <div
              style={{ width: "100%", height: "100%", background: "linear-gradient(90deg,#14B8A6,#F97316)" }}
            />
          </motion.div>
        </div>
        {/* end sticky */}
      </div>
      {/* end scroll track */}

      {/* ── Transition bridge: dark → white ─────────────────────────── */}
      <div
        aria-hidden
        style={{
          height: "8vh",
          marginTop: "-8vh",
          background: "linear-gradient(to bottom,#050505,#ffffff)",
          position: "relative",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />
    </>
  );
};
