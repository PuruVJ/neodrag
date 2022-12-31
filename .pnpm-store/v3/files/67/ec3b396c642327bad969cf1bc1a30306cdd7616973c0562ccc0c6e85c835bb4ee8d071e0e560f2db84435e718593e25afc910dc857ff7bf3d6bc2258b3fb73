import type * as vite from 'vite';
import type { AstroSettings } from '../@types/astro';
import type { LogOptions } from '../core/logger/core.js';
import type { PluginMetadata as AstroPluginMetadata } from './types';
export { getAstroMetadata } from './metadata.js';
export type { AstroPluginMetadata };
interface AstroPluginOptions {
    settings: AstroSettings;
    logging: LogOptions;
}
/** Transform .astro files for Vite */
export default function astro({ settings, logging }: AstroPluginOptions): vite.Plugin;
