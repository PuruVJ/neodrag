import { transform } from "@astrojs/compiler";
import { AggregateError, CompilerError } from "../errors/errors.js";
import { AstroErrorData } from "../errors/index.js";
import { resolvePath } from "../util.js";
import { createStylePreprocessor } from "./style.js";
async function compile({
  astroConfig,
  viteConfig,
  filename,
  id: moduleId,
  source
}) {
  var _a;
  const cssDeps = /* @__PURE__ */ new Set();
  const cssTransformErrors = [];
  let transformResult;
  try {
    transformResult = await transform(source, {
      moduleId,
      pathname: filename,
      projectRoot: astroConfig.root.toString(),
      site: (_a = astroConfig.site) == null ? void 0 : _a.toString(),
      sourcefile: filename,
      sourcemap: "both",
      internalURL: "astro/server/index.js",
      experimentalStaticExtraction: true,
      preprocessStyle: createStylePreprocessor({
        filename,
        viteConfig,
        cssDeps,
        cssTransformErrors
      }),
      async resolvePath(specifier) {
        return resolvePath(specifier, filename);
      }
    });
  } catch (err) {
    throw new CompilerError({
      ...AstroErrorData.UnknownCompilerError,
      message: err.message ?? "Unknown compiler error",
      stack: err.stack,
      location: {
        file: filename
      }
    });
  }
  handleCompileResultErrors(transformResult, cssTransformErrors);
  return {
    ...transformResult,
    cssDeps,
    source
  };
}
function handleCompileResultErrors(result, cssTransformErrors) {
  const compilerError = result.diagnostics.find((diag) => diag.severity === 1);
  if (compilerError) {
    throw new CompilerError({
      code: compilerError.code,
      message: compilerError.text,
      location: {
        line: compilerError.location.line,
        column: compilerError.location.column,
        file: compilerError.location.file
      },
      hint: compilerError.hint
    });
  }
  switch (cssTransformErrors.length) {
    case 0:
      break;
    case 1: {
      const error = cssTransformErrors[0];
      if (!error.errorCode) {
        error.errorCode = AstroErrorData.UnknownCSSError.code;
      }
      throw cssTransformErrors[0];
    }
    default: {
      throw new AggregateError({
        ...cssTransformErrors[0],
        code: cssTransformErrors[0].errorCode,
        errors: cssTransformErrors
      });
    }
  }
}
export {
  compile
};
