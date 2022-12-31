"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrunnedHash = exports.hashExternalNodes = exports.hashString = void 0;
const hashing_impl_1 = require("../../hasher/hashing-impl");
/**
 * Apply simple hashing of the content using the default hashing implementation
 * @param fileContent
 * @returns
 */
function hashString(fileContent) {
    return hashing_impl_1.defaultHashing.hashArray([fileContent]);
}
exports.hashString = hashString;
/**
 * Hash partial graph's external nodes
 * for task graph caching
 * @param projectGraph
 */
function hashExternalNodes(projectGraph) {
    Object.keys(projectGraph.externalNodes).forEach((key) => {
        if (!projectGraph.externalNodes[key].data.hash) {
            // hash it using it's dependencies
            hashExternalNode(projectGraph.externalNodes[key], projectGraph);
        }
    });
}
exports.hashExternalNodes = hashExternalNodes;
function hashExternalNode(node, graph) {
    const hashKey = `${node.data.packageName}@${node.data.version}`;
    if (!graph.dependencies[node.name]) {
        node.data.hash = hashString(hashKey);
    }
    else {
        // collect all dependencies' hashes
        const externalDependencies = traverseExternalNodesDependencies(node.name, graph, new Set([hashKey]));
        node.data.hash = hashing_impl_1.defaultHashing.hashArray(Array.from(externalDependencies).sort());
    }
}
function traverseExternalNodesDependencies(projectName, graph, visited) {
    graph.dependencies[projectName].forEach((d) => {
        const target = graph.externalNodes[d.target];
        if (!target) {
            return;
        }
        const targetKey = `${target.data.packageName}@${target.data.version}`;
        if (!visited.has(targetKey)) {
            visited.add(targetKey);
            if (graph.dependencies[d.target]) {
                traverseExternalNodesDependencies(d.target, graph, visited);
            }
        }
    });
    return visited;
}
/**
 * Generate new hash based on the original hash and pruning input parameters - packages and project name
 * @param originalHash
 * @param packages
 * @param projectName
 * @returns
 */
function generatePrunnedHash(originalHash, normalizedPackageJson) {
    const hashingInput = [originalHash, JSON.stringify(normalizedPackageJson)];
    return hashing_impl_1.defaultHashing.hashArray(hashingInput);
}
exports.generatePrunnedHash = generatePrunnedHash;
//# sourceMappingURL=hashing.js.map