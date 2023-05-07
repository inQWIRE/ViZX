import * as ast from "./ast";
import { HOR_PAD, VER_PAD, NUMBER_KINDS } from "../constants/consts";
import {
  BASE_SIZE,
  CAST_SIZE,
  PAD_SIZE,
  PROPTO_SIZE,
  FUNC_ARG_SIZE,
  SCALE,
} from "../constants/variableconsts";

export function addSizesHappyRobot(node: ast.ASTNode): ast.ASTNode {
  if (node.ver_len === undefined || node.hor_len === undefined) {
    throw new Error(`length undefined in second sizing\n`);
  }
  switch (node.kind) {
    case "stack": {
      let node_ = <ast.ASTStack>node;
      node_.left.hor_len = node.hor_len_unpadded;
      node_.right.hor_len = node.hor_len_unpadded;
      node = node_;
      // node_.right = addSizesHappyRobot(node_.right);
      // node_.left = addSizesHappyRobot(node_.left);
      break;
    }
    case "compose": {
      let node_ = <ast.ASTStack>node;
      node_.left.ver_len = node.ver_len_unpadded;
      node_.right.ver_len = node.ver_len_unpadded;
      node = node_;
      // node_.right = addSizesHappyRobot(node_.right);
      // node_.left = addSizesHappyRobot(node_.left);
      break;
    }
    default: {
      break;
    }
  }
  return node;
}
export function addSizes(node: ast.ASTNode): ast.ASTNode {
  node.hor_len = 0;
  node.ver_len = 0;
  node.hor_len_unpadded = 0;
  node.ver_len_unpadded = 0;
  switch (node.kind) {
    case "transform": {
      let node_ = <ast.ASTTransform>node;
      let snode = addSizes(node_.node);
      if (snode.hor_len !== undefined && snode.ver_len !== undefined) {
        node.hor_len_unpadded += snode.hor_len + FUNC_ARG_SIZE;
        node.hor_len += node.hor_len_unpadded + 2 * PAD_SIZE;
        node.ver_len_unpadded += snode.ver_len;
        node.ver_len += node.ver_len_unpadded + 2 * PAD_SIZE;
      }
      break;
    }
    case "const": {
      node.hor_len_unpadded += BASE_SIZE;
      node.hor_len = node.hor_len_unpadded;
      node.ver_len_unpadded += BASE_SIZE;
      node.ver_len = node.ver_len_unpadded;
      break;
    }
    case "spider": {
      node.hor_len_unpadded += BASE_SIZE;
      node.hor_len = node.hor_len_unpadded;
      node.ver_len_unpadded += BASE_SIZE;
      node.ver_len = node.ver_len_unpadded;
      break;
    }
    case "var": {
      node.hor_len_unpadded += BASE_SIZE;
      node.hor_len = node.hor_len_unpadded;
      node.ver_len_unpadded += BASE_SIZE;
      node.ver_len = node.ver_len_unpadded;
      break;
    }
    case "stack": {
      let node_ = <ast.ASTStack>node;
      let sleft = addSizes(node_.left);
      let sright = addSizes(node_.right);
      if (sleft.hor_len !== undefined && sright.hor_len !== undefined) {
        node.hor_len_unpadded += Math.max(sleft.hor_len, sright.hor_len);
        node.hor_len += node.hor_len_unpadded + 2 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as stack node: horizontal len`
        );
      }
      if (sleft.ver_len !== undefined && sright.ver_len !== undefined) {
        node.ver_len_unpadded += sleft.ver_len + sright.ver_len;
        node.ver_len += node.ver_len_unpadded + 4 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as stack node: vertical len`
        );
      }
      break;
    }
    case "compose": {
      let node_ = <ast.ASTCompose>node;
      let sleft = addSizes(node_.left);
      let sright = addSizes(node_.right);
      if (sleft.ver_len !== undefined && sright.ver_len !== undefined) {
        node.ver_len_unpadded += Math.max(sleft.ver_len, sright.ver_len);
        node.ver_len += node.ver_len_unpadded + 2 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as compose node: horizontal len`
        );
      }
      if (sleft.hor_len !== undefined && sright.hor_len !== undefined) {
        node.hor_len_unpadded += sleft.hor_len + sright.hor_len;
        node.hor_len += node.hor_len_unpadded + 4 * PAD_SIZE;
        // sleft.hor_len = node.hor_len - 4*PAD_SIZE;
        // sright.hor_len = node.hor_len - 4*PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as compose node: vertical len`
        );
      }
      break;
    }
    case "nstack": {
      let node_ = <ast.ASTNStack>node;
      node_.node = addSizes(node_.node);
      if (
        node_.node.ver_len !== undefined &&
        node_.node.hor_len !== undefined
      ) {
        node.ver_len_unpadded += node_.node.ver_len;
        node.ver_len += node.ver_len_unpadded + 2 * PAD_SIZE;
        node.hor_len_unpadded += node_.node.hor_len + FUNC_ARG_SIZE;
        node.hor_len += node.hor_len_unpadded + 2 * PAD_SIZE;
      } else {
        throw new Error(`Could not size node ${node} as nstack node`);
      }
      break;
    }
    case "nstack1": {
      let node_ = <ast.ASTNStack1>node;
      node_.node = addSizes(node_.node);
      if (
        node_.node.ver_len !== undefined &&
        node_.node.hor_len !== undefined
      ) {
        node.ver_len_unpadded += node_.node.ver_len;
        node.ver_len += node.ver_len_unpadded + 2 * PAD_SIZE;
        node.hor_len_unpadded += node_.node.hor_len + FUNC_ARG_SIZE;
        node.hor_len += node.hor_len_unpadded + 2 * PAD_SIZE;
      } else {
        throw new Error(`Could not size node ${node} as nstack1 node`);
      }
      break;
    }
    case "cast": {
      let node_ = <ast.ASTCast>node;
      let inner_node = addSizes(node_.node);
      if (
        inner_node.ver_len !== undefined &&
        inner_node.hor_len !== undefined
      ) {
        node.ver_len_unpadded += inner_node.ver_len;
        node.ver_len += node.ver_len_unpadded + 2 * PAD_SIZE;
        node.hor_len_unpadded += inner_node.hor_len;
        node.hor_len += node.hor_len_unpadded + 2 * CAST_SIZE;
      }
      break;
    }
    case "function": {
      let node_ = <ast.ASTFunc>node;
      for (let arg of node_.args) {
        if (NUMBER_KINDS.includes(arg.kind)) {
          node.hor_len_unpadded += FUNC_ARG_SIZE;
          node.hor_len += FUNC_ARG_SIZE;
        } else {
          let arg_ = <ast.ASTNode>arg;
          arg_ = addSizes(arg_);
          if (arg_.ver_len !== undefined && arg_.hor_len !== undefined) {
            node.ver_len += arg_.ver_len;
            node.hor_len += arg_.hor_len;
            node.hor_len_unpadded += arg_.hor_len;
            node.ver_len_unpadded += arg_.ver_len;
          } else {
            throw new Error(`could not size arg ${arg_} while sizing function`);
          }
        }
      }
      node.hor_len_unpadded += FUNC_ARG_SIZE;
      node.hor_len +=
        (node_.args.length + 1) * PAD_SIZE + node.hor_len_unpadded;
      node.ver_len += 2 * PAD_SIZE;
      break;
    }
    case "propto": {
      let node_ = <ast.ASTPropTo>node;
      let sleft = addSizes(node_.l);
      let sright = addSizes(node_.r);
      if (sleft.ver_len !== undefined && sright.ver_len !== undefined) {
        node.ver_len_unpadded += Math.max(sleft.ver_len, sright.ver_len);
        node.ver_len += node.ver_len_unpadded + 2 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as propto node: horizontal len`
        );
      }
      if (sleft.hor_len !== undefined && sright.hor_len !== undefined) {
        node.hor_len_unpadded += sleft.hor_len + sright.hor_len + PROPTO_SIZE;
        node.hor_len += node.hor_len_unpadded + 4 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as propto node: vertical len`
        );
      }
      break;
    }
    case "nwire": {
      let snode: ast.ASTConst = {
        kind: "const",
        val: ast.ZXConst.Wire,
      };
      snode = <ast.ASTConst>addSizes(snode);
      if (snode.ver_len !== undefined && snode.hor_len !== undefined) {
        node.ver_len += snode.ver_len;
        node.ver_len_unpadded += snode.ver_len;
        node.hor_len_unpadded += snode.hor_len;
        node.hor_len += snode.hor_len;
      } else {
        throw new Error(`Could not size node ${node} as nwire node`);
      }
      break;
    }
    default: {
      throw new Error(`Unknown kind: ${node.kind}`);
    }
  }
  node = addSizesHappyRobot(node);
  return node;
}

export function determineCanvasWidthHeight(
  node: ast.ASTNode
): [number, number] {
  const max_width = node.hor_len!;
  const max_height = node.ver_len!;
  let ver = SCALE - (max_height % SCALE) + max_height + 2 * HOR_PAD;
  let hor = SCALE - (max_width % SCALE) + max_width + 2 * VER_PAD;
  return [hor, ver];
}
