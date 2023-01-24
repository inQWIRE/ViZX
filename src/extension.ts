// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { receiveMessageOnPort } from 'worker_threads';
import { isVyzxAst, parse, prettyPrint } from './ast';
import { exprToInstructions } from './pipeline';
import { getCanvasHtml } from './webview';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vyzxviz" is now active!');

	const options: vscode.WebviewOptions = { enableScripts: true }
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vyzxviz.render', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const inputBox = vscode.window.showInputBox().then(expr => {
			if (expr === undefined) {
				return;
			}
			let instructions: string[];
			try {
				 instructions = exprToInstructions(expr)
			} catch (e) {
				vscode.window.showErrorMessage(`Error rendering your VyZX expression (${expr}): ${e}`)
				return
			}
			const panel = vscode.window.createWebviewPanel('VyZXViz', `VyZX Viz: ${expr}`, vscode.ViewColumn.One, options)
			panel.webview.html = getCanvasHtml(panel, context)
			panel.webview.onDidReceiveMessage(msg => console.log(msg))
			instructions.forEach(val => panel.webview.postMessage({ command: val }))
		})
	});


	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
