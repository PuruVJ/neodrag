"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJson = exports.writeJson = exports.readJson = void 0;
const json_1 = require("../../utils/json");
/**
 * Reads a json file, removes all comments and parses JSON.
 *
 * @param tree - file system tree
 * @param path - file path
 * @param options - Optional JSON Parse Options
 */
function readJson(tree, path, options) {
    if (!tree.exists(path)) {
        throw new Error(`Cannot find ${path}`);
    }
    try {
        return (0, json_1.parseJson)(tree.read(path, 'utf-8'), options);
    }
    catch (e) {
        throw new Error(`Cannot parse ${path}: ${e.message}`);
    }
}
exports.readJson = readJson;
/**
 * Writes a JSON value to the file system tree

 * @param tree File system tree
 * @param path Path of JSON file in the Tree
 * @param value Serializable value to write
 * @param options Optional JSON Serialize Options
 */
function writeJson(tree, path, value, options) {
    tree.write(path, (0, json_1.serializeJson)(value, options));
}
exports.writeJson = writeJson;
/**
 * Updates a JSON value to the file system tree
 *
 * @param tree File system tree
 * @param path Path of JSON file in the Tree
 * @param updater Function that maps the current value of a JSON document to a new value to be written to the document
 * @param options Optional JSON Parse and Serialize Options
 */
function updateJson(tree, path, updater, options) {
    const updatedValue = updater(readJson(tree, path, options));
    writeJson(tree, path, updatedValue, options);
}
exports.updateJson = updateJson;
//# sourceMappingURL=json.js.map