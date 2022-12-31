import type { HTMLDocument, Range } from 'vscode-html-languageservice';
import { WritableDocument } from './DocumentBase';
import { AstroMetadata } from './parseAstro';
import { TagInformation } from './utils';
export declare class AstroDocument extends WritableDocument {
    url: string;
    content: string;
    languageId: string;
    astroMeta: AstroMetadata;
    html: HTMLDocument;
    styleTags: TagInformation[];
    scriptTags: TagInformation[];
    constructor(url: string, content: string);
    private updateDocInfo;
    setText(text: string): void;
    getText(range?: Range | undefined): string;
    getURL(): string;
    getFilePath(): string | null;
}
