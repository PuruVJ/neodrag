/// <reference types="node" />
import { Server, Socket } from 'net';
export declare type HandlerResult = {
    description: string;
    error?: any;
    response?: string;
};
export declare function handleResult(socket: Socket, hr: HandlerResult): Promise<void>;
export declare function startServer(): Promise<Server>;
export declare function stopServer(): Promise<void>;
