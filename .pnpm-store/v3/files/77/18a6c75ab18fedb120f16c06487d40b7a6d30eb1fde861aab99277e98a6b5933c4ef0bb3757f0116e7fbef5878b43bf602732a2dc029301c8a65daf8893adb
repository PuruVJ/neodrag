import type { SSRResult } from '../../../@types/astro';
import type { RenderInstruction } from './types.js';
import { HTMLBytes } from '../escape.js';
import { type SlotString } from './slot.js';
export declare const Fragment: unique symbol;
export declare const Renderer: unique symbol;
export declare const encoder: TextEncoder;
export declare const decoder: TextDecoder;
export declare function stringifyChunk(result: SSRResult, chunk: string | SlotString | RenderInstruction): any;
export declare class HTMLParts {
    parts: string;
    constructor();
    append(part: string | HTMLBytes | RenderInstruction, result: SSRResult): void;
    toString(): string;
    toArrayBuffer(): Uint8Array;
}
export declare function chunkToByteArray(result: SSRResult, chunk: string | HTMLBytes | RenderInstruction): Uint8Array;
