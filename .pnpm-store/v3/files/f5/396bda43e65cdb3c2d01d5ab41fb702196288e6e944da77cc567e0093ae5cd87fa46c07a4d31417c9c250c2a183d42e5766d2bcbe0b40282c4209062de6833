"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deduceDefaultBase = void 0;
const child_process_1 = require("child_process");
function deduceDefaultBase() {
    const nxDefaultBase = 'main';
    try {
        return ((0, child_process_1.execSync)('git config --get init.defaultBranch').toString().trim() ||
            nxDefaultBase);
    }
    catch (_a) {
        return nxDefaultBase;
    }
}
exports.deduceDefaultBase = deduceDefaultBase;
//# sourceMappingURL=default-base.js.map