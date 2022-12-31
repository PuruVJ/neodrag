const { ProloadError } = require('../error.cjs');
function load(...args) {
    return import('../esm/index.mjs').then(({ default: loader }) => loader(...args));
}

load.default = load;
load.ProloadError = ProloadError;
module.exports = load;
