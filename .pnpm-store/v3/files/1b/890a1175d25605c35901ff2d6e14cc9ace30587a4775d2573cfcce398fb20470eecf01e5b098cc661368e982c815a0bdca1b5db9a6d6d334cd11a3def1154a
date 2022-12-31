import type { AstroUserConfig } from '../@types/astro';
interface ConfigInfo {
    markdownPlugins: string[];
    adapter: string | null;
    integrations: string[];
    trailingSlash: undefined | 'always' | 'never' | 'ignore';
    build: undefined | {
        format: undefined | 'file' | 'directory';
    };
    markdown: undefined | {
        drafts: undefined | boolean;
        syntaxHighlight: undefined | 'shiki' | 'prism' | false;
    };
}
interface EventPayload {
    cliCommand: string;
    config?: ConfigInfo;
    configKeys?: string[];
    flags?: string[];
    optionalIntegrations?: number;
}
export declare function eventCliSession(cliCommand: string, userConfig?: AstroUserConfig, flags?: Record<string, any>): {
    eventName: string;
    payload: EventPayload;
}[];
export {};
