# Agent guide — promotioanlvideo (Remotion)

This repository uses **`AGENTS.md`** (Cursor / agent convention). Instructions for AI assistants and contributors:

## Project layout

- **`video-app/`** — Remotion 4 project (React 19). Main code: `video-app/src/`.
- **Composition** is registered in `video-app/src/Root.tsx` (`id`: `MyComp`, default **30 fps**).
- **Assets** served via `staticFile()` live under `video-app/public/` (e.g. `audio.mp3`, `Backtesto1.jpg`, `Backtesto2.jpg`).

## Scene timing — `scene-tracks.ts` (seconds → frames)

**`video-app/src/scene-tracks.ts`** is the **canonical schedule** for the promo (composition time from **t = 0** in seconds, plus frame helpers for any `fps`).

- Edit **`HERO_START_SEC`**, **`COMMENTS_LAYER_END_SEC`**, **`BACKTESTO_CLICK_SEC`**, frame counts (`BACKTESTO_BURN_FRAMES`, holds, **`TAIL_GAP_FRAMES`**, etc.) **here first**.
- Then update **`Composition.tsx`** `<Sequence from={…} durationInFrames={…} name="…">` so it still matches (use the exported helpers: `getHeroStartFrame`, `getCommentsLayerDurationFrames`, `getHeroSequenceFrames`, `getBacktestoDustFxTrack`, `getBacktestoShakeAbsStartFrame`, …).
- **`timeline.ts`** re-exports the same helpers and legacy names (`BACKTESTO_CURSOR_CLICK_AT_SEC`, `HERO_LOCAL_OFFSET_BACKTESTO_IMAGES`, `getWaveLength` = **`getCompositionDurationFrames`**) so existing imports keep working.

**`Root.tsx`** uses **`DEFAULT_COMPOSITION_FRAMES`** from `Composition.tsx` (= `getCompositionDurationFrames(30)`). If you change fps in `Root`, recompute duration or derive it from `scene-tracks`.

### Linear timeline (no modulo)

- **`GoldHeroMessages`**: **`f = useCurrentFrame()`** — inside the Hero **`<Sequence>`**, Remotion gives **sequence-relative** frames (0 at the first hero frame). Do **not** subtract `getHeroStartFrame` (that would double-offset and break copy + Backtesto).
- **`CommentPillsLayer`**: `useCurrentFrame()` is **relative to the comment Sequence** (starts at composition 0), so it matches global frame while that sequence runs.

### Studio timeline rows

- **`Composition.tsx`** registers named sequences: **Background**, **Comment pills**, **Hero · copy + 2 + Backtesto**, **FX · Backtesto dust / sparkle**, **Audio**.
- The dust **FX** row uses an invisible **`TimelineMarker`** for timeline visibility. Moving it in the UI **does not** change code; update **`scene-tracks.ts`** / **`Composition.tsx`** to persist.
- Dust/light **logic** lives in **`BacktestoSparkReveal.tsx`** and uses **`BACKTESTO_CLICK_SEC`** (via **`timeline.ts` / `scene-tracks`**).

### Must stay aligned

- **`HERO_LOCAL_OFFSET_BACKTESTO` (420)** and **`HERO_WORDS_UNTIL_BACKTESTO_FRAMES` (420)** must match **`OFFSET_BACKTESTO_IMAGES`** (= **`OFFSET_BIG_TWO + DRAMATIC_TWO_FRAMES`**) in **`GoldHeroMessages.tsx`**.
- **`LAST_COMMENT_FROM`** in **`timeline.ts`** must match the last pill’s **`from`** in **`ITALIAN_FEATURE_COMMENTS`** (`CommentPills.tsx`).

## `BacktestoSparkReveal.tsx`

- **Pre-burn:** Backtesto1 + cursor; **swap** to Backtesto2 on first post-click frame.
- **VFX** (dust / light layers) render **behind** the card (`z-index`); cursor on top.

## Remotion / React conventions

- Prefer **`Easing.poly(5)`** for “quint”-like easing; **`Easing.quint`** is not available in this Remotion version.
- Run **`npx tsc --noEmit`** in `video-app/` after substantive edits.
- Keep changes scoped; avoid unrelated refactors and unsolicited markdown files unless requested.

## Commands

```bash
cd video-app && npm run dev    # Remotion Studio
cd video-app && npm run build  # Bundle
cd video-app && npm run lint   # eslint + tsc
```
