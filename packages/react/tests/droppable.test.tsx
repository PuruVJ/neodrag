import { createRoot } from 'react-dom/client';
import { describe, expect, test } from 'vitest';
import { accepts } from '@neodrag/core/drop/plugins';
import { useDroppable } from '../src/index.ts';

function DropZone() {
	const { ref } = useDroppable([accepts(() => true)]);
	return <div ref={ref} data-testid="drop-zone" style={{ width: 120, height: 80 }} />;
}

describe('@neodrag/react useDroppable', () => {
	test('attaches and detaches without error', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		const root = createRoot(host);
		root.render(<DropZone />);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await new Promise((r) => setTimeout(r, 0));
		const zone = host.querySelector('[data-testid="drop-zone"]');
		expect(zone).toBeTruthy();
		root.unmount();
		host.remove();
	});
});
