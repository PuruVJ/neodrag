import mime from "mime";
import { attachToResponse } from "../core/cookies/index.js";
import { call as callEndpoint } from "../core/endpoint/dev/index.js";
import { throwIfRedirectNotAllowed } from "../core/endpoint/index.js";
import { AstroErrorData } from "../core/errors/index.js";
import { warn } from "../core/logger/core.js";
import { appendForwardSlash } from "../core/path.js";
import { preload, renderPage } from "../core/render/dev/index.js";
import { getParamsAndProps, GetParamsAndPropsError } from "../core/render/index.js";
import { createRequest } from "../core/request.js";
import { matchAllRoutes } from "../core/routing/index.js";
import { resolvePages } from "../core/util.js";
import { log404 } from "./common.js";
import { handle404Response, writeSSRResult, writeWebResponse } from "./response.js";
function getCustom404Route({ config }, manifest) {
  const relPages = resolvePages(config).href.replace(config.root.href, "");
  const pattern = new RegExp(`${appendForwardSlash(relPages)}404.(astro|md)`);
  return manifest.routes.find((r) => r.component.match(pattern));
}
async function matchRoute(pathname, env, manifest) {
  const { logging, settings, routeCache } = env;
  const matches = matchAllRoutes(pathname, manifest);
  for await (const maybeRoute of matches) {
    const filePath = new URL(`./${maybeRoute.component}`, settings.config.root);
    const preloadedComponent = await preload({ env, filePath });
    const [, mod] = preloadedComponent;
    const paramsAndPropsRes = await getParamsAndProps({
      mod,
      route: maybeRoute,
      routeCache,
      pathname,
      logging,
      ssr: settings.config.output === "server"
    });
    if (paramsAndPropsRes !== GetParamsAndPropsError.NoMatchingStaticPath) {
      return {
        route: maybeRoute,
        filePath,
        resolvedPathname: pathname,
        preloadedComponent,
        mod
      };
    }
  }
  const altPathname = pathname.replace(/(index)?\.html$/, "");
  if (altPathname !== pathname) {
    return await matchRoute(altPathname, env, manifest);
  }
  if (matches.length) {
    const possibleRoutes = matches.flatMap((route) => route.component);
    warn(
      logging,
      "getStaticPaths",
      `${AstroErrorData.NoMatchingStaticPathFound.message(
        pathname
      )}

${AstroErrorData.NoMatchingStaticPathFound.hint(possibleRoutes)}`
    );
  }
  log404(logging, pathname);
  const custom404 = getCustom404Route(settings, manifest);
  if (custom404) {
    const filePath = new URL(`./${custom404.component}`, settings.config.root);
    const preloadedComponent = await preload({ env, filePath });
    const [, mod] = preloadedComponent;
    return {
      route: custom404,
      filePath,
      resolvedPathname: pathname,
      preloadedComponent,
      mod
    };
  }
  return void 0;
}
async function handleRoute(matchedRoute, url, pathname, body, origin, env, manifest, req, res) {
  const { logging, settings } = env;
  if (!matchedRoute) {
    return handle404Response(origin, req, res);
  }
  const { config } = settings;
  const filePath = matchedRoute.filePath;
  const { route, preloadedComponent, mod } = matchedRoute;
  const buildingToSSR = config.output === "server";
  const request = createRequest({
    url,
    headers: buildingToSSR ? req.headers : new Headers(),
    method: req.method,
    body,
    logging,
    ssr: buildingToSSR,
    clientAddress: buildingToSSR ? req.socket.remoteAddress : void 0
  });
  for (const [name, value] of Object.entries(config.server.headers ?? {})) {
    if (value)
      res.setHeader(name, value);
  }
  const paramsAndPropsRes = await getParamsAndProps({
    mod,
    route,
    routeCache: env.routeCache,
    pathname,
    logging,
    ssr: config.output === "server"
  });
  const options = {
    env,
    filePath,
    origin,
    preload: preloadedComponent,
    pathname,
    request,
    route
  };
  if (route.type === "endpoint") {
    const result = await callEndpoint(options);
    if (result.type === "response") {
      if (result.response.headers.get("X-Astro-Response") === "Not-Found") {
        const fourOhFourRoute = await matchRoute("/404", env, manifest);
        return handleRoute(
          fourOhFourRoute,
          new URL("/404", url),
          "/404",
          body,
          origin,
          env,
          manifest,
          req,
          res
        );
      }
      throwIfRedirectNotAllowed(result.response, config);
      await writeWebResponse(res, result.response);
    } else {
      let contentType = "text/plain";
      const filepath = route.pathname || route.segments.map((segment) => segment.map((p) => p.content).join("")).join("/");
      const computedMimeType = mime.getType(filepath);
      if (computedMimeType) {
        contentType = computedMimeType;
      }
      const response = new Response(result.body, {
        status: 200,
        headers: {
          "Content-Type": `${contentType};charset=utf-8`
        }
      });
      attachToResponse(response, result.cookies);
      await writeWebResponse(res, response);
    }
  } else {
    const result = await renderPage(options);
    throwIfRedirectNotAllowed(result, config);
    return await writeSSRResult(result, res);
  }
}
export {
  handleRoute,
  matchRoute
};
