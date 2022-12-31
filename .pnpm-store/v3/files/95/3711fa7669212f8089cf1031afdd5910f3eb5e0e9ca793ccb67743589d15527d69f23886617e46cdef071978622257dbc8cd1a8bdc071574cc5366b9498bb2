import type { SSRResult } from '../../../../@types/astro';
import type { AstroComponentFactory, AstroFactoryReturnValue } from './factory.js';
import type { renderTemplate } from './render-template.js';
declare type ComponentProps = Record<string | number, any>;
declare type ComponentSlotValue = () => ReturnType<typeof renderTemplate>;
export declare type ComponentSlots = Record<string, ComponentSlotValue>;
export declare type ComponentSlotsWithValues = Record<string, ReturnType<ComponentSlotValue>>;
declare const astroComponentInstanceSym: unique symbol;
export declare class AstroComponentInstance {
    [astroComponentInstanceSym]: boolean;
    private readonly result;
    private readonly props;
    private readonly slotValues;
    private readonly factory;
    private returnValue;
    constructor(result: SSRResult, props: ComponentProps, slots: ComponentSlots, factory: AstroComponentFactory);
    init(): Promise<AstroFactoryReturnValue>;
    render(): AsyncGenerator<any, void, undefined>;
}
export declare function createAstroComponentInstance(result: SSRResult, displayName: string, factory: AstroComponentFactory, props: ComponentProps, slots?: any): AstroComponentInstance;
export declare function isAstroComponentInstance(obj: unknown): obj is AstroComponentInstance;
export {};
