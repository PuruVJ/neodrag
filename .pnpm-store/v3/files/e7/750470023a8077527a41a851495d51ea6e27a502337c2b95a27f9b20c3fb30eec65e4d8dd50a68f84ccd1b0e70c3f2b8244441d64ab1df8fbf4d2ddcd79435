import { fileURLToPath } from "url";
import { PAGE_SCRIPT_ID } from "../../../vite-plugin-scripts/index.js";
import { enhanceViteSSRError } from "../../errors/dev/index.js";
import { AggregateError, CSSError, MarkdownError } from "../../errors/index.js";
import { isPage, resolveIdToUrl } from "../../util.js";
import { createRenderContext, renderPage as coreRenderPage } from "../index.js";
import { filterFoundRenderers, loadRenderer } from "../renderer.js";
import { getStylesForURL } from "./css.js";
import { getPropagationMap } from "./head.js";
import { getScriptsForURL } from "./scripts.js";
import { createDevelopmentEnvironment } from "./environment.js";
async function loadRenderers(moduleLoader, settings) {
  const loader = (entry) => moduleLoader.import(entry);
  const renderers = await Promise.all(settings.renderers.map((r) => loadRenderer(r, loader)));
  return filterFoundRenderers(renderers);
}
async function preload({
  env,
  filePath
}) {
  const renderers = await loadRenderers(env.loader, env.settings);
  try {
    const mod = await env.loader.import(fileURLToPath(filePath));
    return [renderers, mod];
  } catch (err) {
    if (MarkdownError.is(err) || CSSError.is(err) || AggregateError.is(err)) {
      throw err;
    }
    throw enhanceViteSSRError(err, filePath, env.loader);
  }
}
async function getScriptsAndStyles({ env, filePath }) {
  const scripts = await getScriptsForURL(filePath, env.loader);
  if (isPage(filePath, env.settings) && env.mode === "development") {
    scripts.add({
      props: { type: "module", src: "/@vite/client" },
      children: ""
    });
    scripts.add({
      props: {
        type: "module",
        src: await resolveIdToUrl(env.loader, "astro/runtime/client/hmr.js")
      },
      children: ""
    });
  }
  for (const script of env.settings.scripts) {
    if (script.stage === "head-inline") {
      scripts.add({
        props: {},
        children: script.content
      });
    } else if (script.stage === "page" && isPage(filePath, env.settings)) {
      scripts.add({
        props: { type: "module", src: `/@id/${PAGE_SCRIPT_ID}` },
        children: ""
      });
    }
  }
  const { urls: styleUrls, stylesMap } = await getStylesForURL(filePath, env.loader, env.mode);
  let links = /* @__PURE__ */ new Set();
  [...styleUrls].forEach((href) => {
    links.add({
      props: {
        rel: "stylesheet",
        href
      },
      children: ""
    });
  });
  let styles = /* @__PURE__ */ new Set();
  [...stylesMap].forEach(([url, content]) => {
    scripts.add({
      props: {
        type: "module",
        src: url
      },
      children: ""
    });
    styles.add({
      props: {},
      children: content
    });
  });
  const propagationMap = await getPropagationMap(filePath, env.loader);
  return { scripts, styles, links, propagationMap };
}
async function renderPage(options) {
  const [renderers, mod] = options.preload;
  options.env.renderers = renderers;
  const { scripts, links, styles, propagationMap } = await getScriptsAndStyles({
    env: options.env,
    filePath: options.filePath
  });
  const ctx = createRenderContext({
    request: options.request,
    origin: options.origin,
    pathname: options.pathname,
    scripts,
    links,
    styles,
    propagation: propagationMap,
    route: options.route
  });
  return await coreRenderPage(mod, ctx, options.env);
}
export {
  createDevelopmentEnvironment,
  loadRenderers,
  preload,
  renderPage
};
