import type { SSRResult } from '../../../@types/astro';
import type { RenderInstruction } from './types.js';
import { HTMLBytes } from '../escape.js';
import { type AstroComponentInstance } from './astro/index.js';
export declare type ComponentIterable = AsyncIterable<string | HTMLBytes | RenderInstruction>;
export declare function renderComponent(result: SSRResult, displayName: string, Component: unknown, props: Record<string | number, any>, slots?: any): Promise<ComponentIterable> | ComponentIterable | AstroComponentInstance;
export declare function renderComponentToIterable(result: SSRResult, displayName: string, Component: unknown, props: Record<string | number, any>, slots?: any): Promise<ComponentIterable> | ComponentIterable;
