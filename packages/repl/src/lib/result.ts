/**
 * A discriminated union type representing either success or failure.
 */
export type Result<T, E = unknown> =
	| { readonly ok: true; readonly value: T }
	| { readonly ok: false; readonly error: E };

/**
 * Special error type for Response objects that includes the Response
 */
export type ResponseError = {
	message: string;
	response: Response;
};

/**
 * Utility functions for working with Results
 */
export const Result = {
	/**
	 * Creates a success Result
	 */
	ok: <T>(value: T): Result<T, never> => ({
		ok: true,
		value,
	}),

	/**
	 * Creates a failure Result
	 */
	fail: <E>(error: E): Result<never, E> => ({
		ok: false,
		error,
	}),

	/**
	 * Wraps a synchronous function call in a Result
	 */
	from: <T>(fn: () => T): Result<T> => {
		try {
			return Result.ok(fn());
		} catch (error) {
			return Result.fail(error);
		}
	},

	/**
	 * Wraps an asynchronous function call in a Result
	 * Provides special handling for Response objects by checking response.ok
	 */
	from_async: async <T>(
		promise: Promise<T>,
	): Promise<T extends Response ? Result<T, ResponseError> : Result<T>> => {
		try {
			const value = await promise;

			// Special handling for Response objects
			if (value instanceof Response) {
				if (!value.ok) {
					return Result.fail({
						message: `Request failed with status ${value.status}: ${value.statusText}`,
						response: value,
					}) as any;
				}
			}

			return Result.ok(value) as any;
		} catch (error) {
			return Result.fail(error) as any;
		}
	},

	/**
	 * Maps a success result to a new value
	 */
	map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => {
		if (result.ok) {
			return Result.ok(fn(result.value));
		}
		return result;
	},

	/**
	 * Maps a failure result to a new error
	 */
	map_error: <T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> => {
		if (!result.ok) {
			return Result.fail(fn(result.error));
		}
		return result;
	},

	/**
	 * Chains multiple Results together
	 */
	flat_map: <T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> => {
		if (result.ok) {
			return fn(result.value);
		}
		return result;
	},

	/**
	 * Unwraps a Result, returning the success value or throwing the error
	 */
	unwrap: <T, E extends Error>(result: Result<T, E>): T => {
		if (result.ok) {
			return result.value;
		}
		throw result.error;
	},

	/**
	 * Unwraps a Result, returning the success value or a default value
	 */
	unwrap_or: <T, E>(result: Result<T, E>, defaultValue: T): T => {
		if (result.ok) {
			return result.value;
		}
		return defaultValue;
	},
};
