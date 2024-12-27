import test from '@playwright/test';
import { setup } from '../test-utils';
import { z } from 'zod';

test.describe('options.bounds', () => {
	test.describe('coords', () => {
		test('starts within bounds, fully overlapped', async ({ page }) => {
			await setup(page, 'plugins/bounds/coords', z.any(), {
				// bounds: { left: 0, top: 0, right:  },
			});
		});
	});
});
