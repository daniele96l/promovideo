import type { CSSProperties } from "react";

/**
 * Piano layout LangEase (32 battute @30fps)
 *
 * Sezioni narrative:
 * A) Hook 0–4: domanda + prodotti + prezzo
 * B) Portafoglio 5–9: creazione e performance
 * C) Geo / futuro 10–14: mappa e Monte Carlo
 * D) Live 15–22: tracker e strumenti
 * E) Forum 23–29: community e like
 * F) CTA 30–31: chiusura
 *
 * Layout testo:
 * - center: titolo pieno schermo al centro
 * - centerLower / centerUpper: variazione verticale (respira il ritmo)
 * - splitLeft / splitRight: testo su metà schermo (icona sull’altra metà)
 * - wideCenter: riga lunga, più larghezza
 *
 * Layout icona (solo se decor !== null):
 * - north: sopra al testo (stack “hero”)
 * - northEast / northWest: angolo alto per enfasi prodotto
 * - east / west: fianco al testo in layout split
 * - south: sotto al testo (enfasi finale sezione)
 *
 * Movimento (MOTION_BEAT): entrate/uscite pianificate per evitare
 * la stessa direzione due battute di fila; handoff alternati.
 */

export type TextLayoutId =
  | "center"
  | "centerLower"
  | "centerUpper"
  | "splitLeft"
  | "splitRight"
  | "wideCenter";

export type DecorLayoutId =
  | "hidden"
  | "north"
  | "northEast"
  | "northWest"
  | "east"
  | "west"
  | "south";

export type BeatLayoutPlan = {
  textLayout: TextLayoutId;
  decorLayout: DecorLayoutId;
  /** Breve nota per Studio / manutenzione */
  note: string;
};

type Dir = "left" | "right" | "up" | "down";
type HandoffStyle = "alongAxis" | "orthogonalKick" | "squeeze";
type EaseName = "cubic" | "quint" | "back";

export type MotionPlanEntry = {
  enter: Dir;
  exit: Dir;
  handoffStyle: HandoffStyle;
  enterEase: EaseName;
  exitEase: EaseName;
};

/**
 * Movimento pianificato: `enter` non ripete mai la battuta precedente;
 * `handoffStyle` ruota (alongAxis → squeeze → orthogonal) per evitare loop visivi.
 */
export const MOTION_BEAT: ReadonlyArray<MotionPlanEntry> = [
  { enter: "left", exit: "down", handoffStyle: "alongAxis", enterEase: "quint", exitEase: "cubic" },
  { enter: "down", exit: "right", handoffStyle: "squeeze", enterEase: "cubic", exitEase: "quint" },
  { enter: "right", exit: "up", handoffStyle: "orthogonalKick", enterEase: "back", exitEase: "cubic" },
  { enter: "up", exit: "left", handoffStyle: "alongAxis", enterEase: "quint", exitEase: "back" },
  { enter: "right", exit: "down", handoffStyle: "squeeze", enterEase: "cubic", exitEase: "quint" },
  { enter: "down", exit: "up", handoffStyle: "orthogonalKick", enterEase: "back", exitEase: "cubic" },
  { enter: "left", exit: "right", handoffStyle: "alongAxis", enterEase: "quint", exitEase: "cubic" },
  { enter: "up", exit: "down", handoffStyle: "squeeze", enterEase: "cubic", exitEase: "back" },
  { enter: "right", exit: "left", handoffStyle: "orthogonalKick", enterEase: "back", exitEase: "quint" },
  { enter: "down", exit: "up", handoffStyle: "alongAxis", enterEase: "quint", exitEase: "cubic" },
  { enter: "left", exit: "right", handoffStyle: "squeeze", enterEase: "cubic", exitEase: "quint" },
  { enter: "up", exit: "down", handoffStyle: "orthogonalKick", enterEase: "back", exitEase: "cubic" },
  { enter: "right", exit: "left", handoffStyle: "alongAxis", enterEase: "quint", exitEase: "back" },
  { enter: "down", exit: "up", handoffStyle: "squeeze", enterEase: "cubic", exitEase: "quint" },
  { enter: "left", exit: "right", handoffStyle: "orthogonalKick", enterEase: "back", exitEase: "cubic" },
  { enter: "up", exit: "down", handoffStyle: "alongAxis", enterEase: "quint", exitEase: "cubic" },
  { enter: "right", exit: "left", handoffStyle: "squeeze", enterEase: "cubic", exitEase: "quint" },
  { enter: "down", exit: "up", handoffStyle: "orthogonalKick", enterEase: "back", exitEase: "back" },
  { enter: "left", exit: "right", handoffStyle: "alongAxis", enterEase: "quint", exitEase: "cubic" },
  { enter: "up", exit: "down", handoffStyle: "squeeze", enterEase: "cubic", exitEase: "quint" },
  { enter: "right", exit: "left", handoffStyle: "orthogonalKick", enterEase: "back", exitEase: "cubic" },
  { enter: "down", exit: "up", handoffStyle: "alongAxis", enterEase: "quint", exitEase: "back" },
  { enter: "left", exit: "right", handoffStyle: "squeeze", enterEase: "cubic", exitEase: "quint" },
  { enter: "up", exit: "down", handoffStyle: "orthogonalKick", enterEase: "back", exitEase: "cubic" },
  { enter: "right", exit: "left", handoffStyle: "alongAxis", enterEase: "quint", exitEase: "quint" },
  { enter: "down", exit: "up", handoffStyle: "squeeze", enterEase: "cubic", exitEase: "cubic" },
  { enter: "left", exit: "right", handoffStyle: "orthogonalKick", enterEase: "back", exitEase: "back" },
  { enter: "up", exit: "down", handoffStyle: "alongAxis", enterEase: "quint", exitEase: "cubic" },
  { enter: "right", exit: "left", handoffStyle: "squeeze", enterEase: "cubic", exitEase: "quint" },
  { enter: "down", exit: "up", handoffStyle: "orthogonalKick", enterEase: "back", exitEase: "cubic" },
  { enter: "left", exit: "right", handoffStyle: "alongAxis", enterEase: "quint", exitEase: "quint" },
  { enter: "up", exit: "down", handoffStyle: "squeeze", enterEase: "cubic", exitEase: "back" },
  { enter: "right", exit: "up", handoffStyle: "orthogonalKick", enterEase: "back", exitEase: "quint" },
];

/** Un piano per battuta (indice 0..31). */
export const BEAT_LAYOUT_PLAN: ReadonlyArray<BeatLayoutPlan> = [
  { textLayout: "center", decorLayout: "hidden", note: "A hook — solo copy, niente icona" },
  { textLayout: "centerLower", decorLayout: "north", note: "A backtester — grafico sopra, copy sotto" },
  { textLayout: "splitLeft", decorLayout: "east", note: "A live — pulse a destra, copy a sinistra" },
  { textLayout: "splitRight", decorLayout: "west", note: "A forum — icona a sinistra, copy a destra" },
  { textLayout: "wideCenter", decorLayout: "hidden", note: "A prezzo — riga larga centrale" },
  { textLayout: "centerUpper", decorLayout: "northWest", note: "B crea — portfolio in alto a sx" },
  { textLayout: "centerLower", decorLayout: "north", note: "B portafoglio — icona sopra" },
  { textLayout: "splitRight", decorLayout: "west", note: "B vedi — chart a sx" },
  { textLayout: "splitLeft", decorLayout: "east", note: "B performato — chart a dx" },
  { textLayout: "center", decorLayout: "hidden", note: "B chiusura sezione" },
  { textLayout: "splitLeft", decorLayout: "east", note: "C guarda — globo a destra" },
  { textLayout: "centerLower", decorLayout: "north", note: "C geo — globo sopra" },
  { textLayout: "splitRight", decorLayout: "west", note: "C performerà — chart a sx" },
  { textLayout: "centerUpper", decorLayout: "hidden", note: "C futuro — respiro" },
  { textLayout: "center", decorLayout: "northEast", note: "C Monte Carlo — grafico in angolo" },
  { textLayout: "centerLower", decorLayout: "north", note: "D traccia — pulse sopra" },
  { textLayout: "splitLeft", decorLayout: "east", note: "D live — pulse a destra" },
  { textLayout: "center", decorLayout: "northEast", note: "D tracker — pulse in angolo" },
  { textLayout: "centerUpper", decorLayout: "south", note: "D monitora — portfolio sotto" },
  { textLayout: "splitRight", decorLayout: "west", note: "D dividendi — monete a sx" },
  { textLayout: "splitLeft", decorLayout: "east", note: "D cedole — monete a dx" },
  { textLayout: "wideCenter", decorLayout: "northWest", note: "D azioni — chart in alto sx" },
  { textLayout: "center", decorLayout: "hidden", note: "D e molto altro" },
  { textLayout: "splitRight", decorLayout: "west", note: "E interagisci — forum a sx" },
  { textLayout: "centerLower", decorLayout: "north", note: "E forum — icona sopra" },
  { textLayout: "centerUpper", decorLayout: "northWest", note: "E leggi — articolo in alto sx" },
  { textLayout: "splitLeft", decorLayout: "east", note: "E articoli — icona a destra" },
  { textLayout: "wideCenter", decorLayout: "hidden", note: "E Dani e Matteo — nomi full width" },
  { textLayout: "splitLeft", decorLayout: "east", note: "E commenta — forum a destra" },
  { textLayout: "center", decorLayout: "northEast", note: "E like — cuore in angolo" },
  { textLayout: "centerUpper", decorLayout: "hidden", note: "F tutto questo" },
  { textLayout: "centerLower", decorLayout: "hidden", note: "F CTA Backtesto 2" },
];

export function getDecorPosition(
  layout: DecorLayoutId,
): { top: string; left: string } | null {
  if (layout === "hidden") {
    return null;
  }
  switch (layout) {
    case "north":
      return { top: "24%", left: "50%" };
    case "northEast":
      return { top: "18%", left: "74%" };
    case "northWest":
      return { top: "18%", left: "26%" };
    case "east":
      return { top: "46%", left: "78%" };
    case "west":
      return { top: "46%", left: "22%" };
    case "south":
      return { top: "72%", left: "50%" };
    default:
      return null;
  }
}

/** Stili base (posizione) per il blocco testo; il motion 3D si concatena dopo. */
export function getTextLayoutBox(
  layout: TextLayoutId,
): Pick<
  CSSProperties,
  "left" | "top" | "maxWidth" | "textAlign" | "transform"
> {
  switch (layout) {
    case "center":
      return {
        left: "50%",
        top: "50%",
        maxWidth: "92%",
        textAlign: "center",
        transform: "translate(-50%, -50%)",
      };
    case "centerLower":
      return {
        left: "50%",
        top: "57%",
        maxWidth: "90%",
        textAlign: "center",
        transform: "translate(-50%, -50%)",
      };
    case "centerUpper":
      return {
        left: "50%",
        top: "43%",
        maxWidth: "90%",
        textAlign: "center",
        transform: "translate(-50%, -50%)",
      };
    case "wideCenter":
      return {
        left: "50%",
        top: "51%",
        maxWidth: "96%",
        textAlign: "center",
        transform: "translate(-50%, -50%)",
      };
    case "splitLeft":
      return {
        left: "26%",
        top: "50%",
        maxWidth: "44%",
        textAlign: "left",
        transform: "translate(0, -50%)",
      };
    case "splitRight":
      return {
        left: "74%",
        top: "50%",
        maxWidth: "44%",
        textAlign: "right",
        transform: "translate(-100%, -50%)",
      };
    default:
      return {
        left: "50%",
        top: "50%",
        maxWidth: "92%",
        textAlign: "center",
        transform: "translate(-50%, -50%)",
      };
  }
}

