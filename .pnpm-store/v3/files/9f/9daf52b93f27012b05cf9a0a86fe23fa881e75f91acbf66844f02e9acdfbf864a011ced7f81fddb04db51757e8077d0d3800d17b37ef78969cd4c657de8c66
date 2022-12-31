var __defProp = Object.defineProperty;
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

// src/presets/ahooks.ts
import { readFileSync } from "fs";
import { resolveModule } from "local-pkg";
var _cache;
var ahooks_default = () => {
  if (!_cache) {
    let indexesJson;
    try {
      const path = resolveModule("ahooks/metadata.json");
      indexesJson = JSON.parse(readFileSync(path, "utf-8"));
    } catch (error) {
      console.error(error);
      throw new Error("[auto-import] failed to load ahooks, have you installed it?");
    }
    if (indexesJson) {
      _cache = {
        ahooks: indexesJson.functions.flatMap((i) => [i.name, ...i.alias || []])
      };
    }
  }
  return _cache || {};
};

// src/presets/mobx.ts
var mobx = [
  "makeObservable",
  "makeAutoObservable",
  "extendObservable",
  "observable",
  "action",
  "runInAction",
  "flow",
  "flowResult",
  "computed",
  "autorun",
  "reaction",
  "when",
  "onReactionError",
  "intercept",
  "observe",
  "onBecomeObserved",
  "onBecomeUnobserved",
  "toJS"
];
var mobx_default = {
  mobx: [
    ...mobx
  ]
};

// src/presets/mobx-react-lite.ts
var mobx_react_lite_default = {
  "mobx-react-lite": [
    "observer",
    "Observer",
    "useLocalObservable"
  ]
};

// src/presets/vue.ts
var CommonCompositionAPI = [
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
  "isReactive",
  "isProxy",
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
  "watchPostEffect",
  "watchSyncEffect",
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
var vue_default = {
  vue: [
    ...CommonCompositionAPI,
    "onRenderTracked",
    "onRenderTriggered",
    "resolveComponent",
    "resolveDirective",
    "useCssVars"
  ]
};

// src/presets/nuxt-composition-api.ts
var nuxt_composition_api_default = {
  "@nuxtjs/composition-api": [
    ...CommonCompositionAPI,
    "onGlobalSetup",
    "useFetch",
    "useAsync",
    "useContext",
    "ssrRef",
    "shallowSsrRef",
    "ssrPromise",
    "useMeta",
    "useStore",
    "useRouter",
    "useRoute"
  ]
};

// src/presets/pinia.ts
var pinia_default = {
  pinia: [
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
};

// src/presets/preact.ts
var preact_default = {
  "preact/hooks": [
    "useState",
    "useCallback",
    "useMemo",
    "useEffect",
    "useRef",
    "useContext",
    "useReducer"
  ]
};

// src/presets/quasar.ts
var quasar_default = {
  quasar: [
    "useQuasar",
    "useDialogPluginComponent",
    "useFormChild",
    "useMeta"
  ]
};

// src/presets/react.ts
var CommonReactAPI = [
  "useState",
  "useCallback",
  "useMemo",
  "useEffect",
  "useRef",
  "useContext",
  "useReducer",
  "useImperativeHandle",
  "useDebugValue",
  "useDeferredValue",
  "useLayoutEffect",
  "useTransition",
  "startTransition",
  "useSyncExternalStore",
  "useInsertionEffect",
  "useId",
  "lazy",
  "memo",
  "createRef",
  "forwardRef"
];
var react_default = {
  react: CommonReactAPI
};

// src/presets/react-router.ts
var ReactRouterHooks = [
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
var react_router_default = {
  "react-router": [
    ...ReactRouterHooks
  ]
};

// src/presets/react-router-dom.ts
var react_router_dom_default = {
  "react-router-dom": [
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
};

// src/presets/react-i18next.ts
var react_i18next_default = {
  "react-i18next": ["useTranslation"]
};

// src/presets/svelte.ts
var svelteAnimate = {
  "svelte/animate": [
    "flip"
  ]
};
var svelteEasing = {
  "svelte/easing": [
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
};
var svelteStore = {
  "svelte/store": [
    "writable",
    "readable",
    "derived",
    "get"
  ]
};
var svelteMotion = {
  "svelte/motion": [
    "tweened",
    "spring"
  ]
};
var svelteTransition = {
  "svelte/transition": [
    "fade",
    "blur",
    "fly",
    "slide",
    "scale",
    "draw",
    "crossfade"
  ]
};
var svelte = {
  svelte: [
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
};

// src/presets/vee-validate.ts
var vee_validate_default = {
  "vee-validate": [
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
};

// src/presets/vitepress.ts
var vitepress_default = {
  vitepress: [
    "useData",
    "useRoute",
    "useRouter",
    "withBase"
  ]
};

// src/presets/vue-demi.ts
var vue_demi_default = {
  "vue-demi": CommonCompositionAPI
};

// src/presets/vue-i18n.ts
var vue_i18n_default = {
  "vue-i18n": [
    "useI18n"
  ]
};

// src/presets/vue-router.ts
var vue_router_default = {
  "vue-router": [
    "useRouter",
    "useRoute",
    "useLink",
    "onBeforeRouteLeave",
    "onBeforeRouteUpdate"
  ]
};

// src/presets/vue-composition-api.ts
var vue_composition_api_default = {
  "@vue/composition-api": CommonCompositionAPI
};

// src/presets/vueuse-core.ts
import { readFileSync as readFileSync2 } from "fs";
import { resolveModule as resolveModule2 } from "local-pkg";
var _cache2;
var vueuse_core_default = () => {
  const excluded = ["toRefs", "utils"];
  if (!_cache2) {
    let indexesJson;
    try {
      const corePath = resolveModule2("@vueuse/core") || process.cwd();
      const path = resolveModule2("@vueuse/core/indexes.json") || resolveModule2("@vueuse/metadata/index.json") || resolveModule2("@vueuse/metadata/index.json", { paths: [corePath] });
      indexesJson = JSON.parse(readFileSync2(path, "utf-8"));
    } catch (error) {
      console.error(error);
      throw new Error("[auto-import] failed to load @vueuse/core, have you installed it?");
    }
    if (indexesJson) {
      _cache2 = {
        "@vueuse/core": indexesJson.functions.filter((i) => ["core", "shared"].includes(i.package)).flatMap((i) => [i.name, ...i.alias || []]).filter((i) => i && i.length >= 4 && !excluded.includes(i))
      };
    }
  }
  return _cache2 || {};
};

// src/presets/vue-macros.ts
var vue_macros_default = {
  "vue/macros": [
    "$",
    "$$",
    "$ref",
    "$shallowRef",
    "$toRef",
    "$customRef",
    "$computed"
  ]
};

// src/presets/vueuse-head.ts
var vueuse_head_default = {
  "@vueuse/head": [
    "useHead"
  ]
};

// src/presets/vuex.ts
var vuex_default = {
  vuex: [
    "createStore",
    "createLogger",
    "mapState",
    "mapGetters",
    "mapActions",
    "mapMutations",
    "createNamespacedHelpers",
    "useStore"
  ]
};

// src/presets/vitest.ts
var vitest_default = {
  vitest: [
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
};

// src/presets/uni-app.ts
var uni_app_default = {
  "@dcloudio/uni-app": [
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
};

// src/presets/solid.ts
var solidCore = {
  "solid-js": [
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
};
var solidStore = {
  "solid-js/store": [
    "createStore",
    "produce",
    "reconcile",
    "createMutable"
  ]
};
var solidWeb = {
  "solid-js/web": [
    "Dynamic",
    "hydrate",
    "render",
    "renderToString",
    "renderToStringAsync",
    "renderToStream",
    "isServer",
    "Portal"
  ]
};
var solid_default = __spreadValues(__spreadValues(__spreadValues({}, solidCore), solidStore), solidWeb);

// src/presets/solid-router.ts
var solid_router_default = {
  "@solidjs/router": [
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
};

// src/presets/solid-app-router.ts
var solid_app_router_default = {
  "solid-app-router": [
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
};

// src/presets/jotai.ts
var jotai = {
  jotai: [
    "atom",
    "useAtom",
    "useAtomValue",
    "useSetAtom"
  ]
};
var jotaiUtils = {
  "jotai/utils": [
    "atomWithReset",
    "useResetAtom",
    "useReducerAtom",
    "atomWithReducer",
    "atomFamily",
    "selectAtom",
    "useAtomCallback",
    "freezeAtom",
    "freezeAtomCreator",
    "splitAtom",
    "atomWithDefault",
    "waitForAll",
    "atomWithStorage",
    "atomWithHash",
    "createJSONStorage",
    "atomWithObservable",
    "useHydrateAtoms",
    "loadable"
  ]
};

// src/presets/vueuse-math.ts
import { readFileSync as readFileSync3 } from "fs";
import { resolveModule as resolveModule3 } from "local-pkg";
var _cache3;
var vueuse_math_default = () => {
  if (!_cache3) {
    let indexesJson;
    try {
      const corePath = resolveModule3("@vueuse/core") || process.cwd();
      const path = resolveModule3("@vueuse/metadata/index.json") || resolveModule3("@vueuse/metadata/index.json", { paths: [corePath] });
      indexesJson = JSON.parse(readFileSync3(path, "utf-8"));
    } catch (error) {
      console.error(error);
      throw new Error("[auto-import] failed to load @vueuse/math, have you installed it?");
    }
    if (indexesJson) {
      _cache3 = {
        "@vueuse/math": indexesJson.functions.filter((i) => ["math"].includes(i.package)).flatMap((i) => [i.name, ...i.alias || []]).filter((i) => i && i.length >= 4)
      };
    }
  }
  return _cache3 || {};
};

// src/presets/recoil.ts
var recoil_default = {
  recoil: [
    "atom",
    "selector",
    "useRecoilState",
    "useRecoilValue",
    "useSetRecoilState",
    "useResetRecoilState",
    "useRecoilStateLoadable",
    "useRecoilValueLoadable",
    "isRecoilValue",
    "useRecoilCallback"
  ]
};

// src/presets/index.ts
var presets = {
  "ahooks": ahooks_default,
  "@nuxtjs/composition-api": nuxt_composition_api_default,
  "@vue/composition-api": vue_composition_api_default,
  "@vueuse/core": vueuse_core_default,
  "@vueuse/math": vueuse_math_default,
  "@vueuse/head": vueuse_head_default,
  "mobx": mobx_default,
  "mobx-react-lite": mobx_react_lite_default,
  "pinia": pinia_default,
  "preact": preact_default,
  "quasar": quasar_default,
  "react": react_default,
  "react-router": react_router_default,
  "react-router-dom": react_router_dom_default,
  "react-i18next": react_i18next_default,
  "svelte": svelte,
  "svelte/animate": svelteAnimate,
  "svelte/easing": svelteEasing,
  "svelte/motion": svelteMotion,
  "svelte/store": svelteStore,
  "svelte/transition": svelteTransition,
  "vee-validate": vee_validate_default,
  "vitepress": vitepress_default,
  "vue-demi": vue_demi_default,
  "vue-i18n": vue_i18n_default,
  "vue-router": vue_router_default,
  "vue": vue_default,
  "vue/macros": vue_macros_default,
  "vuex": vuex_default,
  "vitest": vitest_default,
  "uni-app": uni_app_default,
  "solid-js": solid_default,
  "@solidjs/router": solid_router_default,
  "solid-app-router": solid_app_router_default,
  "jotai": jotai,
  "jotai/utils": jotaiUtils,
  "recoil": recoil_default
};

export {
  __spreadValues,
  presets
};
