import type { AstroSettings } from '../@types/astro';
import * as vite from 'vite';
/**
 * If any component is marked as doing head injection, walk up the tree
 * and mark parent Astro components as having head injection in the tree.
 * This is used at runtime to determine if we should wait for head content
 * to be populated before rendering the entire tree.
 */
export default function configHeadPropagationVitePlugin({ settings, }: {
    settings: AstroSettings;
}): vite.Plugin;
