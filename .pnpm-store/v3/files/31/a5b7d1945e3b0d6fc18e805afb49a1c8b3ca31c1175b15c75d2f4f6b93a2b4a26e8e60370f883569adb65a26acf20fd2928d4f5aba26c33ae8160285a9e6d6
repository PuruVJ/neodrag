import { e as ViteNodeServerOptions } from './types-6a15e0b9.js';

interface CliOptions {
    root?: string;
    config?: string;
    watch?: boolean;
    options?: ViteNodeServerOptionsCLI;
    '--'?: string[];
}
type Optional<T> = T | undefined;
type ComputeViteNodeServerOptionsCLI<T extends Record<string, any>> = {
    [K in keyof T]: T[K] extends Optional<RegExp[]> ? string | string[] : T[K] extends Optional<(string | RegExp)[]> ? string | string[] : T[K] extends Optional<(string | RegExp)[] | true> ? string | string[] | true : T[K] extends Optional<Record<string, any>> ? ComputeViteNodeServerOptionsCLI<T[K]> : T[K];
};
type ViteNodeServerOptionsCLI = ComputeViteNodeServerOptionsCLI<ViteNodeServerOptions>;

export { CliOptions, ViteNodeServerOptionsCLI };
