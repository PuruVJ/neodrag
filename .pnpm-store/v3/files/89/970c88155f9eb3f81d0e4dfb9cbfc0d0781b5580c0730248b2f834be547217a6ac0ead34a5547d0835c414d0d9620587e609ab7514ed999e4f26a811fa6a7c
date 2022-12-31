/// <reference types="node" />
import type { AstroSettings } from '../../@types/astro';
import type { LogOptions } from '../logger/core';
import http, { OutgoingHttpHeaders } from 'http';
export interface PreviewServer {
    host?: string;
    port: number;
    server: http.Server;
    closed(): Promise<void>;
    stop(): Promise<void>;
}
/** The primary dev action */
export default function createStaticPreviewServer(settings: AstroSettings, { logging, host, port, headers, }: {
    logging: LogOptions;
    host: string | undefined;
    port: number;
    headers: OutgoingHttpHeaders | undefined;
}): Promise<PreviewServer>;
