import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { getWaveLength, T_FALL, T_UP } from "./timeline";

/** Rest positions (spread across upper/mid frame, semi-chaotic) — index matches comment order. */
const CHAOTIC_TARGETS: ReadonlyArray<{ leftPct: number; topNorm: number }> = [
  { leftPct: 11, topNorm: 0.07 },
  { leftPct: 86, topNorm: 0.086 },
  { leftPct: 44, topNorm: 0.096 },
  { leftPct: 91, topNorm: 0.068 },
  { leftPct: 19, topNorm: 0.118 },
  { leftPct: 66, topNorm: 0.104 },
  { leftPct: 7, topNorm: 0.099 },
  { leftPct: 74, topNorm: 0.128 },
  { leftPct: 34, topNorm: 0.142 },
  { leftPct: 89, topNorm: 0.154 },
  { leftPct: 15, topNorm: 0.164 },
  { leftPct: 57, topNorm: 0.176 },
  { leftPct: 83, topNorm: 0.192 },
  { leftPct: 27, topNorm: 0.202 },
  { leftPct: 49, topNorm: 0.186 },
  { leftPct: 93, topNorm: 0.208 },
  { leftPct: 13, topNorm: 0.23 },
  { leftPct: 69, topNorm: 0.222 },
  { leftPct: 37, topNorm: 0.248 },
  { leftPct: 84, topNorm: 0.24 },
  { leftPct: 23, topNorm: 0.27 },
  { leftPct: 61, topNorm: 0.262 },
  { leftPct: 51, topNorm: 0.288 },
  { leftPct: 39, topNorm: 0.302 },
];

export const ITALIAN_FEATURE_COMMENTS: Array<{
  author: string;
  icon: string;
  text: string;
  from: number;
  leftPct: number;
}> = [
  {
    author: "Marco Bianchi",
    icon: "📊",
    text: "Come trovo l'allocazione per valuta del mio portafoglio?",
    from: 0,
    leftPct: 12,
  },
  {
    author: "Giulia Ferretti",
    icon: "📑",
    text: "Mi aggiungete l'export degli estratti conto in Excel?",
    from: 5,
    leftPct: 78,
  },
  {
    author: "Alessandro Conti",
    icon: "💳",
    text: "Dove vedo le commissioni dettagliate su ogni ordine?",
    from: 10,
    leftPct: 44,
  },
  {
    author: "Francesca Romano",
    icon: "🔔",
    text: "Alert quando un titolo supera una soglia di prezzo?",
    from: 15,
    leftPct: 88,
  },
  {
    author: "Luca Moretti",
    icon: "🏦",
    text: "Posso collegare più conti per il consolidamento?",
    from: 20,
    leftPct: 22,
  },
  {
    author: "Elena Martini",
    icon: "📈",
    text: "Mostrate il TWR e il MWR del portafoglio?",
    from: 25,
    leftPct: 62,
  },
  {
    author: "Davide Ricci",
    icon: "🛡️",
    text: "Come imposto le notifiche sulle operazioni sospette?",
    from: 30,
    leftPct: 8,
  },
  {
    author: "Chiara Gallo",
    icon: "🔎",
    text: "Aggiungete filtri per settore e capitalizzazione?",
    from: 35,
    leftPct: 70,
  },
  {
    author: "Matteo Fontana",
    icon: "🧾",
    text: "Dove trovo la minusvalenza compensateibile?",
    from: 40,
    leftPct: 36,
  },
  {
    author: "Sara Lombardi",
    icon: "📉",
    text: "Confrontate il mio portafoglio con un benchmark personalizzato?",
    from: 45,
    leftPct: 92,
  },
  {
    author: "Andrea Costa",
    icon: "👔",
    text: "Esportazione automatica per il commercialista?",
    from: 50,
    leftPct: 18,
  },
  {
    author: "Valentina Marino",
    icon: "💹",
    text: "Vista grafico storico delle commissioni annue?",
    from: 55,
    leftPct: 54,
  },
  {
    author: "Simone Greco",
    icon: "🏛️",
    text: "Come classifico le plusvalenze per la dichiarazione dei redditi?",
    from: 60,
    leftPct: 82,
  },
  {
    author: "Martina Bruno",
    icon: "💶",
    text: "Il prelievo fiscale è già calcolato in piattaforma?",
    from: 65,
    leftPct: 28,
  },
  {
    author: "Federico Serra",
    icon: "🪙",
    text: "Quando aprite i fondi pensione aperti (FPA)?",
    from: 70,
    leftPct: 66,
  },
  {
    author: "Ilaria Pellegrini",
    icon: "📱",
    text: "Notifiche push sull'IBAN collegato e sugli incassi?",
    from: 75,
    leftPct: 14,
  },
  {
    author: "Paolo Vitale",
    icon: "📋",
    text: "Drag & drop per riordinare le watchlist?",
    from: 80,
    leftPct: 74,
  },
  {
    author: "Silvia Caruso",
    icon: "🌙",
    text: "Dark mode anche nei PDF degli estratti?",
    from: 85,
    leftPct: 40,
  },
  {
    author: "Riccardo De Luca",
    icon: "🧮",
    text: "Simulatore d'impatto fiscale sulle vendite parziali?",
    from: 90,
    leftPct: 6,
  },
  {
    author: "Giada Ferrara",
    icon: "👨‍👩‍👧",
    text: "Aggregazione del patrimonio familiare in un'unica dashboard?",
    from: 95,
    leftPct: 58,
  },
  {
    author: "Tommaso Bianco",
    icon: "🧾",
    text: "Integrazione con FatturaPA per le spese aziendali?",
    from: 100,
    leftPct: 86,
  },
  {
    author: "Camilla Rizzo",
    icon: "🌍",
    text: "Mostrate lo split per asset class e per geografia?",
    from: 105,
    leftPct: 32,
  },
  {
    author: "Lorenzo Marchetti",
    icon: "🎯",
    text: "Posso fissare un obiettivo di risparmio con promemoria?",
    from: 110,
    leftPct: 50,
  },
  {
    author: "Alessandra Colombo",
    icon: "💰",
    text: "Storico delle tasse trattenute su dividendi e cedole?",
    from: 115,
    leftPct: 24,
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

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPct}%`,
        top: y,
        transform: `translate(-50%, 0) rotate(${rotate}deg)`,
        opacity,
        maxWidth: Math.min(400, width * 0.42),
        padding: "10px 14px 10px 10px",
        borderRadius: 18,
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
        gap: 10,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          minWidth: 40,
          borderRadius: "50%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
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
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.01em",
            color: "rgba(186, 230, 253, 0.95)",
            marginBottom: 4,
          }}
        >
          {author}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.38,
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
  const globalFrame = useCurrentFrame();
  const { height, width, fps } = useVideoConfig();
  const waveLength = getWaveLength(fps);
  const frame = globalFrame % waveLength;

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
