import type { PropagationHint, SSRResult } from '../../../../@types/astro';
import type { HeadAndContent } from './head-and-content';
import type { RenderTemplateResult } from './render-template';
export declare type AstroFactoryReturnValue = RenderTemplateResult | Response | HeadAndContent;
export interface AstroComponentFactory {
    (result: any, props: any, slots: any): AstroFactoryReturnValue;
    isAstroComponentFactory?: boolean;
    moduleId?: string | undefined;
    propagation?: PropagationHint;
}
export declare function isAstroComponentFactory(obj: any): obj is AstroComponentFactory;
export declare function renderToString(result: SSRResult, componentFactory: AstroComponentFactory, props: any, children: any): Promise<string>;
export declare function isAPropagatingComponent(result: SSRResult, factory: AstroComponentFactory): boolean;
