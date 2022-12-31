/// <reference types="node" />
import matter from 'gray-matter';
import type fsMod from 'node:fs';
import { z } from 'zod';
import { AstroSettings } from '../@types/astro.js';
export declare const collectionConfigParser: z.ZodObject<{
    schema: z.ZodOptional<z.ZodAny>;
    slug: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodObject<{
        id: z.ZodString;
        collection: z.ZodString;
        defaultSlug: z.ZodString;
        body: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        data: Record<string, any>;
        body: string;
        collection: string;
        defaultSlug: string;
    }, {
        id: string;
        data: Record<string, any>;
        body: string;
        collection: string;
        defaultSlug: string;
    }>], z.ZodUnknown>, z.ZodUnion<[z.ZodString, z.ZodPromise<z.ZodString>]>>>;
}, "strip", z.ZodTypeAny, {
    schema?: any;
    slug?: ((args_0: {
        id: string;
        data: Record<string, any>;
        body: string;
        collection: string;
        defaultSlug: string;
    }, ...args_1: unknown[]) => string | Promise<string>) | undefined;
}, {
    schema?: any;
    slug?: ((args_0: {
        id: string;
        data: Record<string, any>;
        body: string;
        collection: string;
        defaultSlug: string;
    }, ...args_1: unknown[]) => string | Promise<string>) | undefined;
}>;
export declare const contentConfigParser: z.ZodObject<{
    collections: z.ZodRecord<z.ZodString, z.ZodObject<{
        schema: z.ZodOptional<z.ZodAny>;
        slug: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodObject<{
            id: z.ZodString;
            collection: z.ZodString;
            defaultSlug: z.ZodString;
            body: z.ZodString;
            data: z.ZodRecord<z.ZodString, z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            data: Record<string, any>;
            body: string;
            collection: string;
            defaultSlug: string;
        }, {
            id: string;
            data: Record<string, any>;
            body: string;
            collection: string;
            defaultSlug: string;
        }>], z.ZodUnknown>, z.ZodUnion<[z.ZodString, z.ZodPromise<z.ZodString>]>>>;
    }, "strip", z.ZodTypeAny, {
        schema?: any;
        slug?: ((args_0: {
            id: string;
            data: Record<string, any>;
            body: string;
            collection: string;
            defaultSlug: string;
        }, ...args_1: unknown[]) => string | Promise<string>) | undefined;
    }, {
        schema?: any;
        slug?: ((args_0: {
            id: string;
            data: Record<string, any>;
            body: string;
            collection: string;
            defaultSlug: string;
        }, ...args_1: unknown[]) => string | Promise<string>) | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    collections: Record<string, {
        schema?: any;
        slug?: ((args_0: {
            id: string;
            data: Record<string, any>;
            body: string;
            collection: string;
            defaultSlug: string;
        }, ...args_1: unknown[]) => string | Promise<string>) | undefined;
    }>;
}, {
    collections: Record<string, {
        schema?: any;
        slug?: ((args_0: {
            id: string;
            data: Record<string, any>;
            body: string;
            collection: string;
            defaultSlug: string;
        }, ...args_1: unknown[]) => string | Promise<string>) | undefined;
    }>;
}>;
export declare type CollectionConfig = z.infer<typeof collectionConfigParser>;
export declare type ContentConfig = z.infer<typeof contentConfigParser>;
declare type Entry = {
    id: string;
    collection: string;
    slug: string;
    data: any;
    body: string;
    _internal: {
        rawData: string;
        filePath: string;
    };
};
export declare const msg: {
    collectionConfigMissing: (collection: string) => string;
};
export declare function getEntrySlug(entry: Entry, collectionConfig: CollectionConfig): Promise<string>;
export declare function getEntryData(entry: Entry, collectionConfig: CollectionConfig): Promise<any>;
/**
 * Match YAML exception handling from Astro core errors
 * @see 'astro/src/core/errors.ts'
 */
export declare function parseFrontmatter(fileContents: string, filePath: string): matter.GrayMatterFile<string>;
export declare class NotFoundError extends TypeError {
}
export declare class ZodParseError extends TypeError {
}
export declare function loadContentConfig({ fs, settings, }: {
    fs: typeof fsMod;
    settings: AstroSettings;
}): Promise<ContentConfig | Error>;
declare type ContentCtx = {
    status: 'loading';
} | {
    status: 'loaded';
    config: ContentConfig;
} | {
    status: 'error';
    error: NotFoundError | ZodParseError;
};
declare type Observable<C> = {
    get: () => C;
    set: (ctx: C) => void;
    subscribe: (fn: (ctx: C) => void) => () => void;
};
export declare type ContentObservable = Observable<ContentCtx>;
export declare function contentObservable(initialCtx: ContentCtx): ContentObservable;
export declare type ContentPaths = {
    contentDir: URL;
    cacheDir: URL;
    generatedInputDir: URL;
    config: URL;
};
export declare function getContentPaths({ srcDir }: {
    srcDir: URL;
}): ContentPaths;
export {};
