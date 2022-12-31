import { dim } from "kleur/colors";
import { performance } from "node:perf_hooks";
import { contentObservable, createContentTypesGenerator } from "../../content/index.js";
import { getTimeStat } from "../../core/build/util.js";
import { AstroError, AstroErrorData } from "../../core/errors/index.js";
import { info } from "../../core/logger/core.js";
async function sync(settings, { logging, fs }) {
  const timerStart = performance.now();
  try {
    const contentTypesGenerator = await createContentTypesGenerator({
      contentConfigObserver: contentObservable({ status: "loading" }),
      logging,
      fs,
      settings
    });
    await contentTypesGenerator.init();
  } catch (e) {
    throw new AstroError(AstroErrorData.GenerateContentTypesError);
  }
  info(logging, "content", `Types generated ${dim(getTimeStat(timerStart, performance.now()))}`);
  return 0;
}
export {
  sync
};
