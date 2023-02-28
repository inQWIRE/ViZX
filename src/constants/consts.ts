export const addOp = "+";
export const subOp = "-";
export const mulOp = "*";
export const divOp = "/";
export const rootOp = "√";
export const expOp = "^";

export const nStackOp = "⇑";
export const compOp = "⟷";
export const stackOp = "↕"; // \updownarrow
export const nStack1Op = "↑"; //\longleftrightarrow

export const propTo = "∝";
export const cap = "⊂";
export const cup = "⊃";
export const wire = "—";
export const box = "□";
export const swap = "⨉";
export const empty = "⦰";

export const transposeTransform = "⊤";
export const conjugateTransform = "⊼";
export const adjointTransform = "†";
export const colorswapTransform = "⊙";
export const flipTransform = "⥍";

export const SCALE = 100;
export const BASE_SIZE = 1 * SCALE;
export const PAD_SIZE = 0.1 * SCALE;
export const PROPTO_SIZE = 0.2 * SCALE;
export const CAST_SIZE = 0.3 * SCALE;
export const TEXT_PAD_SIZE = 0.1 * SCALE;
export const FUNC_ARG_SIZE = 0.4 * SCALE;

export const number_kinds = ["realnum", "num", "numvar", "numfunc", "real01"];

export let CANVAS_WIDTH = 500;
export let CANVAS_HEIGHT = 500;

export function setCanvasWidthHeight(wh: [number, number]) {
  console.log("setting width n height: ", wh);
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

export const ver_pad = 100;
export const hor_pad = 100;

export const stack_dash: [number, number] = [10, 10];
export const compose_dash: [number, number] = [6, 6];
export const cast_dash: [number, number] = [3, 3];
export const propto_dash: [number, number] = [1, 1];
export const function_dash: [number, number] = [3, 15];

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
