import type { ResolvedModule } from 'typescript';
import type { DocumentSnapshot } from './snapshots/DocumentSnapshot';
/**
 * Creates a module loader specifically for `.astro` and other frameworks files.
 *
 * The typescript language service tries to look up other files that are referenced in the currently open astro file.
 * For `.ts`/`.js` files this works, for `.astro` and frameworks files it does not by default.
 * Reason: The typescript language service does not know about those file endings,
 * so it assumes it's a normal typescript file and searches for files like `../Component.astro.ts`, which is wrong.
 * In order to fix this, we need to wrap typescript's module resolution and reroute all `.astro.ts` file lookups to .astro.
 *
 * @param getSnapshot A function which returns a (in case of astro file fully preprocessed) typescript/javascript snapshot
 * @param compilerOptions The typescript compiler options
 */
export declare function createAstroModuleLoader(getSnapshot: (fileName: string) => DocumentSnapshot, compilerOptions: ts.CompilerOptions, ts: typeof import('typescript/lib/tsserverlibrary')): {
    fileExists: (path: string) => boolean;
    readFile: (path: string, encoding?: string | undefined) => string | undefined;
    readDirectory: (path: string, extensions?: readonly string[] | undefined, exclude?: readonly string[] | undefined, include?: readonly string[] | undefined, depth?: number | undefined) => string[];
    deleteFromModuleCache: (path: string) => void;
    deleteUnresolvedResolutionsFromCache: (path: string) => void;
    resolveModuleNames: (moduleNames: string[], containingFile: string, _reusedNames: string[] | undefined, _redirectedReference: ts.ResolvedProjectReference | undefined, _options: ts.CompilerOptions, containingSourceFile?: ts.SourceFile | undefined) => Array<ts.ResolvedModule | undefined>;
};
