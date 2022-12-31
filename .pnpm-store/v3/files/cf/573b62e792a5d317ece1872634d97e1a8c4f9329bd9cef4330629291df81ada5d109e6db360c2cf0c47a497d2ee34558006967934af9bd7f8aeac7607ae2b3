import type { MarkdownRenderingOptions } from '@astrojs/markdown-remark';
import type { RuntimeMode, SSRLoadedRenderer } from '../../@types/astro';
import type { LogOptions } from '../logger/core.js';
import { RouteCache } from './route-cache.js';
/**
 * An environment represents the static parts of rendering that do not change
 * between requests. These are mostly known when the server first starts up and do not change.
 * Thus they can be created once and passed through to renderPage on each request.
 */
export interface Environment {
    adapterName?: string;
    /** logging options */
    logging: LogOptions;
    markdown: MarkdownRenderingOptions;
    /** "development" or "production" */
    mode: RuntimeMode;
    renderers: SSRLoadedRenderer[];
    resolve: (s: string) => Promise<string>;
    routeCache: RouteCache;
    site?: string;
    ssr: boolean;
    streaming: boolean;
}
export declare type CreateEnvironmentArgs = Environment;
export declare function createEnvironment(options: CreateEnvironmentArgs): Environment;
export declare type CreateBasicEnvironmentArgs = Partial<Environment> & {
    logging: CreateEnvironmentArgs['logging'];
};
export declare function createBasicEnvironment(options: CreateBasicEnvironmentArgs): Environment;
