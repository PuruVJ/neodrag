/// <reference types="node" />
import type { Server, Socket } from 'net';
import type { AsyncSubscription } from '@parcel/watcher';
export declare const SERVER_INACTIVITY_TIMEOUT_MS: 10800000;
export declare function getSourceWatcherSubscription(): AsyncSubscription;
export declare function getOutputsWatcherSubscription(): AsyncSubscription;
export declare function storeSourceWatcherSubscription(s: AsyncSubscription): void;
export declare function storeOutputsWatcherSubscription(s: AsyncSubscription): void;
interface HandleServerProcessTerminationParams {
    server: Server;
    reason: string;
}
export declare function handleServerProcessTermination({ server, reason, }: HandleServerProcessTerminationParams): Promise<void>;
export declare function resetInactivityTimeout(cb: () => void): void;
export declare function respondToClient(socket: Socket, response: string, description: string): Promise<unknown>;
export declare function respondWithErrorAndExit(socket: Socket, description: string, error: Error): Promise<void>;
export {};
