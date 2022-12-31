import '../@types/network-information.d.ts';
export interface PrefetchOptions {
    /**
     * Element selector used to find all links on the page that should be prefetched.
     *
     * @default 'a[href][rel~="prefetch"]'
     */
    selector?: string;
    /**
     * The number of pages that can be prefetched concurrently.
     *
     * @default 1
     */
    throttle?: number;
}
export default function prefetch({ selector, throttle, }: PrefetchOptions): Promise<never> | undefined;
