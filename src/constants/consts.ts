export const addOp = '+';
export const subOp = '-';
export const mulOp = '*';
export const divOp = '/';
export const rootOp = '√';
export const expOp = '^';

export const nStackOp = '⇑';
export const compOp = '⟷';
export const stackOp = '↕'; //'^';
export const nStack1Op = '↑';

export const propTo = '∝';
export const cap = '⊂';
export const cup = '⊃';
export const wire = '—';
export const box = '□';
export const swap = '⨉';
export const empty = '⦰';

export const transposeTransform = '⊤';
export const conjugateTransform = '⊼';
export const adjointTransform = '†';
export const colorswapTransform = '⊙';
export const flipTransform = '⥍';

export const SCALE = 100;
export const BASE_SIZE = 1*SCALE;
export const PAD_SIZE = 0.1*SCALE;
export const PROPTO_SIZE = 0.2*SCALE;
export const TEXT_PAD_SIZE = 0.1*SCALE;
export const CANVAS_WIDTH = 500;
export const CANVAS_HEIGHT = 500;

export const boundary = {
    tl: {
        x: 0,
        y: 0
    },
    tr: {
        x: CANVAS_WIDTH,
        y: 0 
    },
    bl: {
        x: 0, 
        y: CANVAS_HEIGHT
    },
    br: {
        x: CANVAS_WIDTH,
        y: CANVAS_HEIGHT
    }
};

// (Z 2 2 2 ⟷ Z 2 2 2) ↕ Z 2 2 2