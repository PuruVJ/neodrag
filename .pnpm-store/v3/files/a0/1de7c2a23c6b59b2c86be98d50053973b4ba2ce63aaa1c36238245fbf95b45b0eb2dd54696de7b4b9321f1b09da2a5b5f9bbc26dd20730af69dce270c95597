/// <reference types="node" />
import type http from 'http';
import type { ComponentInstance, ManifestData, RouteData } from '../@types/astro';
import { ComponentPreload, DevelopmentEnvironment } from '../core/render/dev/index';
declare type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;
interface MatchedRoute {
    route: RouteData;
    filePath: URL;
    resolvedPathname: string;
    preloadedComponent: ComponentPreload;
    mod: ComponentInstance;
}
export declare function matchRoute(pathname: string, env: DevelopmentEnvironment, manifest: ManifestData): Promise<MatchedRoute | undefined>;
export declare function handleRoute(matchedRoute: AsyncReturnType<typeof matchRoute>, url: URL, pathname: string, body: ArrayBuffer | undefined, origin: string, env: DevelopmentEnvironment, manifest: ManifestData, req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
export {};
