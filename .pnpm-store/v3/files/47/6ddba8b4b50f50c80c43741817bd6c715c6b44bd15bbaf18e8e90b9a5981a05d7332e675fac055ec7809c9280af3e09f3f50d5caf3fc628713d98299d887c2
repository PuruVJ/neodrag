import { Plugin } from 'vite';
import type { AstroSettings } from '../@types/astro';
import type { LogOptions } from '../core/logger/core.js';
interface AstroPluginJSXOptions {
    settings: AstroSettings;
    logging: LogOptions;
}
/** Use Astro config to allow for alternate or multiple JSX renderers (by default Vite will assume React) */
export default function jsx({ settings, logging }: AstroPluginJSXOptions): Plugin;
export {};
