import { Sfc, VueLanguagePlugin } from '../types';
import { TextRange } from '../types';
declare const plugin: VueLanguagePlugin;
export default plugin;
export declare function collectStyleCssClasses(sfc: Sfc, condition: (style: Sfc['styles'][number]) => boolean): {
    style: (typeof sfc.styles)[number];
    index: number;
    classNameRanges: TextRange[];
    classNames: string[];
}[];
export declare function collectCssVars(sfc: Sfc): {
    style: (typeof sfc.styles)[number];
    ranges: TextRange[];
}[];
