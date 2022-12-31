/// <reference types="node" />
import type fsType from 'fs';
import * as vite from 'vite';
export interface ViteLoader {
    root: string;
    viteServer: vite.ViteDevServer;
}
interface LoadConfigWithViteOptions {
    root: string;
    configPath: string | undefined;
    fs: typeof fsType;
}
export declare function loadConfigWithVite({ configPath, fs, root, }: LoadConfigWithViteOptions): Promise<{
    value: Record<string, any>;
    filePath?: string;
}>;
export {};
