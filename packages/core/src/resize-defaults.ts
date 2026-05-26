import { resizeHandles } from './resize/plugins.ts';
import type { ResizePlugin } from './resize/types.ts';

export const DEFAULT_RESIZE_PLUGINS: ResizePlugin[] = [resizeHandles({ edges: 'all' })];

export const MINIMAL_RESIZE_PLUGINS: ResizePlugin[] = [];
