import * as vscode from "vscode";
import * as parser from "../parsing/parser";
import * as sizer from "../parsing/sizes";
import * as coord from "../parsing/coords";
import { boundary, setCanvasWidthHeight } from "../constants/variableconsts";
import * as ast from "../parsing/ast";
import { getCanvasHtml } from "../webview/webview";
import * as c from "../constants/consts";
import { str } from "typescript-parsec";

let openWebview: vscode.WebviewPanel | undefined = undefined;

function is_potentially_valid(expr: string | undefined): boolean {
  if (!expr || expr.length === 0) {
    return false; // Empty expression is not valid
  }
  const is_semantic_eval = expr.includes("⟧");
  if (is_semantic_eval) {
    return false; // If it contains semantic evaluation, we know it's not a diagram
  }

  // Check for vyzx operators

  const ops = [
    "Z",
    "X",
    c.N_STACK_OP,
    c.COMPOSE_OP,
    c.STACK_OP,
    c.N_STACK_1_OP,
    c.PROP_TO,
    c.CAP,
    c.CUP,
    c.WIRE,
    c.BOX,
    c.SWAP,
    c.EMPTY,
    c.TRANSPOSE_TRANSFORM,
    c.CONJUGATE_TRANSFORM,
    c.ADJOINT_TRANSFORM,
    c.COLORSWAP_TRANSFORM,
    c.FLIP_TRANSFORM,
  ];

  return ops.some((op) => expr.includes(op));
}

function createGitHubIssue(expr: string | [string, string], e: any, stage: string): vscode.Uri {
  function makeCodeStyling(text: string): string {
    return `\`\`\`${text}\`\`\``; // Use backticks for inline code styling
  }
  const issueTitle = encodeURIComponent("ViZX: Parsing error");
  let exprs: string;
  if (typeof expr === "string") {
    exprs = makeCodeStyling(expr);
  } else {
    exprs = `${makeCodeStyling(expr[0])}\n${makeCodeStyling(expr[1])}`;
  }
  const issueBody = encodeURIComponent(
    `**Stage:**\n${stage}\n\n**Expression:**\n${exprs}n\n**Error:**\n\`\`\`\n${e?.message ?? e
    }\n\`\`\``
  );
  const githubIssueUrl = `https://github.com/inQWIRE/VizX/issues/new?title=${issueTitle}&body=${issueBody}`;
  return vscode.Uri.parse(githubIssueUrl);
}

/**
 * Remove any qualifiers from the expression.
 * So this will turn forall x, exists y, z into a tuple ("forall x, exists y", "z").
 * @param expr The string expression to strip qualifiers from
 * @returns A tuple of the stripped expression and the remaining part
 */
function stripQualifiers(expr: string): [string, string] {
  // This regex matches any sequence of "forall" or "exists" followed by a variables and a comma. 
  // Note that .+? means it will match as few characters as possible, ensuring capturing of the comma. (lazy matching)
  // The regex matches as many qualifiers as possible, so it will match "forall x, exists y, z" as "forall x, exists y,".
  const regex = /^((?:forall|exists|∀|∃)\s+.+?,\s*)+/gu;
  const match = expr.match(regex);
  if (match) {
    const strippedExpr = expr.replace(regex, "").trim();
    const qualifiers = match[0].trim();
    return [qualifiers, strippedExpr];
  }
  return ["", expr.trim()]; // No qualifiers found, return the original expression
}

export function render(
  context: vscode.ExtensionContext,
  exprStr: string,
  manual: boolean = true
): void {
  const createIssueText = "Create GitHub Issue";
  const manualStr = manual ? " (manual)" : "";
  if (exprStr.includes("@")) {
    vscode.window
      .showWarningMessage(
        "Could not render the expression. Please disable Set Printing All. If you believe this is a bug, please create a GitHub issue.",
        createIssueText
      )
      .then((selection) => {
        if (selection === createIssueText) {
          vscode.env.openExternal(
            createGitHubIssue(
              exprStr,
              "Set Printing All is enabled",
              "Precheck" + manualStr
            )
          );
        }
      });
    return;
  }
  const [qualifiers, strippedExpr] = stripQualifiers(exprStr);
  let node: ast.ASTNode;
  try {
    node = parser.parseAST(strippedExpr);
  } catch (e: any) {
    // Allow user to create a GitHub issue right then and there, so we can debug the problem
    vscode.window
      .showErrorMessage(
        `Could not parse the expression. Error: ${e?.message ?? e}`,
        createIssueText
      )
      .then((selection) => {
        if (selection === createIssueText) {
          vscode.env.openExternal(
            createGitHubIssue([qualifiers, strippedExpr], e, "Parsing" + manualStr)
          );
        }
      });
    return;
  }
  try {
    node = sizer.addSizes(node);
    console.log("sized node: ", node);
    const size = sizer.determineCanvasWidthHeight(node);
    setCanvasWidthHeight(size);
    node = coord.addCoords(node, boundary);
  } catch (e: any) {
    vscode.window
      .showErrorMessage(
        `Could not render the expression. Error: ${e?.message ?? e}`,
        createIssueText
      )
      .then((selection) => {
        if (selection === createIssueText) {
          vscode.env.openExternal(
            createGitHubIssue([qualifiers, strippedExpr], e, "Rendering" + manualStr)
          );
        }
      });
    return;
  }
  if (openWebview !== undefined) {
    openWebview.dispose();
  }
  const panel = vscode.window.createWebviewPanel(
    "ViZX",
    `ViZX: ${exprStr}`,
    {
      viewColumn: vscode.ViewColumn.Three,
      preserveFocus: true,
    },
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );
  panel.onDidDispose(
    async () => {
      console.log("openWebview before: ", openWebview);
      openWebview = undefined;
    },
    null,
    context.subscriptions
  );
  const strippedQualifiers = qualifiers.slice(0, -1); // Remove trailing comma since it looks weird
  openWebview = panel;
  panel.webview.html = getCanvasHtml(panel, context);
  panel.webview.onDidReceiveMessage((msg) => console.log(msg));
  panel.webview.postMessage({ command: JSON.stringify(node), qualifiers: strippedQualifiers });
}

export function renderCallback(
  context: vscode.ExtensionContext,
  expr: any
): void {
  if (expr === undefined) {
    return;
  }
  // If the expression is a Coq LSP

  if (expr.goals === undefined) {
    // extract correct field from lsp information
    return;
  }
  const exprStr = expr.goals.goals[0].ty.toString();
  if (!is_potentially_valid(exprStr)) {
    return;
  }
  render(context, exprStr, false);
}
