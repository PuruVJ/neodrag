var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/index.ts
import fs2 from "fs";
import path2 from "path";
import { pathToFileURL } from "url";
import {
  build
} from "esbuild";
import { loadTsConfig } from "load-tsconfig";

// src/utils.ts
import fs from "fs";
import path from "path";
import { createRequire } from "module";
var getPkgType = () => {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8"));
    return pkg.type;
  } catch (error) {
  }
};
function guessFormat(inputFile) {
  if (!usingDynamicImport)
    return "cjs";
  const ext = path.extname(inputFile);
  const type = getPkgType();
  if (ext === ".js") {
    return type === "module" ? "esm" : "cjs";
  } else if (ext === ".ts") {
    return "esm";
  } else if (ext === ".mjs") {
    return "esm";
  }
  return "cjs";
}
var usingDynamicImport = typeof jest === "undefined";
var dynamicImport = async (id, { format }) => {
  const fn = format === "esm" ? (file) => import(file) : typeof globalThis.require === "function" ? globalThis.require : createRequire(import.meta.url);
  return fn(id);
};
var getRandomId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// src/index.ts
var DIRNAME_VAR_NAME = "__injected_dirname__";
var FILENAME_VAR_NAME = "__injected_filename__";
var IMPORT_META_URL_VAR_NAME = "__injected_import_meta_url__";
var JS_EXT_RE = /\.(mjs|cjs|ts|js|tsx|jsx)$/;
function inferLoader(ext) {
  if (ext === ".mjs" || ext === ".cjs")
    return "js";
  return ext.slice(1);
}
var defaultGetOutputFile = (filepath, format) => filepath.replace(JS_EXT_RE, `.bundled_${getRandomId()}.${format === "esm" ? "mjs" : "cjs"}`);
var tsconfigPathsToRegExp = (paths) => {
  return Object.keys(paths || {}).map((key) => {
    return new RegExp(`^${key.replace(/\*/, ".*")}$`);
  });
};
var match = (id, patterns) => {
  if (!patterns)
    return false;
  return patterns.some((p) => {
    if (p instanceof RegExp) {
      return p.test(id);
    }
    return id === p || id.startsWith(p + "/");
  });
};
var externalPlugin = ({
  external,
  notExternal
} = {}) => {
  return {
    name: "bundle-require:external",
    setup(ctx) {
      ctx.onResolve({ filter: /.*/ }, async (args) => {
        if (args.path[0] === "." || path2.isAbsolute(args.path)) {
          return;
        }
        if (match(args.path, external)) {
          return {
            external: true
          };
        }
        if (match(args.path, notExternal)) {
          return;
        }
        return {
          external: true
        };
      });
    }
  };
};
var injectFileScopePlugin = () => {
  return {
    name: "bundle-require:inject-file-scope",
    setup(ctx) {
      ctx.initialOptions.define = __spreadProps(__spreadValues({}, ctx.initialOptions.define), {
        __dirname: DIRNAME_VAR_NAME,
        __filename: FILENAME_VAR_NAME,
        "import.meta.url": IMPORT_META_URL_VAR_NAME
      });
      ctx.onLoad({ filter: JS_EXT_RE }, async (args) => {
        const contents = await fs2.promises.readFile(args.path, "utf-8");
        const injectLines = [
          `const ${FILENAME_VAR_NAME} = ${JSON.stringify(args.path)};`,
          `const ${DIRNAME_VAR_NAME} = ${JSON.stringify(path2.dirname(args.path))};`,
          `const ${IMPORT_META_URL_VAR_NAME} = ${JSON.stringify(pathToFileURL(args.path).href)};`
        ];
        return {
          contents: injectLines.join("") + contents,
          loader: inferLoader(path2.extname(args.path))
        };
      });
    }
  };
};
async function bundleRequire(options) {
  var _a, _b, _c, _d, _e;
  if (!JS_EXT_RE.test(options.filepath)) {
    throw new Error(`${options.filepath} is not a valid JS file`);
  }
  const preserveTemporaryFile = (_a = options.preserveTemporaryFile) != null ? _a : !!process.env.BUNDLE_REQUIRE_PRESERVE;
  const cwd = options.cwd || process.cwd();
  const format = (_b = options.format) != null ? _b : guessFormat(options.filepath);
  const tsconfig = loadTsConfig(cwd, options.tsconfig);
  const resolvePaths = tsconfigPathsToRegExp(((_c = tsconfig == null ? void 0 : tsconfig.data.compilerOptions) == null ? void 0 : _c.paths) || {});
  const extractResult = async (result2) => {
    if (!result2.outputFiles) {
      throw new Error(`[bundle-require] no output files`);
    }
    const { text } = result2.outputFiles[0];
    const getOutputFile = options.getOutputFile || defaultGetOutputFile;
    const outfile = getOutputFile(options.filepath, format);
    await fs2.promises.writeFile(outfile, text, "utf8");
    let mod;
    const req = options.require || dynamicImport;
    try {
      mod = await req(format === "esm" ? pathToFileURL(outfile).href : outfile, { format });
    } finally {
      if (!preserveTemporaryFile) {
        await fs2.promises.unlink(outfile);
      }
    }
    return {
      mod,
      dependencies: result2.metafile ? Object.keys(result2.metafile.inputs) : []
    };
  };
  const result = await build(__spreadProps(__spreadValues({}, options.esbuildOptions), {
    entryPoints: [options.filepath],
    absWorkingDir: cwd,
    outfile: "out.js",
    format,
    platform: "node",
    sourcemap: "inline",
    bundle: true,
    metafile: true,
    write: false,
    watch: ((_d = options.esbuildOptions) == null ? void 0 : _d.watch) || options.onRebuild && {
      async onRebuild(err, result2) {
        if (err) {
          return options.onRebuild({ err });
        }
        if (result2) {
          options.onRebuild(await extractResult(result2));
        }
      }
    },
    plugins: [
      ...((_e = options.esbuildOptions) == null ? void 0 : _e.plugins) || [],
      externalPlugin({
        external: options.external,
        notExternal: resolvePaths
      }),
      injectFileScopePlugin()
    ]
  }));
  return extractResult(result);
}
export {
  JS_EXT_RE,
  bundleRequire,
  dynamicImport,
  externalPlugin,
  injectFileScopePlugin,
  loadTsConfig,
  match,
  tsconfigPathsToRegExp
};
