/**
 * @type import('./error.cjs').ProloadError
 */
class ProloadError extends Error {
	constructor(opts={}) {
		super(opts.message);
		this.name = 'ProloadError';
		this.code = opts.code || 'ERR_PROLOAD_INVALID';
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

/**
 * @type import('./error.cjs').assert
 */
function assert(bool, message, code) {
	if (bool) return;
	if (message instanceof Error) throw message;
	throw new ProloadError({ message, code });
}

module.exports.ProloadError = ProloadError;
module.exports.assert = assert;
