/// <reference types="node" />
import nodeFs from 'fs';
import type * as vite from 'vite';
declare type NodeFileSystemModule = typeof nodeFs;
export interface LoadFallbackPluginParams {
    fs?: NodeFileSystemModule;
    root: URL;
}
export default function loadFallbackPlugin({ fs, root, }: LoadFallbackPluginParams): vite.Plugin[] | false;
export {};
