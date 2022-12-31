import { escape } from "html-escaper";
import { bold, underline } from "kleur/colors";
import * as fs from "node:fs";
import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import stripAnsi from "strip-ansi";
import { AggregateError } from "../errors.js";
import { codeFrame } from "../printer.js";
import { normalizeLF } from "../utils.js";
const incompatiblePackages = {
  "react-spectrum": `@adobe/react-spectrum is not compatible with Vite's server-side rendering mode at the moment. You can still use React Spectrum from the client. Create an island React component and use the client:only directive. From there you can use React Spectrum.`
};
const incompatPackageExp = new RegExp(`(${Object.keys(incompatiblePackages).join("|")})`);
function collectErrorMetadata(e, rootFolder) {
  const err = AggregateError.is(e) || Array.isArray(e.errors) ? e.errors : [e];
  err.forEach((error) => {
    var _a;
    if (error.stack) {
      error = collectInfoFromStacktrace(e);
    }
    if (((_a = error.loc) == null ? void 0 : _a.file) && rootFolder && (!error.loc.file.startsWith(rootFolder.pathname) || !isAbsolute(error.loc.file))) {
      error.loc.file = join(fileURLToPath(rootFolder), error.loc.file);
    }
    if (error.loc && (!error.frame || !error.fullCode)) {
      try {
        const fileContents = fs.readFileSync(error.loc.file, "utf8");
        if (!error.frame) {
          const frame = codeFrame(fileContents, error.loc);
          error.frame = frame;
        }
        if (!error.fullCode) {
          error.fullCode = fileContents;
        }
      } catch {
      }
    }
    error.hint = generateHint(e);
  });
  if (!AggregateError.is(e) && Array.isArray(e.errors)) {
    e.errors.forEach((buildError, i) => {
      var _a;
      const { location, pluginName, text } = buildError;
      if (text) {
        err[i].message = text;
      }
      if (location) {
        err[i].loc = { file: location.file, line: location.line, column: location.column };
        err[i].id = err[0].id || (location == null ? void 0 : location.file);
      }
      if (err[i].frame) {
        const errorLines = (_a = err[i].frame) == null ? void 0 : _a.trim().split("\n");
        if (errorLines) {
          err[i].frame = !/^\d/.test(errorLines[0]) ? errorLines == null ? void 0 : errorLines.slice(1).join("\n") : err[i].frame;
        }
      }
      const possibleFilePath = (location == null ? void 0 : location.file) ?? err[i].id;
      if (possibleFilePath && err[i].loc && (!err[i].frame || !err[i].fullCode)) {
        try {
          const fileContents = fs.readFileSync(possibleFilePath, "utf8");
          if (!err[i].frame) {
            err[i].frame = codeFrame(fileContents, { ...err[i].loc, file: possibleFilePath });
          }
          err[i].fullCode = fileContents;
        } catch {
          err[i].fullCode = err[i].pluginCode;
        }
      }
      if (pluginName) {
        err[i].plugin = pluginName;
      }
      err[i].hint = generateHint(err[0]);
    });
  }
  return err[0];
}
function generateHint(err) {
  var _a, _b;
  const commonBrowserAPIs = ["document", "window"];
  if (/Unknown file extension \"\.(jsx|vue|svelte|astro|css)\" for /.test(err.message)) {
    return "You likely need to add this package to `vite.ssr.noExternal` in your astro config file.";
  } else if (commonBrowserAPIs.some((api) => err.toString().includes(api))) {
    const hint = `Browser APIs are not available on the server.

${((_b = (_a = err.loc) == null ? void 0 : _a.file) == null ? void 0 : _b.endsWith(".astro")) ? "Move your code to a <script> tag outside of the frontmatter, so the code runs on the client." : "If the code is in a framework component, try to access these objects after rendering using lifecycle methods or use a `client:only` directive to make the component exclusively run on the client."}

See https://docs.astro.build/en/guides/troubleshooting/#document-or-window-is-not-defined for more information.
		`;
    return hint;
  } else {
    const res = incompatPackageExp.exec(err.stack);
    if (res) {
      const key = res[0];
      return incompatiblePackages[key];
    }
  }
  return err.hint;
}
function collectInfoFromStacktrace(error) {
  var _a, _b, _c;
  if (!error.stack)
    return error;
  error.stack = normalizeLF(error.stack);
  const stackText = stripAnsi(error.stack);
  if (!error.loc || !error.loc.column && !error.loc.line) {
    const possibleFilePath = ((_a = error.loc) == null ? void 0 : _a.file) || error.pluginCode || error.id || stackText.split("\n").find((ln) => ln.includes("src") || ln.includes("node_modules"));
    const source = possibleFilePath == null ? void 0 : possibleFilePath.replace(/^[^(]+\(([^)]+).*$/, "$1").replace(/^\s+at\s+/, "");
    let file = source == null ? void 0 : source.replace(/(:[0-9]+)/g, "");
    const location = /:([0-9]+):([0-9]+)/g.exec(source) ?? [];
    const line = location[1];
    const column = location[2];
    if (file && line && column) {
      try {
        file = fileURLToPath(file);
      } catch {
      }
      error.loc = {
        file,
        line: Number.parseInt(line),
        column: Number.parseInt(column)
      };
    }
  }
  if (!error.plugin) {
    error.plugin = ((_b = /withastro\/astro\/packages\/integrations\/([\w-]+)/gim.exec(stackText)) == null ? void 0 : _b.at(1)) || ((_c = /(@astrojs\/[\w-]+)\/(server|client|index)/gim.exec(stackText)) == null ? void 0 : _c.at(1)) || void 0;
  }
  error.stack = cleanErrorStack(error.stack);
  return error;
}
function cleanErrorStack(stack) {
  return stack.split(/\n/g).map((l) => l.replace(/\/@fs\//g, "/")).join("\n");
}
function renderErrorMarkdown(markdown, target) {
  const linkRegex = /\[(.+)\]\((.+)\)/gm;
  const boldRegex = /\*\*(.+)\*\*/gm;
  const urlRegex = / (\b(https?|ftp):\/\/[-A-Z0-9+&@#\\/%?=~_|!:,.;]*[-A-Z0-9+&@#\\/%=~_|]) /gim;
  const codeRegex = /`([^`]+)`/gim;
  if (target === "html") {
    return escape(markdown).replace(linkRegex, `<a href="$2" target="_blank">$1</a>`).replace(boldRegex, "<b>$1</b>").replace(urlRegex, ' <a href="$1" target="_blank">$1</a> ').replace(codeRegex, "<code>$1</code>");
  } else {
    return markdown.replace(linkRegex, (fullMatch, m1, m2) => `${bold(m1)} ${underline(m2)}`).replace(urlRegex, (fullMatch, m1) => ` ${underline(fullMatch.trim())} `).replace(boldRegex, (fullMatch, m1) => `${bold(m1)}`);
  }
}
export {
  collectErrorMetadata,
  incompatPackageExp,
  incompatiblePackages,
  renderErrorMarkdown
};
