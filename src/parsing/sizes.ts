import * as ast from "./ast";
import { N_STACK_1_OP, NUMBER_KINDS } from "../constants/consts";
import {
  HOR_PAD,
  VER_PAD,
  BASE_SIZE,
  CAST_SIZE,
  PAD_SIZE,
  PROPTO_SIZE,
  FUNC_ARG_SIZE,
  SCALE,
} from "../constants/variableconsts";

export function addSizesHappyRobot(node: ast.ASTNode): ast.ASTNode {
  switch (node.kind) {
    case "compose": {
      let node_ = <ast.ASTCompose>node;
      if (node_.ver_len === undefined || node_.hor_len === undefined) {
        throw new Error(`length undefined in second sizing\n`);
      }
      let desired_hor = node_.hor_len - 3 * PAD_SIZE;
      let desired_ver = node_.ver_len - 2 * PAD_SIZE;
      let sleft = JSON.parse(JSON.stringify(node_.left));
      let sright = JSON.parse(JSON.stringify(node_.right));
      node_.left.hor_len = Number(
        (
          (sleft.hor_len! /
            Number((sleft.hor_len! + sright.hor_len!).toFixed(0))) *
          desired_hor
        ).toFixed(0)
      );
      node_.right.hor_len = Number(
        (
          (sright.hor_len! /
            Number((sleft.hor_len! + sright.hor_len!).toFixed(0))) *
          desired_hor
        ).toFixed(0)
      );
      node_.left.ver_len = desired_ver;
      node_.right.ver_len = desired_ver;
      node_.left = addSizesHappyRobot(node_.left);
      node_.right = addSizesHappyRobot(node_.right);
      node = node_;
      break;
    }
    // case "plus": {
    //   let node_ = <ast.ASTPlus>node;
    //   if (node_.ver_len === undefined || node_.hor_len === undefined) {
    //     throw new Error(`length undefined in second sizing\n`);
    //   }
    //   let desired_hor = node_.hor_len - 3 * PAD_SIZE;
    //   let desired_ver = node_.ver_len - 2 * PAD_SIZE;
    //   let sleft = JSON.parse(JSON.stringify(node_.left));
    //   let sright = JSON.parse(JSON.stringify(node_.right));
    //   node_.left.hor_len = Number(
    //     (
    //       (sleft.hor_len! /
    //         Number((sleft.hor_len! + sright.hor_len!).toFixed(0))) *
    //       desired_hor
    //     ).toFixed(0)
    //   );
    //   node_.right.hor_len = Number(
    //     (
    //       (sright.hor_len! /
    //         Number((sleft.hor_len! + sright.hor_len!).toFixed(0))) *
    //       desired_hor
    //     ).toFixed(0)
    //   );
    //   node_.left.ver_len = desired_ver;
    //   node_.right.ver_len = desired_ver;
    //   node_.left = addSizesHappyRobot(node_.left);
    //   node_.right = addSizesHappyRobot(node_.right);
    //   node = node_;
    //   break;
    // }
    case "stack": {
      let node_ = <ast.ASTStack>node;
      if (node_.ver_len === undefined || node_.hor_len === undefined) {
        throw new Error(`length undefined in second sizing\n`);
      }
      let desired_hor = node_.hor_len - 2 * PAD_SIZE;
      let desired_ver = node_.ver_len - 3 * PAD_SIZE;
      let sleft = JSON.parse(JSON.stringify(node_.left));
      let sright = JSON.parse(JSON.stringify(node_.right));
      node_.left.hor_len = desired_hor;
      node_.right.hor_len = desired_hor;
      node_.left.ver_len = Number(
        (
          (sleft.ver_len! /
            Number((sleft.ver_len! + sright.ver_len!).toFixed(0))) *
          desired_ver
        ).toFixed(0)
      );
      node_.right.ver_len = Number(
        (
          (sright.ver_len! /
            Number((sleft.ver_len! + sright.ver_len!).toFixed(0))) *
          desired_ver
        ).toFixed(0)
      );
      node_.left = addSizesHappyRobot(node_.left);
      node_.right = addSizesHappyRobot(node_.right);
      node = node_;
      break;
    }
    case "nstack": {
      let node_ = <ast.ASTNStack>node;
      if (node_.ver_len === undefined || node_.hor_len === undefined) {
        throw new Error(`length undefined in second sizing\n`);
      }
      let desired_hor = node_.hor_len - 2 * PAD_SIZE - FUNC_ARG_SIZE;
      let desired_ver = node_.ver_len - 2 * PAD_SIZE;
      node_.node.hor_len = desired_hor;
      node_.node.ver_len = desired_ver;
      node_.node = addSizesHappyRobot(node_.node);
      node = node_;
      break;
    }
    case "nstack1": {
      let node_ = <ast.ASTNStack1>node;
      if (node_.ver_len === undefined || node_.hor_len === undefined) {
        throw new Error(`length undefined in second sizing\n`);
      }
      let desired_hor = node_.hor_len - 2 * PAD_SIZE - FUNC_ARG_SIZE;
      let desired_ver = node_.ver_len - 2 * PAD_SIZE;
      node_.node.hor_len = desired_hor;
      node_.node.ver_len = desired_ver;
      node_.node = addSizesHappyRobot(node_.node);
      node = node_;
      break;
    }
    default: {
      break;
    }
  }
  // console.log("happy robot! ", node);
  return node;
}
export function addSizes(node: ast.ASTNode): ast.ASTNode {
  node.hor_len = 0;
  node.ver_len = 0;
  switch (node.kind) {
    case "transform": {
      let node_ = <ast.ASTTransform>node;
      let snode = addSizes(node_.node);
      if (snode.hor_len !== undefined && snode.ver_len !== undefined) {
        node.hor_len += snode.hor_len + FUNC_ARG_SIZE;
        +2 * PAD_SIZE;
        node.ver_len += snode.ver_len + 2 * PAD_SIZE;
      }
      break;
    }
    case "scale": {
      let node_ = <ast.ASTScale>node;
      let snode = addSizes(node_.node);
      if (snode.hor_len !== undefined && snode.ver_len !== undefined) {
        node.hor_len += snode.hor_len + 
          Math.max(0.3 * PROPTO_SIZE * (node_.coefficient.expr.length + 3) + PAD_SIZE,
            FUNC_ARG_SIZE);
        node.ver_len += snode.ver_len + 2 * PAD_SIZE;
      }
      break;
    }
    case "const": {
      node.hor_len = BASE_SIZE;
      node.ver_len = BASE_SIZE;
      break;
    }
    case "spider": {
      node.hor_len = BASE_SIZE;
      node.ver_len = BASE_SIZE;
      break;
    }
    case "var": {
      node.hor_len = BASE_SIZE;
      node.ver_len = BASE_SIZE;
      break;
    }
    case "stack": {
      let node_ = <ast.ASTStack>node;
      let sleft = addSizes(node_.left);
      let sright = addSizes(node_.right);
      if (sleft.hor_len !== undefined && sright.hor_len !== undefined) {
        node.hor_len += Math.max(sleft.hor_len, sright.hor_len) + 2 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as stack node: horizontal len`
        );
      }
      if (sleft.ver_len !== undefined && sright.ver_len !== undefined) {
        node.ver_len +=
          sleft.ver_len + sright.ver_len + PAD_SIZE + 2 * PAD_SIZE;
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
        node.ver_len += Math.max(sleft.ver_len, sright.ver_len) + 2 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as compose node: horizontal len`
        );
      }
      if (sleft.hor_len !== undefined && sright.hor_len !== undefined) {
        node.hor_len +=
          sleft.hor_len + sright.hor_len + PAD_SIZE + 2 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as compose node: vertical len`
        );
      }
      break;
    }
    // case "plus": {
    //   let node_ = <ast.ASTPlus>node;
    //   let sleft = addSizes(node_.left);
    //   let sright = addSizes(node_.right);
    //   if (sleft.ver_len !== undefined && sright.ver_len !== undefined) {
    //     node.ver_len += Math.max(sleft.ver_len, sright.ver_len) + 2 * PAD_SIZE;
    //   } else {
    //     throw new Error(
    //       `Could not size children of ${node} as plus node: horizontal len`
    //     );
    //   }
    //   if (sleft.hor_len !== undefined && sright.hor_len !== undefined) {
    //     node.hor_len +=
    //       sleft.hor_len + sright.hor_len + PAD_SIZE + 4 * PAD_SIZE;
    //   } else {
    //     throw new Error(
    //       `Could not size children of ${node} as plus node: vertical len`
    //     );
    //   }
    //   break;
    // }
    case "nstack": {
      let node_ = <ast.ASTNStack>node;
      node_.node = addSizes(node_.node);
      if (
        node_.node.ver_len !== undefined &&
        node_.node.hor_len !== undefined
      ) {
        node.ver_len += node_.node.ver_len + 2 * PAD_SIZE;
        node.hor_len += node_.node.hor_len + FUNC_ARG_SIZE + 2 * PAD_SIZE;
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
        node.ver_len += node_.node.ver_len + 2 * PAD_SIZE;
        node.hor_len += node_.node.hor_len + FUNC_ARG_SIZE + 2 * PAD_SIZE;
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
        node.ver_len += inner_node.ver_len + 2 * PAD_SIZE;
        node.hor_len += inner_node.hor_len + 2 * CAST_SIZE;
      }
      break;
    }
    case "function": {
      let node_ = <ast.ASTFunc>node;
      for (let arg of node_.args) {
        if (NUMBER_KINDS.includes(arg.kind)) {
          node.hor_len += FUNC_ARG_SIZE;
        } else {
          let arg_ = <ast.ASTNode>arg;
          arg_ = addSizes(arg_);
          if (arg_.ver_len !== undefined && arg_.hor_len !== undefined) {
            node.ver_len += arg_.ver_len;
            node.hor_len += arg_.hor_len;
          } else {
            throw new Error(`could not size arg ${arg_} while sizing function`);
          }
        }
      }
      node.hor_len += FUNC_ARG_SIZE + (node_.args.length + 1) * PAD_SIZE;
      node.ver_len += 2 * PAD_SIZE;
      break;
    }
    case "propto": {
      let node_ = <ast.ASTPropTo>node;
      let sleft = addSizes(node_.l);
      let sright = addSizes(node_.r);
      if (sleft.ver_len !== undefined && sright.ver_len !== undefined) {
        node.ver_len += Math.max(sleft.ver_len, sright.ver_len) + 2 * PAD_SIZE;
      } else {
        throw new Error(
          `Could not size children of ${node} as propto node: horizontal len`
        );
      }
      if (sleft.hor_len !== undefined && sright.hor_len !== undefined) {
        if (node_.specialization.length > 1) {
          node.hor_len +=
            sleft.hor_len +
            sright.hor_len +
            PROPTO_SIZE +
            0.3 * PROPTO_SIZE * node_.specialization.length +
            4 * PAD_SIZE;
        }
        else {
          node.hor_len +=
            sleft.hor_len +
            sright.hor_len +
            1.5 * PROPTO_SIZE +
            1.5 * PROPTO_SIZE * node_.specialization.length +
            4 * PAD_SIZE;
        }
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
  // console.log("before happy robot: ", node);
  node = addSizesHappyRobot(node);
  // console.log("after happy robot: ", node);
  return node;
}

export function determineCanvasWidthHeight(
  node: ast.ASTNode
): [number, number] {
  const max_width = node.hor_len!;
  const max_height = node.ver_len!;
  console.log("max width; ", max_width, "max_height; ", max_height);
  let ver = max_height + 2 * HOR_PAD;
  let hor = max_width + 2 * VER_PAD;
  console.log("hor; ", hor, "ver; ", ver);
  return [hor, ver];
}
