var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// src/index.ts
__export(exports, {
  loadTsConfig: () => loadTsConfig
});

// node_modules/.pnpm/tsup@5.11.11_typescript@4.5.5/node_modules/tsup/assets/cjs_shims.js
var getImportMetaUrl = () => typeof document === "undefined" ? new URL("file:" + __filename).href : document.currentScript && document.currentScript.src || new URL("main.js", document.baseURI).href;
var importMetaUrl = /* @__PURE__ */ getImportMetaUrl();

// src/index.ts
var import_path = __toModule(require("path"));
var import_fs = __toModule(require("fs"));
var import_module = __toModule(require("module"));

// node_modules/.pnpm/strip-json-comments@4.0.0/node_modules/strip-json-comments/index.js
var singleComment = Symbol("singleComment");
var multiComment = Symbol("multiComment");
var stripWithoutWhitespace = () => "";
var stripWithWhitespace = (string, start, end) => string.slice(start, end).replace(/\S/g, " ");
var isEscaped = (jsonString, quotePosition) => {
  let index = quotePosition - 1;
  let backslashCount = 0;
  while (jsonString[index] === "\\") {
    index -= 1;
    backslashCount += 1;
  }
  return Boolean(backslashCount % 2);
};
function stripJsonComments(jsonString, { whitespace = true } = {}) {
  if (typeof jsonString !== "string") {
    throw new TypeError(`Expected argument \`jsonString\` to be a \`string\`, got \`${typeof jsonString}\``);
  }
  const strip = whitespace ? stripWithWhitespace : stripWithoutWhitespace;
  let isInsideString = false;
  let isInsideComment = false;
  let offset = 0;
  let result = "";
  for (let index = 0; index < jsonString.length; index++) {
    const currentCharacter = jsonString[index];
    const nextCharacter = jsonString[index + 1];
    if (!isInsideComment && currentCharacter === '"') {
      const escaped = isEscaped(jsonString, index);
      if (!escaped) {
        isInsideString = !isInsideString;
      }
    }
    if (isInsideString) {
      continue;
    }
    if (!isInsideComment && currentCharacter + nextCharacter === "//") {
      result += jsonString.slice(offset, index);
      offset = index;
      isInsideComment = singleComment;
      index++;
    } else if (isInsideComment === singleComment && currentCharacter + nextCharacter === "\r\n") {
      index++;
      isInsideComment = false;
      result += strip(jsonString, offset, index);
      offset = index;
      continue;
    } else if (isInsideComment === singleComment && currentCharacter === "\n") {
      isInsideComment = false;
      result += strip(jsonString, offset, index);
      offset = index;
    } else if (!isInsideComment && currentCharacter + nextCharacter === "/*") {
      result += jsonString.slice(offset, index);
      offset = index;
      isInsideComment = multiComment;
      index++;
      continue;
    } else if (isInsideComment === multiComment && currentCharacter + nextCharacter === "*/") {
      index++;
      isInsideComment = false;
      result += strip(jsonString, offset, index + 1);
      offset = index + 1;
      continue;
    }
  }
  return result + (isInsideComment ? strip(jsonString.slice(offset)) : jsonString.slice(offset));
}

// src/utils.ts
function jsoncParse(data) {
  try {
    return new Function("return " + stripJsonComments(data).trim())();
  } catch (_) {
    return {};
  }
}

// src/index.ts
var req = typeof globalThis.require === "function" ? globalThis.require : (0, import_module.createRequire)(importMetaUrl);
var findUp = (name, startDir, stopDir = import_path.default.parse(startDir).root) => {
  let dir = startDir;
  while (dir !== stopDir) {
    const file = import_path.default.join(dir, name);
    if (import_fs.default.existsSync(file))
      return file;
    dir = import_path.default.dirname(dir);
  }
  return null;
};
var resolveTsConfigFromFile = (cwd, filename) => {
  if (import_path.default.isAbsolute(filename))
    return import_fs.default.existsSync(filename) ? filename : null;
  return findUp(filename, cwd);
};
var resolveTsConfigFromExtends = (cwd, name) => {
  if (import_path.default.isAbsolute(name))
    return import_fs.default.existsSync(name) ? name : null;
  if (name.startsWith("."))
    return findUp(name, cwd);
  const id = req.resolve(name, { paths: [cwd] });
  return id;
};
var loadTsConfigInternal = (dir = process.cwd(), name = "tsconfig.json", files = [], isExtends = false) => {
  var _a;
  dir = import_path.default.resolve(dir);
  const id = isExtends ? resolveTsConfigFromExtends(dir, name) : resolveTsConfigFromFile(dir, name);
  if (!id)
    return null;
  const data = jsoncParse(import_fs.default.readFileSync(id, "utf-8"));
  files.unshift(id);
  const configDir = import_path.default.dirname(id);
  if ((_a = data.compilerOptions) == null ? void 0 : _a.baseUrl) {
    data.compilerOptions.baseUrl = import_path.default.join(configDir, data.compilerOptions.baseUrl);
  }
  if (data.extends) {
    const parentConfig = loadTsConfigInternal(configDir, data.extends, files, true);
    if (parentConfig) {
      Object.assign(data, __spreadProps(__spreadValues(__spreadValues({}, parentConfig.data), data), {
        compilerOptions: __spreadValues(__spreadValues({}, parentConfig.data.compilerOptions), data.compilerOptions)
      }));
    }
  }
  delete data.extends;
  return { path: id, data, files };
};
var loadTsConfig = (dir, name) => loadTsConfigInternal(dir, name);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  loadTsConfig
});
