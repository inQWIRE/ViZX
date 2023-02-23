import * as ast from "./ast";
import { PAD_SIZE } from "../constants/consts";
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
      // console.log("hor_len: ", node.hor_len, "ver_len: ", node.ver_len);
      // console.log("center = ", findCenter(boundary), node.hor_len!, node.ver_len!);
      // console.log("boundary =" , node.boundary);
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
    case "nwire": {
      break;
    }
    case "cast": {
      break;
    }
    case "function": {
      break;
    }
    case "propto": {
      break;
    }
    default: {
      throw new Error(`unidentifiable node ${node} in addCoords`);
    }
  }
  throw new Error(`just so this file compiles <3`);
}
