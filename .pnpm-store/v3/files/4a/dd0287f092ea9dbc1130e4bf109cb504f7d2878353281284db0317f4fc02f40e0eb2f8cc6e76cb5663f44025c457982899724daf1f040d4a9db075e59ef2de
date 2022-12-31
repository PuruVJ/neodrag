const { runAsWorker } = require('synckit');

runAsWorker(async (source) => {
	const dynamicImport = new Function('file', 'return import(file)');
	const { parse } = await dynamicImport('@astrojs/compiler');
	const { ast } = await parse(source);
	return ast;
});
