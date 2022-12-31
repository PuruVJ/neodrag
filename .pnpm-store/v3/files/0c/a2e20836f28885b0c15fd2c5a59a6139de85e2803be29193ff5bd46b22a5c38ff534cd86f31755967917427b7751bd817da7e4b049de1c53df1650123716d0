"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceIntegrityChecks = void 0;
const output_1 = require("../utils/output");
const file_utils_1 = require("../project-graph/file-utils");
const fileutils_1 = require("../utils/fileutils");
const path_1 = require("../utils/path");
const semver_1 = require("semver");
class WorkspaceIntegrityChecks {
    constructor(projectGraph, files) {
        this.projectGraph = projectGraph;
        this.files = files;
        this.nxPackageJson = (0, fileutils_1.readJsonFile)((0, path_1.joinPathFragments)(__dirname, '../../package.json'));
    }
    run() {
        const errors = [
            ...this.projectWithoutFilesCheck(),
            ...this.filesWithoutProjects(),
        ];
        const warnings = [];
        // @todo(AgentEnder) - Remove this check after v15
        if ((0, semver_1.gte)(this.nxPackageJson.version, '15.0.0')) {
            errors.push(...this.misalignedPackages());
        }
        else {
            warnings.push(...this.misalignedPackages());
        }
        return {
            error: errors,
            warn: warnings,
        };
    }
    projectWithoutFilesCheck() {
        const errors = Object.values(this.projectGraph.nodes)
            .filter((n) => n.data.files.length === 0)
            .map((p) => `Cannot find project '${p.name}' in '${p.data.root}'`);
        const errorGroupBodyLines = errors.map((f) => `${output_1.output.dim('-')} ${f}`);
        return errors.length === 0
            ? []
            : [
                {
                    title: `The ${(0, file_utils_1.workspaceFileName)()} file is out of sync`,
                    bodyLines: errorGroupBodyLines,
                    /**
                     * TODO(JamesHenry): Add support for error documentation
                     */
                    // slug: 'project-has-no-files'
                },
            ];
    }
    filesWithoutProjects() {
        const allFilesFromProjects = this.allProjectFiles();
        const allFilesWithoutProjects = minus(this.files, allFilesFromProjects);
        const first5FilesWithoutProjects = allFilesWithoutProjects.length > 5
            ? allFilesWithoutProjects.slice(0, 5)
            : allFilesWithoutProjects;
        const errorGroupBodyLines = first5FilesWithoutProjects.map((f) => `${output_1.output.dim('-')} ${f}`);
        return first5FilesWithoutProjects.length === 0
            ? []
            : [
                {
                    title: `The following file(s) do not belong to any projects:`,
                    bodyLines: errorGroupBodyLines,
                    /**
                     * TODO(JamesHenry): Add support for error documentation
                     */
                    // slug: 'file-does-not-belong-to-project'
                },
            ];
    }
    misalignedPackages() {
        var _a, _b;
        const bodyLines = [];
        let migrateTarget = this.nxPackageJson.version;
        for (const pkg of this.nxPackageJson['nx-migrations'].packageGroup) {
            const packageName = typeof pkg === 'string' ? pkg : pkg.package;
            if (typeof pkg === 'string' || pkg.version === '*') {
                // should be aligned
                const installedVersion = (_b = (_a = this.projectGraph.externalNodes['npm:' + packageName]) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.version;
                if (installedVersion &&
                    installedVersion !== this.nxPackageJson.version) {
                    if ((0, semver_1.valid)(installedVersion) && (0, semver_1.gt)(installedVersion, migrateTarget)) {
                        migrateTarget = installedVersion;
                    }
                    bodyLines.push(`- ${packageName}@${installedVersion}`);
                }
            }
        }
        return bodyLines.length
            ? [
                {
                    title: 'Some packages have misaligned versions!',
                    bodyLines: [
                        'These packages should match your installed version of Nx.',
                        ...bodyLines,
                        '',
                        `You should be able to fix this by running \`nx migrate ${migrateTarget}\``,
                    ],
                    // slug: 'nx-misaligned-versions',
                },
            ]
            : [];
    }
    allProjectFiles() {
        return Object.values(this.projectGraph.nodes).reduce((m, c) => [...m, ...c.data.files.map((f) => f.file)], []);
    }
}
exports.WorkspaceIntegrityChecks = WorkspaceIntegrityChecks;
function minus(a, b) {
    return a.filter((aa) => b.indexOf(aa) === -1);
}
//# sourceMappingURL=workspace-integrity-checks.js.map