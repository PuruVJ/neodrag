import { collectErrorMetadata } from "../core/errors/dev/index.js";
import { createSafeError } from "../core/errors/index.js";
import { error } from "../core/logger/core.js";
import * as msg from "../core/messages.js";
import { removeTrailingForwardSlash } from "../core/path.js";
import { runWithErrorHandling } from "./controller.js";
import { handle500Response } from "./response.js";
import { handleRoute, matchRoute } from "./route.js";
async function handleRequest(env, manifest, controller, req, res) {
  const { settings, loader: moduleLoader } = env;
  const { config } = settings;
  const origin = `${moduleLoader.isHttps() ? "https" : "http"}://${req.headers.host}`;
  const buildingToSSR = config.output === "server";
  const url = new URL(origin + req.url);
  let pathname;
  if (config.trailingSlash === "never" && !req.url) {
    pathname = "";
  } else {
    pathname = decodeURI(url.pathname);
  }
  url.pathname = removeTrailingForwardSlash(config.base) + url.pathname;
  if (!buildingToSSR && pathname !== "/_image") {
    const allSearchParams = Array.from(url.searchParams);
    for (const [key] of allSearchParams) {
      url.searchParams.delete(key);
    }
  }
  let body = void 0;
  if (!(req.method === "GET" || req.method === "HEAD")) {
    let bytes = [];
    await new Promise((resolve) => {
      req.on("data", (part) => {
        bytes.push(part);
      });
      req.on("end", resolve);
    });
    body = Buffer.concat(bytes);
  }
  await runWithErrorHandling({
    controller,
    pathname,
    async run() {
      const matchedRoute = await matchRoute(pathname, env, manifest);
      const resolvedPathname = (matchedRoute == null ? void 0 : matchedRoute.resolvedPathname) ?? pathname;
      return await handleRoute(
        matchedRoute,
        url,
        resolvedPathname,
        body,
        origin,
        env,
        manifest,
        req,
        res
      );
    },
    onError(_err) {
      const err = createSafeError(_err);
      const errorWithMetadata = collectErrorMetadata(err, config.root);
      error(env.logging, null, msg.formatErrorMessage(errorWithMetadata));
      handle500Response(moduleLoader, res, errorWithMetadata);
      return err;
    }
  });
}
export {
  handleRequest
};
