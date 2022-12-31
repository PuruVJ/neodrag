import path from 'path';
import { builtinModules } from 'module';
import { resolveDependencyData, isCommonDepWithoutSvelteField } from './dependencies';
import { VitePluginSvelteCache } from './vite-plugin-svelte-cache';

export async function resolveViaPackageJsonSvelte(
	importee: string,
	importer: string | undefined,
	cache: VitePluginSvelteCache
): Promise<string | void> {
	if (
		importer &&
		isBareImport(importee) &&
		!isNodeInternal(importee) &&
		!isCommonDepWithoutSvelteField(importee)
	) {
		const cached = cache.getResolvedSvelteField(importee, importer);
		if (cached) {
			return cached;
		}
		const pkgData = await resolveDependencyData(importee, importer);
		if (pkgData) {
			const { pkg, dir } = pkgData;
			if (pkg.svelte) {
				const result = path.resolve(dir, pkg.svelte);
				cache.setResolvedSvelteField(importee, importer, result);
				return result;
			}
		}
	}
}

function isNodeInternal(importee: string) {
	return importee.startsWith('node:') || builtinModules.includes(importee);
}

function isBareImport(importee: string): boolean {
	if (
		!importee ||
		importee[0] === '.' ||
		importee[0] === '\0' ||
		importee.includes(':') ||
		path.isAbsolute(importee)
	) {
		return false;
	}
	const parts = importee.split('/');
	switch (parts.length) {
		case 1:
			return true;
		case 2:
			return parts[0].startsWith('@');
		default:
			return false;
	}
}
