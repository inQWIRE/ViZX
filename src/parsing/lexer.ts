import { buildLexer } from "typescript-parsec";
import * as c from "../constants/consts";

export enum TokenKind {
  NumberToken,
  Str,
  NWire,
  Succ,
  R0,
  R1,
  PI,

  ZToken,
  XToken,

  Add,
  Sub,
  Mul,
  Div,
  Root,
  Exp,

  Swap,
  Empty,
  Wire,
  Box,
  Cap,
  Cup,
  TriangleRight,
  TriangleLeft,

  Transpose,
  Conjugate,
  Adjoint,
  ColorSwap,
  Flip,

  Stack,
  NStack,
  NStack1,
  Compose,

  PropTo,

  LParen,
  RParen,
  Space,
  Comma,

  Cast$,
  Cast3Colon,
}

// longest parse, ties broken by array index
export const lexer = buildLexer([
  [true, /^\d+/g, TokenKind.NumberToken],
  [true, /^[Z]/g, TokenKind.ZToken],
  [true, /^[X]/g, TokenKind.XToken],
  [true, /^R0/g, TokenKind.R0],
  [true, /^R1/g, TokenKind.R1],
  [true, /^n_wire/g, TokenKind.NWire],

  [true, /^\$/g, TokenKind.Cast$],
  [true, /^:::/g, TokenKind.Cast3Colon],
  [true, /^S\s/g, TokenKind.Succ],
  [true, /^\(/g, TokenKind.LParen],
  [true, /^\)/g, TokenKind.RParen],
  [true, /^PI/g, TokenKind.PI],

  [true, /^[A-WYa-zΑ-Ωα-ω][A-Za-zΑ-Ωα-ω0-9'_]*/g, TokenKind.Str],
  [true, /^\,/g, TokenKind.Comma],

  [true, new RegExp(`\^[${c.ADD_OP}]`, "g"), TokenKind.Add],
  [true, new RegExp(`\^[${c.SUB_OP}]`, "g"), TokenKind.Sub],
  [true, new RegExp(`\^[${c.MUL_OP}]`, "g"), TokenKind.Mul],
  [true, new RegExp(`\^[${c.DIV_OP}]`, "g"), TokenKind.Div],
  [true, new RegExp(`\^[${c.ROOT_OP}]`, "g"), TokenKind.Root],
  [true, new RegExp(`\^[\\${c.EXP_OP}]`, "g"), TokenKind.Exp],

  [true, new RegExp(`\^[${c.SWAP}]`, "g"), TokenKind.Swap],
  [true, new RegExp(`\^[${c.EMPTY}]`, "g"), TokenKind.Empty],
  [true, new RegExp(`\^[${c.WIRE}]`, "g"), TokenKind.Wire],
  [true, new RegExp(`\^[${c.BOX}]`, "g"), TokenKind.Box],
  [true, new RegExp(`\^[${c.CAP}]`, "g"), TokenKind.Cap],
  [true, new RegExp(`\^[${c.CUP}]`, "g"), TokenKind.Cup],
  [true, new RegExp(`\^[${c.TRIANGLE_LEFT}]`, "g"), TokenKind.TriangleLeft],
  [true, new RegExp(`\^[${c.TRIANGLE_RIGHT}]`, "g"), TokenKind.TriangleRight],

  [true, new RegExp(`\^[${c.TRANSPOSE_TRANSFORM}]`, "g"), TokenKind.Transpose],
  [true, new RegExp(`\^[${c.CONJUGATE_TRANSFORM}]`, "g"), TokenKind.Conjugate],
  [true, new RegExp(`\^[${c.ADJOINT_TRANSFORM}]`, "g"), TokenKind.Adjoint],
  [true, new RegExp(`\^[${c.COLORSWAP_TRANSFORM}]`, "g"), TokenKind.ColorSwap],
  [true, new RegExp(`\^[${c.FLIP_TRANSFORM}]`, "g"), TokenKind.Flip],

  [true, new RegExp(`\^[${c.STACK_OP}]`, "g"), TokenKind.Stack],
  [true, new RegExp(`\^[${c.N_STACK_OP}]`, "g"), TokenKind.NStack],
  [true, new RegExp(`\^[${c.N_STACK_1_OP}]`, "g"), TokenKind.NStack1],
  [true, new RegExp(`\^[${c.COMPOSE_OP}]`, "g"), TokenKind.Compose],

  [true, new RegExp(`\^[${c.PROP_TO}]`, "g"), TokenKind.PropTo],

  [false, /^\s+/g, TokenKind.Space],
]);

export function lexerPrettyPrinter(expr: string) {
  let lx = lexer.parse(expr);
  let printlx = "";
  while (lx) {
    printlx += TokenKind[lx.kind] + ", ";
    lx = lx?.next;
  }
  console.log(printlx.substring(0, printlx.length - 1));
}
