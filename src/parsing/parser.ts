import * as psec from "typescript-parsec";
import {
  rule,
  alt,
  tok,
  seq,
  lrec_sc,
  apply,
  kmid,
  expectEOF,
  expectSingleResult,
  kright,
  kleft,
  opt_sc,
  rep_sc,
  rep,
} from "typescript-parsec";
let _ = require("lodash");
// https://github.com/microsoft/ts-parsec/blob/master/doc/ParserCombinators.md

import * as ast from "./ast";
import * as lex from "./lexer";
import { lexerPrettyPrinter } from "./lexer";

type Token = psec.Token<lex.TokenKind>;

function applyNumber(value: Token): ast.Num {
  return { val: value.text, kind: "num", expr: value.text } as ast.Number;
}

function applyNumVar(value: Token): ast.Num {
  return { val: value.text, kind: "numvar", expr: value.text } as ast.NumVar;
}

function applyBinOp(fst: ast.Num, snd: [Token, ast.Num]): ast.Num {
  switch (snd[0].kind) {
    case lex.TokenKind.Add: {
      return {
        val: "+",
        left: fst,
        right: snd[1],
        kind: "num",
        expr: fst.expr.concat("+").concat(snd[1].expr),
      } as ast.ArithOp;
    }
    case lex.TokenKind.Sub: {
      return {
        val: "-",
        left: fst,
        right: snd[1],
        kind: "num",
        expr: fst.expr.concat("-").concat(snd[1].expr),
      } as ast.ArithOp;
    }
    case lex.TokenKind.Mul: {
      return {
        val: "*",
        left: fst,
        right: snd[1],
        kind: "num",
        expr: fst.expr.concat("*").concat(snd[1].expr),
      } as ast.ArithOp;
    }
    case lex.TokenKind.Div: {
      return {
        val: "/",
        left: fst,
        right: snd[1],
        kind: "num",
        expr: fst.expr.concat("/").concat(snd[1].expr),
      } as ast.ArithOp;
    }
    case lex.TokenKind.Exp: {
      return {
        val: "^",
        left: fst,
        right: snd[1],
        kind: "num",
        expr: fst.expr.concat("^").concat(snd[1].expr),
      } as ast.ArithOp;
    }
    default: {
      throw new Error(`Unknown binary operator: ${snd[0].text}`);
    }
  }
}

function applyNumFunc(args: [Token, ast.Num, ast.Num[]]): ast.Num {
  args[2].unshift(args[1]);
  return {
    kind: "numfunc",
    fname: args[0].text,
    args: args[2],
    val: args[0].text,
    expr: args[0].text.concat(" ").concat(args[2].map((x) => x.expr).join(" ")),
  } as ast.NumFunc;
}

function applyNumberSucc(value: [Token, ast.Num]): ast.Num {
  return { expr: value[1].expr.concat("+1"), kind: "num" } as ast.Number;
}

function applyRConst(val: Token): ast.Num {
  switch (val.kind) {
    case lex.TokenKind.R0: {
      return { kind: "numreal01", n: "R0", expr: "R0" } as ast.Real01;
    }
    case lex.TokenKind.R1: {
      return { kind: "numreal01", n: "R1", expr: "R1" } as ast.Real01;
    }
    default: {
      throw new Error(`Unknown real: ${val.text}`);
    }
  }
}

// numbers
const NUML0 = rule<lex.TokenKind, ast.Num>();
const NUML10 = rule<lex.TokenKind, ast.Num>();
const NUML20 = rule<lex.TokenKind, ast.Num>();
const NUML30 = rule<lex.TokenKind, ast.Num>();
const NUML40 = rule<lex.TokenKind, ast.Num>();

NUML0.setPattern(
  alt(
    apply(alt(tok(lex.TokenKind.R0), tok(lex.TokenKind.R1)), applyRConst),
    apply(tok(lex.TokenKind.NumberToken), applyNumber),
    apply(
      seq(tok(lex.TokenKind.Sub), tok(lex.TokenKind.NumberToken)),
      applySign
    ),
    apply(
      seq(tok(lex.TokenKind.LParen), NUML40, tok(lex.TokenKind.RParen)),
      applyParens
    ),
    apply(tok(lex.TokenKind.Str), applyNumVar)
  )
);

NUML10.setPattern(
  alt(
    apply(
      seq(
        alt(
          tok(lex.TokenKind.Sub),
          tok(lex.TokenKind.Div),
          tok(lex.TokenKind.Root)
        ),
        rep_sc(
          alt(
            tok(lex.TokenKind.Sub),
            tok(lex.TokenKind.Div),
            tok(lex.TokenKind.Root)
          )
        ),
        NUML0
      ),
      applyUnaryOp
    ),
    apply(seq(tok(lex.TokenKind.Succ), NUML0), applyNumberSucc),
    apply(
      seq(
        tok(lex.TokenKind.Str),
        // hack so functions have at least one parameter
        NUML0,
        rep_sc(NUML0)
      ),
      applyNumFunc
    )
  )
);

NUML20.setPattern(
  lrec_sc(
    alt(NUML10, NUML0),
    seq(alt(tok(lex.TokenKind.Mul), tok(lex.TokenKind.Div)), NUML0),
    applyBinOp
  )
);

NUML30.setPattern(
  lrec_sc(
    NUML20,
    seq(alt(tok(lex.TokenKind.Add), tok(lex.TokenKind.Sub)), NUML20),
    applyBinOp
  )
);

NUML40.setPattern(
  lrec_sc(NUML30, seq(tok(lex.TokenKind.Exp), NUML30), applyBinOp)
);

function applyUnaryOp(args: [Token, Token[], ast.Num]): ast.Num {
  args[1].unshift(args[0]);
  return {
    val: args[1]
      .map((x) => x.text)
      .join(" ")
      .concat(args[2].expr),
    kind: "num",
    expr: args[1]
      .map((x) => x.text)
      .join(" ")
      .concat(args[2].expr),
  } as ast.Num;
}

function applyParens(args: [Token, ast.Num, Token]): ast.Num {
  return {
    val: "(".concat(args[1].expr).concat(")"),
    kind: "num",
    expr: "(".concat(args[1].expr).concat(")"),
  } as ast.Num;
}

function applySign(args: [Token, Token]): ast.Num {
  return {
    val: args[0].text.concat(args[1].text),
    kind: "num",
    expr: args[0].text.concat(args[1].text),
  } as ast.Number;
}

// ZXConsts

const ZXBASETERM = rule<lex.TokenKind, ast.ASTNode>();
const ZXSTACKCOMPOSE = rule<lex.TokenKind, ast.ASTNode>();
const ZXNSTACK = rule<lex.TokenKind, ast.ASTNode>();
const ZXCAST = rule<lex.TokenKind, ast.ASTNode>();
const ZXPROPTO = rule<lex.TokenKind, ast.ASTNode>();
const ZXTRANSFORML0 = rule<lex.TokenKind, ast.ASTNode>();
const ASTNODE = rule<lex.TokenKind, ast.ASTNode>();

function applyConst(args: Token): ast.ASTNode {
  let zxconst: ast.ASTConst;
  switch (args.kind) {
    case lex.TokenKind.Box: {
      zxconst = {
        kind: "const",
        val: ast.ZXConst.Box,
      } as ast.ASTConst;
      break;
    }
    case lex.TokenKind.Cap: {
      zxconst = {
        kind: "const",
        val: ast.ZXConst.Cap,
      } as ast.ASTConst;
      break;
    }
    case lex.TokenKind.Cup: {
      zxconst = {
        kind: "const",
        val: ast.ZXConst.Cup,
      } as ast.ASTConst;
      break;
    }
    case lex.TokenKind.Empty: {
      zxconst = {
        kind: "const",
        val: ast.ZXConst.Empty,
      } as ast.ASTConst;
      break;
    }
    case lex.TokenKind.Wire: {
      zxconst = {
        kind: "const",
        val: ast.ZXConst.Wire,
      } as ast.ASTConst;
      break;
    }
    case lex.TokenKind.Swap: {
      zxconst = {
        kind: "const",
        val: ast.ZXConst.Swap,
      } as ast.ASTConst;
      break;
    }
    default: {
      throw new Error(`Unknown const: ${args.kind}`);
    }
  }
  return zxconst;
}

function applyVar(val: Token): ast.ASTNode {
  return { kind: "var", val: val.text } as ast.ASTVar;
}

function applyFunc(
  args: [Token, ast.Num | ast.ASTNode, (ast.Num | ast.ASTNode)[]]
): ast.ASTNode {
  args[2].unshift(args[1]);
  const new_args = <[ast.Num | ast.ASTNode]>args[2];
  return {
    kind: "function",
    fname: args[0].text,
    args: new_args,
    val: `${args[0].text}(${new_args.join(", ")})`,
  } as ast.ASTFunc;
}

function applyNWire(arg: ast.Num): ast.ASTNode {
  return { kind: "nwire", n: arg } as ast.ASTNWire;
}

// ZX base term =
// | const [box, cup, cap, empty, wire swap]
// | var
// | fname ?( num/astnode ?, + ?)
// | nwire number
// | cswap? flip?
ZXBASETERM.setPattern(
  alt(
    apply(
      alt(
        tok(lex.TokenKind.Box),
        tok(lex.TokenKind.Cup),
        tok(lex.TokenKind.Cap),
        tok(lex.TokenKind.Empty),
        tok(lex.TokenKind.Wire),
        tok(lex.TokenKind.Swap)
      ),
      applyConst
    ),
    apply(tok(lex.TokenKind.Str), applyVar),
    apply(
      seq(
        tok(lex.TokenKind.Str),
        alt(NUML40, ASTNODE),
        rep_sc(alt(NUML40, ASTNODE))
      ),
      applyFunc
    ),
    apply(kright(tok(lex.TokenKind.NWire), NUML40), applyNWire),
    apply(
      seq(
        alt(tok(lex.TokenKind.XToken), tok(lex.TokenKind.ZToken)),
        NUML40,
        NUML40,
        NUML40
      ),
      applySpider
    ),
    apply(
      seq(
        alt(
          kmid(
            tok(lex.TokenKind.LParen),
            tok(lex.TokenKind.XToken),
            tok(lex.TokenKind.RParen)
          ),
          kmid(
            tok(lex.TokenKind.LParen),
            tok(lex.TokenKind.ZToken),
            tok(lex.TokenKind.RParen)
          )
        ),
        NUML40,
        NUML40,
        NUML40
      ),
      applySpider
    ),
    kmid(tok(lex.TokenKind.LParen), ZXTRANSFORML0, tok(lex.TokenKind.RParen))
  )
);

function applySpider(args: [Token, ast.Num, ast.Num, ast.Num]): ast.ASTNode {
  // console.log("applyspider");
  let spider: ast.ASTSpider;
  switch (args[0].kind) {
    case lex.TokenKind.XToken: {
      spider = {
        kind: "spider",
        val: "X",
        in: args[1],
        out: args[2],
        alpha: args[3],
      };
      break;
    }
    case lex.TokenKind.ZToken: {
      spider = {
        kind: "spider",
        val: "Z",
        in: args[1],
        out: args[2],
        alpha: args[3],
      };
      break;
    }
    default: {
      console.log("nooo spider type?");
      throw new Error(`Unknown spider: ${args[0].kind}`);
    }
  }
  // console.log("returning in applyspider");
  return spider;
}

ZXSTACKCOMPOSE.setPattern(
  lrec_sc(
    alt(ZXBASETERM, ZXCAST, ZXNSTACK),
    seq(
      alt(tok(lex.TokenKind.Stack), tok(lex.TokenKind.Compose)),
      alt(ZXBASETERM, ZXCAST, ZXNSTACK)
    ),
    applyStackCompose
  )
);

function applyStackCompose(
  l: ast.ASTNode,
  args: [Token, ast.ASTNode]
): ast.ASTNode {
  // console.log('calling applyStackCompose');
  switch (args[0].kind) {
    case lex.TokenKind.Compose: {
      return { kind: "compose", left: l, right: args[1] } as ast.ASTCompose;
    }
    case lex.TokenKind.Stack: {
      return { kind: "stack", left: l, right: args[1] } as ast.ASTStack;
    }
    default: {
      // throw new Error(`Unknown compose: ${args[0].text}`);
      return l;
    }
  }
}

function applyNStack(args: [ast.Num, Token, ast.ASTNode]): ast.ASTNode {
  switch (args[1].kind) {
    case lex.TokenKind.NStack: {
      let n = parseInt(args[0].val);
      // loop faster than map performance wise

      return { kind: "nstack", n: args[0], node: args[2] } as ast.ASTNStack;
    }
    case lex.TokenKind.NStack1: {
      let n = parseInt(args[0].val);

      return { kind: "nstack1", n: args[0], node: args[2] } as ast.ASTNStack1;
    }
    default: {
      throw new Error(`Unknown nstack???: ${args[1].kind}`);
    }
  }
}

function applyCast(args: [ast.Num, ast.Num, ast.ASTNode]): ast.ASTNode {
  return { kind: "cast", n: args[0], m: args[1], node: args[2] } as ast.ASTCast;
}

ZXNSTACK.setPattern(
  apply(
    seq(
      NUML40,
      alt(tok(lex.TokenKind.NStack), tok(lex.TokenKind.NStack1)),
      ZXBASETERM
    ),
    applyNStack
  )
);

ZXCAST.setPattern(
  apply(
    seq(
      kright(tok(lex.TokenKind.Cast$), NUML40),
      kright(tok(lex.TokenKind.Comma), NUML40),
      kmid(
        tok(lex.TokenKind.Cast3Colon),
        ZXTRANSFORML0,
        tok(lex.TokenKind.Cast$)
      )
    ),
    applyCast
  )
);

ZXPROPTO.setPattern(
  apply(
    seq(
      alt(ZXSTACKCOMPOSE, ZXCAST, ZXNSTACK),
      tok(lex.TokenKind.PropTo),
      alt(ZXSTACKCOMPOSE, ZXCAST, ZXNSTACK)
    ),
    applyPropTo
  )
);

ZXTRANSFORML0.setPattern(
  apply(
    seq(
      rep_sc(tok(lex.TokenKind.ColorSwap)),
      lrec_sc(
        alt(ZXSTACKCOMPOSE, ZXNSTACK),
        alt(
          tok(lex.TokenKind.Adjoint),
          tok(lex.TokenKind.Transpose),
          tok(lex.TokenKind.Conjugate)
        ),
        applyTransformPost
      )
    ),
    applyTransformPre
  )
);

function applyTransformPre(args: [Token[], ast.ASTNode]): ast.ASTNode {
  let cur_node = args[1];
  for (let i of args[0]) {
    cur_node = nestColorSwap(cur_node);
  }
  return cur_node;
}

function nestColorSwap(node: ast.ASTNode): ast.ASTTransform {
  return {
    kind: "transform",
    transform: ast.MTransform.ColorSwap,
    node: node,
  } as ast.ASTTransform;
}

function applyTransformPost(node: ast.ASTNode, transform: Token): ast.ASTNode {
  let t;
  if (transform.kind === lex.TokenKind.Transpose) {
    t = ast.MTransform.Transpose;
  } else if (transform.kind === lex.TokenKind.Conjugate) {
    t = ast.MTransform.Conjugate;
  } else if (transform.kind === lex.TokenKind.Adjoint) {
    t = ast.MTransform.Adjoint;
  } else {
    throw new Error(`unknown kind ${transform.kind} in applyTransformPost`);
  }
  return {
    kind: "transform",
    transform: t,
    node: node,
  } as ast.ASTTransform;
}

function applyPropTo(args: [ast.ASTNode, Token, ast.ASTNode]): ast.ASTNode {
  return { kind: "propto", l: args[0], r: args[2] } as ast.ASTPropTo;
}

ASTNODE.setPattern(alt(ZXTRANSFORML0, ZXPROPTO));

export function parseAST(expr: string): ast.ASTNode {
  // lexerPrettyPrinter(expr);
  let parsed = expectEOF(ASTNODE.parse(lex.lexer.parse(expr)));
  // debugging only. should never have more than one
  if (parsed.successful) {
    for (let i = 0; i < parsed.candidates.length; i++) {
      console.log(parsed.candidates[i].result);
    }
  }
  if (parsed.successful && parsed.candidates.length > 1) {
    // let i = 0;
    // let flag = true;
    // while (i < parsed.candidates.length - 1) {
    //   if (
    //     !_.isEqual(parsed.candidates[i].result, parsed.candidates[i + 1].result)
    //   ) {
    //     flag = false;
    //     break;
    //   }
    //   i++;
    // }
    // if (flag) {
    return parsed.candidates[0].result;
    // }
  }
  // console.log("candidate length = ", parsed.candidates.length);
  return expectSingleResult(parsed);
}
