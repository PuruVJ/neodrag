"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const package_manager_1 = require("../../utils/package-manager");
const path = require("path");
function default_1(options, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const pm = (0, package_manager_1.getPackageManagerCommand)();
        try {
            (0, child_process_1.execSync)(pm.run(options.script, options.__unparsed__.join(' ')), {
                stdio: ['inherit', 'inherit', 'inherit'],
                cwd: path.join(context.root, context.workspace.projects[context.projectName].root),
            });
            return { success: true };
        }
        catch (e) {
            return { success: false };
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=run-script.impl.js.map