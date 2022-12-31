/// <reference types="node" />
import type http from 'http';
import type { ErrorWithMetadata } from '../core/errors/index.js';
import type { ModuleLoader } from '../core/module-loader/index';
export declare function handle404Response(origin: string, req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
export declare function handle500Response(loader: ModuleLoader, res: http.ServerResponse, err: ErrorWithMetadata): Promise<void>;
export declare function writeHtmlResponse(res: http.ServerResponse, statusCode: number, html: string): void;
export declare function writeWebResponse(res: http.ServerResponse, webResponse: Response): Promise<void>;
export declare function writeSSRResult(webResponse: Response, res: http.ServerResponse): Promise<void>;
