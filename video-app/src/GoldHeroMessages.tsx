import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BacktestoSparkReveal } from "./BacktestoSparkReveal";

/** Hero `<Sequence>` is Backtesto-only (no word beats); `f` is hero-local from 0. */
export const GoldHeroMessages = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        zIndex: 40,
        pointerEvents: "none",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AbsoluteFill style={{ zIndex: 1 }}>
        <BacktestoSparkReveal f={f} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
