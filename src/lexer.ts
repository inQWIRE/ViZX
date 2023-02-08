import { buildLexer } from 'typescript-parsec';
import * as c from './consts';

export enum TokenKind {
    Nat,
    Str,

    ZToken,
    XToken,
    
    Add,
    Sub,
    Mul,
    Div,

    Swap,
    Empty,
    Wire,
    Box,
    Cap,
    Cup,

    Transpose,
    Conjugate,
    Adjoint,
    ColorSwap,

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
    Cast3Colon
};

// longest parse, ties broken by array index
export const lexer = buildLexer([
    [true, /^\d+/g, TokenKind.Nat],
    [true, /^[Z]\s/g, TokenKind.ZToken],
    [true, /^[X]\s/g, TokenKind.XToken],

    [true, /^\$/g, TokenKind.Cast$],
    [true, /^:::/g, TokenKind.Cast3Colon],    

    [true, /^[A-Za-zΑ-Ωα-ω]+/g, TokenKind.Str],
    [true, /^\,/g, TokenKind.Comma],

    [true, new RegExp(`\^[${c.addOp}]`, 'g'), TokenKind.Add],
    [true, new RegExp(`\^[${c.subOp}]`, 'g'), TokenKind.Sub],
    [true, new RegExp(`\^[${c.mulOp}]`, 'g'), TokenKind.Mul],
    [true, new RegExp(`\^[${c.divOp}]`, 'g'), TokenKind.Div],

    [true, new RegExp(`\^[${c.swap}]`, 'g'), TokenKind.Swap],
    [true, new RegExp(`\^[${c.empty}]`, 'g'), TokenKind.Empty],
    [true, new RegExp(`\^[${c.wire}]`, 'g'), TokenKind.Wire],
    [true, new RegExp(`\^[${c.box}]`, 'g'), TokenKind.Box],
    [true, new RegExp(`\^[${c.cap}]`, 'g'), TokenKind.Cap],
    [true, new RegExp(`\^[${c.cup}]`, 'g'), TokenKind.Cup],

    [true, new RegExp(`\^[${c.transposeTransform}]`, 'g'), TokenKind.Transpose],
    [true, new RegExp(`\^[${c.conjugateTransform}]`, 'g'), TokenKind.Conjugate],
    [true, new RegExp(`\^[${c.adjointTransform}]`, 'g'), TokenKind.Adjoint],
    [true, new RegExp(`\^[${c.colorswapTransform}]`, 'g'), TokenKind.ColorSwap],

    [true,new RegExp(`\^[${c.stackOp}]`, 'g'), TokenKind.Stack],
    [true, new RegExp(`\^[${c.nStackOp}]`, 'g'), TokenKind.NStack],
    [true, new RegExp(`\^[${c.nStack1Op}]`, 'g'), TokenKind.NStack1],
    [true, new RegExp(`\^[${c.compOp}]`, 'g'), TokenKind.Compose],

    [true, new RegExp(`\^[${c.propTo}]`, 'g'), TokenKind.PropTo],

    [true, /^\(/g, TokenKind.LParen],
    [true, /^\)/g, TokenKind.RParen],
    [false, /^\s+/g, TokenKind.Space],
]);

export function lexerPrettyPrinter (expr: string) {
    let lx = lexer.parse(expr);
    let printlx = "";
    while (lx) {
        printlx += (TokenKind[lx.kind]) + ", ";
        lx = lx?.next;
    }
    console.log(printlx);
}