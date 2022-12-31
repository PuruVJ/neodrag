import type { AstroSettings, ManifestData } from '../../@types/astro';
import type { LogOptions } from '../logger/core';
import type { AllPagesData } from './types';
export interface CollectPagesDataOptions {
    settings: AstroSettings;
    logging: LogOptions;
    manifest: ManifestData;
}
export interface CollectPagesDataResult {
    assets: Record<string, string>;
    allPages: AllPagesData;
}
export declare function collectPagesData(opts: CollectPagesDataOptions): Promise<CollectPagesDataResult>;
