import fs from "fs";
import http from "http";
import { performance } from "perf_hooks";
import sirv from "sirv";
import { fileURLToPath } from "url";
import { notFoundTemplate, subpathNotUsedTemplate } from "../../template/4xx.js";
import { error, info } from "../logger/core.js";
import * as msg from "../messages.js";
const HAS_FILE_EXTENSION_REGEXP = /^.*\.[^\\]+$/;
async function createStaticPreviewServer(settings, {
  logging,
  host,
  port,
  headers
}) {
  const startServerTime = performance.now();
  const defaultOrigin = "http://localhost";
  const trailingSlash = settings.config.trailingSlash;
  let baseURL = new URL(settings.config.base, new URL(settings.config.site || "/", defaultOrigin));
  const staticFileServer = sirv(fileURLToPath(settings.config.outDir), {
    dev: true,
    etag: true,
    maxAge: 0,
    setHeaders: (res, pathname, stats) => {
      for (const [name, value] of Object.entries(headers ?? {})) {
        if (value)
          res.setHeader(name, value);
      }
    }
  });
  const server = http.createServer((req, res) => {
    var _a;
    const requestURL = new URL(req.url, defaultOrigin);
    if (!requestURL.pathname.startsWith(baseURL.pathname)) {
      res.statusCode = 404;
      res.end(subpathNotUsedTemplate(baseURL.pathname, requestURL.pathname));
      return;
    }
    const pathname = requestURL.pathname.slice(baseURL.pathname.length - 1);
    const isRoot = pathname === "/";
    const hasTrailingSlash = isRoot || pathname.endsWith("/");
    function sendError(message) {
      res.statusCode = 404;
      res.end(notFoundTemplate(pathname, message));
    }
    switch (true) {
      case (hasTrailingSlash && trailingSlash == "never" && !isRoot):
        sendError('Not Found (trailingSlash is set to "never")');
        return;
      case (!hasTrailingSlash && trailingSlash == "always" && !isRoot && !HAS_FILE_EXTENSION_REGEXP.test(pathname)):
        sendError('Not Found (trailingSlash is set to "always")');
        return;
      default: {
        req.url = "/" + ((_a = req.url) == null ? void 0 : _a.replace(baseURL.pathname, ""));
        staticFileServer(req, res, () => {
          const errorPagePath = fileURLToPath(settings.config.outDir + "/404.html");
          if (fs.existsSync(errorPagePath)) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/html;charset=utf-8");
            res.end(fs.readFileSync(errorPagePath));
          } else {
            staticFileServer(req, res, () => {
              sendError("Not Found");
            });
          }
        });
        return;
      }
    }
  });
  let httpServer;
  function startServer(timerStart) {
    let showedPortTakenMsg = false;
    let showedListenMsg = false;
    return new Promise((resolve, reject) => {
      const listen = () => {
        httpServer = server.listen(port, host, async () => {
          if (!showedListenMsg) {
            const resolvedUrls = msg.resolveServerUrls({
              address: server.address(),
              host: settings.config.server.host,
              https: false
            });
            info(
              logging,
              null,
              msg.serverStart({
                startupTime: performance.now() - timerStart,
                resolvedUrls,
                host: settings.config.server.host,
                site: baseURL
              })
            );
          }
          showedListenMsg = true;
          resolve();
        });
        httpServer == null ? void 0 : httpServer.on("error", onError);
      };
      const onError = (err) => {
        if (err.code && err.code === "EADDRINUSE") {
          if (!showedPortTakenMsg) {
            info(logging, "astro", msg.portInUse({ port }));
            showedPortTakenMsg = true;
          }
          port++;
          return listen();
        } else {
          error(logging, "astro", err.stack || err.message);
          httpServer == null ? void 0 : httpServer.removeListener("error", onError);
          reject(err);
        }
      };
      listen();
    });
  }
  await startServer(startServerTime);
  function closed() {
    return new Promise((resolve, reject) => {
      httpServer.addListener("close", resolve);
      httpServer.addListener("error", reject);
    });
  }
  return {
    host,
    port,
    closed,
    server: httpServer,
    stop: async () => {
      await new Promise((resolve, reject) => {
        httpServer.close((err) => err ? reject(err) : resolve(void 0));
      });
    }
  };
}
export {
  createStaticPreviewServer as default
};
