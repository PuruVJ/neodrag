import { FileChange } from '../generators/tree';
import { Options, Schema } from '../utils/params';
export interface GenerateOptions {
    collectionName: string;
    generatorName: string;
    generatorOptions: Options;
    help: boolean;
    dryRun: boolean;
    interactive: boolean;
    defaults: boolean;
}
export declare function printChanges(fileChanges: FileChange[]): void;
export declare function printGenHelp(opts: GenerateOptions, schema: Schema, normalizedGeneratorName: string, aliases: string[]): void;
export declare function generate(cwd: string, args: {
    [k: string]: any;
}): Promise<any>;
