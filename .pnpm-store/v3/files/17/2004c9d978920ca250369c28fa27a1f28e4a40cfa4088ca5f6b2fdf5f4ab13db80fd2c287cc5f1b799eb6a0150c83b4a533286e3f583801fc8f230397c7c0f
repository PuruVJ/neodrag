import { dim } from "kleur/colors";
import stringWidth from "string-width";
const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, type, message) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    type,
    level,
    message
  };
  if (levels[logLevel] > levels[level]) {
    return;
  }
  dest.write(event);
}
function info(opts, type, message) {
  return log(opts, "info", type, message);
}
function warn(opts, type, message) {
  return log(opts, "warn", type, message);
}
function error(opts, type, message) {
  return log(opts, "error", type, message);
}
function table(opts, columns) {
  return function logTable(logFn, ...input) {
    const message = columns.map((len, i) => padStr(input[i].toString(), len)).join(" ");
    logFn(opts, null, message);
  };
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function padStr(str, len) {
  const strLen = stringWidth(str);
  if (strLen > len) {
    return str.substring(0, len - 3) + "...";
  }
  const spaces = Array.from({ length: len - strLen }, () => " ").join("");
  return str + spaces;
}
let defaultLogLevel;
if (typeof process !== "undefined") {
  if (process.argv.includes("--verbose")) {
    defaultLogLevel = "debug";
  } else if (process.argv.includes("--silent")) {
    defaultLogLevel = "silent";
  } else {
    defaultLogLevel = "info";
  }
} else {
  defaultLogLevel = "info";
}
function timerMessage(message, startTime = Date.now()) {
  let timeDiff = Date.now() - startTime;
  let timeDisplay = timeDiff < 750 ? `${Math.round(timeDiff)}ms` : `${(timeDiff / 1e3).toFixed(1)}s`;
  return `${message}   ${dim(timeDisplay)}`;
}
export {
  dateTimeFormat,
  debug,
  defaultLogLevel,
  error,
  info,
  levels,
  log,
  table,
  timerMessage,
  warn
};
