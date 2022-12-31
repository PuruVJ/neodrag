import { FileHasherBase } from './file-hasher-base';
export declare class GitBasedFileHasher extends FileHasherBase {
    /**
     * For the project graph daemon server use-case we can potentially skip expensive work
     * by leveraging knowledge of the uncommitted and untracked files, so the init() method
     * returns a Map containing this data.
     */
    init(): Promise<void>;
    hashFiles(files: string[]): Promise<Map<string, string>>;
}
