export function translate(x: number, y: number) {
	return { translate: `${x}px ${y}px 0.000000001px` };
}

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to wait for all effects to flush
export const waitForEffects = async () => {
	// Wait for microtasks (immediate effects)
	await new Promise<void>((resolve) => queueMicrotask(resolve));

	// Wait for animation frame (paint effects)
	await new Promise((resolve) => requestAnimationFrame(resolve));

	// Wait one more frame to be safe in headless mode
	await new Promise((resolve) => requestAnimationFrame(resolve));
};

// Enhanced sleep function that also waits for effects
export const sleepAndWaitForEffects = async (ms = 0) => {
	if (ms > 0) {
		await sleep(ms);
	}
	await waitForEffects();
};
