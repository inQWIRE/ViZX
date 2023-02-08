export interface ASTNode {
    kind: string
  }

// TODO see if there is some way of initializing the interfaces? just so the kinds are pre-populated

export enum ZXConst {
    Swap,
    Empty,
    Wire,
    Box,
    Cap,
    Cup
}

export enum MTransform {
    Transpose,
    Adjoint,
    Conjugate,
    ColorSwap
}

// numbers are just strings because we don't want to actually evaluate them and we want "1 + 2 * 3" to be a valid number
// but we still have the ast for a specific expression, it's just that the kind of the ast is a number.
export interface Num {
    kind: string,
    val: string
}

export interface Str {
    kind: string,
    val: string
}

export interface Number extends Num {
    kind: 'num',
    sign?: '+' | '-',
    val: string
}

// variables are also just numbers
export interface Var extends Num {
    kind: 'var',
    val: string
}

export interface ArithOp extends Num {
    kind: 'num',
    val: '+' | '-' | '*' | '/',
    left: Num,
    right: Num
}

export interface ASTConst extends ASTNode {
    kind: 'const',
    val: ZXConst
}

export interface ASTSpider extends ASTNode {
    kind: 'spider',
    val: 'Z' | 'X',
    in: Num,
    out: Num,
    alpha: Num //TODO CHANGE
    transform?: MTransform
}

export interface ASTStack extends ASTNode {
    kind: 'stack',
    left: ASTNode,
    right: ASTNode
}

export interface ASTCompose extends ASTNode {
    kind: 'compose',
    left: ASTNode,
    right: ASTNode
}

export interface ASTNStack extends ASTNode {
    kind: 'nstack',
    n: Num,
    node: ASTNode
}

export interface ASTCast extends ASTNode {
    kind: 'cast',
    m: Num,
    n: Num,
    node: ASTNode
}
// TODO add
export interface NumFunc extends Num {
    kind: 'func',
    fname: string,
    args: [Num]
}

