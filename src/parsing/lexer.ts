import { buildLexer } from 'typescript-parsec';
import * as c from '../constants/consts';

export enum TokenKind {
    Nat,
    Str,
    NWire,
    Succ,
    R0,
    R1,

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
    Cast3Colon
};

// longest parse, ties broken by array index

// — ↕ (Z) n (S (S m)) α
export const lexer = buildLexer([
    [true, /^\d+/g, TokenKind.Nat],
    [true, /^[Z]/g, TokenKind.ZToken],
    [true, /^[X]/g, TokenKind.XToken],
    [true, /^R0/g, TokenKind.R0],
    [true, /^R1/g, TokenKind.R1],
    [true, /^nWire/g, TokenKind.NWire],

    [true, /^\$/g, TokenKind.Cast$],
    [true, /^:::/g, TokenKind.Cast3Colon],
    [true, /^S\s/g, TokenKind.Succ],
    [true, /^\(/g, TokenKind.LParen],
    [true, /^\)/g, TokenKind.RParen],

    [true, /^[A-WYa-zΑ-Ωα-ω][A-Za-zΑ-Ωα-ω0-9]*/g, TokenKind.Str],
    [true, /^\,/g, TokenKind.Comma],

    [true, new RegExp(`\^[${c.addOp}]`, 'g'), TokenKind.Add],
    [true, new RegExp(`\^[${c.subOp}]`, 'g'), TokenKind.Sub],
    [true, new RegExp(`\^[${c.mulOp}]`, 'g'), TokenKind.Mul],
    [true, new RegExp(`\^[${c.divOp}]`, 'g'), TokenKind.Div],
    [true, new RegExp(`\^[${c.rootOp}]`, 'g'), TokenKind.Root],
    [true, new RegExp(`\^[\\${c.expOp}]`, 'g'), TokenKind.Exp],

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
    [true, new RegExp(`\^[${c.flipTransform}]`, 'g'), TokenKind.Flip],

    [true,new RegExp(`\^[${c.stackOp}]`, 'g'), TokenKind.Stack],
    [true, new RegExp(`\^[${c.nStackOp}]`, 'g'), TokenKind.NStack],
    // TODO differentiate nstack, nstack1
    [true, new RegExp(`\^[${c.nStack1Op}]`, 'g'), TokenKind.NStack1],
    [true, new RegExp(`\^[${c.compOp}]`, 'g'), TokenKind.Compose],

    [true, new RegExp(`\^[${c.propTo}]`, 'g'), TokenKind.PropTo],

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