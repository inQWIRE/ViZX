// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as parser from "./parsing/parser";
import * as sizer from "./parsing/sizes";
import * as coord from "./parsing/coords";
import { boundary, setCanvasWidthHeight, scaleUp, scaleDown } from "./constants/consts";
import * as consts from "./constants/consts";
import * as ast from "./parsing/ast";
import { getCanvasHtml } from "./webview/webview";

let openTabNames : String[] = [];
let openWebview : vscode.WebviewPanel | undefined = undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ViZX" is now active!');
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("vizx.render", () => {
    const inputBox = vscode.window
      .showInputBox()
      .then((expr) => renderCallback(context, expr));
  });
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand("vizx.lspRender", (expr) =>
    renderCallback(context, expr)
  );
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand("vizx.activateRendering", () => {
    vscode.window.showInformationMessage(
      "Automatic rendering is now turned on."
    );
  });
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand("vizx.deactivateRendering", () => {
    deactivate();
    (vscode.window.showInformationMessage(
      "Automatic rendering is now turned off."
    ));
  });
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand("vizx.scaleUp", () => {
    scaleUp();
    console.log("SCALE: ", consts.SCALE, " HEIGHT: ", consts.CANVAS_HEIGHT, "WIDTH: ", consts.CANVAS_WIDTH)
  });
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand("vizx.scaleDown", () => {
    scaleDown();
    console.log("SCALE: ", consts.SCALE, " HEIGHT: ", consts.CANVAS_HEIGHT, "WIDTH: ", consts.CANVAS_WIDTH)
  });
  context.subscriptions.push(disposable);
}

function renderCallback(context: vscode.ExtensionContext, expr: any) {
  {
    if (expr === undefined) {
      console.log("no expression to be rendered");
      return;
    }
    if (expr.arg1 !== undefined) {
      // extract correct field from lsp information
      expr = expr.goals.goals[0].ty;
    }
    console.log("expr: ", expr);
    if(openTabNames.includes(expr)) {
      return;
    }
    openTabNames.push(expr);
    let node: ast.ASTNode;
    try {
      node = parser.parseAST(expr);
      node = sizer.addSizes(node);
      const size = sizer.determineCanvasWidthHeight(node);
      console.log("size = ", size);
      setCanvasWidthHeight(size);
      node = coord.addCoords(node, boundary);
    } catch (e) {
      vscode.window.showErrorMessage(
        `Error rendering your VyZX expression (${expr}): ${e}`
      );
      return;
    }
    if (openWebview !== undefined) {
      openWebview.dispose();
    }
    const panel = vscode.window.createWebviewPanel(
      "ViZX",
      `ViZX: ${expr}`,
      vscode.ViewColumn.Three,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );
    openWebview = panel;
    panel.webview.html = getCanvasHtml(panel, context);
    panel.webview.onDidReceiveMessage((msg) => console.log(msg));
    panel.webview.postMessage({ command: JSON.stringify(node) });
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
