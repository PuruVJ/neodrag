import { info } from "../logger/core.js";
import * as colors from "kleur/colors";
import { debug } from "../logger/core.js";
async function collectPagesData(opts) {
  const { settings, manifest } = opts;
  const assets = {};
  const allPages = {};
  const builtPaths = /* @__PURE__ */ new Set();
  const dataCollectionLogTimeout = setInterval(() => {
    info(opts.logging, "build", "The data collection step may take longer for larger projects...");
    clearInterval(dataCollectionLogTimeout);
  }, 3e4);
  for (const route of manifest.routes) {
    if (route.pathname) {
      const routeCollectionLogTimeout = setInterval(() => {
        info(
          opts.logging,
          "build",
          `${colors.bold(
            route.component
          )} is taking a bit longer to import. This is common for larger "Astro.glob(...)" or "import.meta.glob(...)" calls, for instance. Hang tight!`
        );
        clearInterval(routeCollectionLogTimeout);
      }, 1e4);
      builtPaths.add(route.pathname);
      allPages[route.component] = {
        component: route.component,
        route,
        moduleSpecifier: "",
        css: /* @__PURE__ */ new Map(),
        contentCollectionCss: /* @__PURE__ */ new Map(),
        hoistedScript: void 0
      };
      clearInterval(routeCollectionLogTimeout);
      if (settings.config.output === "static") {
        const html = `${route.pathname}`.replace(/\/?$/, "/index.html");
        debug(
          "build",
          `\u251C\u2500\u2500 ${colors.bold(colors.green("\u2714"))} ${route.component} \u2192 ${colors.yellow(html)}`
        );
      } else {
        debug("build", `\u251C\u2500\u2500 ${colors.bold(colors.green("\u2714"))} ${route.component}`);
      }
      continue;
    }
    allPages[route.component] = {
      component: route.component,
      route,
      moduleSpecifier: "",
      css: /* @__PURE__ */ new Map(),
      contentCollectionCss: /* @__PURE__ */ new Map(),
      hoistedScript: void 0
    };
  }
  clearInterval(dataCollectionLogTimeout);
  return { assets, allPages };
}
export {
  collectPagesData
};
