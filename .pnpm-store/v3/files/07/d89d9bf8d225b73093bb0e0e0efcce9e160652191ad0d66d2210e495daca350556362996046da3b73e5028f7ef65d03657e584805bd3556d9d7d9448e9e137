/// <reference types="node" />
import type * as vite from 'vite';
import type { AstroSettings } from '../@types/astro';
import type fs from 'fs';
import { LogOptions } from '../core/logger/core.js';
export interface AstroPluginOptions {
    settings: AstroSettings;
    logging: LogOptions;
    fs: typeof fs;
}
export default function createVitePluginAstroServer({ settings, logging, fs: fsMod, }: AstroPluginOptions): vite.Plugin;
