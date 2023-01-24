import { isPropTo, isVyzxAst, parse } from "./ast";
import { Layout } from "./layout";
import { toLower } from "./lower-ir";

export function exprToInstructions(expr: string): string[] {
  const ast = parse(expr)
  console.log(JSON.stringify(ast))
  if (isPropTo(ast)) {
    throw new Error("Prop to is not yet supported")
  }
  if (!isVyzxAst(ast)) {
    throw new Error("Not a VyZX expression");
  }
  const layout = new Layout(ast)
  const lower = toLower(layout)
  console.log(JSON.stringify(lower))
  return lower.renderAll()
}