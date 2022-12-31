#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const find_workspace_root_1 = require("../src/utils/find-workspace-root");
const chalk = require("chalk");
const init_local_1 = require("./init-local");
const package_manager_1 = require("../src/utils/package-manager");
const output_1 = require("../src/utils/output");
const workspace = (0, find_workspace_root_1.findWorkspaceRoot)(process.cwd());
// new is a special case because there is no local workspace to load
if (process.argv[2] === 'new' ||
    process.argv[2] === '_migrate' ||
    process.argv[2] === 'init' ||
    (process.argv[2] === 'graph' && !workspace)) {
    process.env.NX_DAEMON = 'false';
    require('nx/src/command-line/nx-commands').commandsObject.argv;
}
else {
    if (workspace && workspace.type === 'nx') {
        require('v8-compile-cache');
    }
    // polyfill rxjs observable to avoid issues with multiple version fo Observable installed in node_modules
    // https://twitter.com/BenLesh/status/1192478226385428483?s=20
    if (!Symbol.observable)
        Symbol.observable = Symbol('observable polyfill');
    if (!workspace) {
        output_1.output.log({
            title: `The current directory isn't part of an Nx workspace.`,
            bodyLines: [
                `To create a workspace run:`,
                chalk.bold.white(`npx create-nx-workspace@latest <workspace name>`),
                '',
                `To add Nx to existing workspace run with a workspace-specific nx.json:`,
                chalk.bold.white(`npx add-nx-to-monorepo@latest`),
                '',
                `To add the default nx.json file run:`,
                chalk.bold.white(`nx init`),
            ],
        });
        output_1.output.note({
            title: `For more information please visit https://nx.dev/`,
        });
        process.exit(1);
    }
    // Make sure that a local copy of Nx exists in workspace
    let localNx;
    try {
        localNx = resolveNx(workspace);
    }
    catch (_a) {
        output_1.output.error({
            title: `Could not find Nx modules in this workspace.`,
            bodyLines: [`Have you run ${chalk.bold.white(`npm/yarn install`)}?`],
        });
        process.exit(1);
    }
    // this file is already in the local workspace
    if (localNx === resolveNx(null)) {
        (0, init_local_1.initLocal)(workspace);
    }
    else {
        const packageManager = (0, package_manager_1.detectPackageManager)();
        if (packageManager === 'pnpm') {
            const tip = process.platform === 'win32'
                ? 'doskey pnx=pnpm nx -- $*'
                : `alias pnx="pnpm nx --"`;
            output_1.output.warn({
                title: `Running global Nx CLI with PNPM may have issues.`,
                bodyLines: [
                    `Prefer to use "pnpm" (https://pnpm.io/cli/exec) to execute commands in this workspace.`,
                    `${chalk.reset.inverse.bold.cyan(' TIP ')} create a shortcut such as: ${chalk.bold.white(tip)}`,
                    ``,
                ],
            });
        }
        // Nx is being run from globally installed CLI - hand off to the local
        require(localNx);
    }
}
function resolveNx(workspace) {
    try {
        return require.resolve('nx/bin/nx.js', {
            paths: workspace ? [workspace.dir] : undefined,
        });
    }
    catch (_a) {
        return require.resolve('@nrwl/cli/bin/nx.js', {
            paths: workspace ? [workspace.dir] : undefined,
        });
    }
}
//# sourceMappingURL=nx.js.map