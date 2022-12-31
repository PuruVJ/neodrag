/**
 * Builder for adding nodes and dependencies to a {@link ProjectGraph}
 */
import { ProjectGraph, ProjectGraphExternalNode, ProjectGraphProjectNode } from '../config/project-graph';
export declare class ProjectGraphBuilder {
    readonly graph: ProjectGraph;
    readonly removedEdges: {
        [source: string]: Set<string>;
    };
    constructor(g?: ProjectGraph);
    /**
     * Adds a project node to the project graph
     */
    addNode(node: ProjectGraphProjectNode): void;
    /**
     * Adds a external node to the project graph
     */
    addExternalNode(node: ProjectGraphExternalNode): void;
    /**
     * Adds a dependency from source project to target project
     */
    addImplicitDependency(sourceProjectName: string, targetProjectName: string): void;
    /**
     * Removes a dependency from source project to target project
     */
    removeDependency(sourceProjectName: string, targetProjectName: string): void;
    /**
     * Add an explicit dependency from a file in source project to target project
     */
    addExplicitDependency(sourceProjectName: string, sourceProjectFile: string, targetProjectName: string): void;
    /**
     * Set version of the project graph
     */
    setVersion(version: string): void;
    getUpdatedProjectGraph(): ProjectGraph;
    private calculateTargetDepsFromFiles;
    private calculateAlreadySetTargetDeps;
}
