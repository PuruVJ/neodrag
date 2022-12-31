import type { ModuleLoader } from '../../module-loader/index';
import { RuntimeMode } from '../../../@types/astro.js';
/** Given a filePath URL, crawl Vite’s module graph to find all style imports. */
export declare function getStylesForURL(filePath: URL, loader: ModuleLoader, mode: RuntimeMode): Promise<{
    urls: Set<string>;
    stylesMap: Map<string, string>;
}>;
