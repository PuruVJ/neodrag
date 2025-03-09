import { Result } from '$lib/result.js';
import { type Plugin } from '@rollup/browser';
import type { Browser } from 'resolve.exports';
import * as resolve_exports from 'resolve.exports';
import { CompilerRegistry } from './compilers.js';

export type Framework = 'svelte' | 'js' | 'react' | 'vue' | 'solid' | 'default';

class ExtensionResolver {
	extension_cache = new Map<string, string>();

	/**
	 * Get potential file extensions to try in priority order for a given framework
	 */
	get_priority_extensions(framework: Framework): string[] {
		// First, define framework-specific extensions
		const framework_extensions: Record<Framework | 'default', string[]> = {
			js: [],
			react: ['.jsx', '.tsx', '/index.jsx', '/index.tsx'],
			svelte: ['.svelte'],
			vue: ['.vue'],
			solid: ['.jsx', '.tsx', '/index.jsx', '/index.tsx'],
			default: [
				'.jsx',
				'.tsx',
				'.svelte',
				'.vue',
				'/index.jsx',
				'/index.tsx',
				'/index.svelte',
				'/index.vue',
			],
		};

		// Common extensions to try
		const common_extensions = [
			'.js',
			'.mjs',
			'.ts',
			'.mts',
			'/index.js',
			'/index.ts',
			'/index.mjs',
			'/index.mts',
		];

		const specific_extensions = framework_extensions[framework] || framework_extensions.default;
		return specific_extensions.concat(common_extensions);
	}

	/**
	 * Check if a path already has a recognized extension
	 */
	has_extension(path: string): boolean {
		// Get all possible extensions
		const all_extensions = this.get_priority_extensions('default').concat(
			this.get_priority_extensions('js'),
		);

		// Check if path ends with any of these extensions
		return all_extensions.some((ext) =>
			ext.startsWith('/') ? path.endsWith(ext.substring(1)) : path.endsWith(ext),
		);
	}

	/**
	 * Try to resolve a barrel file with appropriate extensions
	 */
	async resolve_barrel_file(base_url: string, framework: Framework): Promise<string | undefined> {
		// First check the cache
		const cache_key = `${base_url}@${framework}`;
		if (this.extension_cache.has(cache_key)) {
			return this.extension_cache.get(cache_key);
		}

		// Don't add extensions if the path already has one of our recognized extensions
		if (this.has_extension(base_url)) {
			// Just check if the file exists
			const exists = await this.check_url_exists(base_url);
			if (exists) {
				this.extension_cache.set(cache_key, base_url);
				return base_url;
			}

			// If the existing extension doesn't work, we'll try alternatives
			// by stripping the current extension and trying new ones
			const extension_match = base_url.match(/(\.[^./]+)$/);
			if (extension_match) {
				const without_extension = base_url.slice(0, -extension_match[1].length);
				return this.resolve_barrel_file(without_extension, framework);
			}
		}

		const extensions = this.get_priority_extensions(framework);

		// Try each extension
		for (const extension of extensions) {
			// For directory-based extensions, make sure we have proper path joining
			const url = extension.startsWith('/') ? `${base_url}${extension}` : `${base_url}${extension}`;

			const exists = await this.check_url_exists(url);
			if (!exists) continue;

			this.extension_cache.set(cache_key, url);
			return url;
		}

		// If nothing worked, return undefined
		return undefined;
	}

	async check_url_exists(url: string): Promise<boolean> {
		try {
			const result = await Result.from_async(
				fetch(url, {
					method: 'HEAD',
					// Add cache busting to avoid caching 404s
					cache: 'no-cache',
				}),
			);
			return result.ok;
		} catch (error) {
			return false;
		}
	}

	clear_cache(): void {
		this.extension_cache.clear();
	}
}

/**
 * Resolution options
 */
export interface ResolveOptions {
	/** Framework context for resolution */
	framework?: Framework;
	/** Specific version to use */
	version?: string;
	/** Unique ID for cache management */
	uid?: number;
}

export interface ParsedImport {
	package_name: string;
	subpath: string;
	version: string | null;
}

export interface ResolveResult {
	type: 'url' | 'package';
	original_path: string;
	resolved_url: string;
	package_name?: string;
	version?: string;
	subpath?: string;
	is_external?: boolean;
	error_message?: string;
}

export interface PackageJson extends Record<string, any> {
	name?: string;
	version?: string;
	main?: string;
	module?: string;
	browser?: string | Record<string, string | false>;
	svelte?: string;
	solid?: string;
	vue?: string;
	exports?: string | Record<string, any>;
	[key: string]: any;
}

export class DependencyResolver {
	#caches = {
		content: new Map<string, string>(),
		url: new Map<string, ResolveResult>(),
		package_json: new Map<string, PackageJson>(),
		redirects: new Map<string, string>(),
	};

	#extension_resolver = new ExtensionResolver();

	// Counter for unique request IDs
	#request_counter = 0;

	/**
	 * Special handling for packages that need ESM versions
	 * These are packages that we need to fetch as ESM instead of CommonJS
	 */
	#esm_package_names: Set<string> = new Set([
		// React core and related packages
		'react',
		'react-dom',
		'scheduler',
		'react-is',
	]);

	/**
	 * Check if a package should use special ESM handling
	 */
	#needs_esm_handling(package_name: string): boolean {
		return this.#esm_package_names.has(package_name);
	}

	/**
	 * Get ESM URL for a package
	 */
	#get_esm_url(package_name: string, version: string, subpath: string): string {
		// Base URL for the package, without the +esm suffix
		const base_url = `https://cdn.jsdelivr.net/npm/${package_name}@${version}`;

		// For the root package
		if (subpath === '.') {
			return `${base_url}/+esm`;
		}

		// For subpaths, append to the base URL
		// Strip leading slash if present
		const clean_subpath = subpath.startsWith('/') ? subpath.slice(1) : subpath;
		return `${base_url}/${clean_subpath}/+esm`;
	}

	get_unique_id(): number {
		return this.#request_counter++;
	}

	/**
	 * Resolve an import path to a URL
	 */
	async resolve(import_path: string, options: ResolveOptions = {}): Promise<ResolveResult> {
		const framework = options.framework ?? 'js';
		const uid = options.uid ?? this.get_unique_id();

		// Check if it's a full URL
		if (this.#is_url(import_path)) {
			return this.#resolve_url(import_path);
		}

		// Parse the import path
		const { package_name, subpath, version } = this.#parse_import_path(import_path);

		return this.#resolve_package(
			package_name,
			subpath,
			version || options.version || 'latest',
			framework,
			uid,
		);
	}

	/**
	 * Parse an import path into package name, subpath, and version
	 */
	#parse_import_path(import_path: string): ParsedImport {
		// Check for package with version (@scope/package@version/subpath or package@version/subpath)
		const version_match = import_path.match(/^([^@/]+|@[^/]+\/[^/]+)@([^/]+)(.*)$/);
		if (version_match) {
			const [, package_name, version, rest] = version_match;
			const subpath = rest || '.';
			return { package_name, subpath, version };
		}

		// Check for scoped package with subpath (@scope/package/subpath)
		const scoped_match = import_path.match(/^(@[^/]+\/[^/]+)(.*)$/);
		if (scoped_match) {
			const [, package_name, rest] = scoped_match;
			const subpath = rest || '.';
			return { package_name, subpath, version: null };
		}

		// Regular package with possible subpath ('package/subpath')
		const parts = import_path.split('/');
		const package_name = parts[0];
		const subpath = parts.length > 1 ? '/' + parts.slice(1).join('/') : '.';

		return { package_name, subpath, version: null };
	}

	/**
	 * Check if a path is a URL
	 */
	#is_url(path: string): boolean {
		return path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//');
	}

	/**
	 * Resolve a URL
	 */
	#resolve_url(url: string): ResolveResult {
		// Normalize
		if (url.startsWith('//')) {
			url = 'https:' + url;
		}

		// Check the cache first
		const cache_key = url;
		if (this.#caches.url.has(cache_key)) {
			return this.#caches.url.get(cache_key) as ResolveResult;
		}

		const result: ResolveResult = {
			type: 'url',
			original_path: url,
			resolved_url: url,
			is_external: true,
		};

		this.#caches.url.set(cache_key, result);

		return result;
	}

	/**
	 * Resolve a package and subpath to a URL
	 */
	async #resolve_package(
		package_name: string,
		subpath: string,
		version: string,
		framework: Framework,
		uid: number,
	): Promise<ResolveResult> {
		const cache_key = `${package_name}${subpath}@${version}:${framework}`;

		if (this.#caches.url.has(cache_key)) {
			return this.#caches.url.get(cache_key) as ResolveResult;
		}

		// Special handling for React packages to use ESM versions
		if (this.#needs_esm_handling(package_name)) {
			const esm_url = this.#get_esm_url(package_name, version, subpath);

			const result: ResolveResult = {
				type: 'package',
				original_path: `${package_name}${subpath === '.' ? '' : subpath}`,
				package_name,
				subpath,
				version,
				resolved_url: esm_url,
				is_external: true,
			};

			this.#caches.url.set(cache_key, result);
			return result;
		}

		try {
			// Fetch package.json
			const package_json = await this.#fetch_package_json(package_name, version);

			// Build the base URL for the package
			const base_url = `https://cdn.jsdelivr.net/npm/${package_name}@${version}`;

			// Use resolve.exports to get the appropriate entry point
			let resolved_path: string | null = null;

			// Add framework-specific conditions
			const conditions =
				framework === 'js'
					? ['browser', 'module', 'import', 'default']
					: [framework, 'browser', 'module', 'import', 'default'];

			if (subpath === '.') {
				// For the main entry point, use legacy fields first for frameworks
				if (framework !== 'js') {
					const framework_fields: Partial<Record<Framework, string>> = {
						svelte: 'svelte',
					};

					// Check for framework-specific entry point
					const field = framework_fields[framework];
					if (field && typeof package_json[field] === 'string') {
						resolved_path = package_json[field];
					}
				}

				// If no framework-specific entry, try exports field
				if (!resolved_path && package_json.exports) {
					const exported = resolve_exports.exports(package_json, '.', {
						conditions,
						browser: framework === 'js' || framework === 'react' || framework === 'solid',
					});

					if (exported && exported.length > 0) {
						resolved_path = exported[0];
					}
				}

				// Legacy fallback
				if (!resolved_path) {
					const legacy_result = resolve_exports.legacy(package_json, {
						fields: ['module', 'browser', 'main'],
						browser: true, // Just look for standard fields
					});

					if (typeof legacy_result === 'string') {
						resolved_path = legacy_result;
					} else if (legacy_result !== undefined) {
						// Handle browser object with main field mapping
						const browser_field = legacy_result as Browser;
						if (typeof browser_field === 'string') {
							resolved_path = browser_field;
						} else if (typeof browser_field === 'object' && !Array.isArray(browser_field)) {
							// Try to find mappings for main or module
							for (const field of ['module', 'main']) {
								if (typeof package_json[field] === 'string' && browser_field[package_json[field]]) {
									const mapping = browser_field[package_json[field]];
									if (typeof mapping === 'string') {
										resolved_path = mapping;
										break;
									}
								}
							}
						}
					}
				}

				// Last resort - index.js
				if (!resolved_path) {
					resolved_path = 'index.js';
				}
			} else {
				// Handle subpaths with exports field
				if (package_json.exports) {
					// Ensure subpath starts with ./ for exports resolution
					const normalized_subpath = subpath.startsWith('/')
						? `.${subpath}`
						: subpath === '.'
						? '.'
						: `.${subpath}`;

					const exported = resolve_exports.exports(package_json, normalized_subpath, {
						conditions,
						browser: framework === 'js' || framework === 'react' || framework === 'solid',
					});

					if (exported && exported.length > 0) {
						resolved_path = exported[0];
					}
				}

				// Handle browser field remapping for subpaths
				if (
					!resolved_path &&
					typeof package_json.browser === 'object' &&
					package_json.browser !== null
				) {
					const exact_path = subpath.startsWith('/') ? subpath.slice(1) : subpath;
					const browser_mapped =
						package_json.browser[exact_path] || package_json.browser[`${exact_path}.js`];

					if (typeof browser_mapped === 'string') {
						resolved_path = browser_mapped;
					} else if (browser_mapped === false) {
						// Empty module
						return {
							type: 'package',
							original_path: `${package_name}${subpath === '.' ? '' : subpath}`,
							package_name,
							subpath,
							version,
							resolved_url: 'data:text/javascript,export {}',
							is_external: true,
						};
					}
				}

				// Fallback to direct subpath
				if (!resolved_path) {
					resolved_path = subpath.startsWith('/') ? subpath.slice(1) : subpath;
				}
			}

			let resolved_url: string;

			// Handle data URLs directly
			if (resolved_path?.startsWith('data:')) {
				resolved_url = resolved_path;
			}
			// Handle absolute URLs
			else if (resolved_path && this.#is_url(resolved_path)) {
				resolved_url = resolved_path;
			}
			// Relative paths within the package need to be joined correctly
			else if (resolved_path) {
				// Join with the base URL, normalizing path separators
				const normalized_path = resolved_path.startsWith('./')
					? resolved_path.slice(2)
					: resolved_path;

				const full_url = new URL(normalized_path, `${base_url}/`).href;

				// Try to resolve barrel file with appropriate extension
				const barrel_resolved = await this.#extension_resolver.resolve_barrel_file(
					full_url,
					framework,
				);

				// Use barrel resolution or fallback to the full URL
				resolved_url = barrel_resolved || full_url;
			} else {
				// Last resort fallback
				resolved_url = `${base_url}/${subpath === '.' ? 'index.js' : subpath}`;
			}

			const result: ResolveResult = {
				type: 'package',
				original_path: `${package_name}${subpath === '.' ? '' : subpath}`,
				package_name,
				subpath,
				version,
				resolved_url,
				is_external: true,
			};

			this.#caches.url.set(cache_key, result);
			return result;
		} catch (error) {
			const error_message = error instanceof Error ? error.message : String(error);
			console.error(`Error resolving ${package_name}${subpath}@${version}:`, error);

			// Fallback URL construction
			const fallback_base_url = `https://cdn.jsdelivr.net/npm/${package_name}@${version}`;
			const fallback_path =
				subpath === '.' ? 'index.js' : subpath.startsWith('/') ? subpath.slice(1) : subpath;

			let resolved_url: string;

			try {
				// Try to resolve as a barrel file
				const barrel_url = new URL(fallback_path, `${fallback_base_url}/`).href;
				const barrel_resolved = await this.#extension_resolver.resolve_barrel_file(
					barrel_url,
					framework,
				);

				// Use barrel resolution or fallback to the full URL
				resolved_url = barrel_resolved || barrel_url;
			} catch (error) {
				// If barrel resolution fails entirely, use a direct URL construction
				resolved_url = `${fallback_base_url}/${fallback_path}`;
			}

			const result: ResolveResult = {
				type: 'package',
				original_path: `${package_name}${subpath === '.' ? '' : subpath}`,
				package_name,
				subpath,
				version,
				resolved_url,
				is_external: true,
				error_message,
			};

			this.#caches.url.set(cache_key, result);
			return result;
		}
	}

	/**
	 * Fetch and parse package.json
	 */
	async #fetch_package_json(package_name: string, version: string): Promise<PackageJson> {
		const cache_key = `${package_name}@${version}`;

		// Check in cache
		if (this.#caches.package_json.has(cache_key)) {
			return this.#caches.package_json.get(cache_key) as PackageJson;
		}

		const url = `https://cdn.jsdelivr.net/npm/${package_name}@${version}/package.json`;

		try {
			const content_result = await Result.from_async(this.fetch_content(url));

			if (!content_result.ok) {
				// Return minimal package.json
				return { name: package_name };
			}

			const package_json = JSON.parse(content_result.value) as PackageJson;

			if (!package_json.name) {
				package_json.name = package_name;
			}

			this.#caches.package_json.set(cache_key, package_json);
			return package_json;
		} catch (error) {
			// Return minimal package.json on error
			const minimal = { name: package_name };
			this.#caches.package_json.set(cache_key, minimal);
			return minimal;
		}
	}

	/**
	 * Follow redirects for a URL
	 */
	async #follow_redirects(url: string, uid: number): Promise<string | null> {
		const cache_key = `${url}:${uid}`;

		// Check if we have a cache hit
		const cache_url = this.#caches.redirects.get(cache_key);
		if (cache_url) {
			return cache_url;
		}

		try {
			// Perform a HEAD request to follow redirects
			const result = await Result.from_async(
				fetch(url, {
					method: 'HEAD',
					redirect: 'follow',
				}),
			);

			if (!result.ok) {
				return null;
			}

			const final_url = result.value.url;
			this.#caches.redirects.set(cache_key, final_url);
			return final_url;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Fetch content from a URL
	 */
	async fetch_content(url: string): Promise<string> {
		// Check cache
		if (this.#caches.content.has(url)) {
			return this.#caches.content.get(url) as string;
		}

		const result = await Result.from_async(
			fetch(url, {
				method: 'GET',
				// Add cache busting to avoid caching 404s
				cache: 'no-cache',
			}),
		);

		if (!result.ok) {
			throw new Error(`Failed to fetch ${url}: ${result.error}`);
		}

		const content = await result.value.text();

		// Cache the content
		this.#caches.content.set(url, content);

		return content;
	}

	/**
	 * Clear all caches
	 */
	clear_caches(): void {
		this.#caches.content.clear();
		this.#caches.url.clear();
		this.#caches.package_json.clear();
		this.#caches.redirects.clear();
		this.#extension_resolver.clear_cache();
	}
}

export interface WebWorkerBuildOptions {
	/**
	 * Files to be processed, keyed by filename
	 */
	files: Record<string, string>;

	/**
	 * Compiler registry for transforming files
	 */
	compilerRegistry?: CompilerRegistry;
}

export function webWorkerBuildPlugin(options: WebWorkerBuildOptions): Plugin {
	const { files, compilerRegistry: compiler_registry = new CompilerRegistry() } = options;

	const dependencyResolver = new DependencyResolver();
	const compiled_file_cache = new Map<string, { code: string; map?: any }>();

	return {
		name: 'web-worker-build',

		async load(id) {
			// If the file is in our input files, compile it
			if (files[id]) {
				// Check compilation cache first
				if (compiled_file_cache.has(id)) {
					return compiled_file_cache.get(id)!;
				}

				// Determine the framework/compiler based on file extension
				const framework = id.endsWith('.svelte') ? 'svelte' : 'js';

				try {
					// Get the appropriate compiler
					const compiler = await compiler_registry.get_compiler(framework);

					// Transform the file
					const transformed = await compiler.transform(files[id], id);

					// Cache the compiled result
					compiled_file_cache.set(id, transformed);

					return transformed;
				} catch (error) {
					console.error(`Compilation error for ${id}:`, error);
					throw error;
				}
			}

			return null;
		},

		async resolveId(source, importer, options) {
			// Skip resolution for entry files or already resolved modules
			if (options.isEntry) return null;

			try {
				// Resolve external packages to CDN URLs
				const resolveResult = await dependencyResolver.resolve(source, {
					framework: 'js', // default framework
				});

				return resolveResult.resolved_url;
			} catch (error) {
				console.warn(`Failed to resolve ${source}:`, error);
				return null;
			}
		},
	};
}

// Convenience function for creating the plugin
export function createWebWorkerBuildPlugin(options: WebWorkerBuildOptions) {
	return webWorkerBuildPlugin(options);
}
