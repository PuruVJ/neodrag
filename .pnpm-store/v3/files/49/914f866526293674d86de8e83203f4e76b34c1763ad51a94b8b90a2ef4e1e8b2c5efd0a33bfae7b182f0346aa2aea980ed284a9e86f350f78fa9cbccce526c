import type { ZodError } from 'zod';
export declare const AstroErrorData: {
    readonly UnknownCompilerError: {
        readonly title: "Unknown compiler error.";
        readonly code: 1000;
    };
    /**
     * @docs
     * @kind heading
     * @name Astro Errors
     */
    /**
     * @docs
     * @see
     * - [Enabling SSR in Your Project](https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project)
     * - [Astro.redirect](https://docs.astro.build/en/guides/server-side-rendering/#astroredirect)
     * @description
     * The `Astro.redirect` function is only available when [Server-side rendering](/en/guides/server-side-rendering/) is enabled.
     *
     * To redirect on a static website, the [meta refresh attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta) can be used. Certain hosts also provide config-based redirects (ex: [Netlify redirects](https://docs.netlify.com/routing/redirects/)).
     */
    readonly StaticRedirectNotAvailable: {
        readonly title: "`Astro.redirect` is not available in static mode.";
        readonly code: 3001;
        readonly message: "Redirects are only available when using `output: 'server'`. Update your Astro config if you need SSR features.";
        readonly hint: "See https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project for more information on how to enable SSR.";
    };
    /**
     * @docs
     * @see
     * - [Official integrations](https://docs.astro.build/en/guides/integrations-guide/#official-integrations)
     * - [Astro.clientAddress](https://docs.astro.build/en/reference/api-reference/#astroclientaddress)
     * @description
     * The adapter you.'re using unfortunately does not support `Astro.clientAddress`.
     */
    readonly ClientAddressNotAvailable: {
        readonly title: "`Astro.clientAddress` is not available in current adapter.";
        readonly code: 3002;
        readonly message: (adapterName: string) => string;
    };
    /**
     * @docs
     * @see
     * - [Enabling SSR in Your Project](https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project)
     * - [Astro.clientAddress](https://docs.astro.build/en/reference/api-reference/#astroclientaddress)
     * @description
     * The `Astro.clientAddress` property is only available when [Server-side rendering](https://docs.astro.build/en/guides/server-side-rendering/) is enabled.
     *
     * To get the user's IP address in static mode, different APIs such as [Ipify](https://www.ipify.org/) can be used in a [Client-side script](https://docs.astro.build/en/core-concepts/astro-components/#client-side-scripts) or it may be possible to get the user's IP using a serverless function hosted on your hosting provider.
     */
    readonly StaticClientAddressNotAvailable: {
        readonly title: "`Astro.clientAddress` is not available in static mode.";
        readonly code: 3003;
        readonly message: "`Astro.clientAddress` is only available when using `output: 'server'`. Update your Astro config if you need SSR features.";
        readonly hint: "See https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project for more information on how to enable SSR.";
    };
    /**
     * @docs
     * @see
     * - [getStaticPaths()](https://docs.astro.build/en/reference/api-reference/#getstaticpaths)
     * @description
     * A [dynamic route](https://docs.astro.build/en/core-concepts/routing/#dynamic-routes) was matched, but no corresponding path was found for the requested parameters. This is often caused by a typo in either the generated or the requested path.
     */
    readonly NoMatchingStaticPathFound: {
        readonly title: "No static path found for requested path.";
        readonly code: 3004;
        readonly message: (pathName: string) => string;
        readonly hint: (possibleRoutes: string[]) => string;
    };
    /**
     * @docs
     * @message Route returned a `RETURNED_VALUE`. Only a Response can be returned from Astro files.
     * @see
     * - [Response](https://docs.astro.build/en/guides/server-side-rendering/#response)
     * @description
     * Only instances of [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) can be returned inside Astro files.
     * ```astro title="pages/login.astro"
     * ---
     * return new Response(null, {
     *  status: 404,
     *  statusText: 'Not found'
     * });
     *
     * // Alternatively, for redirects, Astro.redirect also returns an instance of Response
     * return Astro.redirect('/login');
     * ---
     * ```
     *
     */
    readonly OnlyResponseCanBeReturned: {
        readonly title: "Invalid type returned by Astro page.";
        readonly code: 3005;
        readonly message: (route: string | undefined, returnedValue: string) => string;
        readonly hint: "See https://docs.astro.build/en/guides/server-side-rendering/#response for more information.";
    };
    /**
     * @docs
     * @see
     * - [`client:media`](https://docs.astro.build/en/reference/directives-reference/#clientmedia)
     * @description
     * A [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries) parameter is required when using the `client:media` directive.
     *
     * ```astro
     * <Counter client:media="(max-width: 640px)" />
     * ```
     */
    readonly MissingMediaQueryDirective: {
        readonly title: "Missing value for `client:media` directive.";
        readonly code: 3006;
        readonly message: "Media query not provided for `client:media` directive. A media query similar to `client:media=\"(max-width: 600px)\"` must be provided";
    };
    /**
     * @docs
     * @message Unable to render `COMPONENT_NAME`. There are `RENDERER_COUNT` renderer(s) configured in your `astro.config.mjs` file, but none were able to server-side render `COMPONENT_NAME`.
     * @see
     * - [Frameworks components](https://docs.astro.build/en/core-concepts/framework-components/)
     * - [UI Frameworks](https://docs.astro.build/en/guides/integrations-guide/#official-integrations)
     * @description
     * None of the installed integrations were able to render the component you imported. Make sure to install the appropriate integration for the type of component you are trying to include in your page.
     *
     * For JSX / TSX files, [@astrojs/react](https://docs.astro.build/en/guides/integrations-guide/react/), [@astrojs/preact](https://docs.astro.build/en/guides/integrations-guide/preact/) or [@astrojs/solid-js](https://docs.astro.build/en/guides/integrations-guide/solid-js/) can be used. For Vue and Svelte files, the [@astrojs/vue](https://docs.astro.build/en/guides/integrations-guide/vue/) and [@astrojs/svelte](https://docs.astro.build/en/guides/integrations-guide/svelte/) integrations can be used respectively
     */
    readonly NoMatchingRenderer: {
        readonly title: "No matching renderer found.";
        readonly code: 3007;
        readonly message: (componentName: string, componentExtension: string | undefined, plural: boolean, validRenderersCount: number) => string;
        readonly hint: (probableRenderers: string) => string;
    };
    /**
     * @docs
     * @see
     * - [addRenderer option](https://docs.astro.build/en/reference/integrations-reference/#addrenderer-option)
     * - [Hydrating framework components](https://docs.astro.build/en/core-concepts/framework-components/#hydrating-interactive-components)
     * @description
     * Astro tried to hydrate a component on the client, but the renderer used does not provide a client entrypoint to use to hydrate.
     *
     */
    readonly NoClientEntrypoint: {
        readonly title: "No client entrypoint specified in renderer.";
        readonly code: 3008;
        readonly message: (componentName: string, clientDirective: string, rendererName: string) => string;
        readonly hint: "See https://docs.astro.build/en/reference/integrations-reference/#addrenderer-option for more information on how to configure your renderer.";
    };
    /**
     * @docs
     * @see
     * - [`client:only`](https://docs.astro.build/en/reference/directives-reference/#clientonly)
     * @description
     *
     * `client:only` components are not run on the server, as such Astro does not know (and cannot guess) which renderer to use and require a hint. Like such:
     *
     * ```astro
     *	<SomeReactComponent client:only="react" />
     * ```
     */
    readonly NoClientOnlyHint: {
        readonly title: "Missing hint on client:only directive.";
        readonly code: 3009;
        readonly message: (componentName: string) => string;
        readonly hint: (probableRenderers: string) => string;
    };
    /**
     * @docs
     * @see
     * - [`getStaticPaths()`](https://docs.astro.build/en/reference/api-reference/#getstaticpaths)
     * - [`params`](https://docs.astro.build/en/reference/api-reference/#params)
     * @description
     * The `params` property in `getStaticPaths`'s return value (an array of objects) should also be an object.
     *
     * ```astro title="pages/blog/[id].astro"
     * ---
     * export async function getStaticPaths() {
     *	return [
     *		{ params: { slug: "blog" } },
     * 		{ params: { slug: "about" } }
     * 	];
     *}
     *---
     * ```
     */
    readonly InvalidGetStaticPathParam: {
        readonly title: "Invalid value returned by a `getStaticPaths` path.";
        readonly code: 3010;
        readonly message: (paramType: any) => string;
        readonly hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths.";
    };
    /**
     * @docs
     * @see
     * - [`getStaticPaths()`](https://docs.astro.build/en/reference/api-reference/#getstaticpaths)
     * - [`params`](https://docs.astro.build/en/reference/api-reference/#params)
     * @description
     * `getStaticPaths`'s return value must be an array of objects.
     *
     * ```ts title="pages/blog/[id].astro"
     * export async function getStaticPaths() {
     *	return [ // <-- Array
     *		{ params: { slug: "blog" } },
     * 		{ params: { slug: "about" } }
     * 	];
     *}
     * ```
     */
    readonly InvalidGetStaticPathsReturn: {
        readonly title: "Invalid value returned by getStaticPaths.";
        readonly code: 3011;
        readonly message: (returnType: any) => string;
        readonly hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths.";
    };
    /**
     * @docs
     * @see
     * - [RSS Guide](https://docs.astro.build/en/guides/rss/)
     * @description
     * `getStaticPaths` no longer expose an helper for generating a RSS feed. We recommend migrating to the [@astrojs/rss](https://docs.astro.build/en/guides/rss/#setting-up-astrojsrss)integration instead.
     */
    readonly GetStaticPathsRemovedRSSHelper: {
        readonly title: "getStaticPaths RSS helper is not available anymore.";
        readonly code: 3012;
        readonly message: "The RSS helper has been removed from `getStaticPaths`. Try the new @astrojs/rss package instead.";
        readonly hint: "See https://docs.astro.build/en/guides/rss/ for more information.";
    };
    /**
     * @docs
     * @see
     * - [`getStaticPaths()`](https://docs.astro.build/en/reference/api-reference/#getstaticpaths)
     * - [`params`](https://docs.astro.build/en/reference/api-reference/#params)
     * @description
     * Every route specified by `getStaticPaths` require a `params` property specifying the path parameters needed to match the route.
     *
     * For instance, the following code:
     * ```astro title="pages/blog/[id].astro"
     * ---
     * export async function getStaticPaths() {
     * 	return [
     * 		{ params: { id: '1' } }
     * 	];
     * }
     * ---
     * ```
     * Will create the following route: `site.com/blog/1`.
     */
    readonly GetStaticPathsExpectedParams: {
        readonly title: "Missing params property on `getStaticPaths` route.";
        readonly code: 3013;
        readonly message: "Missing or empty required `params` property on `getStaticPaths` route.";
        readonly hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths.";
    };
    /**
     * @docs
     * @see
     * - [`getStaticPaths()`](https://docs.astro.build/en/reference/api-reference/#getstaticpaths)
     * - [`params`](https://docs.astro.build/en/reference/api-reference/#params)
     * @description
     * Since `params` are encoded into the URL, only certain types are supported as values.
     *
     * ```astro title="/route/[id].astro"
     * ---
     * export async function getStaticPaths() {
     * 	return [
     * 		{ params: { id: '1' } } // Works
     * 		{ params: { id: 2 } } // Works
     * 		{ params: { id: false } } // Does not work
     * 	];
     * }
     * ---
     * ```
     *
     * In routes using [rest parameters](https://docs.astro.build/en/core-concepts/routing/#rest-parameters), `undefined` can be used to represent a path with no parameters passed in the URL:
     *
     * ```astro title="/route/[...id].astro"
     * ---
     * export async function getStaticPaths() {
     * 	return [
     * 		{ params: { id: 1 } } // /route/1
     * 		{ params: { id: 2 } } // /route/2
     * 		{ params: { id: undefined } } // /route/
     * 	];
     * }
     * ---
     * ```
     */
    readonly GetStaticPathsInvalidRouteParam: {
        readonly title: "Invalid value for `getStaticPaths` route parameter.";
        readonly code: 3014;
        readonly message: (key: string, value: any, valueType: any) => string;
        readonly hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths.";
    };
    /**
     * @docs
     * @see
     * - [Dynamic Routes](https://docs.astro.build/en/core-concepts/routing/#dynamic-routes)
     * - [`getStaticPaths()`](https://docs.astro.build/en/reference/api-reference/#getstaticpaths)
     * - [Server-side Rendering](https://docs.astro.build/en/guides/server-side-rendering/)
     * @description
     * In [Static Mode](https://docs.astro.build/en/core-concepts/routing/#static-ssg-mode), all routes must be determined at build time. As such, dynamic routes must `export` a `getStaticPaths` function returning the different paths to generate.
     */
    readonly GetStaticPathsRequired: {
        readonly title: "`getStaticPaths()` function required for dynamic routes.";
        readonly code: 3015;
        readonly message: "`getStaticPaths()` function is required for dynamic routes. Make sure that you `export` a `getStaticPaths` function from your dynamic route.";
        readonly hint: "See https://docs.astro.build/en/core-concepts/routing/#dynamic-routes for more information on dynamic routes.\n\nAlternatively, set `output: \"server\"` in your Astro config file to switch to a non-static server build.\nSee https://docs.astro.build/en/guides/server-side-rendering/ for more information on non-static rendering.";
    };
    /**
     * @docs
     * @see
     * - [Named slots](https://docs.astro.build/en/core-concepts/astro-components/#named-slots)
     * @description
     * Certain words cannot be used for slot names due to being already used internally.
     */
    readonly ReservedSlotName: {
        readonly title: "Invalid slot name.";
        readonly code: 3016;
        readonly message: (slotName: string) => string;
    };
    /**
     * @docs
     * @see
     * - [Server-side Rendering](https://docs.astro.build/en/guides/server-side-rendering/)
     * - [Adding an Adapter](https://docs.astro.build/en/guides/server-side-rendering/#adding-an-adapter)
     * @description
     * To use server-side rendering, an adapter needs to be installed so Astro knows how to generate the proper output for your targeted deployment platform.
     */
    readonly NoAdapterInstalled: {
        readonly title: "Cannot use Server-side Rendering without an adapter.";
        readonly code: 3017;
        readonly message: "Cannot use `output: 'server'` without an adapter. Please install and configure the appropriate server adapter for your final deployment.";
        readonly hint: "See https://docs.astro.build/en/guides/server-side-rendering/ for more information.";
    };
    /**
     * @docs
     * @description
     * No import statement was found for one of the components. If there is an import statement, make sure you are using the same identifier in both the imports and the component usage.
     */
    readonly NoMatchingImport: {
        readonly title: "No import found for component.";
        readonly code: 3018;
        readonly message: (componentName: string) => string;
        readonly hint: "Please make sure the component is properly imported.";
    };
    /**
     * @docs
     * @message
     * **Example error messages:**<br/>
     * InvalidPrerenderExport: A `prerender` export has been detected, but its value cannot be statically analyzed.
     * @description
     * The `prerender` feature only supports a subset of valid JavaScript — be sure to use exactly `export const prerender = true` so that our compiler can detect this directive at build time. Variables, `let`, and `var` declarations are not supported.
     */
    readonly InvalidPrerenderExport: {
        readonly title: "Invalid prerender export.";
        readonly code: 3019;
        readonly message: (prefix: string, suffix: string) => string;
        readonly hint: "Mutable values declared at runtime are not supported. Please make sure to use exactly `export const prerender = true`.";
    };
    readonly UnknownViteError: {
        readonly title: "Unknown Vite Error.";
        readonly code: 4000;
    };
    /**
     * @docs
     * @see
     * - [Type Imports](https://docs.astro.build/en/guides/typescript/#type-imports)
     * @description
     * Astro could not import the requested file. Oftentimes, this is caused by the import path being wrong (either because the file does not exist, or there is a typo in the path)
     *
     * This message can also appear when a type is imported without specifying that it is a [type import](https://docs.astro.build/en/guides/typescript/#type-imports).
     */
    readonly FailedToLoadModuleSSR: {
        readonly title: "Could not import file.";
        readonly code: 4001;
        readonly message: (importName: string) => string;
        readonly hint: "This is often caused by a typo in the import path. Please make sure the file exists.";
    };
    /**
     * @docs
     * @see
     * - [Glob Patterns](https://docs.astro.build/en/guides/imports/#glob-patterns)
     * @description
     * Astro encountered an invalid glob pattern. This is often caused by the glob pattern not being a valid file path.
     */
    readonly InvalidGlob: {
        readonly title: "Invalid glob pattern.";
        readonly code: 4002;
        readonly message: (globPattern: string) => string;
        readonly hint: "See https://docs.astro.build/en/guides/imports/#glob-patterns for more information on supported glob patterns.";
    };
    /**
     * @docs
     * @kind heading
     * @name CSS Errors
     */
    readonly UnknownCSSError: {
        readonly title: "Unknown CSS Error.";
        readonly code: 5000;
    };
    /**
     * @docs
     * @message
     * **Example error messages:**<br/>
     * CSSSyntaxError: Missed semicolon<br/>
     * CSSSyntaxError: Unclosed string<br/>
     * @description
     * Astro encountered an error while parsing your CSS, due to a syntax error. This is often caused by a missing semicolon
     */
    readonly CSSSyntaxError: {
        readonly title: "CSS Syntax Error.";
        readonly code: 5001;
    };
    /**
     * @docs
     * @kind heading
     * @name Markdown Errors
     */
    readonly UnknownMarkdownError: {
        readonly title: "Unknown Markdown Error.";
        readonly code: 6000;
    };
    /**
     * @docs
     * @message
     * **Example error messages:**<br/>
     * can not read an implicit mapping pair; a colon is missed<br/>
     * unexpected end of the stream within a double quoted scalar<br/>
     * can not read a block mapping entry; a multiline key may not be an implicit key
     * @description
     * Astro encountered an error while parsing the frontmatter of your Markdown file.
     * This is often caused by a mistake in the syntax, such as a missing colon or a missing end quote.
     */
    readonly MarkdownFrontmatterParseError: {
        readonly title: "Failed to parse Markdown frontmatter.";
        readonly code: 6001;
    };
    /**
     * @docs
     * @message
     * **Example error message:**<br/>
     * Could not parse frontmatter in **blog** → **post.md**<br/>
     * "title" is required.<br/>
     * "date" must be a valid date.
     * @description
     * A Markdown document's frontmatter in `src/content/` does not match its collection schema.
     * Make sure that all required fields are present, and that all fields are of the correct type.
     * You can check against the collection schema in your `src/content/config.*` file.
     * See the [Content collections documentation](https://docs.astro.build/en/guides/content-collections/) for more information.
     */
    readonly MarkdownContentSchemaValidationError: {
        readonly title: "Content collection frontmatter invalid.";
        readonly code: 6002;
        readonly message: (collection: string, entryId: string, error: ZodError) => string;
        readonly hint: "See https://docs.astro.build/en/guides/content-collections/ for more information on content schemas.";
    };
    readonly UnknownConfigError: {
        readonly title: "Unknown configuration error.";
        readonly code: 7000;
    };
    /**
     * @docs
     * @see
     * - [--config](https://docs.astro.build/en/reference/cli-reference/#--config-path)
     * @description
     * The specified configuration file using `--config` could not be found. Make sure that it exists or that the path is correct
     */
    readonly ConfigNotFound: {
        readonly title: "Specified configuration file not found.";
        readonly code: 7001;
        readonly message: (configFile: string) => string;
    };
    /**
     * @docs
     * @see
     * - [Configuration reference](https://docs.astro.build/en/reference/configuration-reference/)
     * - [Migration guide](https://docs.astro.build/en/migrate/)
     * @description
     * Astro detected a legacy configuration option in your configuration file.
     */
    readonly ConfigLegacyKey: {
        readonly title: "Legacy configuration detected.";
        readonly code: 7002;
        readonly message: (legacyConfigKey: string) => string;
        readonly hint: "Please update your configuration to the new format.\nSee https://astro.build/config for more information.";
    };
    /**
     * @docs
     * @kind heading
     * @name CLI Errors
     */
    readonly UnknownCLIError: {
        readonly title: "Unknown CLI Error.";
        readonly code: 8000;
    };
    /**
     * @docs
     * @description
     * `astro sync` command failed to generate content collection types.
     * @see
     * - [Content collections documentation](https://docs.astro.build/en/guides/content-collections/)
     */
    readonly GenerateContentTypesError: {
        readonly title: "Failed to generate content types.";
        readonly code: 8001;
        readonly message: "`astro sync` command failed to generate content collection types.";
        readonly hint: "Check your `src/content/config.*` file for typos.";
    };
    readonly UnknownError: {
        readonly title: "Unknown Error.";
        readonly code: 99999;
    };
};
declare type ValueOf<T> = T[keyof T];
export declare type AstroErrorCodes = ValueOf<{
    [T in keyof typeof AstroErrorData]: typeof AstroErrorData[T]['code'];
}>;
export {};
