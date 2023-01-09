export const coreConfig: ({
	dtsBanner,
}:
	| {
			dtsBanner?: string;
	  }
	| undefined) => ReturnType<typeof import('ttsup').defineConfig>;
