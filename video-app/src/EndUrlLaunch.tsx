import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getEndCardDurationFrames } from "./scene-tracks";

/** Typed in the bar; opens as HTTPS (browser-style). */
const URL_TEXT = "backtes.to";
const SITE_OPEN = "https://backtes.to";

export const EndUrlLaunch = () => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const dur = getEndCardDurationFrames(fps);
  const scale = dur / 150;

  const fadeLen = Math.max(10, Math.round(14 * scale));
  const fpc = Math.max(3, Math.round(4 * scale));
  const typeLen = URL_TEXT.length * fpc;
  const pauseLen = Math.max(8, Math.round(12 * scale));
  const sendAnim = Math.max(10, Math.round(14 * scale));

  const fadeEnd = fadeLen;
  const typeEnd = fadeEnd + typeLen;
  const pauseEnd = typeEnd + pauseLen;
  const clickAt = pauseEnd + Math.round(6 * scale);
  const launchStart = clickAt + sendAnim;

  const chars = Math.min(
    URL_TEXT.length,
    Math.max(0, Math.floor((f - fadeEnd) / fpc)),
  );
  const typed = URL_TEXT.slice(0, chars);
  const typingDone = f >= typeEnd;

  const shellIn = interpolate(f, [0, fadeLen], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const sendPulse = interpolate(
    f,
    [pauseEnd, clickAt],
    [1, 0.92],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

  const sendPress = interpolate(
    f,
    [clickAt, clickAt + 4],
    [1, 0.94],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const launchT = Math.max(0, f - launchStart);
  const launchMax = Math.max(1, dur - launchStart);
  const pageScale = interpolate(
    launchT,
    [0, 18, launchMax],
    [0.94, 1, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.poly(4)),
    },
  );
  const pageFade = interpolate(launchT, [0, 10, 22], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const checkPop = interpolate(launchT, [8, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.2)),
  });

  const barW = Math.min(width * 0.82, 720);
  const showCaret = !typingDone && f >= fadeEnd && Math.floor(f / 10) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 14, 0.98) 100%)",
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity: shellIn,
          transform: `scale(${0.96 + shellIn * 0.04})`,
          width: barW,
          maxWidth: "92%",
        }}
      >
        <div
          style={{
            fontFamily: 'system-ui, "SF Pro Text", sans-serif',
            fontSize: Math.min(13, width * 0.018),
            color: "rgba(148, 163, 184, 0.95)",
            marginBottom: 10,
            letterSpacing: "0.02em",
          }}
        >
          Open in browser
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 10,
            borderRadius: 14,
            padding: 10,
            background: "rgba(15, 23, 42, 0.92)",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(148, 163, 184, 0.15)",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(2, 6, 14, 0.85)",
              border: "1px solid rgba(51, 65, 85, 0.6)",
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
              fontSize: Math.min(22, width * 0.032),
              color: "rgba(226, 232, 240, 0.98)",
              letterSpacing: "0.02em",
            }}
          >
            {typed}
            {showCaret ? (
              <span style={{ opacity: 0.85, marginLeft: 1 }}>|</span>
            ) : null}
          </div>
          <button
            type="button"
            style={{
              alignSelf: "center",
              padding: "12px 22px",
              borderRadius: 10,
              border: "none",
              cursor: "default",
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 700,
              fontSize: Math.min(16, width * 0.024),
              background:
                f >= clickAt
                  ? "linear-gradient(180deg, #22c55e 0%, #16a34a 100%)"
                  : "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)",
              color: "#fff",
              transform: `scale(${
                f >= launchStart ? 1 : f >= clickAt ? sendPress : sendPulse
              })`,
              boxShadow: "0 4px 16px rgba(37, 99, 235, 0.35)",
            }}
          >
            Send
          </button>
        </div>

        {f >= launchStart ? (
          <div
            style={{
              marginTop: height * 0.06,
              opacity: pageFade,
              transform: `scale(${pageScale})`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 24px",
                borderRadius: 16,
                background: "rgba(15, 23, 42, 0.75)",
                border: "1px solid rgba(34, 197, 94, 0.35)",
                boxShadow: "0 16px 48px rgba(34, 197, 94, 0.12)",
              }}
            >
              <span
                style={{
                  transform: `scale(${checkPop})`,
                  display: "inline-flex",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(34, 197, 94, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4ade80",
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                ✓
              </span>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontWeight: 700,
                    fontSize: Math.min(17, width * 0.026),
                    color: "rgba(226, 232, 240, 0.98)",
                  }}
                >
                  Opening site
                </div>
                <div
                  style={{
                    fontFamily: 'ui-monospace, Menlo, monospace',
                    fontSize: Math.min(15, width * 0.022),
                    color: "rgba(94, 234, 212, 0.95)",
                    marginTop: 4,
                  }}
                >
                  {SITE_OPEN}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
