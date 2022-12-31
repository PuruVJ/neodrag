import { CLIWarnMessageConfig } from '../utils/output';
import type { CLIErrorMessageConfig } from '../utils/output';
import { ProjectGraph } from '../config/project-graph';
export declare class WorkspaceIntegrityChecks {
    private projectGraph;
    private files;
    nxPackageJson: {
        name: string;
        version: string;
        private: boolean;
        description: string;
        repository: {
            type: string;
            url: string;
            directory: string;
        };
        scripts: {
            postinstall: string;
        };
        keywords: string[];
        bin: {
            nx: string;
        };
        author: string;
        license: string;
        bugs: {
            url: string;
        };
        homepage: string;
        dependencies: {
            "@parcel/watcher": string;
            "@yarnpkg/lockfile": string;
            "@yarnpkg/parsers": string;
            "@zkochan/js-yaml": string;
            axios: string;
            chalk: string;
            chokidar: string;
            "cli-cursor": string;
            "cli-spinners": string;
            cliui: string;
            dotenv: string;
            enquirer: string;
            "fast-glob": string;
            figures: string;
            flat: string;
            "fs-extra": string;
            glob: string;
            ignore: string;
            "js-yaml": string;
            "jsonc-parser": string;
            minimatch: string;
            "npm-run-path": string;
            open: string;
            semver: string;
            "string-width": string;
            "strong-log-transformer": string;
            "tar-stream": string;
            tmp: string;
            "tsconfig-paths": string;
            tslib: string;
            "v8-compile-cache": string;
            yargs: string;
            "yargs-parser": string;
        };
        peerDependencies: {
            "@swc-node/register": string;
            "@swc/core": string;
        };
        peerDependenciesMeta: {
            "@swc-node/register": {
                optional: boolean;
            };
            "@swc/core": {
                optional: boolean;
            };
        };
        "nx-migrations": {
            migrations: string;
            packageGroup: (string | {
                package: string;
                version: string;
            })[];
        };
        executors: string;
        builders: string;
        publishConfig: {
            access: string;
        };
    };
    constructor(projectGraph: ProjectGraph, files: string[]);
    run(): {
        error: CLIErrorMessageConfig[];
        warn: CLIWarnMessageConfig[];
    };
    private projectWithoutFilesCheck;
    private filesWithoutProjects;
    misalignedPackages(): CLIErrorMessageConfig[];
    private allProjectFiles;
}
