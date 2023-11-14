export let CANVAS_WIDTH = 100;
export let CANVAS_HEIGHT = 100;

// SCALE = size of base square, ideally do not go below 100 or it'll be too small
export let SCALE = 100;
export let LINE_WIDTH = SCALE / 200;
export let BASE_SIZE = 1 * SCALE;
export let PAD_SIZE = 0.1 * SCALE;
export let PROPTO_SIZE = 0.2 * SCALE;
export let CAST_SIZE = 0.3 * SCALE;
export let TEXT_PAD_SIZE = 0.08 * SCALE;
export let DOTS_PAD_SIZE = 0.1 * SCALE;
export let FUNC_ARG_SIZE = 0.7 * SCALE;
export let REALLY_SMALL_TEXT = (SCALE / 10).toString().concat("px");
export let SMALL_TEXT = (SCALE / 8).toString().concat("px");
export let MEDIUM_TEXT = (SCALE / 5).toString().concat("px");
export let LARGE_TEXT = (SCALE / 2.5).toString().concat("px");
export let MONOSPACE_FONT = "Helvetica";
export let ARIAL_FONT = "Arial";
export let HOR_PAD = 0.1 * SCALE;
export let VER_PAD = 0.1 * SCALE;
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
