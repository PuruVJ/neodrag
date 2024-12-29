import test from '@playwright/test';

test.describe('ignoreMultitouch', () => {
	test('should allow multitouch', async () => {
		test.skip(
			true,
			'Playwright does not support multiple pointers yet https://github.com/microsoft/playwright/issues/34158',
		);
	});
});
