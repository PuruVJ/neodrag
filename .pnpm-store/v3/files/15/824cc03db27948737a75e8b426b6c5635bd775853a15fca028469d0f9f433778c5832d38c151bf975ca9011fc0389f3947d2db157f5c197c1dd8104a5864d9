import type { Pattern } from "fast-glob";
import type { executions, optionCallbacksPipe, optionPath, Options } from "../options/index.js";
export default class files {
    pipeline: (callbacks?: executions) => Promise<files>;
    not: (pattern: Options["exclude"]) => Promise<files>;
    by: (glob?: Pattern | Pattern[]) => Promise<files>;
    in: (path?: optionPath) => Promise<files>;
    pipe: optionCallbacksPipe;
    paths: Map<string, string>;
    results: Map<string, string>;
    constructor(debug?: optionCallbacksPipe["debug"]);
}
