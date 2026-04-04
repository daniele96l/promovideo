import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { getHeroActiveContext } from "./LangEaseHero";
import type { PromoDecorKind } from "./PromoDecor";

type AmbientMode =
  | "bars"
  | "globe"
  | "geography"
  | "pulse"
  | "grid"
  | "coins"
  | "moneyRain"
  | "textWaterfall"
  | "peopleTalking"
  | "social"
  | "heart"
  | "hook"
  | "cta"
  | "neutral";

const ARTICLE_WATERFALL_WORDS = [
  "articolo",
  "titoli",
  "mercati",
  "news",
  "analisi",
  "report",
  "trend",
  "focus",
  "lettura",
  "insight",
  "ETF",
  "economia",
  "borsa",
  "studio",
  "commenti",
  "aggiornamenti",
];

function ambientMode(decor: PromoDecorKind, text: string): AmbientMode {
  const t = text.toLowerCase();
  if (t.includes("cedole") || t.includes("dividendi")) {
    return "moneyRain";
  }
  if (t.includes("leggi gli") || t.includes("articoli")) {
    return "textWaterfall";
  }
  if (t.includes("geografica")) {
    return "geography";
  }
  if (decor === "chart") {
    return "bars";
  }
  if (decor === "globe") {
    return "globe";
  }
  if (decor === "pulse") {
    return "pulse";
  }
  if (decor === "portfolio") {
    return "grid";
  }
  if (decor === "coins") {
    return "coins";
  }
  if (decor === "forum") {
    return "peopleTalking";
  }
  if (decor === "article") {
    return "social";
  }
  if (decor === "like") {
    return "heart";
  }
  if (t.includes("gratuito") || t.includes("backtesto")) {
    return "cta";
  }
  if (t.includes("monte carlo")) {
    return "bars";
  }
  if (t.includes("qualcuno")) {
    return "hook";
  }
  if (t.includes("tutto questo")) {
    return "cta";
  }
  return "neutral";
}

const blue = "rgba(147, 197, 253, 0.11)";
const blueStrong = "rgba(96, 165, 250, 0.14)";
const coral = "rgba(251, 113, 133, 0.1)";
const white = "rgba(248, 250, 252, 0.08)";

function BarsLayer({
  w,
  h,
  phase,
}: {
  w: number;
  h: number;
  phase: number;
}) {
  const n = 10;
  const gap = w / (n + 1);
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      {Array.from({ length: n }, (_, i) => {
        const baseH = h * (0.12 + (i % 4) * 0.06);
        const mod =
          0.5 +
          0.5 * Math.sin(phase * 0.35 + i * 0.9 + Math.sin(i) * 0.4);
        const barH = baseH * (0.45 + mod * 0.85);
        const x = gap * (i + 0.5) - 3;
        const y = h * 0.55 - barH;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={6}
            height={barH}
            rx={2}
            fill={i % 3 === 0 ? blueStrong : blue}
          />
        );
      })}
    </svg>
  );
}

function GlobeLayer({ w, h, phase }: { w: number; h: number; phase: number }) {
  const cx = w * 0.5;
  const cy = h * 0.48;
  const rx = w * 0.28;
  const ry = h * 0.2;
  const rot = phase * 2.2;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <g
        transform={`rotate(${rot * 0.15} ${cx} ${cy})`}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={blueStrong}
          strokeWidth={1.5}
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry * 0.42}
          fill="none"
          stroke={blue}
          strokeWidth={1}
          transform={`rotate(${20 + rot * 0.08} ${cx} ${cy})`}
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx * 0.35}
          ry={ry}
          fill="none"
          stroke={blue}
          strokeWidth={1}
          transform={`rotate(${-35 + rot * 0.12} ${cx} ${cy})`}
        />
      </g>
    </svg>
  );
}

/** Mappa / meridiani / continenti stilizzati (composizione geografica). */
function GeographyLayer({ w, h, phase }: { w: number; h: number; phase: number }) {
  const cx = w * 0.5;
  const cy = h * 0.48;
  const rx = w * 0.3;
  const ry = h * 0.21;
  const rot = phase * 1.6;
  const lands = [
    { px: 0.26, py: 0.44, sx: 0.11, sy: 0.14, ang: -18 },
    { px: 0.5, py: 0.4, sx: 0.1, sy: 0.11, ang: 12 },
    { px: 0.72, py: 0.46, sx: 0.14, sy: 0.1, ang: -8 },
    { px: 0.55, py: 0.58, sx: 0.08, sy: 0.06, ang: 22 },
  ];
  const pins = [
    { x: 0.28, y: 0.42 },
    { x: 0.52, y: 0.36 },
    { x: 0.7, y: 0.44 },
    { x: 0.44, y: 0.52 },
  ];
  const labels = [
    { text: "Europa", x: 0.48, y: 0.34 },
    { text: "Asia", x: 0.74, y: 0.4 },
    { text: "Americhe", x: 0.22, y: 0.4 },
    { text: "allocazione", x: 0.58, y: 0.62 },
  ];
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <defs>
        <radialGradient id="geoOcean">
          <stop offset="0%" stopColor="rgba(30, 58, 138, 0.14)" />
          <stop offset="55%" stopColor="rgba(59, 130, 246, 0.06)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx * 1.15} ry={ry * 1.2} fill="url(#geoOcean)" />
      <g
        transform={`rotate(${rot * 0.12} ${cx} ${cy})`}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={blueStrong}
          strokeWidth={1.4}
        />
        {[-0.55, -0.28, 0, 0.28, 0.55].map((k, i) => (
          <ellipse
            key={`lat${i}`}
            cx={cx}
            cy={cy + k * ry * 0.85}
            rx={rx * Math.sqrt(Math.max(0.05, 1 - k * k * 0.95))}
            ry={ry * 0.09}
            fill="none"
            stroke={blue}
            strokeWidth={0.75}
            opacity={0.55}
          />
        ))}
        {[-0.65, -0.32, 0, 0.32, 0.65].map((k, i) => (
          <ellipse
            key={`lon${i}`}
            cx={cx + k * rx * 0.35}
            cy={cy}
            rx={rx * 0.07}
            ry={ry}
            fill="none"
            stroke={white}
            strokeWidth={0.65}
            opacity={0.4}
            transform={`rotate(${k * 18 + rot * 0.04} ${cx} ${cy})`}
          />
        ))}
        {lands.map((L, i) => {
          const lx = w * L.px;
          const ly = h * L.py;
          return (
            <ellipse
              key={`land${i}`}
              cx={lx}
              cy={ly}
              rx={w * L.sx}
              ry={h * L.sy}
              fill="rgba(34, 197, 94, 0.07)"
              stroke="rgba(147, 197, 253, 0.18)"
              strokeWidth={0.8}
              transform={`rotate(${L.ang + rot * 0.02} ${lx} ${ly})`}
            />
          );
        })}
      </g>
      {pins.map((p, i) => {
        const px = w * p.x + Math.sin(phase * 0.07 + i * 1.3) * 6;
        const py = h * p.y + Math.cos(phase * 0.06 + i) * 4;
        const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(phase * 0.2 + i * 1.8));
        return (
          <g key={`pin${i}`} transform={`translate(${px},${py})`} opacity={pulse}>
            <path
              d="M 0 -2 C -6 -2 -8 4 -8 8 C -8 14 0 22 0 22 C 0 22 8 14 8 8 C 8 4 6 -2 0 -2 Z"
              fill="rgba(251, 113, 133, 0.2)"
              stroke="rgba(251, 113, 133, 0.45)"
              strokeWidth={0.9}
            />
            <circle cx={0} cy={6} r={2.2} fill="rgba(248, 250, 252, 0.5)" />
          </g>
        );
      })}
      {labels.map((lb, i) => {
        const ox = Math.sin(phase * 0.045 + i * 0.9) * w * 0.012;
        const oy = Math.cos(phase * 0.04 + i) * h * 0.01;
        const op = 0.12 + 0.14 * (0.5 + 0.5 * Math.sin(phase * 0.1 + i * 1.4));
        return (
          <text
            key={lb.text}
            x={w * lb.x + ox}
            y={h * lb.y + oy}
            fill="rgba(203, 213, 225, 0.55)"
            fontSize={10 + (i % 2)}
            fontWeight={600}
            fontFamily="system-ui, sans-serif"
            textAnchor="middle"
            opacity={op}
          >
            {lb.text}
          </text>
        );
      })}
    </svg>
  );
}

function PulseLayer({ w, h, phase }: { w: number; h: number; phase: number }) {
  const mid = h * 0.5;
  const amp = h * 0.04;
  const pts: string[] = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const y =
      mid +
      Math.sin(phase * 0.5 + i * 0.45) * amp * (1 + 0.4 * Math.sin(i * 0.2));
    pts.push(`${x},${y}`);
  }
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={blueStrong}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1={0}
        x2={w}
        y1={mid}
        y2={mid}
        stroke={blue}
        strokeWidth={0.5}
        opacity={0.35}
      />
    </svg>
  );
}

function GridLayer({ w, h, phase }: { w: number; h: number; phase: number }) {
  const off = (phase * 1.2) % 40;
  const lines: ReactNode[] = [];
  for (let x = -off; x < w + 80; x += 44) {
    lines.push(
      <line
        key={`v${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={h}
        stroke={blue}
        strokeWidth={0.8}
      />,
    );
  }
  for (let y = 0; y < h; y += 36) {
    lines.push(
      <line
        key={`h${y}`}
        x1={0}
        y1={y}
        x2={w}
        y2={y}
        stroke={white}
        strokeWidth={0.5}
      />,
    );
  }
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      {lines}
    </svg>
  );
}

/** Banconote / € che cadono (cedole, dividendi). */
function MoneyRainLayer({
  w,
  h,
  phase,
}: {
  w: number;
  h: number;
  phase: number;
}) {
  const n = 28;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      {Array.from({ length: n }, (_, i) => {
        const x = ((i * 137 + (i * i) % 53) % 1000) / 1000;
        const px = x * (w + 60) - 30;
        const speed = 4.2 + (i % 8) * 0.5;
        const cycle = h + 200;
        const py = (phase * speed + i * 41) % cycle - 100;
        const rot = (i % 2 === 0 ? 1 : -1) * (18 + (phase * 0.15 + i * 7) % 25);
        const nw = 24 + (i % 4) * 5;
        const nh = 36 + (i % 3) * 5;
        return (
          <g
            key={i}
            transform={`translate(${px},${py}) rotate(${rot})`}
            opacity={0.75}
          >
            <rect
              x={-nw / 2}
              y={-nh / 2}
              width={nw}
              height={nh}
              rx={4}
              fill="rgba(34, 197, 94, 0.12)"
              stroke="rgba(248, 250, 252, 0.2)"
              strokeWidth={1}
            />
            <line
              x1={-nw / 2 + 4}
              y1={-nh / 2 + 8}
              x2={nw / 2 - 4}
              y2={-nh / 2 + 8}
              stroke="rgba(248, 250, 252, 0.12)"
              strokeWidth={0.8}
            />
            <text
              x={0}
              y={4}
              textAnchor="middle"
              fill="rgba(248, 250, 252, 0.48)"
              fontSize={14}
              fontWeight={800}
              fontFamily="system-ui, sans-serif"
            >
              €
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Cascata di parole in sottofondo (leggi gli articoli). */
function TextWaterfallLayer({
  w,
  h,
  phase,
}: {
  w: number;
  h: number;
  phase: number;
}) {
  const n = 22;
  const cycle = h + 280;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="textFallFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(2, 6, 14, 0.95)" />
          <stop offset="18%" stopColor="rgba(2, 6, 14, 0)" />
          <stop offset="82%" stopColor="rgba(2, 6, 14, 0)" />
          <stop offset="100%" stopColor="rgba(2, 6, 14, 0.9)" />
        </linearGradient>
      </defs>
      {Array.from({ length: n }, (_, i) => {
        const xFrac = ((i * 173 + (i * i) % 61) % 1000) / 1000;
        const px = 8 + xFrac * (w - 16);
        const speed = 3.2 + (i % 7) * 0.55;
        const py = (phase * speed + i * 53) % cycle - 80;
        const word = ARTICLE_WATERFALL_WORDS[i % ARTICLE_WATERFALL_WORDS.length];
        const fs = 11 + (i % 4);
        const opacity = 0.14 + (i % 5) * 0.045;
        const fill = i % 3 === 0 ? "rgba(147, 197, 253, 0.55)" : "rgba(203, 213, 225, 0.45)";
        return (
          <text
            key={i}
            x={px}
            y={py}
            fill={fill}
            fontSize={fs}
            fontWeight={600}
            fontFamily="system-ui, sans-serif"
            opacity={opacity}
            style={{ userSelect: "none" }}
          >
            {word}
          </text>
        );
      })}
      <rect width={w} height={h} fill="url(#textFallFade)" style={{ pointerEvents: "none" }} />
    </svg>
  );
}

function CoinsLayer({ w, h, phase }: { w: number; h: number; phase: number }) {
  const dots = [0.15, 0.35, 0.55, 0.72, 0.88].map((px, i) => {
    const x = w * px + Math.sin(phase * 0.11 + i) * 24;
    const y =
      h * (0.35 + (i % 3) * 0.12) +
      (phase * 0.6 + i * 40) % (h * 0.35);
    const r = 5 + (i % 2) * 3;
    return (
      <circle
        key={i}
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke={i % 2 === 0 ? coral : blueStrong}
        strokeWidth={1.2}
        opacity={0.85}
      />
    );
  });
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      {dots}
    </svg>
  );
}

/** Sagome + bolle dialogo in sottofondo (forum / Interagisci nel forum). */
function PeopleTalkingLayer({
  w,
  h,
  phase,
}: {
  w: number;
  h: number;
  phase: number;
}) {
  const m = Math.min(w, h);
  const folks = [
    { x: 0.1, y: 0.4, dir: 1 as const },
    { x: 0.26, y: 0.48, dir: -1 as const },
    { x: 0.46, y: 0.38, dir: 1 as const },
    { x: 0.64, y: 0.5, dir: -1 as const },
    { x: 0.82, y: 0.42, dir: 1 as const },
  ];
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      {folks.slice(0, -1).map((a, i) => {
        const b = folks[i + 1];
        const x1 = w * a.x;
        const y1 = h * a.y - m * 0.06;
        const x2 = w * b.x;
        const y2 = h * b.y - m * 0.06;
        const mx = (x1 + x2) / 2 + Math.sin(phase * 0.06 + i) * m * 0.04;
        const my = (y1 + y2) / 2 - m * 0.08;
        const dash = 5 + (i % 2);
        const off = -(phase * (1.4 + i * 0.2)) % 24;
        return (
          <path
            key={`link${i}`}
            d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
            fill="none"
            stroke="rgba(147, 197, 253, 0.22)"
            strokeWidth={1.1}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${dash + 4}`}
            strokeDashoffset={off}
          />
        );
      })}
      {folks.map((p, i) => {
        const cx = w * p.x;
        const cy = h * p.y + Math.sin(phase * 0.08 + i * 1.4) * m * 0.012;
        const bob = Math.sin(phase * 0.09 + i * 1.1) * 2.5;
        const rHead = m * 0.028;
        const talk = 0.32 + 0.28 * Math.sin(phase * 0.14 + i * 1.7);
        const bw = m * 0.14;
        const bh = m * 0.09;
        const bx = cx + p.dir * (rHead + m * 0.02) + (p.dir < 0 ? -bw : 0);
        const by = cy - bh - rHead * 0.2 + bob;
        const fillBub = i % 2 === 0 ? "rgba(96, 165, 250, 0.1)" : "rgba(251, 113, 133, 0.08)";
        const strokeBub = i % 2 === 0 ? "rgba(147, 197, 253, 0.35)" : "rgba(251, 113, 133, 0.3)";
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy + bob}
              r={rHead}
              fill="rgba(148, 163, 184, 0.14)"
              stroke="rgba(203, 213, 225, 0.35)"
              strokeWidth={1}
            />
            <path
              d={`M ${cx - rHead * 0.85} ${cy + bob + rHead * 0.65} Q ${cx} ${cy + bob + rHead * 1.35} ${cx + rHead * 0.85} ${cy + bob + rHead * 0.65}`}
              fill="none"
              stroke="rgba(203, 213, 225, 0.22)"
              strokeWidth={1}
              strokeLinecap="round"
            />
            <rect
              x={bx}
              y={by}
              width={bw}
              height={bh}
              rx={m * 0.018}
              fill={fillBub}
              stroke={strokeBub}
              strokeWidth={0.9}
              opacity={0.75 + talk * 0.25}
            />
            <path
              d={
                p.dir > 0
                  ? `M ${bx + m * 0.012} ${by + bh} L ${bx + m * 0.028} ${by + bh + m * 0.022} L ${bx + m * 0.04} ${by + bh}`
                  : `M ${bx + bw - m * 0.04} ${by + bh} L ${bx + bw - m * 0.028} ${by + bh + m * 0.022} L ${bx + bw - m * 0.012} ${by + bh}`
              }
              fill={fillBub}
              stroke={strokeBub}
              strokeWidth={0.7}
              opacity={0.75 + talk * 0.25}
            />
            {[0, 1, 2].map((j) => {
              const lw = bw * (0.72 - j * 0.12);
              const lx = bx + (bw - lw) / 2;
              const ly = by + bh * (0.32 + j * 0.22);
              const lo = 0.15 + 0.55 * (0.5 + 0.5 * Math.sin(phase * 0.18 + i * 2.1 + j * 1.4)) ** 2;
              return (
                <line
                  key={j}
                  x1={lx}
                  y1={ly}
                  x2={lx + lw}
                  y2={ly}
                  stroke="rgba(248, 250, 252, 0.35)"
                  strokeWidth={0.85}
                  strokeLinecap="round"
                  opacity={lo}
                />
              );
            })}
            <g
              transform={`translate(${cx + p.dir * (rHead + m * 0.034)}, ${cy + bob - m * 0.01})`}
              opacity={0.35 + talk * 0.45}
            >
              {[0, 1, 2].map((d) => (
                <circle
                  key={d}
                  cx={d * (m * 0.014)}
                  cy={0}
                  r={m * 0.0065}
                  fill="rgba(147, 197, 253, 0.65)"
                  style={{
                    opacity: 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(phase * 0.25 + i * 2 + d * 0.9)) ** 2,
                  }}
                />
              ))}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

function SocialLayer({ w, h, phase }: { w: number; h: number; phase: number }) {
  const bubbles = [
    { x: 0.22, y: 0.38, r: 0.09 },
    { x: 0.58, y: 0.32, r: 0.07 },
    { x: 0.78, y: 0.48, r: 0.055 },
    { x: 0.42, y: 0.58, r: 0.065 },
  ];
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      {bubbles.map((b, i) => {
        const dx = Math.sin(phase * 0.09 + i * 1.2) * w * 0.02;
        const dy = Math.cos(phase * 0.07 + i) * h * 0.015;
        return (
          <circle
            key={i}
            cx={w * b.x + dx}
            cy={h * b.y + dy}
            r={Math.min(w, h) * b.r}
            fill="none"
            stroke={blueStrong}
            strokeWidth={1.2}
            opacity={0.75}
          />
        );
      })}
    </svg>
  );
}

function HeartLayer({ w, h, phase }: { w: number; h: number; phase: number }) {
  const s = interpolate(Math.sin(phase * 0.12), [-1, 1], [0.96, 1.04]);
  const cx = w * 0.5;
  const cy = h * 0.48;
  const sc = Math.min(w, h) * 0.22 * s;
  const d = `M ${cx} ${cy + sc * 0.35} C ${cx - sc} ${cy - sc * 0.2} ${cx - sc * 1.1} ${cy - sc * 0.9} ${cx} ${cy - sc * 0.45} C ${cx + sc * 1.1} ${cy - sc * 0.9} ${cx + sc} ${cy - sc * 0.2} ${cx} ${cy + sc * 0.35} Z`;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <path d={d} fill={coral} opacity={0.22} />
    </svg>
  );
}

function HookLayer({ w, h, phase }: { w: number; h: number; phase: number }) {
  const shift = (phase * 1.8) % 120;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={-80 + shift + i * 70}
          y1={h + 40}
          x2={w * 0.4 + shift + i * 90}
          y2={-40}
          stroke={white}
          strokeWidth={1}
          opacity={0.35}
        />
      ))}
    </svg>
  );
}

function CtaLayer({ w, h, phase }: { w: number; h: number; phase: number }) {
  const cx = w * (0.42 + Math.sin(phase * 0.04) * 0.06);
  const cy = h * (0.45 + Math.cos(phase * 0.035) * 0.05);
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <defs>
        <radialGradient id="ctaGlow">
          <stop offset="0%" stopColor="rgba(251, 113, 133, 0.2)" />
          <stop offset="45%" stopColor="rgba(59, 130, 246, 0.12)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={w * 0.45} ry={h * 0.5} fill="url(#ctaGlow)" />
    </svg>
  );
}

function NeutralLayer({ w, h, phase }: { w: number; h: number; phase: number }) {
  const x = w * 0.5 + Math.sin(phase * 0.05) * w * 0.08;
  const y = h * 0.5 + Math.cos(phase * 0.04) * h * 0.06;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <circle cx={x} cy={y} r={Math.min(w, h) * 0.55} fill={blue} opacity={0.45} />
      <circle
        cx={w * 0.72 + Math.sin(phase * 0.06) * 30}
        cy={h * 0.38}
        r={Math.min(w, h) * 0.22}
        fill={white}
        opacity={0.35}
      />
    </svg>
  );
}

export function LangEaseAmbientBg() {
  const f = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  const ctx = getHeroActiveContext(f);
  const mode = ambientMode(ctx.decor, ctx.text);
  const phase = f * 0.9 + ctx.beatIndex * 12.7;

  const cross = interpolate(ctx.localFrame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const layer = (() => {
    switch (mode) {
      case "bars":
        return <BarsLayer w={w} h={h} phase={phase} />;
      case "globe":
        return <GlobeLayer w={w} h={h} phase={phase} />;
      case "geography":
        return <GeographyLayer w={w} h={h} phase={phase} />;
      case "pulse":
        return <PulseLayer w={w} h={h} phase={phase} />;
      case "grid":
        return <GridLayer w={w} h={h} phase={phase} />;
      case "coins":
        return <CoinsLayer w={w} h={h} phase={phase} />;
      case "moneyRain":
        return <MoneyRainLayer w={w} h={h} phase={phase} />;
      case "textWaterfall":
        return <TextWaterfallLayer w={w} h={h} phase={phase} />;
      case "peopleTalking":
        return <PeopleTalkingLayer w={w} h={h} phase={phase} />;
      case "social":
        return <SocialLayer w={w} h={h} phase={phase} />;
      case "heart":
        return <HeartLayer w={w} h={h} phase={phase} />;
      case "hook":
        return <HookLayer w={w} h={h} phase={phase} />;
      case "cta":
        return <CtaLayer w={w} h={h} phase={phase} />;
      default:
        return <NeutralLayer w={w} h={h} phase={phase} />;
    }
  })();

  return (
    <AbsoluteFill
      style={{
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.55 + cross * 0.45,
      }}
    >
      {layer}
    </AbsoluteFill>
  );
}
