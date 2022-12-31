/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { ProjectGraph } from '../../config/project-graph';
import { NxJsonConfiguration } from '../../config/nx-json';
export declare type UnregisterCallback = () => void;
export declare type ChangedFile = {
    path: string;
    type: 'create' | 'update' | 'delete';
};
export declare class DaemonClient {
    private readonly nxJson;
    constructor(nxJson: NxJsonConfiguration);
    private queue;
    private socketMessenger;
    private currentMessage;
    private currentResolve;
    private currentReject;
    private _enabled;
    private _connected;
    enabled(): boolean;
    reset(): void;
    requestShutdown(): Promise<void>;
    getProjectGraph(): Promise<ProjectGraph>;
    registerFileWatcher(config: {
        watchProjects: string[] | 'all';
        includeGlobalWorkspaceFiles?: boolean;
        includeDependentProjects?: boolean;
    }, callback: (error: Error | null | 'closed', data: {
        changedProjects: string[];
        changedFiles: ChangedFile[];
    } | null) => void): Promise<UnregisterCallback>;
    processInBackground(requirePath: string, data: any): Promise<any>;
    recordOutputsHash(outputs: string[], hash: string): Promise<any>;
    outputsHashesMatch(outputs: string[], hash: string): Promise<any>;
    isServerAvailable(): Promise<boolean>;
    private sendToDaemonViaQueue;
    private setUpConnection;
    private sendMessageToDaemon;
    private handleMessage;
    startInBackground(): Promise<ChildProcess['pid']>;
    stop(): void;
}
export declare const daemonClient: DaemonClient;
