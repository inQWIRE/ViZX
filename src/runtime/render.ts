import * as ast from "../parsing/ast";
import {
  STACK_DASH,
  COMPOSE_DASH,
  CAST_DASH,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TEXT_PAD_SIZE,
  CAP,
  CUP,
  BOX,
  WIRE,
  SWAP,
  EMPTY,
  PAD_SIZE,
  setCanvasWidthHeight,
  boundary,
  PROP_TO,
  PROPTO_DASH,
  PROPTO_SIZE,
  COLORSWAP_TRANSFORM,
  ADJOINT_TRANSFORM,
  CONJUGATE_TRANSFORM,
  TRANSPOSE_TRANSFORM,
  FUNCTION_DASH,
  NUMBER_KINDS,
  FUNC_ARG_SIZE,
  STACK_OP,
  N_STACK_OP,
  N_STACK_1_OP,
} from "../constants/consts";
import {
  findCenter,
  findLeftCenter,
  findRightCenter,
  findBottomCenter,
  findTopCenter,
} from "../parsing/coords";
import { quad } from "../constants/types";
import { determineCanvasWidthHeight } from "../parsing/sizes";

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;
// // colors
const white = "#FFFFFF";
const black = "#000000";
const red = "#FFA4A4";
const green = "#A4FFA4";
const gray = "#787878";
// just for testing
// canvas.width = CANVAS_WIDTH;
// canvas.height = CANVAS_HEIGHT;
// canvas_format();

function drawFunctionNode(node: ast.ASTNode) {
  let func = <ast.ASTFunc>node;
  let bound = node.boundary!;
  let f_bound = JSON.parse(JSON.stringify(bound));
  bound.tl.x += FUNC_ARG_SIZE;
  bound.bl.x += FUNC_ARG_SIZE;
  drawFuncBoundary(bound);
  f_bound.tr.x = f_bound.tl.x + FUNC_ARG_SIZE;
  f_bound.br.x = f_bound.bl.x + FUNC_ARG_SIZE;
  drawBoundary(f_bound, FUNCTION_DASH);
  text_format("function", func.fname);
  let cent = findCenter(f_bound);
  ctx.fillText(func.fname, cent.x, cent.y);
  bound.tl.y += PAD_SIZE;
  bound.tr.y += PAD_SIZE;
  bound.bl.y += PAD_SIZE;
  bound.br.y -= PAD_SIZE;
  for (let arg of func.args) {
    bound.tl.x += PAD_SIZE;
    bound.bl.x += PAD_SIZE;
    if (NUMBER_KINDS.includes(arg.kind)) {
      let arg_ = <ast.Num>arg;
      bound.tr.x = bound.tl.x + FUNC_ARG_SIZE;
      bound.br.x = bound.bl.x + FUNC_ARG_SIZE;
      text_format("function", arg_.expr);
      let cent = findCenter(bound);
      ctx.fillText(arg_.expr, cent.x, cent.y);
      bound.tl.x = bound.tr.x;
      bound.bl.x = bound.br.x;
    } else {
      let arg_ = <ast.ASTNode>arg;
      bound.tr.x = bound.tl.x + arg_.hor_len!;
      bound.br.x = bound.bl.x + arg_.ver_len!;
      draw(arg_);
      bound.tl.x = bound.tr.x;
      bound.bl.x = bound.br.x;
    }
    bound.tl.x += PAD_SIZE;
    bound.bl.x += PAD_SIZE;
  }
}

function drawTransformNode(node: ast.ASTNode) {
  let transform = <ast.ASTTransform>node;
  let label_bound = JSON.parse(JSON.stringify(transform.boundary!));
  label_bound.tr.x = label_bound.tl.x + FUNC_ARG_SIZE;
  label_bound.br.x = label_bound.bl.x + FUNC_ARG_SIZE;
  drawBoundary(label_bound, FUNCTION_DASH);
  let bound = JSON.parse(JSON.stringify(transform.boundary!));
  bound.tl.x += FUNC_ARG_SIZE;
  bound.bl.x += FUNC_ARG_SIZE;
  drawFuncBoundary(bound);
  draw(transform.node);
  text_format("transform", TRANSPOSE_TRANSFORM);
  let cent = findCenter(label_bound);
  switch (transform.transform) {
    case ast.MTransform.ColorSwap: {
      ctx.fillText(COLORSWAP_TRANSFORM, cent.x, cent.y);
      break;
    }
    case ast.MTransform.Adjoint: {
      ctx.fillText(ADJOINT_TRANSFORM, cent.x, cent.y);
      break;
    }
    case ast.MTransform.Conjugate: {
      ctx.fillText(CONJUGATE_TRANSFORM, cent.x, cent.y);
      break;
    }
    case ast.MTransform.Transpose: {
      ctx.fillText(TRANSPOSE_TRANSFORM, cent.x, cent.y);
      break;
    }
    default: {
      throw new Error(`could not match transform type ${transform}`);
    }
  }
}

function drawPropToNode(node: ast.ASTNode) {
  let propto = <ast.ASTPropTo>node;
  // drawBoundary(node.boundary!, propto_dash);
  draw(propto.l);
  draw(propto.r);
  text_format("propto", PROP_TO);
  ctx.fillText(
    PROP_TO,
    propto.l.boundary!.tr.x + PAD_SIZE + 0.5 * PROPTO_SIZE,
    findCenter(boundary).y
  );
}

function drawNWireNode(node: ast.ASTNode) {
  let nwire = <ast.ASTNWire>node;
  drawBoundary(node.boundary!);
  let center = findCenter(node.boundary!);
  text_format("nwire", nwire.n.expr);
  ctx.fillText(nwire.n.expr, center.x, center.y);
  ctx.setLineDash([]);
  ctx.strokeStyle = black;
  ctx.moveTo(node.boundary!.tl.x + PAD_SIZE, node.boundary!.tl.y + PAD_SIZE);
  ctx.lineTo(node.boundary!.tr.x - PAD_SIZE, node.boundary!.tr.y + PAD_SIZE);
  ctx.moveTo(node.boundary!.bl.x + PAD_SIZE, node.boundary!.bl.y - PAD_SIZE);
  ctx.lineTo(node.boundary!.br.x - PAD_SIZE, node.boundary!.br.y - PAD_SIZE);
  ctx.stroke();
  text_format("nwire_dots", ".");
  ctx.fillText(".", center.x, center.y + 1.5 * TEXT_PAD_SIZE);
  ctx.fillText(".", center.x, center.y - 1.5 * TEXT_PAD_SIZE);
  ctx.fillText(".", center.x, center.y + 2 * TEXT_PAD_SIZE);
  ctx.fillText(".", center.x, center.y - 2 * TEXT_PAD_SIZE);
  ctx.fillText(".", center.x, center.y + 2.5 * TEXT_PAD_SIZE);
  ctx.fillText(".", center.x, center.y - 2.5 * TEXT_PAD_SIZE);
  ctx.fillText(".", center.x, center.y + 3 * TEXT_PAD_SIZE);
  ctx.fillText(".", center.x, center.y - 3 * TEXT_PAD_SIZE);
}

function drawStackNode(node: ast.ASTNode) {
  let stack = <ast.ASTStack>node;
  draw(stack.left);
  draw(stack.right);
  drawBoundary(node.boundary!, STACK_DASH);
}

function drawNStackNode(node: ast.ASTNode) {
  let nstack = <ast.ASTNStack>node;
  draw(nstack.node);
  let label_bound = JSON.parse(JSON.stringify(nstack.boundary!));
  label_bound.tr.x = label_bound.tl.x + FUNC_ARG_SIZE;
  label_bound.br.x = label_bound.bl.x + FUNC_ARG_SIZE;
  drawBoundary(label_bound, FUNCTION_DASH);
  let bound = JSON.parse(JSON.stringify(nstack.boundary!));
  bound.tl.x += FUNC_ARG_SIZE;
  bound.bl.x += FUNC_ARG_SIZE;
  drawFuncBoundary(bound);
  text_format("nstack", nstack.n.expr);
  let cent = findCenter(label_bound);
  ctx.fillText(nstack.n.expr.concat(N_STACK_OP), cent.x, cent.y);
}

function drawNStack1Node(node: ast.ASTNode) {
  let nstack = <ast.ASTNStack>node;
  draw(nstack.node);
  let label_bound = JSON.parse(JSON.stringify(nstack.boundary!));
  label_bound.tr.x = label_bound.tl.x + FUNC_ARG_SIZE;
  label_bound.br.x = label_bound.bl.x + FUNC_ARG_SIZE;
  drawBoundary(label_bound, FUNCTION_DASH);
  let bound = JSON.parse(JSON.stringify(nstack.boundary!));
  bound.tl.x += FUNC_ARG_SIZE;
  bound.bl.x += FUNC_ARG_SIZE;
  drawFuncBoundary(bound);
  text_format("nstack", nstack.n.expr);
  let cent = findCenter(label_bound);
  ctx.fillText(nstack.n.expr.concat(N_STACK_1_OP), cent.x, cent.y);
}

function drawBoundary(boundary: quad, dash?: [number, number]) {
  if (dash !== undefined) {
    ctx.setLineDash(dash);
  } else {
    ctx.setLineDash([]);
  }
  ctx.strokeStyle = black;
  ctx.beginPath();
  ctx.moveTo(boundary.tl.x, boundary.tl.y);
  ctx.lineTo(boundary.tr.x, boundary.tr.y);
  ctx.lineTo(boundary.br.x, boundary.br.y);
  ctx.lineTo(boundary.bl.x, boundary.bl.y);
  ctx.closePath();
  ctx.stroke();
  return;
}

function drawFuncBoundary(boundary: quad) {
  ctx.setLineDash([]);
  ctx.strokeStyle = black;
  ctx.beginPath();
  ctx.moveTo(boundary.tl.x + PAD_SIZE, boundary.tl.y);
  ctx.lineTo(boundary.tl.x, boundary.tl.y);
  ctx.lineTo(boundary.bl.x, boundary.bl.y);
  ctx.lineTo(boundary.bl.x + PAD_SIZE, boundary.bl.y);
  ctx.stroke();

  ctx.strokeStyle = black;
  ctx.moveTo(boundary.tr.x - PAD_SIZE, boundary.tr.y);
  ctx.lineTo(boundary.tr.x, boundary.tr.y);
  ctx.lineTo(boundary.br.x, boundary.br.y);
  ctx.lineTo(boundary.br.x - PAD_SIZE, boundary.br.y);
  ctx.stroke();
  return;
}

function drawComposeNode(node: ast.ASTNode) {
  let compose = <ast.ASTCompose>node;
  draw(compose.left);
  draw(compose.right);
  drawBoundary(node.boundary!, COMPOSE_DASH);
}

function drawCastNode(node: ast.ASTNode) {
  let cast = <ast.ASTCast>node;
  draw(cast.node);
  drawBoundary(cast.boundary!, CAST_DASH);
  let lc = findLeftCenter(cast.boundary!);
  let rc = findRightCenter(cast.boundary!);
  text_format("cast_in_background", cast.m.expr);
  const in_arr = Array(cast.m.expr.length).fill("█").join();
  ctx.fillText(in_arr, cast.node.boundary!.tl.x - TEXT_PAD_SIZE, lc.y);
  text_format("cast_in", cast.m.expr);
  ctx.fillText(cast.m.expr, cast.node.boundary!.tl.x - TEXT_PAD_SIZE, lc.y);
  text_format("cast_out_background", cast.n.expr);
  const out_arr = Array(cast.n.expr.length).fill("█").join();
  ctx.fillText(out_arr, cast.node.boundary!.tr.x - TEXT_PAD_SIZE, rc.y);
  text_format("cast_out", cast.n.expr);
  ctx.fillText(cast.n.expr, cast.node.boundary!.tr.x + TEXT_PAD_SIZE, rc.y);
}

function drawBaseNode(node: ast.ASTNode) {
  ctx.fillStyle = white;
  ctx.setLineDash([]);
  ctx.strokeStyle = black;
  let inputs: string;
  let outputs: string;
  let alpha: string;
  switch (node.kind) {
    case "spider": {
      let spider = <ast.ASTSpider>node;
      if (spider.val === "Z") {
        ctx.fillStyle = green;
      }
      if (spider.val === "X") {
        ctx.fillStyle = red;
      }
      inputs = spider.in.expr;
      outputs = spider.out.expr;
      alpha = spider.alpha.expr;
      break;
    }
    case "const": {
      ctx.fillStyle = white;
      let zxconst = <ast.ASTConst>node;
      switch (zxconst.val) {
        case ast.ZXConst.Wire: {
          inputs = "1";
          outputs = "1";
          alpha = WIRE;
          break;
        }
        case ast.ZXConst.Box: {
          inputs = "1";
          outputs = "1";
          alpha = BOX;
          break;
        }
        case ast.ZXConst.Cap: {
          inputs = "0";
          outputs = "2";
          alpha = CAP;
          break;
        }
        case ast.ZXConst.Cup: {
          inputs = "2";
          outputs = "0";
          alpha = CUP;
          break;
        }
        case ast.ZXConst.Empty: {
          inputs = "0";
          outputs = "0";
          alpha = EMPTY;
          break;
        }
        case ast.ZXConst.Swap: {
          inputs = "2";
          outputs = "2";
          alpha = SWAP;
          break;
        }
        default: {
          throw new Error(`unknown const ${node} in drawBaseNode`);
        }
      }
      break;
    }
    case "var": {
      let node_ = <ast.ASTVar>node;
      inputs = "";
      outputs = "";
      alpha = node_.val;
      break;
    }
    default: {
      throw new Error(`unknown base node ${node} in drawBaseNode`);
    }
  }
  ctx.beginPath();
  ctx.moveTo(node.boundary!.tl.x, node.boundary!.tl.y);
  ctx.lineTo(node.boundary!.tr.x, node.boundary!.tr.y);
  ctx.lineTo(node.boundary!.br.x, node.boundary!.br.y);
  ctx.lineTo(node.boundary!.bl.x, node.boundary!.bl.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  let center = findCenter(node.boundary!);
  let left = findLeftCenter(node.boundary!);
  let right = findRightCenter(node.boundary!);
  text_format("spider_alpha", alpha);
  ctx.strokeText(alpha, center.x, center.y);
  ctx.save();
  ctx.translate(right.x - TEXT_PAD_SIZE, right.y);
  ctx.rotate(-Math.PI / 2);
  text_format("spider_in_out", outputs);
  ctx.fillText(outputs, 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(left.x + TEXT_PAD_SIZE, left.y);
  ctx.rotate(Math.PI / 2);
  text_format("spider_in_out", inputs);
  ctx.fillText(inputs, 0, 0);
  ctx.restore();
}

function wrapText(text: string, x: number, y: number, max_width: number) {}

function text_format(loc: string, text: string) {
  switch (loc) {
    case "spider_in_out": {
      ctx.font = "10px Arial";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = gray;
      break;
    }
    case "spider_alpha": {
      ctx.font = "15px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    case "stack_compose": {
      ctx.font = "15px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "blue";
      break;
    }
    case "cast_in": {
      ctx.font = "10px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      break;
    }
    case "cast_out": {
      ctx.font = "10px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      break;
    }
    case "cast_in_background": {
      ctx.font = "10px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      break;
    }
    case "cast_out_background": {
      ctx.font = "10px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      break;
    }
    case "nwire": {
      ctx.font = "15px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      break;
    }
    case "nwire_dots": {
      ctx.font = "15px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "black";
      break;
    }
    case "propto": {
      ctx.font = "50px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      break;
    }
    case "transform": {
      ctx.font = "15px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      break;
    }
    case "nstack": {
      ctx.font = "15px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      break;
    }
    case "function": {
      ctx.font = "15px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      break;
    }
    default: {
      ctx.font = "15px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      break;
    }
  }
}

function draw(node: ast.ASTNode) {
  switch (node.kind) {
    case "spider": {
      drawBaseNode(node);
      break;
    }
    case "var": {
      drawBaseNode(node);
    }
    case "const": {
      drawBaseNode(node);
      break;
    }
    case "stack": {
      drawStackNode(node);
      break;
    }
    case "compose": {
      drawComposeNode(node);
      break;
    }
    case "nstack": {
      drawNStackNode(node);
      break;
    }
    case "nstack1": {
      drawNStack1Node(node);
      break;
    }
    case "cast": {
      drawCastNode(node);
      break;
    }
    case "nwire": {
      drawNWireNode(node);
      break;
    }
    case "propto": {
      drawPropToNode(node);
      break;
    }
    case "transform": {
      drawTransformNode(node);
      break;
    }
    case "function": {
      drawFunctionNode(node);
      break;
    }
    default: {
      console.log("unkown kind in render, ", node.kind);
      throw new Error("unknown kind in render");
    }
  }
}

function render(this: Window, msg: MessageEvent<any>) {
  let command = msg.data.command;
  let node: ast.ASTNode = JSON.parse(command);
  setCanvasWidthHeight(determineCanvasWidthHeight(node));
  canvas_format();
  draw(node);
}

function canvas_format() {
  console.log("setting width, height in render: ", CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  ctx.fillStyle = white;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = black;
}

window.addEventListener("message", render);

// esbuild auto reload
new EventSource("/esbuild").addEventListener("change", () => location.reload());
