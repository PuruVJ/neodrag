export { ProloadError } from './error.cjs';

export interface Config<T> {
    /** An absolute path to a resolved configuration file */
    filePath: string;
    /** The raw value of a resolved configuration file, before being merged with any `extends` configurations */
    raw: any;
    /** The final, resolved value of a resolved configuration file */
    value: T;
}

export interface ResolveOptions {
    /** 
      * An exact filePath to a configuration file which should be loaded. If passed, this will keep proload from searching
      * for matching files.
      *
      * [Read the `@proload/core` docs](https://github.com/natemoo-re/proload/tree/main/packages/core#filepath)
      */
    filePath?: string;
    /** 
      * The location from which to begin searching up the directory tree 
      *
      * [Read the `@proload/core` docs](https://github.com/natemoo-re/proload/tree/main/packages/core#cwd)
      */
    cwd?: string;
    /** 
      * If a configuration _must_ be resolved. If `true`, Proload will throw an error when a configuration is not found
      *
      * [Read the `@proload/core` docs](https://github.com/natemoo-re/proload/tree/main/packages/core#mustExist)
      */
    mustExist?: boolean;
    /** 
      * A function to completely customize module resolution
      *
      * [Read the `@proload/core` docs](https://github.com/natemoo-re/proload/tree/main/packages/core#accept)
      */
    accept?(fileName: string, context: { directory: string }): boolean|void;
}

export interface LoadOptions<T> {
    /** 
      * An exact filePath to a configuration file which should be loaded. If passed, this will keep proload from searching
      * for matching files.
      *
      * [Read the `@proload/core` docs](https://github.com/natemoo-re/proload/tree/main/packages/core#filepath)
      */
    filePath?: string;
    /** 
      * The location from which to begin searching up the directory tree 
      *
      * [Read the `@proload/core` docs](https://github.com/natemoo-re/proload/tree/main/packages/core#cwd)
      */
    cwd?: string;
    /** 
      * If a configuration _must_ be resolved. If `true`, Proload will throw an error when a configuration is not found
      *
      * [Read the `@proload/core` docs](https://github.com/natemoo-re/proload/tree/main/packages/core#mustExist)
      */
    mustExist?: boolean;
    /** 
      * If a resolved configuration file exports a factory function, this value will be passed as arguments to the function
      *
      * [Read the `@proload/core` docs](https://github.com/natemoo-re/proload/tree/main/packages/core#context)
      */
    context?: any;
    /**
      * A function to customize the `merge` behavior when a config with `extends` is encountered 
      *
      * [Read the `@proload/core` docs](https://github.com/natemoo-re/proload/tree/main/packages/core#merge)
      */
    merge?(x: Partial<T>, y: Partial<T>): Partial<T>;
    /** 
      * A function to completely customize module resolution
      *
      * [Read the `@proload/core` docs](https://github.com/natemoo-re/proload/tree/main/packages/core#accept)
      */
    accept?(fileName: string, context: { directory: string }): boolean|void;
}

export interface Plugin {
    /** a unique identifier for your plugin */
    name: string;
    /** extensions which should be resolved, including the leading period */
    extensions?: string[];
    /** fileName patterns which should be resolved, excluding the trailing extension */
    fileNames?: string[];
    /** Executed before require/import of config file */
    register?(filePath: string): Promise<void>;
    /** Modify the config file before passing it along */
    transform?(module: any): Promise<any>;
}

/**
 * An `async` function which searches for a configuration file
 *
 * [Read the `@proload/core` docs](https://github.com/natemoo-re/proload/tree/main/packages/core#resolve)
 */
export async function resolve(namespace: string, opts?: ResolveOptions): Promise<string|undefined>;

interface Load<T extends Record<any, any> = Record<any, any>> {
    /**
     * @param namespace The namespace which will be searched for the configuration file.
     * 
     * For example, passing `"donut"` would resolve a files like `donut.config.js`, `donut.config.cjs`, and `donut.config.mjs` as well as a `package.json` with a `donut` property.
     *
     * @param opts Options to customize loader behavior
     */
    (namespace: string, opts?: LoadOptions<T>): Promise<Config<T>|undefined>;
    use(plugins: Plugin[]): void;
}

/**
 * An `async` function which searches for and loads a configuration file
 *
 * [Read the `@proload/core` docs](https://github.com/natemoo-re/proload/tree/main/packages/core#load)
 */
declare const load: Load;

export = load;
export default load;
