import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { LangEaseAmbientBg } from "./LangEaseAmbientBg";
import { EndcardBacktesto } from "./EndcardBacktesto";
import { LangEaseHero } from "./LangEaseHero";
import {
  getLangEaseCompositionFrames,
  getLangEaseEndcardFrom,
  getLangEaseHeroFrames,
} from "./scene-tracks";

export const LangEaseComposition = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const heroFrames = getLangEaseHeroFrames(fps);
  const endFrom = getLangEaseEndcardFrom(fps);
  const endDuration = durationInFrames - endFrom;

  return (
    <AbsoluteFill style={{ backgroundColor: "#030711", overflow: "hidden" }}>
      <Sequence durationInFrames={durationInFrames} name="Background">
        <AbsoluteFill>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, #02050c 0%, #0a1628 42%, #061018 78%, #020408 100%)",
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse 90% 70% at 50% 18%, rgba(59, 130, 246, 0.38) 0%, transparent 55%)",
              filter: "blur(24px)",
              opacity: 0.92,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse 95% 60% at 72% 92%, rgba(34, 211, 238, 0.22) 0%, transparent 52%), radial-gradient(ellipse 70% 50% at 12% 65%, rgba(37, 99, 235, 0.14) 0%, transparent 50%)",
              filter: "blur(32px)",
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse 85% 80% at 50% 48%, transparent 30%, rgba(1, 4, 12, 0.78) 100%)",
              pointerEvents: "none",
            }}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence durationInFrames={heroFrames} name="Hero · LangEase type">
        <AbsoluteFill>
          <LangEaseAmbientBg />
          <LangEaseHero />
        </AbsoluteFill>
      </Sequence>

      <Sequence
        from={endFrom}
        durationInFrames={endDuration}
        name="End · Backtesto 2"
      >
        <EndcardBacktesto />
      </Sequence>

      <Sequence durationInFrames={durationInFrames} name="Audio">
        <Audio src={staticFile("langease.mp3")} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const DEFAULT_COMPOSITION_FRAMES = getLangEaseCompositionFrames(30);
