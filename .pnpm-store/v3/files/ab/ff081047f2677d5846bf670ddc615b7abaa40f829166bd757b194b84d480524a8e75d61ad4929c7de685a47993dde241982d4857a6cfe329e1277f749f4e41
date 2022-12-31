import type { AstroTelemetry } from '@astrojs/telemetry';
import type { AstroSettings, PreviewServer } from '../../@types/astro';
import type { LogOptions } from '../logger/core';
interface PreviewOptions {
    logging: LogOptions;
    telemetry: AstroTelemetry;
}
/** The primary dev action */
export default function preview(_settings: AstroSettings, { logging }: PreviewOptions): Promise<PreviewServer>;
export {};
