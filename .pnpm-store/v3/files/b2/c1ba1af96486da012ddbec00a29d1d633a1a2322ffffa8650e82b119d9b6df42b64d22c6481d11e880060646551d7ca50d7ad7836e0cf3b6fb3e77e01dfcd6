"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectRoots = exports.parseFiles = exports.splitArgsIntoNxArgsAndOverrides = void 0;
const yargsParser = require("yargs-parser");
const file_utils_1 = require("../project-graph/file-utils");
const output_1 = require("./output");
const child_process_1 = require("child_process");
function splitArgsIntoNxArgsAndOverrides(args, mode, options = { printWarnings: true }, nxJson) {
    var _a;
    // this is to lerna case when this function is invoked imperatively
    if (args['target'] && !args['targets']) {
        args['targets'] = [args['target']];
    }
    delete args['target'];
    delete args['t'];
    if (!args.__overrides_unparsed__ && args._) {
        // required for backwards compatibility
        args.__overrides_unparsed__ = args._;
        delete args._;
    }
    // This handles the way Lerna passes in overrides
    if (!args.__overrides_unparsed__ && args.__overrides__) {
        // required for backwards compatibility
        args.__overrides_unparsed__ = args.__overrides__;
        delete args._;
    }
    const nxArgs = args;
    let overrides = yargsParser(args.__overrides_unparsed__, {
        configuration: {
            'camel-case-expansion': false,
            'dot-notation': true,
        },
    });
    if (!overrides._ || overrides._.length === 0) {
        delete overrides._;
    }
    overrides.__overrides_unparsed__ = args.__overrides_unparsed__;
    delete nxArgs.$0;
    delete nxArgs.__overrides_unparsed__;
    if (mode === 'run-many') {
        const args = nxArgs;
        if (!args.projects) {
            args.projects = [];
        }
        else if (typeof args.projects === 'string') {
            args.projects = args.projects.split(',');
        }
    }
    if (nxArgs.prod) {
        delete nxArgs.prod;
        nxArgs.configuration = 'production';
    }
    if (mode === 'affected') {
        if (options.printWarnings && nxArgs.all) {
            output_1.output.warn({
                title: `Running affected:* commands with --all can result in very slow builds.`,
                bodyLines: [
                    `${output_1.output.bold('--all')} is not meant to be used for any sizable project or to be used in CI.`,
                    '',
                    `${output_1.output.dim('Learn more about checking only what is affected: https://nx.dev/nx/affected')}`,
                ],
            });
        }
        if (!nxArgs.files &&
            !nxArgs.uncommitted &&
            !nxArgs.untracked &&
            !nxArgs.base &&
            !nxArgs.head &&
            !nxArgs.all &&
            overrides._ &&
            overrides._.length >= 2) {
            throw new Error(`Nx no longer supports using positional arguments for base and head. Please use --base and --head instead.`);
        }
        // Allow setting base and head via environment variables (lower priority then direct command arguments)
        if (!nxArgs.base && process.env.NX_BASE) {
            nxArgs.base = process.env.NX_BASE;
            if (options.printWarnings) {
                output_1.output.note({
                    title: `No explicit --base argument provided, but found environment variable NX_BASE so using its value as the affected base: ${output_1.output.bold(`${nxArgs.base}`)}`,
                });
            }
        }
        if (!nxArgs.head && process.env.NX_HEAD) {
            nxArgs.head = process.env.NX_HEAD;
            if (options.printWarnings) {
                output_1.output.note({
                    title: `No explicit --head argument provided, but found environment variable NX_HEAD so using its value as the affected head: ${output_1.output.bold(`${nxArgs.head}`)}`,
                });
            }
        }
        if (!nxArgs.base) {
            nxArgs.base = ((_a = nxJson.affected) === null || _a === void 0 ? void 0 : _a.defaultBase) || 'main';
            // No user-provided arguments to set the affected criteria, so inform the user of the defaults being used
            if (options.printWarnings &&
                !nxArgs.head &&
                !nxArgs.files &&
                !nxArgs.uncommitted &&
                !nxArgs.untracked &&
                !nxArgs.all) {
                output_1.output.note({
                    title: `Affected criteria defaulted to --base=${output_1.output.bold(`${nxArgs.base}`)} --head=${output_1.output.bold('HEAD')}`,
                });
            }
        }
    }
    if (!nxArgs.skipNxCache) {
        nxArgs.skipNxCache = process.env.NX_SKIP_NX_CACHE === 'true';
    }
    if (args['parallel'] === 'false' || args['parallel'] === false) {
        nxArgs['parallel'] = 1;
    }
    else if (args['parallel'] === 'true' ||
        args['parallel'] === true ||
        args['parallel'] === '') {
        nxArgs['parallel'] = Number(nxArgs['maxParallel'] || nxArgs['max-parallel'] || 3);
    }
    else if (args['parallel'] !== undefined) {
        nxArgs['parallel'] = Number(args['parallel']);
    }
    return { nxArgs, overrides };
}
exports.splitArgsIntoNxArgsAndOverrides = splitArgsIntoNxArgsAndOverrides;
function parseFiles(options) {
    const { files, uncommitted, untracked, base, head } = options;
    if (files) {
        return {
            files,
        };
    }
    else if (uncommitted) {
        return {
            files: getUncommittedFiles(),
        };
    }
    else if (untracked) {
        return {
            files: getUntrackedFiles(),
        };
    }
    else if (base && head) {
        return {
            files: getFilesUsingBaseAndHead(base, head),
        };
    }
    else if (base) {
        return {
            files: Array.from(new Set([
                ...getFilesUsingBaseAndHead(base, 'HEAD'),
                ...getUncommittedFiles(),
                ...getUntrackedFiles(),
            ])),
        };
    }
}
exports.parseFiles = parseFiles;
function getUncommittedFiles() {
    return parseGitOutput(`git diff --name-only --relative HEAD .`);
}
``;
function getUntrackedFiles() {
    return parseGitOutput(`git ls-files --others --exclude-standard`);
}
function getFilesUsingBaseAndHead(base, head) {
    let mergeBase;
    try {
        mergeBase = (0, child_process_1.execSync)(`git merge-base "${base}" "${head}"`, {
            maxBuffer: file_utils_1.TEN_MEGABYTES,
        })
            .toString()
            .trim();
    }
    catch (_a) {
        mergeBase = (0, child_process_1.execSync)(`git merge-base --fork-point "${base}" "${head}"`, {
            maxBuffer: file_utils_1.TEN_MEGABYTES,
        })
            .toString()
            .trim();
    }
    return parseGitOutput(`git diff --name-only --relative "${mergeBase}" "${head}"`);
}
function parseGitOutput(command) {
    return (0, child_process_1.execSync)(command, { maxBuffer: file_utils_1.TEN_MEGABYTES })
        .toString('utf-8')
        .split('\n')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);
}
function getProjectRoots(projectNames, { nodes }) {
    return projectNames.map((name) => nodes[name].data.root);
}
exports.getProjectRoots = getProjectRoots;
//# sourceMappingURL=command-line-utils.js.map