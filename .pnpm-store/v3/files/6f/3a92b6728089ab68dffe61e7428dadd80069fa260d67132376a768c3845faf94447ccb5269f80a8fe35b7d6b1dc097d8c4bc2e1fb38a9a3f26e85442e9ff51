import type { Options as MdxRollupPluginOptions } from '@mdx-js/rollup';
import type { AstroConfig } from 'astro';
import type { VFile } from 'vfile';
import { MdxOptions } from './index.js';
export declare function recmaInjectImportMetaEnvPlugin({ importMetaEnv, }: {
    importMetaEnv: Record<string, any>;
}): (tree: any) => void;
export declare function remarkInitializeAstroData(): (tree: any, vfile: VFile) => void;
export declare function rehypeApplyFrontmatterExport(pageFrontmatter: Record<string, any>): (tree: any, vfile: VFile) => void;
export declare function getRemarkPlugins(mdxOptions: MdxOptions, config: AstroConfig): Promise<MdxRollupPluginOptions['remarkPlugins']>;
export declare function getRehypePlugins(mdxOptions: MdxOptions, config: AstroConfig): MdxRollupPluginOptions['rehypePlugins'];
