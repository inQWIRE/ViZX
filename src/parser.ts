import * as psec from 'typescript-parsec';
import { rule, alt, tok, seq, lrec_sc, apply, kmid, expectEOF, expectSingleResult, kright, kleft, opt_sc, rep_sc } from 'typescript-parsec';

// https://github.com/microsoft/ts-parsec/blob/master/doc/ParserCombinators.md

// TODO add propto
import * as ast from './ast';
import * as lex from './lexer';

type Token = psec.Token<lex.TokenKind>;

function applyNumber(value: Token): ast.Num {
    return { val: value.text, kind: 'num' } as ast.Number;
}

function applyVar(value: Token): ast.Num {
    return { val: value.text, kind: 'var' } as ast.Var;
}

function applySign(value: [Token, ast.Num]): ast.Num {
    switch (value[0].kind) {
        case lex.TokenKind.Add: {
            return { sign: '+', val: value[1].val, kind: 'num' } as ast.Number;
        }
        case lex.TokenKind.Sub: {
        return { sign: '-', val: value[1].val, kind: 'num' } as ast.Number; 
        }
        default: {
            throw new Error(`Unknown unary operator: ${value[0].text}`);
        }
    };
}

function applyBinOp(fst: ast.Num, snd: [Token, ast.Num]): ast.Num {
    switch (snd[0].kind) {
        case lex.TokenKind.Add: {
            return { val: '+', left: fst, right: snd[1], kind: 'num' } as ast.ArithOp;
        }
        case lex.TokenKind.Sub: {
            return { val: '-', left: fst, right: snd[1], kind: 'num' } as ast.ArithOp;
        }
        case lex.TokenKind.Mul: {
            return { val: '*', left: fst, right: snd[1], kind: 'num' } as ast.ArithOp;
        }
        case lex.TokenKind.Div: {
            return { val: '/', left: fst, right: snd[1], kind: 'num' } as ast.ArithOp;
        }
        default: {
            throw new Error(`Unknown binary operator: ${snd[0].text}`);
        }
    };
}

function applyNumFunc(args: [Token, ast.Num[]]) : ast.Num {
    return { kind: 'func', fname: args[0].text, args:args[1], val: `${args[0].text}(${args[1].join(', ')})`} as ast.NumFunc;
}

// numbers
const NUMBASETERM = rule<lex.TokenKind, ast.Num>();
const NUMMIDTERM = rule<lex.TokenKind, ast.Num>();
const NUMBER = rule<lex.TokenKind, ast.Num>();


NUMBASETERM.setPattern(
    alt(
        apply(
            tok(lex.TokenKind.Nat), 
            applyNumber
        ),
        apply(
            seq(
                alt(
                    tok(lex.TokenKind.Add),
                    tok(lex.TokenKind.Sub)),
                NUMBASETERM
                ),
            applySign
        ),
        kmid(
            tok(lex.TokenKind.LParen),
            NUMBER,
            tok(lex.TokenKind.RParen)
        ),
        apply(
            seq(
                kleft(
                    tok(lex.TokenKind.Str),
                    tok(lex.TokenKind.LParen)
                    ),
                kleft(
                    rep_sc(
                        kleft(
                            NUMBER, 
                            opt_sc(
                                tok(lex.TokenKind.Comma)
                                )
                            )
                    ),
                    tok(lex.TokenKind.RParen)
                    )
            ),
            applyNumFunc
        ),
        apply(
            tok(lex.TokenKind.Str),
            applyVar
        )
    )
);

NUMMIDTERM.setPattern(
    lrec_sc(NUMBASETERM,
        seq(
            alt(
                tok(lex.TokenKind.Mul), 
                tok(lex.TokenKind.Div)), 
            NUMBASETERM
            ), 
        applyBinOp)
);

NUMBER.setPattern(
    lrec_sc( NUMMIDTERM,
        seq( 
            alt(tok(lex.TokenKind.Add), 
                tok(lex.TokenKind.Sub)), 
            NUMMIDTERM
            ), 
        applyBinOp
    )
);

// ZXConsts

const ZXBASETERM = rule<lex.TokenKind, ast.ASTNode>();
const ZXSTACKCOMPOSE = rule<lex.TokenKind, ast.ASTNode>();
const ZXNSTACK = rule<lex.TokenKind, ast.ASTNode>();
const ZXCAST = rule<lex.TokenKind, ast.ASTNode>();
const ASTNODE = rule<lex.TokenKind, ast.ASTNode>();

function applyConst(value: Token): ast.ASTNode {
    switch(value.kind) {
        case lex.TokenKind.Box: {
            return { kind: 'const', val: ast.ZXConst.Box } as ast.ASTConst;
        }
        case lex.TokenKind.Cap: {
            return { kind: 'const', val: ast.ZXConst.Cap } as ast.ASTConst;
        }
        case lex.TokenKind.Cup: {
            return { kind: 'const', val: ast.ZXConst.Cup } as ast.ASTConst;
        }
        case lex.TokenKind.Empty: {
            return { kind: 'const', val: ast.ZXConst.Empty } as ast.ASTConst;
        }
        case lex.TokenKind.Wire: {
            return { kind: 'const', val: ast.ZXConst.Wire } as ast.ASTConst;
        }
        case lex.TokenKind.Swap: {
            return { kind: 'const', val: ast.ZXConst.Swap } as ast.ASTConst;
        }
        default: {
            throw new Error(`Unknown const: ${value.kind}`);
        }
    };
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
                tok(lex.TokenKind.Swap),
            ),
            applyConst
        ),
        apply(
            seq(
                opt_sc(
                    tok(lex.TokenKind.ColorSwap)
                ),
                seq(
                    alt(
                        tok(lex.TokenKind.XToken),
                        tok(lex.TokenKind.ZToken)
                    ),
                    NUMBER,
                    NUMBER,
                    NUMBER,
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
        kmid(
            tok(lex.TokenKind.LParen),
            ASTNODE,
            tok(lex.TokenKind.RParen)
        )

    )
);

function applySpider(args: [Token | undefined, [Token, ast.Num, ast.Num, ast.Num], Token | undefined] ): ast.ASTNode {
    let spider: ast.ASTSpider;
    switch (args[1][0].kind) {
        case lex.TokenKind.XToken: {
            spider = { kind: 'spider', val: 'X', in: args[1][1], out: args[1][2], alpha: args[1][3] };
            spider = addTransform(args[0], spider, args[2]);
            break;
        }
        case lex.TokenKind.ZToken: {
            spider = { kind: 'spider', val: 'Z', in: args[1][1], out: args[1][2], alpha: args[1][3] };
            spider = addTransform(args[0], spider, args[2]);
            break;
        }
        default: {
            console.log("nooo spider type?");
            throw new Error(`Unknown spider: ${args[1][0].kind}`);
        }
    };
    return spider;
}

function addTransform(pre: Token | undefined, spider: ast.ASTSpider, post: Token | undefined) : ast.ASTSpider {
    if (pre !== undefined) {
        if (pre.kind === lex.TokenKind.ColorSwap) {
            spider.transform = ast.MTransform.ColorSwap;
        }
    }
    if (post !== undefined) {
        if (post.kind === lex.TokenKind.Adjoint) {
            spider.transform = ast.MTransform.Adjoint;
        }
        if (post.kind === lex.TokenKind.Conjugate) {
            spider.transform = ast.MTransform.Conjugate;
        }
        if (post.kind === lex.TokenKind.Transpose) {
            spider.transform = ast.MTransform.Transpose;
        }
    }
    return spider;
}

ZXSTACKCOMPOSE.setPattern(
    lrec_sc(
        ZXBASETERM,
        seq(
            alt(
                tok(lex.TokenKind.Stack),
                tok(lex.TokenKind.Compose)
                ),
            ZXBASETERM,
            ),
        applyStackCompose
    )
);

function applyStackCompose(l: ast.ASTNode, args: [Token, ast.ASTNode]): ast.ASTNode {
    console.log('calling applyCompose');
    switch(args[0].kind) {
        case lex.TokenKind.Compose: {
            return { kind: 'compose', left: l, right: args[1] } as ast.ASTCompose;
        }
        case lex.TokenKind.Stack: {
            return { kind: 'stack', left: l, right: args[1] } as ast.ASTStack;
        }
        default: {
            // throw new Error(`Unknown compose: ${args[0].text}`);
            return l;
        }
    };
}


function applyNStack(args: [ast.Num, Token, ast.ASTNode]): ast.ASTNode {
    switch(args[1].kind) {
        case lex.TokenKind.NStack: {
            return { kind: 'nstack', n: args[0], node: args[2] } as ast.ASTNStack;
        }
        default: {
            throw new Error(`Unknown nstack???: ${args[1].kind}`);
        }
    };
}

function applyCast(args: [ast.Num, ast.Num, ast.ASTNode]) : ast.ASTNode {
    return { kind: 'cast', n: args[0], m: args[1], node: args[2] } as ast.ASTCast;
}

ZXNSTACK.setPattern(
    apply(
        seq(
            NUMBER,
            tok(lex.TokenKind.NStack),
            ZXSTACKCOMPOSE
        ),
        applyNStack
    )
);

ZXCAST.setPattern(
    apply(
        seq(
            kright(
                tok(lex.TokenKind.Cast$),
                NUMBER
                ),
            kright(
                tok(lex.TokenKind.Comma),
                NUMBER
                ),
            kmid(
                tok(lex.TokenKind.Cast3Colon),
                alt(
                    ZXNSTACK, 
                    ZXSTACKCOMPOSE
                    ),
                tok(lex.TokenKind.Cast$)
                )
        ),
        applyCast
    )
);

ASTNODE.setPattern(
    alt(
        ZXSTACKCOMPOSE,
        ZXNSTACK,
        ZXCAST
    )
);

export function parseAST(expr: string) : ast.ASTNode {
    lex.lexerPrettyPrinter(expr);
    let parsed = expectSingleResult(expectEOF(ASTNODE.parse(lex.lexer.parse(expr))));
    console.log(parsed);
    return parsed;
}