/// <reference types="node" />
import type { Arguments as Flags } from 'yargs-parser';
import type { AstroConfig, AstroUserConfig, CLIFlags } from '../../@types/astro';
import fs from 'fs';
import { LogOptions } from '../logger/core.js';
export declare const LEGACY_ASTRO_CONFIG_KEYS: Set<string>;
/** Turn raw config values into normalized values */
export declare function validateConfig(userConfig: any, root: string, cmd: string): Promise<AstroConfig>;
/** Convert the generic "yargs" flag object into our own, custom TypeScript object. */
export declare function resolveFlags(flags: Partial<Flags>): CLIFlags;
export declare function resolveRoot(cwd?: string | URL): string;
interface LoadConfigOptions {
    cwd?: string;
    flags?: Flags;
    cmd: string;
    validate?: boolean;
    logging: LogOptions;
    /** Invalidate when reloading a previously loaded config */
    isRestart?: boolean;
    fsMod?: typeof fs;
}
/**
 * Resolve the file URL of the user's `astro.config.js|cjs|mjs|ts` file
 * Note: currently the same as loadConfig but only returns the `filePath`
 * instead of the resolved config
 */
export declare function resolveConfigPath(configOptions: Pick<LoadConfigOptions, 'cwd' | 'flags'> & {
    fs: typeof fs;
}): Promise<string | undefined>;
interface OpenConfigResult {
    userConfig: AstroUserConfig;
    astroConfig: AstroConfig;
    flags: CLIFlags;
    root: string;
}
/** Load a configuration file, returning both the userConfig and astroConfig */
export declare function openConfig(configOptions: LoadConfigOptions): Promise<OpenConfigResult>;
/**
 * Attempt to load an `astro.config.mjs` file
 * @deprecated
 */
export declare function loadConfig(configOptions: LoadConfigOptions): Promise<AstroConfig>;
/** Attempt to resolve an Astro configuration object. Normalize, validate, and return. */
export declare function resolveConfig(userConfig: AstroUserConfig, root: string, flags: CLIFlags | undefined, cmd: string): Promise<AstroConfig>;
export declare function createDefaultDevConfig(userConfig?: AstroUserConfig, root?: string): Promise<AstroConfig>;
export declare function mergeConfig(defaults: Record<string, any>, overrides: Record<string, any>, isRoot?: boolean): Record<string, any>;
export {};
