import fs from 'node:fs';
import path from 'node:path';

const roots = ['packages', 'playground', 'docs'];

function walk(dir, out = []) {
	for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, ent.name);
		if (ent.name === 'node_modules' || ent.name === 'dist') continue;
		if (ent.isDirectory()) walk(p, out);
		else if (/\.(ts|tsx|svelte|mdx)$/.test(ent.name)) out.push(p);
	}
	return out;
}

function strip(content, file) {
	if (file.includes('apply-transform') || file.includes('transform-update')) return content;
	if (file.endsWith('OptionsDemoBase.svelte')) return content;

	let out = content;

	out = out.replace(
		/import\s*\{([^}]*)\}\s*from\s*['"]@neodrag\/[^'"]+['"]\s*;?/g,
		(match, imports) => {
			if (!/\btransform\b/.test(imports)) return match;
			const parts = imports
				.split(',')
				.map((p) => p.trim())
				.filter((p) => p && p !== 'transform' && !p.startsWith('type transform'));
			if (!parts.length) return '';
			return match.replace(imports, ` ${parts.join(', ')} `);
		},
	);

	out = out.replace(
		/import\s*\{([^}]*)\}\s*from\s*['"]\.\.?\/[^'"]+['"]\s*;?/g,
		(match, imports) => {
			if (!/\btransform\b/.test(imports) || /TransformApplier|applyTransform/.test(imports))
				return match;
			const parts = imports
				.split(',')
				.map((p) => p.trim())
				.filter((p) => p && p !== 'transform');
			if (!parts.length) return '';
			return match.replace(imports, ` ${parts.join(', ')} `);
		},
	);

	out = out.replace(/\[transform,\s*/g, '[');
	out = out.replace(/,\s*transform\]/g, ']');
	out = out.replace(/\[transform\]/g, '[]');
	out = out.replace(/plugins:\s*\[transform,\s*/g, 'plugins: [');
	out = out.replace(/,\s*transform\)/g, ')');
	out = out.replace(/transform:\s*typeof[^;]+;/g, '');
	out = out.replace(/\t\ttransform,\n/g, '');
	out = out.replace(/\n\s*transform,\n/g, '\n');

	return out;
}

for (const root of roots) {
	const abs = path.join(process.cwd(), root);
	if (!fs.existsSync(abs)) continue;
	for (const file of walk(abs)) {
		const raw = fs.readFileSync(file, 'utf8');
		if (!/\btransform\b/.test(raw)) continue;
		if (
			/style\.transform|@keyframes|text-transform|translate3d|applyTransform|TransformApplier|apply-transform/.test(
				raw,
			)
		)
			continue;
		const next = strip(raw, file);
		if (next !== raw) {
			fs.writeFileSync(file, next);
			console.log('updated', file);
		}
	}
}
