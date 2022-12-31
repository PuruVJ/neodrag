import { type ErrorPayload, type Logger, type LogLevel } from 'vite';
import type { ModuleLoader } from '../../module-loader/index.js';
import { type ErrorWithMetadata } from '../errors.js';
/**
 * Custom logger with better error reporting for incompatible packages
 */
export declare function createCustomViteLogger(logLevel: LogLevel): Logger;
export declare function enhanceViteSSRError(error: unknown, filePath?: URL, loader?: ModuleLoader): Error;
export interface AstroErrorPayload {
    type: ErrorPayload['type'];
    err: Omit<ErrorPayload['err'], 'loc'> & {
        name?: string;
        title?: string;
        hint?: string;
        docslink?: string;
        highlightedCode?: string;
        loc: {
            file?: string;
            line?: number;
            column?: number;
        };
    };
}
/**
 * Generate a payload for Vite's error overlay
 */
export declare function getViteErrorPayload(err: ErrorWithMetadata): Promise<AstroErrorPayload>;
