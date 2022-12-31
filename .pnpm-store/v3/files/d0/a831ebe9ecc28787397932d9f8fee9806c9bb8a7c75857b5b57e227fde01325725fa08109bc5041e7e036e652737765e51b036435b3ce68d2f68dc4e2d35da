"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  loadCollection: () => loadCollection,
  locate: () => locate,
  lookupCollection: () => lookupCollection,
  lookupCollections: () => lookupCollections
});
module.exports = __toCommonJS(src_exports);
var import_fs = require("fs");
var import_url = require("url");
var import_pathe = require("pathe");
var import_meta = {};
var _dirname = typeof __dirname !== "undefined" ? __dirname : (0, import_pathe.dirname)((0, import_url.fileURLToPath)(import_meta.url));
var dir = (0, import_pathe.join)(_dirname, "/..");
var locate = (name) => (0, import_pathe.join)(dir, `./json/${name}.json`);
var loadCollection = async (path) => {
  return JSON.parse(await import_fs.promises.readFile(path, "utf8"));
};
var lookupCollection = async (name) => {
  return await loadCollection(locate(name));
};
var lookupCollections = async () => {
  return JSON.parse(await import_fs.promises.readFile((0, import_pathe.join)(dir, "./collections.json"), "utf8"));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  loadCollection,
  locate,
  lookupCollection,
  lookupCollections
});
/**
 * This file is part of the iconify.design libraries.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * @license MIT
 *
 * For the full copyright and license information, please view the license.txt
 * file that is available in this file's directory.
 */
