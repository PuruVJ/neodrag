import { ProjectGraph, ProjectGraphV4 } from '../config/project-graph';
import { ProjectConfiguration, ProjectsConfigurations } from '../config/workspace-json-project-json';
/**
 * Synchronously reads the latest cached copy of the workspace's ProjectGraph.
 * @throws {Error} if there is no cached ProjectGraph to read from
 */
export declare function readCachedProjectGraph(): ProjectGraph<ProjectConfiguration>;
export declare function readCachedProjectConfiguration(projectName: string): ProjectConfiguration;
export declare function readProjectsConfigurationFromProjectGraph(projectGraph: ProjectGraph<ProjectConfiguration>): ProjectsConfigurations;
export declare function buildProjectGraphWithoutDaemon(): Promise<ProjectGraph<any>>;
/**
 * Computes and returns a ProjectGraph.
 *
 * Nx will compute the graph either in a daemon process or in the current process.
 *
 * Nx will compute it in the current process if:
 * * The process is running in CI (CI env variable is to true or other common variables used by CI providers are set).
 * * It is running in the docker container.
 * * The daemon process is disabled because of the previous error when starting the daemon.
 * * `NX_DAEMON` is set to `false`.
 * * `useDaemon` is set to false in `nx.json`
 *
 * `NX_DAEMON` env variable takes precedence:
 * * If it is set to true, the daemon will always be used.
 * * If it is set to false, the graph will always be computed in the current process.
 *
 * Tip: If you want to debug project graph creation, run your command with NX_DAEMON=false.
 *
 * Nx uses two layers of caching: the information about explicit dependencies stored on the disk and the information
 * stored in the daemon process. To reset both run: `nx reset`.
 */
export declare function createProjectGraphAsync(opts?: {
    exitOnError: boolean;
    resetDaemonClient?: boolean;
}): Promise<ProjectGraph>;
/**
 * Backwards compatibility adapter for project graph
 * @param {string} sourceVersion
 * @param {string} targetVersion
 * @param projectGraph
 * @param {ProjectGraph} projectGraph
 * @returns {ProjectGraph}
 */
export declare function projectGraphAdapter(sourceVersion: string, targetVersion: string, projectGraph: ProjectGraph): ProjectGraph | ProjectGraphV4;
