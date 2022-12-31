import type { HmrContext, ModuleNode } from 'vite';
import type { AstroConfig } from '../@types/astro';
import { cachedCompilation } from '../core/compile/index.js';
import type { LogOptions } from '../core/logger/core.js';
export interface HandleHotUpdateOptions {
    config: AstroConfig;
    logging: LogOptions;
    compile: () => ReturnType<typeof cachedCompilation>;
}
export declare function handleHotUpdate(ctx: HmrContext, { config, logging, compile }: HandleHotUpdateOptions): Promise<ModuleNode[] | undefined>;
