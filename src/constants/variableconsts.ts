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
  FUNC_ARG_SIZE = 0.7 * SCALE;
  REALLY_SMALL_TEXT = (SCALE / 15).toString().concat("px");
  SMALL_TEXT = (SCALE / 10).toString().concat("px");
  MEDIUM_TEXT = (SCALE / 7).toString().concat("px");
  LARGE_TEXT = (SCALE / 2).toString().concat("px");
  STACK_DASH = [0.06 * SCALE, 0.06 * SCALE];
  COMPOSE_DASH = [0.16 * SCALE, 0.16 * SCALE];
  CAST_DASH = [0.02 * SCALE, 0.02 * SCALE];
  PROPTO_DASH = [0.005 * SCALE, 0.005 * SCALE];
  FUNCTION_DASH = [0.03 * SCALE, 0.01 * SCALE];
}

export function scaleDown() {
  SCALE = SCALE * 0.9;
  CANVAS_WIDTH = CANVAS_WIDTH * 0.9;
  CANVAS_HEIGHT = CANVAS_HEIGHT * 0.9;
  BASE_SIZE = 1 * SCALE;
  PAD_SIZE = 0.1 * SCALE;
  PROPTO_SIZE = 0.2 * SCALE;
  CAST_SIZE = 0.3 * SCALE;
  TEXT_PAD_SIZE = 0.08 * SCALE;
  DOTS_PAD_SIZE = 0.1 * SCALE;
  FUNC_ARG_SIZE = 0.7 * SCALE;
  REALLY_SMALL_TEXT = (SCALE / 15).toString().concat("px");
  SMALL_TEXT = (SCALE / 10).toString().concat("px");
  MEDIUM_TEXT = (SCALE / 7).toString().concat("px");
  LARGE_TEXT = (SCALE / 2).toString().concat("px");
  STACK_DASH = [0.06 * SCALE, 0.06 * SCALE];
  COMPOSE_DASH = [0.16 * SCALE, 0.16 * SCALE];
  CAST_DASH = [0.02 * SCALE, 0.02 * SCALE];
  PROPTO_DASH = [0.005 * SCALE, 0.005 * SCALE];
  FUNCTION_DASH = [0.03 * SCALE, 0.01 * SCALE];
}

export let CANVAS_WIDTH = 500;
export let CANVAS_HEIGHT = 500;

// SCALE = size of base square, ideally do not go below 100 or it'll be too small
export let SCALE = 1000;
export let LINE_WIDTH = SCALE / 200;
export let BASE_SIZE = 1 * SCALE;
export let PAD_SIZE = 0.1 * SCALE;
export let PROPTO_SIZE = 0.2 * SCALE;
export let CAST_SIZE = 0.3 * SCALE;
export let TEXT_PAD_SIZE = 0.08 * SCALE;
export let DOTS_PAD_SIZE = 0.1 * SCALE;
export let FUNC_ARG_SIZE = 0.7 * SCALE;
export let REALLY_SMALL_TEXT = (SCALE / 15).toString().concat("px");
export let SMALL_TEXT = (SCALE / 10).toString().concat("px");
export let MEDIUM_TEXT = (SCALE / 7).toString().concat("px");
export let LARGE_TEXT = (SCALE / 2).toString().concat("px");
export let MONOSPACE_FONT = "Monospace";
export let ARIAL_FONT = "Arial";
export let HOR_PAD = 0.01 * SCALE;
export let VER_PAD = 0.01 * SCALE;
export let STACK_DASH: [number, number] = [0.06 * SCALE, 0.06 * SCALE];
export let COMPOSE_DASH: [number, number] = [0.16 * SCALE, 0.16 * SCALE];
export let CAST_DASH: [number, number] = [0.02 * SCALE, 0.02 * SCALE];
export let PROPTO_DASH: [number, number] = [0.005 * SCALE, 0.005 * SCALE];
export let FUNCTION_DASH: [number, number] = [0.03 * SCALE, 0.01 * SCALE];

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
