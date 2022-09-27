const autoprefixer = require('autoprefixer');
const postcssJitProps = require('postcss-jit-props');
const OpenProps = require('open-props');

module.exports = {
	// only vars used are in build output
	plugins: [postcssJitProps(OpenProps), autoprefixer()],
};
