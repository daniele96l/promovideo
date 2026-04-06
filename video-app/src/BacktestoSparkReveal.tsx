import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import {
  BACKTESTO_BURN_FRAMES,
  getBacktestoImageSequenceFrames,
  getBacktestoPreBurnFrames,
} from "./timeline";

function postSwapEvolveScale(f: number, preBurn: number): number {
  if (f < preBurn) {
    return 1;
  }
  const burnEnd = preBurn + BACKTESTO_BURN_FRAMES;
  return interpolate(
    f,
    [preBurn, preBurn + 16, burnEnd, burnEnd + 48],
    [1.016, 1.03, 1.024, 1.008],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );
}

/** Punch-in right after Backtesto2 appears (frames since swap, ≥ 0). */
function swapJumpNudge(swapLocal: number): { scaleMul: number; ty: number } {
  const scaleMul = interpolate(
    swapLocal,
    [0, 3, 7, 16],
    [1.1, 1.05, 1.015, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.poly(4)),
    },
  );
  const ty = interpolate(swapLocal, [0, 4, 12], [-22, -6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return { scaleMul, ty };
}

const imgFit: CSSProperties = {
  display: "block",
  width: "100%",
  height: "auto",
  maxHeight: "78vh",
  objectFit: "contain",
};

const CURSOR_FROM = { x: 92, y: 14 };
const CURSOR_TO = { x: 50, y: 45 };

/** Dense field across the card / image area (behind the photo). */
const DUST_PARTICLE_COUNT = 320;

/** Full-screen burst behind the card when Backtesto2 lands. */
const EXPLOSION_PARTICLE_COUNT = 180;

/** Deterministic 0–1 for stable Remotion renders. */
function dustRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function SwapExplosionBackground({
  f,
  preBurn,
}: {
  f: number;
  preBurn: number;
}) {
  const local = f - preBurn;
  if (local < 0) {
    return null;
  }

  return (
    <AbsoluteFill style={{ zIndex: 0, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: "-8%",
          opacity: interpolate(local, [0, 2, 14, 38], [0.55, 0.42, 0.15, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          background:
            "radial-gradient(circle at 50% 42%, rgba(255,220,160,0.35) 0%, rgba(59,130,246,0.12) 35%, transparent 62%)",
          filter: "blur(28px)",
        }}
      />
      {Array.from({ length: EXPLOSION_PARTICLE_COUNT }, (_, i) => {
        const angle = dustRand(i * 8.41) * Math.PI * 2;
        const radialEase = Easing.out(Easing.cubic)(
          interpolate(local, [0, 1, 36], [0, 1, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        );
        const dist = radialEase * (28 + dustRand(i * 6.2) * 58);
        const cx = 50 + Math.cos(angle) * dist * 0.42;
        const cy = 42 + Math.sin(angle) * dist * 0.38;
        const lift = local * (0.35 + dustRand(i * 4.7) * 1.1);
        const op = interpolate(local, [0, 1, 8, 22, 48], [0, 0.95, 0.7, 0.35, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const hue = dustRand(i * 2.11) > 0.45;
        const bg = hue
          ? `linear-gradient(135deg, rgba(186,230,253,${op * 0.95}), rgba(59,130,246,${op * 0.55}))`
          : `linear-gradient(135deg, rgba(255,248,220,${op * 0.95}), rgba(251,191,36,${op * 0.45}))`;
        const sz = 1.2 + dustRand(i * 5.55) * 5.5;
        const rot = local * (2.4 + dustRand(i * 3.9) * 10);
        return (
          <div
            key={`ex-${i}`}
            style={{
              position: "absolute",
              left: `${cx}%`,
              top: `${cy - lift * 0.02}%`,
              width: sz,
              height: sz * (0.35 + dustRand(i * 6.1) * 0.5),
              borderRadius: sz < 2.2 ? 999 : 2,
              background: bg,
              boxShadow: `0 0 ${sz * 3}px rgba(255,255,255,${op * 0.25})`,
              transform: `translate(-50%, -50%) rotate(${rot}deg)`,
              opacity: op,
              filter: `blur(${dustRand(i * 9.2) * 0.45}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

function BacktestoRevealVfx({
  f,
  preBurn,
}: {
  f: number;
  preBurn: number;
}) {
  const local = f - preBurn;
  if (local < 0) {
    return null;
  }

  const flashOp = interpolate(local, [0, 1, 5, 20], [0.62, 0.88, 0.28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const coolRim = interpolate(local, [0, 2, 8, 24], [0.45, 0.22, 0.08, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const warmLift = interpolate(local, [1, 8, 32], [0.22, 0.1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ambientBright = interpolate(local, [0, 3, 14, 40], [1.12, 1.06, 1.02, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ zIndex: 2, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: flashOp,
          mixBlendMode: "screen",
          background:
            "radial-gradient(circle at 50% 44%, rgba(255,254,248,1) 0%, rgba(210,230,255,0.65) 22%, rgba(120,170,255,0.2) 48%, transparent 68%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: coolRim,
          mixBlendMode: "multiply",
          background:
            "radial-gradient(ellipse 90% 88% at 50% 48%, transparent 22%, rgba(4,10,28,0.85) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: warmLift,
          mixBlendMode: "screen",
          background:
            "linear-gradient(185deg, rgba(255,230,190,0.35) 0%, rgba(255,200,140,0.12) 35%, transparent 62%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(local, [0, 4, 18], [0.35, 0.08, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          mixBlendMode: "overlay",
          background:
            "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.4) 0%, transparent 55%)",
          filter: `brightness(${ambientBright})`,
        }}
      />

      {Array.from({ length: DUST_PARTICLE_COUNT }, (_, i) => {
        const a = dustRand(i * 7.13) * Math.PI * 2;
        const burst = Easing.out(Easing.cubic)(
          interpolate(local, [0, 1, 32], [0, 1, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        );
        /** Spread across ~full image/card band (composition %). */
        const baseCx = 16 + dustRand(i * 0.91 + 0.02) * 68;
        const baseCy = 22 + dustRand(i * 0.88 + 0.11) * 52;
        const speed = 2.4 + dustRand(i * 11.2) * 5.5;
        const dist = burst * (local * speed * 0.14 + dustRand(i * 3.91) * 22);
        const wobble = Math.sin(local * 0.42 + i * 0.31) * 1.6;
        const cx = baseCx + Math.cos(a) * dist * 0.35 + wobble;
        const cy =
          baseCy +
          Math.sin(a) * dist * 0.3 +
          local * (0.18 + dustRand(i * 5.4) * 0.42);
        const env = interpolate(local, [0, 1, 6, 22, 56], [0, 1, 0.92, 0.4, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isTiny = i % 4 !== 0;
        const op =
          env *
          (isTiny ? 0.25 + dustRand(i * 2.17) * 0.55 : 0.45 + dustRand(i * 2.17) * 0.5);
        const sw = isTiny
          ? 0.5 + dustRand(i * 5.71) * 2.2
          : 1 + dustRand(i * 5.71) * 3.8;
        const sh = sw * (0.4 + dustRand(i * 6.02) * 0.45);
        const rot = local * (1.2 + dustRand(i * 8.33) * 6);
        const blurPx = isTiny ? dustRand(i * 9.1) * 0.35 : dustRand(i * 9.1) * 0.55;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${cx}%`,
              top: `${cy}%`,
              width: sw,
              height: sh,
              borderRadius: sw < 1.2 ? 999 : 1.5,
              background: `linear-gradient(90deg, rgba(255,248,230,${op * 0.95}), rgba(220,200,170,${op * 0.55}))`,
              boxShadow: `0 0 ${sw * 2.2}px rgba(255,235,200,${op * 0.4})`,
              transform: `translate(-50%, -50%) rotate(${rot}deg)`,
              opacity: op,
              filter: `blur(${blurPx}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

/** Split pre-burn into intro / travel / hover+click (reference proportions 14+28+12). */
function splitPreBurnPhases(preBurn: number) {
  const ref = 54;
  const imageIntro = Math.max(6, Math.round((14 / ref) * preBurn));
  const cursorTravel = Math.max(8, Math.round((28 / ref) * preBurn));
  const atTarget = Math.max(4, preBurn - imageIntro - cursorTravel);
  return { imageIntro, cursorTravel, atTarget };
}

function getCursorState(
  f: number,
  preBurn: number,
  imageIntro: number,
  cursorTravel: number,
  atTarget: number,
) {
  if (f < imageIntro) {
    return {
      xPct: CURSOR_FROM.x,
      yPct: CURSOR_FROM.y,
      pressed: false,
      opacity: 0,
    };
  }
  if (f < imageIntro + cursorTravel) {
    const t = interpolate(
      f,
      [imageIntro, imageIntro + cursorTravel - 1],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      },
    );
    return {
      xPct: interpolate(t, [0, 1], [CURSOR_FROM.x, CURSOR_TO.x]),
      yPct: interpolate(t, [0, 1], [CURSOR_FROM.y, CURSOR_TO.y]),
      pressed: false,
      opacity: 1,
    };
  }
  if (f < preBurn) {
    const h = f - (imageIntro + cursorTravel);
    const bob = Math.sin(h * 0.9) * 0.35;
    const pressed = h >= atTarget - 2;
    return {
      xPct: CURSOR_TO.x + bob,
      yPct: CURSOR_TO.y + bob * 0.5,
      pressed,
      opacity: 1,
    };
  }
  if (f < preBurn + BACKTESTO_BURN_FRAMES) {
    const fade = interpolate(f, [preBurn, preBurn + 14], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return {
      xPct: CURSOR_TO.x,
      yPct: CURSOR_TO.y,
      pressed: false,
      opacity: fade,
    };
  }
  return {
    xPct: CURSOR_TO.x,
    yPct: CURSOR_TO.y,
    pressed: false,
    opacity: 0,
  };
}

function CursorOverlay({
  f,
  preBurn,
  imageIntro,
  cursorTravel,
  atTarget,
}: {
  f: number;
  preBurn: number;
  imageIntro: number;
  cursorTravel: number;
  atTarget: number;
}) {
  const { xPct, yPct, pressed, opacity } = getCursorState(
    f,
    preBurn,
    imageIntro,
    cursorTravel,
    atTarget,
  );
  if (opacity < 0.02) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: `${xPct}%`,
        top: `${yPct}%`,
        pointerEvents: "none",
        zIndex: 200,
        opacity,
        transform: `translate(-3px, -3px) scale(${pressed ? 0.88 : 1})`,
        transformOrigin: "3px 3px",
        filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.45))",
      }}
      aria-hidden
    >
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 3l14 10.5-5.5 1.2L18 21l-2.1 1-4.4-6.3L6 17.2 5 3z"
          fill="white"
          stroke="#1a1a1a"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function PerspCard({
  f,
  preBurn,
  extraScale = 1,
  swapLocal,
  children,
}: {
  f: number;
  preBurn: number;
  extraScale?: number;
  /** If set (post-swap), adds punch scale + vertical pop on Backtesto2. */
  swapLocal?: number;
  children: ReactNode;
}) {
  const swayY = Math.sin(f * 0.06) * 3.5;
  const swayRot = Math.sin(f * 0.045) * 0.75;
  const evolve = postSwapEvolveScale(f, preBurn);
  const jump =
    swapLocal !== undefined && swapLocal >= 0 ? swapJumpNudge(swapLocal) : { scaleMul: 1, ty: 0 };
  const scale = extraScale * evolve * jump.scaleMul;
  const ty = swayY + jump.ty;
  return (
    <div
      style={{
        perspective: 920,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        position: "relative",
        zIndex: 20,
      }}
    >
      <div
        style={{
          transform: `rotateY(-7deg) rotateX(3deg) rotateZ(${swayRot}deg) translateY(${ty}px) scale(${scale})`,
          transformStyle: "preserve-3d",
          width: "min(74%, 920px)",
          maxHeight: "82%",
          borderRadius: 14,
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.5), 0 18px 36px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.08)",
          overflow: "hidden",
          position: "relative",
          background: "rgba(8, 12, 24, 0.5)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

type Props = {
  f: number;
};

export const BacktestoSparkReveal = ({ f }: Props) => {
  const { fps } = useVideoConfig();
  const preBurn = getBacktestoPreBurnFrames(fps);
  const totalFrames = getBacktestoImageSequenceFrames(fps);
  const { imageIntro, cursorTravel, atTarget } = splitPreBurnPhases(preBurn);

  if (f < 0 || f >= totalFrames) {
    return null;
  }

  if (f < preBurn) {
    const settle = interpolate(f, [0, preBurn - 1], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const scale = interpolate(settle, [0, 1], [0.96, 1]);
    return (
      <AbsoluteFill style={{ zIndex: 60, backgroundColor: "transparent" }}>
        <PerspCard f={f} preBurn={preBurn} extraScale={scale}>
          <Img src={staticFile("Backtesto1.jpg")} style={imgFit} />
        </PerspCard>
        <CursorOverlay
          f={f}
          preBurn={preBurn}
          imageIntro={imageIntro}
          cursorTravel={cursorTravel}
          atTarget={atTarget}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ zIndex: 60, backgroundColor: "transparent" }}>
      <SwapExplosionBackground f={f} preBurn={preBurn} />
      <BacktestoRevealVfx f={f} preBurn={preBurn} />
      <PerspCard f={f} preBurn={preBurn} swapLocal={f - preBurn}>
        <Img src={staticFile("Backtesto2.jpg")} style={imgFit} />
      </PerspCard>
      {f < preBurn + BACKTESTO_BURN_FRAMES ? (
        <CursorOverlay
          f={f}
          preBurn={preBurn}
          imageIntro={imageIntro}
          cursorTravel={cursorTravel}
          atTarget={atTarget}
        />
      ) : null}
    </AbsoluteFill>
  );
};
