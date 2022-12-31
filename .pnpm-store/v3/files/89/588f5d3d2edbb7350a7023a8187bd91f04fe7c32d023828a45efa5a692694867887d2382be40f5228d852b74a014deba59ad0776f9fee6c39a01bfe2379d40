import * as tsr from 'tsconfig-resolver';
export declare const defaultTSConfig: tsr.TsConfigJson;
export declare type frameworkWithTSSettings = 'vue' | 'react' | 'preact' | 'solid-js';
export declare const presets: Map<frameworkWithTSSettings, tsr.TsConfigJson>;
/**
 * Load a tsconfig.json or jsconfig.json is the former is not found
 * @param cwd Directory to start from
 * @param resolve Determine if the function should go up directories like TypeScript would
 */
export declare function loadTSConfig(cwd: string | undefined, resolve?: boolean): tsr.TsConfigResult;
export declare function updateTSConfigForFramework(target: tsr.TsConfigJson, framework: frameworkWithTSSettings): tsr.TsConfigJson;
