"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyFileWatcherSockets = exports.hasRegisteredFileWatcherSockets = exports.removeRegisteredFileWatcherSocket = exports.registeredFileWatcherSockets = void 0;
const tslib_1 = require("tslib");
const project_graph_utils_1 = require("../../../utils/project-graph-utils");
const promised_based_queue_1 = require("../../../utils/promised-based-queue");
const project_graph_incremental_recomputation_1 = require("../project-graph-incremental-recomputation");
const server_1 = require("../server");
const changed_projects_1 = require("./changed-projects");
const queue = new promised_based_queue_1.PromisedBasedQueue();
exports.registeredFileWatcherSockets = [];
function removeRegisteredFileWatcherSocket(socket) {
    exports.registeredFileWatcherSockets = exports.registeredFileWatcherSockets.filter((watcher) => watcher.socket !== socket);
}
exports.removeRegisteredFileWatcherSocket = removeRegisteredFileWatcherSocket;
function hasRegisteredFileWatcherSockets() {
    return exports.registeredFileWatcherSockets.length > 0;
}
exports.hasRegisteredFileWatcherSockets = hasRegisteredFileWatcherSockets;
function notifyFileWatcherSockets(createdFiles, updatedFiles, deletedFiles) {
    if (!hasRegisteredFileWatcherSockets()) {
        return;
    }
    queue.sendToQueue(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const projectAndGlobalChanges = (0, changed_projects_1.getProjectsAndGlobalChanges)(createdFiles, updatedFiles, deletedFiles);
        yield Promise.all(exports.registeredFileWatcherSockets.map(({ socket, config }) => {
            const changedProjects = [];
            const changedFiles = [];
            if (config.watchProjects === 'all') {
                for (const [projectName, projectFiles] of Object.entries(projectAndGlobalChanges.projects)) {
                    changedProjects.push(projectName);
                    changedFiles.push(...projectFiles);
                }
            }
            else {
                const watchedProjects = [...config.watchProjects];
                if (config.includeDependentProjects) {
                    for (const project of watchedProjects) {
                        watchedProjects.push(...(0, project_graph_utils_1.findAllProjectNodeDependencies)(project, project_graph_incremental_recomputation_1.currentProjectGraphCache));
                    }
                }
                for (const watchedProject of new Set(watchedProjects)) {
                    if (!!projectAndGlobalChanges.projects[watchedProject]) {
                        changedProjects.push(watchedProject);
                        changedFiles.push(...projectAndGlobalChanges.projects[watchedProject]);
                    }
                }
            }
            if (config.includeGlobalWorkspaceFiles) {
                changedFiles.push(...projectAndGlobalChanges.globalFiles);
            }
            if (changedProjects.length > 0 || changedFiles.length > 0) {
                return (0, server_1.handleResult)(socket, {
                    description: 'File watch changed',
                    response: JSON.stringify({
                        changedProjects,
                        changedFiles,
                    }),
                });
            }
        }));
    }));
}
exports.notifyFileWatcherSockets = notifyFileWatcherSockets;
//# sourceMappingURL=file-watcher-sockets.js.map