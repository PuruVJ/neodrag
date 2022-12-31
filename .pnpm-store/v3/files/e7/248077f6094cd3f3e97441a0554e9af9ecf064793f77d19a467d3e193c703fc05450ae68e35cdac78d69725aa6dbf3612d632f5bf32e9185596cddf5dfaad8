"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordStat = exports.messages = exports.PromptMessages = void 0;
const tslib_1 = require("tslib");
const is_ci_1 = require("./is-ci");
class PromptMessages {
    constructor() {
        this.messages = {
            nxCloudCreation: [
                {
                    code: 'set-up-distributed-caching-ci',
                    message: `Enable distributed caching to make your CI faster`,
                },
            ],
            nxCloudMigration: [
                {
                    code: 'make-ci-faster',
                    message: `Enable distributed caching to make your CI faster?`,
                },
            ],
        };
        this.selectedMessages = {};
    }
    getPromptMessage(key) {
        if (this.selectedMessages[key] === undefined) {
            if (process.env.NX_GENERATE_DOCS_PROCESS === 'true') {
                this.selectedMessages[key] = 0;
            }
            else {
                this.selectedMessages[key] = Math.floor(Math.random() * this.messages[key].length);
            }
        }
        return this.messages[key][this.selectedMessages[key]].message;
    }
    codeOfSelectedPromptMessage(key) {
        if (this.selectedMessages[key] === undefined)
            return null;
        return this.messages[key][this.selectedMessages[key]].code;
    }
}
exports.PromptMessages = PromptMessages;
exports.messages = new PromptMessages();
/**
 * We are incrementing a counter to track how often create-nx-workspace is used in CI
 * vs dev environments. No personal information is collected.
 */
function recordStat(opts) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const major = Number(opts.nxVersion.split('.')[0]);
            if (process.env.NX_VERBOSE_LOGGING === 'true') {
                console.log(`Record stat. Major: ${major}`);
            }
            if (major < 10 || major > 15)
                return; // test version, skip it
            const axios = require('axios');
            yield ((_a = axios['default']) !== null && _a !== void 0 ? _a : axios)
                .create({
                baseURL: 'https://cloud.nx.app',
                timeout: 400,
            })
                .post('/nx-cloud/stats', {
                command: opts.command,
                isCI: (0, is_ci_1.isCI)(),
                useCloud: opts.useCloud,
                meta: opts.meta,
            });
        }
        catch (e) {
            if (process.env.NX_VERBOSE_LOGGING === 'true') {
                console.error(e);
            }
        }
    });
}
exports.recordStat = recordStat;
//# sourceMappingURL=ab-testing.js.map