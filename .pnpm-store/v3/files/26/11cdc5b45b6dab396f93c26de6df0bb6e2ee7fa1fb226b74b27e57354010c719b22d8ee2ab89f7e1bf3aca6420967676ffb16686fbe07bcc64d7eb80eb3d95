import * as fs from "fs";
import { getHighlighter } from "shiki";
import { fileURLToPath } from "url";
import { createLogger } from "vite";
import { AstroErrorData } from "../errors-data.js";
import { createSafeError } from "../utils.js";
import { incompatPackageExp, renderErrorMarkdown } from "./utils.js";
function createCustomViteLogger(logLevel) {
  const viteLogger = createLogger(logLevel);
  const logger = {
    ...viteLogger,
    error(msg, options) {
      if (incompatPackageExp.test(msg))
        return;
      return viteLogger.error(msg, options);
    }
  };
  return logger;
}
function enhanceViteSSRError(error, filePath, loader) {
  var _a, _b, _c, _d;
  const safeError = createSafeError(error);
  if (loader) {
    try {
      loader.fixStacktrace(safeError);
    } catch {
    }
  }
  if (filePath) {
    const path = fileURLToPath(filePath);
    const content = fs.readFileSync(path).toString();
    const lns = content.split("\n");
    if (/failed to load module for ssr:/.test(safeError.message)) {
      const importName = (_a = safeError.message.split("for ssr:").at(1)) == null ? void 0 : _a.trim();
      if (importName) {
        safeError.title = AstroErrorData.FailedToLoadModuleSSR.title;
        safeError.name = "FailedToLoadModuleSSR";
        safeError.message = AstroErrorData.FailedToLoadModuleSSR.message(importName);
        safeError.hint = AstroErrorData.FailedToLoadModuleSSR.hint;
        safeError.code = AstroErrorData.FailedToLoadModuleSSR.code;
        const line = lns.findIndex((ln) => ln.includes(importName));
        if (line !== -1) {
          const column = (_b = lns[line]) == null ? void 0 : _b.indexOf(importName);
          safeError.loc = {
            file: path,
            line: line + 1,
            column
          };
        }
      }
    }
    if (/Invalid glob/.test(safeError.message)) {
      const globPattern = (_c = safeError.message.match(/glob: "(.+)" \(/)) == null ? void 0 : _c[1];
      if (globPattern) {
        safeError.message = AstroErrorData.InvalidGlob.message(globPattern);
        safeError.name = "InvalidGlob";
        safeError.hint = AstroErrorData.InvalidGlob.hint;
        safeError.code = AstroErrorData.InvalidGlob.code;
        safeError.title = AstroErrorData.InvalidGlob.title;
        const line = lns.findIndex((ln) => ln.includes(globPattern));
        if (line !== -1) {
          const column = (_d = lns[line]) == null ? void 0 : _d.indexOf(globPattern);
          safeError.loc = {
            file: path,
            line: line + 1,
            column
          };
        }
      }
    }
  }
  return safeError;
}
async function getViteErrorPayload(err) {
  var _a, _b, _c, _d, _e, _f;
  let plugin = err.plugin;
  if (!plugin && err.hint) {
    plugin = "astro";
  }
  const message = renderErrorMarkdown(err.message.trim(), "html");
  const hint = err.hint ? renderErrorMarkdown(err.hint.trim(), "html") : void 0;
  const hasDocs = err.type && err.name && [
    "AstroError",
    "AggregateError",
    "CSSError",
    "MarkdownError"
  ] || ["FailedToLoadModuleSSR", "InvalidGlob"].includes(err.name);
  const docslink = hasDocs ? `https://docs.astro.build/en/reference/errors/${getKebabErrorName(err.name)}/` : void 0;
  const highlighter = await getHighlighter({ theme: "css-variables" });
  const highlightedCode = err.fullCode ? highlighter.codeToHtml(err.fullCode, {
    lang: (_b = (_a = err.loc) == null ? void 0 : _a.file) == null ? void 0 : _b.split(".").pop(),
    lineOptions: ((_c = err.loc) == null ? void 0 : _c.line) ? [{ line: err.loc.line, classes: ["error-line"] }] : void 0
  }) : void 0;
  return {
    type: "error",
    err: {
      ...err,
      name: err.name,
      type: err.type,
      message,
      hint,
      frame: err.frame,
      highlightedCode,
      docslink,
      loc: {
        file: (_d = err.loc) == null ? void 0 : _d.file,
        line: (_e = err.loc) == null ? void 0 : _e.line,
        column: (_f = err.loc) == null ? void 0 : _f.column
      },
      plugin,
      stack: err.stack
    }
  };
  function getKebabErrorName(errorName) {
    return errorName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }
}
export {
  createCustomViteLogger,
  enhanceViteSSRError,
  getViteErrorPayload
};
