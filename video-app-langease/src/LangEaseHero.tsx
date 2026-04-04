import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BEAT_LAYOUT_PLAN,
  MOTION_BEAT,
  getDecorPosition,
  getTextLayoutBox,
} from "./lang-ease-layout-plan";
import { PromoDecor, type PromoDecorKind } from "./PromoDecor";

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

/** Allineato a `scene-tracks`: somma battute = hero frames. */
export const ENTER_F = 8;
export const HOLD_F = 20;
export const EXIT_F = 8;

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

function incomingUnit(enter: Dir, w: number, h: number) {
  const o = enterOffset(enter, w, h);
  const len = Math.hypot(o.x, o.y) || 1;
  return { x: -o.x / len, y: -o.y / len };
}

function orthogonal(v: { x: number; y: number }) {
  return { x: -v.y, y: v.x };
}

/** Palette minimale: bianco / blu / grigio-nero / corallo. Glow tenue. */
export type ColorTone = "white" | "blue" | "ink" | "coral";

const TONE: Record<ColorTone, { text: string; glow: string }> = {
  white: { text: "#f8fafc", glow: "rgba(148, 163, 184, 0.22)" },
  blue: { text: "#93c5fd", glow: "rgba(59, 130, 246, 0.28)" },
  ink: { text: "#cbd5e1", glow: "rgba(15, 23, 42, 0.35)" },
  coral: { text: "#fb7185", glow: "rgba(251, 113, 133, 0.28)" },
};

function toneForBeat(i: number): ColorTone {
  /** Blocchi: hook → portafoglio → geo/MC → live → forum → CTA. */
  if (i <= 4) {
    if (i === 4) {
      return "coral";
    }
    return i === 0 ? "white" : "blue";
  }
  if (i <= 9) {
    if (i === 5 || i === 6 || i === 9) {
      return "white";
    }
    return "blue";
  }
  if (i <= 14) {
    if (i === 14) {
      return "coral";
    }
    if (i === 13) {
      return "ink";
    }
    if (i === 10) {
      return "white";
    }
    return "blue";
  }
  if (i <= 22) {
    if (i === 22) {
      return "white";
    }
    return i % 2 === 0 ? "blue" : "white";
  }
  if (i <= 29) {
    if (i === 28 || i === 29) {
      return "coral";
    }
    return "white";
  }
  return i === 31 ? "blue" : "white";
}

function giantFontSize(
  text: string,
  w: number,
  h: number,
  sizeMul = 1,
): number {
  const charW = 0.66;
  const maxByH = h * 0.4;
  const maxByW = (w * 0.92) / (Math.max(text.length, 2) * charW);
  return Math.max(34, Math.min(maxByH, maxByW) * sizeMul);
}

type ExitMorph = "slide" | "zoomBackdrop";
type EnterShape = "none" | "circle" | "diamond" | "slant";

type Beat = {
  text: string;
  enter: Dir;
  exit: Dir;
  sizeMul?: number;
  handoffStyle: HandoffStyle;
  enterEase: EaseName;
  exitEase: EaseName;
  handoffFrames?: number;
  tiltXDeg: number;
  tiltYDeg: number;
  colorTone: ColorTone;
  decor: PromoDecorKind;
  textLayout: import("./lang-ease-layout-plan").TextLayoutId;
  decorLayout: import("./lang-ease-layout-plan").DecorLayoutId;
  /** Slide classico vs parola che esplode come “parete” tipografica. */
  exitMorph: ExitMorph;
  /** Maschera d’ingresso se la battuta precedente ha fatto zoomBackdrop. */
  enterShape: EnterShape;
};

type RawBeat = {
  text: string;
  handoffFrames?: number;
  tiltXDeg: number;
  tiltYDeg: number;
  decor: PromoDecorKind;
  sizeMul?: number;
};

/** Dati per battuta; movimento e posizioni da `lang-ease-layout-plan.ts`. */
const RAW_BEATS: ReadonlyArray<RawBeat> = [
  { text: "Qualcuno ha detto", handoffFrames: 9, tiltXDeg: -6, tiltYDeg: 4, decor: null },
  { text: "un backtester", handoffFrames: 8, tiltXDeg: 5, tiltYDeg: -3, decor: "chart", sizeMul: 0.95 },
  { text: "live tracker", handoffFrames: 8, tiltXDeg: -4, tiltYDeg: 6, decor: "pulse" },
  { text: "forum", handoffFrames: 9, tiltXDeg: 7, tiltYDeg: -2, decor: "forum" },
  { text: "gratuito al 100%", handoffFrames: 9, tiltXDeg: -5, tiltYDeg: 5, decor: null, sizeMul: 0.88 },
  { text: "Crea il tuo", handoffFrames: 8, tiltXDeg: 4, tiltYDeg: 4, decor: "portfolio" },
  { text: "portafoglio", handoffFrames: 8, tiltXDeg: -7, tiltYDeg: 3, decor: "portfolio" },
  { text: "vedi come", handoffFrames: 8, tiltXDeg: 6, tiltYDeg: -4, decor: "chart" },
  { text: "avrebbe performato", handoffFrames: 9, tiltXDeg: -3, tiltYDeg: 6, decor: "chart", sizeMul: 0.9 },
  { text: "nel tempo", handoffFrames: 8, tiltXDeg: 5, tiltYDeg: 5, decor: null },
  { text: "Guarda la", handoffFrames: 8, tiltXDeg: -6, tiltYDeg: -3, decor: "globe" },
  { text: "composizione geografica", handoffFrames: 9, tiltXDeg: 4, tiltYDeg: 7, decor: "globe", sizeMul: 0.85 },
  { text: "come performerà", handoffFrames: 8, tiltXDeg: 6, tiltYDeg: -5, decor: "chart" },
  { text: "nel futuro", handoffFrames: 8, tiltXDeg: -4, tiltYDeg: 4, decor: null },
  { text: "Monte Carlo", handoffFrames: 9, tiltXDeg: 8, tiltYDeg: 2, decor: "chart", sizeMul: 0.92 },
  { text: "traccia nel tempo", handoffFrames: 8, tiltXDeg: -5, tiltYDeg: 5, decor: "pulse" },
  { text: "con il live", handoffFrames: 8, tiltXDeg: 5, tiltYDeg: -4, decor: "pulse" },
  { text: "tracker", handoffFrames: 9, tiltXDeg: -7, tiltYDeg: 3, decor: "pulse" },
  { text: "monitora", handoffFrames: 8, tiltXDeg: 4, tiltYDeg: 6, decor: "portfolio" },
  { text: "dividendi", handoffFrames: 8, tiltXDeg: 6, tiltYDeg: -3, decor: "coins" },
  { text: "cedole", handoffFrames: 8, tiltXDeg: -4, tiltYDeg: 5, decor: "coins" },
  { text: "azioni", handoffFrames: 9, tiltXDeg: 5, tiltYDeg: 4, decor: "chart" },
  { text: "e molto altro", handoffFrames: 8, tiltXDeg: -6, tiltYDeg: -4, decor: null, sizeMul: 0.88 },
  { text: "Interagisci nel", handoffFrames: 8, tiltXDeg: 7, tiltYDeg: 2, decor: "forum" },
  { text: "forum", handoffFrames: 9, tiltXDeg: -5, tiltYDeg: 6, decor: "forum" },
  { text: "leggi gli", handoffFrames: 8, tiltXDeg: 4, tiltYDeg: -5, decor: "article" },
  { text: "articoli", handoffFrames: 8, tiltXDeg: 6, tiltYDeg: 4, decor: "article" },
  { text: "Dani e Matteo", handoffFrames: 9, tiltXDeg: -4, tiltYDeg: 5, decor: null, sizeMul: 0.87 },
  { text: "commenta", handoffFrames: 8, tiltXDeg: 5, tiltYDeg: -6, decor: "forum" },
  { text: "metti like", handoffFrames: 8, tiltXDeg: -8, tiltYDeg: 3, decor: "like" },
  { text: "Tutto questo", handoffFrames: 9, tiltXDeg: 6, tiltYDeg: 5, decor: null },
  { text: "su Backtesto 2", handoffFrames: 8, tiltXDeg: -3, tiltYDeg: -7, decor: null, sizeMul: 0.94 },
];

function exitMorphFor(i: number, n: number): ExitMorph {
  if (i === n - 1) {
    return "zoomBackdrop";
  }
  const zoom = new Set([2, 5, 9, 13, 17, 21, 25, 29]);
  return zoom.has(i) ? "zoomBackdrop" : "slide";
}

function enterShapeFor(
  i: number,
  prevMorphs: ReadonlyArray<ExitMorph>,
): EnterShape {
  if (i === 0) {
    return "none";
  }
  if (prevMorphs[i - 1] !== "zoomBackdrop") {
    return "none";
  }
  const seq: Array<Exclude<EnterShape, "none">> = ["circle", "diamond", "slant"];
  return seq[i % 3];
}

const EXIT_MORPHS = RAW_BEATS.map((_, i) => exitMorphFor(i, RAW_BEATS.length));

const SAAS_BEATS: ReadonlyArray<Beat> = RAW_BEATS.map((raw, i) => {
  const motion = MOTION_BEAT[i];
  const layout = BEAT_LAYOUT_PLAN[i];
  return {
    ...raw,
    ...motion,
    textLayout: layout.textLayout,
    decorLayout: layout.decorLayout,
    colorTone: toneForBeat(i),
    exitMorph: EXIT_MORPHS[i],
    enterShape: enterShapeFor(i, EXIT_MORPHS),
  };
});

const DEFAULT_HANDOFF = 8;

const getBeatLen = () => ENTER_F + HOLD_F + EXIT_F;

const getHandoffAfter = (i: number) =>
  SAAS_BEATS[i]?.handoffFrames ?? DEFAULT_HANDOFF;

const getBeatSpacing = (i: number): number => {
  return getBeatLen() - getHandoffAfter(i);
};

function getBeatStart(i: number): number {
  let s = 0;
  for (let j = 0; j < i; j++) {
    s += getBeatSpacing(j);
  }
  return s;
}

type Transform = {
  x: number;
  y: number;
  opacity: number;
  scale: number;
  blurPx: number;
};

/** Maschere d’ingresso dopo uno zoom “sfondo”. */
function enterClipPath(shape: EnterShape, t: number): string | undefined {
  if (shape === "none") {
    return undefined;
  }
  const p = Easing.out(Easing.cubic)(t);
  if (shape === "circle") {
    const r = interpolate(p, [0, 1], [0, 150]);
    return `circle(${r}% at 50% 50%)`;
  }
  if (shape === "diamond") {
    const o = interpolate(p, [0, 1], [50, 0]);
    return `polygon(50% ${o}%, ${100 - o}% 50%, 50% ${100 - o}%, ${o}% 50%)`;
  }
  const skew = interpolate(p, [0, 1], [48, 0]);
  return `polygon(${skew}% 0%, 100% 0%, ${100 - skew}% 100%, 0% 100%)`;
}

function computeBeatTransform(
  f: number,
  w: number,
  h: number,
  beat: Beat,
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
  let blurPx = 0;

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
      scale = interpolate(te, [0, 1], [0.94, 1]);
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
          ? interpolate(u, [0, 1], [0.9, 1])
          : interpolate(te, [0, 1], [0.92, 1]);
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
    const ef = f - EXIT_START;
    if (beat.exitMorph === "zoomBackdrop") {
      const u = interpolate(ef, [0, EXIT_F - 0.001], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easeIn("quint"),
      });
      const len = Math.max(beat.text.length, 2);
      const maxZoom = Math.min(26, 200 / len);
      x = 0;
      y = 0;
      scale = interpolate(u, [0, 1], [1, maxZoom]);
      opacity = interpolate(u, [0, 0.48, 1], [1, 0.2, 0.035]);
      blurPx = interpolate(u, [0, 1], [0, 18]);
      return { x, y, opacity, scale, blurPx };
    }
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
      scale = interpolate(t, [0, 1], [1, 0.94]);
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

  if (f < ENTER_F && beat.enterShape !== "none") {
    const tPop = interpolate(f, [0, ENTER_F - 0.001], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const back = Easing.out(Easing.back(1.1))(tPop);
    const mul = interpolate(back, [0, 1], [0.12, 1]);
    scale *= mul;
  }

  return { x, y, opacity, scale, blurPx };
}

const baseText: CSSProperties = {
  fontFamily: '"Montserrat", "Helvetica Neue", system-ui, sans-serif',
  fontWeight: 900,
  letterSpacing: "-0.03em",
  textAlign: "center",
  lineHeight: 1.05,
  width: "92%",
  maxWidth: "92%",
  margin: "0 auto",
};

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
  beat: Beat;
  beatIndex: number;
  nextEnter: Dir | null;
}) => {
  const tr = computeBeatTransform(f, w, h, beat, beatIndex, nextEnter);
  if (!tr) {
    return null;
  }

  const fontSize = giantFontSize(text, w, h, beat.sizeMul);
  const col = TONE[beat.colorTone];
  const layoutBox = getTextLayoutBox(beat.textLayout);
  const { transform: baseAnchor, ...layoutRest } = layoutBox;

  const tiltT = interpolate(
    f,
    [0, ENTER_F - 0.001],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut("quint") },
  );
  const rotXDeg = interpolate(tiltT, [0, 1], [0, beat.tiltXDeg]);
  const rotYDeg = interpolate(tiltT, [0, 1], [0, beat.tiltYDeg]);

  const perspective = 900;
  const transform = `${baseAnchor} perspective(${perspective}px) rotateX(${rotXDeg}deg) rotateY(${rotYDeg}deg) translate3d(${tr.x}px, ${tr.y}px, 0) scale(${tr.scale})`;

  /** Clip solo durante l’entrata: a diamante/cerchio chiuso il testo resterebbe tagliato per tutta la battuta. */
  const clipDuringEnter = beat.enterShape !== "none" && f < ENTER_F;
  const clipT = clipDuringEnter
    ? interpolate(f, [0, ENTER_F - 0.001], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const clipPath = clipDuringEnter
    ? enterClipPath(beat.enterShape, clipT)
    : undefined;

  const inZoomExit =
    beat.exitMorph === "zoomBackdrop" && f >= ENTER_F + HOLD_F;
  const zBase = inZoomExit ? 8 : 24;
  const efLetter = f - (ENTER_F + HOLD_F);
  const lastGlyphBoost =
    inZoomExit && text.length >= 2
      ? interpolate(efLetter, [EXIT_F * 0.35, EXIT_F - 0.001], [1, 1.55], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(quint),
        })
      : 1;

  const inner =
    inZoomExit && text.length >= 2 ? (
      <>
        <span style={{ opacity: interpolate(efLetter, [0, EXIT_F * 0.5], [1, 0.25], { extrapolateRight: "clamp" }) }}>
          {text.slice(0, -1)}
        </span>
        <span
          style={{
            display: "inline-block",
            transform: `scale(${lastGlyphBoost})`,
            transformOrigin: "55% 88%",
          }}
        >
          {text.slice(-1)}
        </span>
      </>
    ) : (
      text
    );

  return (
    <div
      style={{
        ...baseText,
        ...layoutRest,
        position: "absolute",
        fontSize,
        color: col.text,
        opacity: tr.opacity,
        transform,
        filter: tr.blurPx > 0.5 ? `blur(${tr.blurPx}px)` : undefined,
        textShadow: `0 0 28px ${col.glow}, 0 6px 24px rgba(0,0,0,0.55)`,
        display: "block",
        boxSizing: "border-box",
        zIndex: zBase + stack,
        ...(clipPath
          ? { clipPath, WebkitClipPath: clipPath, overflow: "hidden" as const }
          : {}),
      }}
    >
      {inner}
    </div>
  );
};

export const LangEaseHero = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const dim = interpolate(f, [0, 12], [0, 0.42], {
    extrapolateRight: "clamp",
  });

  const lineNodes = SAAS_BEATS.map((beat, i) => (
    <WordBeat
      key={i}
      text={beat.text}
      f={f - getBeatStart(i)}
      w={width}
      h={height}
      stack={i}
      beat={beat}
      beatIndex={i}
      nextEnter={SAAS_BEATS[i + 1]?.enter ?? null}
    />
  ));

  const decorNodes = SAAS_BEATS.map((beat, i) => {
    const local = f - getBeatStart(i);
    const col = TONE[beat.colorTone];
    const effectiveLayout =
      beat.decor === null ? "hidden" : beat.decorLayout;
    const pos = getDecorPosition(effectiveLayout);
    return (
      <PromoDecor
        key={`d-${i}`}
        kind={beat.decor}
        f={local}
        enterLen={ENTER_F}
        holdLen={HOLD_F}
        exitLen={EXIT_F}
        accent={col.text}
        dim={Math.min(width, height) * 0.2}
        position={pos}
      />
    );
  });

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
      <AbsoluteFill
        style={{
          zIndex: 1,
          perspective: "1100px",
          perspectiveOrigin: "50% 45%",
        }}
      >
        {decorNodes}
        {lineNodes}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Durata hero in frame @30fps; deve combaciare con `scene-tracks` + audio. */
export const LANG_EASE_HERO_TOTAL_FRAMES =
  getBeatStart(SAAS_BEATS.length - 1) + getBeatLen();

/** Frame locali alla battuta `i` (0 = inizio battuta). */
export function getHeroBeatStartFrame(i: number): number {
  return getBeatStart(i);
}

/** Indice battuta attiva e metadati per sfondi / effetti sincronizzati. */
export function getHeroActiveContext(f: number): {
  beatIndex: number;
  localFrame: number;
  decor: PromoDecorKind;
  text: string;
} {
  let beatIndex = 0;
  for (let i = SAAS_BEATS.length - 1; i >= 0; i--) {
    if (f >= getBeatStart(i)) {
      beatIndex = i;
      break;
    }
  }
  const b = SAAS_BEATS[beatIndex];
  return {
    beatIndex,
    localFrame: f - getBeatStart(beatIndex),
    decor: b.decor,
    text: b.text,
  };
}
