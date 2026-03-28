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
  getBacktestoBoomEndLocal,
  getBacktestoBoomStartLocal,
  getBacktestoImageSequenceFrames,
  getBacktestoPreBurnFrames,
} from "./timeline";

function postBoomEvolveScale(
  f: number,
  boomEnd: number,
  preBurn: number,
): number {
  if (f < boomEnd) {
    return 1;
  }
  const burnEnd = preBurn + BACKTESTO_BURN_FRAMES;
  return interpolate(
    f,
    [boomEnd, boomEnd + 16, burnEnd, burnEnd + 48],
    [1.016, 1.03, 1.024, 1.008],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );
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

function getBoomShake(f: number, boomStart: number, boomEnd: number) {
  if (f < boomStart || f >= boomEnd) {
    return { dx: 0, dy: 0, drot: 0, scaleBump: 1, tz: 0 };
  }
  const t = f - boomStart;
  const dur = Math.max(1, boomEnd - boomStart - 1);

  const decay = Math.exp(-t * 0.95);
  const dx = Math.sin(t * 13) * 4.2 * decay;
  const drot = Math.sin(t * 15) * 1.4 * decay;
  const dy = interpolate(
    t,
    [0, 1.2, 3, dur + 0.001],
    [0, -11, -3.5, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const scaleBump = interpolate(
    t,
    [0, 1.8, 3.5, 6, dur + 0.001],
    [1, 1.1, 1.076, 1.028, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const tz = interpolate(
    t,
    [0, 2, 4.5, dur + 0.001],
    [0, 52, 16, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    },
  );

  return { dx, dy, drot, scaleBump, tz };
}

function PerspCard({
  f,
  boomStart,
  boomEnd,
  preBurn,
  extraScale = 1,
  children,
}: {
  f: number;
  boomStart: number;
  boomEnd: number;
  preBurn: number;
  extraScale?: number;
  children: ReactNode;
}) {
  const swayY = Math.sin(f * 0.06) * 3.5;
  const swayRot = Math.sin(f * 0.045) * 0.75;
  const boom = getBoomShake(f, boomStart, boomEnd);
  const evolve = postBoomEvolveScale(f, boomEnd, preBurn);
  const scale = extraScale * boom.scaleBump * evolve;
  return (
    <div
      style={{
        perspective: 920,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          transform: `translate3d(${boom.dx}px, ${boom.dy}px, ${boom.tz}px) rotateY(-7deg) rotateX(3deg) rotateZ(${swayRot + boom.drot}deg) translateY(${swayY}px) scale(${scale})`,
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
  const boomStart = getBacktestoBoomStartLocal(fps);
  const boomEnd = getBacktestoBoomEndLocal(fps);
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
        <PerspCard
          f={f}
          boomStart={boomStart}
          boomEnd={boomEnd}
          preBurn={preBurn}
          extraScale={scale}
        >
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
      <PerspCard f={f} boomStart={boomStart} boomEnd={boomEnd} preBurn={preBurn}>
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
