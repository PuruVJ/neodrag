import type { AstroSettings, ComponentInstance, RouteData, SSRLoadedRenderer } from '../../../@types/astro';
import type { ModuleLoader } from '../../module-loader/index';
import type { DevelopmentEnvironment } from './environment';
export { createDevelopmentEnvironment } from './environment.js';
export type { DevelopmentEnvironment };
export interface SSROptions {
    /** The environment instance */
    env: DevelopmentEnvironment;
    /** location of file on disk */
    filePath: URL;
    /** production website */
    origin: string;
    /** the web request (needed for dynamic routes) */
    pathname: string;
    /** The renderers and instance */
    preload: ComponentPreload;
    /** Request */
    request: Request;
    /** optional, in case we need to render something outside of a dev server */
    route?: RouteData;
}
export declare type ComponentPreload = [SSRLoadedRenderer[], ComponentInstance];
export declare function loadRenderers(moduleLoader: ModuleLoader, settings: AstroSettings): Promise<SSRLoadedRenderer[]>;
export declare function preload({ env, filePath, }: Pick<SSROptions, 'env' | 'filePath'>): Promise<ComponentPreload>;
export declare function renderPage(options: SSROptions): Promise<Response>;
