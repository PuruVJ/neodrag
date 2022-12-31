import { ProjectGraph, ProjectGraphExternalNode, ProjectGraphNode, ProjectGraphProjectNode } from '../config/project-graph';
/**
 * Returns a new project graph where all the edges are reversed.
 *
 * For instance, if project A depends on B, in the reversed graph
 * B will depend on A.
 */
export declare function reverse(graph: ProjectGraph): ProjectGraph;
export declare function filterNodes(predicate?: (n: ProjectGraphNode) => boolean): (p: ProjectGraph) => ProjectGraph;
export declare function isNpmProject(project: ProjectGraphNode): project is ProjectGraphExternalNode;
export declare const pruneExternalNodes: (p: ProjectGraph) => ProjectGraph;
export declare function withDeps(original: ProjectGraph, subsetNodes: ProjectGraphProjectNode[]): ProjectGraph;
