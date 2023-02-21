import * as ast from './ast';
import { PAD_SIZE } from '../constants/consts';
import { quad, coord } from '../constants/types';

export function findCenter (q: quad) : coord {
    return {
        x: q.tl.x + (q.tr.x - q.tl.x) / 2, 
        y: q.tl.y + (q.bl.y - q.tl.y) / 2
    } as coord;
}

export function findLeftCenter (q: quad) : coord {
    return {
        x: q.tl.x,
        y: q.tl.y + (q.bl.y - q.tl.y) / 2
    } as coord;
}

export function findRightCenter (q: quad) : coord {
    return {
        x: q.tr.x,
        y: q.tr.y + (q.br.y - q.tr.y) / 2
    } as coord;
}

export function makeAtCenter (center: coord, hor_len: number, ver_len: number) : quad {
    return {
        tl: {
            x: center.x - (hor_len / 2),
            y: center.y - (ver_len / 2)
        },
        tr: {
            x: center.x + (hor_len / 2),
            y: center.y - (ver_len / 2)
        },
        bl: {
            x: center.x - (hor_len / 2),
            y: center.y + (ver_len / 2)
        },
        br: {
            x: center.x + (hor_len / 2),
            y: center.y + (ver_len / 2)
        }
    };
}

export function addCoords (node: ast.ASTNode, boundary: quad) : ast.ASTNode {
    switch (node.kind) {
        case 'const': {
            node.boundary = makeAtCenter(findCenter(boundary), node.hor_len!, node.ver_len!);
            return node;
        }
        case 'spider': {
            node.boundary = makeAtCenter(findCenter(boundary), node.hor_len!, node.ver_len!);
            return node;
        }
        case 'var': {
            node.boundary = makeAtCenter(findCenter(boundary), node.hor_len!, node.ver_len!);
            return node;
        }
        case 'stack': {
            let node_ = <ast.ASTStack>node;
            let l_ver = node_.left.ver_len!;
            let r_ver = node_.right.ver_len!;
            node_.boundary = makeAtCenter(findCenter(boundary), node.hor_len!, node.ver_len!);
            let l_bound = {
                tl: {
                    x: boundary.tl.x + PAD_SIZE,
                    y: boundary.tl.y + PAD_SIZE
                },
                tr: {
                    x: boundary.tr.x - PAD_SIZE,
                    y: boundary.tr.y + PAD_SIZE
                },
                bl: {
                    x: boundary.tl.x + PAD_SIZE,
                    y: boundary.tl.y + ((l_ver / l_ver + r_ver) * (boundary.bl.y - boundary.tl.y)) - PAD_SIZE
                },
                br: {
                    x: boundary.tr.x - PAD_SIZE,
                    y: boundary.tr.y + ((l_ver / l_ver + r_ver) * (boundary.br.y - boundary.tr.y)) - PAD_SIZE
                }
            };
            let r_bound = {
                bl: {
                    x: boundary.bl.x + PAD_SIZE,
                    y: boundary.bl.y - PAD_SIZE
                },
                br: {
                    x: boundary.br.x - PAD_SIZE,
                    y: boundary.br.y - PAD_SIZE
                },
                tl: {
                    x: boundary.tl.x + PAD_SIZE,
                    y: boundary.tl.y + ((l_ver / l_ver + r_ver) * (boundary.bl.y - boundary.tl.y)) + PAD_SIZE
                },
                tr: {
                    x: boundary.tr.x - PAD_SIZE,
                    y: boundary.tr.y + ((l_ver / l_ver + r_ver) * (boundary.br.y - boundary.tr.y)) + PAD_SIZE
                }
            };
            node_.left = addCoords(node_.left, l_bound);
            node_.right = addCoords(node_.right, r_bound);
            return node_;
        }
        default: {
            throw new Error(`unidentifiable node ${node} in addCoords`);
        }
    }
}