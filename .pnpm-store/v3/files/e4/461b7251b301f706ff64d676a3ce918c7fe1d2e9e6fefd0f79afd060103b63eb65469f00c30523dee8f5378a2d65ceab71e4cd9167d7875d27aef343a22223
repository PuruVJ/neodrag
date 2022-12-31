import type { RouteData, SSRElement, SSRResult } from '../../@types/astro';
/**
 * The RenderContext represents the parts of rendering that are specific to one request.
 */
export interface RenderContext {
    request: Request;
    origin: string;
    pathname: string;
    url: URL;
    scripts?: Set<SSRElement>;
    links?: Set<SSRElement>;
    styles?: Set<SSRElement>;
    propagation?: SSRResult['propagation'];
    route?: RouteData;
    status?: number;
}
export declare type CreateRenderContextArgs = Partial<RenderContext> & {
    origin?: string;
    request: RenderContext['request'];
};
export declare function createRenderContext(options: CreateRenderContextArgs): RenderContext;
