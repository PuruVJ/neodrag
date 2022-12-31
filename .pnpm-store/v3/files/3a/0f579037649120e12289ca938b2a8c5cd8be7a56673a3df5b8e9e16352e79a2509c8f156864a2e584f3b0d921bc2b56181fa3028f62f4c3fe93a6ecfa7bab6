"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeJson = exports.parseJson = exports.stripJsonComments = void 0;
const jsonc_parser_1 = require("jsonc-parser");
Object.defineProperty(exports, "stripJsonComments", { enumerable: true, get: function () { return jsonc_parser_1.stripComments; } });
/**
 * Parses the given JSON string and returns the object the JSON content represents.
 * By default javascript-style comments are allowed.
 *
 * @param input JSON content as string
 * @param options JSON parse options
 * @returns Object the JSON content represents
 */
function parseJson(input, options) {
    try {
        return JSON.parse(input);
    }
    catch (_a) { }
    const errors = [];
    const result = (0, jsonc_parser_1.parse)(input, errors, options);
    if (errors.length > 0) {
        const { error, offset } = errors[0];
        throw new Error(`${(0, jsonc_parser_1.printParseErrorCode)(error)} in JSON at position ${offset}`);
    }
    return result;
}
exports.parseJson = parseJson;
/**
 * Serializes the given data to a JSON string.
 * By default the JSON string is formatted with a 2 space intendation to be easy readable.
 *
 * @param input Object which should be serialized to JSON
 * @param options JSON serialize options
 * @returns the formatted JSON representation of the object
 */
function serializeJson(input, options) {
    var _a;
    return JSON.stringify(input, null, (_a = options === null || options === void 0 ? void 0 : options.spaces) !== null && _a !== void 0 ? _a : 2) + '\n';
}
exports.serializeJson = serializeJson;
//# sourceMappingURL=json.js.map