import { readFileSync, existsSync, promises, accessSync, constants } from 'fs';
import fg from 'fast-glob';
import { join, dirname, normalize, parse } from 'pathe';
import { resolveModuleExportNames, findExports, findStaticImports, parseStaticImport, detectSyntax } from 'mlly';
import { camelCase } from 'scule';
import { d as defineUnimportPreset, v as vueTemplateAddon, n as normalizeImports, b as dedupeImports, c as toExports, j as getMagicString, a as stripCommentsAndStrings, m as matchRE, e as excludeRE, s as separatorRE, i as importAsRE, k as addImportToCode, g as toTypeDeclarationFile } from './unimport.bbd7571a.mjs';
import { resolveModule } from 'local-pkg';
import os from 'os';
import { resolvePackageJSON, readPackageJSON } from 'pkg-types';

const pinia = defineUnimportPreset({
  from: "pinia",
  imports: [
    "acceptHMRUpdate",
    "createPinia",
    "defineStore",
    "getActivePinia",
    "mapActions",
    "mapGetters",
    "mapState",
    "mapStores",
    "mapWritableState",
    "setActivePinia",
    "setMapStoreSuffix",
    "storeToRefs"
  ]
});

const preact = defineUnimportPreset({
  from: "preact",
  imports: [
    "useState",
    "useCallback",
    "useMemo",
    "useEffect",
    "useRef",
    "useContext",
    "useReducer"
  ]
});

const quasar = defineUnimportPreset({
  from: "quasar",
  imports: [
    "useQuasar",
    "useDialogPluginComponent",
    "useFormChild",
    "useMeta"
  ]
});

const react = defineUnimportPreset({
  from: "react",
  imports: [
    "useState",
    "useCallback",
    "useMemo",
    "useEffect",
    "useRef",
    "useContext",
    "useReducer"
  ]
});

const ReactRouterHooks = [
  "useOutletContext",
  "useHref",
  "useInRouterContext",
  "useLocation",
  "useNavigationType",
  "useNavigate",
  "useOutlet",
  "useParams",
  "useResolvedPath",
  "useRoutes"
];
const reactRouter = defineUnimportPreset({
  from: "react-router",
  imports: [
    ...ReactRouterHooks
  ]
});

const reactRouterDom = defineUnimportPreset({
  from: "react-router-dom",
  imports: [
    ...ReactRouterHooks,
    "useLinkClickHandler",
    "useSearchParams",
    "Link",
    "NavLink",
    "Navigate",
    "Outlet",
    "Route",
    "Routes"
  ]
});

const svelteAnimate = defineUnimportPreset({
  from: "svelte/animate",
  imports: [
    "flip"
  ]
});
const svelteEasing = defineUnimportPreset({
  from: "svelte/easing",
  imports: [
    "back",
    "bounce",
    "circ",
    "cubic",
    "elastic",
    "expo",
    "quad",
    "quart",
    "quint",
    "sine"
  ].reduce((acc, e) => {
    acc.push(`${e}In`, `${e}Out`, `${e}InOut`);
    return acc;
  }, ["linear"])
});
const svelteStore = defineUnimportPreset({
  from: "svelte/store",
  imports: [
    "writable",
    "readable",
    "derived",
    "get"
  ]
});
const svelteMotion = defineUnimportPreset({
  from: "svelte/motion",
  imports: [
    "tweened",
    "spring"
  ]
});
const svelteTransition = defineUnimportPreset({
  from: "svelte/transition",
  imports: [
    "fade",
    "blur",
    "fly",
    "slide",
    "scale",
    "draw",
    "crossfade"
  ]
});
const svelte = defineUnimportPreset({
  from: "svelte",
  imports: [
    "onMount",
    "beforeUpdate",
    "afterUpdate",
    "onDestroy",
    "tick",
    "setContext",
    "getContext",
    "hasContext",
    "getAllContexts",
    "createEventDispatcher"
  ]
});

const veeValidate = defineUnimportPreset({
  from: "vee-validate",
  imports: [
    "validate",
    "defineRule",
    "configure",
    "useField",
    "useForm",
    "useFieldArray",
    "useResetForm",
    "useIsFieldDirty",
    "useIsFieldTouched",
    "useIsFieldValid",
    "useIsSubmitting",
    "useValidateField",
    "useIsFormDirty",
    "useIsFormTouched",
    "useIsFormValid",
    "useValidateForm",
    "useSubmitCount",
    "useFieldValue",
    "useFormValues",
    "useFormErrors",
    "useFieldError",
    "useSubmitForm",
    "FormContextKey",
    "FieldContextKey"
  ]
});

const vitepress = defineUnimportPreset({
  from: "vitepress",
  imports: [
    "useData",
    "useRoute",
    "useRouter",
    "withBase"
  ]
});

const CommonCompositionAPI = [
  "onActivated",
  "onBeforeMount",
  "onBeforeUnmount",
  "onBeforeUpdate",
  "onErrorCaptured",
  "onDeactivated",
  "onMounted",
  "onServerPrefetch",
  "onUnmounted",
  "onUpdated",
  "useAttrs",
  "useSlots",
  "computed",
  "customRef",
  "isReadonly",
  "isRef",
  "markRaw",
  "reactive",
  "readonly",
  "ref",
  "shallowReactive",
  "shallowReadonly",
  "shallowRef",
  "triggerRef",
  "toRaw",
  "toRef",
  "toRefs",
  "unref",
  "watch",
  "watchEffect",
  "defineComponent",
  "defineAsyncComponent",
  "getCurrentInstance",
  "h",
  "inject",
  "nextTick",
  "provide",
  "useCssModule",
  "createApp",
  "effectScope",
  "EffectScope",
  "getCurrentScope",
  "onScopeDispose"
];
const vue = defineUnimportPreset({
  from: "vue",
  imports: [
    ...CommonCompositionAPI,
    "onRenderTracked",
    "onRenderTriggered",
    "resolveComponent",
    "useCssVars"
  ]
});

const vueMacros = defineUnimportPreset({
  from: "vue/macros",
  imports: [
    "$",
    "$$",
    "$ref",
    "$shallowRef",
    "$toRef",
    "$customRef",
    "$computed"
  ]
});

const vueDemi = defineUnimportPreset({
  from: "vue-demi",
  imports: CommonCompositionAPI
});

const vueI18n = defineUnimportPreset({
  from: "vue-i18n",
  imports: [
    "useI18n"
  ]
});

const vueRouter = defineUnimportPreset({
  from: "vue-router",
  imports: [
    "useRouter",
    "useRoute"
  ]
});

const vueCompositionApi = defineUnimportPreset({
  from: "@vue/composition-api",
  imports: CommonCompositionAPI
});

let _cache;
const vueuseCore = () => {
  const excluded = ["toRefs", "utils"];
  if (!_cache) {
    try {
      const corePath = resolveModule("@vueuse/core") || process.cwd();
      const path = resolveModule("@vueuse/core/indexes.json") || resolveModule("@vueuse/metadata/index.json") || resolveModule("@vueuse/metadata/index.json", { paths: [corePath] });
      const indexesJson = JSON.parse(readFileSync(path, "utf-8"));
      _cache = defineUnimportPreset({
        from: "@vueuse/core",
        imports: indexesJson.functions.filter((i) => ["core", "shared"].includes(i.package)).map((i) => i.name).filter((i) => i && i.length >= 4 && !excluded.includes(i))
      });
    } catch (error) {
      console.error(error);
      throw new Error("[auto-import] failed to load @vueuse/core, have you installed it?");
    }
  }
  return _cache;
};

const vueuseHead = defineUnimportPreset({
  from: "@vueuse/head",
  imports: [
    "useHead"
  ]
});

const vuex = defineUnimportPreset({
  from: "vuex",
  imports: [
    "createStore",
    "createLogger",
    "mapState",
    "mapGetters",
    "mapActions",
    "mapMutations",
    "createNamespacedHelpers",
    "useStore"
  ]
});

const vitest = defineUnimportPreset({
  from: "vitest",
  imports: [
    "suite",
    "test",
    "describe",
    "it",
    "chai",
    "expect",
    "assert",
    "vitest",
    "vi",
    "beforeAll",
    "afterAll",
    "beforeEach",
    "afterEach"
  ]
});

const uniApp = defineUnimportPreset({
  from: "@dcloudio/uni-app",
  imports: [
    "onAddToFavorites",
    "onBackPress",
    "onError",
    "onHide",
    "onLaunch",
    "onLoad",
    "onNavigationBarButtonTap",
    "onNavigationBarSearchInputChanged",
    "onNavigationBarSearchInputClicked",
    "onNavigationBarSearchInputConfirmed",
    "onNavigationBarSearchInputFocusChanged",
    "onPageNotFound",
    "onPageScroll",
    "onPullDownRefresh",
    "onReachBottom",
    "onReady",
    "onResize",
    "onShareAppMessage",
    "onShareTimeline",
    "onShow",
    "onTabItemTap",
    "onThemeChange",
    "onUnhandledRejection",
    "onUnload"
  ]
});

const solidCore = defineUnimportPreset({
  from: "solid-js",
  imports: [
    "createSignal",
    "createEffect",
    "createMemo",
    "createResource",
    "onMount",
    "onCleanup",
    "onError",
    "untrack",
    "batch",
    "on",
    "createRoot",
    "mergeProps",
    "splitProps",
    "useTransition",
    "observable",
    "mapArray",
    "indexArray",
    "createContext",
    "useContext",
    "children",
    "lazy",
    "createDeferred",
    "createRenderEffect",
    "createSelector",
    "For",
    "Show",
    "Switch",
    "Match",
    "Index",
    "ErrorBoundary",
    "Suspense",
    "SuspenseList"
  ]
});
const solidStore = defineUnimportPreset({
  from: "solid-js/store",
  imports: [
    "createStore",
    "produce",
    "reconcile",
    "createMutable"
  ]
});
const solidWeb = defineUnimportPreset({
  from: "solid-js/web",
  imports: [
    "Dynamic",
    "hydrate",
    "render",
    "renderToString",
    "renderToStringAsync",
    "renderToStream",
    "isServer",
    "Portal"
  ]
});
const solid = defineUnimportPreset({
  from: "solid-js",
  imports: [
    solidCore,
    solidStore,
    solidWeb
  ]
});

const solidAppRouter = defineUnimportPreset({
  from: "solid-app-router",
  imports: [
    "Link",
    "NavLink",
    "Navigate",
    "Outlet",
    "Route",
    "Router",
    "Routes",
    "_mergeSearchString",
    "createIntegration",
    "hashIntegration",
    "normalizeIntegration",
    "pathIntegration",
    "staticIntegration",
    "useHref",
    "useIsRouting",
    "useLocation",
    "useMatch",
    "useNavigate",
    "useParams",
    "useResolvedPath",
    "useRouteData",
    "useRoutes",
    "useSearchParams"
  ]
});

const builtinPresets = {
  "@vue/composition-api": vueCompositionApi,
  "@vueuse/core": vueuseCore,
  "@vueuse/head": vueuseHead,
  pinia,
  preact,
  quasar,
  react,
  "react-router": reactRouter,
  "react-router-dom": reactRouterDom,
  svelte,
  "svelte/animate": svelteAnimate,
  "svelte/easing": svelteEasing,
  "svelte/motion": svelteMotion,
  "svelte/store": svelteStore,
  "svelte/transition": svelteTransition,
  "vee-validate": veeValidate,
  vitepress,
  "vue-demi": vueDemi,
  "vue-i18n": vueI18n,
  "vue-router": vueRouter,
  vue,
  "vue/macros": vueMacros,
  vuex,
  vitest,
  "uni-app": uniApp,
  "solid-js": solid,
  "solid-app-router": solidAppRouter
};

const CACHE_PATH = /* @__PURE__ */ join(os.tmpdir(), "unimport");
let CACHE_WRITEABLE;
async function resolvePackagePreset(preset) {
  const scanned = await extractExports(preset.package, preset.url, preset.cache);
  const filtered = scanned.filter((name) => {
    for (const item of preset.ignore || []) {
      if (typeof item === "string" && item === name) {
        return false;
      }
      if (item instanceof RegExp && item.test(name)) {
        return false;
      }
      if (typeof item === "function" && item(name) === false) {
        return false;
      }
    }
    return true;
  });
  return filtered.map((name) => ({
    from: preset.package,
    name
  }));
}
async function extractExports(name, url, cache = true) {
  const packageJsonPath = await resolvePackageJSON(name, { url });
  const packageJson = await readPackageJSON(packageJsonPath);
  const version = packageJson.version;
  const cachePath = join(CACHE_PATH, name + "@" + version, "exports.json");
  if (cache && CACHE_WRITEABLE === void 0) {
    try {
      CACHE_WRITEABLE = isWritable(CACHE_PATH);
    } catch {
      CACHE_WRITEABLE = false;
    }
  }
  const useCache = cache && version && CACHE_WRITEABLE;
  if (useCache && existsSync(cachePath)) {
    return JSON.parse(await promises.readFile(cachePath, "utf-8"));
  }
  const scanned = await resolveModuleExportNames(name, { url });
  if (useCache) {
    await promises.mkdir(dirname(cachePath), { recursive: true });
    await promises.writeFile(cachePath, JSON.stringify(scanned), "utf-8");
  }
  return scanned;
}
function isWritable(filename) {
  try {
    accessSync(filename, constants.W_OK);
    return true;
  } catch (e) {
    return false;
  }
}

const commonProps = ["from", "priority", "disabled"];
async function resolvePreset(preset) {
  const imports = [];
  if ("package" in preset) {
    return await resolvePackagePreset(preset);
  }
  const common = {};
  commonProps.forEach((i) => {
    if (i in preset) {
      common[i] = preset[i];
    }
  });
  for (const _import of preset.imports) {
    if (typeof _import === "string") {
      imports.push({ ...common, name: _import, as: _import });
    } else if (Array.isArray(_import)) {
      imports.push({ ...common, name: _import[0], as: _import[1] || _import[0], from: _import[2] || preset.from });
    } else if (_import.imports) {
      imports.push(...await resolvePreset(_import));
    } else {
      imports.push({ ...common, ..._import });
    }
  }
  return imports;
}
async function resolveBuiltinPresets(presets) {
  const resolved = await Promise.all(presets.map(async (p) => {
    let preset = typeof p === "string" ? builtinPresets[p] : p;
    if (typeof preset === "function") {
      preset = preset();
    }
    return await resolvePreset(preset);
  }));
  return resolved.flat();
}

async function scanDirExports(dir, options) {
  const dirs = (Array.isArray(dir) ? dir : [dir]).map((d) => normalize(d));
  const fileFilter = options?.fileFilter || (() => true);
  const filePatterns = options?.filePatterns || ["*.{ts,js,mjs,cjs,mts,cts}"];
  const result = await Promise.all(
    dirs.map(
      async (i) => await fg(
        [i, ...filePatterns.map((p) => join(i, p))],
        {
          absolute: true,
          cwd: options?.cwd || process.cwd(),
          onlyFiles: true,
          followSymbolicLinks: true
        }
      ).then(
        (r) => r.map((f) => normalize(f)).sort()
      )
    )
  );
  const files = Array.from(new Set(result.flat())).filter(fileFilter);
  const fileExports = await Promise.all(files.map(scanExports));
  return fileExports.flat();
}
async function scanExports(filepath) {
  const imports = [];
  const code = await promises.readFile(filepath, "utf-8");
  const exports = findExports(code);
  const defaultExport = exports.find((i) => i.type === "default");
  if (defaultExport) {
    let name = parse(filepath).name;
    if (name === "index") {
      name = parse(filepath.split("/").slice(0, -1).join("/")).name;
    }
    imports.push({ name: "default", as: camelCase(name), from: filepath });
  }
  for (const exp of exports) {
    if (exp.type === "named") {
      for (const name of exp.names) {
        imports.push({ name, as: name, from: filepath });
      }
    } else if (exp.type === "declaration") {
      if (exp.name) {
        imports.push({ name: exp.name, as: exp.name, from: filepath });
      }
    }
  }
  return imports;
}

function createUnimport(opts) {
  let _combinedImports;
  const _map = /* @__PURE__ */ new Map();
  const addons = [];
  if (Array.isArray(opts.addons)) {
    addons.push(...opts.addons);
  } else if (opts.addons?.vueTemplate) {
    addons.push(vueTemplateAddon());
  }
  const ctx = {
    staticImports: [...opts.imports || []].filter(Boolean),
    dynamicImports: [],
    async getImports() {
      await resolvePromise;
      return updateImports();
    },
    async getImportMap() {
      await ctx.getImports();
      return _map;
    },
    invalidate() {
      _combinedImports = void 0;
    },
    resolveId: (id, parentId) => opts.resolveId?.(id, parentId),
    addons,
    options: opts
  };
  const resolvePromise = resolveBuiltinPresets(opts.presets || []).then((r) => {
    ctx.staticImports.unshift(...r);
    _combinedImports = void 0;
    updateImports();
  });
  function updateImports() {
    if (!_combinedImports) {
      const imports = normalizeImports(dedupeImports([...ctx.staticImports, ...ctx.dynamicImports], opts.warn || console.warn)).filter((i) => !i.disabled);
      _map.clear();
      for (const _import of imports) {
        _map.set(_import.as ?? _import.name, _import);
      }
      _combinedImports = imports;
    }
    return _combinedImports;
  }
  async function modifyDynamicImports(fn) {
    const result = await fn(ctx.dynamicImports);
    if (Array.isArray(result)) {
      ctx.dynamicImports = result;
    }
    ctx.invalidate();
  }
  function clearDynamicImports() {
    ctx.dynamicImports.length = 0;
    ctx.invalidate();
  }
  async function generateTypeDeclarations(options) {
    const opts2 = {
      resolvePath: (i) => i.from.replace(/\.ts$/, ""),
      ...options
    };
    let dts = toTypeDeclarationFile(await ctx.getImports(), opts2);
    for (const addon of ctx.addons) {
      dts = await addon.declaration?.call(ctx, dts, opts2) ?? dts;
    }
    return dts;
  }
  return {
    clearDynamicImports,
    modifyDynamicImports,
    getImports: () => ctx.getImports(),
    detectImports: (code) => detectImports(code, ctx),
    injectImports: (code, id, options) => injectImports(code, id, ctx, options),
    toExports: async (filepath) => toExports(await ctx.getImports(), filepath),
    parseVirtualImports: (code) => parseVirtualImports(code, ctx),
    generateTypeDeclarations
  };
}
function parseVirtualImports(code, ctx) {
  if (ctx.options.virtualImports?.length) {
    return findStaticImports(code).filter((i) => ctx.options.virtualImports.includes(i.specifier)).map((i) => parseStaticImport(i));
  }
  return [];
}
async function detectImports(code, ctx, options) {
  const s = getMagicString(code);
  const original = s.original;
  const strippedCode = stripCommentsAndStrings(original);
  const syntax = detectSyntax(strippedCode);
  const isCJSContext = syntax.hasCJS && !syntax.hasESM;
  let matchedImports = [];
  const map = await ctx.getImportMap();
  if (options?.autoImport !== false) {
    const identifiers = new Set(
      Array.from(strippedCode.matchAll(matchRE)).map((i) => {
        if (i[1] === ".") {
          return "";
        }
        const end = strippedCode[i.index + i[0].length];
        if (end === ":" && !["?", "case"].includes(i[1].trim())) {
          return "";
        }
        return i[2];
      }).filter(Boolean)
    );
    for (const regex of excludeRE) {
      for (const match of strippedCode.matchAll(regex)) {
        const segments = [...match[1]?.split(separatorRE) || [], ...match[2]?.split(separatorRE) || []];
        for (const segment of segments) {
          const identifier = segment.replace(importAsRE, "").trim();
          identifiers.delete(identifier);
        }
      }
    }
    matchedImports = Array.from(identifiers).map((name) => map.get(name)).filter((i) => i && !i.disabled);
    for (const addon of ctx.addons) {
      matchedImports = await addon.matchImports?.call(ctx, identifiers, matchedImports) || matchedImports;
    }
  }
  if (options?.transformVirtualImports !== false && options?.transformVirtualImoports !== false && ctx.options.virtualImports?.length) {
    const virtualImports = parseVirtualImports(original, ctx);
    virtualImports.forEach((i) => {
      s.remove(i.start, i.end);
      Object.entries(i.namedImports || {}).forEach(([name, as]) => {
        const original2 = map.get(name);
        if (!original2) {
          throw new Error(`[unimport] failed to find "${name}" imported from "${i.specifier}"`);
        }
        matchedImports.push({
          from: original2.from,
          name: original2.name,
          as
        });
      });
    });
  }
  return {
    s,
    strippedCode,
    isCJSContext,
    matchedImports
  };
}
async function injectImports(code, id, ctx, options) {
  const s = getMagicString(code);
  for (const addon of ctx.addons) {
    await addon.transform?.call(ctx, s, id);
  }
  const { isCJSContext, matchedImports } = await detectImports(s, ctx, options);
  const imports = await resolveImports(ctx, matchedImports, id);
  return addImportToCode(s, imports, isCJSContext, options?.mergeExisting);
}
async function resolveImports(ctx, imports, id) {
  const resolveCache = /* @__PURE__ */ new Map();
  return await Promise.all(imports.map(async (i) => {
    if (!resolveCache.has(i.from)) {
      resolveCache.set(i.from, await ctx.resolveId(i.from, id) || i.from);
    }
    return {
      ...i,
      from: resolveCache.get(i.from)
    };
  }));
}

export { resolveBuiltinPresets as a, builtinPresets as b, scanExports as c, createUnimport as d, resolvePreset as r, scanDirExports as s };
