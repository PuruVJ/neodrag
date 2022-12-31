"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorateCli = void 0;
const fs_1 = require("fs");
function decorateCli() {
    const path = 'node_modules/@angular/cli/lib/cli/index.js';
    const angularCLIInit = (0, fs_1.readFileSync)(path, 'utf-8');
    const start = angularCLIInit.indexOf(`(options) {`) + 11;
    const newContent = `${angularCLIInit.slice(0, start)}
  if (!process.env['NX_CLI_SET']) {
    require('nx/bin/nx');
    return new Promise(function(res, rej) {});
  }
  ${angularCLIInit.substring(start)}
`;
    (0, fs_1.writeFileSync)(path, newContent);
}
exports.decorateCli = decorateCli;
//# sourceMappingURL=decorate-cli.js.map