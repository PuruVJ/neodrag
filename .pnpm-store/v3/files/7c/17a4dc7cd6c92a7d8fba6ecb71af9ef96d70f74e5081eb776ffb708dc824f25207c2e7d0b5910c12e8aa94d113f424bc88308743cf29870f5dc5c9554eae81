const { runAsWorker } = require('synckit');

runAsWorker(async (node) => {
	const dynamicImport = new Function('file', 'return import(file)');
	const { serialize } = await dynamicImport('@astrojs/compiler/utils');
	return await serialize(node);
});
