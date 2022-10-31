import { file as brotliSize } from 'brotli-size';
import fg from 'fast-glob';
import { writeFile, mkdir } from 'node:fs/promises';

async function main() {
	const files = await fg(new URL('../packages/*/dist/index.js', import.meta.url).pathname);

	const contents = (
		await Promise.all(
			files.map(async (file) => {
				const framework = /packages\/(?<framework>[^ $]*)\/dist/.exec(file)?.groups?.framework!;
				const size = ((await brotliSize(file)) / 1024).toFixed(2);

				return { framework, size };
			})
		)
	).reduce((acc, { framework, size }) => ({ ...acc, [framework]: size }), {});

	// Ensure folder if not exists
	try {
		await mkdir(new URL('../docs/src/data', import.meta.url).pathname);
	} catch (error) {}

	writeFile(
		new URL('../docs/src/data/sizes.json', import.meta.url),
		JSON.stringify(contents, null, 2)
	);
}

main();
