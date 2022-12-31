import { DiagnosticCode } from '@astrojs/compiler/shared/diagnostics.js';
import { AstroErrorCodes } from './errors-data.js';
/**
 * Get the line and character based on the offset
 * @param offset The index of the position
 * @param text The text for which the position should be retrieved
 */
export declare function positionAt(offset: number, text: string): {
    line: number;
    column: number;
};
/** Coalesce any throw variable to an Error instance. */
export declare function createSafeError(err: any): Error;
export declare function normalizeLF(code: string): string;
export declare function getErrorDataByCode(code: AstroErrorCodes | DiagnosticCode): {
    name: string;
    data: {
        readonly title: "Unknown compiler error.";
        readonly code: 1000;
    } | {
        readonly title: "`Astro.redirect` is not available in static mode.";
        readonly code: 3001;
        readonly message: "Redirects are only available when using `output: 'server'`. Update your Astro config if you need SSR features.";
        readonly hint: "See https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project for more information on how to enable SSR.";
    } | {
        readonly title: "`Astro.clientAddress` is not available in current adapter.";
        readonly code: 3002;
        readonly message: (adapterName: string) => string;
    } | {
        readonly title: "`Astro.clientAddress` is not available in static mode.";
        readonly code: 3003;
        readonly message: "`Astro.clientAddress` is only available when using `output: 'server'`. Update your Astro config if you need SSR features.";
        readonly hint: "See https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project for more information on how to enable SSR.";
    } | {
        readonly title: "No static path found for requested path.";
        readonly code: 3004;
        readonly message: (pathName: string) => string;
        readonly hint: (possibleRoutes: string[]) => string;
    } | {
        readonly title: "Invalid type returned by Astro page.";
        readonly code: 3005;
        readonly message: (route: string | undefined, returnedValue: string) => string;
        readonly hint: "See https://docs.astro.build/en/guides/server-side-rendering/#response for more information.";
    } | {
        readonly title: "Missing value for `client:media` directive.";
        readonly code: 3006;
        readonly message: "Media query not provided for `client:media` directive. A media query similar to `client:media=\"(max-width: 600px)\"` must be provided";
    } | {
        readonly title: "No matching renderer found.";
        readonly code: 3007;
        readonly message: (componentName: string, componentExtension: string | undefined, plural: boolean, validRenderersCount: number) => string;
        readonly hint: (probableRenderers: string) => string;
    } | {
        readonly title: "No client entrypoint specified in renderer.";
        readonly code: 3008;
        readonly message: (componentName: string, clientDirective: string, rendererName: string) => string;
        readonly hint: "See https://docs.astro.build/en/reference/integrations-reference/#addrenderer-option for more information on how to configure your renderer.";
    } | {
        readonly title: "Missing hint on client:only directive.";
        readonly code: 3009;
        readonly message: (componentName: string) => string;
        readonly hint: (probableRenderers: string) => string;
    } | {
        readonly title: "Invalid value returned by a `getStaticPaths` path.";
        readonly code: 3010;
        readonly message: (paramType: any) => string;
        readonly hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths.";
    } | {
        readonly title: "Invalid value returned by getStaticPaths.";
        readonly code: 3011;
        readonly message: (returnType: any) => string;
        readonly hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths.";
    } | {
        readonly title: "getStaticPaths RSS helper is not available anymore.";
        readonly code: 3012;
        readonly message: "The RSS helper has been removed from `getStaticPaths`. Try the new @astrojs/rss package instead.";
        readonly hint: "See https://docs.astro.build/en/guides/rss/ for more information.";
    } | {
        readonly title: "Missing params property on `getStaticPaths` route.";
        readonly code: 3013;
        readonly message: "Missing or empty required `params` property on `getStaticPaths` route.";
        readonly hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths.";
    } | {
        readonly title: "Invalid value for `getStaticPaths` route parameter.";
        readonly code: 3014;
        readonly message: (key: string, value: any, valueType: any) => string;
        readonly hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths.";
    } | {
        readonly title: "`getStaticPaths()` function required for dynamic routes.";
        readonly code: 3015;
        readonly message: "`getStaticPaths()` function is required for dynamic routes. Make sure that you `export` a `getStaticPaths` function from your dynamic route.";
        readonly hint: "See https://docs.astro.build/en/core-concepts/routing/#dynamic-routes for more information on dynamic routes.\n\nAlternatively, set `output: \"server\"` in your Astro config file to switch to a non-static server build.\nSee https://docs.astro.build/en/guides/server-side-rendering/ for more information on non-static rendering.";
    } | {
        readonly title: "Invalid slot name.";
        readonly code: 3016;
        readonly message: (slotName: string) => string;
    } | {
        readonly title: "Cannot use Server-side Rendering without an adapter.";
        readonly code: 3017;
        readonly message: "Cannot use `output: 'server'` without an adapter. Please install and configure the appropriate server adapter for your final deployment.";
        readonly hint: "See https://docs.astro.build/en/guides/server-side-rendering/ for more information.";
    } | {
        readonly title: "No import found for component.";
        readonly code: 3018;
        readonly message: (componentName: string) => string;
        readonly hint: "Please make sure the component is properly imported.";
    } | {
        readonly title: "Invalid prerender export.";
        readonly code: 3019;
        readonly message: (prefix: string, suffix: string) => string;
        readonly hint: "Mutable values declared at runtime are not supported. Please make sure to use exactly `export const prerender = true`.";
    } | {
        readonly title: "Unknown Vite Error.";
        readonly code: 4000;
    } | {
        readonly title: "Could not import file.";
        readonly code: 4001;
        readonly message: (importName: string) => string;
        readonly hint: "This is often caused by a typo in the import path. Please make sure the file exists.";
    } | {
        readonly title: "Invalid glob pattern.";
        readonly code: 4002;
        readonly message: (globPattern: string) => string;
        readonly hint: "See https://docs.astro.build/en/guides/imports/#glob-patterns for more information on supported glob patterns.";
    } | {
        readonly title: "Unknown CSS Error.";
        readonly code: 5000;
    } | {
        readonly title: "CSS Syntax Error.";
        readonly code: 5001;
    } | {
        readonly title: "Unknown Markdown Error.";
        readonly code: 6000;
    } | {
        readonly title: "Failed to parse Markdown frontmatter.";
        readonly code: 6001;
    } | {
        readonly title: "Content collection frontmatter invalid.";
        readonly code: 6002;
        readonly message: (collection: string, entryId: string, error: import("zod").ZodError<any>) => string;
        readonly hint: "See https://docs.astro.build/en/guides/content-collections/ for more information on content schemas.";
    } | {
        readonly title: "Unknown configuration error.";
        readonly code: 7000;
    } | {
        readonly title: "Specified configuration file not found.";
        readonly code: 7001;
        readonly message: (configFile: string) => string;
    } | {
        readonly title: "Legacy configuration detected.";
        readonly code: 7002;
        readonly message: (legacyConfigKey: string) => string;
        readonly hint: "Please update your configuration to the new format.\nSee https://astro.build/config for more information.";
    } | {
        readonly title: "Unknown CLI Error.";
        readonly code: 8000;
    } | {
        readonly title: "Failed to generate content types.";
        readonly code: 8001;
        readonly message: "`astro sync` command failed to generate content collection types.";
        readonly hint: "Check your `src/content/config.*` file for typos.";
    } | {
        readonly title: "Unknown Error.";
        readonly code: 99999;
    };
} | undefined;
