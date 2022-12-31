import { ae as Environment } from './types-2a26f28c.js';
import 'vite';
import 'tinybench';
import 'vite-node/client';
import 'vite-node/server';
import 'vite-node';
import 'node:fs';
import 'node:worker_threads';

declare const environments: {
    node: Environment;
    jsdom: Environment;
    'happy-dom': Environment;
    'edge-runtime': Environment;
};

interface PopulateOptions {
    bindFunctions?: boolean;
}
declare function populateGlobal(global: any, win: any, options?: PopulateOptions): {
    keys: Set<string>;
    skipKeys: string[];
    originals: Map<string | symbol, any>;
};

export { environments as builtinEnvironments, populateGlobal };
