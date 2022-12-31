import { ProjectGraph, ProjectGraphProjectNode } from '../config/project-graph';
import { TargetConfiguration } from '../config/workspace-json-project-json';
export declare function projectHasTarget(project: ProjectGraphProjectNode, target: string): boolean;
export declare function projectHasTargetAndConfiguration(project: ProjectGraphProjectNode, target: string, configuration: string): any;
export declare function mergeNpmScriptsWithTargets(projectRoot: string, targets: any): Record<string, TargetConfiguration>;
export declare function getSourceDirOfDependentProjects(projectName: string, projectGraph?: ProjectGraph<import("../config/workspace-json-project-json").ProjectConfiguration>): [projectDirs: string[], warnings: string[]];
/**
 * Find all internal project dependencies.
 * All the external (npm) dependencies will be filtered out
 * @param {string} parentNodeName
 * @param {ProjectGraph} projectGraph
 * @returns {string[]}
 */
export declare function findAllProjectNodeDependencies(parentNodeName: string, projectGraph?: ProjectGraph<import("../config/workspace-json-project-json").ProjectConfiguration>): string[];
