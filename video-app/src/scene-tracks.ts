/**
 * Canonical scene timing in seconds (composition time from t=0).
 * Edit here to move beats; Remotion `<Sequence from durationInFrames name>` in
 * `Composition.tsx` must stay in sync (use the `sceneTrack*` helpers below).
 *
 * Studio drag: Remotion does not write edits back into this file — after dragging
 * in the UI, copy the new frame numbers here.
 */

/** Hero / gold copy + dramatic “2” + Backtesto block starts at this second. */
export const HERO_START_SEC = 7;

/**
 * Comment-pill layer ends here (seconds). Slightly past hero start so late pills
 * can finish falling; overlaps hero visually for a short blend.
 */
export const COMMENTS_LAYER_END_SEC = 8.35;

/** Frame count after tutorial before composition end (same at any fps). */
export const TAIL_GAP_FRAMES = 36;

/**
 * Source duration of `public/tutorial.mov` (seconds). Update if you replace the file.
 * Measured from asset metadata (~95.52s).
 */
export const TUTORIAL_SOURCE_DURATION_SEC = 95.51666666666667;

/** Hero-local frame index where Backtesto sequence begins — sync `OFFSET_BACKTESTO_IMAGES` in GoldHeroMessages. */
export const HERO_LOCAL_OFFSET_BACKTESTO = 190;

/**
 * Sum of word beats + dramatic “2” (frames) until Backtesto — must equal
 * OFFSET_BACKTESTO_IMAGES in GoldHeroMessages (`OFFSET_BIG_TWO` + `DRAMATIC_TWO_FRAMES`).
 */
export const HERO_WORDS_UNTIL_BACKTESTO_FRAMES = 190;

/** Composition time of cursor click (last Backtesto1 frame ends ~here). Tuned with hero offset + preBurn. */
export const BACKTESTO_CLICK_SEC = 577 / 30;

export const BACKTESTO_BURN_FRAMES = 78;
export const BACKTESTO_IMG2_HOLD_FRAMES = 0;

// --- frame helpers ---

export function secToFrames(sec: number, fps: number): number {
  return Math.round(sec * fps);
}

export function getHeroStartFrame(fps: number): number {
  return secToFrames(HERO_START_SEC, fps);
}

export function getBacktestoPreBurnFrames(fps: number): number {
  const clickAbs = Math.round(BACKTESTO_CLICK_SEC * fps);
  const seq0 = getHeroStartFrame(fps) + HERO_LOCAL_OFFSET_BACKTESTO;
  return Math.max(8, clickAbs - seq0 + 1);
}

export function getBacktestoImageSequenceFrames(fps: number): number {
  return (
    getBacktestoPreBurnFrames(fps) +
    BACKTESTO_BURN_FRAMES +
    BACKTESTO_IMG2_HOLD_FRAMES
  );
}

export function getHeroSequenceFrames(fps: number): number {
  return HERO_WORDS_UNTIL_BACKTESTO_FRAMES + getBacktestoImageSequenceFrames(fps);
}

/** First frame of tutorial `Sequence` (immediately after hero / Backtesto2 hold). */
export function getTutorialStartFrame(fps: number): number {
  return getHeroStartFrame(fps) + getHeroSequenceFrames(fps);
}

export function getTutorialDurationFrames(fps: number): number {
  return Math.round(TUTORIAL_SOURCE_DURATION_SEC * fps);
}

export function getCompositionDurationFrames(fps: number): number {
  return (
    getTutorialStartFrame(fps) + getTutorialDurationFrames(fps) + TAIL_GAP_FRAMES
  );
}

export function getBacktestoBlockStartAbsFrame(fps: number): number {
  return getHeroStartFrame(fps) + HERO_LOCAL_OFFSET_BACKTESTO;
}

/** First composition frame showing Backtesto2 (instant swap after click). */
export function getBacktestoImageSwapAbsFrame(fps: number): number {
  return getBacktestoBlockStartAbsFrame(fps) + getBacktestoPreBurnFrames(fps);
}

export function getCommentsLayerDurationFrames(fps: number): number {
  return secToFrames(COMMENTS_LAYER_END_SEC, fps);
}

/** Dust / sparkle layer (matches VFX start + cursor-fade window). */
export function getBacktestoDustFxTrack(fps: number): {
  from: number;
  durationInFrames: number;
} {
  return {
    from: getBacktestoImageSwapAbsFrame(fps),
    durationInFrames: BACKTESTO_BURN_FRAMES,
  };
}

/** Human-readable map for AGENTS.md / debugging (seconds + derived @30fps). */
export const SCENE_TRACKS_SEC = [
  { id: "background", name: "Background & ambience", startSec: 0, endSec: "compositionEnd" as const },
  { id: "comments", name: "Comment pills", startSec: 0, endSec: COMMENTS_LAYER_END_SEC },
  { id: "hero", name: "Hero · copy + 2 + Backtesto", startSec: HERO_START_SEC, endSec: "heroEnd" as const },
  { id: "backtestoBlock", name: "Backtesto · block (nested in hero)", startSec: "hero+190f" as const, note: "hero-local offset 190" },
  { id: "backtestoSwap", name: "FX · Backtesto2 swap + dust", startSec: BACKTESTO_CLICK_SEC, note: "~aligns with preBurn end" },
  {
    id: "tutorial",
    name: "Tutorial · floating screen",
    startSec: "afterHero" as const,
    endSec: "beforeTailGap" as const,
    note: "tutorial.mov + captions; see getTutorialStartFrame",
  },
  { id: "audio", name: "Audio", startSec: 0, endSec: "compositionEnd" as const },
] as const;
