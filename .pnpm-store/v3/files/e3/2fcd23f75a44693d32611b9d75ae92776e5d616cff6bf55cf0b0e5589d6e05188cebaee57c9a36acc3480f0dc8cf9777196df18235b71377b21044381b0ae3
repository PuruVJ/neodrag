"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAstroInstall = exports.isAstroWorkspace = exports.debounceThrottle = exports.debounceSameArg = exports.getRegExpMatches = exports.regexLastIndexOf = exports.isBeforeOrEqualToPosition = exports.isInRange = exports.isNotNullOrUndefined = exports.clamp = exports.modifyLines = exports.toPascalCase = exports.mergeDeep = exports.get = exports.getLastPartOfPath = exports.pathToUrl = exports.urlToPath = exports.normalizePath = exports.normalizeUri = void 0;
const vscode_uri_1 = require("vscode-uri");
const importPackage_1 = require("./importPackage");
/** Normalizes a document URI */
function normalizeUri(uri) {
    return vscode_uri_1.URI.parse(uri).toString();
}
exports.normalizeUri = normalizeUri;
/**
 * Some paths (on windows) start with a upper case driver letter, some don't.
 * This is normalized here.
 */
function normalizePath(path) {
    return vscode_uri_1.URI.file(path).fsPath.replace(/\\/g, '/');
}
exports.normalizePath = normalizePath;
/** Turns a URL into a normalized FS Path */
function urlToPath(stringUrl) {
    const url = vscode_uri_1.URI.parse(stringUrl);
    if (url.scheme !== 'file') {
        return null;
    }
    return url.fsPath.replace(/\\/g, '/');
}
exports.urlToPath = urlToPath;
/** Converts a path to a URL */
function pathToUrl(path) {
    return vscode_uri_1.URI.file(path).toString();
}
exports.pathToUrl = pathToUrl;
/**
 * Given a path like foo/bar or foo/bar.astro , returns its last path
 * (bar or bar.astro in this example).
 */
function getLastPartOfPath(path) {
    return path.replace(/\\/g, '/').split('/').pop() || '';
}
exports.getLastPartOfPath = getLastPartOfPath;
/**
 * Return an element in an object using a path as a string (ex: `astro.typescript.format` will return astro['typescript']['format']).
 * From: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
 */
function get(obj, path) {
    const travel = (regexp) => String.prototype.split
        .call(path, regexp)
        .filter(Boolean)
        .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined ? undefined : result;
}
exports.get = get;
/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 * From: https://stackoverflow.com/a/48218209
 */
function mergeDeep(...objects) {
    const isObject = (obj) => obj && typeof obj === 'object';
    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach((key) => {
            const pVal = prev[key];
            const oVal = obj[key];
            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            }
            else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            }
            else {
                prev[key] = oVal;
            }
        });
        return prev;
    }, {});
}
exports.mergeDeep = mergeDeep;
/**
 * Transform a string into PascalCase
 */
function toPascalCase(string) {
    return `${string}`
        .replace(new RegExp(/[-_]+/, 'g'), ' ')
        .replace(new RegExp(/[^\w\s]/, 'g'), '')
        .replace(new RegExp(/\s+(.)(\w*)/, 'g'), ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`)
        .replace(new RegExp(/\w/), (s) => s.toUpperCase());
}
exports.toPascalCase = toPascalCase;
/**
 * Function to modify each line of a text, preserving the line break style (`\n` or `\r\n`)
 */
function modifyLines(text, replacementFn) {
    let idx = 0;
    return text
        .split('\r\n')
        .map((l1) => l1
        .split('\n')
        .map((line) => replacementFn(line, idx++))
        .join('\n'))
        .join('\r\n');
}
exports.modifyLines = modifyLines;
/** Clamps a number between min and max */
function clamp(num, min, max) {
    return Math.max(min, Math.min(max, num));
}
exports.clamp = clamp;
function isNotNullOrUndefined(val) {
    return val !== undefined && val !== null;
}
exports.isNotNullOrUndefined = isNotNullOrUndefined;
function isInRange(range, positionToTest) {
    return isBeforeOrEqualToPosition(range.end, positionToTest) && isBeforeOrEqualToPosition(positionToTest, range.start);
}
exports.isInRange = isInRange;
function isBeforeOrEqualToPosition(position, positionToTest) {
    return (positionToTest.line < position.line ||
        (positionToTest.line === position.line && positionToTest.character <= position.character));
}
exports.isBeforeOrEqualToPosition = isBeforeOrEqualToPosition;
/**
 * Like str.lastIndexOf, but for regular expressions. Note that you need to provide the g-flag to your RegExp!
 */
function regexLastIndexOf(text, regex, endPos) {
    if (endPos === undefined) {
        endPos = text.length;
    }
    else if (endPos < 0) {
        endPos = 0;
    }
    const stringToWorkWith = text.substring(0, endPos + 1);
    let lastIndexOf = -1;
    let result = null;
    while ((result = regex.exec(stringToWorkWith)) !== null) {
        lastIndexOf = result.index;
    }
    return lastIndexOf;
}
exports.regexLastIndexOf = regexLastIndexOf;
/**
 * Get all matches of a regexp.
 */
function getRegExpMatches(regex, str) {
    const matches = [];
    let match;
    while ((match = regex.exec(str))) {
        matches.push(match);
    }
    return matches;
}
exports.getRegExpMatches = getRegExpMatches;
/**
 * Debounces a function but cancels previous invocation only if
 * a second function determines it should.
 *
 * @param fn The function with it's argument
 * @param determineIfSame The function which determines if the previous invocation should be canceld or not
 * @param milliseconds Number of miliseconds to debounce
 */
function debounceSameArg(fn, shouldCancelPrevious, milliseconds) {
    let timeout;
    let prevArg;
    return (arg) => {
        if (shouldCancelPrevious(arg, prevArg)) {
            clearTimeout(timeout);
        }
        prevArg = arg;
        timeout = setTimeout(() => {
            fn(arg);
            prevArg = undefined;
        }, milliseconds);
    };
}
exports.debounceSameArg = debounceSameArg;
/**
 * Debounces a function but also waits at minimum the specified number of milliseconds until
 * the next invocation. This avoids needless calls when a synchronous call (like diagnostics)
 * took too long and the whole timeout of the next call was eaten up already.
 *
 * @param fn The function with it's argument
 * @param milliseconds Number of milliseconds to debounce/throttle
 */
function debounceThrottle(fn, milliseconds) {
    let timeout;
    let lastInvocation = Date.now() - milliseconds;
    function maybeCall(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (Date.now() - lastInvocation < milliseconds) {
                maybeCall(...args);
                return;
            }
            fn(...args);
            lastInvocation = Date.now();
        }, milliseconds);
    }
    return maybeCall;
}
exports.debounceThrottle = debounceThrottle;
/**
 * Try to determine if a workspace could be an Astro project based on the content of `package.json`
 */
function isAstroWorkspace(workspacePath) {
    try {
        const astroPackageJson = require.resolve('./package.json', { paths: [workspacePath] });
        const deps = Object.assign(require(astroPackageJson).dependencies ?? {}, require(astroPackageJson).devDependencies ?? {});
        if (Object.keys(deps).includes('astro')) {
            return true;
        }
    }
    catch (e) {
        return false;
    }
    return false;
}
exports.isAstroWorkspace = isAstroWorkspace;
function getAstroInstall(basePaths) {
    let path;
    let version;
    try {
        path = (0, importPackage_1.getPackagePath)('astro', basePaths);
        if (!path) {
            throw Error;
        }
        version = require(path + '/package.json').version;
    }
    catch {
        // If we couldn't find it inside the workspace's node_modules, it might means we're in the monorepo
        try {
            path = (0, importPackage_1.getPackagePath)('./packages/astro', basePaths);
            if (!path) {
                throw Error;
            }
            version = require(path + '/package.json').version;
        }
        catch (e) {
            // If we still couldn't find it, it probably just doesn't exist
            console.error(`${basePaths[0]} seems to be an Astro project, but we couldn't find Astro or Astro is not installed`);
            return undefined;
        }
    }
    let [major, minor, patch] = version.split('.');
    if (patch.includes('-')) {
        const patchParts = patch.split('-');
        patch = patchParts[0];
    }
    return {
        path,
        version: {
            full: version,
            major: Number(major),
            minor: Number(minor),
            patch: Number(patch),
        },
    };
}
exports.getAstroInstall = getAstroInstall;
