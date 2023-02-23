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
} from "typescript-parsec";

// https://github.com/microsoft/ts-parsec/blob/master/doc/ParserCombinators.md
// TODO some sort of bug with parentheses? For some reason won't parse of form "ZXNODE ⟷|↕ (ZXNODE ⟷|↕ ZXNODE)"" but will parse without parens

import * as ast from "./ast";
import * as lex from "./lexer";

type Token = psec.Token<lex.TokenKind>;

function applyNumber(value: Token): ast.Num {
  return { val: value.text, kind: "num" } as ast.Number;
}

function applyNumVar(value: Token): ast.Num {
  return { val: value.text, kind: "numvar" } as ast.NumVar;
}

function applyBinOp(fst: ast.Num, snd: [Token, ast.Num]): ast.Num {
  switch (snd[0].kind) {
    case lex.TokenKind.Add: {
      return { val: "+", left: fst, right: snd[1], kind: "num" } as ast.ArithOp;
    }
    case lex.TokenKind.Sub: {
      return { val: "-", left: fst, right: snd[1], kind: "num" } as ast.ArithOp;
    }
    case lex.TokenKind.Mul: {
      return { val: "*", left: fst, right: snd[1], kind: "num" } as ast.ArithOp;
    }
    case lex.TokenKind.Div: {
      return { val: "/", left: fst, right: snd[1], kind: "num" } as ast.ArithOp;
    }
    case lex.TokenKind.Exp: {
      return { val: "^", left: fst, right: snd[1], kind: "num" } as ast.ArithOp;
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
    val: `${args[0].text}(${args[2].join(", ")})`,
  } as ast.NumFunc;
}

function applyNumberSucc(value: [Token, ast.Num]): ast.Num {
  return { val: value[1] + "+ 1", kind: "num" } as ast.Number;
}

function applyRConst(val: Token): ast.Num {
  switch (val.kind) {
    case lex.TokenKind.R0: {
      return { kind: "real01", n: "R0" } as ast.Real01;
    }
    case lex.TokenKind.R1: {
      return { kind: "real01", n: "R1" } as ast.Real01;
    }
    default: {
      throw new Error(`Unknown real: ${val.text}`);
    }
  }
}

// numbers
const NUMBASETERM = rule<lex.TokenKind, ast.Num>();
const NUMMIDTERM = rule<lex.TokenKind, ast.Num>();
const NUMMID2TERM = rule<lex.TokenKind, ast.Num>();
const NUMBER = rule<lex.TokenKind, ast.Num>();
const REALNUMBER = rule<lex.TokenKind, ast.Num>();

NUMBASETERM.setPattern(
  alt(
    apply(seq(tok(lex.TokenKind.Succ), NUMBER), applyNumberSucc),
    apply(tok(lex.TokenKind.Nat), applyNumber),
    kmid(tok(lex.TokenKind.LParen), NUMBER, tok(lex.TokenKind.RParen)),
    apply(
      seq(
        kleft(tok(lex.TokenKind.Str), opt_sc(tok(lex.TokenKind.LParen))),
        // hack so functions have at least one parameter
        NUMBER,
        kleft(rep_sc(NUMBER), opt_sc(tok(lex.TokenKind.RParen)))
      ),
      applyNumFunc
    ),
    apply(tok(lex.TokenKind.Str), applyNumVar)
  )
);

NUMMIDTERM.setPattern(
  lrec_sc(
    NUMBASETERM,
    seq(alt(tok(lex.TokenKind.Mul), tok(lex.TokenKind.Div)), NUMBASETERM),
    applyBinOp
  )
);

NUMMID2TERM.setPattern(
  lrec_sc(
    NUMMIDTERM,
    seq(alt(tok(lex.TokenKind.Add), tok(lex.TokenKind.Sub)), NUMMIDTERM),
    applyBinOp
  )
);

NUMBER.setPattern(
  lrec_sc(NUMMID2TERM, seq(tok(lex.TokenKind.Exp), NUMMIDTERM), applyBinOp)
);

// ZXConsts

const ZXBASETERM = rule<lex.TokenKind, ast.ASTNode>();
const ZXSTACKCOMPOSE = rule<lex.TokenKind, ast.ASTNode>();
const ZXNSTACK = rule<lex.TokenKind, ast.ASTNode>();
const ZXCAST = rule<lex.TokenKind, ast.ASTNode>();
const ZXPROPTO = rule<lex.TokenKind, ast.ASTNode>();
const ASTNODE = rule<lex.TokenKind, ast.ASTNode>();

function applyConst(value: Token): ast.ASTNode {
  switch (value.kind) {
    case lex.TokenKind.Box: {
      return { kind: "const", val: ast.ZXConst.Box } as ast.ASTConst;
    }
    case lex.TokenKind.Cap: {
      return { kind: "const", val: ast.ZXConst.Cap } as ast.ASTConst;
    }
    case lex.TokenKind.Cup: {
      return { kind: "const", val: ast.ZXConst.Cup } as ast.ASTConst;
    }
    case lex.TokenKind.Empty: {
      return { kind: "const", val: ast.ZXConst.Empty } as ast.ASTConst;
    }
    case lex.TokenKind.Wire: {
      return { kind: "const", val: ast.ZXConst.Wire } as ast.ASTConst;
    }
    case lex.TokenKind.Swap: {
      return { kind: "const", val: ast.ZXConst.Swap } as ast.ASTConst;
    }
    default: {
      throw new Error(`Unknown const: ${value.kind}`);
    }
  }
}

REALNUMBER.setPattern(
  alt(
    apply(alt(tok(lex.TokenKind.R0), tok(lex.TokenKind.R1)), applyRConst),
    apply(
      seq(
        opt_sc(
          alt(
            tok(lex.TokenKind.Sub),
            tok(lex.TokenKind.Root),
            tok(lex.TokenKind.Div)
          )
        ),
        NUMBER
      ),
      applyRealNum
    )
  )
);

function applyRealNum(value: [Token | undefined, ast.Num]): ast.Num {
  if (value[0] !== undefined) {
    switch (value[0].kind) {
      case lex.TokenKind.Add: {
        return {
          val: value[0].text + value[1].val,
          kind: "realnum",
        } as ast.RealNum;
      }
      case lex.TokenKind.Sub: {
        return {
          val: value[0].text + value[1].val,
          kind: "realnum",
        } as ast.RealNum;
      }
      default: {
        throw new Error(`Unknown unary operator: ${value[0].text}`);
      }
    }
  }
  return { val: value[1].val, kind: "realnum" } as ast.RealNum;
}

function applyVar(val: Token): ast.ASTNode {
  return { kind: "var", val: val.text } as ast.ASTVar;
}

function applyFunc(
  args: [Token, ast.Num | ast.ASTNode, (ast.Num | ast.ASTNode)[]]
): ast.ASTNode {
  args[2].unshift(args[1]);
  return {
    kind: "func",
    fname: args[0].text,
    args: args[2],
    val: `${args[0].text}(${args[2].join(", ")})`,
  } as ast.ASTFunc;
}

function applyNWire(arg: ast.Num): ast.ASTNode {
  return { kind: "nwire", n: arg } as ast.ASTNWire;
}

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
        kleft(tok(lex.TokenKind.Str), opt_sc(tok(lex.TokenKind.LParen))),
        alt(NUMBER, ASTNODE),
        kleft(
          rep_sc(kleft(alt(NUMBER, ASTNODE), opt_sc(tok(lex.TokenKind.Comma)))),
          opt_sc(tok(lex.TokenKind.RParen))
        )
      ),
      applyFunc
    ),
    apply(kright(tok(lex.TokenKind.NWire), NUMBER), applyNWire),
    apply(
      seq(
        opt_sc(alt(tok(lex.TokenKind.ColorSwap), tok(lex.TokenKind.Flip))),
        seq(
          alt(
            kmid(
              opt_sc(tok(lex.TokenKind.LParen)),
              tok(lex.TokenKind.XToken),
              opt_sc(tok(lex.TokenKind.RParen))
            ),
            kmid(
              opt_sc(tok(lex.TokenKind.LParen)),
              tok(lex.TokenKind.ZToken),
              opt_sc(tok(lex.TokenKind.RParen))
            )
          ),
          NUMBER,
          NUMBER,
          REALNUMBER
        ),
        opt_sc(
          alt(
            tok(lex.TokenKind.Adjoint),
            tok(lex.TokenKind.Conjugate),
            tok(lex.TokenKind.Transpose)
          )
        )
      ),
      applySpider
    ),
    kmid(tok(lex.TokenKind.LParen), ASTNODE, tok(lex.TokenKind.RParen))
  )
);

function applySpider(
  args: [
    Token | undefined,
    [Token, ast.Num, ast.Num, ast.Num],
    Token | undefined
  ]
): ast.ASTNode {
  let spider: ast.ASTSpider;
  switch (args[1][0].kind) {
    case lex.TokenKind.XToken: {
      spider = {
        kind: "spider",
        val: "X",
        in: args[1][1],
        out: args[1][2],
        alpha: args[1][3],
      };
      spider = addTransform(args[0], spider, args[2]);
      break;
    }
    case lex.TokenKind.ZToken: {
      spider = {
        kind: "spider",
        val: "Z",
        in: args[1][1],
        out: args[1][2],
        alpha: args[1][3],
      };
      spider = addTransform(args[0], spider, args[2]);
      break;
    }
    default: {
      console.log("nooo spider type?");
      throw new Error(`Unknown spider: ${args[1][0].kind}`);
    }
  }
  return spider;
}

function addTransform(
  pre: Token | undefined,
  spider: ast.ASTSpider,
  post: Token | undefined
): ast.ASTSpider {
  if (pre !== undefined) {
    if (pre.kind === lex.TokenKind.ColorSwap) {
      spider.transform = ast.MTransform.ColorSwap;
    } else if (pre.kind === lex.TokenKind.Flip) {
      spider.transform = ast.MTransform.Flip;
    }
  }
  if (post !== undefined) {
    if (post.kind === lex.TokenKind.Adjoint) {
      spider.transform = ast.MTransform.Adjoint;
    } else if (post.kind === lex.TokenKind.Conjugate) {
      spider.transform = ast.MTransform.Conjugate;
    } else if (post.kind === lex.TokenKind.Transpose) {
      spider.transform = ast.MTransform.Transpose;
    }
  }
  return spider;
}

ZXSTACKCOMPOSE.setPattern(
  lrec_sc(
    ZXBASETERM,
    seq(alt(tok(lex.TokenKind.Stack), tok(lex.TokenKind.Compose)), ASTNODE),
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

// EEEW!!!
// TODO: IMPROVE THIS SMH
// TODO: Figure out how I wrote this ugly code?
function applyNStack(args: [ast.Num, Token, ast.ASTNode]): ast.ASTNode {
  switch (args[1].kind) {
    case lex.TokenKind.NStack: {
      let n = parseInt(args[0].val);
      // loop faster than map performance wise
      let arr = new Array(n);
      for (let i = 0; i < n; i++) {
        arr[i] = args[2];
      }
      return { kind: "nstack", n: args[0], nodes: arr } as ast.ASTNStack;
    }
    case lex.TokenKind.NStack1: {
      let n = parseInt(args[0].val);
      let arr = new Array(n);
      for (let i = 0; i < n; i++) {
        arr[i] = JSON.parse(JSON.stringify(args[2]));
      }
      return { kind: "nstack1", n: args[0], nodes: arr } as ast.ASTNStack1;
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
      NUMBER,
      alt(tok(lex.TokenKind.NStack), tok(lex.TokenKind.NStack1)),
      ZXSTACKCOMPOSE
    ),
    applyNStack
  )
);

ZXCAST.setPattern(
  apply(
    seq(
      kright(tok(lex.TokenKind.Cast$), NUMBER),
      kright(tok(lex.TokenKind.Comma), NUMBER),
      kmid(tok(lex.TokenKind.Cast3Colon), ASTNODE, tok(lex.TokenKind.Cast$))
    ),
    applyCast
  )
);

ZXPROPTO.setPattern(
  apply(
    seq(
      alt(ZXSTACKCOMPOSE, ZXNSTACK, ZXCAST),
      tok(lex.TokenKind.PropTo),
      alt(ZXSTACKCOMPOSE, ZXNSTACK, ZXCAST)
    ),
    applyPropTo
  )
);

function applyPropTo(args: [ast.ASTNode, Token, ast.ASTNode]): ast.ASTNode {
  return { kind: "propto", l: args[0], r: args[2] } as ast.ASTPropTo;
}

ASTNODE.setPattern(alt(ZXSTACKCOMPOSE, ZXNSTACK, ZXCAST, ZXPROPTO));

export function parseAST(expr: string): ast.ASTNode {
  let parsed = expectSingleResult(
    expectEOF(ASTNODE.parse(lex.lexer.parse(expr)))
  );
  return parsed;
}
