declare type GlobResult = Record<string, () => Promise<any>>;
declare type CollectionToEntryMap = Record<string, GlobResult>;
export declare function createCollectionToGlobResultMap({ globResult, contentDir, }: {
    globResult: GlobResult;
    contentDir: string;
}): CollectionToEntryMap;
export declare function createGetCollection({ collectionToEntryMap, collectionToRenderEntryMap, }: {
    collectionToEntryMap: CollectionToEntryMap;
    collectionToRenderEntryMap: CollectionToEntryMap;
}): (collection: string, filter?: () => boolean) => Promise<{
    id: any;
    slug: any;
    body: any;
    collection: any;
    data: any;
    render(): Promise<{
        Content: import("../runtime/server/index.js").AstroComponentFactory;
        headings: any;
        injectedFrontmatter: any;
    }>;
}[]>;
export declare function createGetEntry({ collectionToEntryMap, collectionToRenderEntryMap, }: {
    collectionToEntryMap: CollectionToEntryMap;
    collectionToRenderEntryMap: CollectionToEntryMap;
}): (collection: string, entryId: string) => Promise<{
    id: any;
    slug: any;
    body: any;
    collection: any;
    data: any;
    render(): Promise<{
        Content: import("../runtime/server/index.js").AstroComponentFactory;
        headings: any;
        injectedFrontmatter: any;
    }>;
}>;
export {};
