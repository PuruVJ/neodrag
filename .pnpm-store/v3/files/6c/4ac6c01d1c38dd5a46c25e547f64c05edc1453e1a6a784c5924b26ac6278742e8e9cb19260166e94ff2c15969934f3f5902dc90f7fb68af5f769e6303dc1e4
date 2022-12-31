"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const perf_hooks_1 = require("perf_hooks");
if (process.env.NX_PERF_LOGGING) {
    const obs = new perf_hooks_1.PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            console.log(`Time for '${entry.name}'`, entry.duration);
        }
    });
    obs.observe({ entryTypes: ['measure'] });
}
//# sourceMappingURL=perf-logging.js.map