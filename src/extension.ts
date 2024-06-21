// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as parser from "./parsing/parser";
import * as sizer from "./parsing/sizes";
import * as coord from "./parsing/coords";
import {
  boundary,
  setCanvasWidthHeight,
  changeScale,
} from "./constants/variableconsts";
import * as vconsts from "./constants/variableconsts";
import * as ast from "./parsing/ast";
import { getCanvasHtml } from "./webview/webview";

let openWebview: vscode.WebviewPanel | undefined = undefined;
let history: string[] = [];
const HISTORY_LENGTH = vscode.workspace.getConfiguration('vizx').get<number>('historyLength', 25);
const HISTORY_KEY = 'vizxInputHistory';
const SCALE_KEY = 'vizxScale';

function updateScale(context: vscode.ExtensionContext, scale: number) {
  context.workspaceState.update(SCALE_KEY, scale); // Save to workspaceState
  return changeScale(scale);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ViZX" is now active!');
  history = context.workspaceState.get<string[]>(HISTORY_KEY, []);
  let default_scale = context.workspaceState.get<number>(SCALE_KEY, 100);
  changeScale(default_scale);
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("vizx.render", () => {
    const newDiag = 'New...';
    const inputBox = vscode.window
      .showQuickPick([...history, newDiag], {
        placeHolder: 'Diagram syntax with notations',
        title: 'Enter or choose diagram'
      }
      ).then((selected) => {
        if (selected === undefined) {
          return;
        }
        else if (selected === newDiag) {
          vscode.window.showInputBox({ prompt: 'Enter diagram syntax with notations' })
            .then(value => {
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
          history = history.filter(item => item !== selected);
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
    }
  );

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand("vizx.exportscale", () => {
    updateScale(context, 1000);
    vscode.window.showInformationMessage(
      "ViZX now renders in export scale. Diagrams may seem overly large but will generate great PNGs. Please rerender to see effect"
    );
  });

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand("vizx.viewscale", () => {
    updateScale(context, 100);
    vscode.window.showInformationMessage(
      "ViZX now renders in view scale. Exporting diagrams is not recommended in this scale. Please rerender to see effect."
    );
  });

  disposable = vscode.commands.registerCommand("vizx.scale", () => {
    const inputBox = vscode.window
      .showInputBox({
        placeHolder: "100",
        prompt: "Enter relative scale value (default: 100)",
      }).then(scale => {
        if (scale !== undefined) {
          const match = scale.match(/^(\d+)(%)?$/);
          if (match) {
            const number = parseInt(match[1], 10);
            if (number > 0 && number < 10000) {
              updateScale(context, number);
              return;
            }
          }
        }
        vscode.window.showErrorMessage(
          "Please enter a valid number for the scale in the range of [1, 9999]"
        );
      })
  });
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
export function deactivate() { }
