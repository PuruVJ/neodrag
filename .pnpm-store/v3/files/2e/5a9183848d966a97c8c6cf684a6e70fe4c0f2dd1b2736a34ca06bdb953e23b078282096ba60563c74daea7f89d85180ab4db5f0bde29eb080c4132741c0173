import type { VSCodeEmmetConfig } from '@vscode/emmet-helper';
import type { FormatCodeSettings, UserPreferences } from 'typescript';
import type { Connection, FormattingOptions } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { LSConfig, LSCSSConfig, LSHTMLConfig, LSTypescriptConfig } from './interfaces';
export declare const defaultLSConfig: LSConfig;
declare type DeepPartial<T> = T extends Record<string, unknown> ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
/**
 * Manager class to facilitate accessing and updating the user's config
 * Not to be confused with other kind of configurations (such as the Astro project configuration and the TypeScript/Javascript one)
 * For more info on this, see the [internal docs](../../../../../docs/internal/language-server/config.md)
 */
export declare class ConfigManager {
    private connection?;
    private hasConfigurationCapability?;
    private globalConfig;
    private documentSettings;
    shouldRefreshTSServices: boolean;
    private isTrusted;
    constructor(connection?: Connection | undefined, hasConfigurationCapability?: boolean | undefined);
    updateConfig(): void;
    removeDocument(scopeUri: string): void;
    getConfig<T>(section: string, scopeUri: string): Promise<T | Record<string, any>>;
    getEmmetConfig(document: TextDocument): Promise<VSCodeEmmetConfig>;
    getPrettierVSConfig(document: TextDocument): Promise<Record<string, any>>;
    getTSFormatConfig(document: TextDocument, vscodeOptions?: FormattingOptions): Promise<FormatCodeSettings>;
    getTSPreferences(document: TextDocument): Promise<UserPreferences>;
    /**
     * Return true if a plugin and an optional feature is enabled
     */
    isEnabled(document: TextDocument, plugin: keyof LSConfig, feature?: keyof LSTypescriptConfig | keyof LSCSSConfig | keyof LSHTMLConfig): Promise<boolean>;
    /**
     * Updating the global config should only be done in cases where the client doesn't support `workspace/configuration`
     * or inside of tests.
     *
     * The `outsideAstro` parameter can be set to true to change configurations in the global scope.
     * For example, to change TypeScript settings
     */
    updateGlobalConfig(config: DeepPartial<LSConfig> | any, outsideAstro?: boolean): void;
}
export {};
