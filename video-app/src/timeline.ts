/** Must match last entry `from` in ITALIAN_FEATURE_COMMENTS. */
export const LAST_COMMENT_FROM = 143;

export const T_UP = 40;
export const T_FALL = 48;

export const getHoldAfterApex = (fps: number) => Math.round(0.5 * fps);

export const getLastFallStart = (fps: number) =>
  LAST_COMMENT_FROM + T_UP + getHoldAfterApex(fps);

import {
  BACKTESTO_BURN_FRAMES,
  BACKTESTO_CLICK_SEC,
  BACKTESTO_IMG2_HOLD_FRAMES,
  getBacktestoImageSequenceFrames,
  getBacktestoPreBurnFrames,
  getCompositionDurationFrames,
  getHeroSequenceFrames,
  getHeroStartFrame,
  HERO_LOCAL_OFFSET_BACKTESTO,
  HERO_START_SEC,
  secToFrames,
} from "./scene-tracks";

export {
  BACKTESTO_BURN_FRAMES,
  getBacktestoImageSequenceFrames,
  getBacktestoPreBurnFrames,
  getCompositionDurationFrames,
  getHeroSequenceFrames,
  getHeroStartFrame,
  HERO_START_SEC,
  secToFrames,
};

export const BACKTESTO_CURSOR_CLICK_AT_SEC = BACKTESTO_CLICK_SEC;
export const BACKTESTO_IMG2_HOLD = BACKTESTO_IMG2_HOLD_FRAMES;
export const HERO_LOCAL_OFFSET_BACKTESTO_IMAGES = HERO_LOCAL_OFFSET_BACKTESTO;

/** One full cycle: comments + hero block + tail gap (linear; no modulo). */
export const getWaveLength = (fps: number) => getCompositionDurationFrames(fps);
