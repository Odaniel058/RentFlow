import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  memo,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  MotionValue,
} from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   Config
───────────────────────────────────────────────────────────────────────── */

const TOTAL_FRAMES = 240;
const BASE = import.meta.env.BASE_URL as string;
const FRAME_DIR = `${BASE}frames/ezgif-8b954a38dc083fd9-png-split/`;

const frameUrl = (i: number) =>
  `${FRAME_DIR}ezgif-frame-${String(i + 1).padStart(3, "0")}.png`;

/* ─────────────────────────────────────────────────────────────────────────
   Overlay – fades in/out a text block at given scroll positions
───────────────────────────────────────────────────────────────────────── */

interface OverlayProps {
  progress: MotionValue<number>;
  enter: number;   // scrollYProgress when fade-in starts
  peak: number;    // scrollYProgress when fully visible
  exit: number;    // scrollYProgress when fully invisible
  className?: string;
  children: React.ReactNode;
}

const Overlay = memo(
  ({ progress, enter, peak, exit, className = "", children }: OverlayProps) => {
    const opacity = useTransform(
      progress,
      [Math.max(0, enter - 0.001), peak, exit - 0.04, exit],
      [0, 1, 1, 0],
    );
    const y = useTransform(progress, [Math.max(0, enter - 0.001), peak], [28, 0]);

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
   Progress bar
───────────────────────────────────────────────────────────────────────── */

const ProgressBar = ({ progress }: { progress: MotionValue<number> }) => (
  <motion.div
    style={{ scaleX: progress, transformOrigin: "0% 50%" }}
    className="absolute bottom-0 left-0 w-full h-[2px]"
    style2={{
      background: "linear-gradient(90deg,#14B8A6,#F97316)",
      scaleX: progress,
      transformOrigin: "0% 50%",
    } as React.CSSProperties}
  />
);

/* ─────────────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────────────── */

export const FilmSequenceHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Image store — plain refs, never triggers re-renders
  const images = useRef<HTMLImageElement[]>([]);
  const loaded = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));
  const currentFrame = useRef(0);
  const rafId = useRef<number | null>(null);

  const [firstReady, setFirstReady] = useState(false);
  const [progress, setProgress] = useState(0); // 0-1 loading

  /* ── Scroll tracking ── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* ── Preload all frames ── */
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
        // throttle state updates: only on milestones
        if (done % 12 === 0 || done === TOTAL_FRAMES)
          setProgress(done / TOTAL_FRAMES);
      };
      return img;
    });
    return () => { images.current.forEach((img) => { img.onload = null; }); };
  }, []);

  /* ── Draw frame ── */
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));

    // If frame not loaded, find nearest loaded neighbour
    if (!loaded.current[idx]) {
      for (let d = 1; d < TOTAL_FRAMES; d++) {
        const lo = idx - d, hi = idx + d;
        if (lo >= 0 && loaded.current[lo]) { idx = lo; break; }
        if (hi < TOTAL_FRAMES && loaded.current[hi]) { idx = hi; break; }
      }
    }

    const img = images.current[idx];
    if (!img || !loaded.current[idx]) return;

    // Cover-scale the image inside the canvas
    const cw = canvas.width;
    const ch = canvas.height;
    const imgAR = img.naturalWidth / img.naturalHeight;
    const canAR = cw / ch;

    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (imgAR > canAR) {
      sw = sh * canAR;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = sw / canAR;
      sy = (img.naturalHeight - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    currentFrame.current = idx;
  }, []);

  /* ── Resize canvas to physical pixels ── */
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      drawFrame(currentFrame.current);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame]);

  /* ── Draw frame 0 as soon as it loads ── */
  useEffect(() => {
    if (firstReady) drawFrame(0);
  }, [firstReady, drawFrame]);

  /* ── Scroll → frame index ── */
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const target = Math.round(v * (TOTAL_FRAMES - 1));
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      drawFrame(target);
      rafId.current = null;
    });
  });

  /* ── Derived opacity values for overlays ── */
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);
  const introOpacity = useTransform(
    scrollYProgress,
    [0, 0.02, 0.06, 0.09],
    [1, 1, 1, 0],
  );

  /* ── Loading bar width (CSS, not motion) ── */
  const loadBarStyle: React.CSSProperties = {
    width: `${progress * 100}%`,
    transition: "width 0.3s ease",
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          Scroll container  (500vh = 240 frames over 5 viewports)
      ══════════════════════════════════════════════════════ */}
      <div ref={containerRef} className="relative" style={{ height: "500vh" }}>

        {/* ── Sticky viewport ── */}
        <div
          className="sticky top-0 overflow-hidden"
          style={{ height: "100vh", background: "#050505" }}
        >
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            aria-hidden
            className="absolute inset-0"
            style={{ display: "block" }}
          />

          {/* Subtle grain overlay */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
              backgroundRepeat: "repeat",
              backgroundSize: "200px 200px",
              mixBlendMode: "overlay",
              opacity: 0.6,
            }}
          />

          {/* Edge vignette */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(5,5,5,0.55) 100%)",
            }}
          />

          {/* Bottom gradient → page background */}
          <div
            aria-hidden
            className="absolute bottom-0 inset-x-0 pointer-events-none"
            style={{
              height: "18vh",
              background:
                "linear-gradient(to bottom, transparent, #050505)",
            }}
          />

          {/* ─────────────────────────────────────────────
              Loading screen
          ───────────────────────────────────────────── */}
          {!firstReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
              <p
                className="text-xs tracking-[0.28em] uppercase"
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "Inter, system-ui",
                }}
              >
                Carregando
              </p>
              <div
                className="w-48 h-px rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    ...loadBarStyle,
                    background: "linear-gradient(90deg,#14B8A6,#F97316)",
                  }}
                />
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────
              Intro — fades to 0 almost immediately
          ───────────────────────────────────────────── */}
          <motion.div
            style={{ opacity: introOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none px-6"
          >
            <p
              className="text-xs tracking-[0.28em] uppercase mb-7"
              style={{
                color: "#14B8A6",
                fontFamily: "Inter, system-ui",
                letterSpacing: "0.24em",
              }}
            >
              Plataforma para Locadoras Audiovisuais
            </p>
            <h1
              style={{
                fontFamily: "Inter, system-ui",
                fontWeight: 800,
                fontSize: "clamp(3.2rem, 8vw, 7.5rem)",
                lineHeight: 0.92,
                letterSpacing: "-0.04em",
                color: "#ffffff",
              }}
            >
              Gestão<br />
              <span
                style={{
                  background: "linear-gradient(95deg, #14B8A6 0%, #F97316 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Cinematográfica
              </span>
            </h1>
            <p
              className="mt-6 max-w-md"
              style={{
                fontFamily: "Inter, system-ui",
                fontSize: 16,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.38)",
                letterSpacing: "-0.01em",
              }}
            >
              A plataforma para locadoras audiovisuais.
            </p>
          </motion.div>

          {/* ─────────────────────────────────────────────
              Scroll hint
          ───────────────────────────────────────────── */}
          <motion.div
            style={{ opacity: scrollHintOpacity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none"
            aria-hidden
          >
            <p
              className="text-[9px] tracking-[0.26em] uppercase"
              style={{
                color: "rgba(255,255,255,0.3)",
                fontFamily: "Inter, system-ui",
              }}
            >
              Role para explorar
            </p>
            <motion.div
              animate={{ scaleY: [1, 0.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-10 origin-top rounded-full"
              style={{ background: "linear-gradient(to bottom,#14B8A6,transparent)" }}
            />
          </motion.div>

          {/* ─────────────────────────────────────────────
              Text overlays
          ───────────────────────────────────────────── */}

          {/* Segment 1 ── bottom-left */}
          <Overlay
            progress={scrollYProgress}
            enter={0.07} peak={0.13} exit={0.26}
            className="bottom-[13vh] left-[5vw] max-w-[44vw]"
          >
            <p
              style={{
                fontFamily: "Inter, system-ui",
                fontWeight: 800,
                fontSize: "clamp(1.9rem, 3.8vw, 3.6rem)",
                lineHeight: 1.0,
                letterSpacing: "-0.035em",
                color: "#ffffff",
              }}
            >
              Gerencie<br />
              <span style={{ color: "#14B8A6" }}>seu equipamento.</span>
            </p>
          </Overlay>

          {/* Segment 2 ── bottom-right */}
          <Overlay
            progress={scrollYProgress}
            enter={0.30} peak={0.37} exit={0.51}
            className="bottom-[13vh] right-[5vw] max-w-[44vw] text-right"
          >
            <p
              style={{
                fontFamily: "Inter, system-ui",
                fontWeight: 800,
                fontSize: "clamp(1.9rem, 3.8vw, 3.6rem)",
                lineHeight: 1.0,
                letterSpacing: "-0.035em",
                color: "#ffffff",
              }}
            >
              Alugue<br />
              <span style={{ color: "#F97316" }}>com confiança.</span>
            </p>
          </Overlay>

          {/* Segment 3 ── top-left */}
          <Overlay
            progress={scrollYProgress}
            enter={0.54} peak={0.61} exit={0.75}
            className="top-[14vh] left-[5vw] max-w-[44vw]"
          >
            <p
              style={{
                fontFamily: "Inter, system-ui",
                fontWeight: 800,
                fontSize: "clamp(1.9rem, 3.8vw, 3.6rem)",
                lineHeight: 1.0,
                letterSpacing: "-0.035em",
                color: "#ffffff",
              }}
            >
              Precisão<br />
              <span
                style={{
                  background: "linear-gradient(90deg,#14B8A6,#F97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                de set.
              </span>
            </p>
          </Overlay>

          {/* Final ── centered, with CTA */}
          <Overlay
            progress={scrollYProgress}
            enter={0.82} peak={0.88} exit={1.01}
            className="inset-0 flex flex-col items-center justify-center"
            // need pointer events for the button
          >
            {/* Re-enable pointer events just for this inner wrapper */}
            <div className="flex flex-col items-center pointer-events-auto">
              <p
                style={{
                  fontFamily: "Inter, system-ui",
                  fontWeight: 900,
                  fontSize: "clamp(4rem, 13vw, 11rem)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.055em",
                  color: "#ffffff",
                  textAlign: "center",
                }}
              >
                RentFlow
              </p>
              <div
                className="mt-4 h-[2px] w-24 rounded-full"
                style={{
                  background: "linear-gradient(90deg,#14B8A6,#F97316)",
                }}
              />
              <p
                className="mt-6 text-base text-center max-w-xs"
                style={{
                  fontFamily: "Inter, system-ui",
                  color: "rgba(255,255,255,0.42)",
                  letterSpacing: "-0.01em",
                }}
              >
                Gerencie sua locadora audiovisual com precisão e leveza.
              </p>
              <div className="mt-8 flex gap-3 flex-wrap justify-center">
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(20,184,166,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold"
                    style={{
                      background: "linear-gradient(135deg,#14B8A6,#0D9488)",
                      color: "#fff",
                      fontFamily: "Inter, system-ui",
                      letterSpacing: "-0.01em",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Começar gratuitamente
                    <ArrowRight size={15} />
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "Inter, system-ui",
                      letterSpacing: "-0.01em",
                      cursor: "pointer",
                    }}
                  >
                    Entrar na conta
                  </motion.button>
                </Link>
              </div>
            </div>
          </Overlay>

          {/* ─────────────────────────────────────────────
              Progress bar (bottom edge)
          ───────────────────────────────────────────── */}
          <motion.div
            style={{ scaleX: scrollYProgress, transformOrigin: "0% 50%" }}
            className="absolute bottom-0 left-0 w-full h-[2px] pointer-events-none"
            aria-hidden
          >
            <div
              className="w-full h-full"
              style={{ background: "linear-gradient(90deg,#14B8A6,#F97316)" }}
            />
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          Transition bridge → white sections below
      ═══════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="w-full pointer-events-none"
        style={{
          height: "10vh",
          marginTop: "-10vh",
          background: "linear-gradient(to bottom, #050505, #ffffff)",
          position: "relative",
          zIndex: 5,
        }}
      />
    </>
  );
};
