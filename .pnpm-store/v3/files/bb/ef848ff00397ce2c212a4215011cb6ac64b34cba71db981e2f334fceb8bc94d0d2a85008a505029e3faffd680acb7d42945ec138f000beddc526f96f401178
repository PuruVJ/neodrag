import { ExtendedIconifyIcon, IconifyJSON } from '@iconify/types';

/**
 * Callback to call for each icon.
 *
 * If data === null, icon is missing.
 */
type SplitIconSetCallback = (name: string, data: ExtendedIconifyIcon | null) => void;
/**
 * Extract icons from an icon set
 *
 * Returns list of icons that were found in icon set
 */
declare function parseIconSet(data: IconifyJSON, callback: SplitIconSetCallback): string[];

export { SplitIconSetCallback, parseIconSet };
