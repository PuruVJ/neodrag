import { AstroCheck, DiagnosticSeverity } from "@astrojs/language-server";
import glob from "fast-glob";
import * as fs from "fs";
import { bold, dim, red, yellow } from "kleur/colors";
import { createRequire } from "module";
import ora from "ora";
import { fileURLToPath, pathToFileURL } from "url";
import { printDiagnostic } from "./print.js";
async function check(settings) {
  console.log(bold("astro check"));
  const root = settings.config.root;
  const spinner = ora(` Getting diagnostics for Astro files in ${fileURLToPath(root)}\u2026`).start();
  const require2 = createRequire(import.meta.url);
  let checker = new AstroCheck(
    root.toString(),
    require2.resolve("typescript/lib/tsserverlibrary.js", { paths: [root.toString()] })
  );
  const filesCount = await openAllDocuments(root, [], checker);
  let diagnostics = await checker.getDiagnostics();
  spinner.succeed();
  let result = {
    errors: 0,
    warnings: 0,
    hints: 0
  };
  diagnostics.forEach((diag) => {
    diag.diagnostics.forEach((d) => {
      console.log(printDiagnostic(diag.fileUri, diag.text, d));
      switch (d.severity) {
        case DiagnosticSeverity.Error: {
          result.errors++;
          break;
        }
        case DiagnosticSeverity.Warning: {
          result.warnings++;
          break;
        }
        case DiagnosticSeverity.Hint: {
          result.hints++;
          break;
        }
      }
    });
  });
  console.log(
    [
      bold(`Result (${filesCount} file${filesCount === 1 ? "" : "s"}): `),
      bold(red(`${result.errors} ${result.errors === 1 ? "error" : "errors"}`)),
      bold(yellow(`${result.warnings} ${result.warnings === 1 ? "warning" : "warnings"}`)),
      dim(`${result.hints} ${result.hints === 1 ? "hint" : "hints"}
`)
    ].join(`
${dim("-")} `)
  );
  const exitCode = result.errors ? 1 : 0;
  return exitCode;
}
async function openAllDocuments(workspaceUri, filePathsToIgnore, checker) {
  const files = await glob("**/*.astro", {
    cwd: fileURLToPath(workspaceUri),
    ignore: ["node_modules/**"].concat(filePathsToIgnore.map((ignore) => `${ignore}/**`)),
    absolute: true
  });
  for (const file of files) {
    const text = fs.readFileSync(file, "utf-8");
    checker.upsertDocument({
      uri: pathToFileURL(file).toString(),
      text
    });
  }
  return files.length;
}
export {
  check
};
