import { Ignore } from 'ignore';
import type { NxJsonConfiguration } from './nx-json';
import { ProjectConfiguration, ProjectsConfigurations } from './workspace-json-project-json';
import { ExecutorConfig, Generator } from './misc-interfaces';
export declare function workspaceConfigName(root: string): 'angular.json' | 'workspace.json' | null;
export declare class Workspaces {
    private root;
    private cachedWorkspaceConfig;
    constructor(root: string);
    relativeCwd(cwd: string): string;
    calculateDefaultProjectName(cwd: string, wc: ProjectsConfigurations & NxJsonConfiguration): string;
    readWorkspaceConfiguration(opts?: {
        _ignorePluginInference?: boolean;
    }): ProjectsConfigurations & NxJsonConfiguration;
    private mergeWorkspaceJsonAndGlobProjects;
    private mergeTargetDefaultsIntoProjectDescriptions;
    isNxExecutor(nodeModule: string, executor: string): boolean;
    isNxGenerator(collectionName: string, generatorName: string): boolean;
    readExecutor(nodeModule: string, executor: string): ExecutorConfig & {
        isNgCompat: boolean;
    };
    readGenerator(collectionName: string, generatorName: string): {
        resolvedCollectionName: string;
        normalizedGeneratorName: string;
        schema: any;
        implementationFactory: () => Generator<unknown>;
        isNgCompat: boolean;
        aliases: string[];
    };
    hasNxJson(): boolean;
    readNxJson(): NxJsonConfiguration;
    private mergeTargetDefaultsAndTargetDependencies;
    private getImplementationFactory;
    private readExecutorsJson;
    private readGeneratorsJson;
    private resolvePaths;
    private readFromWorkspaceJson;
}
export declare function reformattedWorkspaceJsonOrNull(w: any): any;
export declare function toNewFormat(w: any): ProjectsConfigurations;
export declare function toNewFormatOrNull(w: any): any;
export declare function toOldFormatOrNull(w: any): any;
export declare function resolveOldFormatWithInlineProjects(w: any, root?: string): any;
export declare function resolveNewFormatWithInlineProjects(w: any, root?: string): ProjectsConfigurations;
/**
 * Reads an nx.json file from a given path or extends a local nx.json config.
 */
/**
 * Pulled from toFileName in names from @nrwl/devkit.
 * Todo: Should refactor, not duplicate.
 */
export declare function toProjectName(fileName: string): string;
export declare function getGlobPatternsFromPlugins(nxJson: NxJsonConfiguration, paths: string[], root?: string): string[];
/**
 * Get the package.json globs from package manager workspaces
 */
export declare function getGlobPatternsFromPackageManagerWorkspaces(root: string): string[];
export declare function globForProjectFiles(root: any, nxJson?: NxJsonConfiguration, ignorePluginInference?: boolean): string[];
export declare function deduplicateProjectFiles(files: string[], ig?: Ignore): string[];
export declare function inferProjectFromNonStandardFile(file: string, nxJson: NxJsonConfiguration): ProjectConfiguration & {
    name: string;
};
export declare function buildWorkspaceConfigurationFromGlobs(nxJson: NxJsonConfiguration, projectFiles: string[], // making this parameter allows devkit to pick up newly created projects
readJson?: <T extends Object>(string: any) => T): ProjectsConfigurations;
export declare function renamePropertyWithStableKeys(obj: any, from: string, to: string): void;
