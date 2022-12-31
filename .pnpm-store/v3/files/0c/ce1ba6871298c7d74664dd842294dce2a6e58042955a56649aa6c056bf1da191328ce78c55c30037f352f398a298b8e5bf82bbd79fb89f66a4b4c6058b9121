import type { LoaderEvents, ModuleLoader } from '../core/module-loader/index';
import type { ServerState } from './server-state';
declare type ReloadFn = () => void;
export interface DevServerController {
    state: ServerState;
    onFileChange: LoaderEvents['file-change'];
    onHMRError: LoaderEvents['hmr-error'];
}
export declare type CreateControllerParams = {
    loader: ModuleLoader;
} | {
    reload: ReloadFn;
};
export declare function createController(params: CreateControllerParams): DevServerController;
export declare function createBaseController({ reload }: {
    reload: ReloadFn;
}): DevServerController;
export declare function createLoaderController(loader: ModuleLoader): DevServerController;
export interface RunWithErrorHandlingParams {
    controller: DevServerController;
    pathname: string;
    run: () => Promise<any>;
    onError: (error: unknown) => Error;
}
export declare function runWithErrorHandling({ controller: { state }, pathname, run, onError, }: RunWithErrorHandlingParams): Promise<void>;
export {};
