import { createRoot } from 'react-dom/client';
import { describe, expect, test } from 'vitest';
import { resizeHandles } from '@neodrag/core/resize';
import { useResizable } from '../src/index.ts';

function ResizePanel() {
	const { ref } = useResizable([resizeHandles({ edges: ['e'] })]);
	return <div ref={ref} data-testid="panel" style={{ width: 160, height: 80 }} />;
}

describe('@neodrag/react useResizable', () => {
	test('attaches and detaches without error', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		const root = createRoot(host);
		root.render(<ResizePanel />);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await new Promise((r) => setTimeout(r, 0));
		const panel = host.querySelector('[data-testid="panel"]');
		expect(panel).toBeTruthy();
		expect(panel?.querySelector('[data-neodrag-resize-handle="e"]')).toBeTruthy();
		root.unmount();
		host.remove();
	});
});
