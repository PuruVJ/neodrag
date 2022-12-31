import { logging, Path, PathFragment, virtualFs } from '@angular-devkit/core';
import { GenerateOptions } from '../command-line/generate';
import { Tree } from '../generators/tree';
import { FileBuffer } from '@angular-devkit/core/src/virtual-fs/host/interface';
import { Observable } from 'rxjs';
import { NxJsonConfiguration } from '../config/nx-json';
import { RawProjectsConfigurations, ProjectsConfigurations } from '../config/workspace-json-project-json';
export declare function scheduleTarget(root: string, opts: {
    project: string;
    target: string;
    configuration: string;
    runOptions: any;
}, verbose: boolean): Promise<Observable<import('@angular-devkit/architect').BuilderOutput>>;
export declare class NxScopedHost extends virtualFs.ScopedHost<any> {
    private root;
    protected __nxInMemoryWorkspace: ProjectsConfigurations | null;
    constructor(root: string);
    protected __readWorkspaceConfiguration: (configFileName: ChangeContext['actualConfigFileName'], overrides?: {
        workspace?: Observable<RawProjectsConfigurations>;
        nx?: Observable<NxJsonConfiguration>;
    }) => Observable<FileBuffer>;
    read(path: Path): Observable<FileBuffer>;
    write(path: Path, content: FileBuffer): Observable<void>;
    isFile(path: Path): Observable<boolean>;
    exists(path: Path): Observable<boolean>;
    workspaceConfigName(): Promise<string>;
    protected context(path: string): Observable<ChangeContext>;
    private writeWorkspaceConfiguration;
    private __saveNxJsonProps;
    private writeWorkspaceConfigFiles;
    protected resolveInlineProjectConfigurations(config: RawProjectsConfigurations): Observable<ProjectsConfigurations>;
}
declare type ConfigFilePath = ('/angular.json' | '/workspace.json') & {
    __PRIVATE_DEVKIT_PATH: void;
};
declare type ChangeContext = {
    isWorkspaceConfig: boolean;
    actualConfigFileName: ConfigFilePath | null;
    isNewFormat: boolean;
};
export declare class NxScopeHostUsedForWrappedSchematics extends NxScopedHost {
    private readonly host;
    constructor(root: string, host: Tree);
    read(path: Path): Observable<FileBuffer>;
    exists(path: Path): Observable<boolean>;
    isDirectory(path: Path): Observable<boolean>;
    isFile(path: Path): Observable<boolean>;
    list(path: Path): Observable<PathFragment[]>;
}
export declare function generate(root: string, opts: GenerateOptions, verbose: boolean): Promise<number>;
export declare function runMigration(root: string, packageName: string, migrationName: string, isVerbose: boolean): Promise<{
    loggingQueue: string[];
    madeChanges: boolean;
}>;
/**
 * By default, Angular Devkit schematic collections will be resolved using the Node resolution.
 * This doesn't work if you are testing schematics that refer to other schematics in the
 * same repo.
 *
 * This function can can be used to override the resolution behaviour.
 *
 * Example:
 *
 * ```typescript
 *   overrideCollectionResolutionForTesting({
 *     '@nrwl/workspace': path.join(__dirname, '../../../../workspace/generators.json'),
 *     '@nrwl/angular': path.join(__dirname, '../../../../angular/generators.json'),
 *     '@nrwl/linter': path.join(__dirname, '../../../../linter/generators.json')
 *   });
 *
 * ```
 */
export declare function overrideCollectionResolutionForTesting(collections: {
    [name: string]: string;
}): void;
/**
 * If you have an Nx Devkit generator invoking the wrapped Angular Devkit schematic,
 * and you don't want the Angular Devkit schematic to run, you can mock it up using this function.
 *
 * Unfortunately, there are some edge cases in the Nx-Angular devkit integration that
 * can be seen in the unit tests context. This function is useful for handling that as well.
 *
 * In this case, you can mock it up.
 *
 * Example:
 *
 * ```typescript
 *   mockSchematicsForTesting({
 *     'mycollection:myschematic': (tree, params) => {
 *        tree.write('README.md');
 *     }
 *   });
 *
 * ```
 */
export declare function mockSchematicsForTesting(schematics: {
    [name: string]: (host: Tree, generatorOptions: {
        [k: string]: any;
    }) => Promise<void>;
}): void;
export declare function wrapAngularDevkitSchematic(collectionName: string, generatorName: string): (host: Tree, generatorOptions: {
    [k: string]: any;
}) => Promise<any>;
export declare function invokeNew(root: string, opts: GenerateOptions, verbose: boolean): Promise<number>;
export declare const getLogger: (isVerbose?: boolean) => logging.Logger;
export {};
