"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newWorkspace = void 0;
const tslib_1 = require("tslib");
const workspaces_1 = require("../config/workspaces");
const tree_1 = require("../generators/tree");
const params_1 = require("../utils/params");
function removeSpecialFlags(generatorOptions) {
    delete generatorOptions.interactive;
    delete generatorOptions.help;
    delete generatorOptions.verbose;
    delete generatorOptions['--'];
    delete generatorOptions['$0'];
}
function newWorkspace(cwd, args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const ws = new workspaces_1.Workspaces(null);
        return (0, params_1.handleErrors)(false, () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const isInteractive = args.interactive;
            const { normalizedGeneratorName, schema, implementationFactory } = ws.readGenerator('@nrwl/workspace/generators.json', 'new');
            removeSpecialFlags(args);
            const combinedOpts = yield (0, params_1.combineOptionsForGenerator)(args, '@nrwl/workspace/generators.json', normalizedGeneratorName, null, schema, isInteractive, null, null, false);
            const host = new tree_1.FsTree(cwd, false);
            const implementation = implementationFactory();
            const task = yield implementation(host, combinedOpts);
            (0, tree_1.flushChanges)(cwd, host.listChanges());
            if (task) {
                yield task();
            }
        }));
    });
}
exports.newWorkspace = newWorkspace;
//# sourceMappingURL=new.js.map