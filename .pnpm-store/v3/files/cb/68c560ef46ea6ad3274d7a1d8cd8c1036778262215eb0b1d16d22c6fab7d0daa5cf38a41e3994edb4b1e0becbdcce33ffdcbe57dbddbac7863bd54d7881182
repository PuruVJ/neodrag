import type { Container, CreateContainerParams } from './container';
export declare function shouldRestartContainer({ settings, configFlag, configFlagPath, restartInFlight }: Container, changedFile: string): boolean;
interface RestartContainerParams {
    container: Container;
    flags: any;
    logMsg: string;
    handleConfigError: (err: Error) => Promise<void> | void;
    beforeRestart?: () => void;
}
export declare function restartContainer({ container, flags, logMsg, handleConfigError, beforeRestart, }: RestartContainerParams): Promise<{
    container: Container;
    error: Error | null;
}>;
export interface CreateContainerWithAutomaticRestart {
    flags: any;
    params: CreateContainerParams;
    handleConfigError?: (error: Error) => void | Promise<void>;
    beforeRestart?: () => void;
}
interface Restart {
    container: Container;
    restarted: () => Promise<Error | null>;
}
export declare function createContainerWithAutomaticRestart({ flags, handleConfigError, beforeRestart, params, }: CreateContainerWithAutomaticRestart): Promise<Restart>;
export {};
