import type { RouteData } from '../../@types/astro';
import type { SSRManifest as Manifest } from './types';
export { deserializeManifest } from './common.js';
export declare const pagesVirtualModuleId = "@astrojs-pages-virtual-entry";
export declare const resolvedPagesVirtualModuleId: string;
export interface MatchOptions {
    matchNotFound?: boolean | undefined;
}
export declare class App {
    #private;
    constructor(manifest: Manifest, streaming?: boolean);
    removeBase(pathname: string): string;
    match(request: Request, { matchNotFound }?: MatchOptions): RouteData | undefined;
    render(request: Request, routeData?: RouteData): Promise<Response>;
    setCookieHeaders(response: Response): Generator<string, void, unknown>;
}
