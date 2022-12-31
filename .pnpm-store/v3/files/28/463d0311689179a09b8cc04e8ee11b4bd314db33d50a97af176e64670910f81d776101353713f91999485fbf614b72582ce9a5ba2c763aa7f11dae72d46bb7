import { TransformResult, ViteDevServer } from 'vite';
import { f as DebuggerOptions, D as DepsHandlingOptions, e as ViteNodeServerOptions, F as FetchResult, d as ViteNodeResolveId, R as RawSourceMap } from './types-6a15e0b9.js';

declare class Debugger {
    options: DebuggerOptions;
    dumpDir: string | undefined;
    initPromise: Promise<void> | undefined;
    externalizeMap: Map<string, string>;
    constructor(root: string, options: DebuggerOptions);
    clearDump(): Promise<void>;
    encodeId(id: string): string;
    recordExternalize(id: string, path: string): Promise<void>;
    dumpFile(id: string, result: TransformResult | null): Promise<void>;
    loadDump(id: string): Promise<TransformResult | null>;
    writeInfo(): Promise<void>;
}

declare function guessCJSversion(id: string): string | undefined;
declare function shouldExternalize(id: string, options?: DepsHandlingOptions, cache?: Map<string, Promise<string | false>>): Promise<string | false>;

declare class ViteNodeServer {
    server: ViteDevServer;
    options: ViteNodeServerOptions;
    private fetchPromiseMap;
    private transformPromiseMap;
    fetchCache: Map<string, {
        duration?: number | undefined;
        timestamp: number;
        result: FetchResult;
    }>;
    externalizeCache: Map<string, Promise<string | false>>;
    debugger?: Debugger;
    constructor(server: ViteDevServer, options?: ViteNodeServerOptions);
    shouldExternalize(id: string): Promise<string | false>;
    resolveId(id: string, importer?: string): Promise<ViteNodeResolveId | null>;
    getSourceMap(source: string): RawSourceMap | null;
    fetchModule(id: string): Promise<FetchResult>;
    transformRequest(id: string): Promise<TransformResult | null | undefined>;
    getTransformMode(id: string): "web" | "ssr";
    private _fetchModule;
    private _transformRequest;
}

export { ViteNodeServer, guessCJSversion, shouldExternalize };
