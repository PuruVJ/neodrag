var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  JS_EXT_RE: () => JS_EXT_RE,
  bundleRequire: () => bundleRequire,
  dynamicImport: () => dynamicImport,
  externalPlugin: () => externalPlugin,
  injectFileScopePlugin: () => injectFileScopePlugin,
  loadTsConfig: () => import_load_tsconfig.loadTsConfig,
  match: () => match,
  tsconfigPathsToRegExp: () => tsconfigPathsToRegExp
});

// node_modules/.pnpm/tsup@5.11.11_typescript@4.5.5/node_modules/tsup/assets/cjs_shims.js
var getImportMetaUrl = () => typeof document === "undefined" ? new URL("file:" + __filename).href : document.currentScript && document.currentScript.src || new URL("main.js", document.baseURI).href;
var importMetaUrl = /* @__PURE__ */ getImportMetaUrl();

// src/index.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_url = require("url");
var import_esbuild = require("esbuild");
var import_load_tsconfig = require("load-tsconfig");

// src/utils.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_module = require("module");
var getPkgType = () => {
  try {
    const pkg = JSON.parse(import_fs.default.readFileSync(import_path.default.resolve("package.json"), "utf-8"));
    return pkg.type;
  } catch (error) {
  }
};
function guessFormat(inputFile) {
  if (!usingDynamicImport)
    return "cjs";
  const ext = import_path.default.extname(inputFile);
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
  const fn = format === "esm" ? (file) => import(file) : typeof globalThis.require === "function" ? globalThis.require : (0, import_module.createRequire)(importMetaUrl);
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
        if (args.path[0] === "." || import_path2.default.isAbsolute(args.path)) {
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
        const contents = await import_fs2.default.promises.readFile(args.path, "utf-8");
        const injectLines = [
          `const ${FILENAME_VAR_NAME} = ${JSON.stringify(args.path)};`,
          `const ${DIRNAME_VAR_NAME} = ${JSON.stringify(import_path2.default.dirname(args.path))};`,
          `const ${IMPORT_META_URL_VAR_NAME} = ${JSON.stringify((0, import_url.pathToFileURL)(args.path).href)};`
        ];
        return {
          contents: injectLines.join("") + contents,
          loader: inferLoader(import_path2.default.extname(args.path))
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
  const tsconfig = (0, import_load_tsconfig.loadTsConfig)(cwd, options.tsconfig);
  const resolvePaths = tsconfigPathsToRegExp(((_c = tsconfig == null ? void 0 : tsconfig.data.compilerOptions) == null ? void 0 : _c.paths) || {});
  const extractResult = async (result2) => {
    if (!result2.outputFiles) {
      throw new Error(`[bundle-require] no output files`);
    }
    const { text } = result2.outputFiles[0];
    const getOutputFile = options.getOutputFile || defaultGetOutputFile;
    const outfile = getOutputFile(options.filepath, format);
    await import_fs2.default.promises.writeFile(outfile, text, "utf8");
    let mod;
    const req = options.require || dynamicImport;
    try {
      mod = await req(format === "esm" ? (0, import_url.pathToFileURL)(outfile).href : outfile, { format });
    } finally {
      if (!preserveTemporaryFile) {
        await import_fs2.default.promises.unlink(outfile);
      }
    }
    return {
      mod,
      dependencies: result2.metafile ? Object.keys(result2.metafile.inputs) : []
    };
  };
  const result = await (0, import_esbuild.build)(__spreadProps(__spreadValues({}, options.esbuildOptions), {
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
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  JS_EXT_RE,
  bundleRequire,
  dynamicImport,
  externalPlugin,
  injectFileScopePlugin,
  loadTsConfig,
  match,
  tsconfigPathsToRegExp
});
