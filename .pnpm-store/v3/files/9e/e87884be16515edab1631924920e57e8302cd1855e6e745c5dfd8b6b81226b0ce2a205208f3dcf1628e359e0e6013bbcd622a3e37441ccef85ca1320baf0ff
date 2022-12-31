/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import * as http from 'http';
import type { AddressInfo } from 'net';
import type { AstroSettings, AstroUserConfig } from '../../@types/astro';
import nodeFs from 'fs';
import * as vite from 'vite';
import { LogOptions } from '../logger/core.js';
export interface Container {
    fs: typeof nodeFs;
    logging: LogOptions;
    settings: AstroSettings;
    viteConfig: vite.InlineConfig;
    viteServer: vite.ViteDevServer;
    resolvedRoot: string;
    configFlag: string | undefined;
    configFlagPath: string | undefined;
    restartInFlight: boolean;
    handle: (req: http.IncomingMessage, res: http.ServerResponse) => void;
    close: () => Promise<void>;
}
export interface CreateContainerParams {
    isRestart?: boolean;
    logging?: LogOptions;
    userConfig?: AstroUserConfig;
    settings?: AstroSettings;
    fs?: typeof nodeFs;
    root?: string | URL;
    configFlag?: string;
    configFlagPath?: string;
}
export declare function createContainer(params?: CreateContainerParams): Promise<Container>;
export declare function startContainer({ settings, viteServer, logging, }: Container): Promise<AddressInfo>;
export declare function isStarted(container: Container): boolean;
export declare function runInContainer(params: CreateContainerParams, callback: (container: Container) => Promise<void> | void): Promise<void>;
