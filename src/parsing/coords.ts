import * as ast from "./ast";
import {
  CAST_SIZE,
  PAD_SIZE,
  number_kinds,
  FUNC_ARG_SIZE,
} from "../constants/consts";
import { quad, coord } from "../constants/types";

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

export function addCoords(node: ast.ASTNode, boundary: quad): ast.ASTNode {
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
      node_.node = addCoords(node_.node, bound);
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
      let l_bound = {
        tl: {
          x: node_.boundary.tl.x + PAD_SIZE,
          y: node_.boundary.tl.y + PAD_SIZE,
        },
        tr: {
          x: node_.boundary.tr.x - PAD_SIZE,
          y: node_.boundary.tr.y + PAD_SIZE,
        },
        bl: {
          x: node_.boundary.tl.x + PAD_SIZE,
          y: node_.boundary.tl.y + l_ver + PAD_SIZE,
        },
        br: {
          x: node_.boundary.tr.x - PAD_SIZE,
          y: node_.boundary.tr.y + l_ver + PAD_SIZE,
        },
      } as quad;
      // console.log("l_bound: ", l_bound);
      let r_bound = {
        bl: {
          x: node_.boundary.bl.x + PAD_SIZE,
          y: node_.boundary.bl.y - PAD_SIZE,
        },
        br: {
          x: node_.boundary.br.x - PAD_SIZE,
          y: node_.boundary.br.y - PAD_SIZE,
        },
        tl: {
          x: node_.boundary.tl.x + PAD_SIZE,
          y: node_.boundary.bl.y - r_ver - PAD_SIZE,
        },
        tr: {
          x: node_.boundary.tr.x - PAD_SIZE,
          y: node_.boundary.br.y - r_ver - PAD_SIZE,
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
      console.log("compose node bound: ", node_.boundary);
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
      // console.log("r_bound: ", r_bound);
      node_.left = addCoords(node_.left, l_bound);
      node_.right = addCoords(node_.right, r_bound);
      return node_;
    }
    case "nstack": {
      let node_ = <ast.ASTNStack>node;
      let n = parseInt(node_.n.val);
      let stack_nodes = node_.nodes;
      let n_ver = stack_nodes[0].ver_len!;
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
            x: bound.tl.x + PAD_SIZE,
            y: bound.tl.y + PAD_SIZE,
          },
          tr: {
            x: bound.tr.x - PAD_SIZE,
            y: bound.tr.y + PAD_SIZE,
          },
          bl: {
            x: bound.bl.x + PAD_SIZE,
            y: bound.tl.y + PAD_SIZE + n_ver,
          },
          br: {
            x: bound.br.x - PAD_SIZE,
            y: bound.tr.y + PAD_SIZE + n_ver,
          },
        })
      );
      for (let i = 0; i < n; i++) {
        stack_nodes[i] = JSON.parse(
          JSON.stringify(addCoords(stack_nodes[i], bound))
        );
        bound = JSON.parse(
          JSON.stringify({
            tl: {
              x: bound.tl.x,
              y: bound.bl.y + PAD_SIZE,
            },
            tr: {
              x: bound.tr.x,
              y: bound.br.y + PAD_SIZE,
            },
            bl: {
              x: bound.tl.x,
              y: bound.bl.y + n_ver + PAD_SIZE,
            },
            br: {
              x: bound.tr.x,
              y: bound.br.y + n_ver + PAD_SIZE,
            },
          })
        );
      }
      node_.nodes = JSON.parse(JSON.stringify(stack_nodes));
      return node_;
    }
    case "nstack1": {
      let node_ = <ast.ASTNStack1>node;
      let n = parseInt(node_.n.val);
      let stack_nodes = node_.nodes;
      let n_ver = stack_nodes[0].ver_len!;
      node_.boundary = makeAtCenter(
        findCenter(boundary),
        node.hor_len!,
        node.ver_len!
      );
      let bound = node_.boundary;
      bound = JSON.parse(
        JSON.stringify({
          tl: {
            x: bound.tl.x + PAD_SIZE,
            y: bound.tl.y + PAD_SIZE,
          },
          tr: {
            x: bound.tr.x - PAD_SIZE,
            y: bound.tr.y + PAD_SIZE,
          },
          bl: {
            x: bound.tl.x + PAD_SIZE,
            y: bound.tl.y + PAD_SIZE + n_ver,
          },
          br: {
            x: bound.tr.x - PAD_SIZE,
            y: bound.tr.y + PAD_SIZE + n_ver,
          },
        })
      );
      for (let i = 0; i < n; i++) {
        stack_nodes[i] = addCoords(stack_nodes[i], bound);
        bound = JSON.parse(
          JSON.stringify({
            tl: {
              x: bound.tl.x,
              y: bound.bl.y + 2 * PAD_SIZE,
            },
            tr: {
              x: bound.tr.x,
              y: bound.br.y + 2 * PAD_SIZE,
            },
            bl: {
              x: bound.tl.x,
              y: bound.bl.y + n_ver + PAD_SIZE,
            },
            br: {
              x: bound.tr.x,
              y: bound.br.y + n_ver + PAD_SIZE,
            },
          })
        );
      }
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
      node_.node = addCoords(node_.node, bound);
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
        if (number_kinds.includes(arg.kind)) {
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
      node_.l = addCoords(node_.l, l_bound);
      node_.r = addCoords(node_.r, r_bound);
      return node_;
    }
    default: {
      throw new Error(`unidentifiable node ${node} in addCoords`);
    }
  }
  throw new Error(`just so this file compiles <3`);
}
