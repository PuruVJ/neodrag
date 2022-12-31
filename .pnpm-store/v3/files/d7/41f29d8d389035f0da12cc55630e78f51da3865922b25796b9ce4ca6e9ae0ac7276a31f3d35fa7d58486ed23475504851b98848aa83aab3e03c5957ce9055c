import { HashingImpl } from './hashing-impl';
import { FileData, ProjectGraph } from '../config/project-graph';
import { NxJsonConfiguration } from '../config/nx-json';
import { Task } from '../config/task-graph';
import { InputDefinition } from '../config/workspace-json-project-json';
declare type ExpandedSelfInput = {
    fileset: string;
} | {
    runtime: string;
} | {
    env: string;
};
/**
 * A data structure returned by the default hasher.
 */
export interface PartialHash {
    value: string;
    details: {
        [name: string]: string;
    };
}
/**
 * A data structure returned by the default hasher.
 */
export interface Hash {
    value: string;
    details: {
        command: string;
        nodes: {
            [name: string]: string;
        };
        implicitDeps?: {
            [fileName: string]: string;
        };
        runtime?: {
            [input: string]: string;
        };
    };
}
/**
 * The default hasher used by executors.
 */
export declare class Hasher {
    private readonly projectGraph;
    private readonly nxJson;
    private readonly options;
    static version: string;
    private taskHasher;
    private hashing;
    constructor(projectGraph: ProjectGraph, nxJson: NxJsonConfiguration, options: any, hashing?: HashingImpl);
    hashTask(task: Task): Promise<Hash>;
    hashDependsOnOtherTasks(task: Task): boolean;
    /**
     * @deprecated use hashTask instead
     */
    hashTaskWithDepsAndContext(task: Task): Promise<Hash>;
    /**
     * @deprecated hashTask will hash runtime inputs and global files
     */
    hashContext(): Promise<any>;
    hashCommand(task: Task): string;
    /**
     * @deprecated use hashTask
     */
    hashSource(task: Task): Promise<string>;
    hashArray(values: string[]): string;
    hashFile(path: string): string;
    private readTsConfig;
}
export declare function splitInputsIntoSelfAndDependencies(inputs: (InputDefinition | string)[], namedInputs: {
    [inputName: string]: (InputDefinition | string)[];
}): {
    depsInputs: {
        input: string;
    }[];
    selfInputs: ExpandedSelfInput[];
};
export declare function expandNamedInput(input: string, namedInputs: {
    [inputName: string]: (InputDefinition | string)[];
}): ExpandedSelfInput[];
export declare function filterUsingGlobPatterns(root: string, files: FileData[], patterns: string[]): FileData[];
export {};
