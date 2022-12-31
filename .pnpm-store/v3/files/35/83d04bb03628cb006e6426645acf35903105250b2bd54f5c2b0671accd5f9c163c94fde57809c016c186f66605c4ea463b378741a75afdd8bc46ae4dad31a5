import fs from "fs";
import * as colors from "kleur/colors";
import { bgGreen, black, cyan, dim, green, magenta } from "kleur/colors";
import npath from "path";
import { fileURLToPath } from "url";
import { getContentPaths } from "../../content/index.js";
import { hasPrerenderedPages } from "../../core/build/internal.js";
import {
  prependForwardSlash,
  removeLeadingForwardSlash,
  removeTrailingForwardSlash
} from "../../core/path.js";
import { runHookBuildGenerated } from "../../integrations/index.js";
import { BEFORE_HYDRATION_SCRIPT_ID, PAGE_SCRIPT_ID } from "../../vite-plugin-scripts/index.js";
import { call as callEndpoint, throwIfRedirectNotAllowed } from "../endpoint/index.js";
import { debug, info } from "../logger/core.js";
import { createEnvironment, createRenderContext, renderPage } from "../render/index.js";
import { callGetStaticPaths } from "../render/route-cache.js";
import { createLinkStylesheetElementSet, createModuleScriptsSet } from "../render/ssr-element.js";
import { createRequest } from "../request.js";
import { matchRoute } from "../routing/match.js";
import { getOutputFilename } from "../util.js";
import { getOutDirWithinCwd, getOutFile, getOutFolder } from "./common.js";
import {
  eachPageData,
  eachPrerenderedPageData,
  getPageDataByComponent,
  sortedCSS
} from "./internal.js";
import { getTimeStat } from "./util.js";
function shouldSkipDraft(pageModule, settings) {
  var _a;
  return !settings.config.markdown.drafts && "frontmatter" in pageModule && ((_a = pageModule.frontmatter) == null ? void 0 : _a.draft) === true;
}
function rootRelativeFacadeId(facadeId, settings) {
  return facadeId.slice(fileURLToPath(settings.config.root).length);
}
function chunkIsPage(settings, output, internals) {
  if (output.type !== "chunk") {
    return false;
  }
  const chunk = output;
  if (chunk.facadeModuleId) {
    const facadeToEntryId = prependForwardSlash(
      rootRelativeFacadeId(chunk.facadeModuleId, settings)
    );
    return internals.entrySpecifierToBundleMap.has(facadeToEntryId);
  }
  return false;
}
async function generatePages(opts, internals) {
  const timer = performance.now();
  const ssr = opts.settings.config.output === "server";
  const serverEntry = opts.buildConfig.serverEntry;
  const outFolder = ssr ? opts.buildConfig.server : getOutDirWithinCwd(opts.settings.config.outDir);
  if (opts.settings.config.experimental.prerender && opts.settings.config.output === "server" && !hasPrerenderedPages(internals))
    return;
  const verb = ssr ? "prerendering" : "generating";
  info(opts.logging, null, `
${bgGreen(black(` ${verb} static routes `))}`);
  const ssrEntryURL = new URL("./" + serverEntry + `?time=${Date.now()}`, outFolder);
  const ssrEntry = await import(ssrEntryURL.toString());
  const builtPaths = /* @__PURE__ */ new Set();
  if (opts.settings.config.experimental.prerender && opts.settings.config.output === "server") {
    for (const pageData of eachPrerenderedPageData(internals)) {
      await generatePage(opts, internals, pageData, ssrEntry, builtPaths);
    }
  } else {
    for (const pageData of eachPageData(internals)) {
      await generatePage(opts, internals, pageData, ssrEntry, builtPaths);
    }
  }
  await runHookBuildGenerated({
    config: opts.settings.config,
    buildConfig: opts.buildConfig,
    logging: opts.logging
  });
  info(opts.logging, null, dim(`Completed in ${getTimeStat(timer, performance.now())}.
`));
}
async function generatePage(opts, internals, pageData, ssrEntry, builtPaths) {
  var _a;
  let timeStart = performance.now();
  const renderers = ssrEntry.renderers;
  const pageInfo = getPageDataByComponent(internals, pageData.route.component);
  const linkIds = sortedCSS(pageData);
  const scripts = (pageInfo == null ? void 0 : pageInfo.hoistedScript) ?? null;
  const pageModule = (_a = ssrEntry.pageMap) == null ? void 0 : _a.get(pageData.component);
  if (!pageModule) {
    throw new Error(
      `Unable to find the module for ${pageData.component}. This is unexpected and likely a bug in Astro, please report.`
    );
  }
  if (shouldSkipDraft(pageModule, opts.settings)) {
    info(opts.logging, null, `${magenta("\u26A0\uFE0F")}  Skipping draft ${pageData.route.component}`);
    return;
  }
  const generationOptions = {
    pageData,
    internals,
    linkIds,
    scripts,
    mod: pageModule,
    renderers
  };
  const icon = pageData.route.type === "page" ? green("\u25B6") : magenta("\u03BB");
  info(opts.logging, null, `${icon} ${pageData.route.component}`);
  const paths = await getPathsForRoute(pageData, pageModule, opts, builtPaths);
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    await generatePath(path, opts, generationOptions);
    const timeEnd = performance.now();
    const timeChange = getTimeStat(timeStart, timeEnd);
    const timeIncrease = `(+${timeChange})`;
    const filePath = getOutputFilename(opts.settings.config, path, pageData.route.type);
    const lineIcon = i === paths.length - 1 ? "\u2514\u2500" : "\u251C\u2500";
    info(opts.logging, null, `  ${cyan(lineIcon)} ${dim(filePath)} ${dim(timeIncrease)}`);
  }
}
async function getPathsForRoute(pageData, mod, opts, builtPaths) {
  let paths = [];
  if (pageData.route.pathname) {
    paths.push(pageData.route.pathname);
    builtPaths.add(pageData.route.pathname);
  } else {
    const route = pageData.route;
    const result = await callGetStaticPaths({
      mod,
      route: pageData.route,
      isValidate: false,
      logging: opts.logging,
      ssr: false
    }).then((_result) => {
      const label = _result.staticPaths.length === 1 ? "page" : "pages";
      debug(
        "build",
        `\u251C\u2500\u2500 ${colors.bold(colors.green("\u2714"))} ${route.component} \u2192 ${colors.magenta(
          `[${_result.staticPaths.length} ${label}]`
        )}`
      );
      return _result;
    }).catch((err) => {
      debug("build", `\u251C\u2500\u2500 ${colors.bold(colors.red("\u2717"))} ${route.component}`);
      throw err;
    });
    opts.routeCache.set(route, result);
    paths = result.staticPaths.map((staticPath) => staticPath.params && route.generate(staticPath.params)).filter((staticPath) => {
      if (!builtPaths.has(removeTrailingForwardSlash(staticPath))) {
        return true;
      }
      const matchedRoute = matchRoute(staticPath, opts.manifest);
      return matchedRoute === route;
    });
    for (const staticPath of paths) {
      builtPaths.add(removeTrailingForwardSlash(staticPath));
    }
  }
  return paths;
}
function shouldAppendForwardSlash(trailingSlash, buildFormat) {
  switch (trailingSlash) {
    case "always":
      return true;
    case "never":
      return false;
    case "ignore": {
      switch (buildFormat) {
        case "directory":
          return true;
        case "file":
          return false;
      }
    }
  }
}
function addPageName(pathname, opts) {
  const trailingSlash = opts.settings.config.trailingSlash;
  const buildFormat = opts.settings.config.build.format;
  const pageName = shouldAppendForwardSlash(trailingSlash, buildFormat) ? pathname.replace(/\/?$/, "/").replace(/^\//, "") : pathname.replace(/^\//, "");
  opts.pageNames.push(pageName);
}
function getUrlForPath(pathname, base, origin, format, routeType) {
  const ending = format === "directory" ? "/" : ".html";
  let buildPathname;
  if (pathname === "/" || pathname === "") {
    buildPathname = base;
  } else if (routeType === "endpoint") {
    const buildPathRelative = removeLeadingForwardSlash(pathname);
    buildPathname = base + buildPathRelative;
  } else {
    const buildPathRelative = removeTrailingForwardSlash(removeLeadingForwardSlash(pathname)) + ending;
    buildPathname = base + buildPathRelative;
  }
  const url = new URL(buildPathname, origin);
  return url;
}
async function generatePath(pathname, opts, gopts) {
  const { settings, logging, origin, routeCache } = opts;
  const { mod, internals, linkIds, scripts: hoistedScripts, pageData, renderers } = gopts;
  if (pageData.route.type === "page") {
    addPageName(pathname, opts);
  }
  debug("build", `Generating: ${pathname}`);
  const links = createLinkStylesheetElementSet(linkIds, settings.config.base);
  const scripts = createModuleScriptsSet(
    hoistedScripts ? [hoistedScripts] : [],
    settings.config.base
  );
  if (settings.scripts.some((script) => script.stage === "page")) {
    const hashedFilePath = internals.entrySpecifierToBundleMap.get(PAGE_SCRIPT_ID);
    if (typeof hashedFilePath !== "string") {
      throw new Error(`Cannot find the built path for ${PAGE_SCRIPT_ID}`);
    }
    const src = prependForwardSlash(npath.posix.join(settings.config.base, hashedFilePath));
    scripts.add({
      props: { type: "module", src },
      children: ""
    });
  }
  for (const script of settings.scripts) {
    if (script.stage === "head-inline") {
      scripts.add({
        props: {},
        children: script.content
      });
    }
  }
  const ssr = settings.config.output === "server";
  const url = getUrlForPath(
    pathname,
    opts.settings.config.base,
    origin,
    opts.settings.config.build.format,
    pageData.route.type
  );
  const env = createEnvironment({
    adapterName: void 0,
    logging,
    markdown: {
      ...settings.config.markdown,
      isAstroFlavoredMd: settings.config.legacy.astroFlavoredMarkdown,
      isExperimentalContentCollections: settings.config.experimental.contentCollections,
      contentDir: getContentPaths(settings.config).contentDir
    },
    mode: opts.mode,
    renderers,
    async resolve(specifier) {
      const hashedFilePath = internals.entrySpecifierToBundleMap.get(specifier);
      if (typeof hashedFilePath !== "string") {
        if (specifier === BEFORE_HYDRATION_SCRIPT_ID) {
          return "";
        }
        throw new Error(`Cannot find the built path for ${specifier}`);
      }
      return prependForwardSlash(npath.posix.join(settings.config.base, hashedFilePath));
    },
    routeCache,
    site: settings.config.site ? new URL(settings.config.base, settings.config.site).toString() : settings.config.site,
    ssr,
    streaming: true
  });
  const ctx = createRenderContext({
    origin,
    pathname,
    request: createRequest({ url, headers: new Headers(), logging, ssr }),
    scripts,
    links,
    route: pageData.route
  });
  let body;
  let encoding;
  if (pageData.route.type === "endpoint") {
    const endpointHandler = mod;
    const result = await callEndpoint(endpointHandler, env, ctx);
    if (result.type === "response") {
      throwIfRedirectNotAllowed(result.response, opts.settings.config);
      if (!result.response.body)
        return;
      body = await result.response.text();
    } else {
      body = result.body;
      encoding = result.encoding;
    }
  } else {
    const response = await renderPage(mod, ctx, env);
    throwIfRedirectNotAllowed(response, opts.settings.config);
    if (!response.body)
      return;
    body = await response.text();
  }
  const outFolder = getOutFolder(settings.config, pathname, pageData.route.type);
  const outFile = getOutFile(settings.config, outFolder, pathname, pageData.route.type);
  pageData.route.distURL = outFile;
  await fs.promises.mkdir(outFolder, { recursive: true });
  await fs.promises.writeFile(outFile, body, encoding ?? "utf-8");
}
export {
  chunkIsPage,
  generatePages,
  rootRelativeFacadeId
};
