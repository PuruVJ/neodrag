import { EventEmitter } from 'node:events';
import { HMRPayload, Plugin } from 'vite';
import { g as CustomEventMap, h as ViteNodeRunner, i as HMRPayload$1, H as HotContext } from './types-6a15e0b9.js';

type EventType = string | symbol;
type Handler<T = unknown> = (event: T) => void;
interface Emitter<Events extends Record<EventType, unknown>> {
    on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void;
    off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void;
    emit<Key extends keyof Events>(type: Key, event: Events[Key]): void;
    emit<Key extends keyof Events>(type: undefined extends Events[Key] ? Key : never): void;
}
type HMREmitter = Emitter<{
    'message': HMRPayload;
}> & EventEmitter;
declare module 'vite' {
    interface ViteDevServer {
        emitter: HMREmitter;
    }
}
declare function createHmrEmitter(): HMREmitter;
declare function viteNodeHmrPlugin(): Plugin;

type InferCustomEventPayload<T extends string> = T extends keyof CustomEventMap ? CustomEventMap[T] : any;
interface HotModule {
    id: string;
    callbacks: HotCallback[];
}
interface HotCallback {
    deps: string[];
    fn: (modules: object[]) => void;
}
interface CacheData {
    hotModulesMap: Map<string, HotModule>;
    dataMap: Map<string, any>;
    disposeMap: Map<string, (data: any) => void | Promise<void>>;
    pruneMap: Map<string, (data: any) => void | Promise<void>>;
    customListenersMap: Map<string, ((data: any) => void)[]>;
    ctxToListenersMap: Map<string, Map<string, ((data: any) => void)[]>>;
    messageBuffer: string[];
    isFirstUpdate: boolean;
    pending: boolean;
    queued: Promise<(() => void) | undefined>[];
}
declare function getCache(runner: ViteNodeRunner): CacheData;
declare function sendMessageBuffer(runner: ViteNodeRunner, emitter: HMREmitter): void;
declare function reload(runner: ViteNodeRunner, files: string[]): Promise<any[]>;
declare function handleMessage(runner: ViteNodeRunner, emitter: HMREmitter, files: string[], payload: HMRPayload$1): Promise<void>;
declare function createHotContext(runner: ViteNodeRunner, emitter: HMREmitter, files: string[], ownerPath: string): HotContext;

export { Emitter, EventType, HMREmitter, Handler, HotCallback, HotModule, InferCustomEventPayload, createHmrEmitter, createHotContext, getCache, handleMessage, reload, sendMessageBuffer, viteNodeHmrPlugin };
