'use strict';

var supported;
try {
	/* eslint global-require: 0 */
	supported = require('@ljharb/has-package-exports-patterns/pattern-trailers/pattern')
		&& require('@ljharb/has-package-exports-patterns/pattern-trailers/pattern.js');
} catch (e) {
	supported = false;
}
module.exports = supported;
