import ancestor from "common-ancestor-path";
import {
  appendExtension,
  appendForwardSlash,
  removeLeadingForwardSlashWindows
} from "../core/path.js";
function escapeViteEnvReferences(code) {
  return code.replace(/import\.meta\.env/g, "import\\u002Emeta.env");
}
function getFileInfo(id, config) {
  const sitePathname = appendForwardSlash(
    config.site ? new URL(config.base, config.site).pathname : config.base
  );
  const fileId = id.split("?")[0];
  let fileUrl = fileId.includes("/pages/") ? fileId.replace(/^.*?\/pages\//, sitePathname).replace(/(\/index)?\.(md|markdown|mdown|mkdn|mkd|mdwn|md|astro)$/, "") : void 0;
  if (fileUrl && config.trailingSlash === "always") {
    fileUrl = appendForwardSlash(fileUrl);
  }
  if (fileUrl && config.build.format === "file") {
    fileUrl = appendExtension(fileUrl, "html");
  }
  return { fileId, fileUrl };
}
function isValidAstroData(obj) {
  if (typeof obj === "object" && obj !== null && obj.hasOwnProperty("frontmatter")) {
    const { frontmatter } = obj;
    try {
      JSON.stringify(frontmatter);
    } catch {
      return false;
    }
    return typeof frontmatter === "object" && frontmatter !== null;
  }
  return false;
}
function safelyGetAstroData(vfileData) {
  const { astro } = vfileData;
  if (!astro)
    return { frontmatter: {} };
  if (!isValidAstroData(astro)) {
    throw Error(
      `[Markdown] A remark or rehype plugin tried to add invalid frontmatter. Ensure "astro.frontmatter" is a JSON object!`
    );
  }
  return astro;
}
function normalizeFilename(filename, config) {
  if (filename.startsWith("/@fs")) {
    filename = filename.slice("/@fs".length);
  } else if (filename.startsWith("/") && !ancestor(filename, config.root.pathname)) {
    filename = new URL("." + filename, config.root).pathname;
  }
  return removeLeadingForwardSlashWindows(filename);
}
export {
  escapeViteEnvReferences,
  getFileInfo,
  normalizeFilename,
  safelyGetAstroData
};
