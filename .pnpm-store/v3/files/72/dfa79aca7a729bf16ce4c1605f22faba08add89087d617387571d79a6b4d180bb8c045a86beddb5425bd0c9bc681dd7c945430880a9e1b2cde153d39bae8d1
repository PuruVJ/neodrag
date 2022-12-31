import { AstroErrorData } from "../core/errors/index.js";
const EVENT_ERROR = "ASTRO_CLI_ERROR";
const ANONYMIZE_MESSAGE_REGEX = /^(\w| )+/;
function anonymizeErrorMessage(msg) {
  const matchedMessage = msg.match(ANONYMIZE_MESSAGE_REGEX);
  if (!matchedMessage || !matchedMessage[0]) {
    return void 0;
  }
  return matchedMessage[0].trim().substring(0, 20);
}
function eventConfigError({
  err,
  cmd,
  isFatal
}) {
  const payload = {
    code: AstroErrorData.UnknownConfigError.code,
    isFatal,
    isConfig: true,
    cliCommand: cmd,
    configErrorPaths: err.issues.map((issue) => issue.path.join("."))
  };
  return [{ eventName: EVENT_ERROR, payload }];
}
function eventError({
  cmd,
  err,
  isFatal
}) {
  const payload = {
    code: err.code || AstroErrorData.UnknownError.code,
    plugin: err.plugin,
    cliCommand: cmd,
    isFatal,
    anonymousMessageHint: anonymizeErrorMessage(err.message)
  };
  return [{ eventName: EVENT_ERROR, payload }];
}
export {
  eventConfigError,
  eventError
};
