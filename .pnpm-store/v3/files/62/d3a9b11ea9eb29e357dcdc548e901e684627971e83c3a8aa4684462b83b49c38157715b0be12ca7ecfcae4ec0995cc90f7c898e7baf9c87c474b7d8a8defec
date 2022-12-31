"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForkedProcessTaskRunner = void 0;
const fs_1 = require("fs");
const dotenv = require("dotenv");
const child_process_1 = require("child_process");
const chalk = require("chalk");
const logTransformer = require("strong-log-transformer");
const workspace_root_1 = require("../utils/workspace-root");
const output_1 = require("../utils/output");
const utils_1 = require("./utils");
const path_1 = require("path");
const batch_messages_1 = require("./batch/batch-messages");
const strip_indents_1 = require("../utils/strip-indents");
const workerPath = (0, path_1.join)(__dirname, './batch/run-batch.js');
class ForkedProcessTaskRunner {
    constructor(options) {
        this.options = options;
        this.workspaceRoot = workspace_root_1.workspaceRoot;
        this.cliPath = (0, utils_1.getCliPath)();
        this.verbose = process.env.NX_VERBOSE_LOGGING === 'true';
        this.processes = new Set();
        this.setupProcessEventListeners();
    }
    // TODO: vsavkin delegate terminal output printing
    forkProcessForBatch({ executorName, taskGraph }) {
        return new Promise((res, rej) => {
            try {
                const count = Object.keys(taskGraph.tasks).length;
                if (count > 1) {
                    output_1.output.logSingleLine(`Running ${output_1.output.bold(count)} ${output_1.output.bold('tasks')} with ${output_1.output.bold(executorName)}`);
                }
                else {
                    const args = (0, utils_1.getPrintableCommandArgsForTask)(Object.values(taskGraph.tasks)[0]);
                    output_1.output.logCommand(args.join(' '));
                    output_1.output.addNewline();
                }
                const p = (0, child_process_1.fork)(workerPath, {
                    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
                    env: this.getEnvVariablesForProcess(),
                });
                this.processes.add(p);
                p.once('exit', (code, signal) => {
                    if (code === null)
                        code = this.signalToCode(signal);
                    if (code !== 0) {
                        const results = {};
                        for (const rootTaskId of taskGraph.roots) {
                            results[rootTaskId] = {
                                success: false,
                            };
                        }
                        rej(new Error(`"${executorName}" exited unexpectedly with code: ${code}`));
                    }
                });
                p.on('message', (message) => {
                    switch (message.type) {
                        case batch_messages_1.BatchMessageType.Complete: {
                            res(message.results);
                            break;
                        }
                        case batch_messages_1.BatchMessageType.Tasks: {
                            break;
                        }
                        default: {
                            // Re-emit any non-batch messages from the task process
                            if (process.send) {
                                process.send(message);
                            }
                        }
                    }
                });
                // Start the tasks
                p.send({
                    type: batch_messages_1.BatchMessageType.Tasks,
                    taskGraph,
                    executorName,
                });
            }
            catch (e) {
                rej(e);
            }
        });
    }
    forkProcessPipeOutputCapture(task, { streamOutput, temporaryOutputPath, }) {
        return new Promise((res, rej) => {
            try {
                const args = (0, utils_1.getPrintableCommandArgsForTask)(task);
                const serializedArgs = (0, utils_1.getSerializedArgsForTask)(task, this.verbose);
                if (streamOutput) {
                    output_1.output.logCommand(args.join(' '));
                    output_1.output.addNewline();
                }
                const p = (0, child_process_1.fork)(this.cliPath, serializedArgs, {
                    stdio: ['inherit', 'pipe', 'pipe', 'ipc'],
                    env: this.getEnvVariablesForTask(task, process.env.FORCE_COLOR === undefined
                        ? 'true'
                        : process.env.FORCE_COLOR, null, null),
                });
                this.processes.add(p);
                // Re-emit any messages from the task process
                p.on('message', (message) => {
                    if (process.send) {
                        process.send(message);
                    }
                });
                if (streamOutput) {
                    if (process.env.NX_PREFIX_OUTPUT === 'true') {
                        const color = getColor(task.target.project);
                        const prefixText = `${task.target.project}:`;
                        p.stdout
                            .pipe(logTransformer({ tag: color.bold(prefixText) }))
                            .pipe(process.stdout);
                        p.stderr
                            .pipe(logTransformer({ tag: color(prefixText) }))
                            .pipe(process.stderr);
                    }
                    else {
                        p.stdout.pipe(logTransformer()).pipe(process.stdout);
                        p.stderr.pipe(logTransformer()).pipe(process.stderr);
                    }
                }
                let outWithErr = [];
                p.stdout.on('data', (chunk) => {
                    outWithErr.push(chunk.toString());
                });
                p.stderr.on('data', (chunk) => {
                    outWithErr.push(chunk.toString());
                });
                p.on('exit', (code, signal) => {
                    if (code === null)
                        code = this.signalToCode(signal);
                    // we didn't print any output as we were running the command
                    // print all the collected output|
                    const terminalOutput = outWithErr.join('');
                    if (!streamOutput) {
                        this.options.lifeCycle.printTaskTerminalOutput(task, code === 0 ? 'success' : 'failure', terminalOutput);
                    }
                    this.writeTerminalOutput(temporaryOutputPath, terminalOutput);
                    res({ code, terminalOutput });
                });
            }
            catch (e) {
                console.error(e);
                rej(e);
            }
        });
    }
    forkProcessDirectOutputCapture(task, { streamOutput, temporaryOutputPath, }) {
        return new Promise((res, rej) => {
            try {
                const args = (0, utils_1.getPrintableCommandArgsForTask)(task);
                const serializedArgs = (0, utils_1.getSerializedArgsForTask)(task, this.verbose);
                if (streamOutput) {
                    output_1.output.logCommand(args.join(' '));
                    output_1.output.addNewline();
                }
                const p = (0, child_process_1.fork)(this.cliPath, serializedArgs, {
                    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
                    env: this.getEnvVariablesForTask(task, undefined, temporaryOutputPath, streamOutput),
                });
                this.processes.add(p);
                // Re-emit any messages from the task process
                p.on('message', (message) => {
                    if (process.send) {
                        process.send(message);
                    }
                });
                p.on('exit', (code, signal) => {
                    if (code === null)
                        code = this.signalToCode(signal);
                    // we didn't print any output as we were running the command
                    // print all the collected output
                    let terminalOutput = '';
                    try {
                        terminalOutput = this.readTerminalOutput(temporaryOutputPath);
                        if (!streamOutput) {
                            this.options.lifeCycle.printTaskTerminalOutput(task, code === 0 ? 'success' : 'failure', terminalOutput);
                        }
                    }
                    catch (e) {
                        console.log((0, strip_indents_1.stripIndents) `
              Unable to print terminal output for Task "${task.id}".
              Task failed with Exit Code ${code} and Signal "${signal}".

              Received error message:
              ${e.message}
            `);
                    }
                    res({
                        code,
                        terminalOutput,
                    });
                });
            }
            catch (e) {
                console.error(e);
                rej(e);
            }
        });
    }
    readTerminalOutput(outputPath) {
        return (0, fs_1.readFileSync)(outputPath).toString();
    }
    writeTerminalOutput(outputPath, content) {
        (0, fs_1.writeFileSync)(outputPath, content);
    }
    // region Environment Variables
    getEnvVariablesForProcess() {
        return Object.assign(Object.assign(Object.assign({}, this.getDotenvVariablesForForkedProcess()), process.env), this.getNxEnvVariablesForForkedProcess(process.env.FORCE_COLOR === undefined ? 'true' : process.env.FORCE_COLOR));
    }
    getEnvVariablesForTask(task, forceColor, outputPath, streamOutput) {
        const res = Object.assign(Object.assign(Object.assign({}, this.getDotenvVariablesForTask(task)), process.env), this.getNxEnvVariablesForTask(task, forceColor, outputPath, streamOutput));
        // we have to delete it because if we invoke Nx from within Nx, we need to reset those values
        if (!outputPath) {
            delete res.NX_TERMINAL_OUTPUT_PATH;
            delete res.NX_STREAM_OUTPUT;
            delete res.NX_PREFIX_OUTPUT;
        }
        delete res.NX_BASE;
        delete res.NX_HEAD;
        delete res.NX_SET_CLI;
        return res;
    }
    getNxEnvVariablesForForkedProcess(forceColor, outputPath, streamOutput) {
        const env = {
            FORCE_COLOR: forceColor,
            NX_WORKSPACE_ROOT: this.workspaceRoot,
            NX_SKIP_NX_CACHE: this.options.skipNxCache ? 'true' : undefined,
        };
        if (outputPath) {
            env.NX_TERMINAL_OUTPUT_PATH = outputPath;
            if (this.options.captureStderr) {
                env.NX_TERMINAL_CAPTURE_STDERR = 'true';
            }
            if (streamOutput) {
                env.NX_STREAM_OUTPUT = 'true';
            }
        }
        return env;
    }
    getNxEnvVariablesForTask(task, forceColor, outputPath, streamOutput) {
        const env = {
            NX_TASK_TARGET_PROJECT: task.target.project,
            NX_TASK_HASH: task.hash,
            // used when Nx is invoked via Lerna
            LERNA_PACKAGE_NAME: task.target.project,
        };
        // TODO: remove this once we have a reasonable way to configure it
        if (task.target.target === 'test') {
            env.NX_TERMINAL_CAPTURE_STDERR = 'true';
        }
        return Object.assign(Object.assign({}, this.getNxEnvVariablesForForkedProcess(forceColor, outputPath, streamOutput)), env);
    }
    getDotenvVariablesForForkedProcess() {
        return Object.assign(Object.assign(Object.assign({}, parseEnv('.env')), parseEnv('.local.env')), parseEnv('.env.local'));
    }
    getDotenvVariablesForTask(task) {
        if (process.env.NX_LOAD_DOT_ENV_FILES == 'true') {
            return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, this.getDotenvVariablesForForkedProcess()), parseEnv(`.${task.target.target}.env`)), parseEnv(`.env.${task.target.target}`)), parseEnv(`${task.projectRoot}/.env`)), parseEnv(`${task.projectRoot}/.local.env`)), parseEnv(`${task.projectRoot}/.env.local`)), parseEnv(`${task.projectRoot}/.${task.target.target}.env`)), parseEnv(`${task.projectRoot}/.env.${task.target.target}`));
        }
        else {
            return {};
        }
    }
    // endregion Environment Variables
    signalToCode(signal) {
        if (signal === 'SIGHUP')
            return 128 + 1;
        if (signal === 'SIGINT')
            return 128 + 2;
        if (signal === 'SIGTERM')
            return 128 + 15;
        return 128;
    }
    setupProcessEventListeners() {
        // When the nx process gets a message, it will be sent into the task's process
        process.on('message', (message) => {
            this.processes.forEach((p) => {
                p.send(message);
            });
        });
        // Terminate any task processes on exit
        process.on('SIGINT', () => {
            this.processes.forEach((p) => {
                p.kill('SIGTERM');
            });
            // we exit here because we don't need to write anything to cache.
            process.exit();
        });
        process.on('SIGTERM', () => {
            this.processes.forEach((p) => {
                p.kill('SIGTERM');
            });
            // no exit here because we expect child processes to terminate which
            // will store results to the cache and will terminate this process
        });
        process.on('SIGHUP', () => {
            this.processes.forEach((p) => {
                p.kill('SIGTERM');
            });
            // no exit here because we expect child processes to terminate which
            // will store results to the cache and will terminate this process
        });
    }
}
exports.ForkedProcessTaskRunner = ForkedProcessTaskRunner;
function parseEnv(path) {
    try {
        const envContents = (0, fs_1.readFileSync)(path);
        return dotenv.parse(envContents);
    }
    catch (e) { }
}
const colors = [
    chalk.green,
    chalk.greenBright,
    chalk.red,
    chalk.redBright,
    chalk.cyan,
    chalk.cyanBright,
    chalk.yellow,
    chalk.yellowBright,
    chalk.magenta,
    chalk.magentaBright,
];
function getColor(projectName) {
    let code = 0;
    for (let i = 0; i < projectName.length; ++i) {
        code += projectName.charCodeAt(i);
    }
    const colorIndex = code % colors.length;
    return colors[colorIndex];
}
//# sourceMappingURL=forked-process-task-runner.js.map