/// <reference types="node" />
import type { RouteData } from '../../@types/astro';
import type { SSRManifest } from './types';
import { IncomingMessage } from 'http';
import { App, MatchOptions } from './index.js';
export declare class NodeApp extends App {
    match(req: IncomingMessage | Request, opts?: MatchOptions): RouteData | undefined;
    render(req: IncomingMessage | Request, routeData?: RouteData): Promise<Response>;
}
export declare function loadManifest(rootFolder: URL): Promise<SSRManifest>;
export declare function loadApp(rootFolder: URL): Promise<NodeApp>;
