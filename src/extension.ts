// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as parser from "./parsing/parser";
import * as sizer from "./parsing/sizes";
import * as coord from "./parsing/coords";
import { boundary, setCanvasWidthHeight } from "./constants/variableconsts";
import * as vconsts from "./constants/variableconsts";
import * as ast from "./parsing/ast";
import { getCanvasHtml } from "./webview/webview";

let openWebview: vscode.WebviewPanel | undefined = undefined;
let history: string[] = [];
const HISTORY_LENGTH = vscode.workspace
  .getConfiguration("vizx")
  .get<number>("historyLength", 25);
const HISTORY_KEY = "vizxInputHistory";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ViZX" is now active!');
  history = context.workspaceState.get<string[]>(HISTORY_KEY, []);
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("vizx.render", () => {
    const newDiag = "New...";
    const inputBox = vscode.window
      .showQuickPick([...history, newDiag], {
        placeHolder: "Diagram syntax with notations",
        title: "Enter or choose diagram",
      })
      .then((selected) => {
        if (selected === undefined) {
          return;
        } else if (selected === newDiag) {
          vscode.window
            .showInputBox({ prompt: "Enter diagram syntax with notations" })
            .then((value) => {
              if (value) {
                history.unshift(value); // Add to history
                if (history.length > HISTORY_LENGTH) {
                  history.pop(); // Limit history size
                }
                context.workspaceState.update(HISTORY_KEY, history); // Save to workspaceState
                renderCallback(context, value);
              }
            });
        } else {
          history = history.filter((item) => item !== selected);
          history.unshift(selected); // Add to the front of history
          context.workspaceState.update(HISTORY_KEY, history);
          renderCallback(context, selected);
        }
      });
  });

  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand("vizx.lspRender", (expr) =>
    renderCallback(context, expr)
  );
  context.subscriptions.push(disposable);
  let coqLspApi = vscode.extensions.getExtension("ejgallego.coq-lsp")!.exports;
  let hook = coqLspApi.onUserGoals((goals: any) =>
    vscode.commands.executeCommand("vizx.lspRender", goals)
  );

  disposable = vscode.commands.registerCommand("vizx.activateRendering", () => {
    vscode.window.showInformationMessage(
      "Automatic rendering is now turned on."
    );
  });
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand(
    "vizx.deactivateRendering",
    () => {
      deactivate();
      vscode.window.showInformationMessage(
        "Automatic rendering is now turned off."
      );
      hook.dispose();
    }
  );

  context.subscriptions.push(disposable);
}

function renderCallback(context: vscode.ExtensionContext, expr: any) {
  {
    if (expr === undefined) {
      console.log("no expression to be rendered");
      return;
    }
    if (expr.goals !== undefined) {
      // extract correct field from lsp information
      expr = expr.goals.goals[0].ty.toString();
    }
    console.log("expr: ", expr);
    let node: ast.ASTNode;
    try {
      node = parser.parseAST(expr);
      node = sizer.addSizes(node);
      console.log("sized node: ", node);
      const size = sizer.determineCanvasWidthHeight(node);
      setCanvasWidthHeight(size);
      node = coord.addCoords(node, boundary);
    } catch (e) {
      vscode.window.showErrorMessage(
        `Error rendering your expression (${expr}): ${e}`
      );
      return;
    }
    if (openWebview !== undefined) {
      openWebview.dispose();
    }
    const panel = vscode.window.createWebviewPanel(
      "ViZX",
      `ViZX: ${expr}`,
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
    openWebview = panel;
    panel.webview.html = getCanvasHtml(panel, context);
    panel.webview.onDidReceiveMessage((msg) => console.log(msg));
    panel.webview.postMessage({ command: JSON.stringify(node) });
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
