import { FileHasherBase } from './file-hasher-base';
export declare class NodeBasedFileHasher extends FileHasherBase {
    ignoredGlobs: import("ignore").Ignore;
    init(): Promise<void>;
    hashFiles(files: string[]): Promise<Map<string, string>>;
    private allFilesInDir;
}
