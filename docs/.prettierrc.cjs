module.exports = {
	useTabs: true,
	semi: true,
	printWidth: 100,
	singleQuote: true,
	jsxSingleQuote: false,

	plugins: [require.resolve('prettier-plugin-astro'), require.resolve('prettier-plugin-svelte')],
	overrides: [
		{
			files: '*.astro',
			options: {
				parser: 'astro',
				jsxSingleQuote: false,
			},
		},
		{
			files: '*.svelte',
			options: {
				parser: 'svelte',
				jsxSingleQuote: false,
			},
		},
		{
			files: ['*.mdx', '*.md'],
			options: {
				useTabs: false,
				printWidth: 70,
			},
		},
	],
};
