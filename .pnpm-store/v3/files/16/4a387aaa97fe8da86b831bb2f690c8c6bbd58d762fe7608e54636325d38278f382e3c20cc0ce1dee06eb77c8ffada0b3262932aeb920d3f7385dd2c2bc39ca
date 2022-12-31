import type { MarkdownRenderingOptions } from '@astrojs/markdown-remark';
import type { Params, Props, RuntimeMode, SSRElement, SSRLoadedRenderer, SSRResult } from '../../@types/astro';
import { LogOptions } from '../logger/core.js';
export interface CreateResultArgs {
    adapterName: string | undefined;
    ssr: boolean;
    logging: LogOptions;
    origin: string;
    markdown: MarkdownRenderingOptions;
    mode: RuntimeMode;
    params: Params;
    pathname: string;
    props: Props;
    renderers: SSRLoadedRenderer[];
    resolve: (s: string) => Promise<string>;
    site: string | undefined;
    links?: Set<SSRElement>;
    scripts?: Set<SSRElement>;
    styles?: Set<SSRElement>;
    propagation?: SSRResult['propagation'];
    request: Request;
    status: number;
}
export declare function createResult(args: CreateResultArgs): SSRResult;
