import { NxJsonConfiguration } from './nx-json';
import { ProjectsConfigurations } from './workspace-json-project-json';
export declare function readNxJson(): NxJsonConfiguration;
/**
 * @deprecated Use readProjectsConfigurationFromProjectGraph(await createProjectGraphAsync())
 */
export declare function readAllWorkspaceConfiguration(): ProjectsConfigurations & NxJsonConfiguration;
/**
 * Returns information about where apps and libs will be created.
 */
export declare function workspaceLayout(): {
    appsDir: string;
    libsDir: string;
};
