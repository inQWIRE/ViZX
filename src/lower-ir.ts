import { Layout } from "./layout"
import * as AST from "./ast"
import * as c from "./consts"
import { assert } from "console"


type Result = string

export abstract class LoweredItem {
  x: number[]
  y: number[]
  width: number
  height: number
  children: LoweredItem[]

  constructor(x: number[], y: number[], width: number, height: number, children: LoweredItem[]) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.children = children;
  }

  renderAll(): Result[] {
    let res = [this.render()]
    for (var i in this.children) {
      res = res.concat(this.children[i].renderAll())
    }
    return res
  }

  getOffsetX(): number[] {
    return this.x.map(x => x_offset + x)
  }

  getOffsetY(): number[] {
    return this.y.map(y => y_offset + y)
  }

  protected abstract render(): Result
}

type BaseColor = 'red' | 'green' | 'white'

class BaseItem {
  color: BaseColor
  rotation: string
  nIn: string
  nOut: string
  constructor(color: BaseColor, rotation: string, nIn: string, nOut: string) {
    this.color = color
    this.rotation = rotation
    this.nIn = nIn
    this.nOut = nOut
  }
}

const x_offset = 100
const y_offset = 100

class Base extends LoweredItem {
  baseItem: BaseItem
  constructor(x: number, y: number, width: number, height: number, baseItem: BaseItem) {
    super([x], [y], width, height, []);
    this.baseItem = baseItem
  }

  render(): Result {
    return `createZXNode({ color: '${this.baseItem.color}', rotation: '${this.baseItem.rotation}', nIn: '${this.baseItem.nIn}', nOut: '${this.baseItem.nOut}' }, ${this.getOffsetX()[0]}, ${this.getOffsetY()[0]}, ${this.width}, ${this.height})`
  }
}

class Compose extends LoweredItem {
  constructor(x: number[], y: number[], width: number, height: number, children: [LoweredItem, LoweredItem]) {
    assert(x.length == 2, 'Composition is expected to have two width values')
    assert(y.length == 1, 'Composition is expected to have one height value')
    super(x, y, width, height, children);
  }

  render(): Result { return `createCompose(${this.getOffsetX()[0]}, ${this.getOffsetY()[0]}, ${this.getOffsetY()[1]}, ${this.children[0].width}, ${this.children[1].width}, ${this.children[0].height})` }
}
class Stack extends LoweredItem {
  constructor(x: number[], y: number[], width: number, height: number, children: [LoweredItem, LoweredItem]) {
    assert(x.length == 1, 'Stack is expected to have one width value')
    assert(y.length == 2, 'Stack is expected to have two height values')
    super(x, y, width, height, children);
  }

  render(): Result { return `createStack(${this.getOffsetX()[0]}, ${this.getOffsetY()[0]}, ${this.getOffsetY()[1]}, ${this.children[0].width}, ${this.children[0].height}, ${this.children[1].height})` }
}

class NStack extends LoweredItem {
  n: string
  constructor(x: number, y: number, width: number, height: number, child: LoweredItem, n: string) {
    super([x], [y], width, height, [child]);
    this.n = n
  }

  render(): Result { return `createNStackArb(${this.n}, ${this.getOffsetX()[0]}, ${this.getOffsetY()[0]}, ${this.children[0].width}, ${this.children[0].height})` }
}

class CastItem {
  nIn: string
  nOut: string
  constructor(nIn: string, nOut: string) {
    this.nIn = nIn
    this.nOut = nOut
  }

}

class Cast extends LoweredItem {
  castItem: CastItem
  constructor(x: number, y: number, width: number, height: number, child: LoweredItem, castItem: CastItem) {
    super([x], [y], width, height, [child]);
    this.castItem = castItem
  }
  render(): Result { return `createCast(${this.castItem.nIn}, ${this.castItem.nOut}, ${this.getOffsetX()[0]}, ${this.getOffsetY()[0]}, ${this.children[0].width}, ${this.children[0].height})` }
}

export function toLower(layout: Layout): LoweredItem {
  return nodeToLower(layout.rootNode, layout)
}

function nodeToLower(ast: AST.ASTNode, layout: Layout): LoweredItem {
  const sizedAstNode = layout.sizedMap.get(ast)
  if (!sizedAstNode) {
    throw new Error(`Cannot lower non-renderable node of type ${ast.type}!`);
  }
  if (sizedAstNode.toPrettyPrint) {
    throw new Error(`Lowering of node to be pretty printed is invalid (node type: ${ast.type})`)
  }
  switch (ast.type) {
    case c.termBinOpType:
      const binop = ast as AST.ASTBinOp
      // if left and right minSizes mismatch increase one size
      // if required size differes from minSize, figure out which one to resize recursively
      if (!(binop.op === c.compOp || binop.op === c.stackOp)) {
        throw new Error(`Cannot lower mathematical operations (operator ${binop.op})`)
      }
      const binOpChildren: [LoweredItem, LoweredItem] = [nodeToLower(binop.l, layout), nodeToLower(binop.r, layout)]
      if (binop.op === c.compOp) {
        return new Compose(sizedAstNode.x, sizedAstNode.y, sizedAstNode.requiredWidth, sizedAstNode.requiredHeight, binOpChildren)
      } else {
        return new Stack(sizedAstNode.x, sizedAstNode.y, sizedAstNode.requiredWidth, sizedAstNode.requiredHeight, binOpChildren)
      }
    case c.termNStackType:
      const nStack = ast as AST.ASTNStack
      const nStackChild = nodeToLower(nStack.exp, layout)
      const n = AST.prettyPrint(nStack.n)
      return new NStack(sizedAstNode.x[0], sizedAstNode.y[0], sizedAstNode.requiredHeight, sizedAstNode.requiredHeight, nStackChild, n)
    case c.termCastType:
      const cast = ast as AST.ASTCast
      const castChild = nodeToLower(cast.exp, layout)
      const [newIn, newOut] = [AST.prettyPrint(cast.in), AST.prettyPrint(cast.out)]
      const castItem = new CastItem(newIn, newOut)
      return new Cast(sizedAstNode.x[0], sizedAstNode.y[0], sizedAstNode.requiredHeight, sizedAstNode.requiredHeight, castChild, castItem)
    case c.termZType:
    // fallthrough 
    case c.termXType:
      // fallthrough
      const spider = ast as AST.ASTSpider
      const [nIn, nOut, rot] = [AST.prettyPrint(spider.in), AST.prettyPrint(spider.out), AST.prettyPrint(spider.alpha)]
      const spiderCol = ast.type === c.termZType ? 'green' : 'red'
      const spiderItem = new BaseItem(spiderCol, rot, nIn, nOut)
      return new Base(sizedAstNode.x[0], sizedAstNode.y[0], sizedAstNode.requiredHeight, sizedAstNode.requiredHeight, spiderItem);
    case c.termBaseType:
      const baseTerm = ast as AST.ASTBaseTerm
      const [baseIn, baseOut] = baseToIO(baseTerm.val)
      const baseItem = new BaseItem('white', baseTerm.val, `${baseIn}`, `${baseOut}`)
      return new Base(sizedAstNode.x[0], sizedAstNode.y[0], sizedAstNode.requiredHeight, sizedAstNode.requiredHeight, baseItem);
    case c.stringType:
      const arbDiagVal = AST.prettyPrint(ast)
      const arbDiagItem = new BaseItem('white', arbDiagVal, '', '')
      return new Base(sizedAstNode.x[0], sizedAstNode.y[0], sizedAstNode.requiredHeight, sizedAstNode.requiredHeight, arbDiagItem);
  }
  throw new Error(`Cannot lower ast type ${ast.type}`)
}

function baseToIO(baseString: string): [number, number] {
  switch (baseString) {
    case c.wire:
    case c.box:
      return [1, 1]
    case c.cap:
      return [0, 2]
    case c.cup:
      return [2, 0]
    case c.swap:
      return [2, 2]
    case c.empty:
    default:
      return [0, 0]
  }
}