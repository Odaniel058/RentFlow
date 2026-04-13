import React, { memo } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";

const BODY_W = 276;
const BODY_H = 160;
const BODY_D = 104;
const GRIP_W = 78;
const PRISM_W = 112;
const PRISM_H = 62;
const PRISM_D = 72;
const LENS_X = 16;
const LENS_Y = 32;
const LENS_SIZE = 146;

const palette = {
  body: "linear-gradient(165deg, #2b2e34 0%, #181b20 40%, #090b0f 100%)",
  bodyFront:
    "linear-gradient(165deg, #2d3137 0%, #1a1d22 38%, #0d1014 100%)",
  side: "linear-gradient(180deg, #1b1e24 0%, #090b0f 100%)",
  top: "linear-gradient(180deg, #373b43 0%, #1a1d21 65%, #101317 100%)",
  rubber:
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px), repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0 2px, transparent 2px 6px), linear-gradient(180deg, #181a1f 0%, #050608 100%)",
  lensBarrel:
    "linear-gradient(180deg, #40454e 0%, #1f2329 18%, #090b0f 45%, #1b1f26 72%, #050608 100%)",
  lensRing:
    "linear-gradient(180deg, #5b616a 0%, #22262c 40%, #060709 100%)",
  redRing: "#b01d20",
  metal: "linear-gradient(180deg, #777b85 0%, #3f444e 45%, #181b20 100%)",
  logo: "#f3f3f0",
  glass:
    "radial-gradient(circle at 34% 28%, rgba(180, 200, 255, 0.24) 0%, rgba(42, 78, 122, 0.16) 18%, rgba(5, 10, 16, 0.92) 62%, #010204 100%)",
};

interface CameraModelProps {
  mouseRotX: MotionValue<number>;
  mouseRotY: MotionValue<number>;
  assembled: boolean;
}

interface FaceProps {
  width: number;
  height: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const Face = ({ width, height, style, children }: FaceProps) => (
  <div
    style={{
      position: "absolute",
      width,
      height,
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const RibbedBand = ({
  inset,
  color = "rgba(255,255,255,0.085)",
}: {
  inset: number;
  color?: string;
}) => (
  <div
    style={{
      position: "absolute",
      inset,
      borderRadius: "50%",
      background: `repeating-linear-gradient(90deg, ${color} 0 2px, rgba(0,0,0,0.35) 2px 7px)`,
      boxShadow: "inset 0 0 14px rgba(0,0,0,0.45)",
    }}
  />
);

const LensFront = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      background: palette.lensRing,
      boxShadow:
        "0 0 0 2px rgba(6,7,9,0.9), 0 16px 32px rgba(0,0,0,0.42), inset 0 1px 3px rgba(255,255,255,0.08)",
    }}
  >
    <RibbedBand inset={9} />
    <div
      style={{
        position: "absolute",
        inset: 26,
        borderRadius: "50%",
        border: `3px solid ${palette.redRing}`,
        boxShadow: "0 0 0 6px rgba(10,11,14,0.9)",
      }}
    />
    <RibbedBand inset={35} color="rgba(255,255,255,0.09)" />
    <div
      style={{
        position: "absolute",
        inset: 58,
        borderRadius: "50%",
        background: palette.lensRing,
        boxShadow: "inset 0 0 12px rgba(0,0,0,0.55)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 10,
          borderRadius: "50%",
          background: palette.glass,
          overflow: "hidden",
          boxShadow:
            "inset 0 0 28px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 28% 26%, rgba(255,255,255,0.22) 0%, rgba(145,180,255,0.12) 18%, transparent 46%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 30,
            height: 12,
            top: 18,
            left: 18,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            transform: "rotate(-28deg)",
            filter: "blur(2px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 16,
            height: 16,
            bottom: 16,
            right: 18,
            borderRadius: "50%",
            background: "rgba(94, 150, 245, 0.12)",
            filter: "blur(2px)",
          }}
        />
      </div>
    </div>
  </div>
);

const LensBarrel = () => (
  <div
    style={{
      position: "absolute",
      left: LENS_X - 28,
      top: LENS_Y + 18,
      width: 96,
      height: 110,
      borderRadius: "48px 0 0 48px",
      background: palette.lensBarrel,
      transform: `translateZ(${BODY_D / 2 + 22}px) rotateY(-90deg)`,
      transformStyle: "preserve-3d",
      boxShadow: "inset -10px 0 20px rgba(255,255,255,0.05)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: "14px 8px 14px 10px",
        borderRadius: "40px 0 0 40px",
        background:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 3px, rgba(0,0,0,0.3) 3px 9px)",
      }}
    />
  </div>
);

const BodyFront = () => (
  <div
    style={{
      position: "relative",
      width: BODY_W,
      height: BODY_H,
      background: palette.bodyFront,
      borderRadius: 28,
      overflow: "hidden",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -18px 30px rgba(0,0,0,0.35)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at 45% 0%, rgba(255,255,255,0.08), transparent 34%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 16,
        width: GRIP_W,
        height: BODY_H - 16,
        borderRadius: "0 28px 28px 0",
        background: palette.rubber,
        boxShadow:
          "inset -10px 0 16px rgba(255,255,255,0.05), inset 8px 0 12px rgba(0,0,0,0.28)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 86,
        top: 18,
        width: 132,
        height: 46,
        borderRadius: "14px 14px 18px 18px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.25) 100%)",
        border: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: palette.logo,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.03em",
          textShadow: "0 1px 10px rgba(255,255,255,0.08)",
        }}
      >
        Canon
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        left: 182,
        top: 68,
        width: 54,
        height: 62,
        borderRadius: 14,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.36))",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          color: "rgba(255,255,255,0.68)",
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: "0.02em",
        }}
      >
        EOS
        <br />
        5D
        <br />
        IV
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        left: 196,
        bottom: 24,
        width: 18,
        height: 36,
        borderRadius: 999,
        background: "linear-gradient(180deg, #08090b 0%, #1d2025 100%)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.06), inset 0 0 8px rgba(255,255,255,0.04)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: LENS_X + 102,
        top: 72,
        width: 18,
        height: 36,
        borderRadius: 12,
        background: "linear-gradient(180deg, #111318 0%, #31353c 100%)",
        boxShadow: "inset 0 1px 4px rgba(255,255,255,0.06)",
      }}
    />
  </div>
);

const TopFace = () => (
  <div
    style={{
      position: "relative",
      width: BODY_W,
      height: BODY_D,
      background: palette.top,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 30,
        top: 24,
        width: 58,
        height: 56,
        borderRadius: 999,
        background:
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 2px, rgba(0,0,0,0.2) 2px 6px), linear-gradient(180deg, #2d3139 0%, #15181d 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        right: 22,
        top: 18,
        width: 42,
        height: 42,
        borderRadius: "50%",
        background:
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 2px, rgba(0,0,0,0.24) 2px 6px), linear-gradient(180deg, #353943 0%, #171a1f 100%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
      }}
    />
    <div
      style={{
        position: "absolute",
        right: 58,
        top: 26,
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "linear-gradient(180deg, #f0f2f5 0%, #7b8089 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 22,
        width: 44,
        height: 12,
        borderRadius: 4,
        background: palette.metal,
        transform: "translateX(-50%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
      }}
    />
  </div>
);

const Prism = () => (
  <div
    style={{
      position: "absolute",
      left: (BODY_W - PRISM_W) / 2,
      top: -PRISM_H + 6,
      width: PRISM_W,
      height: PRISM_H,
      transformStyle: "preserve-3d",
    }}
  >
    <Face
      width={PRISM_W}
      height={PRISM_H}
      style={{
        borderRadius: "18px 18px 20px 20px",
        background:
          "linear-gradient(180deg, #32363e 0%, #171a1f 50%, #0b0d11 100%)",
        clipPath:
          "polygon(18% 100%, 0 62%, 16% 16%, 50% 0, 84% 16%, 100% 62%, 82% 100%)",
        transform: `translateZ(${PRISM_D / 2}px)`,
      }}
    />
    <Face
      width={PRISM_W}
      height={PRISM_D}
      style={{
        top: (PRISM_H - PRISM_D) / 2,
        borderRadius: 16,
        background:
          "linear-gradient(180deg, #434852 0%, #23272d 40%, #101317 100%)",
        transform: `rotateX(90deg) translateZ(${PRISM_H / 2}px)`,
      }}
    />
  </div>
);

export const CameraModel: React.FC<CameraModelProps> = memo(
  ({ mouseRotX, mouseRotY, assembled }) => {
    const baseRotX = 8;
    const baseRotY = -26;
    const totalRotX = useTransform(mouseRotX, (v) => baseRotX + v);
    const totalRotY = useTransform(mouseRotY, (v) => baseRotY + v);

    const shellAnim = assembled
      ? {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateZ: 0,
          transition: { type: "spring", stiffness: 90, damping: 18 },
        }
      : { opacity: 0, scale: 0.76, y: 46, rotateZ: -6 };

    const gripAnim = assembled
      ? {
          opacity: 1,
          x: 0,
          y: 0,
          rotateZ: 0,
          transition: { type: "spring", stiffness: 140, damping: 18, delay: 0.14 },
        }
      : { opacity: 0, x: 34, y: 18, rotateZ: 8 };

    const prismAnim = assembled
      ? {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 150, damping: 18, delay: 0.24 },
        }
      : { opacity: 0, y: -34, scale: 0.8 };

    const barrelAnim = assembled
      ? {
          opacity: 1,
          x: 0,
          scaleX: 1,
          transition: { type: "spring", stiffness: 180, damping: 18, delay: 0.3 },
        }
      : { opacity: 0, x: -40, scaleX: 0.58 };

    const lensAnim = assembled
      ? {
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 210, damping: 20, delay: 0.42 },
        }
      : { opacity: 0, x: -64, scale: 0.4 };

    const topAnim = assembled
      ? {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 140, damping: 18, delay: 0.2 },
        }
      : { opacity: 0, y: -20 };

    return (
      <motion.div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: BODY_W,
          height: BODY_H,
          marginLeft: -(BODY_W / 2) + 14,
          marginTop: -(BODY_H / 2) + 4,
          transformStyle: "preserve-3d",
          rotateX: totalRotX,
          rotateY: totalRotY,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.76, y: 46, rotateZ: -6 }}
          animate={shellAnim}
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
          }}
        >
          <Face
            width={BODY_W}
            height={BODY_H}
            style={{
              borderRadius: 28,
              transform: `translateZ(${BODY_D / 2}px)`,
            }}
          >
            <BodyFront />
          </Face>
          <Face
            width={BODY_W}
            height={BODY_H}
            style={{
              borderRadius: 28,
              background:
                "linear-gradient(180deg, #202329 0%, #090b0f 60%, #060709 100%)",
              transform: `rotateY(180deg) translateZ(${BODY_D / 2}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 18,
                width: 64,
                height: 36,
                transform: "translateX(-50%)",
                borderRadius: 10,
                border: "3px solid rgba(25,28,32,0.9)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 6,
                  borderRadius: 6,
                  background:
                    "radial-gradient(circle at 40% 40%, rgba(94,150,245,0.18), rgba(5,7,12,0.9) 70%)",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                inset: "64px 18px 18px",
                borderRadius: 20,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.25))",
              }}
            />
          </Face>
          <Face
            width={BODY_D}
            height={BODY_H}
            style={{
              left: (BODY_W - BODY_D) / 2,
              borderRadius: 20,
              background: palette.side,
              transform: `rotateY(90deg) translateZ(${BODY_W / 2}px)`,
            }}
          />
          <Face
            width={BODY_D}
            height={BODY_H}
            style={{
              left: (BODY_W - BODY_D) / 2,
              borderRadius: 20,
              background:
                "linear-gradient(180deg, #15181d 0%, #060709 100%)",
              transform: `rotateY(-90deg) translateZ(${BODY_W / 2}px)`,
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={topAnim}
            style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}
          >
            <Face
              width={BODY_W}
              height={BODY_D}
              style={{
                top: (BODY_H - BODY_D) / 2,
                transform: `rotateX(90deg) translateZ(${BODY_H / 2}px)`,
              }}
            >
              <TopFace />
            </Face>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 34, y: 18, rotateZ: 8 }}
          animate={gripAnim}
          style={{
            position: "absolute",
            left: 0,
            top: 18,
            width: GRIP_W,
            height: BODY_H - 18,
            borderRadius: "22px 26px 28px 16px",
            background: palette.rubber,
            transform: `translateZ(${BODY_D / 2 + 8}px)`,
            boxShadow:
              "0 16px 28px rgba(0,0,0,0.28), inset -12px 0 18px rgba(255,255,255,0.04)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -34, scale: 0.8 }}
          animate={prismAnim}
          style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}
        >
          <Prism />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -40, scaleX: 0.58 }}
          animate={barrelAnim}
          style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}
        >
          <LensBarrel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -64, scale: 0.4 }}
          animate={lensAnim}
          style={{
            position: "absolute",
            left: LENS_X,
            top: LENS_Y,
            width: LENS_SIZE,
            height: LENS_SIZE,
            borderRadius: "50%",
            transform: `translateZ(${BODY_D / 2 + 70}px)`,
          }}
        >
          <LensFront />
        </motion.div>
      </motion.div>
    );
  },
);

CameraModel.displayName = "CameraModel";
