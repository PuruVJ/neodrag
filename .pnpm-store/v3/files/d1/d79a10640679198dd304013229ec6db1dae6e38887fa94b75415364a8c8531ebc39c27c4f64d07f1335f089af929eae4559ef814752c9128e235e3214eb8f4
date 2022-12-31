import fs from "fs";
import { preprocessCSS } from "vite";
import { AstroErrorData, CSSError, positionAt } from "../errors/index.js";
function createStylePreprocessor({
  filename,
  viteConfig,
  cssDeps,
  cssTransformErrors
}) {
  return async (content, attrs) => {
    var _a;
    const lang = `.${(attrs == null ? void 0 : attrs.lang) || "css"}`.toLowerCase();
    const id = `${filename}?astro&type=style&lang${lang}`;
    try {
      const result = await preprocessCSS(content, id, viteConfig);
      (_a = result.deps) == null ? void 0 : _a.forEach((dep) => {
        cssDeps.add(dep);
      });
      let map;
      if (result.map) {
        if (typeof result.map === "string") {
          map = result.map;
        } else if (result.map.mappings) {
          map = result.map.toString();
        }
      }
      return { code: result.code, map };
    } catch (err) {
      try {
        err = enhanceCSSError(err, filename);
      } catch {
      }
      cssTransformErrors.push(err);
      return { error: err + "" };
    }
  };
}
function enhanceCSSError(err, filename) {
  var _a;
  const fileContent = fs.readFileSync(filename).toString();
  const styleTagBeginning = fileContent.indexOf(((_a = err.input) == null ? void 0 : _a.source) ?? err.code);
  if (err.name === "CssSyntaxError") {
    const errorLine = positionAt(styleTagBeginning, fileContent).line + (err.line ?? 0);
    return new CSSError({
      ...AstroErrorData.CSSSyntaxError,
      message: err.reason,
      location: {
        file: filename,
        line: errorLine,
        column: err.column
      },
      stack: err.stack
    });
  }
  if (err.line && err.column) {
    const errorLine = positionAt(styleTagBeginning, fileContent).line + (err.line ?? 0);
    return new CSSError({
      ...AstroErrorData.UnknownCSSError,
      message: err.message,
      location: {
        file: filename,
        line: errorLine,
        column: err.column
      },
      frame: err.frame,
      stack: err.stack
    });
  }
  const errorPosition = positionAt(styleTagBeginning, fileContent);
  errorPosition.line += 1;
  return new CSSError({
    code: AstroErrorData.UnknownCSSError.code,
    message: err.message,
    location: {
      file: filename,
      line: errorPosition.line,
      column: 0
    },
    frame: err.frame,
    stack: err.stack
  });
}
export {
  createStylePreprocessor
};
