import { AstroTelemetry } from "@astrojs/telemetry";
import { createRequire } from "module";
import { ASTRO_VERSION } from "../core/constants.js";
const require2 = createRequire(import.meta.url);
function getViteVersion() {
  try {
    const { version } = require2("vite/package.json");
    return version;
  } catch (e) {
  }
  return void 0;
}
const telemetry = new AstroTelemetry({
  astroVersion: ASTRO_VERSION,
  viteVersion: getViteVersion()
});
export * from "./error.js";
export * from "./session.js";
export {
  telemetry
};
