module.exports = {
	useTabs: true,
	semi: true,
	printWidth: 100,
	singleQuote: true,

	plugins: [require.resolve('prettier-plugin-astro'), require.resolve('prettier-plugin-svelte')],
	overrides: [
		{
			files: '*.astro',
			options: {
				parser: 'astro',
			},
		},
		{
			files: ['*.mdx', '*.md'],
			options: {
				useTabs: false,
			},
		},
	],
};
