import Go from './wasm_exec.js';
export const transform = (input, options) => {
    return ensureServiceIsRunning().transform(input, options);
};
export const parse = (input, options) => {
    return ensureServiceIsRunning().parse(input, options);
};
let initializePromise;
let longLivedService;
export const initialize = async (options) => {
    let wasmURL = options.wasmURL;
    if (!wasmURL)
        throw new Error('Must provide the "wasmURL" option');
    wasmURL += '';
    if (!initializePromise) {
        initializePromise = startRunningService(wasmURL).catch((err) => {
            // Let the caller try again if this fails.
            initializePromise = void 0;
            // But still, throw the error back up the caller.
            throw err;
        });
    }
    longLivedService = longLivedService || (await initializePromise);
};
let ensureServiceIsRunning = () => {
    if (!initializePromise)
        throw new Error('You need to call "initialize" before calling this');
    if (!longLivedService)
        throw new Error('You need to wait for the promise returned from "initialize" to be resolved before calling this');
    return longLivedService;
};
const instantiateWASM = async (wasmURL, importObject) => {
    let response = undefined;
    if (WebAssembly.instantiateStreaming) {
        response = await WebAssembly.instantiateStreaming(fetch(wasmURL), importObject);
    }
    else {
        const fetchAndInstantiateTask = async () => {
            const wasmArrayBuffer = await fetch(wasmURL).then((res) => res.arrayBuffer());
            return WebAssembly.instantiate(wasmArrayBuffer, importObject);
        };
        response = await fetchAndInstantiateTask();
    }
    return response;
};
const startRunningService = async (wasmURL) => {
    const go = new Go();
    const wasm = await instantiateWASM(wasmURL, go.importObject);
    go.run(wasm.instance);
    const service = globalThis['@astrojs/compiler'];
    return {
        transform: (input, options) => new Promise((resolve) => resolve(service.transform(input, options || {}))),
        parse: (input, options) => new Promise((resolve) => resolve(service.parse(input, options || {}))).then((result) => ({ ...result, ast: JSON.parse(result.ast) })),
    };
};
