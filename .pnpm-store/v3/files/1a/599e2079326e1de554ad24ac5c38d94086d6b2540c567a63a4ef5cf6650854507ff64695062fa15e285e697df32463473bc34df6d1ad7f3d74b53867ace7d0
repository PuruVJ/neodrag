import { DiagnosticSeverity, offsetAt } from "@astrojs/language-server";
import {
  bgRed,
  bgWhite,
  bgYellow,
  black,
  bold,
  cyan,
  gray,
  red,
  white,
  yellow
} from "kleur/colors";
import stringWidth from "string-width";
import { fileURLToPath } from "url";
function printDiagnostic(filePath, text, diag) {
  let result = [];
  const realStartLine = diag.range.start.line + 1;
  const realStartCharacter = diag.range.start.character + 1;
  const IDEFilePath = `${bold(cyan(fileURLToPath(filePath)))}:${bold(yellow(realStartLine))}:${bold(
    yellow(realStartCharacter)
  )}`;
  result.push(
    `${IDEFilePath} ${bold(getColorForSeverity(diag, getStringForSeverity(diag)))}: ${diag.message}`
  );
  const previousLine = getLine(diag.range.start.line - 1, text);
  if (previousLine) {
    result.push(`${getPrintableLineNumber(realStartLine - 1)}  ${gray(previousLine)}`);
  }
  const str = getLine(diag.range.start.line, text);
  const lineNumStr = realStartLine.toString().padStart(2, "0");
  const lineNumLen = lineNumStr.length;
  result.push(`${getBackgroundForSeverity(diag, lineNumStr)}  ${str}`);
  const tildes = generateString("~", diag.range.end.character - diag.range.start.character);
  const beforeChars = stringWidth(str.substring(0, diag.range.start.character));
  const spaces = generateString(" ", beforeChars + lineNumLen - 1);
  result.push(`   ${spaces}${bold(getColorForSeverity(diag, tildes))}`);
  const nextLine = getLine(diag.range.start.line + 1, text);
  if (nextLine) {
    result.push(`${getPrintableLineNumber(realStartLine + 1)}  ${gray(nextLine)}`);
  }
  result.push("");
  return result.join("\n");
}
function generateString(str, len) {
  return Array.from({ length: len }, () => str).join("");
}
function getStringForSeverity(diag) {
  switch (diag.severity) {
    case DiagnosticSeverity.Error:
      return "Error";
    case DiagnosticSeverity.Warning:
      return "Warning";
    case DiagnosticSeverity.Hint:
      return "Hint";
    default:
      return "Unknown";
  }
}
function getColorForSeverity(diag, text) {
  switch (diag.severity) {
    case DiagnosticSeverity.Error:
      return red(text);
    case DiagnosticSeverity.Warning:
      return yellow(text);
    case DiagnosticSeverity.Hint:
      return gray(text);
    default:
      return text;
  }
}
function getBackgroundForSeverity(diag, text) {
  switch (diag.severity) {
    case DiagnosticSeverity.Error:
      return bgRed(white(text));
    case DiagnosticSeverity.Warning:
      return bgYellow(white(text));
    case DiagnosticSeverity.Hint:
      return bgWhite(black(text));
    default:
      return text;
  }
}
function getPrintableLineNumber(line) {
  return bgWhite(black(line.toString().padStart(2, "0")));
}
function getLine(line, text) {
  return text.substring(
    offsetAt({ line, character: 0 }, text),
    offsetAt({ line, character: Number.MAX_SAFE_INTEGER }, text)
  ).replace(/\t/g, " ").trimEnd();
}
export {
  printDiagnostic
};
