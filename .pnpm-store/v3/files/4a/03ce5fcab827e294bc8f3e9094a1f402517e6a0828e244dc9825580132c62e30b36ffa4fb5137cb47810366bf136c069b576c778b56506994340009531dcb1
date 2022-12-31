import type { AstroTelemetry } from '@astrojs/telemetry';
import type yargs from 'yargs-parser';
import { LogOptions } from '../logger/core.js';
export interface AddOptions {
    logging: LogOptions;
    flags: yargs.Arguments;
    telemetry: AstroTelemetry;
    cwd?: string;
}
export interface IntegrationInfo {
    id: string;
    packageName: string;
    dependencies: [name: string, version: string][];
    type: 'integration' | 'adapter';
}
export default function add(names: string[], { cwd, flags, logging, telemetry }: AddOptions): Promise<void>;
export declare function validateIntegrations(integrations: string[]): Promise<IntegrationInfo[]>;
