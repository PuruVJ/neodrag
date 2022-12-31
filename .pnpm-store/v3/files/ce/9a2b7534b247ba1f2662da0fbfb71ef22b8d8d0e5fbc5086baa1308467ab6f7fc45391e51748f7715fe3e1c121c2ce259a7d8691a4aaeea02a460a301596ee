import { ProjectGraph } from '../config/project-graph';
import { PackageJson } from './package-json';
/**
 * Creates a package.json in the output directory for support to install dependencies within containers.
 *
 * If a package.json exists in the project, it will reuse that.
 * If isProduction flag is set, it wil  remove devDependencies and optional peerDependencies
 */
export declare function createPackageJson(projectName: string, graph: ProjectGraph, options?: {
    root?: string;
    isProduction?: boolean;
}): PackageJson;
