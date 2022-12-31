/// <reference types="node" />
import type { SSROptions } from '../../render/dev';
export declare function call(options: SSROptions): Promise<{
    type: "simple";
    body: string;
    encoding?: BufferEncoding | undefined;
    cookies: import("../../cookies/cookies").AstroCookies;
} | {
    type: "response";
    response: Response;
}>;
