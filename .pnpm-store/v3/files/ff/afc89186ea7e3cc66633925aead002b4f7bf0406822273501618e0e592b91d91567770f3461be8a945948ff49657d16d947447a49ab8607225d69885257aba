import type { AstroComponentMetadata, SSRElement, SSRLoadedRenderer, SSRResult } from '../../@types/astro';
export declare const HydrationDirectiveProps: Set<string>;
export interface HydrationMetadata {
    directive: string;
    value: string;
    componentUrl: string;
    componentExport: {
        value: string;
    };
}
interface ExtractedProps {
    isPage: boolean;
    hydration: HydrationMetadata | null;
    props: Record<string | number | symbol, any>;
}
export declare function extractDirectives(displayName: string, inputProps: Record<string | number | symbol, any>): ExtractedProps;
interface HydrateScriptOptions {
    renderer: SSRLoadedRenderer;
    result: SSRResult;
    astroId: string;
    props: Record<string | number, any>;
    attrs: Record<string, string> | undefined;
}
/** For hydrated components, generate a <script type="module"> to load the component */
export declare function generateHydrateScript(scriptOptions: HydrateScriptOptions, metadata: Required<AstroComponentMetadata>): Promise<SSRElement>;
export {};
