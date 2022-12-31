/// <reference types="node" />
import type { AddressInfo } from 'net';
import type { InlineConfig, ViteDevServer } from 'vite';
import { AstroConfig, AstroSettings, BuildConfig, RouteData } from '../@types/astro.js';
import type { SerializedSSRManifest } from '../core/app/types';
import type { PageBuildData } from '../core/build/types';
import { LogOptions } from '../core/logger/core.js';
export declare function runHookConfigSetup({ settings, command, logging, isRestart, }: {
    settings: AstroSettings;
    command: 'dev' | 'build' | 'preview';
    logging: LogOptions;
    isRestart?: boolean;
}): Promise<AstroSettings>;
export declare function runHookConfigDone({ settings, logging, }: {
    settings: AstroSettings;
    logging: LogOptions;
}): Promise<void>;
export declare function runHookServerSetup({ config, server, logging, }: {
    config: AstroConfig;
    server: ViteDevServer;
    logging: LogOptions;
}): Promise<void>;
export declare function runHookServerStart({ config, address, logging, }: {
    config: AstroConfig;
    address: AddressInfo;
    logging: LogOptions;
}): Promise<void>;
export declare function runHookServerDone({ config, logging, }: {
    config: AstroConfig;
    logging: LogOptions;
}): Promise<void>;
export declare function runHookBuildStart({ config, buildConfig, logging, }: {
    config: AstroConfig;
    buildConfig: BuildConfig;
    logging: LogOptions;
}): Promise<void>;
export declare function runHookBuildSetup({ config, vite, pages, target, logging, }: {
    config: AstroConfig;
    vite: InlineConfig;
    pages: Map<string, PageBuildData>;
    target: 'server' | 'client';
    logging: LogOptions;
}): Promise<void>;
export declare function runHookBuildSsr({ config, manifest, logging, }: {
    config: AstroConfig;
    manifest: SerializedSSRManifest;
    logging: LogOptions;
}): Promise<void>;
export declare function runHookBuildGenerated({ config, buildConfig, logging, }: {
    config: AstroConfig;
    buildConfig: BuildConfig;
    logging: LogOptions;
}): Promise<void>;
export declare function runHookBuildDone({ config, buildConfig, pages, routes, logging, }: {
    config: AstroConfig;
    buildConfig: BuildConfig;
    pages: string[];
    routes: RouteData[];
    logging: LogOptions;
}): Promise<void>;
