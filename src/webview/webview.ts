import { WebviewPanel, Uri, ExtensionContext } from "vscode";
import * as path from "path";

function getNonce(): string {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function getCanvasHtml(
  panel: WebviewPanel,
  context: ExtensionContext
): string {
  const basePath = context.extensionUri.fsPath;
  const nonce = getNonce();
  const scriptUri = panel.webview.asWebviewUri(
    Uri.file(path.join(basePath, "out", "render.js"))
  );
  const cssUri = panel.webview.asWebviewUri(
    Uri.file(path.join(basePath, "src", "rendering", "index.css"))
  );

  const html = `<!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <title>ZX</title>
      <link rel="stylesheet" href="${cssUri}">
      <script>var exports = {};</script>
      <script defer type="text/javascript" nonce="${nonce}" src="${scriptUri}""></script>  </head>
  <body>
       <button id="download-button-png">Download PNG</button>
       <canvas id="canvas" style="max-height: 400px; width: auto;"></canvas>
  </body>
  </html>
`;
  return html;
}
