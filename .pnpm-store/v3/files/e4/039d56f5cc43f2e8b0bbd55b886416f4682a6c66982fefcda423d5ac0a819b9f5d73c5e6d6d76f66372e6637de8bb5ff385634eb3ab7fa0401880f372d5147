import type { PluginObj } from '@babel/core';
/**
 * This plugin handles every file that runs through our JSX plugin.
 * Since we statically match every JSX file to an Astro renderer based on import scanning,
 * it would be helpful to embed some of that metadata at runtime.
 *
 * This plugin crawls each export in the file and "tags" each export with a given `rendererName`.
 * This allows us to automatically match a component to a renderer and skip the usual `check()` calls.
 */
export default function tagExportsWithRenderer({ rendererName, root, }: {
    rendererName: string;
    root: URL;
}): Promise<PluginObj>;
