import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T_FALL, T_UP } from "./timeline";

/** Rest positions (spread across upper/mid frame) — index matches comment order. */
const CHAOTIC_TARGETS: ReadonlyArray<{ leftPct: number; topNorm: number }> = [
  { leftPct: 14, topNorm: 0.07 },
  { leftPct: 88, topNorm: 0.09 },
  { leftPct: 48, topNorm: 0.12 },
  { leftPct: 10, topNorm: 0.15 },
  { leftPct: 82, topNorm: 0.18 },
  { leftPct: 42, topNorm: 0.21 },
  { leftPct: 72, topNorm: 0.1 },
  { leftPct: 24, topNorm: 0.24 },
  { leftPct: 92, topNorm: 0.2 },
  { leftPct: 18, topNorm: 0.27 },
  { leftPct: 58, topNorm: 0.14 },
  { leftPct: 36, topNorm: 0.29 },
  { leftPct: 66, topNorm: 0.25 },
  { leftPct: 50, topNorm: 0.31 },
];

export const ITALIAN_FEATURE_COMMENTS: Array<{
  author: string;
  icon: string;
  text: string;
  from: number;
  leftPct: number;
}> = [
  {
    author: "Community",
    icon: "🌙",
    text: "Vogliamo la dark mode",
    from: 0,
    leftPct: 18,
  },
  {
    author: "Dani",
    icon: "⚖️",
    text: "Aggiungi il ribilanciamento del portafoglio",
    from: 11,
    leftPct: 72,
  },
  {
    author: "Marco",
    icon: "🧾",
    text: "Aggiungi le tasse",
    from: 22,
    leftPct: 28,
  },
  {
    author: "Giulia",
    icon: "📱",
    text: "Migliora l'uso da smartphone",
    from: 33,
    leftPct: 84,
  },
  {
    author: "Luca",
    icon: "📊",
    text: "Mancano asset",
    from: 44,
    leftPct: 12,
  },
  {
    author: "Sara",
    icon: "💬",
    text: "Più chiarezza su commissioni e costi",
    from: 55,
    leftPct: 58,
  },
  {
    author: "Fede",
    icon: "📄",
    text: "L'export PDF deve essere molto più chiaro e completo",
    from: 66,
    leftPct: 76,
  },
  {
    author: "Alex",
    icon: "🤖",
    text: "Migliora Alpha AI: risposte e insight più utili",
    from: 77,
    leftPct: 22,
  },
  {
    author: "Chiara",
    icon: "📈",
    text: "Estendi i dati: più storico, più metriche, più dettaglio",
    from: 88,
    leftPct: 64,
  },
  {
    author: "Tommaso",
    icon: "⚡",
    text: "Quando la leva sul portafoglio?",
    from: 99,
    leftPct: 40,
  },
  {
    author: "Elena",
    icon: "🔥",
    text: "Simulazione FIRE: ritiro anticipato e scenari realistici",
    from: 110,
    leftPct: 88,
  },
  {
    author: "Valentina",
    icon: "🎨",
    text: "Migliora la UI: meno attrito, più chiarezza",
    from: 121,
    leftPct: 16,
  },
  {
    author: "Simone",
    icon: "🔔",
    text: "Alert e notifiche davvero personalizzabili",
    from: 132,
    leftPct: 52,
  },
  {
    author: "Andrea",
    icon: "🔗",
    text: "Più integrazioni: broker, banche, fogli Excel",
    from: 143,
    leftPct: 70,
  },
];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;

const ThrownPill = ({
  author,
  icon,
  text,
  from,
  leftPct,
  index,
  frame,
  height,
  width,
  fps,
}: {
  author: string;
  icon: string;
  text: string;
  from: number;
  leftPct: number;
  index: number;
  frame: number;
  height: number;
  width: number;
  fps: number;
}) => {
  /** Fixed width so shrink-to-fit does not narrow the pill when `left` nears the edges. */
  const pillW = Math.min(560, width * 0.62);
  const edgeMargin = 12;

  const startY = height + 140;
  const endFallY = height + 220;
  const slot = CHAOTIC_TARGETS[index] ?? CHAOTIC_TARGETS[0];
  const targetLeftPct = slot.leftPct;
  const apexY = slot.topNorm * height;
  const holdAfterApex = Math.round(0.5 * fps);
  const fallStart = from + T_UP + holdAfterApex; // sync with ./timeline getHoldAfterApex

  const t = frame - from;

  if (t < 0) {
    return null;
  }

  let y: number;
  let xPct: number;
  let rotate: number;
  let opacity: number;

  if (frame >= fallStart) {
    const tf = frame - fallStart;
    const f = easeInCubic(
      interpolate(tf, [0, T_FALL], [0, 1], { extrapolateRight: "clamp" }),
    );
    y = interpolate(f, [0, 1], [apexY, endFallY]);
    xPct = interpolate(f, [0, 1], [targetLeftPct, targetLeftPct + (index % 3) - 1]);
    rotate = interpolate(f, [0, 1], [0, 14]);
    opacity =
      tf > T_FALL + 6
        ? interpolate(tf, [T_FALL + 6, T_FALL + 20], [1, 0], {
            extrapolateRight: "clamp",
          })
        : 1;
  } else if (t < T_UP) {
    const u = interpolate(t, [0, T_UP], [0, 1], { extrapolateRight: "clamp" });
    const eased = easeOutCubic(u);
    const xLag = easeOutCubic(interpolate(t, [0, T_UP + 8], [0, 1], { extrapolateRight: "clamp" }));
    y = interpolate(eased, [0, 1], [startY, apexY]);
    xPct = interpolate(xLag, [0, 1], [leftPct, targetLeftPct]);
    rotate = interpolate(u, [0, 0.5, 1], [-22, 11, -4]);
    opacity = interpolate(t, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  } else {
    const micro = Math.sin((frame + index * 3) * 0.19) * 0.8;
    y = apexY + micro;
    xPct = targetLeftPct + Math.sin((frame + index) * 0.13) * 0.35;
    rotate = interpolate(t - T_UP, [0, holdAfterApex], [-4, 0], {
      extrapolateRight: "clamp",
    });
    opacity = 1;
  }

  // Keep center-x inside frame so the pill never “squishes” from shrink-to-fit at edges.
  const half = pillW / 2;
  let centerPx = (xPct / 100) * width;
  const minCx = half + edgeMargin;
  const maxCx = width - half - edgeMargin;
  if (centerPx < minCx) {
    centerPx = minCx;
  } else if (centerPx > maxCx) {
    centerPx = maxCx;
  }
  xPct = (centerPx / width) * 100;

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPct}%`,
        top: y,
        transform: `translate(-50%, 0) rotate(${rotate}deg)`,
        opacity,
        width: pillW,
        minWidth: pillW,
        maxWidth: pillW,
        boxSizing: "border-box",
        flexShrink: 0,
        padding: "16px 20px 16px 16px",
        borderRadius: 24,
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "rgba(226, 242, 255, 0.95)",
        background:
          "linear-gradient(145deg, rgba(30, 58, 95, 0.92) 0%, rgba(12, 28, 52, 0.94) 100%)",
        border: "1px solid rgba(96, 165, 250, 0.35)",
        boxShadow:
          "0 0 24px rgba(59, 130, 246, 0.25), 0 8px 32px rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 20 + index,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          minWidth: 54,
          flexShrink: 0,
          borderRadius: "50%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          lineHeight: 1,
          background:
            "linear-gradient(145deg, rgba(56, 189, 248, 0.35) 0%, rgba(37, 99, 235, 0.45) 100%)",
          border: "1px solid rgba(147, 197, 253, 0.45)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
        aria-hidden
      >
        {icon}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.01em",
            color: "rgba(186, 230, 253, 0.95)",
            marginBottom: 6,
          }}
        >
          {author}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.35,
            color: "rgba(226, 242, 255, 0.94)",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

export const CommentPillsLayer = () => {
  const frame = useCurrentFrame();
  const { height, width, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 15 }}>
      {ITALIAN_FEATURE_COMMENTS.map((c, i) => (
        <ThrownPill
          key={i}
          author={c.author}
          icon={c.icon}
          text={c.text}
          from={c.from}
          leftPct={c.leftPct}
          index={i}
          frame={frame}
          height={height}
          width={width}
          fps={fps}
        />
      ))}
    </AbsoluteFill>
  );
};
