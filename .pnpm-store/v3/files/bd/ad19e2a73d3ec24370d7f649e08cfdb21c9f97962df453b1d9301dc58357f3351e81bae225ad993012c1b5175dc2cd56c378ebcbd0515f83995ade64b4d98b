import type { GetStaticPathsItem, Params } from '../../@types/astro';
/**
 * given an array of params like `['x', 'y', 'z']` for
 * src/routes/[x]/[y]/[z]/svelte, create a function
 * that turns a RegExpExecArray into ({ x, y, z })
 */
export declare function getParams(array: string[]): (match: RegExpExecArray) => Params;
/**
 * given a route's Params object, validate parameter
 * values and create a stringified key for the route
 * that can be used to match request routes
 */
export declare function stringifyParams(params: GetStaticPathsItem['params'], routeComponent: string): string;
