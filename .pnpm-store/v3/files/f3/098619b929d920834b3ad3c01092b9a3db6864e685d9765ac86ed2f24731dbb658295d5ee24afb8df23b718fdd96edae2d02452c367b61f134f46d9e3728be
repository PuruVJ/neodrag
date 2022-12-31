import { ProjectGraphProcessor } from '../config/project-graph';
import { PackageJson } from './package-json';
import { ProjectConfiguration, TargetConfiguration } from '../config/workspace-json-project-json';
export declare type ProjectTargetConfigurator = (file: string) => Record<string, TargetConfiguration>;
/**
 * A plugin for Nx
 */
export interface NxPlugin {
    name: string;
    processProjectGraph?: ProjectGraphProcessor;
    registerProjectTargets?: ProjectTargetConfigurator;
    /**
     * A glob pattern to search for non-standard project files.
     * @example: ["*.csproj", "pom.xml"]
     */
    projectFilePatterns?: string[];
}
export declare function loadNxPlugins(plugins?: string[], paths?: string[], root?: string): NxPlugin[];
export declare function mergePluginTargetsWithNxTargets(projectRoot: string, targets: Record<string, TargetConfiguration>, plugins: NxPlugin[]): Record<string, TargetConfiguration>;
export declare function readPluginPackageJson(pluginName: string, paths?: string[]): {
    path: string;
    json: PackageJson;
};
export declare function resolveLocalNxPlugin(importPath: string, root?: string): {
    path: string;
    projectConfig: ProjectConfiguration;
} | null;
