import * as ast from './ast';
import { PAD_SIZE } from '../constants/consts';
import { quad, coord } from '../constants/types';

export function findCenter (q: quad) : coord {
    return {
        x: q.tl.x + (q.tr.x - q.tl.x) / 2, 
        y: q.tl.y + (q.bl.y - q.tl.y) / 2
    } as coord;
}

export function findTopCenter (q: quad) : coord {
    return {
        x: q.tl.x + (q.tr.x - q.tl.x) / 2,
        y: q.tl.y
    } as coord;
}

export function findBottomCenter (q: quad) : coord {
    return {
        x: q.bl.x + (q.br.x - q.bl.x) / 2,
        y: q.bl.y
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
            console.log("hor_len: ", node.hor_len, "ver_len: ", node.ver_len);
            console.log("center = ", findCenter(boundary), node.hor_len!, node.ver_len!);
            console.log("boundary =" , node.boundary);
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
            console.log("stack node bound: ", node_.boundary);
            let l_bound = {
                tl: {
                    x: node_.boundary.tl.x + PAD_SIZE,
                    y: node_.boundary.tl.y + PAD_SIZE
                },
                tr: {
                    x: node_.boundary.tr.x - PAD_SIZE,
                    y: node_.boundary.tr.y + PAD_SIZE
                },
                bl: {
                    x: node_.boundary.tl.x + PAD_SIZE,
                    y: node_.boundary.tl.y + ((l_ver / (l_ver + r_ver + (4*PAD_SIZE))) * (node_.boundary.bl.y - node_.boundary.tl.y)) + PAD_SIZE
                },
                br: {
                    x: node_.boundary.tr.x - PAD_SIZE,
                    y: node_.boundary.tr.y + ((l_ver / (l_ver + r_ver + (4*PAD_SIZE))) * (node_.boundary.br.y - node_.boundary.tr.y)) + PAD_SIZE
                }
            } as quad;
            console.log("l_bound: ", l_bound);
            // console.log("lver: ", l_ver, "rver: ", r_ver);
            // console.log("bl.y: ", node_.boundary.bl.y, "tl.y: ", node_.boundary.tl.y);
            // console.log("lbound bl: ", ((l_ver / l_ver + r_ver) * (node_.boundary.bl.y - node_.boundary.tl.y)));
            let r_bound = {
                bl: {
                    x: node_.boundary.bl.x + PAD_SIZE,
                    y: node_.boundary.bl.y - PAD_SIZE
                },
                br: {
                    x: node_.boundary.br.x - PAD_SIZE,
                    y: node_.boundary.br.y - PAD_SIZE
                },
                tl: {
                    x: node_.boundary.tl.x + PAD_SIZE,
                    y: node_.boundary.bl.y - ((r_ver / (l_ver + r_ver + (4*PAD_SIZE))) * (node_.boundary.bl.y - node_.boundary.tl.y)) - PAD_SIZE
                },
                tr: {
                    x: node_.boundary.tr.x - PAD_SIZE,
                    y: node_.boundary.br.y - ((r_ver / (l_ver + r_ver + (4*PAD_SIZE))) * (node_.boundary.br.y - node_.boundary.tr.y)) - PAD_SIZE
                }
            } as quad;
            console.log("r_bound: ", r_bound);
            node_.left = addCoords(node_.left, l_bound);
            node_.right = addCoords(node_.right, r_bound);
            return node_;
        }
        case 'compose': {
            let node_ = <ast.ASTCompose>node;
            let l_hor = node_.left.hor_len!;
            let r_hor = node_.right.hor_len!;
            node_.boundary = makeAtCenter(findCenter(boundary), node.hor_len!, node.ver_len!);
            console.log("compose node bound: ", node_.boundary);
            let l_bound = {
                tl: {
                    x: node_.boundary.tl.x + PAD_SIZE,
                    y: node_.boundary.tl.y + PAD_SIZE
                },
                tr: {
                    x: node_.boundary.tl.x + ((l_hor / (l_hor + r_hor + (4*PAD_SIZE))) * (node_.boundary.tr.x - node_.boundary.tl.x)) + PAD_SIZE,
                    y: node_.boundary.tl.y + PAD_SIZE
                },
                bl: {
                    x: node_.boundary.bl.x + PAD_SIZE,
                    y: node_.boundary.bl.y - PAD_SIZE
                },
                br: {
                    x: node_.boundary.tl.x + ((l_hor / (l_hor + r_hor + (4*PAD_SIZE))) * (node_.boundary.tr.x - node_.boundary.tl.x)) + PAD_SIZE,
                    y: node_.boundary.bl.y - PAD_SIZE
                }
            } as quad;
            console.log("l_bound: ", l_bound);
            // console.log("lver: ", l_ver, "rver: ", r_ver);
            // console.log("bl.y: ", node_.boundary.bl.y, "tl.y: ", node_.boundary.tl.y);
            // console.log("lbound bl: ", ((l_ver / l_ver + r_ver) * (node_.boundary.bl.y - node_.boundary.tl.y)));
            let r_bound = {
                tl: {
                    x: node_.boundary.tr.x - ((r_hor / (l_hor + r_hor + (4*PAD_SIZE))) * (node_.boundary.br.x - node_.boundary.bl.x)) - PAD_SIZE,
                    y: node_.boundary.tr.y + PAD_SIZE
                },
                tr: {
                    x: node_.boundary.tr.x - PAD_SIZE,
                    y: node_.boundary.tr.y + PAD_SIZE
                },
                bl: {
                    x: node_.boundary.br.x - ((r_hor / (l_hor + r_hor + (4*PAD_SIZE))) * (node_.boundary.br.x - node_.boundary.bl.x)) - PAD_SIZE,
                    y: node_.boundary.bl.y - PAD_SIZE
                },
                br: {
                    x: node_.boundary.br.x - PAD_SIZE,
                    y: node_.boundary.br.y - PAD_SIZE
                }
            } as quad;
            console.log("r_bound: ", r_bound);
            node_.left = addCoords(node_.left, l_bound);
            node_.right = addCoords(node_.right, r_bound);
            return node_;
        }
        default: {
            throw new Error(`unidentifiable node ${node} in addCoords`);
        }
    }
}