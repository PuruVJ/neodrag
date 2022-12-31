"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildImplicitProjectDependencies = void 0;
function buildImplicitProjectDependencies(ctx, builder) {
    Object.keys(ctx.workspace.projects).forEach((source) => {
        const p = ctx.workspace.projects[source];
        if (p.implicitDependencies && p.implicitDependencies.length > 0) {
            p.implicitDependencies.forEach((target) => {
                if (target.startsWith('!')) {
                    builder.removeDependency(source, target.slice(1));
                }
                else {
                    builder.addImplicitDependency(source, target);
                }
            });
        }
    });
}
exports.buildImplicitProjectDependencies = buildImplicitProjectDependencies;
//# sourceMappingURL=implicit-project-dependencies.js.map