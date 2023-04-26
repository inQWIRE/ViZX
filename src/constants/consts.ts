export const ADD_OP = "+";
export const SUB_OP = "-";
export const MUL_OP = "*";
export const DIV_OP = "/";
export const ROOT_OP = "√";
export const EXP_OP = "^";

export const N_STACK_OP = "⇑";
export const COMPOSE_OP = "⟷";
export const STACK_OP = "↕"; // \updownarrow
export const N_STACK_1_OP = "↑"; //\longleftrightarrow

export const PROP_TO = "∝";
export const CAP = "⊂";
export const CUP = "⊃";
export const WIRE = "—";
export const BOX = "□";
export const SWAP = "⨉";
export const EMPTY = "⦰";

export const TRANSPOSE_TRANSFORM = "⊤";
export const CONJUGATE_TRANSFORM = "⊼";
export const ADJOINT_TRANSFORM = "†";
export const COLORSWAP_TRANSFORM = "⊙";
export const FLIP_TRANSFORM = "⥍";

// SCALE = size of base square, ideally do not go below 100 or it'll be too small
export let SCALE = 100;
export let BASE_SIZE = 1 * SCALE;
export let PAD_SIZE = 0.1 * SCALE;
export let PROPTO_SIZE = 0.2 * SCALE;
export let CAST_SIZE = 0.3 * SCALE;
export let TEXT_PAD_SIZE = 0.08 * SCALE;
export let DOTS_PAD_SIZE = 0.1 * SCALE;
export let FUNC_ARG_SIZE = 0.4 * SCALE;
export let REALLY_SMALL_TEXT = (SCALE / 15).toString().concat("px");
export let SMALL_TEXT = (SCALE / 10).toString().concat("px");
export let MEDIUM_TEXT = (SCALE / 7).toString().concat("px");
export let LARGE_TEXT = (SCALE / 2).toString().concat("px");
export let MONOSPACE_FONT = "Monospace";
export let ARIAL_FONT = "Arial";

export const NUMBER_KINDS = ["realnum", "num", "numvar", "numfunc", "real01"];

// yeah yeah not really a constant whatever
export let CANVAS_WIDTH = 500;
export let CANVAS_HEIGHT = 500;

export function scaleUp() {
  SCALE = SCALE * 1.1;
  CANVAS_WIDTH = CANVAS_WIDTH * 1.1;
  CANVAS_HEIGHT = CANVAS_HEIGHT * 1.1;
  BASE_SIZE = 1 * SCALE;
  PAD_SIZE = 0.1 * SCALE;
  PROPTO_SIZE = 0.2 * SCALE;
  CAST_SIZE = 0.3 * SCALE;
  TEXT_PAD_SIZE = 0.08 * SCALE;
  DOTS_PAD_SIZE = 0.1 * SCALE;
  FUNC_ARG_SIZE = 0.4 * SCALE;
  REALLY_SMALL_TEXT = (SCALE / 15).toString().concat("px");
  SMALL_TEXT = (SCALE / 10).toString().concat("px");
  MEDIUM_TEXT = (SCALE / 7).toString().concat("px");
  LARGE_TEXT = (SCALE / 2).toString().concat("px");
}

export function scaleDown() {
  SCALE = SCALE * 0.9;
  CANVAS_WIDTH = CANVAS_WIDTH * 0.9;
  CANVAS_HEIGHT = CANVAS_HEIGHT * 0;
  BASE_SIZE = 1 * SCALE;
  PAD_SIZE = 0.1 * SCALE;
  PROPTO_SIZE = 0.2 * SCALE;
  CAST_SIZE = 0.3 * SCALE;
  TEXT_PAD_SIZE = 0.08 * SCALE;
  DOTS_PAD_SIZE = 0.1 * SCALE;
  FUNC_ARG_SIZE = 0.4 * SCALE;
  REALLY_SMALL_TEXT = (SCALE / 15).toString().concat("px");
  SMALL_TEXT = (SCALE / 10).toString().concat("px");
  MEDIUM_TEXT = (SCALE / 7).toString().concat("px");
  LARGE_TEXT = (SCALE / 2).toString().concat("px");
}

export function setCanvasWidthHeight(wh: [number, number]) {
  CANVAS_WIDTH = wh[0];
  CANVAS_HEIGHT = wh[1];
  boundary = {
    tl: {
      x: 0,
      y: 0,
    },
    tr: {
      x: CANVAS_WIDTH,
      y: 0,
    },
    bl: {
      x: 0,
      y: CANVAS_HEIGHT,
    },
    br: {
      x: CANVAS_WIDTH,
      y: CANVAS_HEIGHT,
    },
  };
}

export const VER_PAD = 100;
export const HOR_PAD = 100;

export const STACK_DASH: [number, number] = [10, 10];
export const COMPOSE_DASH: [number, number] = [6, 6];
export const CAST_DASH: [number, number] = [3, 3];
export const PROPTO_DASH: [number, number] = [1, 1];
export const FUNCTION_DASH: [number, number] = [3, 15];

export let boundary = {
  tl: {
    x: 0,
    y: 0,
  },
  tr: {
    x: CANVAS_WIDTH,
    y: 0,
  },
  bl: {
    x: 0,
    y: CANVAS_HEIGHT,
  },
  br: {
    x: CANVAS_WIDTH,
    y: CANVAS_HEIGHT,
  },
};
