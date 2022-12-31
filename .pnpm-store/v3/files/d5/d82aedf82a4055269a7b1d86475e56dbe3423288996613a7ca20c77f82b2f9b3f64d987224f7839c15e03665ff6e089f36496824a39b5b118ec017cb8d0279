import type { AstroSettings } from '../../../@types/astro';
import type { LogOptions } from '../../logger/core.js';
import type { ModuleLoader } from '../../module-loader/index';
import type { Environment } from '../index';
export declare type DevelopmentEnvironment = Environment & {
    loader: ModuleLoader;
    settings: AstroSettings;
};
export declare function createDevelopmentEnvironment(settings: AstroSettings, logging: LogOptions, loader: ModuleLoader): DevelopmentEnvironment;
