import { TUTORIAL_SOURCE_DURATION_SEC } from "./scene-tracks";

export type TutorialCaptionAlign = "left" | "right";

export type TutorialCaption = {
  fromSec: number;
  toSec: number;
  text: string;
  align: TutorialCaptionAlign;
};

/** Durata media di ogni battuta (secondi). ~1–2s come da brief. */
const BEAT_SEC = 1.48;

const UI_BEATS: string[] = [
  "Dark mode",
  "Alpha AI migliorata",
  "Database in espansione",
  "Performance",
  "Allocazione geografica",
  "Simulazione Monte Carlo",
  "Allocazione",
  "Dani Score",
  "Traccia il tuo portafoglio in live",
  "Simula il tuo FIRE",
  "Guida gratuita e blog post",
  "Forum di discussione",
];

function buildCaptions(): TutorialCaption[] {
  const out: TutorialCaption[] = [];
  let t = 0;
  for (let i = 0; i < UI_BEATS.length; i++) {
    const end = Math.min(t + BEAT_SEC, TUTORIAL_SOURCE_DURATION_SEC);
    if (end - t < 0.08) {
      break;
    }
    out.push({
      fromSec: t,
      toSec: end,
      text: UI_BEATS[i],
      align: i % 2 === 0 ? "left" : "right",
    });
    t = end;
    if (t >= TUTORIAL_SOURCE_DURATION_SEC - 0.01) {
      break;
    }
  }
  return out;
}

export const TUTORIAL_CAPTIONS: TutorialCaption[] = buildCaptions();
