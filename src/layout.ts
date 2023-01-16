import * as AST from './ast'
import * as c from './consts'

export class SizeASTNode {
  node: AST.ASTNode
  toPrettyPrint: boolean
  requiredWidth: number
  requiredHeight: number
  minWidth: number
  minHeight: number
  x: number[]
  y: number[]

  constructor(node: AST.ASTNode, prettyPrint: boolean, w: number, h: number) {
    this.node = node
    this.minHeight = h
    this.requiredHeight = h
    this.minWidth = w
    this.requiredWidth = w
    this.toPrettyPrint = prettyPrint
    this.x = []
    this.y = []
  }

}

export class Layout {
  sizedMap: Map<AST.ASTNode, SizeASTNode>
  rootNode: AST.ASTNode

  constructor(rootNode: AST.ASTNode) {
    this.rootNode = rootNode
    this.sizedMap = new Map<AST.ASTNode, SizeASTNode>();
    this.makeSized(rootNode)
    this.buildRequiredSizes(rootNode)
    this.buildCoords(rootNode, 50, 50)
  }

  private makeSized(ast: AST.ASTNode) {
    switch (ast.type) {
      case c.termBinOpType:
        const binop = ast as AST.ASTBinOp
        if (!(binop.op === c.compOp || binop.op === c.stackOp)) {
          this.sizedMap.set(ast, new SizeASTNode(ast, true, 0, 0))
          break
        }
        this.makeSized(binop.l)
        this.makeSized(binop.r)
        const sl = this.sizedMap.get(binop.l)!
        const sr = this.sizedMap.get(binop.r)!
        if (binop.op === c.compOp) {
          const newWidth = sl.minWidth + sr.minWidth + 4 * c.xpad
          const newHeight = Math.max(sl.minHeight, sr.minHeight) + 2 * c.ypad
          this.sizedMap.set(ast, new SizeASTNode(ast, false, newWidth, newHeight))
        } else if (binop.op === c.stackOp) {
          const newWidth = Math.max(sl.minWidth, sr.minWidth) + 2 * c.xpad
          const newHeight = sl.minHeight + sr.minHeight + 4 * c.ypad
          this.sizedMap.set(ast, new SizeASTNode(ast, false, newWidth, newHeight))
        }
        break
      case c.stringType:
        this.sizedMap.set(ast, new SizeASTNode(ast, true, 0, 0))
        break
      case c.numberType:
        this.sizedMap.set(ast, new SizeASTNode(ast, true, 0, 0))
        break
      case c.termBaseType:
        this.sizedMap.set(ast, new SizeASTNode(ast, false, 100, 100))
        break
      case "Z":
      // fallthrough
      case "X":
        this.sizedMap.set(ast, new SizeASTNode(ast, false, 100, 100))
        break
      case c.termNStackType:
        const nStack = ast as AST.ASTNStack
        this.makeSized(nStack.exp)
        const se = this.sizedMap.get(nStack.exp)!
        this.sizedMap.set(ast, new SizeASTNode(ast, false, se.minWidth + c.widthStack + 2 * c.xpad, se.minHeight + 2 * c.ypad))
        break
      case c.termCastType:
        const cast = ast as AST.ASTCast
        this.makeSized(cast.exp)
        const caseSe = this.sizedMap.get(cast.exp)!
        this.sizedMap.set(ast, new SizeASTNode(ast, false, caseSe.minWidth + 15 * 2 + c.xpad * 2, caseSe.minHeight + c.ypad * 4 + 15))
        break
      case c.termArgsType: // Ignoring functions for now
        // return makeSized((ast as ASTArgs).arg)
        break
      case c.multTermArgsType:
        // const multArgs = ast as ASTMultArgs
        break
      case c.termFnType:
        // const fn = ast as ASTFn
        this.sizedMap.set(ast, new SizeASTNode(ast, true, 0, 0))
        break
    }
  }

  private buildRequiredSizes(ast: AST.ASTNode): void {
    const sizedAstNode = this.sizedMap.get(ast)
    if (!sizedAstNode) {
      return
    }
    const widthDiff = sizedAstNode!.requiredWidth - sizedAstNode!.minWidth
    const heightDiff = sizedAstNode!.requiredHeight - sizedAstNode!.minHeight
    switch (ast.type) {
      case c.termBinOpType:
        const binop = ast as AST.ASTBinOp
        // if left and right minSizes mismatch increase one size
        // if required size differes from minSize, figure out which one to resize recursively

        if (!(binop.op === c.compOp || binop.op === c.stackOp)) {
          return
        }
        const lSized = this.sizedMap.get(binop.l)!
        const rSized = this.sizedMap.get(binop.r)!
        const binOpSized = this.sizedMap.get(binop)!

        if (binop.op === c.compOp) {
          lSized.requiredHeight = Math.max(rSized.minHeight, lSized.minHeight, binOpSized.requiredHeight)
          rSized.requiredHeight = lSized.requiredHeight
        } else {
          lSized.requiredWidth = Math.max(rSized.minWidth, lSized.minWidth, binOpSized.requiredWidth)
          rSized.requiredWidth = lSized.requiredWidth
        }

        if (binOpSized.requiredHeight != binOpSized.minHeight
          && binop.op == c.stackOp) {
          lSized.requiredHeight += Math.ceil(heightDiff / 2)
          rSized.requiredHeight += Math.floor(heightDiff / 2)
        } else if (binOpSized.requiredWidth != binOpSized.minWidth
          && binop.op === c.compOp) {
          lSized.requiredWidth += Math.ceil(widthDiff / 2)
          rSized.requiredWidth += Math.floor(widthDiff / 2)
        }
        this.buildRequiredSizes(binop.l)
        this.buildRequiredSizes(binop.r)
        return
      case c.termNStackType:
        const nStack = ast as AST.ASTNStack
        let nStackNestedExp = this.sizedMap.get(nStack.exp)!
        nStackNestedExp.requiredHeight += heightDiff
        nStackNestedExp.requiredHeight += widthDiff
        this.sizedMap.set(nStack.exp, nStackNestedExp)
        this.buildRequiredSizes(nStack.exp)
        return
      case c.termCastType:
        const cast = ast as AST.ASTCast
        let castSizedNestedExp = this.sizedMap.get(cast.exp)!
        castSizedNestedExp.requiredHeight += heightDiff
        castSizedNestedExp.requiredHeight += widthDiff
        this.sizedMap.set(cast.exp, castSizedNestedExp)
        this.buildRequiredSizes(cast.exp)
        return
    }
  }

  private buildCoords(ast: AST.ASTNode, currx: number, curry: number): [number, number] {
    const sizedAstNode = this.sizedMap.get(ast)
    if (!sizedAstNode) {
      return [currx, curry]
    }
    switch (ast.type) {
      case c.termBinOpType:
        const binop = ast as AST.ASTBinOp
        // if left and right minSizes mismatch increase one size
        // if required size differes from minSize, figure out which one to resize recursively
        if (!(binop.op === c.compOp || binop.op === c.stackOp)) {
          return [currx, curry]
        }
        if (binop.op === c.compOp) {
          const [xl, _] = this.buildCoords(binop.l, currx, curry)
          const [xr, yr] = this.buildCoords(binop.r, xl, curry)
          sizedAstNode.x = [currx, xl]
          sizedAstNode.x = [curry]
          return [xr, yr]
        } else {
          const [_, yl] = this.buildCoords(binop.l, currx, curry)
          const [xr, yr] = this.buildCoords(binop.r, currx, yl)
          sizedAstNode.x = [currx]
          sizedAstNode.x = [curry, yl]
          return [xr, yr]
        }
      case c.termNStackType:
        const nStack = ast as AST.ASTNStack
        this.buildCoords(nStack.exp, currx, curry)
        sizedAstNode.x = [currx]
        sizedAstNode.y = [curry]
        break
      case c.termCastType:
        const cast = ast as AST.ASTCast
        this.buildCoords(cast.exp, currx, curry)
        sizedAstNode.x = [currx]
        sizedAstNode.y = [currx]
        break
      case c.termZType:
      // fallthrough 
      case c.termXType:
      // fallthrough
      case c.termBaseType:
        sizedAstNode.x = [currx]
        sizedAstNode.y = [curry]
        break
    }
    return [currx + sizedAstNode.requiredWidth, curry + sizedAstNode.requiredHeight]
  }

}