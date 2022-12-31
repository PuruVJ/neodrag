"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const client_1 = require("../daemon/client/client");
const output_1 = require("../utils/output");
const DEFAULT_PROJECT_NAME_ENV = 'NX_PROJECT_NAME';
const DEFAULT_FILE_CHANGES_ENV = 'NX_FILE_CHANGES';
class BatchCommandRunner {
    constructor(command, projectNameEnv = DEFAULT_PROJECT_NAME_ENV, fileChangesEnv = DEFAULT_FILE_CHANGES_ENV) {
        this.command = command;
        this.projectNameEnv = projectNameEnv;
        this.fileChangesEnv = fileChangesEnv;
        this.running = false;
        this.pendingProjects = new Set();
        this.pendingFiles = new Set();
    }
    get _verbose() {
        return process.env.NX_VERBOSE_LOGGING === 'true';
    }
    get hasPending() {
        return this.pendingProjects.size > 0 || this.pendingFiles.size > 0;
    }
    enqueue(projectNames, fileChanges) {
        projectNames.forEach((projectName) => {
            this.pendingProjects.add(projectName);
        });
        fileChanges.forEach((fileChange) => {
            this.pendingFiles.add(fileChange.path);
        });
        return this.process();
    }
    process() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.running && this.hasPending) {
                this.running = true;
                // process all pending commands together
                const envs = this.createCommandEnvironments();
                this._verbose &&
                    output_1.output.logSingleLine('about to run commands with these environments: ' +
                        JSON.stringify(envs));
                return this.run(envs).then(() => {
                    this.running = false;
                    this._verbose &&
                        output_1.output.logSingleLine('running complete, processing the next batch');
                    this.process();
                });
            }
            else {
                this._verbose &&
                    this.running &&
                    output_1.output.logSingleLine('waiting for commands to finish executing');
                this._verbose &&
                    !this.hasPending &&
                    output_1.output.logSingleLine('no more commands to process');
            }
        });
    }
    createCommandEnvironments() {
        const commandsToRun = [];
        if (this.pendingProjects.size > 0) {
            this.pendingProjects.forEach((projectName) => {
                commandsToRun.push({
                    [this.projectNameEnv]: projectName,
                    [this.fileChangesEnv]: Array.from(this.pendingFiles).join(' '),
                });
            });
        }
        else {
            commandsToRun.push({
                [this.projectNameEnv]: '',
                [this.fileChangesEnv]: Array.from(this.pendingFiles).join(' '),
            });
        }
        this.pendingProjects.clear();
        this.pendingFiles.clear();
        return commandsToRun;
    }
    run(envs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return Promise.all(envs.map((env) => {
                return new Promise((resolve, reject) => {
                    const commandExec = (0, child_process_1.spawn)(this.command, {
                        stdio: 'inherit',
                        shell: true,
                        cwd: process.cwd(),
                        env: Object.assign(Object.assign({}, process.env), { [this.projectNameEnv]: env[this.projectNameEnv], [this.fileChangesEnv]: env[this.fileChangesEnv] }),
                    });
                    commandExec.on('close', () => {
                        resolve();
                    });
                    commandExec.on('exit', () => {
                        resolve();
                    });
                });
            }));
        });
    }
}
function watch(args) {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const projectReplacementRegex = new RegExp((_a = args.projectNameEnvName) !== null && _a !== void 0 ? _a : DEFAULT_PROJECT_NAME_ENV, 'g');
        if (args.verbose) {
            process.env.NX_VERBOSE_LOGGING = 'true';
        }
        if (args.includeGlobalWorkspaceFiles &&
            args.command.match(projectReplacementRegex)) {
            output_1.output.error({
                title: 'Invalid command',
                bodyLines: [
                    'The command you provided has a replacement for projects ($NX_PROJECT_NAME), but you are also including global workspace files.',
                    'You cannot use a replacement for projects when including global workspace files because there will be scenarios where there are file changes not associated with a project.',
                ],
            });
            process.exit(1);
        }
        args.verbose &&
            output_1.output.logSingleLine('running with args: ' + JSON.stringify(args));
        args.verbose && output_1.output.logSingleLine('starting watch process');
        const whatToWatch = args.all ? 'all' : args.projects;
        const batchQueue = new BatchCommandRunner((_b = args.command) !== null && _b !== void 0 ? _b : '', args.projectNameEnvName, args.fileChangesEnvName);
        yield client_1.daemonClient.registerFileWatcher({
            watchProjects: whatToWatch,
            includeDependentProjects: args.includeDependentProjects,
            includeGlobalWorkspaceFiles: args.includeGlobalWorkspaceFiles,
        }, (err, data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (err === 'closed') {
                output_1.output.error({
                    title: 'Watch connection closed',
                    bodyLines: [
                        'The daemon has closed the connection to this watch process.',
                        'Please restart your watch command.',
                    ],
                });
                process.exit(1);
            }
            else if (err !== null) {
                output_1.output.error({
                    title: 'Watch error',
                    bodyLines: [
                        'An error occurred during the watch process:',
                        err.message,
                    ],
                });
            }
            // Only pass the projects to the queue if the command has a replacement for projects
            if (args.command.match(projectReplacementRegex)) {
                batchQueue.enqueue(data.changedProjects, data.changedFiles);
            }
            else {
                batchQueue.enqueue([], data.changedFiles);
            }
        }));
        args.verbose && output_1.output.logSingleLine('watch process waiting...');
    });
}
exports.watch = watch;
//# sourceMappingURL=watch.js.map