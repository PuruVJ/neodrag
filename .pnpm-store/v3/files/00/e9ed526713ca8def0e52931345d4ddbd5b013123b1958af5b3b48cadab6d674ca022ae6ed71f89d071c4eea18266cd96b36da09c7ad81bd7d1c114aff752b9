/// <reference types="node" />
import type { AstroSettings, ManifestData } from '../../../@types/astro';
import type { LogOptions } from '../../logger/core';
import nodeFs from 'fs';
export interface CreateRouteManifestParams {
    /** Astro Settings object */
    settings: AstroSettings;
    /** Current working directory */
    cwd?: string;
    /** fs module, for testing */
    fsMod?: typeof nodeFs;
}
/** Create manifest of all static routes */
export declare function createRouteManifest({ settings, cwd, fsMod }: CreateRouteManifestParams, logging: LogOptions): ManifestData;
