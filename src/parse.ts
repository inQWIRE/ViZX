import * as ohm from 'ohm-js';

import * as ohmextras from 'ohm-js/extras';

let grammarSource = `
VyZX {
  TopLevelTerm = BinOp<"∝">
  | Term

  Term = TermNStack
  | BinOp<"⟷">
  | BinOp<"+">
  | BinOp<"-">
  | BinOp<"*">
  | BinOp<"/">
  | BinOp<"↕">
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

  ZXBaseTerm =  "⊃"
  | "⊂"
  | "—"
  | "□"

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
  TermFn: { type: 'TermFn', fn: 0, args: 1 },
  MultTermArgs: { type: 'MultTermArgs', arg: 0, rem: 1 },
  TermArgs: { type: 'TermArgs', arg: 0 },
  TermCast: { type: 'Cast', in: 1, out: 3, exp: 5 },
  TermNStack: { type: 'nStack', n: 0, exp: 2 },
  TermComp: { type: 'Comp', l: 0, r: 2 },
  TermStack: { type: 'Stack', l: 0, r: 2 },
  ZTerm: { type: 'Z', in: 1, out: 2, alpha: 3 },
  XTerm: { type: 'X', in: 1, out: 2, alpha: 3 },
  ZXBaseTerm: { type: 'Base', val: 0 },
  number: { type: 'number', val: 0 },
  string: { type: 'string', val: 0 },
  BinOp: { type: 'BinOp', op: 1, l: 0, r: 2 }
}
const g = ohm.grammar(grammarSource);

export function parse(expr: string): {} {
  const match = g.match(expr);
  if (match.failed()) {
    console.log("Failed to parse")
    console.log(match.message)
    match.getInterval
  }

  console.log("AST for \"" + expr + "\"")
  return ohmextras.toAST(match, rules);
}

export function isVyzxAst(ast: any): boolean {
  const type: any = ast['type'];
  const allowedTypes = ['Cast', 'nStack', 'TermFn', 'nStack', 'Comp', 'Stack', 'Base', 'X', 'Z', 'BinOp']
  const allowedOps = ['∝', '⟷', '↕']
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
