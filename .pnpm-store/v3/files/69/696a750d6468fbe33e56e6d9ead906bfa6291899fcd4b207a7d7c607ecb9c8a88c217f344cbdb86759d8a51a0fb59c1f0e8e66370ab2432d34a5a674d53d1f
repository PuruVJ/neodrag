import { isCI } from "ci-info";
import debug from "debug";
import { randomBytes } from "node:crypto";
import * as KEY from "./config-keys.js";
import { GlobalConfig } from "./config.js";
import { post } from "./post.js";
import { getProjectInfo } from "./project-info.js";
import { getSystemInfo } from "./system-info.js";
class AstroTelemetry {
  constructor(opts) {
    this.opts = opts;
    this.config = new GlobalConfig({ name: "astro" });
    this.debug = debug("astro:telemetry");
  }
  get astroVersion() {
    return this.opts.astroVersion;
  }
  get viteVersion() {
    return this.opts.viteVersion;
  }
  get ASTRO_TELEMETRY_DISABLED() {
    return process.env.ASTRO_TELEMETRY_DISABLED;
  }
  get TELEMETRY_DISABLED() {
    return process.env.TELEMETRY_DISABLED;
  }
  getConfigWithFallback(key, getValue) {
    const currentValue = this.config.get(key);
    if (currentValue) {
      return currentValue;
    }
    const newValue = getValue();
    this.config.set(key, newValue);
    return newValue;
  }
  get enabled() {
    return this.getConfigWithFallback(KEY.TELEMETRY_ENABLED, () => true);
  }
  get notifyDate() {
    return this.getConfigWithFallback(KEY.TELEMETRY_NOTIFY_DATE, () => "");
  }
  get anonymousId() {
    return this.getConfigWithFallback(KEY.TELEMETRY_ID, () => randomBytes(32).toString("hex"));
  }
  get anonymousSessionId() {
    this._anonymousSessionId = this._anonymousSessionId || randomBytes(32).toString("hex");
    return this._anonymousSessionId;
  }
  get anonymousProjectInfo() {
    this._anonymousProjectInfo = this._anonymousProjectInfo || getProjectInfo(isCI);
    return this._anonymousProjectInfo;
  }
  get isDisabled() {
    if (Boolean(this.ASTRO_TELEMETRY_DISABLED || this.TELEMETRY_DISABLED)) {
      return true;
    }
    return this.enabled === false;
  }
  setEnabled(value) {
    this.config.set(KEY.TELEMETRY_ENABLED, value);
  }
  clear() {
    return this.config.clear();
  }
  async notify(callback) {
    if (this.isDisabled || isCI) {
      return;
    }
    if (this.notifyDate) {
      return;
    }
    const enabled = await callback();
    this.config.set(KEY.TELEMETRY_NOTIFY_DATE, Date.now().toString());
    this.config.set(KEY.TELEMETRY_ENABLED, enabled);
  }
  async record(event = []) {
    const events = Array.isArray(event) ? event : [event];
    if (events.length < 1) {
      return Promise.resolve();
    }
    if (this.isDisabled) {
      this.debug("telemetry disabled");
      return Promise.resolve();
    }
    const meta = {
      ...getSystemInfo({ astroVersion: this.astroVersion, viteVersion: this.viteVersion })
    };
    const context = {
      ...this.anonymousProjectInfo,
      anonymousId: this.anonymousId,
      anonymousSessionId: this.anonymousSessionId
    };
    if (meta.isCI) {
      context.anonymousId = `CI.${meta.ciName || "UNKNOWN"}`;
    }
    if (this.debug.enabled) {
      this.debug({ context, meta });
      this.debug(JSON.stringify(events, null, 2));
      return Promise.resolve();
    }
    return post({
      context,
      meta,
      events
    }).catch((err) => {
      this.debug(`Error sending event: ${err.message}`);
    });
  }
}
export {
  AstroTelemetry
};
