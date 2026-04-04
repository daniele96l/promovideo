import "./index.css";
import { Composition } from "remotion";
import {
  DEFAULT_COMPOSITION_FRAMES,
  LangEaseComposition,
} from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LangEasePromo"
        component={LangEaseComposition}
        durationInFrames={DEFAULT_COMPOSITION_FRAMES}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
