/**
 * LangEase promo timing. Audio: public/langease.mp3 (~33.072s).
 * Hero frame count deriva da `LangEaseHero` (battute); end card riempie fino alla fine dell’audio.
 */

import { LANG_EASE_HERO_TOTAL_FRAMES } from "./LangEaseHero";

/** Measured duration of `public/langease.mp3` (seconds). */
export const LANG_EASE_AUDIO_DURATION_SEC = 33.072;

export function secToFrames(sec: number, fps: number): number {
  return Math.round(sec * fps);
}

export function getLangEaseCompositionFrames(fps: number): number {
  return secToFrames(LANG_EASE_AUDIO_DURATION_SEC, fps);
}

/** Hero typography duration (frames). @30fps = somma battute in `LangEaseHero`. */
export function getLangEaseHeroFrames(fps: number): number {
  if (fps === 30) {
    return LANG_EASE_HERO_TOTAL_FRAMES;
  }
  return Math.round((LANG_EASE_HERO_TOTAL_FRAMES / 30) * fps);
}

export function getLangEaseEndcardFrom(fps: number): number {
  return getLangEaseHeroFrames(fps);
}

/** End card length @30fps (composizione − hero). */
export const LANG_EASE_ENDCARD_FRAMES =
  getLangEaseCompositionFrames(30) - LANG_EASE_HERO_TOTAL_FRAMES;
