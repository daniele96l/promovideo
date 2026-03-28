/** Must match last entry `from` in ITALIAN_FEATURE_COMMENTS. */
export const LAST_COMMENT_FROM = 115;

export const T_UP = 40;
export const T_FALL = 48;

export const getHoldAfterApex = (fps: number) => Math.round(0.5 * fps);

export const getLastFallStart = (fps: number) =>
  LAST_COMMENT_FROM + T_UP + getHoldAfterApex(fps);

/** Hero copy starts at 7s from composition start. */
export const getHeroStartFrame = (fps: number) => Math.round(7 * fps);

/**
 * Must match GoldHeroMessages `OFFSET_BACKTESTO_IMAGES` (hero-local frame index).
 */
export const HERO_LOCAL_OFFSET_BACKTESTO_IMAGES = 420;

/**
 * Composition timeline (seconds): cursor click on Backtesto1. At 30fps → frame 663
 * (hero start 210 + offset 420 + local 33 = last pre-burn frame).
 */
export const BACKTESTO_CURSOR_CLICK_AT_SEC = 22.1;

/**
 * Composition timeline (seconds): PerspCard shake begins. At 30fps → frame 668
 * (15 frames after click at 30fps).
 */
export const BACKTESTO_SHAKE_AT_SEC = 22.25;

export const BACKTESTO_BURN_FRAMES = 78;
export const BACKTESTO_IMG2_HOLD = 76;

/** Short “jump” burst only — not tied to burn length. */
const BACKTESTO_BOOM_JUMP_FRAMES = 10;

/**
 * Word beats + “2” (OFFSET_BIG_TWO + DRAMATIC_TWO_FRAMES in GoldHeroMessages). Keep in sync.
 */
const HERO_WORDS_AND_TWO_FRAMES = 328 + 60;

export function getBacktestoPreBurnFrames(fps: number): number {
  const clickAbs = Math.round(BACKTESTO_CURSOR_CLICK_AT_SEC * fps);
  const seq0 = getHeroStartFrame(fps) + HERO_LOCAL_OFFSET_BACKTESTO_IMAGES;
  return Math.max(8, clickAbs - seq0 + 1);
}

export function getBacktestoBoomStartLocal(fps: number): number {
  const shakeAbs = Math.round(BACKTESTO_SHAKE_AT_SEC * fps);
  const seq0 = getHeroStartFrame(fps) + HERO_LOCAL_OFFSET_BACKTESTO_IMAGES;
  return Math.max(0, shakeAbs - seq0);
}

export function getBacktestoBoomEndLocal(fps: number): number {
  return getBacktestoBoomStartLocal(fps) + BACKTESTO_BOOM_JUMP_FRAMES;
}

export function getBacktestoImageSequenceFrames(fps: number): number {
  return (
    getBacktestoPreBurnFrames(fps) +
    BACKTESTO_BURN_FRAMES +
    BACKTESTO_IMG2_HOLD
  );
}

export function getHeroSequenceFrames(fps: number): number {
  return HERO_WORDS_AND_TWO_FRAMES + getBacktestoImageSequenceFrames(fps);
}

/** One full cycle: comments + hero block + brief gap before loop. */
export const getWaveLength = (fps: number) =>
  getHeroStartFrame(fps) + getHeroSequenceFrames(fps) + 36;
