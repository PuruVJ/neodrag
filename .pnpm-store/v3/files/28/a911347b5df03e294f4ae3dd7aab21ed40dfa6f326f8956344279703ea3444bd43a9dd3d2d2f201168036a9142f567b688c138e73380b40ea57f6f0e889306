"use strict";

// src/index.ts
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "pathe";
var _dirname = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));
var dir = join(_dirname, "/..");
var locate = (name) => join(dir, `./json/${name}.json`);
var loadCollection = async (path) => {
  return JSON.parse(await fs.readFile(path, "utf8"));
};
var lookupCollection = async (name) => {
  return await loadCollection(locate(name));
};
var lookupCollections = async () => {
  return JSON.parse(await fs.readFile(join(dir, "./collections.json"), "utf8"));
};
export {
  loadCollection,
  locate,
  lookupCollection,
  lookupCollections
};
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
