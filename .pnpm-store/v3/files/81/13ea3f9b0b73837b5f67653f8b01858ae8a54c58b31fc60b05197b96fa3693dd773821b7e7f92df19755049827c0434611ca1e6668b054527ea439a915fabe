import { SourceMap } from '@volar/source-map';
import { MirrorMap } from './sourceMaps';
import type { LanguageModule, FileRangeCapabilities, VirtualFile } from './types';
export type VirtualFiles = ReturnType<typeof createVirtualFiles>;
type Row = [
    string,
    ts.IScriptSnapshot,
    VirtualFile,
    LanguageModule
];
export declare function createVirtualFiles(languageModules: LanguageModule[]): {
    update(fileName: string, snapshot: ts.IScriptSnapshot): VirtualFile | undefined;
    delete(fileName: string): void;
    get(fileName: string): readonly [import("typescript/lib/tsserverlibrary").IScriptSnapshot, VirtualFile] | undefined;
    hasSourceFile: (fileName: string) => boolean;
    all: () => Row[];
    getMirrorMap: (file: VirtualFile) => MirrorMap | undefined;
    getMaps: (virtualFile: VirtualFile) => [string, SourceMap<FileRangeCapabilities>][];
    getSourceByVirtualFileName(fileName: string): readonly [string, import("typescript/lib/tsserverlibrary").IScriptSnapshot, VirtualFile] | undefined;
};
export declare function forEachEmbeddedFile(file: VirtualFile, cb: (embedded: VirtualFile) => void): void;
export {};
