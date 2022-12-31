"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformer = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const utils_1 = require("../modules/utils");
let sass;
function getProcessedResult(result) {
    var _a;
    // For some reason, scss includes the main 'file' in the array, we don't want that
    // Unfortunately I didn't manage to reproduce this in the test env
    // More info: https://github.com/sveltejs/svelte-preprocess/issues/346
    const absoluteEntryPath = (0, path_1.isAbsolute)(result.stats.entry)
        ? result.stats.entry
        : (0, path_1.join)(process.cwd(), result.stats.entry);
    const processed = {
        code: result.css.toString(),
        map: (_a = result.map) === null || _a === void 0 ? void 0 : _a.toString(),
        dependencies: Array.from(result.stats.includedFiles).filter((filepath) => filepath !== absoluteEntryPath),
    };
    return processed;
}
const tildeImporter = (url, prev) => {
    if (!url.startsWith('~')) {
        return null;
    }
    // not sure why this ends up here, but let's remove it
    prev = prev.replace('http://localhost', '');
    // on windows, path comes encoded
    if (process.platform === 'win32') {
        prev = decodeURIComponent(prev);
    }
    const modulePath = (0, path_1.join)('node_modules', ...url.slice(1).split(/[\\/]/g));
    const foundPath = (0, utils_1.findUp)({ what: modulePath, from: prev });
    // istanbul ignore if
    if (foundPath == null) {
        return null;
    }
    const contents = (0, fs_1.readFileSync)(foundPath).toString();
    return { contents };
};
const transformer = async ({ content, filename, options = {}, }) => {
    var _a;
    let implementation = (_a = options === null || options === void 0 ? void 0 : options.implementation) !== null && _a !== void 0 ? _a : sass;
    if (implementation == null) {
        const mod = (await (0, utils_1.importAny)('sass', 'node-sass'));
        // eslint-disable-next-line no-multi-assign
        implementation = sass = mod.default;
    }
    const { renderSync, prependData, ...restOptions } = {
        ...options,
        includePaths: (0, utils_1.getIncludePaths)(filename, options.includePaths),
        outFile: `${filename}.css`,
        omitSourceMapUrl: true, // return sourcemap only in result.map
    };
    const sassOptions = {
        ...restOptions,
        file: filename,
        data: content,
    };
    if (Array.isArray(sassOptions.importer)) {
        sassOptions.importer = [tildeImporter, ...sassOptions.importer];
    }
    else if (sassOptions.importer == null) {
        sassOptions.importer = [tildeImporter];
    }
    else {
        sassOptions.importer = [sassOptions.importer, tildeImporter];
    }
    // scss errors if passed an empty string
    if (sassOptions.data.length === 0) {
        return { code: '' };
    }
    if (renderSync) {
        return getProcessedResult(implementation.renderSync(sassOptions));
    }
    return new Promise((resolve, reject) => {
        implementation.render(sassOptions, (err, result) => {
            if (err)
                return reject(err);
            resolve(getProcessedResult(result));
        });
    });
};
exports.transformer = transformer;
