import { ExecutorContext } from '../../config/misc-interfaces';
export declare const LARGE_BUFFER: number;
export declare type Json = {
    [k: string]: any;
};
export interface RunCommandsOptions extends Json {
    command?: string;
    commands?: ({
        command: string;
        forwardAllArgs?: boolean;
        /**
         * description was added to allow users to document their commands inline,
         * it is not intended to be used as part of the execution of the command.
         */
        description?: string;
        prefix?: string;
        color?: string;
        bgColor?: string;
    } | string)[];
    color?: boolean;
    parallel?: boolean;
    readyWhen?: string;
    cwd?: string;
    args?: string;
    envFile?: string;
    outputPath?: string;
    __unparsed__: string[];
}
export interface NormalizedRunCommandsOptions extends RunCommandsOptions {
    commands: {
        command: string;
        forwardAllArgs?: boolean;
    }[];
    parsedArgs: {
        [k: string]: any;
    };
}
export default function (options: RunCommandsOptions, context: ExecutorContext): Promise<{
    success: boolean;
}>;
export declare function interpolateArgsIntoCommand(command: string, opts: NormalizedRunCommandsOptions, forwardAllArgs: boolean): string;
