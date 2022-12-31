"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAstroSys = void 0;
const utils_1 = require("./utils");
/**
 * This should only be accessed by TS Astro module resolution.
 */
function createAstroSys(getSnapshot, ts) {
    const fileExistsCache = new Map();
    const AstroSys = {
        ...ts.sys,
        fileExists(path) {
            path = (0, utils_1.ensureRealFilePath)(path);
            const exists = fileExistsCache.get(path) ?? ts.sys.fileExists(path);
            fileExistsCache.set(path, exists);
            return exists;
        },
        readFile(path) {
            const snapshot = getSnapshot(path);
            return snapshot.getText(0, snapshot.getLength());
        },
        readDirectory(path, extensions, exclude, include, depth) {
            const extensionsWithAstro = (extensions ?? []).concat(...['.astro', '.svelte', '.vue', '.md', '.mdx', '.html']);
            const result = ts.sys.readDirectory(path, extensionsWithAstro, exclude, include, depth);
            return result;
        },
        deleteFile(path) {
            fileExistsCache.delete((0, utils_1.ensureRealFilePath)(path));
            return ts.sys.deleteFile?.(path);
        },
        deleteFromCache(path) {
            fileExistsCache.delete((0, utils_1.ensureRealFilePath)(path));
        },
    };
    if (ts.sys.realpath) {
        const realpath = ts.sys.realpath;
        AstroSys.realpath = function (path) {
            if ((0, utils_1.isVirtualFilePath)(path)) {
                return realpath((0, utils_1.ensureRealFilePath)(path)) + '.tsx';
            }
            return realpath(path);
        };
    }
    return AstroSys;
}
exports.createAstroSys = createAstroSys;
