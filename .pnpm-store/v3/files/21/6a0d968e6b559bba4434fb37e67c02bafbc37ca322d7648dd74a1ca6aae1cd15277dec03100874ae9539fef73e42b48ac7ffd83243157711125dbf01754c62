/// <reference types="node" />
import { Writable } from 'stream';
export declare const nodeLogDestination: Writable;
interface LogWritable<T> {
    write: (chunk: T) => boolean;
}
export declare type LoggerLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
export declare type LoggerEvent = 'info' | 'warn' | 'error';
export interface LogOptions {
    dest?: LogWritable<LogMessage>;
    level?: LoggerLevel;
}
export declare const nodeLogOptions: Required<LogOptions>;
export interface LogMessage {
    type: string | null;
    level: LoggerLevel;
    message: string;
}
export declare const levels: Record<LoggerLevel, number>;
/**
 * Emit a message only shown in debug mode.
 * Astro (along with many of its dependencies) uses the `debug` package for debug logging.
 * You can enable these logs with the `DEBUG=astro:*` environment variable.
 * More info https://github.com/debug-js/debug#environment-variables
 */
export declare function debug(type: string, ...messages: Array<any>): any;
export declare const logger: {
    info: (type: string | null, message: string) => void;
    warn: (type: string | null, message: string) => void;
    error: (type: string | null, message: string) => void;
};
export declare function enableVerboseLogging(): void;
export {};
