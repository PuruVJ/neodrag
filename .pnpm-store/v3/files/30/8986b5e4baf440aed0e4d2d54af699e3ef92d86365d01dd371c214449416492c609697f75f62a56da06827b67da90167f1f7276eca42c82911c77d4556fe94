var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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

// src/index.ts
import path from "path";
import fs from "fs";
import { createRequire } from "module";

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
var req = typeof globalThis.require === "function" ? globalThis.require : createRequire(import.meta.url);
var findUp = (name, startDir, stopDir = path.parse(startDir).root) => {
  let dir = startDir;
  while (dir !== stopDir) {
    const file = path.join(dir, name);
    if (fs.existsSync(file))
      return file;
    dir = path.dirname(dir);
  }
  return null;
};
var resolveTsConfigFromFile = (cwd, filename) => {
  if (path.isAbsolute(filename))
    return fs.existsSync(filename) ? filename : null;
  return findUp(filename, cwd);
};
var resolveTsConfigFromExtends = (cwd, name) => {
  if (path.isAbsolute(name))
    return fs.existsSync(name) ? name : null;
  if (name.startsWith("."))
    return findUp(name, cwd);
  const id = req.resolve(name, { paths: [cwd] });
  return id;
};
var loadTsConfigInternal = (dir = process.cwd(), name = "tsconfig.json", files = [], isExtends = false) => {
  var _a;
  dir = path.resolve(dir);
  const id = isExtends ? resolveTsConfigFromExtends(dir, name) : resolveTsConfigFromFile(dir, name);
  if (!id)
    return null;
  const data = jsoncParse(fs.readFileSync(id, "utf-8"));
  files.unshift(id);
  const configDir = path.dirname(id);
  if ((_a = data.compilerOptions) == null ? void 0 : _a.baseUrl) {
    data.compilerOptions.baseUrl = path.join(configDir, data.compilerOptions.baseUrl);
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
export {
  loadTsConfig
};
