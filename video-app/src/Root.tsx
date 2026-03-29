import "./index.css";
import { Composition } from "remotion";
import { DEFAULT_COMPOSITION_FRAMES, MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={DEFAULT_COMPOSITION_FRAMES}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
