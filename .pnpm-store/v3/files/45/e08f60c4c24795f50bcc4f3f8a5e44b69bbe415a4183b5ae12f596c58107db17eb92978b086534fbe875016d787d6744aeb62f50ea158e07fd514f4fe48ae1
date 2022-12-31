import type { NxJsonConfiguration } from '../../config/nx-json';
import { ProjectConfiguration, ProjectsConfigurations } from '../../config/workspace-json-project-json';
import type { Tree } from '../tree';
export declare type WorkspaceConfiguration = Omit<ProjectsConfigurations, 'projects'> & Partial<NxJsonConfiguration>;
/**
 * Adds project configuration to the Nx workspace.
 *
 * The project configuration is stored in workspace.json or the associated project.json file.
 * The utility will update either files.
 *
 * @param tree - the file system tree
 * @param projectName - unique name. Often directories are part of the name (e.g., mydir-mylib)
 * @param projectConfiguration - project configuration
 * @param standalone - should the project use package.json? If false, the project config is inside workspace.json
 */
export declare function addProjectConfiguration(tree: Tree, projectName: string, projectConfiguration: ProjectConfiguration, standalone?: boolean): void;
/**
 * Updates the configuration of an existing project.
 *
 * The project configuration is stored in workspace.json or the associated project.json file.
 * The utility will update either files.
 *
 * @param tree - the file system tree
 * @param projectName - unique name. Often directories are part of the name (e.g., mydir-mylib)
 * @param projectConfiguration - project configuration
 */
export declare function updateProjectConfiguration(tree: Tree, projectName: string, projectConfiguration: ProjectConfiguration): void;
/**
 * Removes the configuration of an existing project.
 *
 * The project configuration is stored in workspace.json or the associated project.json file.
 * The utility will update either file.
 */
export declare function removeProjectConfiguration(tree: Tree, projectName: string): void;
/**
 * Get a map of all projects in a workspace.
 *
 * Use {@link readProjectConfiguration} if only one project is needed.
 */
export declare function getProjects(tree: Tree): Map<string, ProjectConfiguration>;
/**
 * Read general workspace configuration such as the default project or cli settings
 *
 * This does _not_ provide projects configuration, use {@link readProjectConfiguration} instead.
 */
export declare function readWorkspaceConfiguration(tree: Tree): WorkspaceConfiguration;
/**
 * Update general workspace configuration such as the default project or cli settings.
 *
 * This does _not_ update projects configuration, use {@link updateProjectConfiguration} or {@link addProjectConfiguration} instead.
 */
export declare function updateWorkspaceConfiguration(tree: Tree, workspaceConfig: WorkspaceConfiguration): void;
/**
 * Reads a project configuration.
 *
 * The project configuration is stored in workspace.json or the associated project.json file.
 * The utility will read from either file.
 *
 * @param tree - the file system tree
 * @param projectName - unique name. Often directories are part of the name (e.g., mydir-mylib)
 * @throws If supplied projectName cannot be found
 */
export declare function readProjectConfiguration(tree: Tree, projectName: string): ProjectConfiguration;
export declare function readNxJson(tree: Tree): NxJsonConfiguration | null;
/**
 * Returns if a project has a standalone configuration (project.json).
 *
 * @param tree - the file system tree
 * @param project - the project name
 */
export declare function isStandaloneProject(tree: Tree, project: string): boolean;
export declare function getRelativeProjectJsonSchemaPath(tree: Tree, project: ProjectConfiguration): string;
/**
 * Read the workspace configuration, including projects.
 */
export declare function readWorkspace(tree: Tree): ProjectsConfigurations;
export declare function shouldDefaultToUsingStandaloneConfigs(tree: Tree): boolean;
export declare function getWorkspacePath(tree: Tree): '/angular.json' | '/workspace.json' | null;
