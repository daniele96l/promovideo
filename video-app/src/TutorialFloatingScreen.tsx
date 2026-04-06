import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TUTORIAL_CAPTIONS } from "./tutorial-captions";

const quint = Easing.out(Easing.poly(5));
const TUTORIAL_ASPECT = 1866 / 972;

function getScreenTilt(
  f: number,
  durationInFrames: number,
): { tiltY: number; tiltX: number } {
  const tiltY = interpolate(
    f,
    [
      0,
      durationInFrames * 0.22,
      durationInFrames * 0.42,
      durationInFrames * 0.62,
      durationInFrames * 0.82,
      Math.max(1, durationInFrames - 1),
    ],
    [14, -18, 16, -14, 12, -8],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.poly(5)),
    },
  );
  const tiltX = interpolate(
    f,
    [0, durationInFrames * 0.35, Math.max(1, durationInFrames - 1)],
    [5, 11, 7],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.poly(5)),
    },
  );
  return { tiltY, tiltX };
}

function TutorialCaptionLayer({
  f,
  fps,
  durationInFrames,
  frameW,
  width,
  height,
  tiltY,
}: {
  f: number;
  fps: number;
  durationInFrames: number;
  frameW: number;
  width: number;
  height: number;
  tiltY: number;
}) {
  const gutter = Math.max(12, (width - frameW) / 2 - 20);
  const railPad = 14;
  const railInnerW = Math.max(140, gutter - railPad);
  const entryMag = Math.min(100, Math.max(48, railInnerW * 0.45));
  const fontSize = Math.max(22, Math.min(34, width * 0.026));

  return (
    <>
      {TUTORIAL_CAPTIONS.map((c, i) => {
        const fromF = Math.round(c.fromSec * fps);
        const toF = Math.min(Math.round(c.toSec * fps), durationInFrames);
        if (f < fromF || f >= toF) {
          return null;
        }
        const clipLen = Math.max(1, toF - fromF);
        const fadeFrames = Math.max(5, Math.min(11, Math.floor(clipLen * 0.22)));
        const slideFrames = Math.max(6, Math.min(14, Math.floor(clipLen * 0.28)));

        const fadeIn = interpolate(f, [fromF, fromF + fadeFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: quint,
        });
        const fadeOut = interpolate(f, [toF - fadeFrames, toF - 1], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.poly(5)),
        });
        const opacity = Math.min(fadeIn, fadeOut);

        const leftSlideStart = tiltY >= 0 ? -entryMag : entryMag;
        const rightSlideStart = tiltY >= 0 ? entryMag : -entryMag;

        const slideLeft = interpolate(f, [fromF, fromF + slideFrames], [leftSlideStart, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: quint,
        });
        const slideRight = interpolate(f, [fromF, fromF + slideFrames], [rightSlideStart, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: quint,
        });

        const topPct = 10 + (i % 7) * 11;
        const maxH = Math.min(height * 0.22, 200);

        const base: CSSProperties = {
          position: "absolute",
          top: `${topPct}%`,
          pointerEvents: "none",
          opacity,
          zIndex: 12,
          width: railInnerW,
          maxHeight: maxH,
          overflow: "hidden",
          fontFamily:
            'system-ui, "SF Pro Display", "Segoe UI", sans-serif',
          fontWeight: 800,
          fontSize,
          lineHeight: 1.22,
          letterSpacing: "-0.025em",
          color: "rgba(248, 250, 252, 0.98)",
          textShadow:
            "0 2px 20px rgba(0,0,0,0.92), 0 0 40px rgba(56, 189, 248, 0.2)",
        };

        if (c.align === "left") {
          return (
            <div
              key={i}
              style={{
                ...base,
                left: railPad,
                textAlign: "left",
                transform: `translateX(${slideLeft}px)`,
              }}
            >
              {c.text}
            </div>
          );
        }
        return (
          <div
            key={i}
            style={{
              ...base,
              right: railPad,
              textAlign: "right",
              transform: `translateX(${slideRight}px)`,
            }}
          >
            {c.text}
          </div>
        );
      })}
    </>
  );
}

export const TutorialFloatingScreen = ({
  sequenceDurationInFrames,
}: {
  sequenceDurationInFrames: number;
}) => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const durationInFrames = sequenceDurationInFrames;
  const { tiltY, tiltX } = getScreenTilt(f, durationInFrames);

  const driftXPx = interpolate(
    f,
    [
      0,
      durationInFrames * 0.18,
      durationInFrames * 0.38,
      durationInFrames * 0.58,
      durationInFrames * 0.78,
      Math.max(1, durationInFrames - 1),
    ],
    [0, width * 0.04, -width * 0.05, width * 0.035, -width * 0.03, width * 0.015],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.poly(5)),
    },
  );

  const driftYPx = interpolate(
    f,
    [0, durationInFrames * 0.3, durationInFrames * 0.62, Math.max(1, durationInFrames - 1)],
    [0, height * 0.028, -height * 0.026, height * 0.01],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.poly(5)),
    },
  );

  const floatScale = interpolate(
    f,
    [0, 26, durationInFrames * 0.5, Math.max(1, durationInFrames - 1)],
    [0.93, 1, 1.012, 1.004],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.poly(5)),
    },
  );

  const maxFrameW = Math.min(width * 0.54, 760);
  const maxFrameH = Math.min(height * 0.62, 480);
  const frameByWidthH = maxFrameW / TUTORIAL_ASPECT;
  const frameW =
    frameByWidthH <= maxFrameH ? maxFrameW : maxFrameH * TUTORIAL_ASPECT;
  const frameH =
    frameByWidthH <= maxFrameH ? frameByWidthH : maxFrameH;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 88% 70% at 48% 22%, rgba(59, 130, 246, 0.12) 0%, transparent 55%), radial-gradient(ellipse 90% 65% at 72% 88%, rgba(34, 211, 238, 0.08) 0%, transparent 50%)",
          opacity: 0.95,
          zIndex: 0,
        }}
      />

      <AbsoluteFill style={{ zIndex: 12, pointerEvents: "none" }}>
        <TutorialCaptionLayer
          f={f}
          fps={fps}
          durationInFrames={durationInFrames}
          frameW={frameW}
          width={width}
          height={height}
          tiltY={tiltY}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          perspective: 1900,
          perspectiveOrigin: "50% 45%",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 0,
            height: 0,
            transform: `translate(${driftXPx}px, ${driftYPx}px)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -frameW / 2,
              top: -frameH / 2,
              width: frameW,
              height: frameH,
              transform: `
                translateZ(95px)
                rotateX(${tiltX}deg)
                rotateY(${tiltY}deg)
                scale(${floatScale})
              `,
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
              borderRadius: 16,
              boxShadow:
                "0 52px 104px rgba(0,0,0,0.58), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.12)",
              overflow: "hidden",
              background: "rgba(6, 10, 20, 0.72)",
              backfaceVisibility: "hidden",
            }}
          >
            <OffthreadVideo
              src={staticFile("tutorial.mov")}
              muted
              playbackRate={3}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
                backgroundColor: "#000",
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
