import type { Framework } from './constants';

const FRAMEWORK_PATH_RE = /\/docs\/(svelte|react|solid|vanilla|vue|core)/i;

export function framework_from_path(path: string): Framework | 'core' | undefined {
	const match = FRAMEWORK_PATH_RE.exec(path);
	return match?.[1] as Framework | 'core' | undefined;
}

export function is_docs_path(path: string) {
	return path.startsWith('/docs');
}

export function apply_docs_route_context(path = location.pathname) {
	const framework = framework_from_path(path);
	const is_docs = is_docs_path(path);

	if (framework) {
		document.documentElement.dataset.framework = framework;
	} else {
		delete document.documentElement.dataset.framework;
	}

	document.body.classList.toggle('docs-route', is_docs);
}
