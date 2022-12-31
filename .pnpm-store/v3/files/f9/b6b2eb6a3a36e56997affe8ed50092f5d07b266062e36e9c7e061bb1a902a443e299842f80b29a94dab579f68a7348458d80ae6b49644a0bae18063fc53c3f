import type { OutputChunk, RenderedChunk } from 'rollup';
import type { PageBuildData, ViteID } from './types';
import { PageOptions } from '../../vite-plugin-astro/types';
export interface BuildInternals {
    /**
     * The module ids of all CSS chunks, used to deduplicate CSS assets between
     * SSR build and client build in vite-plugin-css.
     */
    cssChunkModuleIds: Set<string>;
    hoistedScriptIdToHoistedMap: Map<string, Set<string>>;
    hoistedScriptIdToPagesMap: Map<string, Set<string>>;
    entrySpecifierToBundleMap: Map<string, string>;
    /**
     * A map to get a specific page's bundled output file.
     */
    pageToBundleMap: Map<string, string>;
    /**
     * A map for page-specific information.
     */
    pagesByComponent: Map<string, PageBuildData>;
    /**
     * A map for page-specific output.
     */
    pageOptionsByPage: Map<string, PageOptions>;
    /**
     * A map for page-specific information by Vite ID (a path-like string)
     */
    pagesByViteID: Map<ViteID, PageBuildData>;
    /**
     * A map for page-specific information by a client:only component
     */
    pagesByClientOnly: Map<string, Set<PageBuildData>>;
    /**
     * A list of hydrated components that are discovered during the SSR build
     * These will be used as the top-level entrypoints for the client build.
     */
    discoveredHydratedComponents: Set<string>;
    /**
     * A list of client:only components that are discovered during the SSR build
     * These will be used as the top-level entrypoints for the client build.
     */
    discoveredClientOnlyComponents: Set<string>;
    /**
     * A list of hoisted scripts that are discovered during the SSR build
     * These will be used as the top-level entrypoints for the client build.
     */
    discoveredScripts: Set<string>;
    staticFiles: Set<string>;
    ssrEntryChunk?: OutputChunk;
}
/**
 * Creates internal maps used to coordinate the CSS and HTML plugins.
 * @returns {BuildInternals}
 */
export declare function createBuildInternals(): BuildInternals;
export declare function trackPageData(internals: BuildInternals, component: string, pageData: PageBuildData, componentModuleId: string, componentURL: URL): void;
/**
 * Tracks client-only components to the pages they are associated with.
 */
export declare function trackClientOnlyPageDatas(internals: BuildInternals, pageData: PageBuildData, clientOnlys: string[]): void;
export declare function getPageDatasByChunk(internals: BuildInternals, chunk: RenderedChunk): Generator<PageBuildData, void, unknown>;
export declare function getPageDatasByClientOnlyID(internals: BuildInternals, viteid: ViteID): Generator<PageBuildData, void, unknown>;
export declare function getPageDataByComponent(internals: BuildInternals, component: string): PageBuildData | undefined;
export declare function getPageDataByViteID(internals: BuildInternals, viteid: ViteID): PageBuildData | undefined;
export declare function hasPageDataByViteID(internals: BuildInternals, viteid: ViteID): boolean;
export declare function eachPageData(internals: BuildInternals): Generator<PageBuildData, void, undefined>;
export declare function hasPrerenderedPages(internals: BuildInternals): boolean;
export declare function eachPrerenderedPageData(internals: BuildInternals): Generator<PageBuildData, void, unknown>;
export declare function eachServerPageData(internals: BuildInternals): Generator<PageBuildData, void, unknown>;
/**
 * Sort a page's CSS by depth. A higher depth means that the CSS comes from shared subcomponents.
 * A lower depth means it comes directly from the top-level page.
 * The return of this function is an array of CSS paths, with shared CSS on top
 * and page-level CSS on bottom.
 */
export declare function sortedCSS(pageData: PageBuildData): string[];
export declare function isHoistedScript(internals: BuildInternals, id: string): boolean;
export declare function getPageDatasByHoistedScriptId(internals: BuildInternals, id: string): Generator<PageBuildData, void, unknown>;
