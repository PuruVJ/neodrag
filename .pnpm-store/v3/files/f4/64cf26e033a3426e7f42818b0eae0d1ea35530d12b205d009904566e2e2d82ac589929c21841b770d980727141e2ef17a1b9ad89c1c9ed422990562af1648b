import require$$0 from 'tty';
import url from 'node:url';
import g from 'path';

var picocolors = {exports: {}};

let tty = require$$0;

let isColorSupported =
	!("NO_COLOR" in process.env || process.argv.includes("--no-color")) &&
	("FORCE_COLOR" in process.env ||
		process.argv.includes("--color") ||
		process.platform === "win32" ||
		(tty.isatty(1) && process.env.TERM !== "dumb") ||
		"CI" in process.env);

let formatter =
	(open, close, replace = open) =>
	input => {
		let string = "" + input;
		let index = string.indexOf(close, open.length);
		return ~index
			? open + replaceClose(string, close, replace, index) + close
			: open + string + close
	};

let replaceClose = (string, close, replace, index) => {
	let start = string.substring(0, index) + replace;
	let end = string.substring(index + close.length);
	let nextIndex = end.indexOf(close);
	return ~nextIndex ? start + replaceClose(end, close, replace, nextIndex) : start + end
};

let createColors = (enabled = isColorSupported) => ({
	isColorSupported: enabled,
	reset: enabled ? s => `\x1b[0m${s}\x1b[0m` : String,
	bold: enabled ? formatter("\x1b[1m", "\x1b[22m", "\x1b[22m\x1b[1m") : String,
	dim: enabled ? formatter("\x1b[2m", "\x1b[22m", "\x1b[22m\x1b[2m") : String,
	italic: enabled ? formatter("\x1b[3m", "\x1b[23m") : String,
	underline: enabled ? formatter("\x1b[4m", "\x1b[24m") : String,
	inverse: enabled ? formatter("\x1b[7m", "\x1b[27m") : String,
	hidden: enabled ? formatter("\x1b[8m", "\x1b[28m") : String,
	strikethrough: enabled ? formatter("\x1b[9m", "\x1b[29m") : String,
	black: enabled ? formatter("\x1b[30m", "\x1b[39m") : String,
	red: enabled ? formatter("\x1b[31m", "\x1b[39m") : String,
	green: enabled ? formatter("\x1b[32m", "\x1b[39m") : String,
	yellow: enabled ? formatter("\x1b[33m", "\x1b[39m") : String,
	blue: enabled ? formatter("\x1b[34m", "\x1b[39m") : String,
	magenta: enabled ? formatter("\x1b[35m", "\x1b[39m") : String,
	cyan: enabled ? formatter("\x1b[36m", "\x1b[39m") : String,
	white: enabled ? formatter("\x1b[37m", "\x1b[39m") : String,
	gray: enabled ? formatter("\x1b[90m", "\x1b[39m") : String,
	bgBlack: enabled ? formatter("\x1b[40m", "\x1b[49m") : String,
	bgRed: enabled ? formatter("\x1b[41m", "\x1b[49m") : String,
	bgGreen: enabled ? formatter("\x1b[42m", "\x1b[49m") : String,
	bgYellow: enabled ? formatter("\x1b[43m", "\x1b[49m") : String,
	bgBlue: enabled ? formatter("\x1b[44m", "\x1b[49m") : String,
	bgMagenta: enabled ? formatter("\x1b[45m", "\x1b[49m") : String,
	bgCyan: enabled ? formatter("\x1b[46m", "\x1b[49m") : String,
	bgWhite: enabled ? formatter("\x1b[47m", "\x1b[49m") : String,
});

picocolors.exports = createColors();
picocolors.exports.createColors = createColors;

function normalizeWindowsPath(input = "") {
  if (!input.includes("\\")) {
    return input;
  }
  return input.replace(/\\/g, "/");
}

const _UNC_REGEX = /^[/][/]/;
const _UNC_DRIVE_REGEX = /^[/][/]([.]{1,2}[/])?([a-zA-Z]):[/]/;
const _IS_ABSOLUTE_RE = /^\/|^\\|^[a-zA-Z]:[/\\]/;
const sep = "/";
const delimiter = ":";
const normalize = function(path2) {
  if (path2.length === 0) {
    return ".";
  }
  path2 = normalizeWindowsPath(path2);
  const isUNCPath = path2.match(_UNC_REGEX);
  const hasUNCDrive = isUNCPath && path2.match(_UNC_DRIVE_REGEX);
  const isPathAbsolute = isAbsolute(path2);
  const trailingSeparator = path2[path2.length - 1] === "/";
  path2 = normalizeString(path2, !isPathAbsolute);
  if (path2.length === 0) {
    if (isPathAbsolute) {
      return "/";
    }
    return trailingSeparator ? "./" : ".";
  }
  if (trailingSeparator) {
    path2 += "/";
  }
  if (isUNCPath) {
    if (hasUNCDrive) {
      return `//./${path2}`;
    }
    return `//${path2}`;
  }
  return isPathAbsolute && !isAbsolute(path2) ? `/${path2}` : path2;
};
const join = function(...args) {
  if (args.length === 0) {
    return ".";
  }
  let joined;
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i];
    if (arg.length > 0) {
      if (joined === void 0) {
        joined = arg;
      } else {
        joined += `/${arg}`;
      }
    }
  }
  if (joined === void 0) {
    return ".";
  }
  return normalize(joined);
};
const resolve = function(...args) {
  args = args.map((arg) => normalizeWindowsPath(arg));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path2 = i >= 0 ? args[i] : process.cwd();
    if (path2.length === 0) {
      continue;
    }
    resolvedPath = `${path2}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path2);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path2, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let i = 0; i <= path2.length; ++i) {
    if (i < path2.length) {
      char = path2[i];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === i - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length !== 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path2.slice(lastSlash + 1, i)}`;
        } else {
          res = path2.slice(lastSlash + 1, i);
        }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const toNamespacedPath = function(p) {
  return normalizeWindowsPath(p);
};
const extname = function(p) {
  return g.posix.extname(normalizeWindowsPath(p));
};
const relative = function(from, to) {
  return g.posix.relative(normalizeWindowsPath(from), normalizeWindowsPath(to));
};
const dirname = function(p) {
  return g.posix.dirname(normalizeWindowsPath(p));
};
const format = function(p) {
  return normalizeWindowsPath(g.posix.format(p));
};
const basename = function(p, ext) {
  return g.posix.basename(normalizeWindowsPath(p), ext);
};
const parse = function(p) {
  return g.posix.parse(normalizeWindowsPath(p));
};

const _path = /*#__PURE__*/Object.freeze({
  __proto__: null,
  sep: sep,
  delimiter: delimiter,
  normalize: normalize,
  join: join,
  resolve: resolve,
  normalizeString: normalizeString,
  isAbsolute: isAbsolute,
  toNamespacedPath: toNamespacedPath,
  extname: extname,
  relative: relative,
  dirname: dirname,
  format: format,
  basename: basename,
  parse: parse
});

({
  ..._path
});

var _a;
const isNode = typeof process < "u" && typeof process.stdout < "u" && !((_a = process.versions) == null ? void 0 : _a.deno) && !globalThis.window;
const isBrowser = typeof window !== "undefined";

const rootDir = isNode ? resolve(url.fileURLToPath(import.meta.url), "../../") : import.meta.url;
const distDir = isNode ? resolve(url.fileURLToPath(import.meta.url), "../../dist") : import.meta.url;
const defaultPort = 51204;
const EXIT_CODE_RESTART = 43;
const API_PATH = "/__vitest_api__";
const configFiles = [
  "vitest.config.ts",
  "vitest.config.mts",
  "vitest.config.cts",
  "vitest.config.js",
  "vitest.config.mjs",
  "vitest.config.cjs",
  "vite.config.ts",
  "vite.config.mts",
  "vite.config.cts",
  "vite.config.js",
  "vite.config.mjs",
  "vite.config.cjs"
];
const globalApis = [
  "suite",
  "test",
  "describe",
  "it",
  "chai",
  "expect",
  "assert",
  "expectTypeOf",
  "assertType",
  "vitest",
  "vi",
  "beforeAll",
  "afterAll",
  "beforeEach",
  "afterEach"
];

export { API_PATH as A, EXIT_CODE_RESTART as E, isBrowser as a, resolve as b, basename as c, dirname as d, distDir as e, rootDir as f, isAbsolute as g, configFiles as h, isNode as i, join as j, defaultPort as k, extname as l, globalApis as m, normalize as n, picocolors as p, relative as r, toNamespacedPath as t };
