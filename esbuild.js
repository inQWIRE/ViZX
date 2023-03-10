const { build } = require("esbuild");
const { copy } = require("esbuild-plugin-copy");

//@ts-check
/** @typedef {import('esbuild').BuildOptions} BuildOptions **/

/** @type BuildOptions */
const baseConfig = {
  bundle: true,
  minify: process.env.NODE_ENV === "production",
  sourcemap: process.env.NODE_ENV !== "production",
};

// Config for extension source code (to be run in a Node-based context)
/** @type BuildOptions */
const extensionConfig = {
  ...baseConfig,
  platform: "node",
  format: "cjs",
  entryPoints: ["./src/extension.ts"],
  outfile: "./out/extension.js",
  external: ["vscode"],
};

// Config for webview source code (to be run in a web-based context)
/** @type BuildOptions */
const webviewConfig = {
  ...baseConfig,
  target: "es2020",
  format: "esm",
  entryPoints: ["./src/rendering/render.ts"],
  outfile: "./out/render.js",
  plugins: [
    // Copy webview css files to `out` directory unaltered
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["./src/rendering/*.css"],
        to: ["./out"],
      },
    }),
  ],
};

// Build script
(async () => {
  const args = process.argv.slice(2);
  try {
    {
      // Build extension and webview code
      await build(extensionConfig);
      await build(webviewConfig);
      console.log("build complete");
    }
  } catch (err) {
    process.stderr.write(err.stderr);
    process.exit(1);
  }
})();
