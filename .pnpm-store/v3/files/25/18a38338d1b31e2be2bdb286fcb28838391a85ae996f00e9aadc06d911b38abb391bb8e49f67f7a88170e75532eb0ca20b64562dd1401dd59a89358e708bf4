import type { AstroSettings } from '../@types/astro';
import type * as vite from 'vite';
/** Result of successfully parsed tsconfig.json or jsconfig.json. */
export declare interface Alias {
    find: RegExp;
    replacement: string;
}
/** Returns a Vite plugin used to alias paths from tsconfig.json and jsconfig.json. */
export default function configAliasVitePlugin({ settings, }: {
    settings: AstroSettings;
}): vite.PluginOption;
