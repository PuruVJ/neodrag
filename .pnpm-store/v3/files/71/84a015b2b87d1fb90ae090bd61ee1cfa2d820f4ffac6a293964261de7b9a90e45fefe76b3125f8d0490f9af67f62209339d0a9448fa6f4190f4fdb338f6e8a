"use strict";
/**
 * This is a copy of the @nrwl/devkit utility but this should not be used outside of the nx package
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNxExecutor = void 0;
const tslib_1 = require("tslib");
const workspaces_1 = require("../../config/workspaces");
const project_graph_1 = require("../../project-graph/project-graph");
/**
 * Convert an Nx Executor into an Angular Devkit Builder
 *
 * Use this to expose a compatible Angular Builder
 */
function convertNxExecutor(executor) {
    const builderFunction = (options, builderContext) => {
        const workspaces = new workspaces_1.Workspaces(builderContext.workspaceRoot);
        const workspaceConfig = workspaces.readWorkspaceConfiguration();
        const promise = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let projectGraph;
            try {
                projectGraph = (0, project_graph_1.readCachedProjectGraph)();
            }
            catch (_a) {
                projectGraph = yield (0, project_graph_1.createProjectGraphAsync)();
            }
            const context = {
                root: builderContext.workspaceRoot,
                projectName: builderContext.target.project,
                targetName: builderContext.target.target,
                target: builderContext.target.target,
                configurationName: builderContext.target.configuration,
                workspace: workspaceConfig,
                cwd: process.cwd(),
                projectGraph,
                isVerbose: false,
            };
            return executor(options, context);
        });
        return toObservable(promise());
    };
    return require('@angular-devkit/architect').createBuilder(builderFunction);
}
exports.convertNxExecutor = convertNxExecutor;
function toObservable(promiseOrAsyncIterator) {
    return new (require('rxjs').Observable)((subscriber) => {
        promiseOrAsyncIterator
            .then((value) => {
            if (!value.next) {
                subscriber.next(value);
                subscriber.complete();
            }
            else {
                let asyncIterator = value;
                function recurse(iterator) {
                    iterator
                        .next()
                        .then((result) => {
                        if (!result.done) {
                            subscriber.next(result.value);
                            recurse(iterator);
                        }
                        else {
                            if (result.value) {
                                subscriber.next(result.value);
                            }
                            subscriber.complete();
                        }
                    })
                        .catch((e) => {
                        subscriber.error(e);
                    });
                }
                recurse(asyncIterator);
                return () => {
                    asyncIterator.return();
                };
            }
        })
            .catch((err) => {
            subscriber.error(err);
        });
    });
}
//# sourceMappingURL=convert-nx-executor.js.map