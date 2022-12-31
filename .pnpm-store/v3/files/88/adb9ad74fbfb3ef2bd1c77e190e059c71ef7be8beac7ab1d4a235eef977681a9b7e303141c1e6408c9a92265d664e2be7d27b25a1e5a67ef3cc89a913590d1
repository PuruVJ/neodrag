/// <reference types="node" />
import type { AstroSettings } from '../@types/astro';
import type { LogOptions } from './logger/core';
import nodeFs from 'fs';
import * as vite from 'vite';
interface CreateViteOptions {
    settings: AstroSettings;
    logging: LogOptions;
    mode: 'dev' | 'build' | string;
    fs?: typeof nodeFs;
}
/** Return a common starting point for all Vite actions */
export declare function createVite(commandConfig: vite.InlineConfig, { settings, logging, mode, fs }: CreateViteOptions): Promise<vite.InlineConfig>;
export {};
