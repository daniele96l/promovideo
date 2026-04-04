import type { CSSProperties } from "react";
import { Easing, interpolate } from "remotion";

export type PromoDecorKind =
  | "chart"
  | "globe"
  | "forum"
  | "like"
  | "portfolio"
  | "pulse"
  | "article"
  | "coins"
  | null;

type Props = {
  kind: PromoDecorKind;
  /** Frame locale alla battuta (0 = inizio entrata). */
  f: number;
  enterLen: number;
  holdLen: number;
  exitLen: number;
  accent: string;
  /** Lato icona in px. */
  dim: number;
  /** Da `getDecorPosition`; `null` = non renderizzare. */
  position: { top: string; left: string } | null;
};

function decorOpacity(
  f: number,
  enterLen: number,
  holdLen: number,
  exitLen: number,
): number {
  const holdStart = enterLen;
  const exitStart = enterLen + holdLen;
  const total = enterLen + holdLen + exitLen;
  if (f < 0 || f >= total) {
    return 0;
  }
  if (f < holdStart) {
    return interpolate(f, [0, holdStart - 0.001], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  }
  if (f < exitStart) {
    return 1;
  }
  return interpolate(f, [exitStart, total - 0.001], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
}

export function PromoDecor({
  kind,
  f,
  enterLen,
  holdLen,
  exitLen,
  accent,
  dim,
  position,
}: Props) {
  if (!kind || !position) {
    return null;
  }
  const o = decorOpacity(f, enterLen, holdLen, exitLen);
  if (o < 0.01) {
    return null;
  }
  const s = interpolate(o, [0, 1], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const icon = (() => {
    switch (kind) {
      case "chart":
        return (
          <svg width={dim} height={dim} viewBox="0 0 120 120" aria-hidden>
            <rect
              x="8"
              y="8"
              width="104"
              height="104"
              rx="12"
              fill="none"
              stroke={accent}
              strokeWidth="4"
              opacity="0.35"
            />
            <path
              d="M20 88 L40 52 L58 68 L78 32 L100 48"
              fill="none"
              stroke={accent}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="40" cy="52" r="5" fill={accent} />
            <circle cx="78" cy="32" r="5" fill={accent} />
          </svg>
        );
      case "globe":
        return (
          <svg width={dim} height={dim} viewBox="0 0 120 120" aria-hidden>
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke={accent}
              strokeWidth="4"
              opacity="0.9"
            />
            <ellipse
              cx="60"
              cy="60"
              rx="48"
              ry="20"
              fill="none"
              stroke={accent}
              strokeWidth="3"
              opacity="0.55"
            />
            <path
              d="M12 60h96M60 12c12 22 12 74 0 96M60 12c-12 22-12 74 0 96"
              fill="none"
              stroke={accent}
              strokeWidth="3"
              opacity="0.45"
            />
          </svg>
        );
      case "forum":
        return (
          <svg width={dim} height={dim} viewBox="0 0 120 120" aria-hidden>
            <rect
              x="10"
              y="22"
              width="100"
              height="68"
              rx="14"
              fill="none"
              stroke={accent}
              strokeWidth="4"
            />
            <path
              d="M28 44h64M28 62h44"
              stroke={accent}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M38 98 L48 84h24l10 14"
              fill="none"
              stroke={accent}
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "like":
        return (
          <svg width={dim} height={dim} viewBox="0 0 120 120" aria-hidden>
            <path
              d="M60 98 C28 72 12 52 12 36c0-14 10-24 24-24 12 0 20 8 24 18 4-10 12-18 24-18 14 0 24 10 24 24 0 16-16 36-48 62z"
              fill="none"
              stroke={accent}
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "portfolio":
        return (
          <svg width={dim} height={dim} viewBox="0 0 120 120" aria-hidden>
            <rect
              x="14"
              y="18"
              width="92"
              height="84"
              rx="10"
              fill="none"
              stroke={accent}
              strokeWidth="4"
            />
            <path
              d="M26 38h68M26 58h44M26 78h56"
              stroke={accent}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        );
      case "pulse":
        return (
          <svg width={dim} height={dim} viewBox="0 0 120 120" aria-hidden>
            <path
              d="M12 64h20l16-40 20 80 16-48 16 32h20"
              fill="none"
              stroke={accent}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "article":
        return (
          <svg width={dim} height={dim} viewBox="0 0 120 120" aria-hidden>
            <rect
              x="22"
              y="14"
              width="76"
              height="92"
              rx="8"
              fill="none"
              stroke={accent}
              strokeWidth="4"
            />
            <path
              d="M34 34h52M34 50h52M34 66h36"
              stroke={accent}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        );
      case "coins":
        return (
          <svg width={dim} height={dim} viewBox="0 0 120 120" aria-hidden>
            <circle
              cx="44"
              cy="64"
              r="26"
              fill="none"
              stroke={accent}
              strokeWidth="4"
            />
            <circle
              cx="76"
              cy="56"
              r="26"
              fill="none"
              stroke={accent}
              strokeWidth="4"
              opacity="0.85"
            />
            <text
              x="44"
              y="70"
              textAnchor="middle"
              fill={accent}
              fontSize="22"
              fontWeight="800"
            >
              €
            </text>
          </svg>
        );
      default:
        return null;
    }
  })();

  const wrap: CSSProperties = {
    position: "absolute",
    left: position.left,
    top: position.top,
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    zIndex: 5,
  };

  return (
    <div style={{ ...wrap, opacity: o, transform: `${wrap.transform} scale(${s})` }}>
      {icon}
    </div>
  );
}
