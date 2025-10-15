import * as ast from "./ast";
import { NUMBER_KINDS, SCALE_OP } from "../constants/consts";
import {
  FUNC_ARG_SIZE,
  CAST_SIZE,
  PAD_SIZE,
  PROPTO_SIZE
} from "../constants/variableconsts";
import { quad, coord } from "../constants/types";
import { mainModule } from "process";
import { createContext } from "vm";

export function findCenter(q: quad): coord {
  return {
    x: q.tl.x + (q.tr.x - q.tl.x) / 2,
    y: q.tl.y + (q.bl.y - q.tl.y) / 2,
  } as coord;
}

export function findTopCenter(q: quad): coord {
  return {
    x: q.tl.x + (q.tr.x - q.tl.x) / 2,
    y: q.tl.y,
  } as coord;
}

export function findBottomCenter(q: quad): coord {
  return {
    x: q.bl.x + (q.br.x - q.bl.x) / 2,
    y: q.bl.y,
  } as coord;
}

export function findLeftCenter(q: quad): coord {
  return {
    x: q.tl.x,
    y: q.tl.y + (q.bl.y - q.tl.y) / 2,
  } as coord;
}

export function findRightCenter(q: quad): coord {
  return {
    x: q.tr.x,
    y: q.tr.y + (q.br.y - q.tr.y) / 2,
  } as coord;
}

export function makeAtCenter(
  center: coord,
  hor_len: number,
  ver_len: number
): quad {
  return {
    tl: {
      x: center.x - hor_len / 2,
      y: center.y - ver_len / 2,
    },
    tr: {
      x: center.x + hor_len / 2,
      y: center.y - ver_len / 2,
    },
    bl: {
      x: center.x - hor_len / 2,
      y: center.y + ver_len / 2,
    },
    br: {
      x: center.x + hor_len / 2,
      y: center.y + ver_len / 2,
    },
  };
}

export function addCoords(node: ast.ASTNode, boundary: quad, preboxed:Boolean = false): ast.ASTNode {
  switch (node.kind) {
    case "transform": {
      let node_ = <ast.ASTTransform>node;
      node_.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      let bound: quad = JSON.parse(JSON.stringify(boundary));
      bound.tl.x += PAD_SIZE + FUNC_ARG_SIZE;
      bound.tl.y += PAD_SIZE;
      bound.tr.x -= PAD_SIZE;
      bound.tr.y += PAD_SIZE;
      bound.bl.x += PAD_SIZE + FUNC_ARG_SIZE;
      bound.bl.y -= PAD_SIZE;
      bound.br.x -= PAD_SIZE;
      bound.br.y -= PAD_SIZE;
      node_.node = addCoords(node_.node, bound, true);
      return node_;
    }
    case "scale": {
      let node_ = <ast.ASTScale>node;
      node_.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      let size = Math.max(0.3 * PROPTO_SIZE * (node_.coefficient.expr.length + 3) + PAD_SIZE,
                  FUNC_ARG_SIZE);
      
      let bound: quad = JSON.parse(JSON.stringify(boundary));
      bound.tl.x += PAD_SIZE + size;
      bound.tl.y += PAD_SIZE;
      bound.tr.x -= PAD_SIZE;
      bound.tr.y += PAD_SIZE;
      bound.bl.x += PAD_SIZE + size;
      bound.bl.y -= PAD_SIZE;
      bound.br.x -= PAD_SIZE;
      bound.br.y -= PAD_SIZE;
      node_.node = addCoords(node_.node, bound, true);
      return node_;
    }
    case "const": {
      node.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      return node;
    }
    case "spider": {
      node.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      return node;
    }
    case "var": {
      node.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      return node;
    }
    case "nwire": {
      node.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      return node;
    }
    case "stack": {
      let node_ = <ast.ASTStack>node;
      let l_ver = node_.left.ver_len!;
      let r_ver = node_.right.ver_len!;
      node_.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      // console.log("stack node bound: ", node_.boundary);
      let ADJ_SIZE = preboxed ? 0 : PAD_SIZE;
      let l_bound = {
        tl: {
          x: node_.boundary.tl.x + ADJ_SIZE,
          y: node_.boundary.tl.y + ADJ_SIZE,
        },
        tr: {
          x: node_.boundary.tr.x - ADJ_SIZE,
          y: node_.boundary.tr.y + ADJ_SIZE,
        },
        bl: {
          x: node_.boundary.tl.x + ADJ_SIZE,
          y: node_.boundary.tl.y + l_ver + ADJ_SIZE,
        },
        br: {
          x: node_.boundary.tr.x - ADJ_SIZE,
          y: node_.boundary.tr.y + l_ver + ADJ_SIZE,
        },
      } as quad;
      // console.log("l_bound: ", l_bound);
      let r_bound = {
        bl: {
          x: node_.boundary.bl.x + ADJ_SIZE,
          y: node_.boundary.bl.y - ADJ_SIZE,
        },
        br: {
          x: node_.boundary.br.x - ADJ_SIZE,
          y: node_.boundary.br.y - ADJ_SIZE,
        },
        tl: {
          x: node_.boundary.tl.x + ADJ_SIZE,
          y: node_.boundary.bl.y - r_ver - ADJ_SIZE,
        },
        tr: {
          x: node_.boundary.tr.x - ADJ_SIZE,
          y: node_.boundary.br.y - r_ver - ADJ_SIZE,
        },
      } as quad;
      // console.log("r_bound: ", r_bound);
      node_.left = addCoords(node_.left, l_bound);
      node_.right = addCoords(node_.right, r_bound);
      return node_;
    }
    case "compose": {
      let node_ = <ast.ASTCompose>node;
      let l_hor = node_.left.hor_len!;
      let r_hor = node_.right.hor_len!;
      node_.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      let ADJ_SIZE = preboxed ? 0 : PAD_SIZE;
      let l_bound = {
        tl: {
          x: node_.boundary.tl.x + ADJ_SIZE,
          y: node_.boundary.tl.y + ADJ_SIZE,
        },
        tr: {
          x: node_.boundary.tl.x + l_hor + ADJ_SIZE,
          y: node_.boundary.tl.y + ADJ_SIZE,
        },
        bl: {
          x: node_.boundary.bl.x + ADJ_SIZE,
          y: node_.boundary.bl.y - ADJ_SIZE,
        },
        br: {
          x: node_.boundary.tl.x + l_hor + ADJ_SIZE,
          y: node_.boundary.bl.y - ADJ_SIZE,
        },
      } as quad;
      // console.log("l_bound: ", l_bound);
      let r_bound = {
        tl: {
          x: node_.boundary.tr.x - r_hor - ADJ_SIZE,
          y: node_.boundary.tr.y + ADJ_SIZE,
        },
        tr: {
          x: node_.boundary.tr.x - ADJ_SIZE,
          y: node_.boundary.tr.y + ADJ_SIZE,
        },
        bl: {
          x: node_.boundary.br.x - r_hor - ADJ_SIZE,
          y: node_.boundary.bl.y - ADJ_SIZE,
        },
        br: {
          x: node_.boundary.br.x - ADJ_SIZE,
          y: node_.boundary.br.y - ADJ_SIZE,
        },
      } as quad;
      // console.log("r_bound: ", r_bound);
      node_.left = addCoords(node_.left, l_bound);
      node_.right = addCoords(node_.right, r_bound);
      return node_;
    }
    case "nstack": {
      let node_ = <ast.ASTNStack>node;
      let n = parseInt(node_.n.val);
      let stack_node = node_.node;
      let n_ver = stack_node.ver_len!;
      // console.log("n_ver: ", n_ver);
      node_.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      // console.log("node_boundary: ", node_.boundary);
      let bound = node_.boundary;
      bound = JSON.parse(
        JSON.stringify({
          tl: {
            x: bound.tl.x + PAD_SIZE + FUNC_ARG_SIZE,
            y: bound.tl.y + PAD_SIZE,
          },
          tr: {
            x: bound.tr.x - PAD_SIZE,
            y: bound.tr.y + PAD_SIZE,
          },
          bl: {
            x: bound.bl.x + PAD_SIZE + FUNC_ARG_SIZE,
            y: bound.tl.y + PAD_SIZE + n_ver,
          },
          br: {
            x: bound.br.x - PAD_SIZE,
            y: bound.tr.y + PAD_SIZE + n_ver,
          },
        })
      );
      stack_node = addCoords(stack_node, bound);
      return node_;
    }
    case "nstack1": {
      let node_ = <ast.ASTNStack1>node;
      let n = parseInt(node_.n.val);
      let stack_node = node_.node;
      let n_ver = stack_node.ver_len!;
      node_.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      let bound = node_.boundary;
      bound = JSON.parse(
        JSON.stringify({
          tl: {
            x: bound.tl.x + PAD_SIZE + FUNC_ARG_SIZE,
            y: bound.tl.y + PAD_SIZE,
          },
          tr: {
            x: bound.tr.x - PAD_SIZE,
            y: bound.tr.y + PAD_SIZE,
          },
          bl: {
            x: bound.tl.x + PAD_SIZE + FUNC_ARG_SIZE,
            y: bound.tl.y + PAD_SIZE + n_ver,
          },
          br: {
            x: bound.tr.x - PAD_SIZE,
            y: bound.tr.y + PAD_SIZE + n_ver,
          },
        })
      );
      stack_node = addCoords(stack_node, bound);
      return node_;
    }
    case "cast": {
      let node_ = <ast.ASTCast>node;
      node_.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      let bound: quad = JSON.parse(JSON.stringify(boundary));
      bound.tl.x += CAST_SIZE;
      bound.tl.y += PAD_SIZE;
      bound.tr.x -= CAST_SIZE;
      bound.tr.y += PAD_SIZE;
      bound.bl.x += CAST_SIZE;
      bound.bl.y -= PAD_SIZE;
      bound.br.x -= CAST_SIZE;
      bound.br.y -= PAD_SIZE;
      node_.node = addCoords(node_.node, bound, true);
      return node_;
    }
    case "function": {
      let node_ = <ast.ASTFunc>node;
      node_.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      let bound: quad = JSON.parse(JSON.stringify(node_.boundary));
      let in_bound = bound;
      in_bound.tl.y += FUNC_ARG_SIZE + PAD_SIZE;
      in_bound.tr.y += PAD_SIZE;
      in_bound.bl.y -= FUNC_ARG_SIZE + PAD_SIZE;
      in_bound.br.y -= PAD_SIZE;
      in_bound.tl.x += FUNC_ARG_SIZE;
      in_bound.bl.x += FUNC_ARG_SIZE;
      for (let arg of node_.args) {
        in_bound.tl.x += PAD_SIZE;
        in_bound.bl.x += PAD_SIZE;
        if (NUMBER_KINDS.includes(arg.kind)) {
          in_bound.tr.x = in_bound.tl.x + FUNC_ARG_SIZE;
          in_bound.br.x = in_bound.bl.x + FUNC_ARG_SIZE;
        } else {
          let arg_ = <ast.ASTNode>arg;
          in_bound.tr.x = in_bound.tl.x + arg_.hor_len!;
          in_bound.br.x = in_bound.bl.x + arg_.hor_len!;
          arg = addCoords(arg_, in_bound);
        }
        in_bound.tl.x = in_bound.tr.x;
        in_bound.bl.x = in_bound.br.x;
        in_bound.tl.x += PAD_SIZE;
        in_bound.bl.x += PAD_SIZE;
      }
      return node_;
    }
    case "propto": {
      let node_ = <ast.ASTPropTo>node;
      let l_hor = node_.l.hor_len!;
      let r_hor = node_.r.hor_len!;
      node_.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      let l_bound = {
        tl: {
          x: node_.boundary.tl.x + PAD_SIZE,
          y: node_.boundary.tl.y + PAD_SIZE,
        },
        tr: {
          x: node_.boundary.tl.x + l_hor + PAD_SIZE,
          y: node_.boundary.tl.y + PAD_SIZE,
        },
        bl: {
          x: node_.boundary.bl.x + PAD_SIZE,
          y: node_.boundary.bl.y - PAD_SIZE,
        },
        br: {
          x: node_.boundary.tl.x + l_hor + PAD_SIZE,
          y: node_.boundary.bl.y - PAD_SIZE,
        },
      } as quad;
      // console.log("l_bound: ", l_bound);
      let r_bound = {
        tl: {
          x: node_.boundary.tr.x - r_hor - PAD_SIZE,
          y: node_.boundary.tr.y + PAD_SIZE,
        },
        tr: {
          x: node_.boundary.tr.x - PAD_SIZE,
          y: node_.boundary.tr.y + PAD_SIZE,
        },
        bl: {
          x: node_.boundary.br.x - r_hor - PAD_SIZE,
          y: node_.boundary.bl.y - PAD_SIZE,
        },
        br: {
          x: node_.boundary.br.x - PAD_SIZE,
          y: node_.boundary.br.y - PAD_SIZE,
        },
      } as quad;
      node_.l = addCoords(node_.l, l_bound, true);
      node_.r = addCoords(node_.r, r_bound, true);
      return node_;
    }
    default: {
      throw new Error(`unidentifiable node ${node} in addCoords`);
    }
  }
}
