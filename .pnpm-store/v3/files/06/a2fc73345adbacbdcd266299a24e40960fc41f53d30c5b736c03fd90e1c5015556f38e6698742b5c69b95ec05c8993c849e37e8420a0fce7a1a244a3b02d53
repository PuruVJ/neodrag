"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = require("svelte/compiler");
exports.default = exports = module.exports = function (preprocessors) {
    return {
        async markup({ content, filename }) {
            const dependencies = [];
            let code = content;
            for (const pp of preprocessors) {
                const processed = await (0, compiler_1.preprocess)(code, pp, { filename });
                if (processed && processed.dependencies) {
                    dependencies.push(...processed.dependencies);
                }
                code = processed ? processed.code : code;
            }
            return {
                code,
                dependencies
            };
        }
    };
};
//# sourceMappingURL=main.js.map