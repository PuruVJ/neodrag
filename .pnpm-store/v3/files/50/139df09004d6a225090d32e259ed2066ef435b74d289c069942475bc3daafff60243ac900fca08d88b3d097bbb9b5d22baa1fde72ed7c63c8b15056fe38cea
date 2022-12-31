/**
 * Icon mode
 */
type IconCSSMode = 'mask' | 'background';
/**
 * Selector for icon
 */
interface IconCSSIconSelectorOptions {
    pseudoSelector?: boolean;
    iconSelector?: string;
}
/**
 * Selector for icon when generating data from icon set
 */
interface IconCSSSelectorOptions extends IconCSSIconSelectorOptions {
    commonSelector?: string;
    overrideSelector?: string;
}
/**
 * Options common for both multiple icons and single icon
 */
interface IconCSSSharedOptions {
    varName?: string | null;
    forceSquare?: boolean;
}
/**
 * Mode
 */
interface IconCSSModeOptions {
    mode?: IconCSSMode;
}
/**
 * Options for generating common code
 *
 * Requires mode
 */
interface IconCSSCommonCodeOptions extends IconCSSSharedOptions, IconCSSIconSelectorOptions, Required<IconCSSModeOptions> {
}
/**
 * Options for generating data for one icon
 */
interface IconCSSItemOptions extends IconCSSSharedOptions, IconCSSSelectorOptions, Required<IconCSSModeOptions> {
}
/**
 * Formatting modes. Same as in SASS
 */
type CSSFormatMode = 'expanded' | 'compact' | 'compressed';
/**
 * Item to format
 */
interface CSSUnformattedItem {
    selector: string | string[];
    rules: Record<string, string>;
}
/**
 * Formatting options
 */
interface IconCSSFormatOptions {
    format?: CSSFormatMode;
}
/**
 * Options for generating data for one icon
 */
interface IconCSSIconOptions extends IconCSSSharedOptions, IconCSSIconSelectorOptions, IconCSSModeOptions, IconCSSFormatOptions {
}
/**
 * Options for generating multiple icons
 */
interface IconCSSIconSetOptions extends IconCSSSharedOptions, IconCSSSelectorOptions, IconCSSModeOptions, IconCSSFormatOptions {
}

export { CSSFormatMode, CSSUnformattedItem, IconCSSCommonCodeOptions, IconCSSFormatOptions, IconCSSIconOptions, IconCSSIconSelectorOptions, IconCSSIconSetOptions, IconCSSItemOptions, IconCSSMode, IconCSSModeOptions, IconCSSSelectorOptions, IconCSSSharedOptions };
