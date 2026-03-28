/** Must match last entry `from` in ITALIAN_FEATURE_COMMENTS. */
export const LAST_COMMENT_FROM = 115;

export const T_UP = 40;
export const T_FALL = 48;

export const getHoldAfterApex = (fps: number) => Math.round(0.5 * fps);

export const getLastFallStart = (fps: number) =>
  LAST_COMMENT_FROM + T_UP + getHoldAfterApex(fps);

/** First frame where the last card has finished dropping (fall + fade). */
export const getHeroStartFrame = (fps: number) =>
  getLastFallStart(fps) + T_FALL + 18;

/** Must cover word beats + big “2” (see GoldHeroMessages). */
export const HERO_SEQUENCE_FRAMES = 450;

/** One full cycle: comments + hero block + brief gap before loop. */
export const getWaveLength = (fps: number) =>
  getHeroStartFrame(fps) + HERO_SEQUENCE_FRAMES + 36;
