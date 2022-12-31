import type { ComponentInstance, Params, Props, RouteData } from '../../@types/astro';
import type { LogOptions } from '../logger/core.js';
import type { RenderContext } from './context.js';
import type { Environment } from './environment.js';
import { RouteCache } from './route-cache.js';
interface GetParamsAndPropsOptions {
    mod: ComponentInstance;
    route?: RouteData | undefined;
    routeCache: RouteCache;
    pathname: string;
    logging: LogOptions;
    ssr: boolean;
}
export declare const enum GetParamsAndPropsError {
    NoMatchingStaticPath = 0
}
export declare function getParamsAndProps(opts: GetParamsAndPropsOptions): Promise<[Params, Props] | GetParamsAndPropsError>;
export declare function renderPage(mod: ComponentInstance, ctx: RenderContext, env: Environment): Promise<Response>;
export {};
