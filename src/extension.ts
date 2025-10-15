// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { coqLspApi, only_with_lsp } from "./lspguards";
import { render, renderCallback } from "./rendering/callback";
import { lexer, lexerPrettyPrinter, lexerPrettyPrinter_string } from "./parsing/lexer";

let history: string[] = [];
const HISTORY_LENGTH = vscode.workspace
  .getConfiguration("vizx")
  .get<number>("historyLength", 25);
const HISTORY_KEY = "vizxInputHistory";

let hook: vscode.Disposable | undefined = undefined;
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
  let disposables = [
    vscode.commands.registerCommand("vizx.render", () =>
      renderCommand(context)
    ),
  ];
  
  disposables.push(
    vscode.commands.registerCommand("vizx.lex", () =>
      lexCommand(context)
    )
  );

  disposables.push(
    vscode.commands.registerCommand("vizx.lspRender", (expr) =>
      renderCallback(context, expr)
    )
  );

  disposables.push(
    vscode.commands.registerCommand("vizx.activateRendering", () =>
      activateRenderingCommand(context)
    )
  );
  disposables.push(
    vscode.commands.registerCommand("vizx.deactivateRendering", () =>
      deactivateRenderingCommand()
    )
  );
  
  context.subscriptions.push(...disposables);

  const config = vscode.workspace.getConfiguration("vizx");
  const autoRenderingEnabled = config.get<boolean>(
    "enableAutomaticRendering",
    false
  );
  if (autoRenderingEnabled) {
    // Wait until a tab named "goals" exists before activating rendering
    activateRendering(context);
    if (hook === undefined) {
      vscode.window.showWarningMessage(
        "Automatic rendering is enabled, but the LSP hook could not be set up. Please ensure that the Coq LSP is running."
      );
    }
    vscode.window.showInformationMessage(
      "ViZX automatic rendering is now turned on."
    );
  } else {
    vscode.window
      .showInformationMessage(
        "ViZX automatic rendering is currently disabled.",
        "Enable",
        "OK"
      )
      .then((selection) => {
        if (selection === "Enable") {
          vscode.commands.executeCommand("vizx.activateRendering");
        }
      });
  }
}

function renderCommand(context: vscode.ExtensionContext): void {
  const newDiag = "New...";
  vscode.window
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
              render(context, value);
            }
          });
      } else {
        history = history.filter((item) => item !== selected);
        history.unshift(selected); // Add to the front of history
        context.workspaceState.update(HISTORY_KEY, history);
        render(context, selected);
      }
    });
}

function lexCommand(context: vscode.ExtensionContext): void {
  vscode.window
    .showInputBox({ prompt: "Enter diagram syntax with notations" })
    .then((value) => {
      if (value) {
        vscode.window
          .showInformationMessage(
            "Parsed expression: " + lexerPrettyPrinter_string(value),
            "Ok"
        )
      }
    }).then((selection) => {})
  return;
}

function activateRenderingCommand(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration("vizx");
  const enabled = config.get<boolean>("enableAutomaticRendering", false);
  if (!enabled) {
    // if disabled, then ask user if they want to enable it
    vscode.window
      .showInformationMessage(
        "Automatic rendering is currently disabled. Do you want to enable it?",
        "Enable for this project",
        "Enable globally"
      )
      .then((selection) => {
        if (selection === "Enable for this project") {
          config.update(
            "enableAutomaticRendering",
            true,
            vscode.ConfigurationTarget.Workspace
          );
        } else if (selection === "Enable globally") {
          config.update(
            "enableAutomaticRendering",
            true,
            vscode.ConfigurationTarget.Global
          );
        }
        activateRendering(context);
      });
    return;
  }
  vscode.window.showInformationMessage("Automatic rendering is now turned on.");
}

function deactivateRenderingCommand(): void {
  vscode.window
    .showInformationMessage(
      "Automatic rendering is now turned off.",
      "Deactivate for this project",
      "Deactivate globally"
    )
    .then((selection) => {
      if (selection === "Deactivate for this project") {
        vscode.workspace
          .getConfiguration("vizx")
          .update(
            "enableAutomaticRendering",
            false,
            vscode.ConfigurationTarget.Workspace
          );
      } else if (selection === "Deactivate globally") {
        vscode.workspace
          .getConfiguration("vizx")
          .update(
            "enableAutomaticRendering",
            false,
            vscode.ConfigurationTarget.Global
          );
      }
    });
  deactivateRendering();
}

function activateRendering(context: vscode.ExtensionContext): void {
  if (hook !== undefined) {
    return; // no need to recreate as it would be the exact same
  }
  only_with_lsp(() => {
    hook = coqLspApi!.onUserGoals((goals: any) =>
      renderCallback(context, goals)
    );
  });
}

function deactivateRendering() {
  hook?.dispose();
  hook = undefined;
}

// this method is called when your extension is deactivated
export function deactivate() {}
