"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatChangedFilesWithPrettierIfAvailable = void 0;
const tslib_1 = require("tslib");
const path = require("path");
/**
 * Formats all the created or updated files using Prettier
 * @param tree - the file system tree
 */
function formatChangedFilesWithPrettierIfAvailable(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let prettier;
        try {
            prettier = yield Promise.resolve().then(() => require('prettier'));
        }
        catch (_a) { }
        if (!prettier)
            return;
        const files = new Set(tree.listChanges().filter((file) => file.type !== 'DELETE'));
        yield Promise.all(Array.from(files).map((file) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const systemPath = path.join(tree.root, file.path);
            let options = {
                filepath: systemPath,
            };
            const resolvedOptions = yield prettier.resolveConfig(systemPath, {
                editorconfig: true,
            });
            if (!resolvedOptions) {
                return;
            }
            options = Object.assign(Object.assign({}, options), resolvedOptions);
            const support = yield prettier.getFileInfo(systemPath, options);
            if (support.ignored || !support.inferredParser) {
                return;
            }
            try {
                tree.write(file.path, prettier.format(file.content.toString('utf-8'), options));
            }
            catch (e) {
                console.warn(`Could not format ${file.path}. Error: "${e.message}"`);
            }
        })));
    });
}
exports.formatChangedFilesWithPrettierIfAvailable = formatChangedFilesWithPrettierIfAvailable;
//# sourceMappingURL=format-changed-files-with-prettier-if-available.js.map