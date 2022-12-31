Object.defineProperty(exports, "__esModule", { value: true });
exports.createLanguageService = void 0;
const base = require("@volar/typescript");
const vue = require("@volar/vue-language-core");
function createLanguageService(host) {
    const mods = [vue.createLanguageModule(host.getTypeScriptModule(), host.getCurrentDirectory(), host.getCompilationSettings(), host.getVueCompilationSettings())];
    return base.createLanguageService(host, mods);
}
exports.createLanguageService = createLanguageService;
//# sourceMappingURL=index.js.map