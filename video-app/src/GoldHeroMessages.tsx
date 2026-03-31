import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BacktestoSparkReveal } from "./BacktestoSparkReveal";

type Dir = "left" | "right" | "up" | "down";

type HandoffStyle = "alongAxis" | "orthogonalKick" | "squeeze";
type EaseName = "cubic" | "quint" | "back";

const quint = Easing.poly(5);

const easeIn = (name: EaseName) => {
  switch (name) {
    case "quint":
      return Easing.in(quint);
    case "back":
      return Easing.in(Easing.back(1.15));
    default:
      return Easing.in(Easing.cubic);
  }
};

const easeOut = (name: EaseName) => {
  switch (name) {
    case "quint":
      return Easing.out(quint);
    case "back":
      return Easing.out(Easing.back(1.12));
    default:
      return Easing.out(Easing.cubic);
  }
};

const baseText: CSSProperties = {
  fontFamily: '"Montserrat", "Helvetica Neue", system-ui, sans-serif',
  fontWeight: 900,
  letterSpacing: "-0.03em",
  textAlign: "center",
  lineHeight: 1.05,
  color: "#ffffff",
  width: "92%",
  maxWidth: "92%",
  margin: "0 auto",
};

const WORD_BEATS: ReadonlyArray<{
  text: string;
  enter: Dir;
  exit: Dir;
  sizeMul?: number;
  handoffStyle: HandoffStyle;
  enterEase: EaseName;
  exitEase: EaseName;
  /** Frame di handoff accoppiato con la battuta successiva (0 = default). */
  handoffFrames?: number;
}> = [
  {
    text: "Grazie",
    enter: "left",
    exit: "up",
    handoffStyle: "alongAxis",
    enterEase: "quint",
    exitEase: "cubic",
    handoffFrames: 10,
  },
  {
    text: "a",
    enter: "down",
    exit: "left",
    sizeMul: 0.88,
    handoffStyle: "squeeze",
    enterEase: "cubic",
    exitEase: "quint",
    handoffFrames: 8,
  },
  {
    text: "tutti",
    enter: "right",
    exit: "left",
    handoffStyle: "alongAxis",
    enterEase: "cubic",
    exitEase: "cubic",
    handoffFrames: 9,
  },
  {
    text: "i",
    enter: "right",
    exit: "down",
    sizeMul: 0.82,
    handoffStyle: "orthogonalKick",
    enterEase: "back",
    exitEase: "quint",
    handoffFrames: 8,
  },
  {
    text: "vostri",
    enter: "up",
    exit: "right",
    handoffStyle: "alongAxis",
    enterEase: "quint",
    exitEase: "back",
    handoffFrames: 10,
  },
  {
    text: "feedback,",
    enter: "left",
    exit: "up",
    sizeMul: 0.86,
    handoffStyle: "squeeze",
    enterEase: "cubic",
    exitEase: "cubic",
    handoffFrames: 11,
  },
  {
    text: "vi",
    enter: "down",
    exit: "left",
    sizeMul: 0.88,
    handoffStyle: "orthogonalKick",
    enterEase: "quint",
    exitEase: "quint",
    handoffFrames: 9,
  },
  {
    text: "presentiamo",
    enter: "right",
    exit: "down",
    sizeMul: 0.84,
    handoffStyle: "alongAxis",
    enterEase: "back",
    exitEase: "cubic",
    handoffFrames: 10,
  },
  {
    text: "Backtesto",
    enter: "up",
    exit: "right",
    handoffStyle: "squeeze",
    enterEase: "quint",
    exitEase: "quint",
    handoffFrames: 10,
  },
];

const ENTER_F = 9;
const HOLD_F = 8;
const EXIT_F = 9;
const DEFAULT_HANDOFF = 10;

/** Frame di handoff dopo la battuta i (uscita di i ↔ entrata di i+1). */
const getHandoffAfter = (i: number) =>
  WORD_BEATS[i]?.handoffFrames ?? DEFAULT_HANDOFF;

const getBeatLen = () => ENTER_F + HOLD_F + EXIT_F;

/** Spaziatura: la battuta i+1 inizia mentre i è nelle ultime getHandoffAfter(i) frame di uscita. */
function getBeatSpacing(i: number): number {
  return getBeatLen() - getHandoffAfter(i);
}

function getBeatStart(i: number): number {
  let s = 0;
  for (let j = 0; j < i; j++) {
    s += getBeatSpacing(j);
  }
  return s;
}

const OFFSET_BIG_TWO = getBeatStart(WORD_BEATS.length - 1) + getBeatLen();

/** Dramatic “2”: keep in sync with `DramaticTwo` enter/hold/exit below. */
const DRAMATIC_TWO_ENTER_F = 9;
const DRAMATIC_TWO_HOLD_F = 14;
const DRAMATIC_TWO_EXIT_F = 8;
const DRAMATIC_TWO_FRAMES =
  DRAMATIC_TWO_ENTER_F + DRAMATIC_TWO_HOLD_F + DRAMATIC_TWO_EXIT_F;
const OFFSET_BACKTESTO_IMAGES = OFFSET_BIG_TWO + DRAMATIC_TWO_FRAMES;

const enterOffset = (dir: Dir, w: number, h: number) => {
  const xw = w * 0.55;
  const yh = h * 0.38;
  switch (dir) {
    case "left":
      return { x: -xw, y: 0 };
    case "right":
      return { x: xw, y: 0 };
    case "up":
      return { x: 0, y: -yh };
    case "down":
      return { x: 0, y: yh };
  }
};

const exitOffset = (dir: Dir, w: number, h: number) => {
  const xw = w * 0.55;
  const yh = h * 0.38;
  switch (dir) {
    case "left":
      return { x: -xw, y: 0 };
    case "right":
      return { x: xw, y: 0 };
    case "up":
      return { x: 0, y: -yh };
    case "down":
      return { x: 0, y: yh };
  }
};

/** Versore: da dove arriva la parola successiva (verso il centro). */
function incomingUnit(enter: Dir, w: number, h: number) {
  const o = enterOffset(enter, w, h);
  const len = Math.hypot(o.x, o.y) || 1;
  return { x: -o.x / len, y: -o.y / len };
}

function orthogonal(v: { x: number; y: number }) {
  return { x: -v.y, y: v.x };
}

function giantFontSize(
  text: string,
  w: number,
  h: number,
  sizeMul = 1,
): number {
  const charW = 0.66;
  const maxByH = h * 0.4;
  const maxByW = (w * 0.84) / (Math.max(text.length, 2) * charW);
  return Math.max(34, Math.min(maxByH, maxByW) * sizeMul);
}

type Transform = { x: number; y: number; opacity: number; scale: number };

function computeBeatTransform(
  f: number,
  w: number,
  h: number,
  beat: (typeof WORD_BEATS)[number],
  beatIndex: number,
  nextEnter: Dir | null,
): Transform | null {
  const H_out = getHandoffAfter(beatIndex);
  const H_in = beatIndex > 0 ? getHandoffAfter(beatIndex - 1) : 0;
  const total = getBeatLen();
  if (f < 0 || f >= total) {
    return null;
  }

  const e0 = enterOffset(beat.enter, w, h);
  const x1 = exitOffset(beat.exit, w, h);
  const EXIT_START = ENTER_F + HOLD_F;
  const exitSolo = Math.max(1, EXIT_F - H_out);

  const incoming = nextEnter
    ? incomingUnit(nextEnter, w, h)
    : { x: 0, y: 0 };
  const kickDir =
    beat.handoffStyle === "orthogonalKick"
      ? orthogonal(incoming)
      : incoming;
  const KICK = beat.handoffStyle === "squeeze" ? 28 : 42;
  const REPEL = 18;

  let x = 0;
  let y = 0;
  let opacity = 1;
  let scale = 1;

  // --- ENTRATA: battuta 0 su tutti gli ENTER_F; battute successive primi H frame accoppiati con u ---
  if (f < ENTER_F) {
    if (beatIndex === 0) {
      const t = interpolate(f, [0, ENTER_F - 0.001], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const te = easeOut(beat.enterEase)(t);
      x = interpolate(te, [0, 1], [e0.x, 0]);
      y = interpolate(te, [0, 1], [e0.y, 0]);
      opacity = interpolate(f, [0, 5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      scale = interpolate(te, [0, 1], [0.92, 1]);
    } else if (f < H_in) {
      const u = interpolate(f, [0, H_in - 0.001], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const te = easeOut(beat.enterEase)(u);
      x = interpolate(te, [0, 1], [e0.x, 0]);
      y = interpolate(te, [0, 1], [e0.y, 0]);
      opacity = interpolate(u, [0, 0.1, 1], [0, 0.92, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      scale =
        beat.handoffStyle === "squeeze"
          ? interpolate(u, [0, 1], [0.86, 1])
          : interpolate(te, [0, 1], [0.9, 1]);
    } else {
      x = 0;
      y = 0;
      opacity = 1;
      scale = 1;
    }
  } else if (f < EXIT_START) {
    x = 0;
    y = 0;
    opacity = 1;
    scale = 1;
  } else {
    // --- USCITA: prima parte sola, poi handoff accoppiato ---
    const ef = f - EXIT_START;
    if (ef < exitSolo) {
      const t = interpolate(ef, [0, exitSolo - 0.001], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easeIn(beat.exitEase),
      });
      x = interpolate(t, [0, 1], [0, x1.x * 0.38]);
      y = interpolate(t, [0, 1], [0, x1.y * 0.38]);
      opacity = interpolate(ef, [0, exitSolo * 0.4], [1, 0.92], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      scale = interpolate(t, [0, 1], [1, 0.97]);
    } else {
      const hf = ef - exitSolo;
      const u = interpolate(hf, [0, H_out - 0.001], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const baseT = easeIn(beat.exitEase)(u);
      const xBase = interpolate(baseT, [0, 1], [x1.x * 0.38, x1.x]);
      const yBase = interpolate(baseT, [0, 1], [x1.y * 0.38, x1.y]);
      const kick = KICK * Easing.inOut(Easing.quad)(u);
      const repel = REPEL * (1 - u);
      x =
        xBase +
        kickDir.x * kick -
        incoming.x * repel * (nextEnter ? 1 : 0);
      y =
        yBase +
        kickDir.y * kick -
        incoming.y * repel * (nextEnter ? 1 : 0);
      opacity = interpolate(u, [0, 0.25, 1], [0.92, 0.75, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      scale = interpolate(
        u,
        [0, 1],
        beat.handoffStyle === "squeeze" ? [0.97, 0.82] : [0.97, 0.9],
      );
    }
  }

  return { x, y, opacity, scale };
}

const WordBeat = ({
  text,
  f,
  w,
  h,
  stack,
  beat,
  beatIndex,
  nextEnter,
}: {
  text: string;
  f: number;
  w: number;
  h: number;
  stack: number;
  beat: (typeof WORD_BEATS)[number];
  beatIndex: number;
  nextEnter: Dir | null;
}) => {
  const tr = computeBeatTransform(f, w, h, beat, beatIndex, nextEnter);
  if (!tr) {
    return null;
  }

  const fontSize = giantFontSize(text, w, h, beat.sizeMul);

  return (
    <div
      style={{
        ...baseText,
        position: "absolute",
        left: "50%",
        top: "50%",
        fontSize,
        opacity: tr.opacity,
        transform: `translate(calc(-50% + ${tr.x}px), calc(-50% + ${tr.y}px)) scale(${tr.scale})`,
        textShadow:
          "0 0 48px rgba(255,255,255,0.4), 0 6px 32px rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        zIndex: 20 + stack,
      }}
    >
      {text}
    </div>
  );
};

const DramaticTwo = ({ f, w, h }: { f: number; w: number; h: number }) => {
  const enterLen = DRAMATIC_TWO_ENTER_F;
  const holdLen = DRAMATIC_TWO_HOLD_F;
  const exitLen = DRAMATIC_TWO_EXIT_F;
  const total = enterLen + holdLen + exitLen;
  if (f < 0 || f >= total) {
    return null;
  }

  const fontSize = Math.min(h * 0.62, w * 0.52);

  if (f < enterLen) {
    const t = interpolate(f, [0, enterLen - 0.001], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(quint),
    });
    const scale = interpolate(t, [0, 1], [0.06, 1.06]);
    const rot = interpolate(t, [0, 1], [-18, 0]);
    const opacity = interpolate(f, [0, Math.min(3, enterLen - 1)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const blur = interpolate(t, [0, 0.42], [14, 0], {
      extrapolateRight: "clamp",
      easing: Easing.out(quint),
    });

    return (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`,
          opacity,
          filter: `blur(${blur}px)`,
        }}
      >
        <div
          style={{
            fontFamily: baseText.fontFamily,
            fontWeight: 900,
            fontSize,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-0.07em",
            textShadow:
              "0 0 72px rgba(255,255,255,0.95), 0 0 140px rgba(147,197,253,0.5), 0 16px 56px rgba(0,0,0,0.8)",
          }}
        >
          2
        </div>
      </div>
    );
  }

  if (f < enterLen + holdLen) {
    return (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) scale(1.05)",
        }}
      >
        <div
          style={{
            fontFamily: baseText.fontFamily,
            fontWeight: 900,
            fontSize,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-0.07em",
            textShadow:
              "0 0 88px rgba(255,255,255,0.98), 0 0 160px rgba(96,165,250,0.55), 0 18px 60px rgba(0,0,0,0.82)",
          }}
        >
          2
        </div>
      </div>
    );
  }

  const xf = f - enterLen - holdLen;
  const t = interpolate(xf, [0, exitLen - 0.001], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const scale = interpolate(t, [0, 1], [1.05, 2.2]);
  const opacity = interpolate(xf, [0, exitLen * 0.7], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: baseText.fontFamily,
          fontWeight: 900,
          fontSize,
          color: "#ffffff",
          lineHeight: 1,
          letterSpacing: "-0.07em",
          textShadow: "0 0 48px rgba(255,255,255,0.55)",
        }}
      >
        2
      </div>
    </div>
  );
};

export const GoldHeroMessages = () => {
  /** Hero-local frames: `useCurrentFrame()` is relative to the Hero `<Sequence>` start (Remotion). */
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const dim = interpolate(f, [0, 10], [0, 0.45], {
    extrapolateRight: "clamp",
  });

  const lineNodes = WORD_BEATS.map((beat, i) => (
    <WordBeat
      key={i}
      text={beat.text}
      f={f - getBeatStart(i)}
      w={width}
      h={height}
      stack={i}
      beat={beat}
      beatIndex={i}
      nextEnter={WORD_BEATS[i + 1]?.enter ?? null}
    />
  ));

  return (
    <AbsoluteFill
      style={{
        zIndex: 40,
        pointerEvents: "none",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AbsoluteFill
        style={{
          background: `rgba(2, 6, 14, ${dim})`,
        }}
      />
      <AbsoluteFill style={{ zIndex: 1 }}>
        {lineNodes}
        <DramaticTwo f={f - OFFSET_BIG_TWO} w={width} h={height} />
        <BacktestoSparkReveal f={f - OFFSET_BACKTESTO_IMAGES} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
