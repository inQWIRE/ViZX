# ViZX: A Visualizer for the ZX Calculus

Install [here](https://marketplace.visualstudio.com/items?itemName=inQWIRE.vizx).

To render manually, use command `Render Expressions with ViZX`.
To render automatically, use command `Activate ZXViz automatic rendering`. To stop rendering automatically, use command `Deactivate ZXViz automatic rendering`.

## Requirements

Requires [coq-lsp](https://github.com/ejgallego/coq-lsp/) `0.1.7` for automatic rendering. Syntax of valid terms = valid ZX diagrams in [VyZX](https://github.com/inQWIRE/VyZX). See [src/CoreData/ZXCore](https://github.com/inQWIRE/VyZX/blob/main/src/CoreData/ZXCore.v) for the base definitions, and [src/CoreData/Proportional](https://github.com/inQWIRE/VyZX/blob/main/src/CoreData/Proportional.v) for proportionality definitions.

## Extension Settings

This extension contributes the following settings:

- `vizx.render`: render a valid ZX diagram via manual input.
- `vizx.scale`: edit scale of the generated diagram
- `vizx.exportscale`: set scale for export
- `vizx.viewscale`: set scale for viewing
- `vizx.lspRender`: to communicate with coq-lsp for automatic rendering. should not be used manually.
- `vizx.activateRendering`: activates automatic rendering of goal state.
- `vizx.deactivateRendering`: deactivates automatic rendering of goal state.
