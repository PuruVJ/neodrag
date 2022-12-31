import type * as ts from 'typescript/lib/tsserverlibrary';
import { LanguageModule, LanguageServiceHost } from './types';
export type LanguageContext = ReturnType<typeof createLanguageContext>;
export declare function createLanguageContext(host: LanguageServiceHost, languageModules: LanguageModule[]): {
    typescript: {
        languageServiceHost: ts.LanguageServiceHost;
    };
    virtualFiles: {
        update(fileName: string, snapshot: ts.IScriptSnapshot): import("./types").VirtualFile | undefined;
        delete(fileName: string): void;
        get(fileName: string): readonly [ts.IScriptSnapshot, import("./types").VirtualFile] | undefined;
        hasSourceFile: (fileName: string) => boolean;
        all: () => [string, ts.IScriptSnapshot, import("./types").VirtualFile, LanguageModule<import("./types").VirtualFile>][];
        getMirrorMap: (file: import("./types").VirtualFile) => import("./sourceMaps").MirrorMap | undefined;
        getMaps: (virtualFile: import("./types").VirtualFile) => [string, import("@volar/source-map").SourceMap<import("./types").FileRangeCapabilities>][];
        getSourceByVirtualFileName(fileName: string): readonly [string, ts.IScriptSnapshot, import("./types").VirtualFile] | undefined;
    };
};
