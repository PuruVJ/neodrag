import * as yargs from 'yargs';
import { NxJsonConfiguration } from '../config/nx-json';
import { ProjectConfiguration, ProjectsConfigurations } from '../config/workspace-json-project-json';
export declare function format(command: 'check' | 'write', args: yargs.Arguments): Promise<void>;
export declare function moveTagsAndImplicitDepsFromNxJsonToWorkspaceJson(workspaceJson: ProjectsConfigurations, nxJson: NxJsonConfiguration & {
    projects: Record<string, Pick<ProjectConfiguration, 'tags' | 'implicitDependencies'>>;
}): void;
