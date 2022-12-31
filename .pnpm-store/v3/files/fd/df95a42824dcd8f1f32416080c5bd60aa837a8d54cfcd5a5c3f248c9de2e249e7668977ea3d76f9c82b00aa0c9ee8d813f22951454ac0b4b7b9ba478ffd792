/// <reference types="node" />
import type { RehypePlugin, RemarkPlugin, RemarkRehype } from '@astrojs/markdown-remark';
import type { ILanguageRegistration, IThemeRegistration, Theme } from 'shiki';
import type { ViteUserConfig } from '../../@types/astro';
import { OutgoingHttpHeaders } from 'http';
import { z } from 'zod';
export declare const AstroConfigSchema: z.ZodObject<{
    root: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
    srcDir: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
    publicDir: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
    outDir: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
    site: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    base: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    trailingSlash: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"always">, z.ZodLiteral<"never">, z.ZodLiteral<"ignore">]>>>;
    output: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"static">, z.ZodLiteral<"server">]>>>;
    adapter: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        hooks: z.ZodDefault<z.ZodObject<{}, "passthrough", z.ZodTypeAny, {}, {}>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        hooks: {};
    }, {
        hooks?: {} | undefined;
        name: string;
    }>>;
    integrations: z.ZodEffects<z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        hooks: z.ZodDefault<z.ZodObject<{}, "passthrough", z.ZodTypeAny, {}, {}>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        hooks: {};
    }, {
        hooks?: {} | undefined;
        name: string;
    }>, "many">>, {
        name: string;
        hooks: {};
    }[], unknown>;
    build: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        format: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"file">, z.ZodLiteral<"directory">]>>>;
        client: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
        server: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
        serverEntry: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        server: URL;
        format: "file" | "directory";
        client: URL;
        serverEntry: string;
    }, {
        server?: string | undefined;
        format?: "file" | "directory" | undefined;
        client?: string | undefined;
        serverEntry?: string | undefined;
    }>>>;
    server: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodObject<{
        host: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>>;
        port: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        headers: z.ZodOptional<z.ZodType<OutgoingHttpHeaders, z.ZodTypeDef, OutgoingHttpHeaders>>;
    }, "strip", z.ZodTypeAny, {
        headers?: OutgoingHttpHeaders | undefined;
        host: string | boolean;
        port: number;
    }, {
        host?: string | boolean | undefined;
        port?: number | undefined;
        headers?: OutgoingHttpHeaders | undefined;
    }>>>, {
        headers?: OutgoingHttpHeaders | undefined;
        host: string | boolean;
        port: number;
    }, unknown>;
    style: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        postcss: z.ZodDefault<z.ZodOptional<z.ZodObject<{
            options: z.ZodAny;
            plugins: z.ZodArray<z.ZodAny, "many">;
        }, "strip", z.ZodTypeAny, {
            options?: any;
            plugins: any[];
        }, {
            options?: any;
            plugins: any[];
        }>>>;
    }, "strip", z.ZodTypeAny, {
        postcss: {
            options?: any;
            plugins: any[];
        };
    }, {
        postcss?: {
            options?: any;
            plugins: any[];
        } | undefined;
    }>>>;
    markdown: z.ZodDefault<z.ZodObject<{
        drafts: z.ZodDefault<z.ZodBoolean>;
        syntaxHighlight: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<"shiki">, z.ZodLiteral<"prism">, z.ZodLiteral<false>]>>;
        shikiConfig: z.ZodDefault<z.ZodObject<{
            langs: z.ZodDefault<z.ZodArray<z.ZodType<ILanguageRegistration, z.ZodTypeDef, ILanguageRegistration>, "many">>;
            theme: z.ZodDefault<z.ZodUnion<[z.ZodEnum<[Theme, ...Theme[]]>, z.ZodType<IThemeRegistration, z.ZodTypeDef, IThemeRegistration>]>>;
            wrap: z.ZodDefault<z.ZodUnion<[z.ZodBoolean, z.ZodNull]>>;
        }, "strip", z.ZodTypeAny, {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        }, {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        }>>;
        remarkPlugins: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodTuple<[z.ZodString, z.ZodAny], null>, z.ZodType<RemarkPlugin<any[]>, z.ZodTypeDef, RemarkPlugin<any[]>>, z.ZodTuple<[z.ZodType<RemarkPlugin<any[]>, z.ZodTypeDef, RemarkPlugin<any[]>>, z.ZodAny], null>]>, "many">>;
        rehypePlugins: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodTuple<[z.ZodString, z.ZodAny], null>, z.ZodType<RehypePlugin<any[]>, z.ZodTypeDef, RehypePlugin<any[]>>, z.ZodTuple<[z.ZodType<RehypePlugin<any[]>, z.ZodTypeDef, RehypePlugin<any[]>>, z.ZodAny], null>]>, "many">>;
        remarkRehype: z.ZodDefault<z.ZodOptional<z.ZodType<RemarkRehype, z.ZodTypeDef, RemarkRehype>>>;
        extendDefaultPlugins: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        drafts: boolean;
        syntaxHighlight: false | "shiki" | "prism";
        shikiConfig: {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        };
        remarkPlugins: (string | [string, any] | RemarkPlugin<any[]> | [RemarkPlugin<any[]>, any])[];
        rehypePlugins: (string | [string, any] | RehypePlugin<any[]> | [RehypePlugin<any[]>, any])[];
        remarkRehype: RemarkRehype;
        extendDefaultPlugins: boolean;
    }, {
        drafts?: boolean | undefined;
        syntaxHighlight?: false | "shiki" | "prism" | undefined;
        shikiConfig?: {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | RemarkPlugin<any[]> | [RemarkPlugin<any[]>, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | RehypePlugin<any[]> | [RehypePlugin<any[]>, any])[] | undefined;
        remarkRehype?: RemarkRehype | undefined;
        extendDefaultPlugins?: boolean | undefined;
    }>>;
    vite: z.ZodDefault<z.ZodType<ViteUserConfig, z.ZodTypeDef, ViteUserConfig>>;
    experimental: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        errorOverlay: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        prerender: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        contentCollections: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        errorOverlay: boolean;
        prerender: boolean;
        contentCollections: boolean;
    }, {
        errorOverlay?: boolean | undefined;
        prerender?: boolean | undefined;
        contentCollections?: boolean | undefined;
    }>>>;
    legacy: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        astroFlavoredMarkdown: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        astroFlavoredMarkdown: boolean;
    }, {
        astroFlavoredMarkdown?: boolean | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    site?: string | undefined;
    adapter?: {
        name: string;
        hooks: {};
    } | undefined;
    base: string;
    markdown: {
        drafts: boolean;
        syntaxHighlight: false | "shiki" | "prism";
        shikiConfig: {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        };
        remarkPlugins: (string | [string, any] | RemarkPlugin<any[]> | [RemarkPlugin<any[]>, any])[];
        rehypePlugins: (string | [string, any] | RehypePlugin<any[]> | [RehypePlugin<any[]>, any])[];
        remarkRehype: RemarkRehype;
        extendDefaultPlugins: boolean;
    };
    output: "static" | "server";
    root: URL;
    srcDir: URL;
    publicDir: URL;
    outDir: URL;
    trailingSlash: "never" | "always" | "ignore";
    server: {
        headers?: OutgoingHttpHeaders | undefined;
        host: string | boolean;
        port: number;
    };
    integrations: {
        name: string;
        hooks: {};
    }[];
    build: {
        server: URL;
        format: "file" | "directory";
        client: URL;
        serverEntry: string;
    };
    style: {
        postcss: {
            options?: any;
            plugins: any[];
        };
    };
    vite: ViteUserConfig;
    experimental: {
        errorOverlay: boolean;
        prerender: boolean;
        contentCollections: boolean;
    };
    legacy: {
        astroFlavoredMarkdown: boolean;
    };
}, {
    site?: string | undefined;
    base?: string | undefined;
    markdown?: {
        drafts?: boolean | undefined;
        syntaxHighlight?: false | "shiki" | "prism" | undefined;
        shikiConfig?: {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | RemarkPlugin<any[]> | [RemarkPlugin<any[]>, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | RehypePlugin<any[]> | [RehypePlugin<any[]>, any])[] | undefined;
        remarkRehype?: RemarkRehype | undefined;
        extendDefaultPlugins?: boolean | undefined;
    } | undefined;
    output?: "static" | "server" | undefined;
    root?: string | undefined;
    srcDir?: string | undefined;
    publicDir?: string | undefined;
    outDir?: string | undefined;
    trailingSlash?: "never" | "always" | "ignore" | undefined;
    server?: unknown;
    adapter?: {
        hooks?: {} | undefined;
        name: string;
    } | undefined;
    integrations?: unknown;
    build?: {
        server?: string | undefined;
        format?: "file" | "directory" | undefined;
        client?: string | undefined;
        serverEntry?: string | undefined;
    } | undefined;
    style?: {
        postcss?: {
            options?: any;
            plugins: any[];
        } | undefined;
    } | undefined;
    vite?: ViteUserConfig | undefined;
    experimental?: {
        errorOverlay?: boolean | undefined;
        prerender?: boolean | undefined;
        contentCollections?: boolean | undefined;
    } | undefined;
    legacy?: {
        astroFlavoredMarkdown?: boolean | undefined;
    } | undefined;
}>;
export declare function createRelativeSchema(cmd: string, fileProtocolRoot: URL): z.ZodEffects<z.ZodObject<z.extendShape<{
    root: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
    srcDir: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
    publicDir: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
    outDir: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
    site: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    base: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    trailingSlash: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"always">, z.ZodLiteral<"never">, z.ZodLiteral<"ignore">]>>>;
    output: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"static">, z.ZodLiteral<"server">]>>>;
    adapter: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        hooks: z.ZodDefault<z.ZodObject<{}, "passthrough", z.ZodTypeAny, {}, {}>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        hooks: {};
    }, {
        hooks?: {} | undefined;
        name: string;
    }>>;
    integrations: z.ZodEffects<z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        hooks: z.ZodDefault<z.ZodObject<{}, "passthrough", z.ZodTypeAny, {}, {}>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        hooks: {};
    }, {
        hooks?: {} | undefined;
        name: string;
    }>, "many">>, {
        name: string;
        hooks: {};
    }[], unknown>;
    build: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        format: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"file">, z.ZodLiteral<"directory">]>>>;
        client: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
        server: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
        serverEntry: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        server: URL;
        format: "file" | "directory";
        client: URL;
        serverEntry: string;
    }, {
        server?: string | undefined;
        format?: "file" | "directory" | undefined;
        client?: string | undefined;
        serverEntry?: string | undefined;
    }>>>;
    server: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodObject<{
        host: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>>;
        port: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        headers: z.ZodOptional<z.ZodType<OutgoingHttpHeaders, z.ZodTypeDef, OutgoingHttpHeaders>>;
    }, "strip", z.ZodTypeAny, {
        headers?: OutgoingHttpHeaders | undefined;
        host: string | boolean;
        port: number;
    }, {
        host?: string | boolean | undefined;
        port?: number | undefined;
        headers?: OutgoingHttpHeaders | undefined;
    }>>>, {
        headers?: OutgoingHttpHeaders | undefined;
        host: string | boolean;
        port: number;
    }, unknown>;
    style: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        postcss: z.ZodDefault<z.ZodOptional<z.ZodObject<{
            options: z.ZodAny;
            plugins: z.ZodArray<z.ZodAny, "many">;
        }, "strip", z.ZodTypeAny, {
            options?: any;
            plugins: any[];
        }, {
            options?: any;
            plugins: any[];
        }>>>;
    }, "strip", z.ZodTypeAny, {
        postcss: {
            options?: any;
            plugins: any[];
        };
    }, {
        postcss?: {
            options?: any;
            plugins: any[];
        } | undefined;
    }>>>;
    markdown: z.ZodDefault<z.ZodObject<{
        drafts: z.ZodDefault<z.ZodBoolean>;
        syntaxHighlight: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<"shiki">, z.ZodLiteral<"prism">, z.ZodLiteral<false>]>>;
        shikiConfig: z.ZodDefault<z.ZodObject<{
            langs: z.ZodDefault<z.ZodArray<z.ZodType<ILanguageRegistration, z.ZodTypeDef, ILanguageRegistration>, "many">>;
            theme: z.ZodDefault<z.ZodUnion<[z.ZodEnum<[Theme, ...Theme[]]>, z.ZodType<IThemeRegistration, z.ZodTypeDef, IThemeRegistration>]>>;
            wrap: z.ZodDefault<z.ZodUnion<[z.ZodBoolean, z.ZodNull]>>;
        }, "strip", z.ZodTypeAny, {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        }, {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        }>>;
        remarkPlugins: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodTuple<[z.ZodString, z.ZodAny], null>, z.ZodType<RemarkPlugin<any[]>, z.ZodTypeDef, RemarkPlugin<any[]>>, z.ZodTuple<[z.ZodType<RemarkPlugin<any[]>, z.ZodTypeDef, RemarkPlugin<any[]>>, z.ZodAny], null>]>, "many">>;
        rehypePlugins: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodTuple<[z.ZodString, z.ZodAny], null>, z.ZodType<RehypePlugin<any[]>, z.ZodTypeDef, RehypePlugin<any[]>>, z.ZodTuple<[z.ZodType<RehypePlugin<any[]>, z.ZodTypeDef, RehypePlugin<any[]>>, z.ZodAny], null>]>, "many">>;
        remarkRehype: z.ZodDefault<z.ZodOptional<z.ZodType<RemarkRehype, z.ZodTypeDef, RemarkRehype>>>;
        extendDefaultPlugins: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        drafts: boolean;
        syntaxHighlight: false | "shiki" | "prism";
        shikiConfig: {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        };
        remarkPlugins: (string | [string, any] | RemarkPlugin<any[]> | [RemarkPlugin<any[]>, any])[];
        rehypePlugins: (string | [string, any] | RehypePlugin<any[]> | [RehypePlugin<any[]>, any])[];
        remarkRehype: RemarkRehype;
        extendDefaultPlugins: boolean;
    }, {
        drafts?: boolean | undefined;
        syntaxHighlight?: false | "shiki" | "prism" | undefined;
        shikiConfig?: {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | RemarkPlugin<any[]> | [RemarkPlugin<any[]>, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | RehypePlugin<any[]> | [RehypePlugin<any[]>, any])[] | undefined;
        remarkRehype?: RemarkRehype | undefined;
        extendDefaultPlugins?: boolean | undefined;
    }>>;
    vite: z.ZodDefault<z.ZodType<ViteUserConfig, z.ZodTypeDef, ViteUserConfig>>;
    experimental: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        errorOverlay: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        prerender: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        contentCollections: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        errorOverlay: boolean;
        prerender: boolean;
        contentCollections: boolean;
    }, {
        errorOverlay?: boolean | undefined;
        prerender?: boolean | undefined;
        contentCollections?: boolean | undefined;
    }>>>;
    legacy: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        astroFlavoredMarkdown: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        astroFlavoredMarkdown: boolean;
    }, {
        astroFlavoredMarkdown?: boolean | undefined;
    }>>>;
}, {
    root: z.ZodEffects<z.ZodDefault<z.ZodString>, URL, string | undefined>;
    srcDir: z.ZodEffects<z.ZodDefault<z.ZodString>, URL, string | undefined>;
    publicDir: z.ZodEffects<z.ZodDefault<z.ZodString>, URL, string | undefined>;
    outDir: z.ZodEffects<z.ZodDefault<z.ZodString>, URL, string | undefined>;
    build: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        format: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"file">, z.ZodLiteral<"directory">]>>>;
        client: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
        server: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
        serverEntry: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        server: URL;
        format: "file" | "directory";
        client: URL;
        serverEntry: string;
    }, {
        server?: string | undefined;
        format?: "file" | "directory" | undefined;
        client?: string | undefined;
        serverEntry?: string | undefined;
    }>>>;
    server: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodObject<{
        host: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>>;
        port: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        headers: z.ZodOptional<z.ZodType<OutgoingHttpHeaders, z.ZodTypeDef, OutgoingHttpHeaders>>;
        streaming: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        headers?: OutgoingHttpHeaders | undefined;
        host: string | boolean;
        port: number;
        streaming: boolean;
    }, {
        host?: string | boolean | undefined;
        port?: number | undefined;
        headers?: OutgoingHttpHeaders | undefined;
        streaming?: boolean | undefined;
    }>>>, {
        headers?: OutgoingHttpHeaders | undefined;
        host: string | boolean;
        port: number;
        streaming: boolean;
    }, unknown>;
    style: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        postcss: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodObject<{
            options: z.ZodAny;
            plugins: z.ZodArray<z.ZodAny, "many">;
        }, "strip", z.ZodTypeAny, {
            options?: any;
            plugins: any[];
        }, {
            options?: any;
            plugins: any[];
        }>>>, {
            options?: any;
            plugins: any[];
        }, unknown>;
    }, "strip", z.ZodTypeAny, {
        postcss: {
            options?: any;
            plugins: any[];
        };
    }, {
        postcss?: unknown;
    }>>>;
}>, "strip", z.ZodTypeAny, {
    site?: string | undefined;
    adapter?: {
        name: string;
        hooks: {};
    } | undefined;
    base: string;
    markdown: {
        drafts: boolean;
        syntaxHighlight: false | "shiki" | "prism";
        shikiConfig: {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        };
        remarkPlugins: (string | [string, any] | RemarkPlugin<any[]> | [RemarkPlugin<any[]>, any])[];
        rehypePlugins: (string | [string, any] | RehypePlugin<any[]> | [RehypePlugin<any[]>, any])[];
        remarkRehype: RemarkRehype;
        extendDefaultPlugins: boolean;
    };
    output: "static" | "server";
    root: URL;
    srcDir: URL;
    publicDir: URL;
    outDir: URL;
    trailingSlash: "never" | "always" | "ignore";
    server: {
        headers?: OutgoingHttpHeaders | undefined;
        host: string | boolean;
        port: number;
        streaming: boolean;
    };
    integrations: {
        name: string;
        hooks: {};
    }[];
    build: {
        server: URL;
        format: "file" | "directory";
        client: URL;
        serverEntry: string;
    };
    style: {
        postcss: {
            options?: any;
            plugins: any[];
        };
    };
    vite: ViteUserConfig;
    experimental: {
        errorOverlay: boolean;
        prerender: boolean;
        contentCollections: boolean;
    };
    legacy: {
        astroFlavoredMarkdown: boolean;
    };
}, {
    site?: string | undefined;
    base?: string | undefined;
    markdown?: {
        drafts?: boolean | undefined;
        syntaxHighlight?: false | "shiki" | "prism" | undefined;
        shikiConfig?: {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | RemarkPlugin<any[]> | [RemarkPlugin<any[]>, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | RehypePlugin<any[]> | [RehypePlugin<any[]>, any])[] | undefined;
        remarkRehype?: RemarkRehype | undefined;
        extendDefaultPlugins?: boolean | undefined;
    } | undefined;
    output?: "static" | "server" | undefined;
    root?: string | undefined;
    srcDir?: string | undefined;
    publicDir?: string | undefined;
    outDir?: string | undefined;
    trailingSlash?: "never" | "always" | "ignore" | undefined;
    server?: unknown;
    adapter?: {
        hooks?: {} | undefined;
        name: string;
    } | undefined;
    integrations?: unknown;
    build?: {
        server?: string | undefined;
        format?: "file" | "directory" | undefined;
        client?: string | undefined;
        serverEntry?: string | undefined;
    } | undefined;
    style?: {
        postcss?: unknown;
    } | undefined;
    vite?: ViteUserConfig | undefined;
    experimental?: {
        errorOverlay?: boolean | undefined;
        prerender?: boolean | undefined;
        contentCollections?: boolean | undefined;
    } | undefined;
    legacy?: {
        astroFlavoredMarkdown?: boolean | undefined;
    } | undefined;
}>, {
    site?: string | undefined;
    adapter?: {
        name: string;
        hooks: {};
    } | undefined;
    base: string;
    markdown: {
        drafts: boolean;
        syntaxHighlight: false | "shiki" | "prism";
        shikiConfig: {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        };
        remarkPlugins: (string | [string, any] | RemarkPlugin<any[]> | [RemarkPlugin<any[]>, any])[];
        rehypePlugins: (string | [string, any] | RehypePlugin<any[]> | [RehypePlugin<any[]>, any])[];
        remarkRehype: RemarkRehype;
        extendDefaultPlugins: boolean;
    };
    output: "static" | "server";
    root: URL;
    srcDir: URL;
    publicDir: URL;
    outDir: URL;
    trailingSlash: "never" | "always" | "ignore";
    server: {
        headers?: OutgoingHttpHeaders | undefined;
        host: string | boolean;
        port: number;
        streaming: boolean;
    };
    integrations: {
        name: string;
        hooks: {};
    }[];
    build: {
        server: URL;
        format: "file" | "directory";
        client: URL;
        serverEntry: string;
    };
    style: {
        postcss: {
            options?: any;
            plugins: any[];
        };
    };
    vite: ViteUserConfig;
    experimental: {
        errorOverlay: boolean;
        prerender: boolean;
        contentCollections: boolean;
    };
    legacy: {
        astroFlavoredMarkdown: boolean;
    };
}, {
    site?: string | undefined;
    base?: string | undefined;
    markdown?: {
        drafts?: boolean | undefined;
        syntaxHighlight?: false | "shiki" | "prism" | undefined;
        shikiConfig?: {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | RemarkPlugin<any[]> | [RemarkPlugin<any[]>, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | RehypePlugin<any[]> | [RehypePlugin<any[]>, any])[] | undefined;
        remarkRehype?: RemarkRehype | undefined;
        extendDefaultPlugins?: boolean | undefined;
    } | undefined;
    output?: "static" | "server" | undefined;
    root?: string | undefined;
    srcDir?: string | undefined;
    publicDir?: string | undefined;
    outDir?: string | undefined;
    trailingSlash?: "never" | "always" | "ignore" | undefined;
    server?: unknown;
    adapter?: {
        hooks?: {} | undefined;
        name: string;
    } | undefined;
    integrations?: unknown;
    build?: {
        server?: string | undefined;
        format?: "file" | "directory" | undefined;
        client?: string | undefined;
        serverEntry?: string | undefined;
    } | undefined;
    style?: {
        postcss?: unknown;
    } | undefined;
    vite?: ViteUserConfig | undefined;
    experimental?: {
        errorOverlay?: boolean | undefined;
        prerender?: boolean | undefined;
        contentCollections?: boolean | undefined;
    } | undefined;
    legacy?: {
        astroFlavoredMarkdown?: boolean | undefined;
    } | undefined;
}>;
