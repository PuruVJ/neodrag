import { NxJsonConfiguration } from '../config/nx-json';
export interface Environment {
    nxJson: NxJsonConfiguration;
    workspaceJson: any;
    /**
     * @deprecated the field will be removed after Nx 14 is released. It's left here
     * not to break the type checker in case someone extends
     * the tasks runner
     */
    workspaceResults: any;
}
/**
 * @deprecated Read workspaceJson from projectGraph, and use readNxJson on its own.
 */
export declare function readEnvironment(): Environment;
