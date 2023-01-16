import { isVyzxAst, parse } from "./ast";
import { Layout } from "./layout";
import { toLower } from "./lower-ir";

export function exprToInstructions(expr: string): string[] {
  const ast = parse(expr)
  if (!isVyzxAst(ast)) {
    throw new Error("Not a VyZX expression");
  }
  const layout = new Layout(ast)
  const lower = toLower(layout)
  return lower.renderAll()
}