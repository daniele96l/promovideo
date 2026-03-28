import { AbsoluteFill, Audio, staticFile } from "remotion";
import { CommentPillsLayer } from "./CommentPills";
import { GoldHeroMessages } from "./GoldHeroMessages";

export const MyComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#030711", overflow: "hidden" }}>
      {/* Base depth: darker sky → lighter mid → deep floor */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #02050c 0%, #0a1628 42%, #061018 78%, #020408 100%)",
        }}
      />
      {/* Soft blue bloom – top-center */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 18%, rgba(59, 130, 246, 0.35) 0%, transparent 55%)",
          filter: "blur(24px)",
          opacity: 0.9,
        }}
      />
      {/* Cyan rim light – bottom / side for depth */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 95% 60% at 72% 92%, rgba(34, 211, 238, 0.2) 0%, transparent 52%), radial-gradient(ellipse 70% 50% at 12% 65%, rgba(37, 99, 235, 0.12) 0%, transparent 50%)",
          filter: "blur(32px)",
        }}
      />
      {/* Vignette – pulls focus inward */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 85% 80% at 50% 48%, transparent 30%, rgba(1, 4, 12, 0.75) 100%)",
          pointerEvents: "none",
        }}
      />
      <CommentPillsLayer />
      <GoldHeroMessages />
      <Audio src={staticFile("audio.mp3")} />
    </AbsoluteFill>
  );
};
