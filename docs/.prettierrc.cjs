module.exports = {
	useTabs: true,
	semi: true,
	printWidth: 100,

	plugins: [require.resolve("prettier-plugin-astro")],
	overrides: [
		{
			files: "*.astro",
			options: {
				parser: "astro",
			},
		},
	],
};
