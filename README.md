# ZXViz: A Visualizer for the ZX Calculus

To render manually, use command `Render Expressions with ZXViz`.
To render automatically, use command `Activate ZXViz automatic rendering`. To stop rendering automatically, use command `Deactivate ZXViz automatic rendering`.

## Requirements

Requires [coq-lsp](https://github.com/ejgallego/coq-lsp/) `0.1.7` for automatic rendering. Syntax of valid terms = valid ZX diagrams in VyZX. See src/CoreData/ZXCore for the base definitions, and src/CoreData/Proportional for proportionality definitions.

## Build

- If you have and trust the `.vsix` binary, you can skip this section. 
- Install [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) if you do not have it already.
- Install vsce using command `npm install -g @vscode/vsce`
- in the source directory for this project, run `npm i`.
- run `vsce package`.
- on running `ls`, you should be able to see `vizx-0.1.2.vsix`.

## Installation

- If the `code` command is functioning:
  - run `code --install-extension vizx-0.1.2.vsix`.
  - in the same terminal, run `code .`.
- If the `code` command is not functioning:
  - launch an instance of [VSCode](https://code.visualstudio.com/download).
  - Navigate to View > Extensions > ... > Install from VSIX.
  - Locate the `vizx-0.1.2.vsix` file you just created and select it.
- You should now be able to view `ZXViz` as an extension in the extensions tab, and use it in the required fashion.

## Extension Settings

This extension contributes the following settings:

- `vizx.render`: render a valid ZX diagram via manual input.
- `vizx.lspRender`: to communicate with coq-lsp for automatic rendering. should not be used manually.
- `vizx.activateRendering`: activates automatic rendering of goal state.
- `vizx.deactivateRendering`: deactivates automatic rendering of goal state.
