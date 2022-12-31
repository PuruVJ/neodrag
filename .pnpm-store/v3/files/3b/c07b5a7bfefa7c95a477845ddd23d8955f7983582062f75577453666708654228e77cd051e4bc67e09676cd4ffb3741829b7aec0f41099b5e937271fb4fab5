'use strict';

var test = require('tape');
var semver = require('semver');
var hasPackageExports = require('has-package-exports');
var hasConditionalPackageExports = require('has-package-exports/conditional');
var hasPackageExportPatterns = require('has-package-exports/pattern');
var hasPackageExportPatternTrailers = require('has-package-exports/pattern-trailers');
// eslint-disable-next-line global-require
var spawnSync = typeof window === 'undefined' && require('child_process').spawnSync;

test('has-package-exports', function (t) {
	var expected = typeof window === 'undefined' ? semver.satisfies(process.version, '^12.17.0 || >= 13') : null;
	t.equal(hasPackageExports, expected, 'module exports expected value: ' + expected);

	t.test('experimental warning', { skip: !spawnSync || process.env.RECURSION }, function (st) {
		st.plan(1);

		var res = spawnSync('node', ['test'], {
			env: { PATH: process.env.PATH, RECURSION: 'recursion' }
		});
		if (semver.satisfies(process.version, '~13.7 || ~13.8 || ~13.9 || =12.16.0')) {
			st.ok(String(res.stderr), 'stderr has an experimental warning in it');
		} else {
			st.equal(String(res.stderr), '', 'stderr is empty');
		}
	});

	var expectedConditional = typeof window === 'undefined' ? semver.satisfies(process.version, '^12.17.0 || >= 13.7') : null;
	t.equal(hasConditionalPackageExports, expectedConditional, './conditional entrypoint exports expected value: ' + expectedConditional);

	var expectedPattern = typeof window === 'undefined' ? semver.satisfies(process.version, '^12.20.0 || >= 14.13') : null;
	t.equal(hasPackageExportPatterns, expectedPattern, './pattern entrypoint exports expected value: ' + expectedPattern);

	var expectedPatternTrailers = typeof window === 'undefined' ? semver.satisfies(process.version, '^14.19 || >= 16.9') : null;
	t.equal(hasPackageExportPatternTrailers, expectedPatternTrailers, './pattern-trailers entrypoint exports expected value: ' + expectedPatternTrailers);

	t.end();
});
