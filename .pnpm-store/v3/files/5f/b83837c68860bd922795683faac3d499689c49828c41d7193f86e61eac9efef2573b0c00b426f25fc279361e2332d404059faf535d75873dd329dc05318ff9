/// <reference types="node" />
import type * as fs from 'fs';
import type TypedEmitter from '../../@types/typed-emitter';
export declare type LoaderEvents = {
    'file-add': (msg: [path: string, stats?: fs.Stats | undefined]) => void;
    'file-change': (msg: [path: string, stats?: fs.Stats | undefined]) => void;
    'file-unlink': (msg: [path: string, stats?: fs.Stats | undefined]) => void;
    'hmr-error': (msg: {
        type: 'error';
        err: {
            message: string;
            stack: string;
        };
    }) => void;
};
export declare type ModuleLoaderEventEmitter = TypedEmitter<LoaderEvents>;
export interface ModuleLoader {
    import: (src: string) => Promise<Record<string, any>>;
    resolveId: (specifier: string, parentId: string | undefined) => Promise<string | undefined>;
    getModuleById: (id: string) => ModuleNode | undefined;
    getModulesByFile: (file: string) => Set<ModuleNode> | undefined;
    getModuleInfo: (id: string) => ModuleInfo | null;
    eachModule(callbackfn: (value: ModuleNode, key: string) => void): void;
    invalidateModule(mod: ModuleNode): void;
    fixStacktrace: (error: Error) => void;
    clientReload: () => void;
    webSocketSend: (msg: any) => void;
    isHttps: () => boolean;
    events: TypedEmitter<LoaderEvents>;
}
export interface ModuleNode {
    id: string | null;
    url: string;
    ssrModule: Record<string, any> | null;
    ssrError: Error | null;
    importedModules: Set<ModuleNode>;
}
export interface ModuleInfo {
    id: string;
    meta?: Record<string, any>;
}
export declare function createLoader(overrides: Partial<ModuleLoader>): ModuleLoader;
