import fs from 'node:fs';
import path from 'node:path';

const roots = process.argv.slice(2).length
	? process.argv.slice(2)
	: ['docs', 'playground/svelte', 'packages/svelte/README.md', 'dropzone.md', 'sortable.md'];

function walk(dir, files = []) {
	if (!fs.existsSync(dir)) return files;
	if (fs.statSync(dir).isFile()) return [dir];
	for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, ent.name);
		if (ent.isDirectory()) walk(p, files);
		else if (/\.(svelte|mdx|md)$/.test(ent.name)) files.push(p);
	}
	return files;
}

function findMatchingParen(s, openIdx) {
	const open = s[openIdx];
	const close = open === '(' ? ')' : open === '[' ? ']' : open === '{' ? '}' : null;
	if (!close) return -1;
	let depth = 0;
	for (let i = openIdx; i < s.length; i++) {
		const c = s[i];
		if (c === open) depth++;
		else if (c === close) {
			depth--;
			if (depth === 0) return i;
		} else if ((c === '"' || c === "'" || c === '`') && depth > 0) {
			const q = c;
			i++;
			while (i < s.length && s[i] !== q) {
				if (s[i] === '\\') i++;
				i++;
			}
		}
	}
	return -1;
}

function splitTopLevelImports(imports) {
	return imports
		.split(',')
		.map((p) => p.trim())
		.filter(Boolean);
}

const PLUGIN_NAMES = new Set([
	'axis',
	'bounds',
	'BoundsFrom',
	'grid',
	'controls',
	'ControlFrom',
	'events',
	'position',
	'transform',
	'threshold',
	'touchAction',
	'scrollLock',
	'statemarker',
	'disabled',
	'dragData',
	'highlight',
	'onDrop',
]);

function isPluginImport(name) {
	const base = name.replace(/^type\s+/, '').trim();
	return PLUGIN_NAMES.has(base) || base.endsWith('Plugin');
}

function fixImports(content) {
	let out = content;
	const svelteMain = /(import\s*\{)([^}]+)(\}\s*from\s*['"]@neodrag\/svelte['"])/g;

	out = out.replace(svelteMain, (_, open, imports, close) => {
		const parts = splitTopLevelImports(imports);
		const main = [];
		const plugins = [];
		for (const p of parts) {
			if (p === 'draggable' || p === 'droppable') continue;
			if (isPluginImport(p)) plugins.push(p);
			else main.push(p);
		}
		if (!main.includes('Draggable') && parts.includes('draggable')) main.unshift('Draggable');
		if (!main.includes('Droppable') && parts.includes('droppable')) main.unshift('Droppable');
		let result = '';
		if (main.length) result += `${open} ${main.join(', ')} ${close}`;
		if (plugins.length) {
			if (result) result += '\n\t';
			result += `import { ${plugins.join(', ')} } from '@neodrag/svelte/plugins'`;
		}
		return result || `${open}${close}`;
	});

	const dropMain = /(import\s*\{)([^}]+)(\}\s*from\s*['"]@neodrag\/svelte\/drop['"])/g;
	out = out.replace(dropMain, (_, open, imports, close) => {
		const parts = splitTopLevelImports(imports);
		const main = [];
		const plugins = [];
		for (const p of parts) {
			if (p === 'droppable') continue;
			if (isPluginImport(p)) plugins.push(p);
			else main.push(p);
		}
		if (!main.includes('Droppable') && parts.includes('droppable')) main.unshift('Droppable');
		let result = '';
		if (main.length) result += `${open} ${main.join(', ')} ${close}`;
		if (plugins.length) {
			if (result) result += '\n\t';
			result += `import { ${plugins.join(', ')} } from '@neodrag/core/drop/plugins'`;
		}
		return result || `${open}${close}`;
	});

	return out;
}

function migrateAttachCalls(content, className = 'Draggable') {
	let out = content;
	const decls = [];
	const payloadToName = new Map();
	let counter = 0;

	const attachName = className === 'Droppable' ? 'droppable' : 'draggable';
	const re = new RegExp(`\\{@attach\\s+${attachName}\\s*\\(`, 'g');
	let match;
	const replacements = [];

	while ((match = re.exec(content)) !== null) {
		const start = match.index;
		const openParen = start + match[0].length - 1;
		const closeParen = findMatchingParen(content, openParen);
		if (closeParen === -1) continue;
		const inner = content.slice(openParen + 1, closeParen).trim();
		let isReactive = false;
		let payload = inner;
		if (inner.startsWith('() =>')) {
			isReactive = true;
			payload = inner.replace(/^\(\)\s*=>\s*/, '').trim();
			if (payload.startsWith('[')) payload = `() => ${payload}`;
			else payload = `() => [${payload}]`;
		}
		const key = `${className}:${isReactive ? 'fn:' : 'arr:'}${payload.trim()}`;
		let varName = payloadToName.get(key);
		if (!varName) {
			varName = `${className === 'Droppable' ? 'drop' : 'drag'}_${counter++}`;
			const plugins = isReactive ? `[${payload}]` : payload;
			decls.push(`const ${varName} = new ${className}({ plugins: ${plugins} });`);
			payloadToName.set(key, varName);
		}
		let end = closeParen + 1;
		if (content[end] === '}') end++;
		replacements.push({
			start,
			end,
			text: `{@attach ${varName}.attachment}`,
		});
	}

	for (let i = replacements.length - 1; i >= 0; i--) {
		const r = replacements[i];
		out = out.slice(0, r.start) + r.text + out.slice(r.end);
	}

	if (decls.length) {
		const scriptClose = out.indexOf('</script>');
		if (scriptClose !== -1) {
			const insert = '\n\t' + decls.join('\n\t') + '\n';
			out = out.slice(0, scriptClose) + insert + out.slice(scriptClose);
		}
	}

	return out;
}

function migrateSegment(content) {
	let out = fixImports(content);
	if (out.includes('{@attach draggable') || out.includes('{@attach droppable')) {
		out = migrateAttachCalls(out, 'Draggable');
		out = migrateAttachCalls(out, 'Droppable');
	}
	return out;
}

function migrateText(content) {
	let out = content;
	if (content.includes('```svelte')) {
		out = content.replace(/```svelte\n([\s\S]*?)```/g, (_, block) => {
			return '```svelte\n' + migrateSegment(block) + '```';
		});
	} else {
		out = migrateSegment(content);
	}
	out = out.replace(/`draggable\(\)`/g, '`new Draggable()`');
	out = out.replace(/`droppable\(\)`/g, '`new Droppable()`');
	out = out.replace(/draggable\(\) factory/g, 'Draggable class');
	out = out.replace(/deprecated shim/g, '');
	out = out.replace(
		/Most apps only need `draggable\(plugins\)`\./g,
		'Most apps only need `new Draggable({ plugins })`.',
	);
	out = out.replace(
		/`draggable\(\)` uses `Neodrag\.shared` internally\./g,
		'`Draggable` uses `Neodrag.shared` internally.',
	);
	out = out.replace(
		/use `\{@attach droppable\(\[\.\.\.\]\)\}` the same way as `draggable`/g,
		'use `new Droppable({ plugins })` and `{@attach drop.attachment}` like `Draggable`',
	);
	out = out.replace(
		/\/\/ Shared engine used by draggable\(\) in most apps/g,
		'// Shared engine used by Draggable',
	);
	return out;
}

for (const root of roots) {
	const abs = path.join(process.cwd(), root);
	const files = walk(abs);
	for (const file of files) {
		const raw = fs.readFileSync(file, 'utf8');
		if (
			!raw.includes('draggable') &&
			!raw.includes('droppable') &&
			!raw.includes("from '@neodrag/svelte'")
		)
			continue;
		const next = migrateText(raw);
		if (next !== raw) {
			fs.writeFileSync(file, next);
			console.log('updated', file);
		}
	}
}
