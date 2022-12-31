import type { MarkdownRenderingOptions } from '@astrojs/markdown-remark';
import type { ComponentInstance, RouteData, SerializedRouteData, SSRLoadedRenderer } from '../../@types/astro';
export declare type ComponentPath = string;
export interface RouteInfo {
    routeData: RouteData;
    file: string;
    links: string[];
    scripts: ({
        children: string;
        stage: string;
    } | {
        type: 'inline' | 'external';
        value: string;
    })[];
}
export declare type SerializedRouteInfo = Omit<RouteInfo, 'routeData'> & {
    routeData: SerializedRouteData;
};
export interface SSRManifest {
    adapterName: string;
    routes: RouteInfo[];
    site?: string;
    base?: string;
    markdown: MarkdownRenderingOptions;
    pageMap: Map<ComponentPath, ComponentInstance>;
    renderers: SSRLoadedRenderer[];
    entryModules: Record<string, string>;
    assets: Set<string>;
}
export declare type SerializedSSRManifest = Omit<SSRManifest, 'routes' | 'assets'> & {
    routes: SerializedRouteInfo[];
    assets: string[];
};
export declare type AdapterCreateExports<T = any> = (manifest: SSRManifest, args?: T) => Record<string, any>;
