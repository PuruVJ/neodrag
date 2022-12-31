"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertWorkspaceValidity = void 0;
const strip_indents_1 = require("./strip-indents");
function assertWorkspaceValidity(workspaceJson, nxJson) {
    const workspaceJsonProjects = Object.keys(workspaceJson.projects);
    const projects = Object.assign({}, workspaceJson.projects);
    const invalidImplicitDependencies = new Map();
    Object.entries(nxJson.implicitDependencies || {})
        .reduce((acc, entry) => {
        function recur(value, acc = [], path) {
            if (value === '*') {
                // do nothing since '*' is calculated and always valid.
            }
            else if (typeof value === 'string') {
                // This is invalid because the only valid string is '*'
                throw new Error((0, strip_indents_1.stripIndents) `
         Configuration Error 
         nx.json is not configured properly. "${path.join(' > ')}" is improperly configured to implicitly depend on "${value}" but should be an array of project names or "*".
          `);
            }
            else if (Array.isArray(value)) {
                acc.push([entry[0], value]);
            }
            else {
                Object.entries(value).forEach(([k, v]) => {
                    recur(v, acc, [...path, k]);
                });
            }
        }
        recur(entry[1], acc, [entry[0]]);
        return acc;
    }, [])
        .reduce((map, [filename, projectNames]) => {
        detectAndSetInvalidProjectValues(map, filename, projectNames, projects);
        return map;
    }, invalidImplicitDependencies);
    workspaceJsonProjects
        .filter((projectName) => {
        const project = projects[projectName];
        return !!project.implicitDependencies;
    })
        .reduce((map, projectName) => {
        const project = projects[projectName];
        detectAndSetInvalidProjectValues(map, projectName, project.implicitDependencies, projects);
        return map;
    }, invalidImplicitDependencies);
    if (invalidImplicitDependencies.size === 0) {
        return;
    }
    let message = `The following implicitDependencies specified in project configurations are invalid:\n`;
    message += [...invalidImplicitDependencies.keys()]
        .map((key) => {
        const projectNames = invalidImplicitDependencies.get(key);
        return `  ${key}\n${projectNames
            .map((projectName) => `    ${projectName}`)
            .join('\n')}`;
    })
        .join('\n\n');
    throw new Error(`Configuration Error\n${message}`);
}
exports.assertWorkspaceValidity = assertWorkspaceValidity;
function detectAndSetInvalidProjectValues(map, sourceName, desiredImplicitDeps, validProjects) {
    const invalidProjects = desiredImplicitDeps.filter((implicit) => {
        const projectName = implicit.startsWith('!')
            ? implicit.substring(1)
            : implicit;
        return !validProjects[projectName];
    });
    if (invalidProjects.length > 0) {
        map.set(sourceName, invalidProjects);
    }
}
//# sourceMappingURL=assert-workspace-validity.js.map