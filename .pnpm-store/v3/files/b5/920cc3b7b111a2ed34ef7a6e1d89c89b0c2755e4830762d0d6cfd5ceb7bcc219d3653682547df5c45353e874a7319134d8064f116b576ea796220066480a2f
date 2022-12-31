import 'acorn';
import { builtinModules } from 'node:module';
import 'node:fs';
import { pathToFileURL } from 'node:url';
import 'url';
import 'fs';
import 'path';
import 'module';
import assert from 'assert';
import { format, inspect } from 'util';
import 'node:path';

const BUILTIN_MODULES = new Set(builtinModules);

const isWindows = process.platform === "win32";
const own$1 = {}.hasOwnProperty;
const messages = /* @__PURE__ */ new Map();
const nodeInternalPrefix = "__node_internal_";
let userStackTraceLimit;
createError(
  "ERR_INVALID_MODULE_SPECIFIER",
  (request, reason, base = void 0) => {
    return `Invalid module "${request}" ${reason}${base ? ` imported from ${base}` : ""}`;
  },
  TypeError
);
createError(
  "ERR_INVALID_PACKAGE_CONFIG",
  (path, base, message) => {
    return `Invalid package config ${path}${base ? ` while importing ${base}` : ""}${message ? `. ${message}` : ""}`;
  },
  Error
);
createError(
  "ERR_INVALID_PACKAGE_TARGET",
  (pkgPath, key, target, isImport = false, base = void 0) => {
    const relError = typeof target === "string" && !isImport && target.length > 0 && !target.startsWith("./");
    if (key === ".") {
      assert(isImport === false);
      return `Invalid "exports" main target ${JSON.stringify(target)} defined in the package config ${pkgPath}package.json${base ? ` imported from ${base}` : ""}${relError ? '; targets must start with "./"' : ""}`;
    }
    return `Invalid "${isImport ? "imports" : "exports"}" target ${JSON.stringify(
      target
    )} defined for '${key}' in the package config ${pkgPath}package.json${base ? ` imported from ${base}` : ""}${relError ? '; targets must start with "./"' : ""}`;
  },
  Error
);
createError(
  "ERR_MODULE_NOT_FOUND",
  (path, base, type = "package") => {
    return `Cannot find ${type} '${path}' imported from ${base}`;
  },
  Error
);
createError(
  "ERR_PACKAGE_IMPORT_NOT_DEFINED",
  (specifier, packagePath, base) => {
    return `Package import specifier "${specifier}" is not defined${packagePath ? ` in package ${packagePath}package.json` : ""} imported from ${base}`;
  },
  TypeError
);
createError(
  "ERR_PACKAGE_PATH_NOT_EXPORTED",
  (pkgPath, subpath, base = void 0) => {
    if (subpath === ".") {
      return `No "exports" main defined in ${pkgPath}package.json${base ? ` imported from ${base}` : ""}`;
    }
    return `Package subpath '${subpath}' is not defined by "exports" in ${pkgPath}package.json${base ? ` imported from ${base}` : ""}`;
  },
  Error
);
createError(
  "ERR_UNSUPPORTED_DIR_IMPORT",
  "Directory import '%s' is not supported resolving ES modules imported from %s",
  Error
);
createError(
  "ERR_UNKNOWN_FILE_EXTENSION",
  'Unknown file extension "%s" for %s',
  TypeError
);
createError(
  "ERR_INVALID_ARG_VALUE",
  (name, value, reason = "is invalid") => {
    let inspected = inspect(value);
    if (inspected.length > 128) {
      inspected = `${inspected.slice(0, 128)}...`;
    }
    const type = name.includes(".") ? "property" : "argument";
    return `The ${type} '${name}' ${reason}. Received ${inspected}`;
  },
  TypeError
);
createError(
  "ERR_UNSUPPORTED_ESM_URL_SCHEME",
  (url) => {
    let message = "Only file and data URLs are supported by the default ESM loader";
    if (isWindows && url.protocol.length === 2) {
      message += ". On Windows, absolute paths must be valid file:// URLs";
    }
    message += `. Received protocol '${url.protocol}'`;
    return message;
  },
  Error
);
function createError(sym, value, def) {
  messages.set(sym, value);
  return makeNodeErrorWithCode(def, sym);
}
function makeNodeErrorWithCode(Base, key) {
  return NodeError;
  function NodeError(...args) {
    const limit = Error.stackTraceLimit;
    if (isErrorStackTraceLimitWritable()) {
      Error.stackTraceLimit = 0;
    }
    const error = new Base();
    if (isErrorStackTraceLimitWritable()) {
      Error.stackTraceLimit = limit;
    }
    const message = getMessage(key, args, error);
    Object.defineProperty(error, "message", {
      value: message,
      enumerable: false,
      writable: true,
      configurable: true
    });
    Object.defineProperty(error, "toString", {
      value() {
        return `${this.name} [${key}]: ${this.message}`;
      },
      enumerable: false,
      writable: true,
      configurable: true
    });
    addCodeToName(error, Base.name, key);
    error.code = key;
    return error;
  }
}
const addCodeToName = hideStackFrames(
  function(error, name, code) {
    error = captureLargerStackTrace(error);
    error.name = `${name} [${code}]`;
    error.stack;
    if (name === "SystemError") {
      Object.defineProperty(error, "name", {
        value: name,
        enumerable: false,
        writable: true,
        configurable: true
      });
    } else {
      delete error.name;
    }
  }
);
function isErrorStackTraceLimitWritable() {
  const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
  if (desc === void 0) {
    return Object.isExtensible(Error);
  }
  return own$1.call(desc, "writable") ? desc.writable : desc.set !== void 0;
}
function hideStackFrames(fn) {
  const hidden = nodeInternalPrefix + fn.name;
  Object.defineProperty(fn, "name", { value: hidden });
  return fn;
}
const captureLargerStackTrace = hideStackFrames(
  function(error) {
    const stackTraceLimitIsWritable = isErrorStackTraceLimitWritable();
    if (stackTraceLimitIsWritable) {
      userStackTraceLimit = Error.stackTraceLimit;
      Error.stackTraceLimit = Number.POSITIVE_INFINITY;
    }
    Error.captureStackTrace(error);
    if (stackTraceLimitIsWritable) {
      Error.stackTraceLimit = userStackTraceLimit;
    }
    return error;
  }
);
function getMessage(key, args, self) {
  const message = messages.get(key);
  if (typeof message === "function") {
    assert(
      message.length <= args.length,
      `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${message.length}).`
    );
    return Reflect.apply(message, self, args);
  }
  const expectedLength = (message.match(/%[dfijoOs]/g) || []).length;
  assert(
    expectedLength === args.length,
    `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${expectedLength}).`
  );
  if (args.length === 0) {
    return message;
  }
  args.unshift(message);
  return Reflect.apply(format, null, args);
}
Object.freeze(["node", "import"]);
function isNodeBuiltin(id = "") {
  id = id.replace(/^node:/, "").split("/")[0];
  return BUILTIN_MODULES.has(id);
}
pathToFileURL(process.cwd());
const CJS_RE = /([\s;]|^)(module.exports\b|exports\.\w|require\s*\(|global\.\w)/m;
function hasCJSSyntax(code) {
  return CJS_RE.test(code);
}

export { hasCJSSyntax as h, isNodeBuiltin as i };
