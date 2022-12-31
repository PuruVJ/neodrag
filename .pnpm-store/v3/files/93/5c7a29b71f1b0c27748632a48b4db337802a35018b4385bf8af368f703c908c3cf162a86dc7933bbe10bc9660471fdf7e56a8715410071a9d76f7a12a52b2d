import type { SSRResult } from '../../../@types/astro.js';
import type { RenderInstruction } from './types.js';
import { HTMLString } from '../escape.js';
declare const slotString: unique symbol;
export declare class SlotString extends HTMLString {
    instructions: null | RenderInstruction[];
    [slotString]: boolean;
    constructor(content: string, instructions: null | RenderInstruction[]);
}
export declare function isSlotString(str: string): str is any;
export declare function renderSlot(_result: any, slotted: string, fallback?: any): Promise<string>;
interface RenderSlotsResult {
    slotInstructions: null | RenderInstruction[];
    children: Record<string, string>;
}
export declare function renderSlots(result: SSRResult, slots?: any): Promise<RenderSlotsResult>;
export {};
