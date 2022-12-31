import * as vue from '@volar/vue-language-core';
export declare function createLanguageService(host: vue.LanguageServiceHost): {
    __internal__: {
        languageService: import("typescript/lib/tsserverlibrary").LanguageService;
        context: {
            typescript: {
                languageServiceHost: import("typescript/lib/tsserverlibrary").LanguageServiceHost;
            };
            virtualFiles: {
                update(fileName: string, snapshot: import("typescript/lib/tsserverlibrary").IScriptSnapshot): import("@volar/language-core").VirtualFile | undefined;
                delete(fileName: string): void;
                get(fileName: string): readonly [import("typescript/lib/tsserverlibrary").IScriptSnapshot, import("@volar/language-core").VirtualFile] | undefined;
                hasSourceFile: (fileName: string) => boolean;
                all: () => [string, import("typescript/lib/tsserverlibrary").IScriptSnapshot, import("@volar/language-core").VirtualFile, import("@volar/language-core").LanguageModule<import("@volar/language-core").VirtualFile>][];
                getMirrorMap: (file: import("@volar/language-core").VirtualFile) => import("@volar/language-core").MirrorMap | undefined;
                getMaps: (virtualFile: import("@volar/language-core").VirtualFile) => [string, import("@volar/source-map").SourceMap<import("@volar/language-core").FileRangeCapabilities>][];
                getSourceByVirtualFileName(fileName: string): readonly [string, import("typescript/lib/tsserverlibrary").IScriptSnapshot, import("@volar/language-core").VirtualFile] | undefined;
            };
        };
    };
} & import("typescript/lib/tsserverlibrary").LanguageService;
