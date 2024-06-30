export function changeScale(scale: number) {
  SCALE = scale;
  LINE_WIDTH = scale / 200;
  BASE_SIZE = 1 * scale;
  PAD_SIZE = 0.1 * scale;
  PROPTO_SIZE = 0.2 * scale;
  CAST_SIZE = 0.3 * scale;
  TEXT_PAD_SIZE = 0.08 * scale;
  DOTS_PAD_SIZE = 0.1 * scale;
  FUNC_ARG_SIZE = 0.7 * scale;
  REALLY_SMALL_TEXT = (scale / 15).toString().concat("px");
  SMALL_TEXT = (scale / 10).toString().concat("px");
  MEDIUM_TEXT = (scale / 7).toString().concat("px");
  LARGE_TEXT = (scale / 2).toString().concat("px");
  MONOSPACE_FONT = "Monospace";
  ARIAL_FONT = "Arial";
  HOR_PAD = 0.1 * scale;
  VER_PAD = 0.1 * scale;
  STACK_DASH = [0.06 * scale, 0.06 * scale];
  COMPOSE_DASH = [0.16 * scale, 0.16 * scale];
  CAST_DASH = [0.02 * scale, 0.02 * scale];
  PROPTO_DASH = [0.005 * scale, 0.005 * scale];
  FUNCTION_DASH = [0.03 * scale, 0.01 * scale];
}

export let CANVAS_WIDTH = 100;
export let CANVAS_HEIGHT = 100;

// SCALE = size of base square, ideally do not go below 100 or it'll be too small
export let SCALE: number;
export let LINE_WIDTH: number;
export let BASE_SIZE: number;
export let PAD_SIZE: number;
export let PROPTO_SIZE: number;
export let CAST_SIZE: number;
export let TEXT_PAD_SIZE: number;
export let DOTS_PAD_SIZE: number;
export let FUNC_ARG_SIZE: number;
export let REALLY_SMALL_TEXT: string;
export let SMALL_TEXT: string;
export let MEDIUM_TEXT: string;
export let LARGE_TEXT: string;
export let MONOSPACE_FONT: string;
export let ARIAL_FONT: string;
export let HOR_PAD: number;
export let VER_PAD: number;
export let STACK_DASH: [number, number];
export let COMPOSE_DASH: [number, number];
export let CAST_DASH: [number, number];
export let PROPTO_DASH: [number, number];
export let FUNCTION_DASH: [number, number];
changeScale(1000); // Default scale

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