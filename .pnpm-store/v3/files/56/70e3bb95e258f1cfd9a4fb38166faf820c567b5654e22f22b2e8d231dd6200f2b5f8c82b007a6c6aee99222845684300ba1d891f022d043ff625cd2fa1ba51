import type { ComponentInstance, GetStaticPathsResult, RouteData } from '../../@types/astro';
import type { LogOptions } from '../logger/core';
/** Throws error for invalid parameter in getStaticPaths() response */
export declare function validateGetStaticPathsParameter([key, value]: [string, any], route: string): void;
/** Warn or error for deprecated or malformed route components */
export declare function validateDynamicRouteModule(mod: ComponentInstance, { ssr, logging, route, }: {
    ssr: boolean;
    logging: LogOptions;
    route: RouteData;
}): void;
/** Throw error and log warnings for malformed getStaticPaths() response */
export declare function validateGetStaticPathsResult(result: GetStaticPathsResult, logging: LogOptions, route: RouteData): void;
