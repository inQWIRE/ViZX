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

export const SCALE = 100;
export const BASE_SIZE = 1 * SCALE;
export const PAD_SIZE = 0.1 * SCALE;
export const PROPTO_SIZE = 0.2 * SCALE;
export const CAST_SIZE = 0.3 * SCALE;
export const TEXT_PAD_SIZE = 0.1 * SCALE;
export const FUNC_ARG_SIZE = 0.4 * SCALE;

export const NUMBER_KINDS = ["realnum", "num", "numvar", "numfunc", "real01"];

// yeah yeah not really a constant whatever
export let CANVAS_WIDTH = 500;
export let CANVAS_HEIGHT = 500;

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
