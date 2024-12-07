import { file as brotliSize } from 'brotli-size';
import fg from 'fast-glob';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';

async function main() {
	const files = (
		await fg(new URL('../packages/*/dist/min/index.js', import.meta.url).pathname)
	).filter((path) => !path.includes('core'));

	const versions = (await fg(new URL('../packages/*/package.json', import.meta.url).pathname))
		.filter((path) => !path.includes('core'))
		.map((path) => {
			const framework = /packages\/(?<framework>[^ $]*)\/package\.json/.exec(path)?.groups
				?.framework!;

			return { framework, version: JSON.parse(readFileSync(path, 'utf-8')).version };
		});

	const contents = (
		await Promise.all(
			files.map(async (file) => {
				const framework = /packages\/(?<framework>[^ $]*)\/dist/.exec(file)?.groups?.framework!;
				const size = ((await brotliSize(file)) / 1024).toFixed(2);

				return { framework, size };
			}),
		)
	).reduce(
		(acc, { framework, size }) => ({
			...acc,
			[framework]: {
				size: +size,
				version: versions.find(({ framework: vFw }) => vFw === framework)?.version,
			},
		}),
		{},
	);

	// Ensure folder if not exists
	try {
		await mkdir(new URL('../docs/src/data', import.meta.url).pathname);
	} catch (error) {}

	console.table(Object.entries(contents).sort((a, b) => (a[0] > b[0] ? 1 : -1)));

	writeFile(
		new URL('../docs/src/data/sizes.json', import.meta.url),
		JSON.stringify(contents, null, 2),
	);
}

main();
