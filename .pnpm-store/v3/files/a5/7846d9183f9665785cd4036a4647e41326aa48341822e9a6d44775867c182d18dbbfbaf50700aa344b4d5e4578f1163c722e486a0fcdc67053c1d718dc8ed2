interface Frontmatter {
    state: null | 'open' | 'closed';
    startOffset: null | number;
    endOffset: null | number;
}
interface Content {
    firstNonWhitespaceOffset: null | number;
}
export interface AstroMetadata {
    frontmatter: Frontmatter;
    content: Content;
}
/** Parses a document to collect metadata about Astro features */
export declare function parseAstro(content: string): AstroMetadata;
export {};
