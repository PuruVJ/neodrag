import test from '@playwright/test';
import { setup } from '../test-utils';

test.describe('options.bounds', () => {
	test.describe('coords', () => {
		test('starts within bounds, fully overlapped', async ({ page }) => {
			await setup(page, 'options/bounds/coords', {
				bounds: { left: 0, top: 0, right:  },
			});
		});
	});
});
