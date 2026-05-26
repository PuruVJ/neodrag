import { cdp } from '@vitest/browser/context';
import { analyzeCdpProfile, type CdpProfile, type ProfileReport } from './profile-analysis.ts';

export async function profileScenario(
	name: string,
	fn: () => void | Promise<void>,
	options: { iterations?: number } = {},
): Promise<ProfileReport> {
	const iterations = options.iterations ?? 25;
	const session = cdp();
	await session.send('Profiler.enable');
	await session.send('Profiler.start');
	try {
		for (let i = 0; i < iterations; i++) {
			await fn();
		}
	} finally {
		const result = await session.send('Profiler.stop');
		await session.send('Profiler.disable');
		return analyzeCdpProfile(name, result.profile as CdpProfile);
	}
}
