export type CdpProfile = {
	nodes: Array<{
		id: number;
		callFrame: {
			functionName: string;
			url: string;
			lineNumber: number;
			columnNumber: number;
		};
		hitCount?: number;
		children?: number[];
	}>;
	samples?: number[];
	timeDeltas?: number[];
};

export type ProfileFrameStat = {
	label: string;
	functionName: string;
	url: string;
	category: 'neodrag' | 'browser' | 'test' | 'other';
	selfMs: number;
	totalMs: number;
	selfPct: number;
	totalPct: number;
};

export type ProfileReport = {
	name: string;
	sampleCount: number;
	durationMs: number;
	byCategory: Record<string, number>;
	topSelf: ProfileFrameStat[];
	topTotal: ProfileFrameStat[];
};

function shortUrl(url: string) {
	if (!url) return '';
	try {
		const u = new URL(url);
		const path = u.pathname;
		const idx = path.indexOf('/packages/core/');
		if (idx >= 0) return path.slice(idx + 1);
		const idx2 = path.indexOf('/node_modules/');
		if (idx2 >= 0) return path.slice(idx2 + 13);
		return path.split('/').slice(-2).join('/');
	} catch {
		return url.slice(-60);
	}
}

function categorize(url: string, functionName: string): ProfileFrameStat['category'] {
	const id = `${url} ${functionName}`;
	if (
		url.includes('/packages/core/') ||
		url.includes('/core/src/') ||
		/\/src\/(engine|plugins|drop|instance|threshold|sensors|drop-targets)/.test(url) ||
		id.includes('Neodrag') ||
		id.includes('#onInteraction') ||
		id.includes('#runDrag') ||
		id.includes('#runStart') ||
		id.includes('DragInstance') ||
		id.includes('DropInstance') ||
		id.includes('passesDragThreshold')
	) {
		return 'neodrag';
	}
	if (!url) return 'other';
	if (url.includes('benchmarks/browser/') || url.includes('human-')) return 'test';
	if (
		url.startsWith('http') ||
		url.includes('chrome-extension') ||
		url === '' ||
		url.includes('vite') ||
		url.includes('vitest')
	) {
		return 'browser';
	}
	return 'other';
}

function frameLabel(node: CdpProfile['nodes'][number]): string {
	const cf = node.callFrame;
	const name = cf.functionName || '(anonymous)';
	const where = shortUrl(cf.url);
	if (!where) return name;
	return `${name} (${where}:${cf.lineNumber + 1})`;
}

export function analyzeCdpProfile(name: string, profile: CdpProfile): ProfileReport {
	const nodes = profile.nodes;
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const parent = new Map<number, number>();
	for (const node of nodes) {
		for (const child of node.children ?? []) {
			parent.set(child, node.id);
		}
	}

	const selfUs = new Map<number, number>();
	const totalUs = new Map<number, number>();
	const samples = profile.samples ?? [];
	const deltas = profile.timeDeltas ?? [];
	let durationUs = 0;

	for (let i = 0; i < samples.length; i++) {
		const delta = deltas[i] ?? 0;
		durationUs += delta;
		let id: number | undefined = samples[i]!;
		selfUs.set(id, (selfUs.get(id) ?? 0) + delta);

		const seen = new Set<number>();
		while (id !== undefined && !seen.has(id)) {
			seen.add(id);
			totalUs.set(id, (totalUs.get(id) ?? 0) + delta);
			id = parent.get(id);
		}
	}

	const durationMs = durationUs / 1000;
	const stats: ProfileFrameStat[] = [];

	for (const node of nodes) {
		const self = (selfUs.get(node.id) ?? 0) / 1000;
		const total = (totalUs.get(node.id) ?? 0) / 1000;
		if (self < 0.001 && total < 0.001) continue;
		stats.push({
			label: frameLabel(node),
			functionName: node.callFrame.functionName || '(anonymous)',
			url: node.callFrame.url,
			category: categorize(node.callFrame.url, node.callFrame.functionName),
			selfMs: self,
			totalMs: total,
			selfPct: durationMs > 0 ? (self / durationMs) * 100 : 0,
			totalPct: durationMs > 0 ? (total / durationMs) * 100 : 0,
		});
	}

	const byCategory: Record<string, number> = {
		neodrag: 0,
		browser: 0,
		test: 0,
		other: 0,
	};
	for (const s of stats) {
		byCategory[s.category] = (byCategory[s.category] ?? 0) + s.selfMs;
	}

	const topSelf = [...stats].sort((a, b) => b.selfMs - a.selfMs).slice(0, 20);
	const topTotal = [...stats].sort((a, b) => b.totalMs - a.totalMs).slice(0, 20);

	return {
		name,
		sampleCount: samples.length,
		durationMs,
		byCategory,
		topSelf,
		topTotal,
	};
}

export function formatProfileReport(report: ProfileReport): string {
	const lines: string[] = [];
	lines.push(`\n## ${report.name}`);
	lines.push(
		`Samples: ${report.sampleCount} · profile window: ~${report.durationMs.toFixed(2)} ms`,
	);
	const catTotal = Object.values(report.byCategory).reduce((a, b) => a + b, 0) || 1;
	lines.push('\nSelf time by category:');
	for (const [cat, ms] of Object.entries(report.byCategory).sort((a, b) => b[1] - a[1])) {
		lines.push(`  ${cat}: ${ms.toFixed(2)} ms (${((ms / catTotal) * 100).toFixed(1)}%)`);
	}
	lines.push('\nTop self time (where CPU spent in that frame):');
	for (const row of report.topSelf.slice(0, 12)) {
		lines.push(`  ${row.selfPct.toFixed(1)}% self · ${row.label}`);
	}
	lines.push('\nTop total time (inclusive, ancestors + self):');
	for (const row of report.topTotal.slice(0, 8)) {
		lines.push(`  ${row.totalPct.toFixed(1)}% total · ${row.label}`);
	}
	return lines.join('\n');
}
