import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export const EndcardBacktesto = () => {
  const f = useCurrentFrame();
  const enter = 18;
  const t = interpolate(f, [0, enter - 0.001], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(t, [0, 1], [0.94, 1]);
  const titleOp = interpolate(f, [8, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 100% 80% at 50% 30%, rgba(59, 130, 246, 0.25) 0%, #030711 55%, #020408 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
          maxWidth: "88%",
        }}
      >
        <div
          style={{
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
            marginBottom: 28,
            maxWidth: 520,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Img
            src={staticFile("Backtesto2.jpg")}
            style={{ width: "100%", display: "block" }}
          />
        </div>
        <div
          style={{
            fontFamily: '"Montserrat", system-ui, sans-serif',
            fontWeight: 900,
            fontSize: 56,
            letterSpacing: "-0.04em",
            color: "#f8fafc",
            textShadow:
              "0 0 48px rgba(147,197,253,0.45), 0 10px 40px rgba(0,0,0,0.75)",
            opacity: titleOp,
          }}
        >
          Backtesto 2
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: '"Montserrat", system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 22,
            color: "rgba(226,232,240,0.85)",
            opacity: titleOp,
          }}
        >
          Tutto in un unico posto
        </div>
      </div>
    </AbsoluteFill>
  );
};
