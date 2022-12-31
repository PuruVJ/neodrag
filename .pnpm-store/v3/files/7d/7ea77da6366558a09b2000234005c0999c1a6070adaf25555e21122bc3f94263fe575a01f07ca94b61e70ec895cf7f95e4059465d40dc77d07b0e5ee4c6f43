/// <reference types="node" />
import fsMod from 'node:fs';
import type { Plugin } from 'vite';
import type { AstroSettings } from '../@types/astro.js';
import { LogOptions } from '../core/logger/core.js';
interface AstroContentServerPluginParams {
    fs: typeof fsMod;
    logging: LogOptions;
    settings: AstroSettings;
    mode: string;
}
export declare function astroContentServerPlugin({ fs, settings, logging, mode, }: AstroContentServerPluginParams): Plugin[];
export {};
