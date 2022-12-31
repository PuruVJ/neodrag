import idlePrebuilt from "../client/idle.prebuilt.js";
import loadPrebuilt from "../client/load.prebuilt.js";
import mediaPrebuilt from "../client/media.prebuilt.js";
import onlyPrebuilt from "../client/only.prebuilt.js";
import visiblePrebuilt from "../client/visible.prebuilt.js";
import islandScript from "./astro-island.prebuilt.js";
function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
const hydrationScripts = {
  idle: idlePrebuilt,
  load: loadPrebuilt,
  only: onlyPrebuilt,
  media: mediaPrebuilt,
  visible: visiblePrebuilt
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case "both":
      return `<style>astro-island,astro-slot{display:contents}</style><script>${getDirectiveScriptText(directive) + islandScript}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return "";
}
export {
  determineIfNeedsHydrationScript,
  determinesIfNeedsDirectiveScript,
  getPrescripts,
  hydrationScripts
};
