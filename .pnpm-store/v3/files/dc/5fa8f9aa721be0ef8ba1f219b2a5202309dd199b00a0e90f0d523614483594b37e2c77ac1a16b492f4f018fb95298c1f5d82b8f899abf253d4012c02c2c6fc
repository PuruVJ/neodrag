"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTargetsAndProjects = exports.formatFlags = void 0;
const output_1 = require("../../utils/output");
function formatFlags(leftPadding, flag, value) {
    return flag == '_'
        ? `${leftPadding}  ${value.join(' ')}`
        : `${leftPadding}  --${flag}=${formatValue(value)}`;
}
exports.formatFlags = formatFlags;
function formatValue(value) {
    if (Array.isArray(value)) {
        return `[${value.join(',')}]`;
    }
    else if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    else {
        return value;
    }
}
function formatTargetsAndProjects(projectNames, targets, tasks) {
    if (tasks.length === 1)
        return `target ${targets[0]} for project ${projectNames[0]}`;
    let text;
    const project = projectNames.length === 1
        ? `project ${projectNames[0]}`
        : `${projectNames.length} projects`;
    if (targets.length === 1) {
        text = `target ${output_1.output.bold(targets[0])} for ${project}`;
    }
    else {
        text = `targets ${targets
            .map((t) => output_1.output.bold(t))
            .join(', ')} for ${project}`;
    }
    const dependentTasks = tasks.filter((t) => projectNames.indexOf(t.target.project) === -1 ||
        targets.indexOf(t.target.target) === -1).length;
    if (dependentTasks > 0) {
        text += ` and ${output_1.output.bold(dependentTasks)} ${dependentTasks === 1 ? 'task' : 'tasks'} ${projectNames.length === 1 ? 'it depends on' : 'they depend on'}`;
    }
    return text;
}
exports.formatTargetsAndProjects = formatTargetsAndProjects;
//# sourceMappingURL=formatting-utils.js.map