import debugPackage from "debug";
import { bold, cyan, dim, red, reset, yellow } from "kleur/colors";
import * as readline from "readline";
import { Writable } from "stream";
import stringWidth from "string-width";
import { dateTimeFormat, error, info, warn } from "./core.js";
let lastMessage;
let lastMessageCount = 1;
const nodeLogDestination = new Writable({
  objectMode: true,
  write(event, _, callback) {
    let dest = process.stderr;
    if (levels[event.level] < levels["error"]) {
      dest = process.stdout;
    }
    function getPrefix() {
      let prefix = "";
      let type = event.type;
      if (type) {
        prefix += dim(dateTimeFormat.format(new Date()) + " ");
        if (event.level === "info") {
          type = bold(cyan(`[${type}]`));
        } else if (event.level === "warn") {
          type = bold(yellow(`[${type}]`));
        } else if (event.level === "error") {
          type = bold(red(`[${type}]`));
        }
        prefix += `${type} `;
      }
      return reset(prefix);
    }
    let message = event.message;
    if (message === lastMessage) {
      lastMessageCount++;
      if (levels[event.level] < levels["error"]) {
        let lines = 1;
        let len = stringWidth(`${getPrefix()}${message}`);
        let cols = dest.columns;
        if (len > cols) {
          lines = Math.ceil(len / cols);
        }
        for (let i = 0; i < lines; i++) {
          readline.clearLine(dest, 0);
          readline.cursorTo(dest, 0);
          readline.moveCursor(dest, 0, -1);
        }
      }
      message = `${message} ${yellow(`(x${lastMessageCount})`)}`;
    } else {
      lastMessage = message;
      lastMessageCount = 1;
    }
    dest.write(getPrefix());
    dest.write(message);
    dest.write("\n");
    callback();
  }
});
const nodeLogOptions = {
  dest: nodeLogDestination,
  level: "info"
};
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
const debuggers = {};
function debug(type, ...messages) {
  const namespace = `astro:${type}`;
  debuggers[namespace] = debuggers[namespace] || debugPackage(namespace);
  return debuggers[namespace](...messages);
}
globalThis._astroGlobalDebug = debug;
const logger = {
  info: info.bind(null, nodeLogOptions),
  warn: warn.bind(null, nodeLogOptions),
  error: error.bind(null, nodeLogOptions)
};
function enableVerboseLogging() {
  debug("cli", '--verbose flag enabled! Enabling: DEBUG="*,-babel"');
  debug(
    "cli",
    'Tip: Set the DEBUG env variable directly for more control. Example: "DEBUG=astro:*,vite:* astro build".'
  );
}
export {
  debug,
  enableVerboseLogging,
  levels,
  logger,
  nodeLogDestination,
  nodeLogOptions
};
