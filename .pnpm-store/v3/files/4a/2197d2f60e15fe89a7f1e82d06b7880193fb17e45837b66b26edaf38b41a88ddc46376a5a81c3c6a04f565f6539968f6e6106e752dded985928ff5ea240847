export declare type HydrationContext = {
    id: string;
    count: number;
};
declare type SharedConfig = {
    context?: HydrationContext;
    resources?: {
        [key: string]: any;
    };
    load?: (id: string) => Promise<any> | any | undefined;
    gather?: (key: string) => void;
    registry?: Map<string, Element>;
    done?: boolean;
};
export declare const sharedConfig: SharedConfig;
export declare function setHydrateContext(context?: HydrationContext): void;
export declare function nextHydrateContext(): HydrationContext | undefined;
export {};
