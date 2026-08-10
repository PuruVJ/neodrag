import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const DEBUG_DIR = resolve(fileURLToPath(new URL('.', import.meta.url)), '.debug');
const safe = (name: string): string => name.replace(/[^a-z0-9-]/gi, '') || 'debug';

/**
 * Dev-only structured-log sink. The browser POSTs batches of `{ location, message, data, … }` events
 * to `/__debug?name=<n>` (or `/__debug/clear?name=<n>` to start a fresh session); each batch is
 * appended as JSON lines to `docs/.debug/<n>.log`, which the agent reads to debug the running app.
 * `.debug/` is gitignored. Active only under `astro dev` (apply: 'serve').
 */
export function debugLogPlugin(): Plugin {
	return {
		name: 'neodrag-debug-log',
		apply: 'serve',
		configureServer(server) {
			mkdirSync(DEBUG_DIR, { recursive: true });
			server.middlewares.use((req, res, next) => {
				if (!req.url?.startsWith('/__debug')) return next();
				if (req.method !== 'POST') {
					res.statusCode = 405;
					return res.end();
				}
				const url = new URL(req.url, 'http://localhost');
				const file = resolve(DEBUG_DIR, `${safe(url.searchParams.get('name') ?? 'debug')}.log`);
				let body = '';
				req.on('data', (chunk) => (body += chunk));
				req.on('end', () => {
					try {
						if (url.pathname === '/__debug/clear') {
							writeFileSync(file, `\n════════════════ debug session @ ${new Date().toISOString()} ════════════════\n`);
						} else {
							const parsed: unknown = JSON.parse(body || '[]');
							const events = Array.isArray(parsed) ? parsed : [parsed];
							appendFileSync(file, events.map((e) => JSON.stringify(e)).join('\n') + '\n');
						}
						res.statusCode = 204;
						res.end();
					} catch (err) {
						res.statusCode = 400;
						res.end(String(err));
					}
				});
			});
			server.config.logger.info('  🐛 debug log sink at /__debug → docs/.debug/<name>.log');
		},
	};
}
