import * as ohm from 'ohm-js';

import * as ohmextras from 'ohm-js/extras';
import * as c from './consts';
import { lastDigitsToSubscript } from './strutil';

let grammarSource = `
VyZX {
  TopLevelTerm = BinOp<"${c.propTo}">
  | Term

  Term = TermNStack
  | BinOp<"${c.compOp}">
  | BinOp<"${c.stackOp}">
  | BinOp<"${c.addOp}">
  | BinOp<"${c.minOp}">
  | BinOp<"${c.mulOp}">
  | BinOp<"${c.divOp}">
  | TermCast
  | TermBra
  | ZXTerm
  | TermFn
  | BaseTerm

  BaseOrBra = TermBra | BaseTerm

  TermFn = fnName TermArgs

  MultTermArgs = BaseOrBra TermArgs

  TermArgs = MultTermArgs
  | BaseOrBra

  ZXBaseTerm = "${c.cap}"
  | "${c.cup}"
  | "${c.wire}"
  | "${c.box}"

  BaseTerm = ZXBaseTerm
  | number
  | string

  alnumWithGreek = alnum | "α" | "β" 
  fnName = (~("Z"|"X"))letter alnum*
  string = (~("Z"|"X"))alnumWithGreek+ 
  number = digit+


  ZTerm = "Z" BaseOrBra BaseOrBra BaseOrBra
  | "(Z)" BaseOrBra BaseOrBra BaseOrBra

  XTerm = "X" BaseOrBra BaseOrBra BaseOrBra
  | "(X)" BaseOrBra BaseOrBra BaseOrBra
  ZXTerm = ZTerm | XTerm

  TermBra = "(" Term ")"
  BinOp<op> = Term op Term
  TermNStack = Term "⇑" Term
  | Term "↑" Term
  TermCast = "$" Term "," Term ":::" Term "$"
}
`
const rules = {
  TermFn: { type: c.termFnType, fn: 0, args: 1 },
  MultTermArgs: { type: c.multTermArgsType, arg: 0, rem: 1 },
  TermArgs: { type: c.termArgsType, arg: 0 },
  TermCast: { type: c.termCastType, in: 1, out: 3, exp: 5 },
  TermNStack: { type: c.termNStackType, n: 0, exp: 2 },
  ZTerm: { type: c.termZType, in: 1, out: 2, alpha: 3 },
  XTerm: { type: c.termXType, in: 1, out: 2, alpha: 3 },
  ZXBaseTerm: { type: c.termBaseType, val: 0 },
  number: { type: c.numberType, val: 0 },
  string: { type: c.stringType, val: 0 },
  BinOp: { type: c.termBinOpType, op: 1, l: 0, r: 2 }
}

export interface ASTNode {
  type: string
}

export interface ASTBinOp extends ASTNode {
  type: "BinOp"
  op: string
  l: ASTNode
  r: ASTNode
}


export interface ASTString extends ASTNode {
  type: "string"
  val: [string]
}

export interface ASTNumber extends ASTNode {
  type: "number"
  val: [number]
}

export interface ASTBaseTerm extends ASTNode {
  type: "Base"
  val: string
}

export interface ASTSpider extends ASTNode {
  type: "Z" | "X"
  in: ASTNode
  out: ASTNode
  alpha: ASTNode
}

export interface ASTNStack extends ASTNode {
  type: "nStack"
  n: ASTNode
  exp: ASTNode
}

export interface ASTCast extends ASTNode {
  type: "Cast"
  in: ASTNode
  out: ASTNode
  exp: ASTNode
}

export interface ASTArgs extends ASTNode {
  type: "TermArgs"
  arg: ASTNode
}

export interface ASTMultArgs extends ASTNode {
  type: "MultTermArgs"
  arg: ASTNode
  rem: ASTNode
}

export interface ASTFn extends ASTNode {
  type: "Fn"
  fn: ASTNode
  args: ASTNode
}


export function prettyPrint(ast: ASTNode): string {
  switch (ast.type) {
    case c.termBinOpType:
      // TODO: Operator precedence and brackets
      const binop = ast as ASTBinOp
      return `${prettyPrint(binop.l)} ${binop.op} ${prettyPrint(binop.r)}`
    case c.stringType:
      return lastDigitsToSubscript((ast as ASTString).val.join(""))
    case c.numberType:
      return (ast as ASTNumber).val.join("")
    case c.termBaseType:
      return (ast as ASTBaseTerm).val
    case "Z":
    // fallthrough
    case "X":
      const spider = ast as ASTSpider
      return `${spider.type} ${prettyPrint(spider.in)} ${prettyPrint(spider.out)} ${prettyPrint(spider.alpha)}`
    case c.termNStackType:
      const nStack = ast as ASTNStack
      return `${prettyPrint(nStack.n)} ↑ ${prettyPrint(nStack.exp)}`
    case c.termCastType:
      const cast = ast as ASTCast
      return `\$ ${prettyPrint(cast.in)}, ${prettyPrint(cast.out)} ::: ${prettyPrint(cast.exp)} \$`
    case c.termArgsType:
      return prettyPrint((ast as ASTArgs).arg)
    case c.multTermArgsType:
      const multArgs = ast as ASTMultArgs
      return `${prettyPrint(multArgs.arg)} ${prettyPrint(multArgs.rem)}`
    case c.termFnType:
      const fn = ast as ASTFn
      return `${prettyPrint(fn.fn)} ${prettyPrint(fn.args)}`
  }
  return "Invalid"
}


const g = ohm.grammar(grammarSource);

export function parse(expr: string): ASTNode {
  const match = g.match(expr);
  if (match.failed()) {
    console.log("Failed to parse")
    console.log(match.message)
    match.getInterval
  }

  console.log("AST for \"" + expr + "\"");

  return <ASTNode>ohmextras.toAST(match, rules);
}

export function isVyzxAst(ast: any): boolean {
  const type: any = ast['type'];
  const allowedTypes = [c.termCastType, c.termNStackType, c.termFnType, c.termBaseType, c.termXType, c.termZType, c.termBinOpType]
  const allowedOps = [c.propTo, c.stackOp, c.compOp]
  if (!(typeof type === 'string' || type instanceof String)) {
    return false;
  }
  if (!allowedTypes.includes(type as string)) {
    return false;
  }
  if (type === "BinOp") {
    const op = ast['op'];
    if (!(typeof op === 'string' || op instanceof String)) {
      return false;
    }
    if (!allowedOps.includes(op as string)) {
      return false;
    }
  }
  return true;
}
