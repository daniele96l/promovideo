import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { CommentPillsLayer } from "./CommentPills";
import { GoldHeroMessages } from "./GoldHeroMessages";
import {
  getBacktestoDustFxTrack,
  getCommentsLayerDurationFrames,
  getCompositionDurationFrames,
  getHeroSequenceFrames,
  getHeroStartFrame,
} from "./scene-tracks";

/** Invisible row so Studio shows FX timing (edit `scene-tracks.ts` to move). */
function TimelineMarker() {
  return <AbsoluteFill style={{ pointerEvents: "none", opacity: 0 }} aria-hidden />;
}

export const MyComposition = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const heroFrom = getHeroStartFrame(fps);
  const heroDuration = getHeroSequenceFrames(fps);
  const commentDuration = getCommentsLayerDurationFrames(fps);
  const dust = getBacktestoDustFxTrack(fps);

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
                "radial-gradient(ellipse 90% 70% at 50% 18%, rgba(59, 130, 246, 0.35) 0%, transparent 55%)",
              filter: "blur(24px)",
              opacity: 0.9,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse 95% 60% at 72% 92%, rgba(34, 211, 238, 0.2) 0%, transparent 52%), radial-gradient(ellipse 70% 50% at 12% 65%, rgba(37, 99, 235, 0.12) 0%, transparent 50%)",
              filter: "blur(32px)",
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse 85% 80% at 50% 48%, transparent 30%, rgba(1, 4, 12, 0.75) 100%)",
              pointerEvents: "none",
            }}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence durationInFrames={commentDuration} name="Comment pills">
        <CommentPillsLayer />
      </Sequence>

      <Sequence from={heroFrom} durationInFrames={heroDuration} name="Hero · copy + 2 + Backtesto">
        <GoldHeroMessages />
      </Sequence>

      <Sequence
        from={dust.from}
        durationInFrames={dust.durationInFrames}
        name="FX · Backtesto dust / sparkle (behind card)"
      >
        <TimelineMarker />
      </Sequence>

      <Sequence durationInFrames={durationInFrames} name="Audio">
        <Audio src={staticFile("audio.mp3")} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Default length for `Root.tsx` when fps is 30. */
export const DEFAULT_COMPOSITION_FRAMES = getCompositionDurationFrames(30);
