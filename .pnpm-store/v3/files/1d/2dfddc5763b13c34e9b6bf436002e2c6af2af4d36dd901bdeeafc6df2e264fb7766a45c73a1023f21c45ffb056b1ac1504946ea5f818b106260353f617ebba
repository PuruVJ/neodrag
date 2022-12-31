import type { Loader, TransformOptions } from 'esbuild';

export type Extension = `.${string}`;
export type Options = TransformOptions;

export type Config = {
	[extn: Extension]: Options;
}

export type ConfigFile =
	| { common?: Options; config?: Config; loaders?: never; [extn: Extension]: never }
	| { common?: Options; loaders?: Loaders; config?: never; [extn: Extension]: never }
	| { common?: Options; config?: never; loaders?: never; [extn: Extension]: Options }

export type Loaders = {
	[extn: Extension]: Loader;
}

/**
 * TypeScript helper for writing `tsm.js` contents.
 */
export function define(contents: ConfigFile): ConfigFile;
