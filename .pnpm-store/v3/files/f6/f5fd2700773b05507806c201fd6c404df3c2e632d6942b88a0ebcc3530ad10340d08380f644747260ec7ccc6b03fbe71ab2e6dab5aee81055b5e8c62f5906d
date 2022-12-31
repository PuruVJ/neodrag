import { FileData } from '../config/project-graph';
export declare abstract class FileHasherBase {
    protected fileHashes: Map<string, string>;
    protected isInitialized: boolean;
    clear(): void;
    abstract init(): Promise<void>;
    abstract hashFiles(files: string[]): Promise<Map<string, string>>;
    ensureInitialized(): Promise<void>;
    allFileData(): FileData[];
    incrementalUpdate(updatedFiles: Map<string, string>, deletedFiles?: string[]): void;
    hashFile(path: string): string;
}
