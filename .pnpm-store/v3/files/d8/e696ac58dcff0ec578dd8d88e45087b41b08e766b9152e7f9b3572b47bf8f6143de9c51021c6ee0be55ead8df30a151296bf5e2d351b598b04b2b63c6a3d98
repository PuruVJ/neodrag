import { codeFrame } from "./printer.js";
import { getErrorDataByCode } from "./utils.js";
class AstroError extends Error {
  constructor(props, ...params) {
    var _a;
    super(...params);
    this.type = "AstroError";
    const { code, name, title, message, stack, location, hint, frame } = props;
    this.errorCode = code;
    if (name && name !== "Error") {
      this.name = name;
    } else {
      this.name = ((_a = getErrorDataByCode(this.errorCode)) == null ? void 0 : _a.name) ?? "UnknownError";
    }
    this.title = title;
    if (message)
      this.message = message;
    this.stack = stack ? stack : this.stack;
    this.loc = location;
    this.hint = hint;
    this.frame = frame;
  }
  setErrorCode(errorCode) {
    this.errorCode = errorCode;
  }
  setLocation(location) {
    this.loc = location;
  }
  setName(name) {
    this.name = name;
  }
  setMessage(message) {
    this.message = message;
  }
  setHint(hint) {
    this.hint = hint;
  }
  setFrame(source, location) {
    this.frame = codeFrame(source, location);
  }
  static is(err) {
    return err.type === "AstroError";
  }
}
class CompilerError extends AstroError {
  constructor(props, ...params) {
    super(props, ...params);
    this.type = "CompilerError";
    this.name = "CompilerError";
  }
  static is(err) {
    return err.type === "CompilerError";
  }
}
class CSSError extends AstroError {
  constructor() {
    super(...arguments);
    this.type = "CSSError";
  }
  static is(err) {
    return err.type === "CSSError";
  }
}
class MarkdownError extends AstroError {
  constructor() {
    super(...arguments);
    this.type = "MarkdownError";
  }
  static is(err) {
    return err.type === "MarkdownError";
  }
}
class InternalError extends AstroError {
  constructor() {
    super(...arguments);
    this.type = "InternalError";
  }
  static is(err) {
    return err.type === "InternalError";
  }
}
class AggregateError extends AstroError {
  constructor(props, ...params) {
    super(props, ...params);
    this.type = "AggregateError";
    this.errors = props.errors;
  }
  static is(err) {
    return err.type === "AggregateError";
  }
}
export {
  AggregateError,
  AstroError,
  CSSError,
  CompilerError,
  InternalError,
  MarkdownError
};
