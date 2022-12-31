var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// src/index.ts
import fs8 from "fs";
import { isDepExcluded as isDepExcluded2 } from "vitefu";

// src/utils/log.ts
import { cyan, yellow, red } from "kleur/colors";
import debug from "debug";
var levels = ["debug", "info", "warn", "error", "silent"];
var prefix = "vite-plugin-svelte";
var loggers = {
  debug: {
    log: debug(`vite:${prefix}`),
    enabled: false,
    isDebug: true
  },
  info: {
    color: cyan,
    log: console.log,
    enabled: true
  },
  warn: {
    color: yellow,
    log: console.warn,
    enabled: true
  },
  error: {
    color: red,
    log: console.error,
    enabled: true
  },
  silent: {
    enabled: false
  }
};
var _level = "info";
function setLevel(level) {
  if (level === _level) {
    return;
  }
  const levelIndex = levels.indexOf(level);
  if (levelIndex > -1) {
    _level = level;
    for (let i = 0; i < levels.length; i++) {
      loggers[levels[i]].enabled = i >= levelIndex;
    }
  } else {
    _log(loggers.error, `invalid log level: ${level} `);
  }
}
function _log(logger, message, payload) {
  if (!logger.enabled) {
    return;
  }
  if (logger.isDebug) {
    payload !== void 0 ? logger.log(message, payload) : logger.log(message);
  } else {
    logger.log(logger.color(`${new Date().toLocaleTimeString()} [${prefix}] ${message}`));
    if (payload) {
      logger.log(payload);
    }
  }
}
function createLogger(level) {
  const logger = loggers[level];
  const logFn = _log.bind(null, logger);
  const logged = /* @__PURE__ */ new Set();
  const once = function(message, payload) {
    if (logged.has(message)) {
      return;
    }
    logged.add(message);
    logFn.apply(null, [message, payload]);
  };
  Object.defineProperty(logFn, "enabled", {
    get() {
      return logger.enabled;
    }
  });
  Object.defineProperty(logFn, "once", {
    get() {
      return once;
    }
  });
  return logFn;
}
var log = {
  debug: createLogger("debug"),
  info: createLogger("info"),
  warn: createLogger("warn"),
  error: createLogger("error"),
  setLevel
};
function logCompilerWarnings(svelteRequest, warnings, options) {
  const { emitCss, onwarn, isBuild } = options;
  const sendViaWS = !isBuild && options.experimental?.sendWarningsToBrowser;
  let warn = isBuild ? warnBuild : warnDev;
  const handledByDefaultWarn = [];
  const notIgnored = warnings?.filter((w) => !ignoreCompilerWarning(w, isBuild, emitCss));
  const extra = buildExtraWarnings(warnings, isBuild);
  const allWarnings = [...notIgnored, ...extra];
  if (sendViaWS) {
    const _warn = warn;
    warn = (w) => {
      handledByDefaultWarn.push(w);
      _warn(w);
    };
  }
  allWarnings.forEach((warning) => {
    if (onwarn) {
      onwarn(warning, warn);
    } else {
      warn(warning);
    }
  });
  if (sendViaWS) {
    const message = {
      id: svelteRequest.id,
      filename: svelteRequest.filename,
      normalizedFilename: svelteRequest.normalizedFilename,
      timestamp: svelteRequest.timestamp,
      warnings: handledByDefaultWarn,
      allWarnings,
      rawWarnings: warnings
    };
    log.debug(`sending svelte:warnings message for ${svelteRequest.normalizedFilename}`);
    options.server?.ws?.send("svelte:warnings", message);
  }
}
function ignoreCompilerWarning(warning, isBuild, emitCss) {
  return !emitCss && warning.code === "css-unused-selector" || !isBuild && isNoScopableElementWarning(warning);
}
function isNoScopableElementWarning(warning) {
  return warning.code === "css-unused-selector" && warning.message.includes('"*"');
}
function buildExtraWarnings(warnings, isBuild) {
  const extraWarnings = [];
  if (!isBuild) {
    const noScopableElementWarnings = warnings.filter((w) => isNoScopableElementWarning(w));
    if (noScopableElementWarnings.length > 0) {
      const noScopableElementWarning = noScopableElementWarnings[noScopableElementWarnings.length - 1];
      extraWarnings.push({
        ...noScopableElementWarning,
        code: "vite-plugin-svelte-css-no-scopable-elements",
        message: `No scopable elements found in template. If you're using global styles in the style tag, you should move it into an external stylesheet file and import it in JS. See https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/faq.md#where-should-i-put-my-global-styles.`
      });
    }
  }
  return extraWarnings;
}
function warnDev(w) {
  log.info.enabled && log.info(buildExtendedLogMessage(w));
}
function warnBuild(w) {
  log.warn.enabled && log.warn(buildExtendedLogMessage(w), w.frame);
}
function buildExtendedLogMessage(w) {
  const parts = [];
  if (w.filename) {
    parts.push(w.filename);
  }
  if (w.start) {
    parts.push(":", w.start.line, ":", w.start.column);
  }
  if (w.message) {
    if (parts.length > 0) {
      parts.push(" ");
    }
    parts.push(w.message);
  }
  return parts.join("");
}

// src/handle-hot-update.ts
async function handleHotUpdate(compileSvelte2, ctx, svelteRequest, cache, options) {
  if (!cache.has(svelteRequest)) {
    log.debug(`handleHotUpdate called before initial transform for ${svelteRequest.id}`);
    return;
  }
  const { read, server, modules } = ctx;
  const cachedJS = cache.getJS(svelteRequest);
  const cachedCss = cache.getCSS(svelteRequest);
  const content = await read();
  let compileData;
  try {
    compileData = await compileSvelte2(svelteRequest, content, options);
    cache.update(compileData);
  } catch (e) {
    cache.setError(svelteRequest, e);
    throw e;
  }
  const affectedModules = [...modules];
  const cssIdx = modules.findIndex((m) => m.id === svelteRequest.cssId);
  if (cssIdx > -1) {
    const cssUpdated = cssChanged(cachedCss, compileData.compiled.css);
    if (!cssUpdated) {
      log.debug(`skipping unchanged css for ${svelteRequest.cssId}`);
      affectedModules.splice(cssIdx, 1);
    }
  }
  const jsIdx = modules.findIndex((m) => m.id === svelteRequest.id);
  if (jsIdx > -1) {
    const jsUpdated = jsChanged(cachedJS, compileData.compiled.js, svelteRequest.filename);
    if (!jsUpdated) {
      log.debug(`skipping unchanged js for ${svelteRequest.id}`);
      affectedModules.splice(jsIdx, 1);
      logCompilerWarnings(svelteRequest, compileData.compiled.warnings, options);
    }
  }
  const ssrModulesToInvalidate = affectedModules.filter((m) => !!m.ssrTransformResult);
  if (ssrModulesToInvalidate.length > 0) {
    log.debug(`invalidating modules ${ssrModulesToInvalidate.map((m) => m.id).join(", ")}`);
    ssrModulesToInvalidate.forEach((moduleNode) => server.moduleGraph.invalidateModule(moduleNode));
  }
  if (affectedModules.length > 0) {
    log.debug(
      `handleHotUpdate for ${svelteRequest.id} result: ${affectedModules.map((m) => m.id).join(", ")}`
    );
  }
  return affectedModules;
}
function cssChanged(prev, next) {
  return !isCodeEqual(prev?.code, next?.code);
}
function jsChanged(prev, next, filename) {
  const prevJs = prev?.code;
  const nextJs = next?.code;
  const isStrictEqual = isCodeEqual(prevJs, nextJs);
  if (isStrictEqual) {
    return false;
  }
  const isLooseEqual = isCodeEqual(normalizeJsCode(prevJs), normalizeJsCode(nextJs));
  if (!isStrictEqual && isLooseEqual) {
    log.warn(
      `ignoring compiler output js change for ${filename} as it is equal to previous output after normalization`
    );
  }
  return !isLooseEqual;
}
function isCodeEqual(prev, next) {
  if (!prev && !next) {
    return true;
  }
  if (!prev && next || prev && !next) {
    return false;
  }
  return prev === next;
}
function normalizeJsCode(code) {
  if (!code) {
    return code;
  }
  return code.replace(/\s*\badd_location\s*\([^)]*\)\s*;?/g, "");
}

// src/utils/compile.ts
import { compile, preprocess, walk } from "svelte/compiler";
import { createMakeHot } from "svelte-hmr";

// src/utils/hash.ts
import * as crypto from "crypto";
var hashes = /* @__PURE__ */ Object.create(null);
var hash_length = 12;
function safeBase64Hash(input) {
  if (hashes[input]) {
    return hashes[input];
  }
  const md5 = crypto.createHash("md5");
  md5.update(input);
  const hash = toSafe(md5.digest("base64")).slice(0, hash_length);
  hashes[input] = hash;
  return hash;
}
var replacements = {
  "+": "-",
  "/": "_",
  "=": ""
};
var replaceRE = new RegExp(`[${Object.keys(replacements).join("")}]`, "g");
function toSafe(base64) {
  return base64.replace(replaceRE, (x) => replacements[x]);
}

// src/utils/preprocess.ts
import MagicString from "magic-string";
import path from "path";
function createInjectScopeEverythingRulePreprocessorGroup() {
  return {
    style({ content, filename }) {
      const s = new MagicString(content);
      s.append(" *{}");
      return {
        code: s.toString(),
        map: s.generateDecodedMap({
          source: filename ? path.basename(filename) : void 0,
          hires: true
        })
      };
    }
  };
}
function buildExtraPreprocessors(options, config) {
  const prependPreprocessors = [];
  const appendPreprocessors = [];
  const pluginsWithPreprocessorsDeprecated = config.plugins.filter((p) => p?.sveltePreprocess);
  if (pluginsWithPreprocessorsDeprecated.length > 0) {
    log.warn(
      `The following plugins use the deprecated 'plugin.sveltePreprocess' field. Please contact their maintainers and ask them to move it to 'plugin.api.sveltePreprocess': ${pluginsWithPreprocessorsDeprecated.map((p) => p.name).join(", ")}`
    );
    pluginsWithPreprocessorsDeprecated.forEach((p) => {
      if (!p.api) {
        p.api = {};
      }
      if (p.api.sveltePreprocess === void 0) {
        p.api.sveltePreprocess = p.sveltePreprocess;
      } else {
        log.error(
          `ignoring plugin.sveltePreprocess of ${p.name} because it already defined plugin.api.sveltePreprocess.`
        );
      }
    });
  }
  const pluginsWithPreprocessors = config.plugins.filter((p) => p?.api?.sveltePreprocess);
  const ignored = [], included = [];
  for (const p of pluginsWithPreprocessors) {
    if (options.ignorePluginPreprocessors === true || Array.isArray(options.ignorePluginPreprocessors) && options.ignorePluginPreprocessors?.includes(p.name)) {
      ignored.push(p);
    } else {
      included.push(p);
    }
  }
  if (ignored.length > 0) {
    log.debug(
      `Ignoring svelte preprocessors defined by these vite plugins: ${ignored.map((p) => p.name).join(", ")}`
    );
  }
  if (included.length > 0) {
    log.debug(
      `Adding svelte preprocessors defined by these vite plugins: ${included.map((p) => p.name).join(", ")}`
    );
    appendPreprocessors.push(...pluginsWithPreprocessors.map((p) => p.api.sveltePreprocess));
  }
  return { prependPreprocessors, appendPreprocessors };
}
function addExtraPreprocessors(options, config) {
  const { prependPreprocessors, appendPreprocessors } = buildExtraPreprocessors(options, config);
  if (prependPreprocessors.length > 0 || appendPreprocessors.length > 0) {
    if (!options.preprocess) {
      options.preprocess = [...prependPreprocessors, ...appendPreprocessors];
    } else if (Array.isArray(options.preprocess)) {
      options.preprocess.unshift(...prependPreprocessors);
      options.preprocess.push(...appendPreprocessors);
    } else {
      options.preprocess = [...prependPreprocessors, options.preprocess, ...appendPreprocessors];
    }
  }
}

// src/utils/compile.ts
import path2 from "path";
var scriptLangRE = /<script [^>]*lang=["']?([^"' >]+)["']?[^>]*>/;
function mapSourcesToRelative(map, filename) {
  if (map?.sources) {
    map.sources = map.sources.map((s) => {
      if (path2.isAbsolute(s)) {
        const relative = path2.relative(filename, s);
        return relative === "" ? path2.basename(filename) : relative;
      } else {
        return s;
      }
    });
  }
}
var _createCompileSvelte = (makeHot) => {
  let stats;
  const devStylePreprocessor = createInjectScopeEverythingRulePreprocessorGroup();
  return async function compileSvelte2(svelteRequest, code, options) {
    const { filename, normalizedFilename, cssId, ssr, raw } = svelteRequest;
    const { emitCss = true } = options;
    const dependencies = [];
    if (options.stats) {
      if (options.isBuild) {
        if (!stats) {
          stats = options.stats.startCollection(`${ssr ? "ssr" : "dom"} compile`, {
            logInProgress: () => false
          });
        }
      } else {
        if (ssr && !stats) {
          stats = options.stats.startCollection("ssr compile");
        }
        if (!ssr && stats) {
          stats.finish();
          stats = void 0;
        }
      }
    }
    const compileOptions = {
      ...options.compilerOptions,
      filename: normalizedFilename,
      generate: ssr ? "ssr" : "dom",
      format: "esm"
    };
    if (options.hot && options.emitCss) {
      const hash = `s-${safeBase64Hash(normalizedFilename)}`;
      log.debug(`setting cssHash ${hash} for ${normalizedFilename}`);
      compileOptions.cssHash = () => hash;
    }
    if (ssr && compileOptions.enableSourcemap !== false) {
      if (typeof compileOptions.enableSourcemap === "object") {
        compileOptions.enableSourcemap.css = false;
      } else {
        compileOptions.enableSourcemap = { js: true, css: false };
      }
    }
    let preprocessed;
    let preprocessors = options.preprocess;
    if (!options.isBuild && options.emitCss && options.hot) {
      if (!Array.isArray(preprocessors)) {
        preprocessors = preprocessors ? [preprocessors, devStylePreprocessor] : [devStylePreprocessor];
      } else {
        preprocessors = preprocessors.concat(devStylePreprocessor);
      }
    }
    if (preprocessors) {
      try {
        preprocessed = await preprocess(code, preprocessors, { filename });
      } catch (e) {
        e.message = `Error while preprocessing ${filename}${e.message ? ` - ${e.message}` : ""}`;
        throw e;
      }
      if (preprocessed.dependencies)
        dependencies.push(...preprocessed.dependencies);
      if (preprocessed.map)
        compileOptions.sourcemap = preprocessed.map;
    }
    if (typeof preprocessed?.map === "object") {
      mapSourcesToRelative(preprocessed?.map, filename);
    }
    if (raw && svelteRequest.query.type === "preprocessed") {
      return { preprocessed: preprocessed ?? { code } };
    }
    const finalCode = preprocessed ? preprocessed.code : code;
    const dynamicCompileOptions = await options.experimental?.dynamicCompileOptions?.({
      filename,
      code: finalCode,
      compileOptions
    });
    if (dynamicCompileOptions && log.debug.enabled) {
      log.debug(
        `dynamic compile options for  ${filename}: ${JSON.stringify(dynamicCompileOptions)}`
      );
    }
    const finalCompileOptions = dynamicCompileOptions ? {
      ...compileOptions,
      ...dynamicCompileOptions
    } : compileOptions;
    const endStat = stats?.start(filename);
    const compiled = compile(finalCode, finalCompileOptions);
    if (endStat) {
      endStat();
    }
    mapSourcesToRelative(compiled.js?.map, filename);
    mapSourcesToRelative(compiled.css?.map, filename);
    if (!raw) {
      const hasCss = compiled.css?.code?.trim().length > 0;
      if (emitCss && hasCss) {
        compiled.js.code += `
import ${JSON.stringify(cssId)};
`;
      }
      if (!ssr && makeHot) {
        compiled.js.code = makeHot({
          id: filename,
          compiledCode: compiled.js.code,
          hotOptions: { ...options.hot, injectCss: options.hot?.injectCss === true && hasCss },
          compiled,
          originalCode: code,
          compileOptions: finalCompileOptions
        });
      }
    }
    compiled.js.dependencies = dependencies;
    return {
      filename,
      normalizedFilename,
      lang: code.match(scriptLangRE)?.[1] || "js",
      compiled,
      ssr,
      dependencies,
      preprocessed: preprocessed ?? { code }
    };
  };
};
function buildMakeHot(options) {
  const needsMakeHot = options.hot !== false && options.isServe && !options.isProduction;
  if (needsMakeHot) {
    const hotApi = options?.hot?.hotApi;
    const adapter = options?.hot?.adapter;
    return createMakeHot({
      walk,
      hotApi,
      adapter,
      hotOptions: { noOverlay: true, ...options.hot }
    });
  }
}
function createCompileSvelte(options) {
  const makeHot = buildMakeHot(options);
  return _createCompileSvelte(makeHot);
}

// src/utils/id.ts
import { createFilter } from "vite";
import { normalizePath } from "vite";
import * as fs from "fs";
var VITE_FS_PREFIX = "/@fs/";
var IS_WINDOWS = process.platform === "win32";
var SUPPORTED_COMPILER_OPTIONS = [
  "generate",
  "dev",
  "css",
  "hydratable",
  "customElement",
  "immutable",
  "enableSourcemap"
];
var TYPES_WITH_COMPILER_OPTIONS = ["style", "script", "all"];
function splitId(id) {
  const parts = id.split(`?`, 2);
  const filename = parts[0];
  const rawQuery = parts[1];
  return { filename, rawQuery };
}
function parseToSvelteRequest(id, filename, rawQuery, root, timestamp, ssr) {
  const query = parseRequestQuery(rawQuery);
  const rawOrDirect = !!(query.raw || query.direct);
  if (query.url || !query.svelte && rawOrDirect) {
    return;
  }
  const raw = rawOrDirect;
  const normalizedFilename = normalize(filename, root);
  const cssId = createVirtualImportId(filename, root, "style");
  return {
    id,
    filename,
    normalizedFilename,
    cssId,
    query,
    timestamp,
    ssr,
    raw
  };
}
function createVirtualImportId(filename, root, type) {
  const parts = ["svelte", `type=${type}`];
  if (type === "style") {
    parts.push("lang.css");
  }
  if (existsInRoot(filename, root)) {
    filename = root + filename;
  } else if (filename.startsWith(VITE_FS_PREFIX)) {
    filename = IS_WINDOWS ? filename.slice(VITE_FS_PREFIX.length) : filename.slice(VITE_FS_PREFIX.length - 1);
  }
  return `${filename}?${parts.join("&")}`;
}
function parseRequestQuery(rawQuery) {
  const query = Object.fromEntries(new URLSearchParams(rawQuery));
  for (const key in query) {
    if (query[key] === "") {
      query[key] = true;
    }
  }
  const compilerOptions = query.compilerOptions;
  if (compilerOptions) {
    if (!((query.raw || query.direct) && TYPES_WITH_COMPILER_OPTIONS.includes(query.type))) {
      throw new Error(
        `Invalid compilerOptions in query ${rawQuery}. CompilerOptions are only supported for raw or direct queries with type in "${TYPES_WITH_COMPILER_OPTIONS.join(
          ", "
        )}" e.g. '?svelte&raw&type=script&compilerOptions={"generate":"ssr","dev":false}`
      );
    }
    try {
      const parsed = JSON.parse(compilerOptions);
      const invalid = Object.keys(parsed).filter(
        (key) => !SUPPORTED_COMPILER_OPTIONS.includes(key)
      );
      if (invalid.length) {
        throw new Error(
          `Invalid compilerOptions in query ${rawQuery}: ${invalid.join(
            ", "
          )}. Supported: ${SUPPORTED_COMPILER_OPTIONS.join(", ")}`
        );
      }
      query.compilerOptions = parsed;
    } catch (e) {
      log.error("failed to parse request query compilerOptions", e);
      throw e;
    }
  }
  return query;
}
function normalize(filename, normalizedRoot) {
  return stripRoot(normalizePath(filename), normalizedRoot);
}
function existsInRoot(filename, root) {
  if (filename.startsWith(VITE_FS_PREFIX)) {
    return false;
  }
  return fs.existsSync(root + filename);
}
function stripRoot(normalizedFilename, normalizedRoot) {
  return normalizedFilename.startsWith(normalizedRoot + "/") ? normalizedFilename.slice(normalizedRoot.length) : normalizedFilename;
}
function buildFilter(include, exclude, extensions) {
  const rollupFilter = createFilter(include, exclude);
  return (filename) => rollupFilter(filename) && extensions.some((ext) => filename.endsWith(ext));
}
function buildIdParser(options) {
  const { include, exclude, extensions, root } = options;
  const normalizedRoot = normalizePath(root);
  const filter = buildFilter(include, exclude, extensions);
  return (id, ssr, timestamp = Date.now()) => {
    const { filename, rawQuery } = splitId(id);
    if (filter(filename)) {
      return parseToSvelteRequest(id, filename, rawQuery, normalizedRoot, timestamp, ssr);
    }
  };
}

// src/utils/options.ts
import { normalizePath as normalizePath3 } from "vite";

// src/utils/load-svelte-config.ts
import { createRequire } from "module";
import path3 from "path";
import fs2 from "fs";
import { pathToFileURL } from "url";
var esmRequire;
var knownSvelteConfigNames = [
  "svelte.config.js",
  "svelte.config.cjs",
  "svelte.config.mjs"
];
var dynamicImportDefault = new Function(
  "path",
  "timestamp",
  'return import(path + "?t=" + timestamp).then(m => m.default)'
);
async function loadSvelteConfig(viteConfig, inlineOptions) {
  if (inlineOptions?.configFile === false) {
    return;
  }
  const configFile = findConfigToLoad(viteConfig, inlineOptions);
  if (configFile) {
    let err;
    if (configFile.endsWith(".js") || configFile.endsWith(".mjs")) {
      try {
        const result = await dynamicImportDefault(
          pathToFileURL(configFile).href,
          fs2.statSync(configFile).mtimeMs
        );
        if (result != null) {
          return {
            ...result,
            configFile
          };
        } else {
          throw new Error(`invalid export in ${configFile}`);
        }
      } catch (e) {
        log.error(`failed to import config ${configFile}`, e);
        err = e;
      }
    }
    if (!configFile.endsWith(".mjs")) {
      try {
        const _require = import.meta.url ? esmRequire ?? (esmRequire = createRequire(import.meta.url)) : __require;
        delete _require.cache[_require.resolve(configFile)];
        const result = _require(configFile);
        if (result != null) {
          return {
            ...result,
            configFile
          };
        } else {
          throw new Error(`invalid export in ${configFile}`);
        }
      } catch (e) {
        log.error(`failed to require config ${configFile}`, e);
        if (!err) {
          err = e;
        }
      }
    }
    throw err;
  }
}
function findConfigToLoad(viteConfig, inlineOptions) {
  const root = viteConfig?.root || process.cwd();
  if (inlineOptions?.configFile) {
    const abolutePath = path3.isAbsolute(inlineOptions.configFile) ? inlineOptions.configFile : path3.resolve(root, inlineOptions.configFile);
    if (!fs2.existsSync(abolutePath)) {
      throw new Error(`failed to find svelte config file ${abolutePath}.`);
    }
    return abolutePath;
  } else {
    const existingKnownConfigFiles = knownSvelteConfigNames.map((candidate) => path3.resolve(root, candidate)).filter((file) => fs2.existsSync(file));
    if (existingKnownConfigFiles.length === 0) {
      log.debug(`no svelte config found at ${root}`);
      return;
    } else if (existingKnownConfigFiles.length > 1) {
      log.warn(
        `found more than one svelte config file, using ${existingKnownConfigFiles[0]}. you should only have one!`,
        existingKnownConfigFiles
      );
    }
    return existingKnownConfigFiles[0];
  }
}

// src/utils/constants.ts
var VITE_RESOLVE_MAIN_FIELDS = ["module", "jsnext:main", "jsnext"];
var SVELTE_RESOLVE_MAIN_FIELDS = ["svelte", ...VITE_RESOLVE_MAIN_FIELDS];
var SVELTE_IMPORTS = [
  "svelte/animate",
  "svelte/easing",
  "svelte/internal",
  "svelte/motion",
  "svelte/ssr",
  "svelte/store",
  "svelte/transition",
  "svelte"
];
var SVELTE_HMR_IMPORTS = [
  "svelte-hmr/runtime/hot-api-esm.js",
  "svelte-hmr/runtime/proxy-adapter-dom.js",
  "svelte-hmr"
];
var SVELTE_EXPORT_CONDITIONS = ["svelte"];

// src/utils/options.ts
import path5 from "path";

// src/utils/esbuild.ts
import { readFileSync } from "fs";
import { compile as compile2, preprocess as preprocess2 } from "svelte/compiler";

// src/utils/error.ts
function toRollupError(error, options) {
  const { filename, frame, start, code, name, stack } = error;
  const rollupError = {
    name,
    id: filename,
    message: buildExtendedLogMessage(error),
    frame: formatFrameForVite(frame),
    code,
    stack: options.isBuild || options.isDebug || !frame ? stack : ""
  };
  if (start) {
    rollupError.loc = {
      line: start.line,
      column: start.column,
      file: filename
    };
  }
  return rollupError;
}
function toESBuildError(error, options) {
  const { filename, frame, start, stack } = error;
  const partialMessage = {
    text: buildExtendedLogMessage(error)
  };
  if (start) {
    partialMessage.location = {
      line: start.line,
      column: start.column,
      file: filename,
      lineText: lineFromFrame(start.line, frame)
    };
  }
  if (options.isBuild || options.isDebug || !frame) {
    partialMessage.detail = stack;
  }
  return partialMessage;
}
function lineFromFrame(lineNo, frame) {
  if (!frame) {
    return "";
  }
  const lines = frame.split("\n");
  const errorLine = lines.find((line) => line.trimStart().startsWith(`${lineNo}: `));
  return errorLine ? errorLine.substring(errorLine.indexOf(": ") + 3) : "";
}
function formatFrameForVite(frame) {
  if (!frame) {
    return "";
  }
  return frame.split("\n").map((line) => line.match(/^\s+\^/) ? "   " + line : " " + line.replace(":", " | ")).join("\n");
}

// src/utils/esbuild.ts
var facadeEsbuildSveltePluginName = "vite-plugin-svelte:facade";
function esbuildSveltePlugin(options) {
  return {
    name: "vite-plugin-svelte:optimize-svelte",
    setup(build) {
      if (build.initialOptions.plugins?.some((v) => v.name === "vite:dep-scan"))
        return;
      const svelteExtensions = (options.extensions ?? [".svelte"]).map((ext) => ext.slice(1));
      const svelteFilter = new RegExp(`\\.(` + svelteExtensions.join("|") + `)(\\?.*)?$`);
      let statsCollection;
      build.onStart(() => {
        statsCollection = options.stats?.startCollection("prebundle libraries", {
          logResult: (c) => c.stats.length > 1
        });
      });
      build.onLoad({ filter: svelteFilter }, async ({ path: filename }) => {
        const code = readFileSync(filename, "utf8");
        try {
          const contents = await compileSvelte(options, { filename, code }, statsCollection);
          return { contents };
        } catch (e) {
          return { errors: [toESBuildError(e, options)] };
        }
      });
      build.onEnd(() => {
        statsCollection?.finish();
      });
    }
  };
}
async function compileSvelte(options, { filename, code }, statsCollection) {
  let css = options.compilerOptions.css;
  if (css !== "none") {
    css = "injected";
  }
  const compileOptions = {
    ...options.compilerOptions,
    css,
    filename,
    format: "esm",
    generate: "dom"
  };
  let preprocessed;
  if (options.preprocess) {
    try {
      preprocessed = await preprocess2(code, options.preprocess, { filename });
    } catch (e) {
      e.message = `Error while preprocessing ${filename}${e.message ? ` - ${e.message}` : ""}`;
      throw e;
    }
    if (preprocessed.map)
      compileOptions.sourcemap = preprocessed.map;
  }
  const finalCode = preprocessed ? preprocessed.code : code;
  const dynamicCompileOptions = await options.experimental?.dynamicCompileOptions?.({
    filename,
    code: finalCode,
    compileOptions
  });
  if (dynamicCompileOptions && log.debug.enabled) {
    log.debug(`dynamic compile options for  ${filename}: ${JSON.stringify(dynamicCompileOptions)}`);
  }
  const finalCompileOptions = dynamicCompileOptions ? {
    ...compileOptions,
    ...dynamicCompileOptions
  } : compileOptions;
  const endStat = statsCollection?.start(filename);
  const compiled = compile2(finalCode, finalCompileOptions);
  if (endStat) {
    endStat();
  }
  return compiled.js.code + "//# sourceMappingURL=" + compiled.js.map.toUrl();
}

// src/utils/options.ts
import deepmerge from "deepmerge";
import {
  crawlFrameworkPkgs,
  isDepExcluded,
  isDepExternaled,
  isDepIncluded,
  isDepNoExternaled
} from "vitefu";

// src/utils/dependencies.ts
import path4 from "path";
import fs3 from "fs/promises";
import { findDepPkgJsonPath } from "vitefu";
async function resolveDependencyData(dep, parent) {
  const depDataPath = await findDepPkgJsonPath(dep, parent);
  if (!depDataPath)
    return void 0;
  try {
    return {
      dir: path4.dirname(depDataPath),
      pkg: JSON.parse(await fs3.readFile(depDataPath, "utf-8"))
    };
  } catch {
    return void 0;
  }
}
var COMMON_DEPENDENCIES_WITHOUT_SVELTE_FIELD = [
  "@lukeed/uuid",
  "@playwright/test",
  "@sveltejs/vite-plugin-svelte",
  "@sveltejs/kit",
  "autoprefixer",
  "cookie",
  "dotenv",
  "esbuild",
  "eslint",
  "jest",
  "mdsvex",
  "playwright",
  "postcss",
  "prettier",
  "svelte",
  "svelte-check",
  "svelte-hmr",
  "svelte-preprocess",
  "tslib",
  "typescript",
  "vite",
  "vitest",
  "__vite-browser-external"
];
var COMMON_PREFIXES_WITHOUT_SVELTE_FIELD = [
  "@fontsource/",
  "@postcss-plugins/",
  "@rollup/",
  "@sveltejs/adapter-",
  "@types/",
  "@typescript-eslint/",
  "eslint-",
  "jest-",
  "postcss-plugin-",
  "prettier-plugin-",
  "rollup-plugin-",
  "vite-plugin-"
];
function isCommonDepWithoutSvelteField(dependency) {
  return COMMON_DEPENDENCIES_WITHOUT_SVELTE_FIELD.includes(dependency) || COMMON_PREFIXES_WITHOUT_SVELTE_FIELD.some(
    (prefix2) => prefix2.startsWith("@") ? dependency.startsWith(prefix2) : dependency.substring(dependency.lastIndexOf("/") + 1).startsWith(prefix2)
  );
}

// src/utils/vite-plugin-svelte-stats.ts
import { findClosestPkgJsonPath } from "vitefu";
import { readFileSync as readFileSync2 } from "fs";
import { dirname } from "path";
import { performance } from "perf_hooks";
import { normalizePath as normalizePath2 } from "vite";
var defaultCollectionOptions = {
  logInProgress: (c, now) => now - c.collectionStart > 500 && c.stats.length > 1,
  logResult: () => true
};
function humanDuration(n) {
  return n < 100 ? `${n.toFixed(1)}ms` : `${(n / 1e3).toFixed(2)}s`;
}
function formatPackageStats(pkgStats) {
  const statLines = pkgStats.map((pkgStat) => {
    const duration = pkgStat.duration;
    const avg = duration / pkgStat.files;
    return [pkgStat.pkg, `${pkgStat.files}`, humanDuration(duration), humanDuration(avg)];
  });
  statLines.unshift(["package", "files", "time", "avg"]);
  const columnWidths = statLines.reduce(
    (widths, row) => {
      for (let i = 0; i < row.length; i++) {
        const cell = row[i];
        if (widths[i] < cell.length) {
          widths[i] = cell.length;
        }
      }
      return widths;
    },
    statLines[0].map(() => 0)
  );
  const table = statLines.map(
    (row) => row.map((cell, i) => {
      if (i === 0) {
        return cell.padEnd(columnWidths[i], " ");
      } else {
        return cell.padStart(columnWidths[i], " ");
      }
    }).join("	")
  ).join("\n");
  return table;
}
async function getClosestNamedPackage(file) {
  let name = "$unknown";
  let path11 = await findClosestPkgJsonPath(file, (pkgPath) => {
    const pkg = JSON.parse(readFileSync2(pkgPath, "utf-8"));
    if (pkg.name != null) {
      name = pkg.name;
      return true;
    }
    return false;
  });
  path11 = normalizePath2(dirname(path11 ?? file)) + "/";
  return { name, path: path11 };
}
var VitePluginSvelteStats = class {
  constructor() {
    this._packages = [];
    this._collections = [];
  }
  startCollection(name, opts) {
    const options = {
      ...defaultCollectionOptions,
      ...opts
    };
    const stats = [];
    const collectionStart = performance.now();
    const _this = this;
    let hasLoggedProgress = false;
    const collection = {
      name,
      options,
      stats,
      collectionStart,
      finished: false,
      start(file) {
        if (collection.finished) {
          throw new Error("called after finish() has been used");
        }
        file = normalizePath2(file);
        const start = performance.now();
        const stat = { file, start, end: start };
        return () => {
          const now = performance.now();
          stat.end = now;
          stats.push(stat);
          if (!hasLoggedProgress && options.logInProgress(collection, now)) {
            hasLoggedProgress = true;
            log.info(`${name} in progress ...`);
          }
        };
      },
      async finish() {
        await _this._finish(collection);
      }
    };
    _this._collections.push(collection);
    return collection;
  }
  async finishAll() {
    await Promise.all(this._collections.map((c) => c.finish()));
  }
  async _finish(collection) {
    try {
      collection.finished = true;
      const now = performance.now();
      collection.duration = now - collection.collectionStart;
      const logResult = collection.options.logResult(collection);
      if (logResult) {
        await this._aggregateStatsResult(collection);
        log.info(`${collection.name} done.`, formatPackageStats(collection.packageStats));
      }
      const index = this._collections.indexOf(collection);
      this._collections.splice(index, 1);
      collection.stats.length = 0;
      collection.stats = [];
      if (collection.packageStats) {
        collection.packageStats.length = 0;
        collection.packageStats = [];
      }
      collection.start = () => () => {
      };
      collection.finish = () => {
      };
    } catch (e) {
      log.debug.once(`failed to finish stats for ${collection.name}`, e);
    }
  }
  async _aggregateStatsResult(collection) {
    const stats = collection.stats;
    for (const stat of stats) {
      let pkg = this._packages.find((p) => stat.file.startsWith(p.path));
      if (!pkg) {
        pkg = await getClosestNamedPackage(stat.file);
        this._packages.push(pkg);
      }
      stat.pkg = pkg.name;
    }
    const grouped = {};
    stats.forEach((stat) => {
      const pkg = stat.pkg;
      let group = grouped[pkg];
      if (!group) {
        group = grouped[pkg] = {
          files: 0,
          duration: 0,
          pkg
        };
      }
      group.files += 1;
      group.duration += stat.end - stat.start;
    });
    const groups = Object.values(grouped);
    groups.sort((a, b) => b.duration - a.duration);
    collection.packageStats = groups;
  }
};

// src/utils/options.ts
var allowedPluginOptions = /* @__PURE__ */ new Set([
  "include",
  "exclude",
  "emitCss",
  "hot",
  "ignorePluginPreprocessors",
  "disableDependencyReinclusion",
  "prebundleSvelteLibraries",
  "experimental"
]);
var knownRootOptions = /* @__PURE__ */ new Set(["extensions", "compilerOptions", "preprocess", "onwarn"]);
var allowedInlineOptions = /* @__PURE__ */ new Set([
  "configFile",
  "kit",
  ...allowedPluginOptions,
  ...knownRootOptions
]);
function validateInlineOptions(inlineOptions) {
  const invalidKeys = Object.keys(inlineOptions || {}).filter(
    (key) => !allowedInlineOptions.has(key)
  );
  if (invalidKeys.length) {
    log.warn(`invalid plugin options "${invalidKeys.join(", ")}" in inline config`, inlineOptions);
  }
}
function convertPluginOptions(config) {
  if (!config) {
    return;
  }
  const invalidRootOptions = Object.keys(config).filter((key) => allowedPluginOptions.has(key));
  if (invalidRootOptions.length > 0) {
    throw new Error(
      `Invalid options in svelte config. Move the following options into 'vitePlugin:{...}': ${invalidRootOptions.join(
        ", "
      )}`
    );
  }
  if (!config.vitePlugin) {
    return config;
  }
  const pluginOptions = config.vitePlugin;
  const pluginOptionKeys = Object.keys(pluginOptions);
  const rootOptionsInPluginOptions = pluginOptionKeys.filter((key) => knownRootOptions.has(key));
  if (rootOptionsInPluginOptions.length > 0) {
    throw new Error(
      `Invalid options in svelte config under vitePlugin:{...}', move them to the config root : ${rootOptionsInPluginOptions.join(
        ", "
      )}`
    );
  }
  const duplicateOptions = pluginOptionKeys.filter(
    (key) => Object.prototype.hasOwnProperty.call(config, key)
  );
  if (duplicateOptions.length > 0) {
    throw new Error(
      `Invalid duplicate options in svelte config under vitePlugin:{...}', they are defined in root too and must only exist once: ${duplicateOptions.join(
        ", "
      )}`
    );
  }
  const unknownPluginOptions = pluginOptionKeys.filter((key) => !allowedPluginOptions.has(key));
  if (unknownPluginOptions.length > 0) {
    log.warn(
      `ignoring unknown plugin options in svelte config under vitePlugin:{...}: ${unknownPluginOptions.join(
        ", "
      )}`
    );
    unknownPluginOptions.forEach((unkownOption) => {
      delete pluginOptions[unkownOption];
    });
  }
  const result = {
    ...config,
    ...pluginOptions
  };
  delete result.vitePlugin;
  return result;
}
async function preResolveOptions(inlineOptions = {}, viteUserConfig, viteEnv) {
  const viteConfigWithResolvedRoot = {
    ...viteUserConfig,
    root: resolveViteRoot(viteUserConfig)
  };
  const isBuild = viteEnv.command === "build";
  const defaultOptions = {
    extensions: [".svelte"],
    emitCss: true,
    prebundleSvelteLibraries: !isBuild
  };
  const svelteConfig = convertPluginOptions(
    await loadSvelteConfig(viteConfigWithResolvedRoot, inlineOptions)
  );
  const extraOptions = {
    root: viteConfigWithResolvedRoot.root,
    isBuild,
    isServe: viteEnv.command === "serve",
    isDebug: process.env.DEBUG != null
  };
  const merged = mergeConfigs(
    defaultOptions,
    svelteConfig,
    inlineOptions,
    extraOptions
  );
  if (svelteConfig?.configFile) {
    merged.configFile = svelteConfig.configFile;
  }
  return merged;
}
function mergeConfigs(...configs) {
  let result = {};
  for (const config of configs.filter((x) => x != null)) {
    result = deepmerge(result, config, {
      arrayMerge: (target, source) => source ?? target
    });
  }
  return result;
}
function resolveOptions(preResolveOptions2, viteConfig) {
  const css = preResolveOptions2.emitCss ? "external" : "injected";
  const defaultOptions = {
    hot: viteConfig.isProduction ? false : {
      injectCss: css === "injected",
      partialAccept: !!viteConfig.experimental?.hmrPartialAccept
    },
    compilerOptions: {
      css,
      dev: !viteConfig.isProduction
    }
  };
  const extraOptions = {
    root: viteConfig.root,
    isProduction: viteConfig.isProduction
  };
  const merged = mergeConfigs(defaultOptions, preResolveOptions2, extraOptions);
  removeIgnoredOptions(merged);
  handleDeprecatedOptions(merged);
  addSvelteKitOptions(merged);
  addExtraPreprocessors(merged, viteConfig);
  enforceOptionsForHmr(merged);
  enforceOptionsForProduction(merged);
  const isLogLevelInfo = [void 0, "info"].includes(viteConfig.logLevel);
  const disableCompileStats = merged.experimental?.disableCompileStats;
  const statsEnabled = disableCompileStats !== true && disableCompileStats !== (merged.isBuild ? "build" : "dev");
  if (statsEnabled && isLogLevelInfo) {
    merged.stats = new VitePluginSvelteStats();
  }
  return merged;
}
function enforceOptionsForHmr(options) {
  if (options.hot) {
    if (!options.compilerOptions.dev) {
      log.warn("hmr is enabled but compilerOptions.dev is false, forcing it to true");
      options.compilerOptions.dev = true;
    }
    if (options.emitCss) {
      if (options.hot !== true && options.hot.injectCss) {
        log.warn("hmr and emitCss are enabled but hot.injectCss is true, forcing it to false");
        options.hot.injectCss = false;
      }
      const css = options.compilerOptions.css;
      if (css === true || css === "injected") {
        const forcedCss = "external";
        log.warn(
          `hmr and emitCss are enabled but compilerOptions.css is ${css}, forcing it to ${forcedCss}`
        );
        options.compilerOptions.css = forcedCss;
      }
    } else {
      if (options.hot === true || !options.hot.injectCss) {
        log.warn(
          "hmr with emitCss disabled requires option hot.injectCss to be enabled, forcing it to true"
        );
        if (options.hot === true) {
          options.hot = { injectCss: true };
        } else {
          options.hot.injectCss = true;
        }
      }
      const css = options.compilerOptions.css;
      if (!(css === true || css === "injected")) {
        const forcedCss = "injected";
        log.warn(
          `hmr with emitCss disabled requires compilerOptions.css to be enabled, forcing it to ${forcedCss}`
        );
        options.compilerOptions.css = forcedCss;
      }
    }
  }
}
function enforceOptionsForProduction(options) {
  if (options.isProduction) {
    if (options.hot) {
      log.warn("options.hot is enabled but does not work on production build, forcing it to false");
      options.hot = false;
    }
    if (options.compilerOptions.dev) {
      log.warn(
        "you are building for production but compilerOptions.dev is true, forcing it to false"
      );
      options.compilerOptions.dev = false;
    }
  }
}
function removeIgnoredOptions(options) {
  const ignoredCompilerOptions = ["generate", "format", "filename"];
  if (options.hot && options.emitCss) {
    ignoredCompilerOptions.push("cssHash");
  }
  const passedCompilerOptions = Object.keys(options.compilerOptions || {});
  const passedIgnored = passedCompilerOptions.filter((o) => ignoredCompilerOptions.includes(o));
  if (passedIgnored.length) {
    log.warn(
      `The following Svelte compilerOptions are controlled by vite-plugin-svelte and essential to its functionality. User-specified values are ignored. Please remove them from your configuration: ${passedIgnored.join(
        ", "
      )}`
    );
    passedIgnored.forEach((ignored) => {
      delete options.compilerOptions[ignored];
    });
  }
}
function addSvelteKitOptions(options) {
  if (options?.kit != null && options.compilerOptions.hydratable == null) {
    log.debug(`Setting compilerOptions.hydratable = true for SvelteKit`);
    options.compilerOptions.hydratable = true;
  }
}
function handleDeprecatedOptions(options) {
  if (options.experimental?.prebundleSvelteLibraries) {
    options.prebundleSvelteLibraries = options.experimental?.prebundleSvelteLibraries;
    log.warn(
      "experimental.prebundleSvelteLibraries is no longer experimental and has moved to prebundleSvelteLibraries"
    );
  }
  if (options.experimental?.generateMissingPreprocessorSourcemaps) {
    log.warn("experimental.generateMissingPreprocessorSourcemaps has been removed.");
  }
}
function resolveViteRoot(viteConfig) {
  return normalizePath3(viteConfig.root ? path5.resolve(viteConfig.root) : process.cwd());
}
async function buildExtraViteConfig(options, config) {
  const extraViteConfig = {
    resolve: {
      mainFields: [...SVELTE_RESOLVE_MAIN_FIELDS],
      dedupe: [...SVELTE_IMPORTS, ...SVELTE_HMR_IMPORTS],
      conditions: [...SVELTE_EXPORT_CONDITIONS]
    }
  };
  const extraSvelteConfig = buildExtraConfigForSvelte(config);
  const extraDepsConfig = await buildExtraConfigForDependencies(options, config);
  extraViteConfig.optimizeDeps = {
    include: [
      ...extraSvelteConfig.optimizeDeps.include,
      ...extraDepsConfig.optimizeDeps.include.filter(
        (dep) => !isDepExcluded(dep, extraSvelteConfig.optimizeDeps.exclude)
      )
    ],
    exclude: [
      ...extraSvelteConfig.optimizeDeps.exclude,
      ...extraDepsConfig.optimizeDeps.exclude.filter(
        (dep) => !isDepIncluded(dep, extraSvelteConfig.optimizeDeps.include)
      )
    ]
  };
  extraViteConfig.ssr = {
    external: [
      ...extraSvelteConfig.ssr.external,
      ...extraDepsConfig.ssr.external.filter(
        (dep) => !isDepNoExternaled(dep, extraSvelteConfig.ssr.noExternal)
      )
    ],
    noExternal: [
      ...extraSvelteConfig.ssr.noExternal,
      ...extraDepsConfig.ssr.noExternal.filter(
        (dep) => !isDepExternaled(dep, extraSvelteConfig.ssr.external)
      )
    ]
  };
  if (options.prebundleSvelteLibraries) {
    extraViteConfig.optimizeDeps = {
      ...extraViteConfig.optimizeDeps,
      extensions: options.extensions ?? [".svelte"],
      esbuildOptions: {
        plugins: [{ name: facadeEsbuildSveltePluginName, setup: () => {
        } }]
      }
    };
  }
  if ((options.hot == null || options.hot === true || options.hot && options.hot.partialAccept !== false) && config.experimental?.hmrPartialAccept !== false) {
    log.debug('enabling "experimental.hmrPartialAccept" in vite config');
    extraViteConfig.experimental = { hmrPartialAccept: true };
  }
  validateViteConfig(extraViteConfig, config, options);
  return extraViteConfig;
}
function validateViteConfig(extraViteConfig, config, options) {
  const { prebundleSvelteLibraries, isBuild } = options;
  if (prebundleSvelteLibraries) {
    const isEnabled = (option) => option !== true && option !== (isBuild ? "build" : "dev");
    const logWarning = (name, value, recommendation) => log.warn.once(
      `Incompatible options: \`prebundleSvelteLibraries: true\` and vite \`${name}: ${JSON.stringify(
        value
      )}\` ${isBuild ? "during build." : "."} ${recommendation}`
    );
    const viteOptimizeDepsDisabled = config.optimizeDeps?.disabled ?? "build";
    const isOptimizeDepsEnabled = isEnabled(viteOptimizeDepsDisabled);
    if (!isBuild && !isOptimizeDepsEnabled) {
      logWarning(
        "optimizeDeps.disabled",
        viteOptimizeDepsDisabled,
        'Forcing `optimizeDeps.disabled: "build"`. Disable prebundleSvelteLibraries or update your vite config to enable optimizeDeps during dev.'
      );
      extraViteConfig.optimizeDeps.disabled = "build";
    } else if (isBuild && isOptimizeDepsEnabled) {
      logWarning(
        "optimizeDeps.disabled",
        viteOptimizeDepsDisabled,
        "Disable optimizeDeps or prebundleSvelteLibraries for build if you experience errors."
      );
    }
  }
}
async function buildExtraConfigForDependencies(options, config) {
  const depsConfig = await crawlFrameworkPkgs({
    root: options.root,
    isBuild: options.isBuild,
    viteUserConfig: config,
    isFrameworkPkgByJson(pkgJson) {
      let hasSvelteCondition = false;
      if (typeof pkgJson.exports === "object") {
        JSON.stringify(pkgJson.exports, (key, value) => {
          if (SVELTE_EXPORT_CONDITIONS.includes(key)) {
            hasSvelteCondition = true;
          }
          return value;
        });
      }
      return hasSvelteCondition || !!pkgJson.svelte;
    },
    isSemiFrameworkPkgByJson(pkgJson) {
      return !!pkgJson.dependencies?.svelte || !!pkgJson.peerDependencies?.svelte;
    },
    isFrameworkPkgByName(pkgName) {
      const isNotSveltePackage = isCommonDepWithoutSvelteField(pkgName);
      if (isNotSveltePackage) {
        return false;
      } else {
        return void 0;
      }
    }
  });
  log.debug("extra config for dependencies generated by vitefu", depsConfig);
  if (options.prebundleSvelteLibraries) {
    depsConfig.optimizeDeps.exclude = [];
    const userExclude = config.optimizeDeps?.exclude;
    depsConfig.optimizeDeps.include = !userExclude ? [] : depsConfig.optimizeDeps.include.filter((dep) => {
      return dep.includes(">") && dep.split(">").slice(0, -1).some((d) => isDepExcluded(d.trim(), userExclude));
    });
  }
  if (options.disableDependencyReinclusion === true) {
    depsConfig.optimizeDeps.include = depsConfig.optimizeDeps.include.filter(
      (dep) => !dep.includes(">")
    );
  } else if (Array.isArray(options.disableDependencyReinclusion)) {
    const disabledDeps = options.disableDependencyReinclusion;
    depsConfig.optimizeDeps.include = depsConfig.optimizeDeps.include.filter((dep) => {
      if (!dep.includes(">"))
        return true;
      const trimDep = dep.replace(/\s+/g, "");
      return disabledDeps.some((disabled) => trimDep.includes(`${disabled}>`));
    });
  }
  log.debug("post-processed extra config for dependencies", depsConfig);
  return depsConfig;
}
function buildExtraConfigForSvelte(config) {
  const include = [];
  const exclude = ["svelte-hmr"];
  if (!isDepExcluded("svelte", config.optimizeDeps?.exclude ?? [])) {
    const svelteImportsToInclude = SVELTE_IMPORTS.filter((x) => x !== "svelte/ssr");
    log.debug(
      `adding bare svelte packages to optimizeDeps.include: ${svelteImportsToInclude.join(", ")} `
    );
    include.push(...svelteImportsToInclude);
  } else {
    log.debug('"svelte" is excluded in optimizeDeps.exclude, skipped adding it to include.');
  }
  const noExternal = [];
  const external = [];
  if (!isDepExternaled("svelte", config.ssr?.external ?? [])) {
    noExternal.push("svelte", /^svelte\//);
  }
  return { optimizeDeps: { include, exclude }, ssr: { noExternal, external } };
}
function patchResolvedViteConfig(viteConfig, options) {
  if (options.preprocess) {
    for (const preprocessor of arraify(options.preprocess)) {
      if (preprocessor.style && "__resolvedConfig" in preprocessor.style) {
        preprocessor.style.__resolvedConfig = viteConfig;
      }
    }
  }
  const facadeEsbuildSveltePlugin = viteConfig.optimizeDeps.esbuildOptions?.plugins?.find(
    (plugin) => plugin.name === facadeEsbuildSveltePluginName
  );
  if (facadeEsbuildSveltePlugin) {
    Object.assign(facadeEsbuildSveltePlugin, esbuildSveltePlugin(options));
  }
}
function arraify(value) {
  return Array.isArray(value) ? value : [value];
}

// src/utils/watch.ts
import fs4 from "fs";
import path6 from "path";
function setupWatchers(options, cache, requestParser) {
  const { server, configFile: svelteConfigFile } = options;
  if (!server) {
    return;
  }
  const { watcher, ws } = server;
  const { root, server: serverConfig } = server.config;
  const emitChangeEventOnDependants = (filename) => {
    const dependants = cache.getDependants(filename);
    dependants.forEach((dependant) => {
      if (fs4.existsSync(dependant)) {
        log.debug(
          `emitting virtual change event for "${dependant}" because depdendency "${filename}" changed`
        );
        watcher.emit("change", dependant);
      }
    });
  };
  const removeUnlinkedFromCache = (filename) => {
    const svelteRequest = requestParser(filename, false);
    if (svelteRequest) {
      const removedFromCache = cache.remove(svelteRequest);
      if (removedFromCache) {
        log.debug(`cleared VitePluginSvelteCache for deleted file ${filename}`);
      }
    }
  };
  const triggerViteRestart = (filename) => {
    if (serverConfig.middlewareMode) {
      const message = "Svelte config change detected, restart your dev process to apply the changes.";
      log.info(message, filename);
      ws.send({
        type: "error",
        err: { message, stack: "", plugin: "vite-plugin-svelte", id: filename }
      });
    } else {
      log.info(`svelte config changed: restarting vite server. - file: ${filename}`);
      server.restart();
    }
  };
  const listenerCollection = {
    add: [],
    change: [emitChangeEventOnDependants],
    unlink: [removeUnlinkedFromCache, emitChangeEventOnDependants]
  };
  if (svelteConfigFile !== false) {
    const possibleSvelteConfigs = knownSvelteConfigNames.map((cfg) => path6.join(root, cfg));
    const restartOnConfigAdd = (filename) => {
      if (possibleSvelteConfigs.includes(filename)) {
        triggerViteRestart(filename);
      }
    };
    const restartOnConfigChange = (filename) => {
      if (filename === svelteConfigFile) {
        triggerViteRestart(filename);
      }
    };
    if (svelteConfigFile) {
      listenerCollection.change.push(restartOnConfigChange);
      listenerCollection.unlink.push(restartOnConfigChange);
    } else {
      listenerCollection.add.push(restartOnConfigAdd);
    }
  }
  Object.entries(listenerCollection).forEach(([evt, listeners]) => {
    if (listeners.length > 0) {
      watcher.on(evt, (filename) => listeners.forEach((listener) => listener(filename)));
    }
  });
}
function ensureWatchedFile(watcher, file, root) {
  if (file && !file.startsWith(root + "/") && !file.includes("\0") && fs4.existsSync(file)) {
    watcher.add(path6.resolve(file));
  }
}

// src/utils/resolve.ts
import path7 from "path";
import { builtinModules } from "module";
async function resolveViaPackageJsonSvelte(importee, importer, cache) {
  if (importer && isBareImport(importee) && !isNodeInternal(importee) && !isCommonDepWithoutSvelteField(importee)) {
    const cached = cache.getResolvedSvelteField(importee, importer);
    if (cached) {
      return cached;
    }
    const pkgData = await resolveDependencyData(importee, importer);
    if (pkgData) {
      const { pkg, dir } = pkgData;
      if (pkg.svelte) {
        const result = path7.resolve(dir, pkg.svelte);
        cache.setResolvedSvelteField(importee, importer, result);
        return result;
      }
    }
  }
}
function isNodeInternal(importee) {
  return importee.startsWith("node:") || builtinModules.includes(importee);
}
function isBareImport(importee) {
  if (!importee || importee[0] === "." || importee[0] === "\0" || importee.includes(":") || path7.isAbsolute(importee)) {
    return false;
  }
  const parts = importee.split("/");
  switch (parts.length) {
    case 1:
      return true;
    case 2:
      return parts[0].startsWith("@");
    default:
      return false;
  }
}

// src/utils/optimizer.ts
import { promises as fs5 } from "fs";
import path8 from "path";
var PREBUNDLE_SENSITIVE_OPTIONS = [
  "compilerOptions",
  "configFile",
  "experimental",
  "extensions",
  "ignorePluginPreprocessors",
  "preprocess"
];
async function saveSvelteMetadata(cacheDir, options) {
  const svelteMetadata = generateSvelteMetadata(options);
  const svelteMetadataPath = path8.resolve(cacheDir, "_svelte_metadata.json");
  const currentSvelteMetadata = JSON.stringify(svelteMetadata, (_, value) => {
    return typeof value === "function" ? value.toString() : value;
  });
  let existingSvelteMetadata;
  try {
    existingSvelteMetadata = await fs5.readFile(svelteMetadataPath, "utf8");
  } catch {
  }
  await fs5.mkdir(cacheDir, { recursive: true });
  await fs5.writeFile(svelteMetadataPath, currentSvelteMetadata);
  return currentSvelteMetadata !== existingSvelteMetadata;
}
function generateSvelteMetadata(options) {
  const metadata = {};
  for (const key of PREBUNDLE_SENSITIVE_OPTIONS) {
    metadata[key] = options[key];
  }
  return metadata;
}

// src/ui/inspector/plugin.ts
import { normalizePath as normalizePath4 } from "vite";
import path9 from "path";
import { fileURLToPath } from "url";
import fs6 from "fs";

// src/ui/inspector/utils.ts
var FS_PREFIX = `/@fs/`;
var IS_WINDOWS2 = process.platform === "win32";
var queryRE = /\?.*$/s;
var hashRE = /#.*$/s;
function idToFile(id) {
  if (id.startsWith(FS_PREFIX)) {
    id = id = id.slice(IS_WINDOWS2 ? FS_PREFIX.length : FS_PREFIX.length - 1);
  }
  return id.replace(hashRE, "").replace(queryRE, "");
}

// src/ui/inspector/plugin.ts
var defaultInspectorOptions = {
  toggleKeyCombo: process.platform === "win32" ? "control-shift" : "meta-shift",
  navKeys: { parent: "ArrowUp", child: "ArrowDown", next: "ArrowRight", prev: "ArrowLeft" },
  openKey: "Enter",
  holdMode: false,
  showToggleButton: "active",
  toggleButtonPos: "top-right",
  customStyles: true
};
function getInspectorPath() {
  const pluginPath = normalizePath4(path9.dirname(fileURLToPath(import.meta.url)));
  return pluginPath.replace(/\/vite-plugin-svelte\/dist$/, "/vite-plugin-svelte/src/ui/inspector/");
}
function svelteInspector() {
  const inspectorPath = getInspectorPath();
  log.debug.enabled && log.debug(`svelte inspector path: ${inspectorPath}`);
  let inspectorOptions;
  let appendTo;
  let disabled = false;
  return {
    name: "vite-plugin-svelte:inspector",
    apply: "serve",
    enforce: "pre",
    configResolved(config) {
      const vps = config.plugins.find((p) => p.name === "vite-plugin-svelte");
      const options = vps?.api?.options?.experimental?.inspector;
      if (!vps || !options) {
        log.debug("inspector disabled, could not find config");
        disabled = true;
        return;
      }
      inspectorOptions = {
        ...defaultInspectorOptions,
        ...options
      };
      const isSvelteKit = config.plugins.some((p) => p.name.startsWith("vite-plugin-sveltekit"));
      if (isSvelteKit && !inspectorOptions.appendTo) {
        inspectorOptions.appendTo = `/generated/root.svelte`;
      }
      appendTo = inspectorOptions.appendTo;
    },
    async resolveId(importee, importer, options) {
      if (options?.ssr || disabled) {
        return;
      }
      if (importee.startsWith("virtual:svelte-inspector-options")) {
        return importee;
      } else if (importee.startsWith("virtual:svelte-inspector-path:")) {
        const resolved = importee.replace("virtual:svelte-inspector-path:", inspectorPath);
        log.debug.enabled && log.debug(`resolved ${importee} with ${resolved}`);
        return resolved;
      }
    },
    async load(id, options) {
      if (options?.ssr || disabled) {
        return;
      }
      if (id === "virtual:svelte-inspector-options") {
        return `export default ${JSON.stringify(inspectorOptions ?? {})}`;
      } else if (id.startsWith(inspectorPath)) {
        const file = idToFile(id);
        if (fs6.existsSync(file)) {
          return await fs6.promises.readFile(file, "utf-8");
        } else {
          log.error(`failed to find file for svelte-inspector: ${file}, referenced by id ${id}.`);
        }
      }
    },
    transform(code, id, options) {
      if (options?.ssr || disabled || !appendTo) {
        return;
      }
      if (id.endsWith(appendTo)) {
        return { code: `${code}
import 'virtual:svelte-inspector-path:load-inspector.js'` };
      }
    },
    transformIndexHtml(html) {
      if (disabled || appendTo) {
        return;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            injectTo: "body",
            attrs: {
              type: "module",
              src: "/@id/virtual:svelte-inspector-path:load-inspector.js"
            }
          }
        ]
      };
    }
  };
}

// src/utils/vite-plugin-svelte-cache.ts
var VitePluginSvelteCache = class {
  constructor() {
    this._css = /* @__PURE__ */ new Map();
    this._js = /* @__PURE__ */ new Map();
    this._dependencies = /* @__PURE__ */ new Map();
    this._dependants = /* @__PURE__ */ new Map();
    this._resolvedSvelteFields = /* @__PURE__ */ new Map();
    this._errors = /* @__PURE__ */ new Map();
  }
  update(compileData) {
    this._errors.delete(compileData.normalizedFilename);
    this.updateCSS(compileData);
    this.updateJS(compileData);
    this.updateDependencies(compileData);
  }
  has(svelteRequest) {
    const id = svelteRequest.normalizedFilename;
    return this._errors.has(id) || this._js.has(id) || this._css.has(id);
  }
  setError(svelteRequest, error) {
    this.remove(svelteRequest, true);
    this._errors.set(svelteRequest.normalizedFilename, error);
  }
  updateCSS(compileData) {
    this._css.set(compileData.normalizedFilename, compileData.compiled.css);
  }
  updateJS(compileData) {
    if (!compileData.ssr) {
      this._js.set(compileData.normalizedFilename, compileData.compiled.js);
    }
  }
  updateDependencies(compileData) {
    const id = compileData.normalizedFilename;
    const prevDependencies = this._dependencies.get(id) || [];
    const dependencies = compileData.dependencies;
    this._dependencies.set(id, dependencies);
    const removed = prevDependencies.filter((d) => !dependencies.includes(d));
    const added = dependencies.filter((d) => !prevDependencies.includes(d));
    added.forEach((d) => {
      if (!this._dependants.has(d)) {
        this._dependants.set(d, /* @__PURE__ */ new Set());
      }
      this._dependants.get(d).add(compileData.filename);
    });
    removed.forEach((d) => {
      this._dependants.get(d).delete(compileData.filename);
    });
  }
  remove(svelteRequest, keepDependencies = false) {
    const id = svelteRequest.normalizedFilename;
    let removed = false;
    if (this._errors.delete(id)) {
      removed = true;
    }
    if (this._js.delete(id)) {
      removed = true;
    }
    if (this._css.delete(id)) {
      removed = true;
    }
    if (!keepDependencies) {
      const dependencies = this._dependencies.get(id);
      if (dependencies) {
        removed = true;
        dependencies.forEach((d) => {
          const dependants = this._dependants.get(d);
          if (dependants && dependants.has(svelteRequest.filename)) {
            dependants.delete(svelteRequest.filename);
          }
        });
        this._dependencies.delete(id);
      }
    }
    return removed;
  }
  getCSS(svelteRequest) {
    return this._css.get(svelteRequest.normalizedFilename);
  }
  getJS(svelteRequest) {
    if (!svelteRequest.ssr) {
      return this._js.get(svelteRequest.normalizedFilename);
    }
  }
  getError(svelteRequest) {
    return this._errors.get(svelteRequest.normalizedFilename);
  }
  getDependants(path11) {
    const dependants = this._dependants.get(path11);
    return dependants ? [...dependants] : [];
  }
  getResolvedSvelteField(name, importer) {
    return this._resolvedSvelteFields.get(this._getResolvedSvelteFieldKey(name, importer));
  }
  setResolvedSvelteField(importee, importer = void 0, resolvedSvelte) {
    this._resolvedSvelteFields.set(
      this._getResolvedSvelteFieldKey(importee, importer),
      resolvedSvelte
    );
  }
  _getResolvedSvelteFieldKey(importee, importer) {
    return importer ? `${importer} > ${importee}` : importee;
  }
};

// src/utils/load-raw.ts
import fs7 from "fs";
async function loadRaw(svelteRequest, compileSvelte2, options) {
  const { id, filename, query } = svelteRequest;
  let compileData;
  const source = fs7.readFileSync(filename, "utf-8");
  try {
    svelteRequest.ssr = query.compilerOptions?.generate === "ssr";
    const type = query.type;
    compileData = await compileSvelte2(svelteRequest, source, {
      ...options,
      compilerOptions: {
        dev: false,
        css: false,
        hydratable: false,
        enableSourcemap: query.sourcemap ? {
          js: type === "script" || type === "all",
          css: type === "style" || type === "all"
        } : false,
        ...svelteRequest.query.compilerOptions
      },
      hot: false,
      emitCss: true
    });
  } catch (e) {
    throw toRollupError(e, options);
  }
  let result;
  if (query.type === "style") {
    result = compileData.compiled.css;
  } else if (query.type === "script") {
    result = compileData.compiled.js;
  } else if (query.type === "preprocessed") {
    result = compileData.preprocessed;
  } else if (query.type === "all" && query.raw) {
    return allToRawExports(compileData, source);
  } else {
    throw new Error(
      `invalid "type=${query.type}" in ${id}. supported are script, style, preprocessed, all`
    );
  }
  if (query.direct) {
    const supportedDirectTypes = ["script", "style"];
    if (!supportedDirectTypes.includes(query.type)) {
      throw new Error(
        `invalid "type=${query.type}" combined with direct in ${id}. supported are: ${supportedDirectTypes.join(", ")}`
      );
    }
    log.debug(`load returns direct result for ${id}`);
    let directOutput = result.code;
    if (query.sourcemap && result.map?.toUrl) {
      const map = `sourceMappingURL=${result.map.toUrl()}`;
      if (query.type === "style") {
        directOutput += `

/*# ${map} */
`;
      } else if (query.type === "script") {
        directOutput += `

//# ${map}
`;
      }
    }
    return directOutput;
  } else if (query.raw) {
    log.debug(`load returns raw result for ${id}`);
    return toRawExports(result);
  } else {
    throw new Error(`invalid raw mode in ${id}, supported are raw, direct`);
  }
}
function allToRawExports(compileData, source) {
  const exports = {
    ...compileData,
    ...compileData.compiled,
    source
  };
  delete exports.compiled;
  delete exports.filename;
  return toRawExports(exports);
}
function toRawExports(object) {
  let exports = Object.entries(object).filter(([key, value]) => typeof value !== "function").sort(([a], [b]) => a < b ? -1 : a === b ? 0 : 1).map(([key, value]) => `export const ${key}=${JSON.stringify(value)}`).join("\n") + "\n";
  if (Object.prototype.hasOwnProperty.call(object, "code")) {
    exports += `export default code
`;
  }
  return exports;
}

// src/preprocess.ts
import path10 from "path";
import { preprocessCSS, resolveConfig, transformWithEsbuild } from "vite";
var supportedStyleLangs = ["css", "less", "sass", "scss", "styl", "stylus", "postcss", "sss"];
var supportedScriptLangs = ["ts"];
function vitePreprocess(opts) {
  const preprocessor = {};
  if (opts?.script !== false) {
    preprocessor.script = viteScript().script;
  }
  if (opts?.style !== false) {
    const styleOpts = typeof opts?.style == "object" ? opts?.style : void 0;
    preprocessor.style = viteStyle(styleOpts).style;
  }
  return preprocessor;
}
function viteScript() {
  return {
    async script({ attributes, content, filename = "" }) {
      const lang = attributes.lang;
      if (!supportedScriptLangs.includes(lang))
        return;
      const transformResult = await transformWithEsbuild(content, filename, {
        loader: lang,
        target: "esnext",
        tsconfigRaw: {
          compilerOptions: {
            importsNotUsedAsValues: "preserve",
            preserveValueImports: true
          }
        }
      });
      return {
        code: transformResult.code,
        map: transformResult.map
      };
    }
  };
}
function viteStyle(config = {}) {
  let transform;
  const style = async ({ attributes, content, filename = "" }) => {
    const lang = attributes.lang;
    if (!supportedStyleLangs.includes(lang))
      return;
    if (!transform) {
      let resolvedConfig;
      if (style.__resolvedConfig) {
        resolvedConfig = style.__resolvedConfig;
      } else if (isResolvedConfig(config)) {
        resolvedConfig = config;
      } else {
        resolvedConfig = await resolveConfig(
          config,
          process.env.NODE_ENV === "production" ? "build" : "serve"
        );
      }
      transform = getCssTransformFn(resolvedConfig);
    }
    const moduleId = `${filename}.${lang}`;
    const result = await transform(content, moduleId);
    if (result.map?.sources?.[0] === moduleId) {
      result.map.sources[0] = path10.basename(filename);
    }
    return {
      code: result.code,
      map: result.map ?? void 0
    };
  };
  style.__resolvedConfig = null;
  return { style };
}
function getCssTransformFn(config) {
  return async (code, filename) => {
    return preprocessCSS(code, filename, config);
  };
}
function isResolvedConfig(config) {
  return !!config.inlineConfig;
}

// src/index.ts
function svelte(inlineOptions) {
  if (process.env.DEBUG != null) {
    log.setLevel("debug");
  }
  validateInlineOptions(inlineOptions);
  const cache = new VitePluginSvelteCache();
  let requestParser;
  let options;
  let viteConfig;
  let compileSvelte2;
  let resolvedSvelteSSR;
  const api = {};
  const plugins = [
    {
      name: "vite-plugin-svelte",
      enforce: "pre",
      api,
      async config(config, configEnv) {
        if (process.env.DEBUG) {
          log.setLevel("debug");
        } else if (config.logLevel) {
          log.setLevel(config.logLevel);
        }
        options = await preResolveOptions(inlineOptions, config, configEnv);
        const extraViteConfig = await buildExtraViteConfig(options, config);
        log.debug("additional vite config", extraViteConfig);
        return extraViteConfig;
      },
      async configResolved(config) {
        options = resolveOptions(options, config);
        patchResolvedViteConfig(config, options);
        requestParser = buildIdParser(options);
        compileSvelte2 = createCompileSvelte(options);
        viteConfig = config;
        api.options = options;
        log.debug("resolved options", options);
      },
      async buildStart() {
        if (!options.prebundleSvelteLibraries)
          return;
        const isSvelteMetadataChanged = await saveSvelteMetadata(viteConfig.cacheDir, options);
        if (isSvelteMetadataChanged) {
          viteConfig.optimizeDeps.force = true;
        }
      },
      configureServer(server) {
        options.server = server;
        setupWatchers(options, cache, requestParser);
      },
      async load(id, opts) {
        const ssr = !!opts?.ssr;
        const svelteRequest = requestParser(id, !!ssr);
        if (svelteRequest) {
          const { filename, query, raw } = svelteRequest;
          if (raw) {
            return loadRaw(svelteRequest, compileSvelte2, options);
          } else {
            if (query.svelte && query.type === "style") {
              const css = cache.getCSS(svelteRequest);
              if (css) {
                log.debug(`load returns css for ${filename}`);
                return css;
              }
            }
            if (viteConfig.assetsInclude(filename)) {
              log.debug(`load returns raw content for ${filename}`);
              return fs8.readFileSync(filename, "utf-8");
            }
          }
        }
      },
      async resolveId(importee, importer, opts) {
        const ssr = !!opts?.ssr;
        const svelteRequest = requestParser(importee, ssr);
        if (svelteRequest?.query.svelte) {
          if (svelteRequest.query.type === "style" && !svelteRequest.raw) {
            log.debug(`resolveId resolved virtual css module ${svelteRequest.cssId}`);
            return svelteRequest.cssId;
          }
        }
        if (ssr && importee === "svelte") {
          if (!resolvedSvelteSSR) {
            resolvedSvelteSSR = this.resolve("svelte/ssr", void 0, { skipSelf: true }).then(
              (svelteSSR) => {
                log.debug("resolved svelte to svelte/ssr");
                return svelteSSR;
              },
              (err) => {
                log.debug(
                  "failed to resolve svelte to svelte/ssr. Update svelte to a version that exports it",
                  err
                );
                return null;
              }
            );
          }
          return resolvedSvelteSSR;
        }
        const scan = !!opts?.scan;
        const isPrebundled = options.prebundleSvelteLibraries && viteConfig.optimizeDeps?.disabled !== true && viteConfig.optimizeDeps?.disabled !== (options.isBuild ? "build" : "dev") && !isDepExcluded2(importee, viteConfig.optimizeDeps?.exclude ?? []);
        if (ssr || scan || !isPrebundled) {
          try {
            const resolved = await resolveViaPackageJsonSvelte(importee, importer, cache);
            if (resolved) {
              log.debug(
                `resolveId resolved ${resolved} via package.json svelte field of ${importee}`
              );
              return resolved;
            }
          } catch (e) {
            log.debug.once(
              `error trying to resolve ${importee} from ${importer} via package.json svelte field `,
              e
            );
          }
        }
      },
      async transform(code, id, opts) {
        const ssr = !!opts?.ssr;
        const svelteRequest = requestParser(id, ssr);
        if (!svelteRequest || svelteRequest.query.type === "style" || svelteRequest.raw) {
          return;
        }
        let compileData;
        try {
          compileData = await compileSvelte2(svelteRequest, code, options);
        } catch (e) {
          cache.setError(svelteRequest, e);
          throw toRollupError(e, options);
        }
        logCompilerWarnings(svelteRequest, compileData.compiled.warnings, options);
        cache.update(compileData);
        if (compileData.dependencies?.length && options.server) {
          compileData.dependencies.forEach((d) => {
            ensureWatchedFile(options.server.watcher, d, options.root);
          });
        }
        log.debug(`transform returns compiled js for ${svelteRequest.filename}`);
        return {
          ...compileData.compiled.js,
          meta: {
            vite: {
              lang: compileData.lang
            }
          }
        };
      },
      handleHotUpdate(ctx) {
        if (!options.hot || !options.emitCss) {
          return;
        }
        const svelteRequest = requestParser(ctx.file, false, ctx.timestamp);
        if (svelteRequest) {
          try {
            return handleHotUpdate(compileSvelte2, ctx, svelteRequest, cache, options);
          } catch (e) {
            throw toRollupError(e, options);
          }
        }
      },
      async buildEnd() {
        await options.stats?.finishAll();
      }
    }
  ];
  plugins.push(svelteInspector());
  return plugins.filter(Boolean);
}
export {
  loadSvelteConfig,
  svelte,
  vitePreprocess
};
//# sourceMappingURL=index.js.map