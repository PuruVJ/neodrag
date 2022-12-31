import { createRequire } from "module";
import { pathToFileURL } from "url";
import { runHookConfigDone, runHookConfigSetup } from "../../integrations/index.js";
import createStaticPreviewServer from "./static-preview-server.js";
import { getResolvedHostForHttpServer } from "./util.js";
async function preview(_settings, { logging }) {
  const settings = await runHookConfigSetup({
    settings: _settings,
    command: "preview",
    logging
  });
  await runHookConfigDone({ settings, logging });
  const host = getResolvedHostForHttpServer(settings.config.server.host);
  const { port, headers } = settings.config.server;
  if (settings.config.output === "static") {
    const server2 = await createStaticPreviewServer(settings, { logging, host, port, headers });
    return server2;
  }
  if (!settings.adapter) {
    throw new Error(`[preview] No adapter found.`);
  }
  if (!settings.adapter.previewEntrypoint) {
    throw new Error(
      `[preview] The ${settings.adapter.name} adapter does not support the preview command.`
    );
  }
  const require2 = createRequire(settings.config.root);
  const previewEntrypointUrl = pathToFileURL(
    require2.resolve(settings.adapter.previewEntrypoint)
  ).href;
  const previewModule = await import(previewEntrypointUrl);
  if (typeof previewModule.default !== "function") {
    throw new Error(`[preview] ${settings.adapter.name} cannot preview your app.`);
  }
  const server = await previewModule.default({
    outDir: settings.config.outDir,
    client: settings.config.build.client,
    serverEntrypoint: new URL(settings.config.build.serverEntry, settings.config.build.server),
    host,
    port,
    base: settings.config.base
  });
  return server;
}
export {
  preview as default
};
