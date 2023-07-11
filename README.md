# ZXViz: A Visualizer for the ZX Calculus

To render manually, use command `Render Expressions with ZXViz`.
To render automatically, use command `Activate ZXViz automatic rendering`. To stop rendering automatically, use command `Deactivate ZXViz automatic rendering`.

## Requirements

Requires [coq-lsp](https://github.com/ejgallego/coq-lsp/) `0.1.7` for automatic rendering. Syntax of valid terms = valid ZX diagrams in VyZX. See src/CoreData/ZXCore for the base definitions, and src/CoreData/Proportional for proportionality definitions.

## Build

- Run `yarn`
- Build in VSCode using the included run configuration

## Extension Settings

This extension contributes the following settings:

- `vizx.render`: render a valid ZX diagram via manual input.
- `vizx.scaleUp`: increase the scale of the generated diagram by 10%.
- `vizx.scaleDown`: decrease the scale of the generated diagram by 10%.
- `vizx.lspRender`: to communicate with coq-lsp for automatic rendering. should not be used manually.
- `vizx.activateRendering`: activates automatic rendering of goal state.
- `vizx.deactivateRendering`: deactivates automatic rendering of goal state.
