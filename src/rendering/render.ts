import * as ast from "../parsing/ast";
import {
  CAP,
  CUP,
  BOX,
  WIRE,
  SWAP,
  EMPTY,
  PROP_TO,
  COLORSWAP_TRANSFORM,
  ADJOINT_TRANSFORM,
  CONJUGATE_TRANSFORM,
  TRANSPOSE_TRANSFORM,
  NUMBER_KINDS,
  N_STACK_OP,
  N_STACK_1_OP,
  SCALE_OP,
  // ZX_PLUS_OP,
} from "../constants/consts";
import {
  LINE_WIDTH,
  FUNCTION_DASH,
  STACK_DASH,
  COMPOSE_DASH,
  CAST_DASH,
  PAD_SIZE,
  setCanvasWidthHeight,
  boundary,
  PROPTO_SIZE,
  CAST_SIZE,
  FUNC_ARG_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LHS_CANVAS_WIDTH,
  LHS_CANVAS_HEIGHT,
  RHS_CANVAS_WIDTH,
  RHS_CANVAS_HEIGHT,
  TEXT_PAD_SIZE,
  DOTS_PAD_SIZE,
  LARGE_TEXT,
  MONOSPACE_FONT,
  MEDIUM_TEXT,
  MEDIUM_LARGE_TEXT,
  SMALL_TEXT,
  ARIAL_FONT,
  REALLY_SMALL_TEXT,
  COLOR_DICT,
  setLHSCanvasWidthHeight,
  setRHSCanvasWidthHeight,
} from "../constants/variableconsts";
import { addCoords, findCenter, findLeftCenter, findRightCenter, makeAtCenter } from "../parsing/coords";
import { quad } from "../constants/types";
import { determineCanvasWidthHeight } from "../parsing/sizes";

const canvas : HTMLCanvasElement = document.querySelector("#canvas")!;
const ctx = canvas.getContext("2d")!;
ctx.lineWidth = LINE_WIDTH;

const lhscanvas : HTMLCanvasElement = document.querySelector("#lhscanvas")!;
const lhsctx = lhscanvas.getContext("2d")!;
lhsctx.lineWidth = LINE_WIDTH;
const rhscanvas : HTMLCanvasElement = document.querySelector("#rhscanvas")!;
const rhsctx = rhscanvas.getContext("2d")!;
rhsctx.lineWidth = LINE_WIDTH;
// // colors
const white = "#FFFFFF";
const black = "#000000";
const red = "#FFA4A4";
const green = "#A4FFA4";
const gray = "#303030";
const white_trans = "rgba(255, 255, 255, 0.5)";
// just for testing
// canvas.width = CANVAS_WIDTH;
// canvas.height = CANVAS_HEIGHT;
// canvas_format();

function drawFunctionNode(ctx:CanvasRenderingContext2D, node: ast.ASTNode) {
  let func = <ast.ASTFunc>node;
  let bound = node.boundary!;
  let f_bound = JSON.parse(JSON.stringify(bound));
  bound.tl.x += FUNC_ARG_SIZE;
  bound.bl.x += FUNC_ARG_SIZE;
  drawFuncBoundary(ctx, bound);
  f_bound.tr.x = f_bound.tl.x + FUNC_ARG_SIZE;
  f_bound.br.x = f_bound.bl.x + FUNC_ARG_SIZE;
  drawBoundary(ctx, f_bound, FUNCTION_DASH);
  text_format(ctx, "function", func.fname);
  let cent = findCenter(f_bound);
  ctx.fillText(func.fname, cent.x, cent.y);
  bound.tl.y += PAD_SIZE;
  bound.tr.y += PAD_SIZE;
  bound.bl.y -= PAD_SIZE;
  bound.br.y -= PAD_SIZE;
  for (let arg of func.args) {
    bound.tl.x += PAD_SIZE;
    bound.bl.x += PAD_SIZE;
    if (NUMBER_KINDS.includes(arg.kind)) {
      let arg_ = <ast.Num>arg;
      bound.tr.x = bound.tl.x + FUNC_ARG_SIZE;
      bound.br.x = bound.bl.x + FUNC_ARG_SIZE;
      text_format(ctx, "function", arg_.expr);
      let cent = findCenter(bound);
      ctx.fillText(arg_.expr, cent.x, cent.y);
      bound.tl.x = bound.tr.x;
      bound.bl.x = bound.br.x;
    } else {
      let arg_ = <ast.ASTNode>arg;
      bound.tr.x = bound.tl.x + arg_.hor_len!;
      bound.br.x = bound.bl.x + arg_.ver_len!;
      draw(ctx, arg_);
      bound.tl.x = bound.tr.x;
      bound.bl.x = bound.br.x;
    }
    bound.tl.x += PAD_SIZE;
    bound.bl.x += PAD_SIZE;
  }
}

function drawTransformNode(ctx:CanvasRenderingContext2D, node: ast.ASTNode) {
  let transform = <ast.ASTTransform>node;
  let label_bound = JSON.parse(JSON.stringify(transform.boundary!));
  label_bound.tr.x = label_bound.tl.x + FUNC_ARG_SIZE;
  label_bound.br.x = label_bound.bl.x + FUNC_ARG_SIZE;
  drawBoundary(ctx, label_bound, FUNCTION_DASH);
  let bound = JSON.parse(JSON.stringify(transform.boundary!));
  bound.tl.x += FUNC_ARG_SIZE;
  bound.bl.x += FUNC_ARG_SIZE;
  drawFuncBoundary(ctx, bound);
  draw(ctx, transform.node, true);
  text_format(ctx, "transform", TRANSPOSE_TRANSFORM);
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

// function get_font_size(font : string) : number {
//   let sizes = font.match(/([0-9\.]+)px/g);
//   return parseFloat(sizes![1])
// }

// function set_font_size(size: number, font : string) : string {
//   return font.replace(/([0-9\.]+)px/g, size.toString() + "px")
// }

// function text_format_fit(display_text : string, max_width : number) {
//   let current_width = ctx.measureText(display_text).width;
//   if (current_width <= max_width) {
//     return;
//   }
//   else {
//     let current_size = get_font_size(ctx.font);
//     let new_size = current_size * max_width / current_width;
//     ctx.font = set_font_size(new_size, ctx.font);
//   }
// }

function drawScaleNode(ctx:CanvasRenderingContext2D, node: ast.ASTNode) {
  let scale = <ast.ASTScale>node;
  let display_text = scale.coefficient.expr + " " + SCALE_OP;
  let max_width = Math.max(0.2 * CAST_SIZE * display_text.length + PAD_SIZE, FUNC_ARG_SIZE);
  let label_bound = JSON.parse(JSON.stringify(scale.boundary!));
  label_bound.tr.x = label_bound.tl.x + max_width;
  label_bound.br.x = label_bound.bl.x + max_width;
  drawBoundary(ctx, label_bound, FUNCTION_DASH);
  let bound = JSON.parse(JSON.stringify(scale.boundary!));
  bound.tl.x += max_width;
  bound.bl.x += max_width;
  drawFuncBoundary(ctx, bound);
  draw(ctx, scale.node, true);
  let cent = findCenter(label_bound);
  // text_format("",display_text);
  // text_format_fit(display_text, FUNC_ARG_SIZE);
  // text_format?
  ctx.fillText(display_text, 
      cent.x, cent.y, max_width);
  // ctx.fillText(ctx.measureText(display_text).width.toString() + " " + FUNC_ARG_SIZE.toString() + " " + display_text, 
  //     cent.x, cent.y, FUNC_ARG_SIZE);
}

function drawPropToNode(ctx:CanvasRenderingContext2D, node: ast.ASTNode) {
  let propto = <ast.ASTPropTo>node;
  // drawBoundary(node.boundary!, propto_dash);
  draw(ctx, propto.l, true);
  draw(ctx, propto.r, true);
  if (propto.specialization.length <= 1) {
    text_format(ctx, "propto", PROP_TO + propto.specialization);
  }
  else {
    text_format(ctx, "proptospec", PROP_TO + propto.specialization);
  }
  if (propto.specialization === "=") {
    ctx.fillText(
      PROP_TO,
      (propto.r.boundary!.tl.x + propto.l.boundary!.tr.x) / 2 - 0.75 * PROPTO_SIZE,
      findCenter(boundary).y,
      Math.abs(propto.r.boundary!.tl.x - propto.l.boundary!.tr.x)
    );
    ctx.fillText(
      "=",
      (propto.r.boundary!.tl.x + propto.l.boundary!.tr.x) / 2 + 0.75 * PROPTO_SIZE,
      findCenter(boundary).y + PROPTO_SIZE / 6,
      Math.abs(propto.r.boundary!.tl.x - propto.l.boundary!.tr.x)
    );
  }
  else {
    ctx.fillText(
      PROP_TO + propto.specialization,
      (propto.r.boundary!.tl.x + propto.l.boundary!.tr.x) / 2,
      findCenter(boundary).y,
      Math.abs(propto.r.boundary!.tl.x - propto.l.boundary!.tr.x)
    );
  }
  // text_format("propto", PROP_TO);
  // ctx.fillText(
  //   PROP_TO,
  //   propto.l.boundary!.tr.x + PAD_SIZE + 0.5 * PROPTO_SIZE,
  //   findCenter(boundary).y - 0.5 * PAD_SIZE,
  //   PROPTO_SIZE
  // );
  // text_format("proptospec", propto.specialization);
  // ctx.fillText(
  //   propto.specialization,
  //   propto.l.boundary!.tr.x +
  //   PAD_SIZE +
  //   PROPTO_SIZE +
  //   PROPTO_SIZE * 0.3 * 0.5 * propto.specialization.length,
  //   findCenter(boundary).y
  // );
}

function drawNWireNode(ctx:CanvasRenderingContext2D, node: ast.ASTNode) {
  let nwire = <ast.ASTNWire>node;
  drawBoundary(ctx, node.boundary!);
  let center = findCenter(node.boundary!);
  text_format(ctx, "nwire", nwire.n.expr);
  ctx.fillText(nwire.n.expr, center.x, center.y);
  ctx.setLineDash([]);
  ctx.strokeStyle = black;
  ctx.moveTo(node.boundary!.tl.x + PAD_SIZE, node.boundary!.tl.y + PAD_SIZE);
  ctx.lineTo(node.boundary!.tr.x - PAD_SIZE, node.boundary!.tr.y + PAD_SIZE);
  ctx.moveTo(node.boundary!.bl.x + PAD_SIZE, node.boundary!.bl.y - PAD_SIZE);
  ctx.lineTo(node.boundary!.br.x - PAD_SIZE, node.boundary!.br.y - PAD_SIZE);
  ctx.stroke();
  text_format(ctx, "nwire_dots", ".");
  ctx.fillText(".", center.x, center.y + 1.5 * DOTS_PAD_SIZE);
  ctx.fillText(".", center.x, center.y - 1.5 * DOTS_PAD_SIZE);
  ctx.fillText(".", center.x, center.y + 2 * DOTS_PAD_SIZE);
  ctx.fillText(".", center.x, center.y - 2 * DOTS_PAD_SIZE);
  ctx.fillText(".", center.x, center.y + 2.5 * DOTS_PAD_SIZE);
  ctx.fillText(".", center.x, center.y - 2.5 * DOTS_PAD_SIZE);
  ctx.fillText(".", center.x, center.y + 3 * DOTS_PAD_SIZE);
  ctx.fillText(".", center.x, center.y - 3 * DOTS_PAD_SIZE);
}

function drawStackNode(ctx:CanvasRenderingContext2D, node: ast.ASTNode, preboxed:Boolean=false) {
  let stack = <ast.ASTStack>node;
  if (!preboxed) {
    drawBoundary(ctx, node.boundary!, STACK_DASH, COLOR_DICT[stack.index]);
  }
  draw(ctx, stack.left);
  draw(ctx, stack.right);
}

function drawNStackNode(ctx:CanvasRenderingContext2D, node: ast.ASTNode) {
  let nstack = <ast.ASTNStack>node;
  let label_bound = JSON.parse(JSON.stringify(nstack.boundary!));
  label_bound.tr.x = label_bound.tl.x + FUNC_ARG_SIZE;
  label_bound.br.x = label_bound.bl.x + FUNC_ARG_SIZE;
  drawBoundary(ctx, label_bound, FUNCTION_DASH);
  draw(ctx, nstack.node);
  let bound = JSON.parse(JSON.stringify(nstack.boundary!));
  bound.tl.x += FUNC_ARG_SIZE;
  bound.bl.x += FUNC_ARG_SIZE;
  drawFuncBoundary(ctx, bound);
  text_format(ctx, "nstack", nstack.n.expr);
  let cent = findCenter(label_bound);
  ctx.fillText(nstack.n.expr.concat(N_STACK_OP), cent.x, cent.y);
}

function drawNStack1Node(ctx:CanvasRenderingContext2D, node: ast.ASTNode) {
  let nstack = <ast.ASTNStack>node;
  let label_bound = JSON.parse(JSON.stringify(nstack.boundary!));
  label_bound.tr.x = label_bound.tl.x + FUNC_ARG_SIZE;
  label_bound.br.x = label_bound.bl.x + FUNC_ARG_SIZE;
  drawBoundary(ctx, label_bound, FUNCTION_DASH);
  draw(ctx, nstack.node);
  let bound = JSON.parse(JSON.stringify(nstack.boundary!));
  bound.tl.x += FUNC_ARG_SIZE;
  bound.bl.x += FUNC_ARG_SIZE;
  drawFuncBoundary(ctx, bound);
  text_format(ctx, "nstack", nstack.n.expr);
  let cent = findCenter(label_bound);
  ctx.fillText(nstack.n.expr.concat(N_STACK_1_OP), cent.x, cent.y);
}

function drawBoundary(
  ctx:CanvasRenderingContext2D,
  boundary: quad,
  dash?: [number, number],
  color: string = white,
) {
  if (dash !== undefined) {
    ctx.setLineDash(dash);
  } else {
    ctx.setLineDash([]);
  }
  ctx.lineWidth = LINE_WIDTH;
  ctx.strokeStyle = black;
  console.log("setting fill style in draw boundary, ", color);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(boundary.tl.x, boundary.tl.y);
  ctx.lineTo(boundary.tr.x, boundary.tr.y);
  ctx.lineTo(boundary.br.x, boundary.br.y);
  ctx.lineTo(boundary.bl.x, boundary.bl.y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  return;
}

function drawFuncBoundary(ctx:CanvasRenderingContext2D, boundary: quad) {
  ctx.setLineDash([]);
  ctx.strokeStyle = black;
  ctx.lineWidth = LINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(boundary.tl.x + PAD_SIZE, boundary.tl.y);
  ctx.lineTo(boundary.tl.x, boundary.tl.y);
  ctx.lineTo(boundary.bl.x, boundary.bl.y);
  ctx.lineTo(boundary.bl.x + PAD_SIZE, boundary.bl.y);
  ctx.stroke();

  // ctx.strokeStyle = black;
  ctx.moveTo(boundary.tr.x - PAD_SIZE, boundary.tr.y);
  ctx.lineTo(boundary.tr.x, boundary.tr.y);
  ctx.lineTo(boundary.br.x, boundary.br.y);
  ctx.lineTo(boundary.br.x - PAD_SIZE, boundary.br.y);
  ctx.stroke();
  return;
}

function drawComposeNode(ctx:CanvasRenderingContext2D, node: ast.ASTNode, preboxed:Boolean = false) {
  let compose = <ast.ASTCompose>node;
  if (!preboxed) {
    drawBoundary(ctx, node.boundary!, COMPOSE_DASH, COLOR_DICT[compose.index]);
  }
  draw(ctx, compose.left);
  draw(ctx, compose.right);
}

function drawCastNode(ctx:CanvasRenderingContext2D, node: ast.ASTNode) {
  let cast = <ast.ASTCast>node;
  drawBoundary(ctx, cast.boundary!, CAST_DASH);
  draw(ctx, cast.node, true);
  let lc = findLeftCenter(cast.boundary!);
  let rc = findRightCenter(cast.boundary!);
  ctx.save();
  ctx.translate(cast.node.boundary!.tl.x - CAST_SIZE + 0.5 * TEXT_PAD_SIZE, lc.y);
  let max_width: undefined | number = undefined;
  if (cast.n.expr.length > 2) {
    ctx.rotate(Math.PI / 2);
    max_width = node.ver_len! - 2 * TEXT_PAD_SIZE;
  }
  text_format(ctx, "cast_in_background", cast.n.expr);
  const in_arr = Array(cast.n.expr.length).fill("█").join("");
  ctx.fillText(in_arr, 0, 0, max_width);
  text_format(ctx, "cast_in", cast.n.expr);
  ctx.fillText(cast.n.expr, 0, 0, max_width);
  ctx.restore();
  ctx.save();

  ctx.translate(cast.node.boundary!.tr.x + CAST_SIZE - 0.5 * TEXT_PAD_SIZE, rc.y);
  max_width = undefined;
  if (cast.m.expr.length > 2) {
    ctx.rotate(Math.PI / 2);
    max_width = node.ver_len! - 2 * TEXT_PAD_SIZE;
  }
  text_format(ctx, "cast_out_background", cast.m.expr);
  const out_arr = Array(cast.m.expr.length).fill("█").join("");
  ctx.fillText(out_arr, 0, 0, max_width);
  text_format(ctx, "cast_out", cast.m.expr);
  ctx.fillText(cast.m.expr, 0, 0, max_width);
  ctx.restore();
}

function drawBaseNode(ctx:CanvasRenderingContext2D, node: ast.ASTNode) {
  ctx.fillStyle = white;
  ctx.setLineDash([]);
  ctx.lineWidth = LINE_WIDTH;
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
  let max_width: number | undefined = undefined;
  text_format(ctx, "spider_alpha", alpha);
  max_width = node.hor_len! / 2;
  if (ctx.measureText(alpha).width > max_width) {
    wrapText(
      ctx,
      alpha,
      center.x,
      center.y,
      max_width,
      ctx.measureText(alpha).actualBoundingBoxAscent +
      ctx.measureText(alpha).actualBoundingBoxDescent,
      false
    );
  } else {
    ctx.fillText(alpha, center.x, center.y, max_width);
  }
  ctx.save();
  ctx.translate(right.x - TEXT_PAD_SIZE, right.y);
  max_width = undefined;
  if (outputs.length > 2) {
    ctx.rotate(Math.PI / 2);
    max_width = node.ver_len! - 2 * TEXT_PAD_SIZE;
  }
  // text_format("spider_in_out_background", outputs);
  // const out_arr = Array(outputs.length).fill("█").join("");
  // wrapText(
  //   outputs,
  //   0,
  //   0,
  //   max_width!,
  //   ctx.measureText(outputs).actualBoundingBoxAscent +
  //     ctx.measureText(outputs).actualBoundingBoxDescent,
  //   true
  // );
  // ctx.fillText(out_arr, 0, 0, max_width);
  text_format(ctx, "spider_in_out", outputs);
  wrapText(
    ctx, 
    outputs,
    0,
    0,
    max_width!,
    ctx.measureText(outputs).actualBoundingBoxAscent +
    ctx.measureText(outputs).actualBoundingBoxDescent,
    false
  );
  // ctx.fillText(outputs, 0, 0, max_width);
  ctx.restore();
  ctx.save();
  max_width = undefined;
  ctx.translate(left.x + TEXT_PAD_SIZE, left.y);
  if (inputs.length > 2) {
    max_width = node.ver_len! - 2 * TEXT_PAD_SIZE;
    ctx.rotate(Math.PI / 2);
  }
  // text_format("spider_in_out_background", inputs);
  // const in_arr = Array(inputs.length).fill("█").join("");
  // wrapText(
  //   inputs,
  //   0,
  //   0,
  //   max_width!,
  //   ctx.measureText(inputs).actualBoundingBoxAscent +
  //     ctx.measureText(inputs).actualBoundingBoxDescent,
  //   true
  // );
  // ctx.fillText(in_arr, 0, 0, max_width);
  text_format(ctx, "spider_in_out", inputs);
  wrapText(
    ctx, 
    inputs,
    0,
    0,
    max_width!,
    ctx.measureText(inputs).actualBoundingBoxAscent +
    ctx.measureText(inputs).actualBoundingBoxDescent,
    false
  );
  // ctx.fillText(inputs, 0, 0, max_width);
  ctx.restore();
}

// fit text within max width
function wrapText(
  ctx:CanvasRenderingContext2D, 
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  background: boolean
) {
  let separated = text.split("(");
  let line = "";
  let lc = 0;
  for (let i = 0; i < separated.length; i++) {
    let testLine = line.concat(separated[i]);
    if (i !== separated.length - 1) {
      testLine = testLine.concat("(");
    }
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      lc++;
      line = separated[i];
      if (i !== separated.length - 1) {
        line = line.concat("(");
      }
    } else {
      line = testLine;
    }
  }
  line = "";
  y -= (lc / 2) * lineHeight;
  for (let i = 0; i < separated.length; i++) {
    let testLine = line.concat(separated[i]);
    if (i !== separated.length - 1) {
      testLine = testLine.concat("(");
    }
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      if (background) {
        ctx.fillText(Array(line.length).fill("█").join(""), x, y);
      }
      ctx.fillText(line, x, y);
      line = separated[i];
      if (i !== separated.length - 1) {
        line = line.concat("(");
      }
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (background) {
    ctx.fillText(Array(line.length).fill("█").join(""), x, y);
  }
  ctx.fillText(line, x, y);
}

function text_format(ctx:CanvasRenderingContext2D, loc: string, text: string) {
  let small_text = SMALL_TEXT;
  if (text.length > 15) {
    small_text = REALLY_SMALL_TEXT;
  }
  switch (loc) {
    case "spider_in_out": {
      ctx.font = small_text.concat(" ").concat(MONOSPACE_FONT);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = gray;
      break;
    }
    case "spider_in_out_background": {
      ctx.font = small_text.concat(" ").concat(MONOSPACE_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = white_trans;
      break;
    }
    case "spider_alpha": {
      if (text.length > 9) {
        ctx.font = SMALL_TEXT.concat(" ").concat(ARIAL_FONT);
      } else {
        ctx.font = MEDIUM_TEXT.concat(" ").concat(ARIAL_FONT);
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    case "cast_in": {
      ctx.font = SMALL_TEXT.concat(" ").concat(MONOSPACE_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    case "cast_out": {
      ctx.font = SMALL_TEXT.concat(" ").concat(MONOSPACE_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    case "cast_in_background": {
      ctx.font = SMALL_TEXT.concat(" ").concat(MONOSPACE_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = white_trans;
      break;
    }
    case "cast_out_background": {
      ctx.font = SMALL_TEXT.concat(" ").concat(MONOSPACE_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = white_trans;
      break;
    }
    case "nwire": {
      ctx.font = MEDIUM_TEXT.concat(" ").concat(ARIAL_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    case "nwire_dots": {
      ctx.font = MEDIUM_TEXT.concat(" ").concat(ARIAL_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = black;
      break;
    }
    case "propto": {
      ctx.font = MEDIUM_LARGE_TEXT.concat(" ").concat(ARIAL_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    case "proptospec": {
      ctx.font = MEDIUM_TEXT.concat(" ").concat(ARIAL_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    case "transform": {
      ctx.font = MEDIUM_TEXT.concat(" ").concat(ARIAL_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    case "nstack": {
      ctx.font = MEDIUM_TEXT.concat(" ").concat(ARIAL_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    case "function": {
      if (text.length > 15) {
        ctx.font = REALLY_SMALL_TEXT.concat(" ").concat(ARIAL_FONT);
      } else if (text.length > 10) {
        ctx.font = SMALL_TEXT.concat(" ").concat(ARIAL_FONT);
      } else {
        ctx.font = MEDIUM_TEXT.concat(" ").concat(ARIAL_FONT);
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
    default: {
      if (text.length > 15) {
        ctx.font = REALLY_SMALL_TEXT.concat(" ").concat(ARIAL_FONT);
      } else if (text.length > 10) {
        ctx.font = SMALL_TEXT.concat(" ").concat(ARIAL_FONT);
      } else {
        ctx.font = MEDIUM_TEXT.concat(" ").concat(ARIAL_FONT);
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = black;
      break;
    }
  }
}

function draw(ctx:CanvasRenderingContext2D, node: ast.ASTNode, preboxed:Boolean = false) {
  switch (node.kind) {
    case "spider": {
      drawBaseNode(ctx, node);
      break;
    }
    case "var": {
      drawBaseNode(ctx, node);
    }
    case "const": {
      drawBaseNode(ctx, node);
      break;
    }
    case "stack": {
      drawStackNode(ctx, node, preboxed);
      break;
    }
    case "compose": {
      drawComposeNode(ctx, node, preboxed);
      break;
    }
    // case "plus": {
    //   drawPlusNode(node);
    //   break;
    // }
    case "nstack": {
      drawNStackNode(ctx, node);
      break;
    }
    case "nstack1": {
      drawNStack1Node(ctx, node);
      break;
    }
    case "cast": {
      drawCastNode(ctx, node);
      break;
    }
    case "nwire": {
      drawNWireNode(ctx, node);
      break;
    }
    case "propto": {
      drawPropToNode(ctx, node);
      break;
    }
    case "scale": {
      drawScaleNode(ctx, node);
      break
    }
    case "transform": {
      drawTransformNode(ctx, node);
      break;
    }
    case "function": {
      drawFunctionNode(ctx, node);
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
  let qualifiers = msg.data.qualifiers;
  if (qualifiers) {
    const qualifiersElement = document.getElementById("qualifiers")!;
    qualifiersElement.textContent = `Qualifiers: ${qualifiers}`;
  }
  let node: ast.ASTNode = JSON.parse(command);
  setCanvasWidthHeight(determineCanvasWidthHeight(node));
  switch (node.kind) {
    case "propto": {
      let node_ = <ast.ASTPropTo>node;
      setLHSCanvasWidthHeight(determineCanvasWidthHeight(node_.l));
      setRHSCanvasWidthHeight(determineCanvasWidthHeight(node_.r));
      break;
    }
  }
  formatCanvas();
  console.log("b4 drawing really small text = ", REALLY_SMALL_TEXT);
  draw(ctx, node);
  switch (node.kind) {
    case "propto": {
      let node_ = <ast.ASTPropTo>node;
      draw(lhsctx, node_.l, true);
      let rhs_boundary = makeAtCenter(
        {x: rhscanvas.width / 2, y: rhscanvas.height / 2},
        node_.r.hor_len!,
        node_.r.ver_len!,
      )
      addCoords(node_.r, rhs_boundary, true)
      draw(rhsctx, node_.r, true);
      break;
    }
  }
}

function formatCanvas() {
  console.log("setting width, height in render: ", CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  ctx.fillStyle = white;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = black;
  console.log("setting LHS width, height in render: ", LHS_CANVAS_WIDTH, LHS_CANVAS_HEIGHT);
  lhscanvas.width = LHS_CANVAS_WIDTH;
  lhscanvas.height = LHS_CANVAS_HEIGHT;
  lhsctx.fillStyle = white;
  lhsctx.fillRect(0, 0, lhscanvas.width, lhscanvas.height);
  lhsctx.strokeStyle = black;
  console.log("setting RHS width, height in render: ", RHS_CANVAS_WIDTH, RHS_CANVAS_HEIGHT);
  rhscanvas.width = RHS_CANVAS_WIDTH;
  rhscanvas.height = RHS_CANVAS_HEIGHT;
  rhsctx.fillStyle = white;
  rhsctx.fillRect(0, 0, rhscanvas.width, rhscanvas.height);
  rhsctx.strokeStyle = black;
}

// function downloadSVG() {
//   const svgData = `
//     <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${
//     canvas.height
//   }">
//       <foreignObject width="100%" height="100%">
//         <div xmlns="http://www.w3.org/1999/xhtml">
//           <img src="${canvas.toDataURL("image/png")}" width="${
//     canvas.width
//   }" height="${canvas.height}"></img>
//         </div>
//       </foreignObject>
//     </svg>
//   `;

//   const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
//   const svgUrl = URL.createObjectURL(svgBlob);

//   const link = document.createElement("a");
//   link.download = "canvas.svg";
//   link.href = svgUrl;
//   link.click();

//   URL.revokeObjectURL(svgUrl);
// }

function downloadPNG(canvas : HTMLCanvasElement) {
  canvas.toBlob(function (blob) {
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob!);
    downloadLink.download = "canvas.png";
    downloadLink.click();
  }, "image/png");
}

// function downloadSVG() {
//   canvas.toBlob(function (blob) {
//     const downloadLink = document.createElement("a");
//     downloadLink.href = URL.createObjectURL(blob!);
//     downloadLink.download = "canvas.svg";
//     downloadLink.click();
//   }, "image/svg");
// }

// const downloadButtonSvg = document.getElementById("download-button-svg");
// downloadButtonSvg!.addEventListener("click", downloadSVG);

const downloadButtonPng = document.getElementById("download-button-png");
downloadButtonPng!.addEventListener("click", (e) => downloadPNG(canvas));

const downloadButtonPngLhs = document.getElementById("download-button-png-lhs");
downloadButtonPngLhs!.addEventListener("click", (e) => downloadPNG(lhscanvas));

const downloadButtonPngRhs = document.getElementById("download-button-png-rhs");
downloadButtonPngRhs!.addEventListener("click", (e) => downloadPNG(rhscanvas));


const toggleLhs = document.getElementById("toggle-lhs")!;
toggleLhs.addEventListener("click", (e) => {
    if (lhscanvas.style.display == "none") {
      lhscanvas.style.display = "block";
      toggleLhs.innerText = "Hide LHS";
    }
    else if (lhscanvas.style.display == "block") {
      lhscanvas.style.display = "none";
      toggleLhs.innerText = "Show LHS";
    }
    else {
      console.log("INVALID LHS DISPLAY STYLE: " + lhscanvas.style.display);
    }
  });
  
const toggleRhs = document.getElementById("toggle-rhs")!;
toggleRhs.addEventListener("click", (e) => {
    if (rhscanvas.style.display == "none") {
      rhscanvas.style.display = "block";
      toggleRhs.innerText = "Hide RHS";
    }
    else if (rhscanvas.style.display == "block") {
      rhscanvas.style.display = "none";
      toggleRhs.innerText = "Show RHS";
    }
    else {
      console.log("INVALID RHS DISPLAY STYLE: " + rhscanvas.style.display);
    }
  });
// const downloadButtonSvg = document.getElementById("download-button-svg");
// downloadButtonSvg!.addEventListener("click", downloadSVG);

const scale_speed = -0.01;

function adjust_height(style_height : string, 
  update : (current:number) => number) : string {
  let num_part = style_height.match(/[\d\.]+/g)![0];
  let new_num = update(parseFloat(num_part));
  let new_height = style_height.replace(/[\d\.]+/g,new_num.toString());
  console.log("Old height: " + style_height);
  console.log("New height: " + new_height);
  return new_height
}

function scale_canvases(deltaY : number) : void {
  let update = (val: number) => (val * Math.exp(scale_speed * deltaY));
  canvas.style.maxHeight = adjust_height(canvas.style.maxHeight, update);
  lhscanvas.style.maxHeight = adjust_height(lhscanvas.style.maxHeight, update);
  rhscanvas.style.maxHeight = adjust_height(rhscanvas.style.maxHeight, update);
}

window.addEventListener("wheel", function(e){
  if (e.ctrlKey) {
    scale_canvases(e.deltaY);
  }
});

window.addEventListener("message", render);

// esbuild auto reload
new EventSource("/esbuild").addEventListener("change", () => location.reload());
