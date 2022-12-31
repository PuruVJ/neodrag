"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectGraphBuilder = void 0;
/**
 * Builder for adding nodes and dependencies to a {@link ProjectGraph}
 */
const project_graph_1 = require("../config/project-graph");
class ProjectGraphBuilder {
    constructor(g) {
        this.removedEdges = {};
        if (g) {
            this.graph = g;
        }
        else {
            this.graph = {
                nodes: {},
                externalNodes: {},
                dependencies: {},
            };
        }
    }
    /**
     * Adds a project node to the project graph
     */
    addNode(node) {
        // Check if project with the same name already exists
        if (this.graph.nodes[node.name]) {
            // Throw if existing project is of a different type
            if (this.graph.nodes[node.name].type !== node.type) {
                throw new Error(`Multiple projects are named "${node.name}". One is of type "${node.type}" and the other is of type "${this.graph.nodes[node.name].type}". Please resolve the conflicting project names.`);
            }
        }
        this.graph.nodes[node.name] = node;
        this.graph.dependencies[node.name] = [];
    }
    /**
     * Adds a external node to the project graph
     */
    addExternalNode(node) {
        this.graph.externalNodes[node.name] = node;
    }
    /**
     * Adds a dependency from source project to target project
     */
    addImplicitDependency(sourceProjectName, targetProjectName) {
        if (sourceProjectName === targetProjectName) {
            return;
        }
        if (!this.graph.nodes[sourceProjectName]) {
            throw new Error(`Source project does not exist: ${sourceProjectName}`);
        }
        if (!this.graph.nodes[targetProjectName] &&
            !this.graph.externalNodes[targetProjectName]) {
            throw new Error(`Target project does not exist: ${targetProjectName}`);
        }
        this.graph.dependencies[sourceProjectName].push({
            source: sourceProjectName,
            target: targetProjectName,
            type: project_graph_1.DependencyType.implicit,
        });
    }
    /**
     * Removes a dependency from source project to target project
     */
    removeDependency(sourceProjectName, targetProjectName) {
        if (sourceProjectName === targetProjectName) {
            return;
        }
        if (!this.graph.nodes[sourceProjectName]) {
            throw new Error(`Source project does not exist: ${sourceProjectName}`);
        }
        if (!this.graph.nodes[targetProjectName] &&
            !this.graph.externalNodes[targetProjectName]) {
            throw new Error(`Target project does not exist: ${targetProjectName}`);
        }
        // this.graph.dependencies[sourceProjectName] = this.graph.dependencies[
        //   sourceProjectName
        // ].filter((d) => d.target !== targetProjectName);
        if (!this.removedEdges[sourceProjectName]) {
            this.removedEdges[sourceProjectName] = new Set();
        }
        this.removedEdges[sourceProjectName].add(targetProjectName);
    }
    /**
     * Add an explicit dependency from a file in source project to target project
     */
    addExplicitDependency(sourceProjectName, sourceProjectFile, targetProjectName) {
        if (sourceProjectName === targetProjectName) {
            return;
        }
        const source = this.graph.nodes[sourceProjectName];
        if (!source) {
            throw new Error(`Source project does not exist: ${sourceProjectName}`);
        }
        if (!this.graph.nodes[targetProjectName] &&
            !this.graph.externalNodes[targetProjectName]) {
            throw new Error(`Target project does not exist: ${targetProjectName}`);
        }
        const fileData = source.data.files.find((f) => f.file === sourceProjectFile);
        if (!fileData) {
            throw new Error(`Source project ${sourceProjectName} does not have a file: ${sourceProjectFile}`);
        }
        if (!fileData.deps) {
            fileData.deps = [];
        }
        if (!fileData.deps.find((t) => t === targetProjectName)) {
            fileData.deps.push(targetProjectName);
        }
    }
    /**
     * Set version of the project graph
     */
    setVersion(version) {
        this.graph.version = version;
    }
    getUpdatedProjectGraph() {
        for (const sourceProject of Object.keys(this.graph.nodes)) {
            const alreadySetTargetProjects = this.calculateAlreadySetTargetDeps(sourceProject);
            this.graph.dependencies[sourceProject] = [
                ...alreadySetTargetProjects.values(),
            ];
            const fileDeps = this.calculateTargetDepsFromFiles(sourceProject);
            for (const targetProject of fileDeps) {
                if (!alreadySetTargetProjects.has(targetProject)) {
                    if (!this.removedEdges[sourceProject] ||
                        !this.removedEdges[sourceProject].has(targetProject)) {
                        this.graph.dependencies[sourceProject].push({
                            source: sourceProject,
                            target: targetProject,
                            type: project_graph_1.DependencyType.static,
                        });
                    }
                }
            }
        }
        return this.graph;
    }
    calculateTargetDepsFromFiles(sourceProject) {
        const fileDeps = new Set();
        const files = this.graph.nodes[sourceProject].data.files;
        if (!files)
            return fileDeps;
        for (let f of files) {
            if (f.deps) {
                for (let p of f.deps) {
                    fileDeps.add(p);
                }
            }
        }
        return fileDeps;
    }
    calculateAlreadySetTargetDeps(sourceProject) {
        const alreadySetTargetProjects = new Map();
        const removed = this.removedEdges[sourceProject];
        for (const d of this.graph.dependencies[sourceProject]) {
            if (!removed || !removed.has(d.target)) {
                alreadySetTargetProjects.set(d.target, d);
            }
        }
        return alreadySetTargetProjects;
    }
}
exports.ProjectGraphBuilder = ProjectGraphBuilder;
//# sourceMappingURL=project-graph-builder.js.map