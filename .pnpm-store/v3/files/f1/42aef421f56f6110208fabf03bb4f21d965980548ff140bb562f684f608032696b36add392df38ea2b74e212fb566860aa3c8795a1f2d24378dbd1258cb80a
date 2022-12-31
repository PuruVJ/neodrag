import type { AstroIntegration } from "astro";
import { type GenerateSWOptions, type InjectManifestOptions } from "workbox-build";
export interface ServiceWorkerConfig {
    /**
     * Enable the service worker in local development.
     *
     * The service worker's precaching of static files will prevent hot module reloading during development.
     *
     * If `false` then the service worker will not be registered and any previously installed service workers will be cleared.
     *
     * Defaults to `false`. Recommended: `false` for general development, `true` when testing or debugging your application's service worker.
     */
    enableInDevelopment?: boolean;
    registration?: {
        /**
         * Autoregister the service worker.
         *
         * If `false`, then the application must initialize the service worker by invoking `register`. Set this to `false` if you'd like to take control over when you service worker is initialized. You'll then need to add something like the following to your application:
         *
         * ```javascript
         * import { Workbox } from 'workbox-window';
         *
         * if ('serviceWorker' in navigator) {
         *   navigator.serviceWorker.register('/service-worker.js')
         * }
         * ```
         *
         * Defaults to `true`. Recommended: `true`.
         */
        autoRegister?: boolean;
    };
    /**
     * Options passed to `worbox-build`. See all available configuration options [here](https://developer.chrome.com/docs/workbox/modules/workbox-build/)
     *
     * Defaults to `GenerateSW` which will generate a service worker.
     */
    workbox?: InjectManifestOptions | GenerateSWOptions;
}
declare const createPlugin: (options?: ServiceWorkerConfig) => AstroIntegration;
export default createPlugin;
