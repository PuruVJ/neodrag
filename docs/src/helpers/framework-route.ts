import type { Framework } from './constants';

const FRAMEWORK_PATH_RE = /\/docs\/(svelte|react|solid|vanilla|vue|core)/i;

export function framework_from_path(path: string): Framework | 'core' | undefined {
	const match = FRAMEWORK_PATH_RE.exec(path);
	return match?.[1] as Framework | 'core' | undefined;
}

export function is_docs_path(path: string) {
	return path.startsWith('/docs');
}

export function apply_docs_framework(framework: string | undefined) {
	const root = document.documentElement;

	if (framework) {
		root.dataset.framework = framework;
	} else {
		delete root.dataset.framework;
	}

	if (document.body) {
		delete document.body.dataset.framework;
	}
}

export function apply_docs_route_context(path = location.pathname) {
	const framework = framework_from_path(path);
	apply_docs_framework(framework);
	const is_docs = is_docs_path(path);
	document.documentElement.classList.toggle('docs-route', is_docs);
	document.body?.classList.toggle('docs-route', is_docs);
}
