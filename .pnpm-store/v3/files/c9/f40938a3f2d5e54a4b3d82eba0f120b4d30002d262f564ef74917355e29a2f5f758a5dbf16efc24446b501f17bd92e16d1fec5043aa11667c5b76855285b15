"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRunOneDynamicOutputRenderer = void 0;
const tslib_1 = require("tslib");
const cliCursor = require("cli-cursor");
const cli_spinners_1 = require("cli-spinners");
const os_1 = require("os");
const readline = require("readline");
const output_1 = require("../../utils/output");
const pretty_time_1 = require("./pretty-time");
const formatting_utils_1 = require("./formatting-utils");
const view_logs_utils_1 = require("./view-logs-utils");
/**
 * The following function is responsible for creating a life cycle with dynamic
 * outputs, meaning previous outputs can be rewritten or modified as new outputs
 * are added. It is therefore intended for use on a user's local machines.
 *
 * In CI environments the static equivalent of this life cycle should be used.
 *
 * NOTE: output.dim() should be preferred over output.colors.gray() because it
 * is much more consistently readable across different terminal color themes.
 */
function createRunOneDynamicOutputRenderer({ initiatingProject, tasks, args, overrides, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        cliCursor.hide();
        let resolveRenderIsDonePromise;
        const renderIsDone = new Promise((resolve) => (resolveRenderIsDonePromise = resolve)).then(() => {
            clearRenderInterval();
            cliCursor.show();
        });
        function clearRenderInterval() {
            if (renderDependentTargetsIntervalId) {
                clearInterval(renderDependentTargetsIntervalId);
            }
        }
        process.on('exit', () => clearRenderInterval());
        process.on('SIGINT', () => clearRenderInterval());
        process.on('SIGTERM', () => clearRenderInterval());
        process.on('SIGHUP', () => clearRenderInterval());
        const lifeCycle = {};
        const start = process.hrtime();
        const figures = yield Promise.resolve().then(() => require('figures'));
        let state = 'EXECUTING_DEPENDENT_TARGETS';
        const tasksToTerminalOutputs = {};
        const totalTasks = tasks.length;
        const totalDependentTasks = totalTasks - 1;
        const totalTasksFromInitiatingProject = tasks.filter((t) => t.target.project === initiatingProject).length;
        // Tasks from the initiating project are treated differently, they forward their output
        const totalDependentTasksNotFromInitiatingProject = totalTasks - totalTasksFromInitiatingProject;
        const targetName = args.target;
        let dependentTargetsNumLines = 0;
        let totalCompletedTasks = 0;
        let totalSuccessfulTasks = 0;
        let totalFailedTasks = 0;
        let totalCachedTasks = 0;
        // Used to control the rendering of the spinner
        let dependentTargetsCurrentFrame = 0;
        let renderDependentTargetsIntervalId;
        const clearDependentTargets = () => {
            for (let i = 0; i < dependentTargetsNumLines; i++) {
                readline.moveCursor(process.stdout, 0, -1);
                readline.clearLine(process.stdout, 0);
            }
        };
        const renderLines = (lines, dividerColor = 'cyan', renderDivider = true, skipPadding = false) => {
            let additionalLines = 0;
            if (renderDivider) {
                output_1.output.addVerticalSeparator(dividerColor);
                additionalLines += 3;
            }
            if (renderDivider) {
                lines.push('');
            }
            for (const line of lines) {
                process.stdout.write((skipPadding ? '' : output_1.output.X_PADDING) + line + os_1.EOL);
            }
            dependentTargetsNumLines = lines.length + additionalLines;
        };
        const renderDependentTargets = (renderDivider = true) => {
            if (totalDependentTasksNotFromInitiatingProject <= 0) {
                return;
            }
            const max = cli_spinners_1.dots.frames.length - 1;
            const curr = dependentTargetsCurrentFrame;
            dependentTargetsCurrentFrame = curr >= max ? 0 : curr + 1;
            const linesToRender = [''];
            const remainingDependentTasksNotFromInitiatingProject = totalDependentTasksNotFromInitiatingProject - totalCompletedTasks;
            switch (state) {
                case 'EXECUTING_DEPENDENT_TARGETS':
                    if (totalFailedTasks === 0) {
                        linesToRender.push(`   ${output_1.output.colors.cyan(cli_spinners_1.dots.frames[dependentTargetsCurrentFrame])}    ${output_1.output.dim(`Nx is waiting on ${remainingDependentTasksNotFromInitiatingProject} dependent project tasks before running tasks from`)} ${initiatingProject}${output_1.output.dim('...')}`);
                        if (totalSuccessfulTasks > 0) {
                            linesToRender.push('');
                        }
                    }
                    break;
            }
            if (totalFailedTasks > 0) {
                linesToRender.push(output_1.output.colors.red.dim(`   ${output_1.output.colors.red(figures.cross)}    ${totalFailedTasks}${`/${totalCompletedTasks}`} dependent project tasks failed (see below)`));
            }
            if (totalSuccessfulTasks > 0) {
                linesToRender.push(output_1.output.dim(`   ${output_1.output.dim(figures.tick)}    ${totalSuccessfulTasks}${`/${totalCompletedTasks}`} dependent project tasks succeeded ${output_1.output.dim(`[${totalCachedTasks} read from cache]`)}`));
            }
            clearDependentTargets();
            if (linesToRender.length > 1) {
                renderLines(linesToRender, 'gray', renderDivider && state !== 'EXECUTING_DEPENDENT_TARGETS', true);
            }
            else {
                renderLines([]);
            }
        };
        lifeCycle.startCommand = () => {
            renderDependentTargets();
        };
        lifeCycle.startTasks = (tasks) => {
            for (const task of tasks) {
                // Move from the dependent project tasks phase to the initiating project's targets
                if (task.target.project === initiatingProject &&
                    state !== 'EXECUTING_INITIATING_PROJECT_TARGET') {
                    state = 'EXECUTING_INITIATING_PROJECT_TARGET';
                    clearRenderInterval();
                    renderDependentTargets(false);
                    if (totalDependentTasksNotFromInitiatingProject > 0) {
                        output_1.output.addNewline();
                        process.stdout.write(`   ${output_1.output.dim('Hint: you can run the command with')} --verbose ${output_1.output.dim('to see the full dependent project outputs')}` + os_1.EOL);
                        output_1.output.addVerticalSeparator('gray');
                    }
                }
            }
            if (!renderDependentTargetsIntervalId &&
                state === 'EXECUTING_DEPENDENT_TARGETS') {
                renderDependentTargetsIntervalId = setInterval(renderDependentTargets, 100);
            }
        };
        lifeCycle.printTaskTerminalOutput = (task, cacheStatus, terminalOutput) => {
            if (task.target.project === initiatingProject) {
                output_1.output.logCommand(task.id, cacheStatus);
                output_1.output.addNewline();
                process.stdout.write(terminalOutput);
            }
            else {
                tasksToTerminalOutputs[task.id] = terminalOutput;
            }
        };
        lifeCycle.endTasks = (taskResults) => {
            for (let t of taskResults) {
                totalCompletedTasks++;
                switch (t.status) {
                    case 'remote-cache':
                    case 'local-cache':
                    case 'local-cache-kept-existing':
                        totalCachedTasks++;
                        totalSuccessfulTasks++;
                        break;
                    case 'success':
                        totalSuccessfulTasks++;
                        break;
                    case 'failure':
                        totalFailedTasks++;
                        /**
                         * A dependent project has failed so we stop executing and update the relevant
                         * dependent project task messaging
                         */
                        if (t.task.target.project !== initiatingProject) {
                            clearRenderInterval();
                            renderDependentTargets(false);
                            output_1.output.addVerticalSeparator('red');
                            output_1.output.logCommand(t.task.id, t.status);
                            output_1.output.addNewline();
                            process.stdout.write(tasksToTerminalOutputs[t.task.id]);
                        }
                        break;
                }
                delete tasksToTerminalOutputs[t.task.id];
            }
        };
        lifeCycle.endCommand = () => {
            clearRenderInterval();
            const timeTakenText = (0, pretty_time_1.prettyTime)(process.hrtime(start));
            if (totalSuccessfulTasks === totalTasks) {
                state = 'COMPLETED_SUCCESSFULLY';
                const text = `Successfully ran ${(0, formatting_utils_1.formatTargetsAndProjects)([initiatingProject], [tasks[0].target.target], tasks)}`;
                const taskOverridesLines = [];
                if (Object.keys(overrides).length > 0) {
                    const leftPadding = `${output_1.output.X_PADDING}       `;
                    taskOverridesLines.push('');
                    taskOverridesLines.push(`${leftPadding}${output_1.output.dim.green('With additional flags:')}`);
                    Object.entries(overrides)
                        .map(([flag, value]) => output_1.output.dim.green((0, formatting_utils_1.formatFlags)(leftPadding, flag, value)))
                        .forEach((arg) => taskOverridesLines.push(arg));
                }
                const pinnedFooterLines = [
                    output_1.output.applyNxPrefix('green', output_1.output.colors.green(text) + output_1.output.dim(` (${timeTakenText})`)),
                    ...taskOverridesLines,
                ];
                if (totalCachedTasks > 0) {
                    pinnedFooterLines.push(output_1.output.dim(`${os_1.EOL}   Nx read the output from the cache instead of running the command for ${totalCachedTasks} out of ${totalTasks} tasks.`));
                }
                renderLines(pinnedFooterLines, 'green');
            }
            else {
                state = 'COMPLETED_WITH_ERRORS';
                let text = `Ran target ${output_1.output.bold(targetName)} for project ${output_1.output.bold(initiatingProject)}`;
                if (totalDependentTasks > 0) {
                    text += ` and ${output_1.output.bold(totalDependentTasks)} task(s) they depend on`;
                }
                const taskOverridesLines = [];
                if (Object.keys(overrides).length > 0) {
                    const leftPadding = `${output_1.output.X_PADDING}       `;
                    taskOverridesLines.push('');
                    taskOverridesLines.push(`${leftPadding}${output_1.output.dim.red('With additional flags:')}`);
                    Object.entries(overrides)
                        .map(([flag, value]) => output_1.output.dim.red((0, formatting_utils_1.formatFlags)(leftPadding, flag, value)))
                        .forEach((arg) => taskOverridesLines.push(arg));
                }
                const viewLogs = (0, view_logs_utils_1.viewLogsFooterRows)(totalFailedTasks);
                renderLines([
                    output_1.output.applyNxPrefix('red', output_1.output.colors.red(text) + output_1.output.dim(` (${timeTakenText})`)),
                    ...taskOverridesLines,
                    '',
                    `   ${output_1.output.colors.red(figures.cross)}    ${totalFailedTasks}${`/${totalCompletedTasks}`} failed`,
                    `   ${output_1.output.dim(figures.tick)}    ${totalSuccessfulTasks}${`/${totalCompletedTasks}`} succeeded ${output_1.output.dim(`[${totalCachedTasks} read from cache]`)}`,
                    ...viewLogs,
                ], 'red');
            }
            resolveRenderIsDonePromise();
        };
        return { lifeCycle, renderIsDone };
    });
}
exports.createRunOneDynamicOutputRenderer = createRunOneDynamicOutputRenderer;
//# sourceMappingURL=dynamic-run-one-terminal-output-life-cycle.js.map