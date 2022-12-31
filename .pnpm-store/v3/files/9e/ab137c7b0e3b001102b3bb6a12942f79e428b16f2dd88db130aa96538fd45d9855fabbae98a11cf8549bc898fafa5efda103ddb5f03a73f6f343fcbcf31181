/// <reference types="node" />
import type fsMod from 'node:fs';
import type { AstroSettings } from '../@types/astro.js';
import { LogOptions } from '../core/logger/core.js';
import { ContentObservable, ContentPaths } from './utils.js';
declare type ChokidarEvent = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';
declare type RawContentEvent = {
    name: ChokidarEvent;
    entry: string;
};
declare type EntryInfo = {
    id: string;
    slug: string;
    collection: string;
};
export declare type GenerateContentTypes = {
    init(): Promise<void>;
    queueEvent(event: RawContentEvent): void;
};
declare type CreateContentGeneratorParams = {
    contentConfigObserver: ContentObservable;
    logging: LogOptions;
    settings: AstroSettings;
    fs: typeof fsMod;
};
export declare function createContentTypesGenerator({ contentConfigObserver, fs, logging, settings, }: CreateContentGeneratorParams): Promise<GenerateContentTypes>;
export declare function getEntryInfo({ entry, contentDir, }: Pick<ContentPaths, 'contentDir'> & {
    entry: URL;
}): EntryInfo | Error;
export declare function getEntryType(entryPath: string, paths: ContentPaths): 'content' | 'config' | 'unknown' | 'generated-types';
export {};
