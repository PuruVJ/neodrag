"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertChangeEventsToLogMessage = exports.subscribeToWorkspaceChanges = exports.subscribeToOutputsChanges = void 0;
const tslib_1 = require("tslib");
/**
 * In addition to its native performance, another great advantage of `@parcel/watcher` is that it will
 * automatically take advantage of Facebook's watchman tool (https://facebook.github.io/watchman/) if
 * the user has it installed (but not require it if they don't).
 *
 * See https://github.com/parcel-bundler/watcher for more details.
 */
const workspace_root_1 = require("../../utils/workspace-root");
const fs_1 = require("fs");
const path_1 = require("path");
const socket_utils_1 = require("../socket-utils");
const shutdown_utils_1 = require("./shutdown-utils");
const ignore_1 = require("ignore");
const path_2 = require("../../utils/path");
const ALWAYS_IGNORE = [
    (0, path_1.join)(workspace_root_1.workspaceRoot, 'node_modules'),
    (0, path_1.join)(workspace_root_1.workspaceRoot, '.git'),
    socket_utils_1.FULL_OS_SOCKET_PATH,
];
function getIgnoredGlobs() {
    return [
        ...ALWAYS_IGNORE,
        ...getIgnoredGlobsFromFile((0, path_1.join)(workspace_root_1.workspaceRoot, '.nxignore')),
        ...getIgnoredGlobsFromFile((0, path_1.join)(workspace_root_1.workspaceRoot, '.gitignore')),
    ];
}
function getIgnoredGlobsFromFile(file) {
    try {
        return (0, fs_1.readFileSync)(file, 'utf-8')
            .split('\n')
            .map((i) => i.trim())
            .filter((i) => !!i && !i.startsWith('#'))
            .map((i) => (i.startsWith('/') ? (0, path_1.join)(workspace_root_1.workspaceRoot, i) : i));
    }
    catch (e) {
        return [];
    }
}
function configureIgnoreObject() {
    const ig = (0, ignore_1.default)();
    try {
        ig.add((0, fs_1.readFileSync)(`${workspace_root_1.workspaceRoot}/.gitignore`, 'utf-8'));
    }
    catch (_a) { }
    try {
        ig.add((0, fs_1.readFileSync)(`${workspace_root_1.workspaceRoot}/.nxignore`, 'utf-8'));
    }
    catch (_b) { }
    return ig;
}
function subscribeToOutputsChanges(cb) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const watcher = yield Promise.resolve().then(() => require('@parcel/watcher'));
        return yield watcher.subscribe(workspace_root_1.workspaceRoot, (err, events) => {
            if (err) {
                return cb(err, null);
            }
            else {
                const workspaceRelativeEvents = [];
                for (const event of events) {
                    const workspaceRelativeEvent = {
                        type: event.type,
                        path: (0, path_2.normalizePath)((0, path_1.relative)(workspace_root_1.workspaceRoot, event.path)),
                    };
                    workspaceRelativeEvents.push(workspaceRelativeEvent);
                }
                cb(null, workspaceRelativeEvents);
            }
        }, {
            ignore: [...ALWAYS_IGNORE],
        });
    });
}
exports.subscribeToOutputsChanges = subscribeToOutputsChanges;
function subscribeToWorkspaceChanges(server, cb) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        /**
         * The imports and exports of @nrwl/workspace are somewhat messy and far reaching across the repo (and beyond),
         * and so it is much safer for us to lazily load here `@parcel/watcher` so that its inclusion is not inadvertently
         * executed by packages which do not have its necessary native binaries available.
         */
        const watcher = yield Promise.resolve().then(() => require('@parcel/watcher'));
        const ignoreObj = configureIgnoreObject();
        return yield watcher.subscribe(workspace_root_1.workspaceRoot, (err, events) => {
            if (err) {
                return cb(err, null);
            }
            let hasIgnoreFileUpdate = false;
            // Most of our utilities (ignore, hashing etc) require unix-style workspace relative paths
            const workspaceRelativeEvents = [];
            for (const event of events) {
                const workspaceRelativeEvent = {
                    type: event.type,
                    path: (0, path_2.normalizePath)((0, path_1.relative)(workspace_root_1.workspaceRoot, event.path)),
                };
                if (workspaceRelativeEvent.path === '.gitignore' ||
                    workspaceRelativeEvent.path === '.nxignore') {
                    hasIgnoreFileUpdate = true;
                }
                workspaceRelativeEvents.push(workspaceRelativeEvent);
            }
            // If the ignore files themselves have changed we need to dynamically update our cached ignoreGlobs
            if (hasIgnoreFileUpdate) {
                (0, shutdown_utils_1.handleServerProcessTermination)({
                    server,
                    reason: 'Stopping the daemon the set of ignored files changed.',
                });
            }
            const nonIgnoredEvents = workspaceRelativeEvents
                .filter(({ path }) => !!path)
                .filter(({ path }) => !ignoreObj.ignores(path));
            if (nonIgnoredEvents && nonIgnoredEvents.length > 0) {
                cb(null, nonIgnoredEvents);
            }
        }, {
            ignore: getIgnoredGlobs(),
        });
    });
}
exports.subscribeToWorkspaceChanges = subscribeToWorkspaceChanges;
/**
 * NOTE: An event type of "create" will also apply to the case where the user has restored
 * an original version of a file after modifying/deleting it by using git, so we adjust
 * our log language accordingly.
 */
function convertChangeEventsToLogMessage(changeEvents) {
    // If only a single file was changed, show the information inline
    if (changeEvents.length === 1) {
        const { path, type } = changeEvents[0];
        let typeLog = 'updated';
        switch (type) {
            case 'create':
                typeLog = 'created or restored';
                break;
            case 'update':
                typeLog = 'modified';
                break;
            case 'delete':
                typeLog = 'deleted';
                break;
        }
        return `${path} was ${typeLog}`;
    }
    let numCreatedOrRestoredFiles = 0;
    let numModifiedFiles = 0;
    let numDeletedFiles = 0;
    for (const event of changeEvents) {
        switch (event.type) {
            case 'create':
                numCreatedOrRestoredFiles++;
                break;
            case 'update':
                numModifiedFiles++;
                break;
            case 'delete':
                numDeletedFiles++;
                break;
        }
    }
    return `${numCreatedOrRestoredFiles} file(s) created or restored, ${numModifiedFiles} file(s) modified, ${numDeletedFiles} file(s) deleted`;
}
exports.convertChangeEventsToLogMessage = convertChangeEventsToLogMessage;
//# sourceMappingURL=watcher.js.map