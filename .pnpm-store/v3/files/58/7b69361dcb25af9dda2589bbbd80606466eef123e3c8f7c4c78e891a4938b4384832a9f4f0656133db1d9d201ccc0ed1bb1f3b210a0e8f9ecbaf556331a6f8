import * as ts from 'typescript/lib/tsserverlibrary';
import * as vue from '@volar/vue-language-core';
import * as vueTs from '@volar/vue-typescript';
export type _Program = ts.Program & {
    __vue: ProgramContext;
};
interface ProgramContext {
    projectVersion: number;
    options: ts.CreateProgramOptions;
    languageServiceHost: vue.LanguageServiceHost;
    languageService: ReturnType<typeof vueTs.createLanguageService>;
}
export declare function createProgram(options: ts.CreateProgramOptions, // rootNamesOrOptions: readonly string[] | CreateProgramOptions,
_options?: ts.CompilerOptions, _host?: ts.CompilerHost, _oldProgram?: ts.Program, _configFileParsingDiagnostics?: readonly ts.Diagnostic[]): _Program;
export declare function loadTsLib(): typeof ts;
export {};
