import type { GetModuleInfo, ModuleInfo } from 'rollup';
export declare function walkParentInfos(id: string, ctx: {
    getModuleInfo: GetModuleInfo;
}, until?: (importer: string) => boolean, depth?: number, order?: number, seen?: Set<string>, childId?: string): Generator<[ModuleInfo, number, number], void, unknown>;
export declare function moduleIsTopLevelPage(info: ModuleInfo): boolean;
export declare function getTopLevelPages(id: string, ctx: {
    getModuleInfo: GetModuleInfo;
}): Generator<[ModuleInfo, number, number], void, unknown>;
