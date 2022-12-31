import { promises as fs } from 'fs';
import Go from './wasm_exec.js';
import { fileURLToPath } from 'url';
export const transform = async (input, options) => {
    return getService().then((service) => service.transform(input, options));
};
export const parse = async (input, options) => {
    return getService().then((service) => service.parse(input, options));
};
export const convertToTSX = async (input, options) => {
    return getService().then((service) => service.convertToTSX(input, options));
};
export const compile = async (template) => {
    const { default: mod } = await import(`data:text/javascript;charset=utf-8;base64,${Buffer.from(template).toString('base64')}`);
    return mod;
};
let longLivedService;
let getService = () => {
    if (!longLivedService) {
        longLivedService = startRunningService().catch((err) => {
            // Let the caller try again if this fails.
            longLivedService = void 0;
            // But still, throw the error back up the caller.
            throw err;
        });
    }
    return longLivedService;
};
const instantiateWASM = async (wasmURL, importObject) => {
    let response = undefined;
    const fetchAndInstantiateTask = async () => {
        const wasmArrayBuffer = await fs.readFile(wasmURL).then((res) => res.buffer);
        return WebAssembly.instantiate(new Uint8Array(wasmArrayBuffer), importObject);
    };
    response = await fetchAndInstantiateTask();
    return response;
};
const startRunningService = async () => {
    const go = new Go();
    const wasm = await instantiateWASM(fileURLToPath(new URL('../astro.wasm', import.meta.url)), go.importObject);
    go.run(wasm.instance);
    const _service = globalThis['@astrojs/compiler'];
    return {
        transform: (input, options) => new Promise((resolve) => {
            try {
                resolve(_service.transform(input, options || {}));
            }
            catch (err) {
                // Recreate the service next time on panic
                longLivedService = void 0;
                throw err;
            }
        }),
        parse: (input, options) => new Promise((resolve) => resolve(_service.parse(input, options || {}))).then((result) => ({ ...result, ast: JSON.parse(result.ast) })),
        convertToTSX: (input, options) => {
            return new Promise((resolve) => resolve(_service.convertToTSX(input, options || {}))).then((result) => {
                return { ...result, map: JSON.parse(result.map) };
            });
        },
    };
};
