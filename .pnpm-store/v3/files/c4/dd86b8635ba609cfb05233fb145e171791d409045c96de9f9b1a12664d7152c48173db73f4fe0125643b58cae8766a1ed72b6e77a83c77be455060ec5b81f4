'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var compiler = require('svelte/compiler');
var dedent = require('dedent-js');
var ts = require('typescript');
var pascalCase = require('pascal-case');
var path = require('path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () {
                        return e[k];
                    }
                });
            }
        });
    }
    n['default'] = e;
    return Object.freeze(n);
}

var dedent__default = /*#__PURE__*/_interopDefaultLegacy(dedent);
var ts__default = /*#__PURE__*/_interopDefaultLegacy(ts);
var ts__namespace = /*#__PURE__*/_interopNamespace(ts);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var path__namespace = /*#__PURE__*/_interopNamespace(path);

var charToInteger = {};
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
for (var i = 0; i < chars.length; i++) {
    charToInteger[chars.charCodeAt(i)] = i;
}
function encode(decoded) {
    var sourceFileIndex = 0; // second field
    var sourceCodeLine = 0; // third field
    var sourceCodeColumn = 0; // fourth field
    var nameIndex = 0; // fifth field
    var mappings = '';
    for (var i = 0; i < decoded.length; i++) {
        var line = decoded[i];
        if (i > 0)
            mappings += ';';
        if (line.length === 0)
            continue;
        var generatedCodeColumn = 0; // first field
        var lineMappings = [];
        for (var _i = 0, line_1 = line; _i < line_1.length; _i++) {
            var segment = line_1[_i];
            var segmentMappings = encodeInteger(segment[0] - generatedCodeColumn);
            generatedCodeColumn = segment[0];
            if (segment.length > 1) {
                segmentMappings +=
                    encodeInteger(segment[1] - sourceFileIndex) +
                        encodeInteger(segment[2] - sourceCodeLine) +
                        encodeInteger(segment[3] - sourceCodeColumn);
                sourceFileIndex = segment[1];
                sourceCodeLine = segment[2];
                sourceCodeColumn = segment[3];
            }
            if (segment.length === 5) {
                segmentMappings += encodeInteger(segment[4] - nameIndex);
                nameIndex = segment[4];
            }
            lineMappings.push(segmentMappings);
        }
        mappings += lineMappings.join(',');
    }
    return mappings;
}
function encodeInteger(num) {
    var result = '';
    num = num < 0 ? (-num << 1) | 1 : num << 1;
    do {
        var clamped = num & 31;
        num >>>= 5;
        if (num > 0) {
            clamped |= 32;
        }
        result += chars[clamped];
    } while (num > 0);
    return result;
}

var BitSet = function BitSet(arg) {
	this.bits = arg instanceof BitSet ? arg.bits.slice() : [];
};

BitSet.prototype.add = function add (n) {
	this.bits[n >> 5] |= 1 << (n & 31);
};

BitSet.prototype.has = function has (n) {
	return !!(this.bits[n >> 5] & (1 << (n & 31)));
};

var Chunk = function Chunk(start, end, content) {
	this.start = start;
	this.end = end;
	this.original = content;

	this.intro = '';
	this.outro = '';

	this.content = content;
	this.storeName = false;
	this.edited = false;

	// we make these non-enumerable, for sanity while debugging
	Object.defineProperties(this, {
		previous: { writable: true, value: null },
		next: { writable: true, value: null },
	});
};

Chunk.prototype.appendLeft = function appendLeft (content) {
	this.outro += content;
};

Chunk.prototype.appendRight = function appendRight (content) {
	this.intro = this.intro + content;
};

Chunk.prototype.clone = function clone () {
	var chunk = new Chunk(this.start, this.end, this.original);

	chunk.intro = this.intro;
	chunk.outro = this.outro;
	chunk.content = this.content;
	chunk.storeName = this.storeName;
	chunk.edited = this.edited;

	return chunk;
};

Chunk.prototype.contains = function contains (index) {
	return this.start < index && index < this.end;
};

Chunk.prototype.eachNext = function eachNext (fn) {
	var chunk = this;
	while (chunk) {
		fn(chunk);
		chunk = chunk.next;
	}
};

Chunk.prototype.eachPrevious = function eachPrevious (fn) {
	var chunk = this;
	while (chunk) {
		fn(chunk);
		chunk = chunk.previous;
	}
};

Chunk.prototype.edit = function edit (content, storeName, contentOnly) {
	this.content = content;
	if (!contentOnly) {
		this.intro = '';
		this.outro = '';
	}
	this.storeName = storeName;

	this.edited = true;

	return this;
};

Chunk.prototype.prependLeft = function prependLeft (content) {
	this.outro = content + this.outro;
};

Chunk.prototype.prependRight = function prependRight (content) {
	this.intro = content + this.intro;
};

Chunk.prototype.split = function split (index) {
	var sliceIndex = index - this.start;

	var originalBefore = this.original.slice(0, sliceIndex);
	var originalAfter = this.original.slice(sliceIndex);

	this.original = originalBefore;

	var newChunk = new Chunk(index, this.end, originalAfter);
	newChunk.outro = this.outro;
	this.outro = '';

	this.end = index;

	if (this.edited) {
		// TODO is this block necessary?...
		newChunk.edit('', false);
		this.content = '';
	} else {
		this.content = originalBefore;
	}

	newChunk.next = this.next;
	if (newChunk.next) { newChunk.next.previous = newChunk; }
	newChunk.previous = this;
	this.next = newChunk;

	return newChunk;
};

Chunk.prototype.toString = function toString () {
	return this.intro + this.content + this.outro;
};

Chunk.prototype.trimEnd = function trimEnd (rx) {
	this.outro = this.outro.replace(rx, '');
	if (this.outro.length) { return true; }

	var trimmed = this.content.replace(rx, '');

	if (trimmed.length) {
		if (trimmed !== this.content) {
			this.split(this.start + trimmed.length).edit('', undefined, true);
		}
		return true;
	} else {
		this.edit('', undefined, true);

		this.intro = this.intro.replace(rx, '');
		if (this.intro.length) { return true; }
	}
};

Chunk.prototype.trimStart = function trimStart (rx) {
	this.intro = this.intro.replace(rx, '');
	if (this.intro.length) { return true; }

	var trimmed = this.content.replace(rx, '');

	if (trimmed.length) {
		if (trimmed !== this.content) {
			this.split(this.end - trimmed.length);
			this.edit('', undefined, true);
		}
		return true;
	} else {
		this.edit('', undefined, true);

		this.outro = this.outro.replace(rx, '');
		if (this.outro.length) { return true; }
	}
};

var btoa = function () {
	throw new Error('Unsupported environment: `window.btoa` or `Buffer` should be supported.');
};
if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
	btoa = function (str) { return window.btoa(unescape(encodeURIComponent(str))); };
} else if (typeof Buffer === 'function') {
	btoa = function (str) { return Buffer.from(str, 'utf-8').toString('base64'); };
}

var SourceMap = function SourceMap(properties) {
	this.version = 3;
	this.file = properties.file;
	this.sources = properties.sources;
	this.sourcesContent = properties.sourcesContent;
	this.names = properties.names;
	this.mappings = encode(properties.mappings);
};

SourceMap.prototype.toString = function toString () {
	return JSON.stringify(this);
};

SourceMap.prototype.toUrl = function toUrl () {
	return 'data:application/json;charset=utf-8;base64,' + btoa(this.toString());
};

function guessIndent(code) {
	var lines = code.split('\n');

	var tabbed = lines.filter(function (line) { return /^\t+/.test(line); });
	var spaced = lines.filter(function (line) { return /^ {2,}/.test(line); });

	if (tabbed.length === 0 && spaced.length === 0) {
		return null;
	}

	// More lines tabbed than spaced? Assume tabs, and
	// default to tabs in the case of a tie (or nothing
	// to go on)
	if (tabbed.length >= spaced.length) {
		return '\t';
	}

	// Otherwise, we need to guess the multiple
	var min = spaced.reduce(function (previous, current) {
		var numSpaces = /^ +/.exec(current)[0].length;
		return Math.min(numSpaces, previous);
	}, Infinity);

	return new Array(min + 1).join(' ');
}

function getRelativePath(from, to) {
	var fromParts = from.split(/[/\\]/);
	var toParts = to.split(/[/\\]/);

	fromParts.pop(); // get dirname

	while (fromParts[0] === toParts[0]) {
		fromParts.shift();
		toParts.shift();
	}

	if (fromParts.length) {
		var i = fromParts.length;
		while (i--) { fromParts[i] = '..'; }
	}

	return fromParts.concat(toParts).join('/');
}

var toString = Object.prototype.toString;

function isObject(thing) {
	return toString.call(thing) === '[object Object]';
}

function getLocator(source) {
	var originalLines = source.split('\n');
	var lineOffsets = [];

	for (var i = 0, pos = 0; i < originalLines.length; i++) {
		lineOffsets.push(pos);
		pos += originalLines[i].length + 1;
	}

	return function locate(index) {
		var i = 0;
		var j = lineOffsets.length;
		while (i < j) {
			var m = (i + j) >> 1;
			if (index < lineOffsets[m]) {
				j = m;
			} else {
				i = m + 1;
			}
		}
		var line = i - 1;
		var column = index - lineOffsets[line];
		return { line: line, column: column };
	};
}

var Mappings = function Mappings(hires) {
	this.hires = hires;
	this.generatedCodeLine = 0;
	this.generatedCodeColumn = 0;
	this.raw = [];
	this.rawSegments = this.raw[this.generatedCodeLine] = [];
	this.pending = null;
};

Mappings.prototype.addEdit = function addEdit (sourceIndex, content, loc, nameIndex) {
	if (content.length) {
		var segment = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];
		if (nameIndex >= 0) {
			segment.push(nameIndex);
		}
		this.rawSegments.push(segment);
	} else if (this.pending) {
		this.rawSegments.push(this.pending);
	}

	this.advance(content);
	this.pending = null;
};

Mappings.prototype.addUneditedChunk = function addUneditedChunk (sourceIndex, chunk, original, loc, sourcemapLocations) {
	var originalCharIndex = chunk.start;
	var first = true;

	while (originalCharIndex < chunk.end) {
		if (this.hires || first || sourcemapLocations.has(originalCharIndex)) {
			this.rawSegments.push([this.generatedCodeColumn, sourceIndex, loc.line, loc.column]);
		}

		if (original[originalCharIndex] === '\n') {
			loc.line += 1;
			loc.column = 0;
			this.generatedCodeLine += 1;
			this.raw[this.generatedCodeLine] = this.rawSegments = [];
			this.generatedCodeColumn = 0;
			first = true;
		} else {
			loc.column += 1;
			this.generatedCodeColumn += 1;
			first = false;
		}

		originalCharIndex += 1;
	}

	this.pending = null;
};

Mappings.prototype.advance = function advance (str) {
	if (!str) { return; }

	var lines = str.split('\n');

	if (lines.length > 1) {
		for (var i = 0; i < lines.length - 1; i++) {
			this.generatedCodeLine++;
			this.raw[this.generatedCodeLine] = this.rawSegments = [];
		}
		this.generatedCodeColumn = 0;
	}

	this.generatedCodeColumn += lines[lines.length - 1].length;
};

var n = '\n';

var warned = {
	insertLeft: false,
	insertRight: false,
	storeName: false,
};

var MagicString = function MagicString(string, options) {
	if ( options === void 0 ) options = {};

	var chunk = new Chunk(0, string.length, string);

	Object.defineProperties(this, {
		original: { writable: true, value: string },
		outro: { writable: true, value: '' },
		intro: { writable: true, value: '' },
		firstChunk: { writable: true, value: chunk },
		lastChunk: { writable: true, value: chunk },
		lastSearchedChunk: { writable: true, value: chunk },
		byStart: { writable: true, value: {} },
		byEnd: { writable: true, value: {} },
		filename: { writable: true, value: options.filename },
		indentExclusionRanges: { writable: true, value: options.indentExclusionRanges },
		sourcemapLocations: { writable: true, value: new BitSet() },
		storedNames: { writable: true, value: {} },
		indentStr: { writable: true, value: guessIndent(string) },
	});

	this.byStart[0] = chunk;
	this.byEnd[string.length] = chunk;
};

MagicString.prototype.addSourcemapLocation = function addSourcemapLocation (char) {
	this.sourcemapLocations.add(char);
};

MagicString.prototype.append = function append (content) {
	if (typeof content !== 'string') { throw new TypeError('outro content must be a string'); }

	this.outro += content;
	return this;
};

MagicString.prototype.appendLeft = function appendLeft (index, content) {
	if (typeof content !== 'string') { throw new TypeError('inserted content must be a string'); }

	this._split(index);

	var chunk = this.byEnd[index];

	if (chunk) {
		chunk.appendLeft(content);
	} else {
		this.intro += content;
	}
	return this;
};

MagicString.prototype.appendRight = function appendRight (index, content) {
	if (typeof content !== 'string') { throw new TypeError('inserted content must be a string'); }

	this._split(index);

	var chunk = this.byStart[index];

	if (chunk) {
		chunk.appendRight(content);
	} else {
		this.outro += content;
	}
	return this;
};

MagicString.prototype.clone = function clone () {
	var cloned = new MagicString(this.original, { filename: this.filename });

	var originalChunk = this.firstChunk;
	var clonedChunk = (cloned.firstChunk = cloned.lastSearchedChunk = originalChunk.clone());

	while (originalChunk) {
		cloned.byStart[clonedChunk.start] = clonedChunk;
		cloned.byEnd[clonedChunk.end] = clonedChunk;

		var nextOriginalChunk = originalChunk.next;
		var nextClonedChunk = nextOriginalChunk && nextOriginalChunk.clone();

		if (nextClonedChunk) {
			clonedChunk.next = nextClonedChunk;
			nextClonedChunk.previous = clonedChunk;

			clonedChunk = nextClonedChunk;
		}

		originalChunk = nextOriginalChunk;
	}

	cloned.lastChunk = clonedChunk;

	if (this.indentExclusionRanges) {
		cloned.indentExclusionRanges = this.indentExclusionRanges.slice();
	}

	cloned.sourcemapLocations = new BitSet(this.sourcemapLocations);

	cloned.intro = this.intro;
	cloned.outro = this.outro;

	return cloned;
};

MagicString.prototype.generateDecodedMap = function generateDecodedMap (options) {
		var this$1$1 = this;

	options = options || {};

	var sourceIndex = 0;
	var names = Object.keys(this.storedNames);
	var mappings = new Mappings(options.hires);

	var locate = getLocator(this.original);

	if (this.intro) {
		mappings.advance(this.intro);
	}

	this.firstChunk.eachNext(function (chunk) {
		var loc = locate(chunk.start);

		if (chunk.intro.length) { mappings.advance(chunk.intro); }

		if (chunk.edited) {
			mappings.addEdit(
				sourceIndex,
				chunk.content,
				loc,
				chunk.storeName ? names.indexOf(chunk.original) : -1
			);
		} else {
			mappings.addUneditedChunk(sourceIndex, chunk, this$1$1.original, loc, this$1$1.sourcemapLocations);
		}

		if (chunk.outro.length) { mappings.advance(chunk.outro); }
	});

	return {
		file: options.file ? options.file.split(/[/\\]/).pop() : null,
		sources: [options.source ? getRelativePath(options.file || '', options.source) : null],
		sourcesContent: options.includeContent ? [this.original] : [null],
		names: names,
		mappings: mappings.raw,
	};
};

MagicString.prototype.generateMap = function generateMap (options) {
	return new SourceMap(this.generateDecodedMap(options));
};

MagicString.prototype.getIndentString = function getIndentString () {
	return this.indentStr === null ? '\t' : this.indentStr;
};

MagicString.prototype.indent = function indent (indentStr, options) {
	var pattern = /^[^\r\n]/gm;

	if (isObject(indentStr)) {
		options = indentStr;
		indentStr = undefined;
	}

	indentStr = indentStr !== undefined ? indentStr : this.indentStr || '\t';

	if (indentStr === '') { return this; } // noop

	options = options || {};

	// Process exclusion ranges
	var isExcluded = {};

	if (options.exclude) {
		var exclusions =
			typeof options.exclude[0] === 'number' ? [options.exclude] : options.exclude;
		exclusions.forEach(function (exclusion) {
			for (var i = exclusion[0]; i < exclusion[1]; i += 1) {
				isExcluded[i] = true;
			}
		});
	}

	var shouldIndentNextCharacter = options.indentStart !== false;
	var replacer = function (match) {
		if (shouldIndentNextCharacter) { return ("" + indentStr + match); }
		shouldIndentNextCharacter = true;
		return match;
	};

	this.intro = this.intro.replace(pattern, replacer);

	var charIndex = 0;
	var chunk = this.firstChunk;

	while (chunk) {
		var end = chunk.end;

		if (chunk.edited) {
			if (!isExcluded[charIndex]) {
				chunk.content = chunk.content.replace(pattern, replacer);

				if (chunk.content.length) {
					shouldIndentNextCharacter = chunk.content[chunk.content.length - 1] === '\n';
				}
			}
		} else {
			charIndex = chunk.start;

			while (charIndex < end) {
				if (!isExcluded[charIndex]) {
					var char = this.original[charIndex];

					if (char === '\n') {
						shouldIndentNextCharacter = true;
					} else if (char !== '\r' && shouldIndentNextCharacter) {
						shouldIndentNextCharacter = false;

						if (charIndex === chunk.start) {
							chunk.prependRight(indentStr);
						} else {
							this._splitChunk(chunk, charIndex);
							chunk = chunk.next;
							chunk.prependRight(indentStr);
						}
					}
				}

				charIndex += 1;
			}
		}

		charIndex = chunk.end;
		chunk = chunk.next;
	}

	this.outro = this.outro.replace(pattern, replacer);

	return this;
};

MagicString.prototype.insert = function insert () {
	throw new Error(
		'magicString.insert(...) is deprecated. Use prependRight(...) or appendLeft(...)'
	);
};

MagicString.prototype.insertLeft = function insertLeft (index, content) {
	if (!warned.insertLeft) {
		console.warn(
			'magicString.insertLeft(...) is deprecated. Use magicString.appendLeft(...) instead'
		); // eslint-disable-line no-console
		warned.insertLeft = true;
	}

	return this.appendLeft(index, content);
};

MagicString.prototype.insertRight = function insertRight (index, content) {
	if (!warned.insertRight) {
		console.warn(
			'magicString.insertRight(...) is deprecated. Use magicString.prependRight(...) instead'
		); // eslint-disable-line no-console
		warned.insertRight = true;
	}

	return this.prependRight(index, content);
};

MagicString.prototype.move = function move (start, end, index) {
	if (index >= start && index <= end) { throw new Error('Cannot move a selection inside itself'); }

	this._split(start);
	this._split(end);
	this._split(index);

	var first = this.byStart[start];
	var last = this.byEnd[end];

	var oldLeft = first.previous;
	var oldRight = last.next;

	var newRight = this.byStart[index];
	if (!newRight && last === this.lastChunk) { return this; }
	var newLeft = newRight ? newRight.previous : this.lastChunk;

	if (oldLeft) { oldLeft.next = oldRight; }
	if (oldRight) { oldRight.previous = oldLeft; }

	if (newLeft) { newLeft.next = first; }
	if (newRight) { newRight.previous = last; }

	if (!first.previous) { this.firstChunk = last.next; }
	if (!last.next) {
		this.lastChunk = first.previous;
		this.lastChunk.next = null;
	}

	first.previous = newLeft;
	last.next = newRight || null;

	if (!newLeft) { this.firstChunk = first; }
	if (!newRight) { this.lastChunk = last; }
	return this;
};

MagicString.prototype.overwrite = function overwrite (start, end, content, options) {
	if (typeof content !== 'string') { throw new TypeError('replacement content must be a string'); }

	while (start < 0) { start += this.original.length; }
	while (end < 0) { end += this.original.length; }

	if (end > this.original.length) { throw new Error('end is out of bounds'); }
	if (start === end)
		{ throw new Error(
			'Cannot overwrite a zero-length range – use appendLeft or prependRight instead'
		); }

	this._split(start);
	this._split(end);

	if (options === true) {
		if (!warned.storeName) {
			console.warn(
				'The final argument to magicString.overwrite(...) should be an options object. See https://github.com/rich-harris/magic-string'
			); // eslint-disable-line no-console
			warned.storeName = true;
		}

		options = { storeName: true };
	}
	var storeName = options !== undefined ? options.storeName : false;
	var contentOnly = options !== undefined ? options.contentOnly : false;

	if (storeName) {
		var original = this.original.slice(start, end);
		Object.defineProperty(this.storedNames, original, { writable: true, value: true, enumerable: true });
	}

	var first = this.byStart[start];
	var last = this.byEnd[end];

	if (first) {
		var chunk = first;
		while (chunk !== last) {
			if (chunk.next !== this.byStart[chunk.end]) {
				throw new Error('Cannot overwrite across a split point');
			}
			chunk = chunk.next;
			chunk.edit('', false);
		}

		first.edit(content, storeName, contentOnly);
	} else {
		// must be inserting at the end
		var newChunk = new Chunk(start, end, '').edit(content, storeName);

		// TODO last chunk in the array may not be the last chunk, if it's moved...
		last.next = newChunk;
		newChunk.previous = last;
	}
	return this;
};

MagicString.prototype.prepend = function prepend (content) {
	if (typeof content !== 'string') { throw new TypeError('outro content must be a string'); }

	this.intro = content + this.intro;
	return this;
};

MagicString.prototype.prependLeft = function prependLeft (index, content) {
	if (typeof content !== 'string') { throw new TypeError('inserted content must be a string'); }

	this._split(index);

	var chunk = this.byEnd[index];

	if (chunk) {
		chunk.prependLeft(content);
	} else {
		this.intro = content + this.intro;
	}
	return this;
};

MagicString.prototype.prependRight = function prependRight (index, content) {
	if (typeof content !== 'string') { throw new TypeError('inserted content must be a string'); }

	this._split(index);

	var chunk = this.byStart[index];

	if (chunk) {
		chunk.prependRight(content);
	} else {
		this.outro = content + this.outro;
	}
	return this;
};

MagicString.prototype.remove = function remove (start, end) {
	while (start < 0) { start += this.original.length; }
	while (end < 0) { end += this.original.length; }

	if (start === end) { return this; }

	if (start < 0 || end > this.original.length) { throw new Error('Character is out of bounds'); }
	if (start > end) { throw new Error('end must be greater than start'); }

	this._split(start);
	this._split(end);

	var chunk = this.byStart[start];

	while (chunk) {
		chunk.intro = '';
		chunk.outro = '';
		chunk.edit('');

		chunk = end > chunk.end ? this.byStart[chunk.end] : null;
	}
	return this;
};

MagicString.prototype.lastChar = function lastChar () {
	if (this.outro.length) { return this.outro[this.outro.length - 1]; }
	var chunk = this.lastChunk;
	do {
		if (chunk.outro.length) { return chunk.outro[chunk.outro.length - 1]; }
		if (chunk.content.length) { return chunk.content[chunk.content.length - 1]; }
		if (chunk.intro.length) { return chunk.intro[chunk.intro.length - 1]; }
	} while ((chunk = chunk.previous));
	if (this.intro.length) { return this.intro[this.intro.length - 1]; }
	return '';
};

MagicString.prototype.lastLine = function lastLine () {
	var lineIndex = this.outro.lastIndexOf(n);
	if (lineIndex !== -1) { return this.outro.substr(lineIndex + 1); }
	var lineStr = this.outro;
	var chunk = this.lastChunk;
	do {
		if (chunk.outro.length > 0) {
			lineIndex = chunk.outro.lastIndexOf(n);
			if (lineIndex !== -1) { return chunk.outro.substr(lineIndex + 1) + lineStr; }
			lineStr = chunk.outro + lineStr;
		}

		if (chunk.content.length > 0) {
			lineIndex = chunk.content.lastIndexOf(n);
			if (lineIndex !== -1) { return chunk.content.substr(lineIndex + 1) + lineStr; }
			lineStr = chunk.content + lineStr;
		}

		if (chunk.intro.length > 0) {
			lineIndex = chunk.intro.lastIndexOf(n);
			if (lineIndex !== -1) { return chunk.intro.substr(lineIndex + 1) + lineStr; }
			lineStr = chunk.intro + lineStr;
		}
	} while ((chunk = chunk.previous));
	lineIndex = this.intro.lastIndexOf(n);
	if (lineIndex !== -1) { return this.intro.substr(lineIndex + 1) + lineStr; }
	return this.intro + lineStr;
};

MagicString.prototype.slice = function slice (start, end) {
		if ( start === void 0 ) start = 0;
		if ( end === void 0 ) end = this.original.length;

	while (start < 0) { start += this.original.length; }
	while (end < 0) { end += this.original.length; }

	var result = '';

	// find start chunk
	var chunk = this.firstChunk;
	while (chunk && (chunk.start > start || chunk.end <= start)) {
		// found end chunk before start
		if (chunk.start < end && chunk.end >= end) {
			return result;
		}

		chunk = chunk.next;
	}

	if (chunk && chunk.edited && chunk.start !== start)
		{ throw new Error(("Cannot use replaced character " + start + " as slice start anchor.")); }

	var startChunk = chunk;
	while (chunk) {
		if (chunk.intro && (startChunk !== chunk || chunk.start === start)) {
			result += chunk.intro;
		}

		var containsEnd = chunk.start < end && chunk.end >= end;
		if (containsEnd && chunk.edited && chunk.end !== end)
			{ throw new Error(("Cannot use replaced character " + end + " as slice end anchor.")); }

		var sliceStart = startChunk === chunk ? start - chunk.start : 0;
		var sliceEnd = containsEnd ? chunk.content.length + end - chunk.end : chunk.content.length;

		result += chunk.content.slice(sliceStart, sliceEnd);

		if (chunk.outro && (!containsEnd || chunk.end === end)) {
			result += chunk.outro;
		}

		if (containsEnd) {
			break;
		}

		chunk = chunk.next;
	}

	return result;
};

// TODO deprecate this? not really very useful
MagicString.prototype.snip = function snip (start, end) {
	var clone = this.clone();
	clone.remove(0, start);
	clone.remove(end, clone.original.length);

	return clone;
};

MagicString.prototype._split = function _split (index) {
	if (this.byStart[index] || this.byEnd[index]) { return; }

	var chunk = this.lastSearchedChunk;
	var searchForward = index > chunk.end;

	while (chunk) {
		if (chunk.contains(index)) { return this._splitChunk(chunk, index); }

		chunk = searchForward ? this.byStart[chunk.end] : this.byEnd[chunk.start];
	}
};

MagicString.prototype._splitChunk = function _splitChunk (chunk, index) {
	if (chunk.edited && chunk.content.length) {
		// zero-length edited chunks are a special case (overlapping replacements)
		var loc = getLocator(this.original)(index);
		throw new Error(
			("Cannot split a chunk that has already been edited (" + (loc.line) + ":" + (loc.column) + " – \"" + (chunk.original) + "\")")
		);
	}

	var newChunk = chunk.split(index);

	this.byEnd[index] = chunk;
	this.byStart[index] = newChunk;
	this.byEnd[newChunk.end] = newChunk;

	if (chunk === this.lastChunk) { this.lastChunk = newChunk; }

	this.lastSearchedChunk = chunk;
	return true;
};

MagicString.prototype.toString = function toString () {
	var str = this.intro;

	var chunk = this.firstChunk;
	while (chunk) {
		str += chunk.toString();
		chunk = chunk.next;
	}

	return str + this.outro;
};

MagicString.prototype.isEmpty = function isEmpty () {
	var chunk = this.firstChunk;
	do {
		if (
			(chunk.intro.length && chunk.intro.trim()) ||
			(chunk.content.length && chunk.content.trim()) ||
			(chunk.outro.length && chunk.outro.trim())
		)
			{ return false; }
	} while ((chunk = chunk.next));
	return true;
};

MagicString.prototype.length = function length () {
	var chunk = this.firstChunk;
	var length = 0;
	do {
		length += chunk.intro.length + chunk.content.length + chunk.outro.length;
	} while ((chunk = chunk.next));
	return length;
};

MagicString.prototype.trimLines = function trimLines () {
	return this.trim('[\\r\\n]');
};

MagicString.prototype.trim = function trim (charType) {
	return this.trimStart(charType).trimEnd(charType);
};

MagicString.prototype.trimEndAborted = function trimEndAborted (charType) {
	var rx = new RegExp((charType || '\\s') + '+$');

	this.outro = this.outro.replace(rx, '');
	if (this.outro.length) { return true; }

	var chunk = this.lastChunk;

	do {
		var end = chunk.end;
		var aborted = chunk.trimEnd(rx);

		// if chunk was trimmed, we have a new lastChunk
		if (chunk.end !== end) {
			if (this.lastChunk === chunk) {
				this.lastChunk = chunk.next;
			}

			this.byEnd[chunk.end] = chunk;
			this.byStart[chunk.next.start] = chunk.next;
			this.byEnd[chunk.next.end] = chunk.next;
		}

		if (aborted) { return true; }
		chunk = chunk.previous;
	} while (chunk);

	return false;
};

MagicString.prototype.trimEnd = function trimEnd (charType) {
	this.trimEndAborted(charType);
	return this;
};
MagicString.prototype.trimStartAborted = function trimStartAborted (charType) {
	var rx = new RegExp('^' + (charType || '\\s') + '+');

	this.intro = this.intro.replace(rx, '');
	if (this.intro.length) { return true; }

	var chunk = this.firstChunk;

	do {
		var end = chunk.end;
		var aborted = chunk.trimStart(rx);

		if (chunk.end !== end) {
			// special case...
			if (chunk === this.lastChunk) { this.lastChunk = chunk.next; }

			this.byEnd[chunk.end] = chunk;
			this.byStart[chunk.next.start] = chunk.next;
			this.byEnd[chunk.next.end] = chunk.next;
		}

		if (aborted) { return true; }
		chunk = chunk.next;
	} while (chunk);

	return false;
};

MagicString.prototype.trimStart = function trimStart (charType) {
	this.trimStartAborted(charType);
	return this;
};

function parseAttributeValue(value) {
    return /^['"]/.test(value) ? value.slice(1, -1) : value;
}
function parseAttributes(str, start) {
    const attrs = [];
    str.split(/\s+/)
        .filter(Boolean)
        .forEach((attr) => {
        const attrStart = start + str.indexOf(attr);
        const [name, value] = attr.split('=');
        attrs[name] = value ? parseAttributeValue(value) : name;
        attrs.push({
            type: 'Attribute',
            name,
            value: !value || [
                {
                    type: 'Text',
                    start: attrStart + attr.indexOf('=') + 1,
                    end: attrStart + attr.length,
                    raw: parseAttributeValue(value)
                }
            ],
            start: attrStart,
            end: attrStart + attr.length
        });
    });
    return attrs;
}
function extractTag(htmlx, tag, useNewTransformation) {
    const exp = new RegExp(`(<!--[^]*?-->)|(<${tag}([\\S\\s]*?)>)([\\S\\s]*?)<\\/${tag}>`, 'g');
    const matches = [];
    let match = null;
    while ((match = exp.exec(htmlx)) != null) {
        if (match[0].startsWith('<!--')) {
            // Tag is inside comment
            continue;
        }
        let content = match[4];
        if (!content) {
            if (useNewTransformation) {
                // Keep tag and transform it like a regular element
                content = '';
            }
            else {
                // Self-closing/empty tags don't need replacement
                continue;
            }
        }
        const start = match.index + match[2].length;
        const end = start + content.length;
        const containerStart = match.index;
        const containerEnd = match.index + match[0].length;
        matches.push({
            start: containerStart,
            end: containerEnd,
            name: tag,
            type: tag === 'style' ? 'Style' : 'Script',
            attributes: parseAttributes(match[3], containerStart + `<${tag}`.length),
            content: {
                type: 'Text',
                start,
                end,
                value: content,
                raw: content
            }
        });
    }
    return matches;
}
function findVerbatimElements(htmlx, useNewTransformation) {
    return [
        ...extractTag(htmlx, 'script', useNewTransformation),
        ...extractTag(htmlx, 'style', useNewTransformation)
    ];
}
function blankVerbatimContent(htmlx, verbatimElements) {
    let output = htmlx;
    for (const node of verbatimElements) {
        const content = node.content;
        if (content) {
            output =
                output.substring(0, content.start) +
                    output
                        .substring(content.start, content.end)
                        // blank out the content
                        .replace(/[^\n]/g, ' ')
                        // excess blank space can make the svelte parser very slow (sec->min). break it up with comments (works in style/script)
                        .replace(/[^\n][^\n][^\n][^\n]\n/g, '/**/\n') +
                    output.substring(content.end);
        }
    }
    return output;
}
function parseHtmlx(htmlx, options) {
    //Svelte tries to parse style and script tags which doesn't play well with typescript, so we blank them out.
    //HTMLx spec says they should just be retained after processing as is, so this is fine
    const verbatimElements = findVerbatimElements(htmlx, options === null || options === void 0 ? void 0 : options.useNewTransformation);
    const deconstructed = blankVerbatimContent(htmlx, verbatimElements);
    //extract the html content parsed as htmlx this excludes our script and style tags
    const parsingCode = (options === null || options === void 0 ? void 0 : options.emitOnTemplateError)
        ? blankPossiblyErrorOperatorOrPropertyAccess(deconstructed)
        : deconstructed;
    const htmlxAst = compiler.parse(parsingCode).html;
    //restore our script and style tags as nodes to maintain validity with HTMLx
    for (const s of verbatimElements) {
        htmlxAst.children.push(s);
        htmlxAst.start = Math.min(htmlxAst.start, s.start);
        htmlxAst.end = Math.max(htmlxAst.end, s.end);
    }
    return { htmlxAst, tags: verbatimElements };
}
const possibleOperatorOrPropertyAccess = new Set([
    '.',
    '?',
    '*',
    '~',
    '=',
    '<',
    '!',
    '&',
    '^',
    '|',
    ',',
    '+',
    '-'
]);
function blankPossiblyErrorOperatorOrPropertyAccess(htmlx) {
    let index = htmlx.indexOf('}');
    let lastIndex = 0;
    const { length } = htmlx;
    while (index < length && index >= 0) {
        let backwardIndex = index - 1;
        while (backwardIndex > lastIndex) {
            const char = htmlx.charAt(backwardIndex);
            if (possibleOperatorOrPropertyAccess.has(char)) {
                const isPlusOrMinus = char === '+' || char === '-';
                const isIncrementOrDecrement = isPlusOrMinus && htmlx.charAt(backwardIndex - 1) === char;
                if (isIncrementOrDecrement) {
                    backwardIndex -= 2;
                    continue;
                }
                htmlx =
                    htmlx.substring(0, backwardIndex) + ' ' + htmlx.substring(backwardIndex + 1);
            }
            else if (!/\s/.test(char)) {
                break;
            }
            backwardIndex--;
        }
        lastIndex = index;
        index = htmlx.indexOf('}', index + 1);
    }
    return htmlx;
}

function isMember$1(parent, prop) {
    return parent.type == 'MemberExpression' && prop == 'property';
}
function isObjectKey(parent, prop) {
    return parent.type == 'Property' && prop == 'key';
}
function isObjectValue(parent, prop) {
    return parent.type == 'Property' && prop == 'value';
}
function isObjectValueShortHand(property) {
    const { value, key } = property;
    return value && isIdentifier(value) && key.start === value.start && key.end == value.end;
}
function attributeValueIsString(attr) {
    var _a;
    return attr.value.length !== 1 || ((_a = attr.value[0]) === null || _a === void 0 ? void 0 : _a.type) === 'Text';
}
function isDestructuringPatterns(node) {
    return node.type === 'ArrayPattern' || node.type === 'ObjectPattern';
}
function isIdentifier(node) {
    return node.type === 'Identifier';
}
function getSlotName(child) {
    var _a, _b;
    const slot = (_a = child.attributes) === null || _a === void 0 ? void 0 : _a.find((a) => a.name == 'slot');
    return (_b = slot === null || slot === void 0 ? void 0 : slot.value) === null || _b === void 0 ? void 0 : _b[0].raw;
}

// @ts-check
/** @typedef { import('estree').BaseNode} BaseNode */

/** @typedef {{
	skip: () => void;
	remove: () => void;
	replace: (node: BaseNode) => void;
}} WalkerContext */

class WalkerBase {
	constructor() {
		/** @type {boolean} */
		this.should_skip = false;

		/** @type {boolean} */
		this.should_remove = false;

		/** @type {BaseNode | null} */
		this.replacement = null;

		/** @type {WalkerContext} */
		this.context = {
			skip: () => (this.should_skip = true),
			remove: () => (this.should_remove = true),
			replace: (node) => (this.replacement = node)
		};
	}

	/**
	 *
	 * @param {any} parent
	 * @param {string} prop
	 * @param {number} index
	 * @param {BaseNode} node
	 */
	replace(parent, prop, index, node) {
		if (parent) {
			if (index !== null) {
				parent[prop][index] = node;
			} else {
				parent[prop] = node;
			}
		}
	}

	/**
	 *
	 * @param {any} parent
	 * @param {string} prop
	 * @param {number} index
	 */
	remove(parent, prop, index) {
		if (parent) {
			if (index !== null) {
				parent[prop].splice(index, 1);
			} else {
				delete parent[prop];
			}
		}
	}
}

// @ts-check

/** @typedef { import('estree').BaseNode} BaseNode */
/** @typedef { import('./walker.js').WalkerContext} WalkerContext */

/** @typedef {(
 *    this: WalkerContext,
 *    node: BaseNode,
 *    parent: BaseNode,
 *    key: string,
 *    index: number
 * ) => void} SyncHandler */

class SyncWalker extends WalkerBase {
	/**
	 *
	 * @param {SyncHandler} enter
	 * @param {SyncHandler} leave
	 */
	constructor(enter, leave) {
		super();

		/** @type {SyncHandler} */
		this.enter = enter;

		/** @type {SyncHandler} */
		this.leave = leave;
	}

	/**
	 *
	 * @param {BaseNode} node
	 * @param {BaseNode} parent
	 * @param {string} [prop]
	 * @param {number} [index]
	 * @returns {BaseNode}
	 */
	visit(node, parent, prop, index) {
		if (node) {
			if (this.enter) {
				const _should_skip = this.should_skip;
				const _should_remove = this.should_remove;
				const _replacement = this.replacement;
				this.should_skip = false;
				this.should_remove = false;
				this.replacement = null;

				this.enter.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const skipped = this.should_skip;
				const removed = this.should_remove;

				this.should_skip = _should_skip;
				this.should_remove = _should_remove;
				this.replacement = _replacement;

				if (skipped) return node;
				if (removed) return null;
			}

			for (const key in node) {
				const value = node[key];

				if (typeof value !== "object") {
					continue;
				} else if (Array.isArray(value)) {
					for (let i = 0; i < value.length; i += 1) {
						if (value[i] !== null && typeof value[i].type === 'string') {
							if (!this.visit(value[i], node, key, i)) {
								// removed
								i--;
							}
						}
					}
				} else if (value !== null && typeof value.type === "string") {
					this.visit(value, node, key, null);
				}
			}

			if (this.leave) {
				const _replacement = this.replacement;
				const _should_remove = this.should_remove;
				this.replacement = null;
				this.should_remove = false;

				this.leave.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const removed = this.should_remove;

				this.replacement = _replacement;
				this.should_remove = _should_remove;

				if (removed) return null;
			}
		}

		return node;
	}
}

// @ts-check

/** @typedef { import('estree').BaseNode} BaseNode */
/** @typedef { import('./sync.js').SyncHandler} SyncHandler */
/** @typedef { import('./async.js').AsyncHandler} AsyncHandler */

/**
 *
 * @param {BaseNode} ast
 * @param {{
 *   enter?: SyncHandler
 *   leave?: SyncHandler
 * }} walker
 * @returns {BaseNode}
 */
function walk(ast, { enter, leave }) {
	const instance = new SyncWalker(enter, leave);
	return instance.visit(ast, null);
}

const IGNORE_START_COMMENT = '/*Ωignore_startΩ*/';
const IGNORE_END_COMMENT = '/*Ωignore_endΩ*/';
/**
 * Surrounds given string with a start/end comment which marks it
 * to be ignored by tooling.
 */
function surroundWithIgnoreComments(str) {
    return IGNORE_START_COMMENT + str + IGNORE_END_COMMENT;
}

/**
 * Get the constructor type of a component node
 * @param node The component node to infer the this type from
 * @param thisValue If node is svelte:component, you may pass the value
 *                  of this={..} to use that instead of the more general componentType
 */
function getTypeForComponent(node) {
    if (node.name === 'svelte:component' || node.name === 'svelte:self') {
        return '__sveltets_1_componentType()';
    }
    else {
        return node.name;
    }
}
/**
 * Get the instance type of a node from its constructor.
 */
function getInstanceTypeSimple(node, str) {
    const instanceOf = (str) => `__sveltets_1_instanceOf(${str})`;
    switch (node.type) {
        case 'InlineComponent':
            if (node.name === 'svelte:component' && node.expression) {
                const thisVal = str.original.substring(node.expression.start, node.expression.end);
                return `new (${thisVal})({target: __sveltets_1_any(''), props: __sveltets_1_any('')})`;
            }
            else if (node.name === 'svelte:component' || node.name === 'svelte:self') {
                return instanceOf('__sveltets_1_componentType()');
            }
            else {
                return `new ${node.name}({target: __sveltets_1_any(''), props: __sveltets_1_any('')})`;
            }
        case 'Element':
            return instanceOf(`__sveltets_1_ctorOf(__sveltets_1_mapElementTag('${node.name}'))`);
        case 'Body':
            return instanceOf('HTMLBodyElement');
        case 'Slot': // Web Components only
            return instanceOf('HTMLSlotElement');
    }
}
/**
 * Get the instance type of a node from its constructor.
 * If it's a component, pass in the exact props. This ensures that
 * the component instance has the right type in case of generic prop types.
 */
function getInstanceType(node, originalStr, replacedPropValues = []) {
    if (node.name === 'svelte:component' || node.name === 'svelte:self') {
        return '__sveltets_1_instanceOf(__sveltets_1_componentType())';
    }
    const propsStr = getNameValuePairsFromAttributes(node, originalStr)
        .map(({ name, value }) => {
        var _a;
        const replacedPropValue = (_a = replacedPropValues.find(({ name: propName }) => propName === name)) === null || _a === void 0 ? void 0 : _a.replacement;
        return `'${name}':${replacedPropValue || value}`;
    })
        .join(', ');
    return surroundWithIgnoreComments(`new ${node.name}({target: __sveltets_1_any(''), props: {${propsStr}}})`);
}
/**
 * Return a string which makes it possible for TypeScript to infer the instance type of the given component.
 * In the case of another component, this is done by creating a `new Comp({.. props: {..}})` code string.
 * Alongside with the result a list of shadowed props is returned. A shadowed prop is a prop
 * whose value is either too complex to analyse or contains an identifier which has the same name
 * as a `let:X` expression on the component. In that case, the returned string only contains a reference
 * to a constant which is `replacedPropsPrefix + propName`, so the calling code needs to make sure
 * to create such a `const`.
 */
function getInstanceTypeForDefaultSlot(node, originalStr, replacedPropsPrefix) {
    if (node.name === 'svelte:component' || node.name === 'svelte:self') {
        return {
            str: '__sveltets_1_instanceOf(__sveltets_1_componentType())',
            shadowedProps: []
        };
    }
    const lets = new Set((node.attributes || []).filter((attr) => attr.type === 'Let').map((attr) => attr.name));
    const shadowedProps = [];
    // Go through attribute values and mark those for reassignment to a const that
    // either definitely shadow a let: or where it cannot be determined because the value is too complex.
    const propsStr = getNameValuePairsFromAttributes(node, originalStr)
        .map(({ name, value, identifier, complexExpression }) => {
        if (complexExpression || lets.has(identifier)) {
            const replacement = replacedPropsPrefix + sanitizePropName$1(name);
            shadowedProps.push({ name, value, replacement });
            return `'${name}':${replacement}`;
        }
        else {
            return `'${name}':${value}`;
        }
    })
        .join(', ');
    const str = surroundWithIgnoreComments(`new ${node.name}({target: __sveltets_1_any(''), props: {${propsStr}}})`);
    return { str, shadowedProps };
}
function getNameValuePairsFromAttributes(node, originalStr) {
    return (node.attributes || [])
        .filter((attr) => attr.type === 'Attribute' && !attr.name.startsWith('--'))
        .map((attr) => {
        const name = attr.name;
        if (attr.value === true) {
            return { name, value: 'true' };
        }
        if (attr.value.length === 1) {
            const val = attr.value[0];
            if (val.type === 'AttributeShorthand') {
                return { name, value: name, identifier: name };
            }
            if (val.type === 'Text') {
                const quote = ['"', "'"].includes(originalStr[val.start - 1])
                    ? originalStr[val.start - 1]
                    : "'";
                return { name, value: `${quote}${val.data || val.raw}${quote}` };
            }
            if (val.type === 'MustacheTag') {
                const valueStr = originalStr.substring(val.start + 1, val.end - 1);
                if (val.expression.type === 'Identifier') {
                    return { name, value: valueStr, identifier: valueStr };
                }
                if (val.expression.type === 'Literal') {
                    const value = typeof val.expression.value === 'string'
                        ? val.expression.raw
                        : val.expression.value;
                    return { name, value };
                }
                return { name, value: valueStr, complexExpression: true };
            }
        }
        if (!attr.value.length) {
            return { name, value: '""' };
        }
        const value = attr.value
            .map((val) => val.type === 'Text'
            ? val.raw
            : val.type === 'MustacheTag'
                ? '$' + originalStr.substring(val.start, val.end)
                : '')
            .join('');
        return { name, value: `\`${value}\`` };
    });
}
function sanitizePropName$1(name) {
    return name
        .split('')
        .map((char) => (/[0-9A-Za-z$_]/.test(char) ? char : '_'))
        .join('');
}
function beforeStart(start) {
    return start - 1;
}
function isShortHandAttribute(attr) {
    return attr.expression.end === attr.end;
}
function isQuote(str) {
    return str === '"' || str === "'";
}
function getIdentifiersInIfExpression(expression) {
    const offset = expression.start;
    const identifiers = new Map();
    walk(expression, {
        enter: (node, parent) => {
            switch (node.type) {
                case 'Identifier':
                    // parent.property === node => node is "prop" in "obj.prop"
                    // parent.callee === node => node is "fun" in "fun(..)"
                    if ((parent === null || parent === void 0 ? void 0 : parent.property) !== node && (parent === null || parent === void 0 ? void 0 : parent.callee) !== node) {
                        add(node);
                    }
                    break;
            }
        }
    });
    function add(node) {
        let entry = identifiers.get(node.name);
        if (!entry) {
            entry = [];
        }
        entry.push({ start: node.start - offset, end: node.end - offset });
        identifiers.set(node.name, entry);
    }
    return identifiers;
}
function usesLet(node) {
    var _a;
    return (_a = node.attributes) === null || _a === void 0 ? void 0 : _a.some((attr) => attr.type === 'Let');
}
function buildTemplateString(attr, str, htmlx, leadingOverride, trailingOverride, overrideStart) {
    overrideStart = overrideStart !== null && overrideStart !== void 0 ? overrideStart : htmlx.lastIndexOf('=', attr.value[0].start);
    str.overwrite(overrideStart, attr.value[0].start, leadingOverride);
    for (const n of attr.value) {
        if (n.type == 'MustacheTag') {
            str.appendRight(n.start, '$');
        }
    }
    if (isQuote(htmlx[attr.end - 1])) {
        str.overwrite(attr.end - 1, attr.end, trailingOverride);
    }
    else {
        str.appendLeft(attr.end, trailingOverride);
    }
}
/**
 * Check if there's a member access trailing behind given expression and if yes,
 * bump the position to include it.
 * Usually it's there because of the preprocessing we do before we let Svelte parse the template.
 */
function withTrailingPropertyAccess$1(originalText, position) {
    let index = position;
    while (index < originalText.length) {
        const char = originalText[index];
        if (!char.trim()) {
            index++;
            continue;
        }
        if (char === '.') {
            return index + 1;
        }
        if (char === '?' && originalText[index + 1] === '.') {
            return index + 2;
        }
        break;
    }
    return position;
}

/**
 * use:xxx={params}   --->    {...__sveltets_1_ensureAction(xxx(__sveltets_1_mapElementTag('ParentNodeName'),(params)))}
 */
function handleActionDirective$1(htmlx, str, attr, parent) {
    str.overwrite(attr.start, attr.start + 'use:'.length, '{...__sveltets_1_ensureAction(');
    const name = parent.name === 'svelte:body' ? 'body' : parent.name;
    if (!attr.expression) {
        str.appendLeft(attr.end, `(__sveltets_1_mapElementTag('${name}')))}`);
        return;
    }
    str.overwrite(attr.start + `use:${attr.name}`.length, attr.expression.start, `(__sveltets_1_mapElementTag('${name}'),(`);
    str.appendLeft(withTrailingPropertyAccess$1(str.original, attr.expression.end), ')))');
    const lastChar = htmlx[attr.end - 1];
    if (isQuote(lastChar)) {
        str.remove(attr.end - 1, attr.end);
    }
}

/**
 * animate:xxx(yyy)   --->   {...__sveltets_1_ensureAnimation(xxx(__sveltets_1_mapElementTag('..'),__sveltets_1_AnimationMove,(yyy)))}
 */
function handleAnimateDirective$1(htmlx, str, attr, parent) {
    str.overwrite(attr.start, htmlx.indexOf(':', attr.start) + 1, '{...__sveltets_1_ensureAnimation(');
    const nodeType = `__sveltets_1_mapElementTag('${parent.name}')`;
    if (!attr.expression) {
        str.appendLeft(attr.end, `(${nodeType},__sveltets_1_AnimationMove,{}))}`);
        return;
    }
    str.overwrite(htmlx.indexOf(':', attr.start) + 1 + `${attr.name}`.length, attr.expression.start, `(${nodeType},__sveltets_1_AnimationMove,(`);
    str.appendLeft(withTrailingPropertyAccess$1(str.original, attr.expression.end), ')))');
    if (isQuote(htmlx[attr.end - 1])) {
        str.remove(attr.end - 1, attr.end);
    }
}

var svgAttributes$1 = 'accent-height accumulate additive alignment-baseline allowReorder alphabetic amplitude arabic-form ascent attributeName attributeType autoReverse azimuth baseFrequency baseline-shift baseProfile bbox begin bias by calcMode cap-height class clip clipPathUnits clip-path clip-rule color color-interpolation color-interpolation-filters color-profile color-rendering contentScriptType contentStyleType cursor cx cy d decelerate descent diffuseConstant direction display divisor dominant-baseline dur dx dy edgeMode elevation enable-background end exponent externalResourcesRequired fill fill-opacity fill-rule filter filterRes filterUnits flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight format from fr fx fy g1 g2 glyph-name glyph-orientation-horizontal glyph-orientation-vertical glyphRef gradientTransform gradientUnits hanging height href horiz-adv-x horiz-origin-x id ideographic image-rendering in in2 intercept k k1 k2 k3 k4 kernelMatrix kernelUnitLength kerning keyPoints keySplines keyTimes lang lengthAdjust letter-spacing lighting-color limitingConeAngle local marker-end marker-mid marker-start markerHeight markerUnits markerWidth mask maskContentUnits maskUnits mathematical max media method min mode name numOctaves offset onabort onactivate onbegin onclick onend onerror onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup onrepeat onresize onscroll onunload opacity operator order orient orientation origin overflow overline-position overline-thickness panose-1 paint-order pathLength patternContentUnits patternTransform patternUnits pointer-events points pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits r radius refX refY rendering-intent repeatCount repeatDur requiredExtensions requiredFeatures restart result rotate rx ry scale seed shape-rendering slope spacing specularConstant specularExponent speed spreadMethod startOffset stdDeviation stemh stemv stitchTiles stop-color stop-opacity strikethrough-position strikethrough-thickness string stroke stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width style surfaceScale systemLanguage tabindex tableValues target targetX targetY text-anchor text-decoration text-rendering textLength to transform type u1 u2 underline-position underline-thickness unicode unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical values version vert-adv-y vert-origin-x vert-origin-y viewBox viewTarget visibility width widths word-spacing writing-mode x x-height x1 x2 xChannelSelector xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space y y1 y2 yChannelSelector z zoomAndPan'.split(' ');

/**
 * List taken from `svelte-jsx.d.ts` by searching for all attributes of type number
 */
const numberOnlyAttributes$1 = new Set([
    'cols',
    'colspan',
    'currenttime',
    'defaultplaybackrate',
    'high',
    'low',
    'marginheight',
    'marginwidth',
    'minlength',
    'maxlength',
    'optimum',
    'rows',
    'rowspan',
    'size',
    'span',
    'start',
    'tabindex',
    'results',
    'volume'
]);
/**
 * Handle various kinds of attributes and make them conform to JSX.
 * - {x}   --->    x={x}
 * - x="{..}"   --->    x={..}
 * - lowercase DOM attributes
 * - multi-value handling
 */
function handleAttribute$1(htmlx, str, attr, parent, preserveCase) {
    var _a, _b, _c;
    const shouldApplySlotCheck = parent.type === 'Slot' && attr.name !== 'name';
    const slotName = shouldApplySlotCheck
        ? ((_c = (_b = (_a = parent.attributes) === null || _a === void 0 ? void 0 : _a.find((a) => a.name === 'name')) === null || _b === void 0 ? void 0 : _b.value[0]) === null || _c === void 0 ? void 0 : _c.data) || 'default'
        : undefined;
    const ensureSlotStr = `__sveltets_ensureSlot("${slotName}","${attr.name}",`;
    let transformedFromDirectiveOrNamespace = false;
    const transformAttributeCase = (name) => {
        if (!preserveCase && !svgAttributes$1.find((x) => x == name)) {
            return name.toLowerCase();
        }
        else {
            return name;
        }
    };
    //if we are on an "element" we are case insensitive, lowercase to match our JSX
    if (parent.type == 'Element') {
        const sapperLinkActions = ['sapper:prefetch', 'sapper:noscroll'];
        const sveltekitLinkActions = [
            'data-sveltekit-preload-code',
            'data-sveltekit-preload-data',
            'data-sveltekit-noscroll',
            'data-sveltekit-reload'
        ];
        // skip Attribute shorthand, that is handled below
        if ((attr.value !== true &&
            !(attr.value.length &&
                attr.value.length == 1 &&
                attr.value[0].type == 'AttributeShorthand')) ||
            sapperLinkActions.includes(attr.name) ||
            sveltekitLinkActions.includes(attr.name)) {
            let name = transformAttributeCase(attr.name);
            //strip ":" from out attribute name and uppercase the next letter to convert to jsx attribute
            const colonIndex = name.indexOf(':');
            if (colonIndex >= 0) {
                const parts = name.split(':');
                name = parts[0] + parts[1][0].toUpperCase() + parts[1].substring(1);
            }
            str.overwrite(attr.start, attr.start + attr.name.length, name);
            transformedFromDirectiveOrNamespace = true;
        }
    }
    // Custom CSS property
    if (parent.type === 'InlineComponent' && attr.name.startsWith('--') && attr.value !== true) {
        str.prependRight(attr.start, '{...__sveltets_1_cssProp({"');
        buildTemplateString(attr, str, htmlx, '": `', '`})}');
        return;
    }
    //we are a bare attribute
    if (attr.value === true) {
        if (parent.type === 'Element' &&
            !transformedFromDirectiveOrNamespace &&
            parent.name !== '!DOCTYPE') {
            str.overwrite(attr.start, attr.end, transformAttributeCase(attr.name));
        }
        return;
    }
    if (attr.value.length == 0) {
        return; //wut?
    }
    //handle single value
    if (attr.value.length == 1) {
        const attrVal = attr.value[0];
        if (attr.name == 'slot') {
            str.remove(attr.start, attr.end);
            return;
        }
        if (attrVal.type == 'AttributeShorthand') {
            let attrName = attrVal.expression.name;
            if (parent.type == 'Element') {
                attrName = transformAttributeCase(attrName);
            }
            str.appendRight(attr.start, `${attrName}=`);
            if (shouldApplySlotCheck) {
                str.prependRight(attr.start + 1, ensureSlotStr);
                str.prependLeft(attr.end - 1, ')');
            }
            return;
        }
        const equals = htmlx.lastIndexOf('=', attrVal.start);
        const sanitizedName = sanitizeLeadingChars(attr.name);
        if (sanitizedName !== attr.name) {
            str.overwrite(attr.start, equals, sanitizedName);
        }
        if (attrVal.type == 'Text') {
            const endsWithQuote = htmlx.lastIndexOf('"', attrVal.end) === attrVal.end - 1 ||
                htmlx.lastIndexOf("'", attrVal.end) === attrVal.end - 1;
            const needsQuotes = attrVal.end == attr.end && !endsWithQuote;
            const hasBrackets = htmlx.lastIndexOf('}', attrVal.end) === attrVal.end - 1 ||
                htmlx.lastIndexOf('}"', attrVal.end) === attrVal.end - 1 ||
                htmlx.lastIndexOf("}'", attrVal.end) === attrVal.end - 1;
            const needsNumberConversion = !hasBrackets &&
                parent.type === 'Element' &&
                numberOnlyAttributes$1.has(attr.name.toLowerCase()) &&
                !isNaN(attrVal.data);
            if (needsNumberConversion) {
                const begin = '{' + (shouldApplySlotCheck ? ensureSlotStr : '');
                const end = shouldApplySlotCheck ? ')}' : '}';
                if (needsQuotes) {
                    str.prependRight(equals + 1, begin);
                    str.appendLeft(attr.end, end);
                }
                else {
                    str.overwrite(equals + 1, equals + 2, begin);
                    str.overwrite(attr.end - 1, attr.end, end);
                }
            }
            else if (needsQuotes) {
                const begin = shouldApplySlotCheck ? `{${ensureSlotStr}"` : '"';
                const end = shouldApplySlotCheck ? '")}' : '"';
                str.prependRight(equals + 1, begin);
                str.appendLeft(attr.end, end);
            }
            else if (shouldApplySlotCheck) {
                str.prependRight(equals + 1, `{${ensureSlotStr}`);
                str.appendLeft(attr.end, ')}');
            }
            return;
        }
        if (attrVal.type == 'MustacheTag') {
            const isInQuotes = attrVal.end != attr.end;
            //if the end doesn't line up, we are wrapped in quotes
            if (isInQuotes) {
                str.remove(attrVal.start - 1, attrVal.start);
                str.remove(attr.end - 1, attr.end);
            }
            if (shouldApplySlotCheck) {
                str.prependRight(attrVal.start + 1, ensureSlotStr);
                str.appendLeft(attr.end - (isInQuotes ? 2 : 1), ')');
            }
            return;
        }
        return;
    }
    // We have multiple attribute values, so we build a template string out of them.
    buildTemplateString(attr, str, htmlx, shouldApplySlotCheck ? `={${ensureSlotStr}\`` : '={`', shouldApplySlotCheck ? '`)}' : '`}');
}
function sanitizeLeadingChars(attrName) {
    let sanitizedName = '';
    for (let i = 0; i < attrName.length; i++) {
        if (/[A-Za-z$_]/.test(attrName[i])) {
            sanitizedName += attrName.substr(i);
            return sanitizedName;
        }
        else {
            sanitizedName += '_';
        }
    }
    return sanitizedName;
}

function extractConstTags(children) {
    const tags = [];
    for (const child of children) {
        if (child.type === 'ConstTag') {
            const constTag = child;
            tags.push((insertionPoint, str) => {
                str.appendRight(constTag.expression.left.start, 'const ');
                const expressionEnd = withTrailingPropertyAccess$1(str.original, constTag.expression.right.end);
                str.move(constTag.expression.left.start, expressionEnd, insertionPoint);
                str.appendLeft(expressionEnd, ';');
                str.overwrite(constTag.start + 1, constTag.expression.left.start - 1, '', {
                    contentOnly: true
                });
            });
        }
    }
    return tags;
}

/**
 * Transform {#await ...} into something JSX understands
 */
function handleAwait$1(htmlx, str, awaitBlock, ifScope, templateScopeManager) {
    // {#await somePromise then value} ->
    // {() => {let _$$p = (somePromise);
    let ifCondition = ifScope.getFullCondition();
    ifCondition = ifCondition ? surroundWithIgnoreComments(`if(${ifCondition}) {`) : '';
    templateScopeManager.awaitEnter(awaitBlock);
    const constRedeclares = ifScope.getConstDeclaration();
    str.overwrite(awaitBlock.start, awaitBlock.expression.start, `{() => {${constRedeclares}${ifCondition}let _$$p = (`);
    // {/await} ->
    // <>})}
    const awaitEndStart = htmlx.lastIndexOf('{', awaitBlock.end - 1);
    str.overwrite(awaitEndStart, awaitBlock.end, '</>})}}' + (ifCondition ? '}' : ''));
}
function handleAwaitPending(awaitBlock, htmlx, str, ifScope) {
    if (awaitBlock.pending.skip) {
        return;
    }
    // {await aPromise} ...  ->  aPromise); (possibleIfCondition &&)<> ... </>
    const pendingStart = htmlx.indexOf('}', awaitBlock.expression.end);
    const pendingEnd = !awaitBlock.then.skip
        ? awaitBlock.then.start
        : !awaitBlock.catch.skip
            ? awaitBlock.catch.start
            : htmlx.lastIndexOf('{', awaitBlock.end);
    str.overwrite(withTrailingPropertyAccess$1(str.original, awaitBlock.expression.end), pendingStart + 1, ');');
    str.appendRight(pendingStart + 1, ` ${ifScope.addPossibleIfCondition()}<>`);
    str.appendLeft(pendingEnd, '</>; ');
    if (!awaitBlock.then.skip) {
        return;
    }
    // no need to prepend ifcondition here as we know the then block is empty
    str.appendLeft(pendingEnd, '__sveltets_1_awaitThen(_$$p, () => {<>');
}
function handleAwaitThen(awaitBlock, htmlx, str, ifScope) {
    if (awaitBlock.then.skip) {
        return;
    }
    // then value } | then} | {:then value} | {await ..} .. {/await} ->
    // __sveltets_1_awaitThen(_$$p, (value) => {(possibleIfCondition && )<>
    let thenStart;
    let thenEnd;
    // then value } | {:then value}
    if (!awaitBlock.pending.skip) {
        // {await ...} ... {:then ...}
        // thenBlock includes the {:then}
        thenStart = awaitBlock.then.start;
        if (awaitBlock.value) {
            thenEnd = htmlx.indexOf('}', awaitBlock.value.end) + 1;
        }
        else {
            thenEnd = htmlx.indexOf('}', awaitBlock.then.start) + 1;
        }
    }
    else {
        // {await ... then ...}
        thenStart = htmlx.indexOf('then', awaitBlock.expression.end);
        thenEnd = htmlx.lastIndexOf('}', awaitBlock.then.start) + 1;
        // somePromise then -> somePromise); then
        str.overwrite(awaitBlock.expression.end, thenStart, '); ');
    }
    if (awaitBlock.value) {
        str.overwrite(thenStart, awaitBlock.value.start, '__sveltets_1_awaitThen(_$$p, (');
        str.overwrite(awaitBlock.value.end, thenEnd, ') => {');
        extractConstTags(awaitBlock.then.children).forEach((insertion) => {
            insertion(thenEnd, str);
        });
        str.appendRight(thenEnd, `${ifScope.addPossibleIfCondition()}<>`);
    }
    else {
        const awaitThenFn = '__sveltets_1_awaitThen(_$$p, () => {';
        if (thenStart === thenEnd) {
            str.appendLeft(thenStart, awaitThenFn);
        }
        else {
            str.overwrite(thenStart, thenEnd, awaitThenFn);
        }
        extractConstTags(awaitBlock.then.children).forEach((insertion) => {
            insertion(thenEnd, str);
        });
        str.appendRight(thenEnd, `${ifScope.addPossibleIfCondition()}<>`); // eslint-disable-line
    }
}
function handleAwaitCatch(awaitBlock, htmlx, str, ifScope) {
    if (awaitBlock.catch.skip) {
        return;
    }
    if (awaitBlock.pending.skip && awaitBlock.then.skip) {
        if (awaitBlock.error) {
            // {#await ... catch ...}
            const catchBegin = htmlx.indexOf('}', awaitBlock.error.end) + 1;
            str.overwrite(awaitBlock.expression.end, awaitBlock.error.start, '); __sveltets_1_awaitThen(_$$p, () => {}, (');
            str.overwrite(awaitBlock.error.end, catchBegin, ') => {');
            extractConstTags(awaitBlock.catch.children).forEach((insertion) => {
                insertion(catchBegin, str);
            });
            str.appendRight(catchBegin, '<>');
        }
        else {
            // {#await ... catch}
            const catchBegin = htmlx.indexOf('}', awaitBlock.expression.end) + 1;
            str.overwrite(awaitBlock.expression.end, catchBegin, '); __sveltets_1_awaitThen(_$$p, () => {}, () => {');
            extractConstTags(awaitBlock.catch.children).forEach((insertion) => {
                insertion(catchBegin, str);
            });
            str.appendRight(catchBegin, '<>');
        }
    }
    else {
        //{:catch error} ->
        //</>}, (error) => {<>
        //catch block includes the {:catch}
        const catchStart = awaitBlock.catch.start;
        const catchSymbolEnd = htmlx.indexOf(':catch', catchStart) + ':catch'.length;
        const errorStart = awaitBlock.error ? awaitBlock.error.start : catchSymbolEnd;
        const errorEnd = awaitBlock.error ? awaitBlock.error.end : errorStart;
        const catchEnd = htmlx.indexOf('}', errorEnd) + 1;
        str.overwrite(catchStart, errorStart, '</>}, (');
        str.overwrite(errorEnd, catchEnd, ') => {');
        extractConstTags(awaitBlock.catch.children).forEach((insertion) => {
            insertion(catchEnd, str);
        });
        str.appendRight(catchEnd, `${ifScope.addPossibleIfCondition()}<>`);
    }
}

const oneWayBindingAttributes$1 = new Map(['clientWidth', 'clientHeight', 'offsetWidth', 'offsetHeight']
    .map((e) => [e, 'HTMLDivElement'])
    .concat(['duration', 'buffered', 'seekable', 'seeking', 'played', 'ended'].map((e) => [
    e,
    'HTMLMediaElement'
])));
/**
 * List of all binding names that are transformed to sth like `binding = variable`.
 * This applies to readonly bindings and the this binding.
 */
new Set([...oneWayBindingAttributes$1.keys(), 'this']);
/**
 * Transform bind:xxx into something that conforms to JSX
 */
function handleBinding$1(htmlx, str, attr, el) {
    //bind group on input
    if (attr.name == 'group' && el.name == 'input') {
        str.remove(attr.start, attr.expression.start);
        str.appendLeft(attr.expression.start, '{...__sveltets_1_empty(');
        const endBrackets = ')}';
        if (isShortHandAttribute(attr)) {
            str.prependRight(attr.end, endBrackets);
        }
        else {
            str.overwrite(withTrailingPropertyAccess$1(str.original, attr.expression.end), attr.end, endBrackets);
        }
        return;
    }
    const supportsBindThis = [
        'InlineComponent',
        'Element',
        'Body',
        'Slot' // only valid for Web Components compile target
    ];
    //bind this
    if (attr.name === 'this' && supportsBindThis.includes(el.type)) {
        // bind:this is effectively only works bottom up - the variable is updated by the element, not
        // the other way round. So we check if the instance is assignable to the variable.
        // Some notes:
        // - If the component unmounts (it's inside an if block, or svelte:component this={null},
        //   the value becomes null, but we don't add it to the clause because it would introduce
        //   worse DX for the 99% use case, and because null !== undefined which others might use to type the declaration.
        // - This doesn't do a 100% correct job of infering the instance type in case someone used generics for input props.
        //   For now it errs on the side of "no false positives" at the cost of maybe some missed type bugs
        const thisType = getInstanceTypeSimple(el, str);
        if (thisType) {
            str.overwrite(attr.start, attr.expression.start, '{...__sveltets_1_empty(');
            const instanceOfThisAssignment = ' = ' + surroundWithIgnoreComments(thisType) + ')}';
            str.overwrite(attr.expression.end, attr.end, instanceOfThisAssignment);
            return;
        }
    }
    //one way binding
    if (oneWayBindingAttributes$1.has(attr.name) && el.type === 'Element') {
        str.remove(attr.start, attr.expression.start);
        str.appendLeft(attr.expression.start, '{...__sveltets_1_empty(');
        if (isShortHandAttribute(attr)) {
            // eslint-disable-next-line max-len
            str.appendLeft(attr.end, `=__sveltets_1_instanceOf(${oneWayBindingAttributes$1.get(attr.name)}).${attr.name})}`);
        }
        else {
            // eslint-disable-next-line max-len
            str.overwrite(attr.expression.end, attr.end, `=__sveltets_1_instanceOf(${oneWayBindingAttributes$1.get(attr.name)}).${attr.name})}`);
        }
        return;
    }
    str.remove(attr.start, attr.start + 'bind:'.length);
    if (attr.expression.start === attr.start + 'bind:'.length) {
        str.prependLeft(attr.expression.start, `${attr.name}={`);
        str.appendLeft(attr.end, '}');
        return;
    }
    //remove possible quotes
    const lastChar = htmlx[attr.end - 1];
    if (isQuote(lastChar)) {
        const firstQuote = htmlx.indexOf(lastChar, attr.start);
        str.remove(firstQuote, firstQuote + 1);
        str.remove(attr.end - 1, attr.end);
    }
}

/**
 * class:xx={yyy}   --->   {...__sveltets_1_ensureType(Boolean, !!(yyy))}
 */
function handleClassDirective$1(str, attr) {
    str.overwrite(attr.start, attr.expression.start, '{...__sveltets_1_ensureType(Boolean, !!(');
    const endBrackets = '))}';
    if (attr.end !== attr.expression.end) {
        str.overwrite(withTrailingPropertyAccess$1(str.original, attr.expression.end), attr.end, endBrackets);
    }
    else {
        str.appendLeft(attr.end, endBrackets);
    }
}

/**
 * Removes comment
 */
function handleComment$1(str, node) {
    str.overwrite(node.start, node.end, '', { contentOnly: true });
}

const shadowedPropsSymbol = Symbol('shadowedProps');
/**
 * Transforms the usage of a slot (slot="xxx")
 * - transforms let:xx, {@const xx}
 */
function handleSlot(htmlx, str, slotEl, component, slotName, ifScope, templateScope) {
    var _a;
    //collect "let" definitions
    const slotElIsComponent = slotEl === component;
    let hasMovedLet = false;
    let slotDefInsertionPoint;
    // lazily calculate insertion point only when needed
    const calculateSlotDefInsertionPoint = () => {
        slotDefInsertionPoint =
            slotDefInsertionPoint ||
                (slotElIsComponent
                    ? htmlx.lastIndexOf('>', slotEl.children[0].start) + 1
                    : slotEl.start);
    };
    for (const attr of slotEl.attributes) {
        if (attr.type != 'Let') {
            continue;
        }
        if (slotElIsComponent && slotEl.children.length == 0) {
            //no children anyway, just wipe out the attribute
            str.remove(attr.start, attr.end);
            continue;
        }
        calculateSlotDefInsertionPoint();
        str.move(attr.start, attr.end, slotDefInsertionPoint);
        //remove let:
        str.remove(attr.start, attr.start + 'let:'.length);
        if (hasMovedLet) {
            str.appendRight(attr.start + 'let:'.length, ', ');
        }
        templateScope.inits.add(((_a = attr.expression) === null || _a === void 0 ? void 0 : _a.name) || attr.name);
        hasMovedLet = true;
        if (attr.expression) {
            //overwrite the = as a :
            const equalSign = htmlx.lastIndexOf('=', attr.expression.start);
            const curly = htmlx.lastIndexOf('{', beforeStart(attr.expression.start));
            str.overwrite(equalSign, curly + 1, ':');
            str.remove(attr.expression.end, attr.end);
        }
    }
    const hasConstTag = slotEl.children.some((child) => child.type === 'ConstTag');
    if (!hasMovedLet && !hasConstTag) {
        return;
    }
    calculateSlotDefInsertionPoint();
    const { singleSlotDef, constRedeclares } = getSingleSlotDefAndConstsRedeclaration(component, slotName, str.original, ifScope, slotElIsComponent);
    const prefix = constRedeclares ? `() => {${constRedeclares}` : '';
    str.appendLeft(slotDefInsertionPoint, `{${prefix}() => { `);
    if (hasMovedLet) {
        str.appendLeft(slotDefInsertionPoint, 'let {');
        str.appendRight(slotDefInsertionPoint, `} = ${singleSlotDef};`);
    }
    if (hasConstTag) {
        // unable to move multiple codes to the same place while insert code in between
        // NOTE: cheat by move to `slotDefInsertionPoint + 1` position
        // then copy the character in str[slotDefInsertionPoint...slotDefInsertionPoint + 1] to the back
        // and comment out the original str[slotDefInsertionPoint...slotDefInsertionPoint + 1]
        str.appendRight(slotDefInsertionPoint, '/*');
        extractConstTags(slotEl.children).forEach((insertion) => {
            insertion(slotDefInsertionPoint + 1, str);
        });
        str.appendRight(slotDefInsertionPoint + 1, `${ifScope.addPossibleIfCondition()}<>`);
        str.appendRight(slotDefInsertionPoint + 1, str.original.slice(slotDefInsertionPoint, slotDefInsertionPoint + 1));
        str.appendLeft(slotDefInsertionPoint + 1, '*/');
    }
    else {
        str.appendRight(slotDefInsertionPoint, `${ifScope.addPossibleIfCondition()}<>`);
    }
    const closeSlotDefInsertionPoint = slotElIsComponent
        ? htmlx.lastIndexOf('<', slotEl.end - 1)
        : slotEl.end;
    str.appendLeft(closeSlotDefInsertionPoint, `</>}}${constRedeclares ? '}' : ''}`);
}
function getSingleSlotDefAndConstsRedeclaration(componentNode, slotName, originalStr, ifScope, findAndRedeclareShadowedProps) {
    if (findAndRedeclareShadowedProps) {
        const replacement = 'Ψ';
        const { str, shadowedProps } = getInstanceTypeForDefaultSlot(componentNode, originalStr, replacement);
        componentNode[shadowedPropsSymbol] = shadowedProps;
        return {
            singleSlotDef: `${str}.$$slot_def['${slotName}']`,
            constRedeclares: getConstsToRedeclare(ifScope, shadowedProps)
        };
    }
    else {
        const str = getInstanceType(componentNode, originalStr, componentNode[shadowedPropsSymbol] || []);
        return {
            singleSlotDef: `${str}.$$slot_def['${slotName}']`,
            constRedeclares: ifScope.getConstDeclaration()
        };
    }
}
function getConstsToRedeclare(ifScope, shadowedProps) {
    const ifScopeRedeclarations = ifScope.getConstsToRedeclare();
    const letRedeclarations = shadowedProps.map(({ value, replacement }) => `${replacement}=${value}`);
    const replacements = [...ifScopeRedeclarations, ...letRedeclarations].join(',');
    return replacements ? surroundWithIgnoreComments(`const ${replacements};`) : '';
}

/**
 * Handle `<svelte:self>` and slot-specific transformations.
 */
function handleComponent(htmlx, str, el, parent, ifScope, templateScope) {
    //we need to remove : if it is a svelte component
    if (el.name.startsWith('svelte:')) {
        const colon = htmlx.indexOf(':', el.start);
        str.remove(colon, colon + 1);
        const closeTag = htmlx.lastIndexOf('/' + el.name, el.end);
        if (closeTag > el.start) {
            const colon = htmlx.indexOf(':', closeTag);
            str.remove(colon, colon + 1);
        }
    }
    // Handle possible slot
    const slotName = getSlotName(el) || 'default';
    handleSlot(htmlx, str, el, slotName === 'default' ? el : parent, slotName, ifScope, templateScope);
}

/**
 * {@debug a}		--->   {a}
 * {@debug a, b}	--->   {a}{b}
 * tsx won't accept commas, must split
 */
function handleDebug$1(_htmlx, str, debugBlock) {
    let cursor = debugBlock.start;
    for (const identifier of debugBlock.identifiers) {
        str.remove(cursor, identifier.start);
        str.prependLeft(identifier.start, '{');
        str.prependLeft(identifier.end, '}');
        cursor = identifier.end;
    }
    str.remove(cursor, debugBlock.end);
}

/**
 * Transform each block into something JSX can understand.
 */
function handleEach$1(htmlx, str, eachBlock, ifScope) {
    // {#each items as item,i (key)} ->
    // {__sveltets_1_each(items, (item,i) => (key) && (possible if expression &&) <>
    const constRedeclares = ifScope.getConstDeclaration();
    const prefix = constRedeclares ? `{() => {${constRedeclares}() => ` : '';
    str.overwrite(eachBlock.start, eachBlock.expression.start, `${prefix}{__sveltets_1_each(`);
    str.overwrite(eachBlock.expression.end, eachBlock.context.start, ', (');
    // {#each true, items as item}
    if (eachBlock.expression.type === 'SequenceExpression') {
        str.appendRight(eachBlock.expression.start, '(');
        str.appendLeft(eachBlock.expression.end, ')');
    }
    let contextEnd = eachBlock.context.end;
    if (eachBlock.index) {
        const idxLoc = htmlx.indexOf(eachBlock.index, contextEnd);
        contextEnd = idxLoc + eachBlock.index.length;
    }
    const constTags = extractConstTags(eachBlock.children);
    str.prependLeft(contextEnd, ') =>' + (constTags.length ? ' {' : ''));
    constTags.forEach((insertion) => {
        insertion(contextEnd, str);
    });
    if (eachBlock.key) {
        const endEachStart = htmlx.indexOf('}', eachBlock.key.end);
        str.overwrite(endEachStart, endEachStart + 1, ` && ${ifScope.addPossibleIfCondition()}<>`);
    }
    else {
        const endEachStart = htmlx.indexOf('}', contextEnd);
        str.overwrite(endEachStart, endEachStart + 1, ` ${ifScope.addPossibleIfCondition()}<>`);
    }
    const endEach = htmlx.lastIndexOf('{', eachBlock.end - 1);
    const suffix = '</>' + (constTags.length ? '}' : '') + (constRedeclares ? ')}}}' : ')}');
    // {/each} -> </>})} or {:else} -> </>})}
    if (eachBlock.else) {
        const elseEnd = htmlx.lastIndexOf('}', eachBlock.else.start);
        const elseStart = htmlx.lastIndexOf('{', elseEnd);
        str.overwrite(elseStart, elseEnd + 1, suffix);
        str.remove(endEach, eachBlock.end);
    }
    else {
        str.overwrite(endEach, eachBlock.end, suffix);
    }
}

/**
 * Special treatment for self-closing / void tags to make them conform to JSX.
 */
function handleElement(htmlx, str, node, parent, ifScope, templateScope) {
    const slotName = getSlotName(node);
    if (slotName) {
        handleSlot(htmlx, str, node, parent, slotName, ifScope, templateScope);
    }
    //we just have to self close void tags since jsx always wants the />
    const voidTags = 'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr'.split(',');
    if (voidTags.find((x) => x == node.name)) {
        if (htmlx[node.end - 2] != '/') {
            str.appendRight(node.end - 1, '/');
        }
    }
    //some tags auto close when they encounter certain elements, jsx doesn't support this
    if (htmlx[node.end - 1] != '>') {
        str.appendRight(node.end, `</${node.name}>`);
    }
}

/**
 * Transform on:xxx={yyy}
 * - For DOM elements: ---> onxxx={yyy}
 * - For Svelte components/special elements: ---> {__sveltets_1_instanceOf(..ComponentType..).$on("xxx", yyy)}
 */
function handleEventHandler$1(htmlx, str, attr, parent) {
    const jsxEventName = attr.name;
    if (['Element', 'Window', 'Body'].includes(parent.type) /*&& KnownEvents.indexOf('on'+jsxEventName) >= 0*/) {
        if (attr.expression) {
            const endAttr = htmlx.indexOf('=', attr.start);
            str.overwrite(attr.start + 'on:'.length - 1, endAttr, jsxEventName);
            const lastChar = htmlx[attr.end - 1];
            if (isQuote(lastChar)) {
                const firstQuote = htmlx.indexOf(lastChar, endAttr);
                str.remove(firstQuote, firstQuote + 1);
                str.remove(attr.end - 1, attr.end);
            }
        }
        else {
            str.overwrite(attr.start + 'on:'.length - 1, attr.end, `${jsxEventName}={undefined}`);
        }
    }
    else {
        if (attr.expression) {
            const on = 'on';
            //for handler assignment, we change it to call to our __sveltets_1_ensureFunction
            str.appendRight(attr.start, `{${getInstanceType(parent, str.original)}.$`);
            const eventNameIndex = htmlx.indexOf(':', attr.start) + 1;
            str.overwrite(htmlx.indexOf(on, attr.start) + on.length, eventNameIndex, "('");
            const eventEnd = htmlx.lastIndexOf('=', attr.expression.start);
            str.overwrite(eventEnd, attr.expression.start, "', ");
            str.overwrite(withTrailingPropertyAccess$1(str.original, attr.expression.end), attr.end, ')}');
            str.move(attr.start, attr.end, parent.end);
        }
        else {
            //for passthrough handlers, we just remove
            str.remove(attr.start, attr.end);
        }
    }
}

/**
 * {# if ...}...{/if}   --->   {() => {if(...){<>...</>}}}
 */
function handleIf$1(htmlx, str, ifBlock, ifScope) {
    const endIf = htmlx.lastIndexOf('{', ifBlock.end - 1);
    const constTags = extractConstTags(ifBlock.children);
    const ifConditionEnd = htmlx.indexOf('}', ifBlock.expression.end) + 1;
    const hasConstTags = !!constTags.length;
    const endIIFE = createEndIIFE(hasConstTags);
    const startIIFE = createStartIIFE(hasConstTags);
    if (hasConstTags) {
        // {@const hi = exp} <div>{hi}> -> {(() => { const hi = exp; return <> <div>{hi}<div></> })}
        constTags.forEach((constTag) => {
            constTag(ifConditionEnd, str);
        });
        str.appendRight(ifConditionEnd, 'return <>');
        if (ifBlock.else) {
            // {:else} -> </>})()}</> : <>
            const elseWord = htmlx.lastIndexOf(':else', ifBlock.else.start);
            const elseStart = htmlx.lastIndexOf('{', elseWord);
            str.appendLeft(elseStart, endIIFE);
        }
    }
    if (ifBlock.elseif) {
        // {:else if expr}  ->  : (expr) ? <>
        // {:else if expr}{@const ...}  ->  : (expr) ? <>{(() => {const ...; return <>
        const elseIfStart = htmlx.lastIndexOf('{', ifBlock.expression.start);
        str.overwrite(elseIfStart, ifBlock.expression.start, '</> : (', {
            contentOnly: true
        });
        str.overwrite(withTrailingPropertyAccess$1(str.original, ifBlock.expression.end), ifConditionEnd, ') ? <>' + startIIFE);
        ifScope.addElseIf(ifBlock.expression, str);
        if (!ifBlock.else) {
            str.appendLeft(endIf, endIIFE + '</> : <>');
        }
        return;
    }
    // {#if expr}  ->  {(expr) ? <>
    // {#if expr}{@const ...} ->  {(expr) ? <>{(() => {const ...; return <>
    str.overwrite(ifBlock.start, ifBlock.expression.start, '{(', { contentOnly: true });
    str.overwrite(withTrailingPropertyAccess$1(str.original, ifBlock.expression.end), ifConditionEnd, ') ? <>' + startIIFE, { contentOnly: true });
    ifScope.addNestedIf(ifBlock.expression, str);
    if (ifBlock.else) {
        // {/if}  ->  </> }
        str.overwrite(endIf, ifBlock.end, '</> }', { contentOnly: true });
    }
    else {
        // {/if}  ->  </> : <></>}
        // {@const ...} -> </>})()}</> : <></>}
        str.overwrite(endIf, ifBlock.end, endIIFE + '</> : <></>}', {
            contentOnly: true
        });
    }
}
function createStartIIFE(hasConstTags) {
    return hasConstTags ? '{(() => {' : '';
}
function createEndIIFE(hasConstTags) {
    return hasConstTags ? '</>})()}' : '';
}
/**
 * {:else}   --->   </> : <>
 * {:else} {@const ...} -> </> : <>{(() => { const ...; return<>
 */
function handleElse$1(htmlx, str, elseBlock, parent, ifScope) {
    var _a, _b;
    if (parent.type !== 'IfBlock' ||
        (((_a = elseBlock.children[0]) === null || _a === void 0 ? void 0 : _a.type) === 'IfBlock' && ((_b = elseBlock.children[0]) === null || _b === void 0 ? void 0 : _b.elseif))) {
        return;
    }
    const elseEnd = htmlx.lastIndexOf('}', elseBlock.start);
    const elseword = htmlx.lastIndexOf(':else', elseEnd);
    const elseStart = htmlx.lastIndexOf('{', elseword);
    const constTags = extractConstTags(elseBlock.children);
    const hasConstTags = !!constTags.length;
    str.overwrite(elseStart, elseEnd + 1, '</> : <>' + createStartIIFE(hasConstTags));
    ifScope.addElse();
    if (!hasConstTags) {
        return;
    }
    constTags.forEach((constTag) => {
        constTag(elseEnd + 1, str);
    });
    str.appendRight(elseEnd + 1, 'return <>');
    str.appendLeft(elseBlock.end, createEndIIFE(true));
}

var IfType;
(function (IfType) {
    IfType[IfType["If"] = 0] = "If";
    IfType[IfType["ElseIf"] = 1] = "ElseIf";
    IfType[IfType["Else"] = 2] = "Else";
})(IfType || (IfType = {}));
/**
 * Creates a new condition whos parent is the current condition
 * and the leaf is the passed in condition info.
 * See `Condition` for an explanation of the structure.
 */
function addElseIfCondition(existingCondition, newCondition) {
    return {
        parent: existingCondition,
        condition: newCondition,
        type: IfType.ElseIf
    };
}
/**
 * Creates a new condition whos parent is the current condition
 * and the leaf is the else condition, where children can follow.
 * See `Condition` for an explanation of the structure.
 */
function addElseCondition(existingCondition) {
    return {
        parent: existingCondition,
        type: IfType.Else
    };
}
const REPLACEMENT_PREFIX = '\u03A9';
/**
 * Returns the full currently known condition. Identifiers in the condition
 * get replaced if they were redeclared.
 */
function getFullCondition(condition, replacedNames, replacementPrefix) {
    switch (condition.type) {
        case IfType.If:
            return _getFullCondition(condition, false, replacedNames, replacementPrefix);
        case IfType.ElseIf:
            return _getFullCondition(condition, false, replacedNames, replacementPrefix);
        case IfType.Else:
            return _getFullCondition(condition, false, replacedNames, replacementPrefix);
    }
}
function _getFullCondition(condition, negate, replacedNames, replacementPrefix) {
    switch (condition.type) {
        case IfType.If:
            return negate
                ? `!(${getConditionString(condition.condition, replacedNames, replacementPrefix)})`
                : `(${getConditionString(condition.condition, replacedNames, replacementPrefix)})`;
        case IfType.ElseIf:
            return `${_getFullCondition(condition.parent, true, replacedNames, replacementPrefix)} && ${negate ? '!' : ''}(${getConditionString(condition.condition, replacedNames, replacementPrefix)})`;
        case IfType.Else:
            return `${_getFullCondition(condition.parent, true, replacedNames, replacementPrefix)}`;
    }
}
/**
 * Alter a condition text such that identifiers which needs replacement
 * are replaced accordingly.
 */
function getConditionString(condition, replacedNames, replacementPrefix) {
    const replacements = [];
    for (const name of replacedNames) {
        const occurences = condition.identifiers.get(name);
        if (occurences) {
            for (const occurence of occurences) {
                replacements.push({ ...occurence, name });
            }
        }
    }
    if (!replacements.length) {
        return condition.text;
    }
    replacements.sort((r1, r2) => r1.start - r2.start);
    return (condition.text.substring(0, replacements[0].start) +
        replacements
            .map((replacement, idx) => {
            var _a;
            return replacementPrefix +
                replacement.name +
                condition.text.substring(replacement.end, (_a = replacements[idx + 1]) === null || _a === void 0 ? void 0 : _a.start);
        })
            .join(''));
}
/**
 * Returns a set of all identifiers that were used in this condition
 */
function collectReferencedIdentifiers(condition) {
    const identifiers = new Set();
    let current = condition;
    while (current) {
        if (current.type === IfType.ElseIf || current.type === IfType.If) {
            for (const identifier of current.condition.identifiers.keys()) {
                identifiers.add(identifier);
            }
        }
        current =
            current.type === IfType.ElseIf || current.type === IfType.Else
                ? current.parent
                : undefined;
    }
    return identifiers;
}
/**
 * A scope contains a if-condition including else(if) branches.
 * The branches are added over time and the whole known condition is updated accordingly.
 *
 * This class is then mainly used to reprint if-conditions. This is necessary when
 * a lambda-function is declared within the jsx-template because that function loses
 * the control flow information. The reprint should be prepended to the jsx-content
 * of the lambda function.
 *
 * Example:
 * `{check ? {() => {<p>hi</p>}} : ''}`
 * becomes
 * `{check ? {() => {check && <p>hi</p>}} : ''}`
 *
 * Most of the logic in here deals with the possibility of shadowed variables.
 * Example:
 * `{check ? {(check) => {<p>{check}</p>}} : ''}`
 * becomes
 * `{check ? {const Ωcheck = check;(check) => {Ωcheck && <p>{check}</p>}} : ''}`
 *
 */
class IfScope {
    constructor(scope, current, parent) {
        this.scope = scope;
        this.current = current;
        this.parent = parent;
        this.ownScope = this.scope.value;
        this.replacementPrefix = REPLACEMENT_PREFIX.repeat(this.computeDepth());
    }
    /**
     * Returns the full currently known condition, prepended with the conditions
     * of its parents. Identifiers in the condition get replaced if they were redeclared.
     */
    getFullCondition() {
        var _a;
        if (!this.current) {
            return '';
        }
        const parentCondition = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.getFullCondition();
        const condition = `(${getFullCondition(this.current, this.getNamesThatNeedReplacement(), this.replacementPrefix)})`;
        return parentCondition ? `(${parentCondition}) && ${condition}` : condition;
    }
    /**
     * Convenience method which invokes `getFullCondition` and adds a `&&` at the end
     * for easy chaining.
     */
    addPossibleIfCondition() {
        const condition = this.getFullCondition();
        return condition ? surroundWithIgnoreComments(`${condition} && `) : '';
    }
    /**
     * Adds a new child IfScope.
     */
    addNestedIf(expression, str) {
        const condition = this.getConditionInfo(str, expression);
        const ifScope = new IfScope(this.scope, { condition, type: IfType.If }, this);
        this.child = ifScope;
    }
    /**
     * Adds a `else if` branch to the scope and enhances the condition accordingly.
     */
    addElseIf(expression, str) {
        const condition = this.getConditionInfo(str, expression);
        this.current = addElseIfCondition(this.current, condition);
    }
    /**
     * Adds a `else` branch to the scope and enhances the condition accordingly.
     */
    addElse() {
        this.current = addElseCondition(this.current);
    }
    getChild() {
        return this.child || this;
    }
    getParent() {
        return this.parent || this;
    }
    /**
     * Returns a set of all identifiers that were used in this IfScope and its parent scopes.
     */
    collectReferencedIdentifiers() {
        var _a;
        const current = collectReferencedIdentifiers(this.current);
        const parent = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.collectReferencedIdentifiers();
        if (parent) {
            for (const identifier of parent) {
                current.add(identifier);
            }
        }
        return current;
    }
    /**
     * Should be invoked when a new template scope which resets control flow (await, each, slot) is created.
     * The returned string contains a list of `const` declarations which redeclares the identifiers
     * in the conditions which would be overwritten by the scope
     * (because they declare a variable with the same name, therefore shadowing the outer variable).
     */
    getConstDeclaration() {
        const replacements = this.getConstsToRedeclare().join(',');
        return replacements ? surroundWithIgnoreComments(`const ${replacements};`) : '';
    }
    /**
     * Like `getConstsRedaclarationString`, but only returns a list of redaclaration-string without
     * merging the result with `const` and a ignore comments surround.
     */
    getConstsToRedeclare() {
        return this.getNamesToRedeclare().map((identifier) => `${this.replacementPrefix + identifier}=${identifier}`);
    }
    /**
     * Returns true if given identifier is referenced in this IfScope or a parent scope.
     */
    referencesIdentifier(name) {
        const current = collectReferencedIdentifiers(this.current);
        if (current.has(name)) {
            return true;
        }
        if (!this.parent || this.ownScope.inits.has(name)) {
            return false;
        }
        return this.parent.referencesIdentifier(name);
    }
    getConditionInfo(str, expression) {
        const identifiers = getIdentifiersInIfExpression(expression);
        const text = str.original.substring(expression.start, expression.end);
        return { identifiers, text };
    }
    /**
     * Contains a list of identifiers which would be overwritten by the child template scope.
     */
    getNamesToRedeclare() {
        return [...this.scope.value.inits.keys()].filter((init) => {
            let parent = this.scope.value.parent;
            while (parent && parent !== this.ownScope) {
                if (parent.inits.has(init)) {
                    return false;
                }
                parent = parent.parent;
            }
            return this.referencesIdentifier(init);
        });
    }
    /**
     * Return all identifiers that were redeclared and therefore need replacement.
     */
    getNamesThatNeedReplacement() {
        const referencedIdentifiers = this.collectReferencedIdentifiers();
        return [...referencedIdentifiers].filter((identifier) => this.someChildScopeHasRedeclaredVariable(identifier));
    }
    /**
     * Returns true if given identifier name is redeclared in a child template scope
     * and is therefore shadowed within that scope.
     */
    someChildScopeHasRedeclaredVariable(name) {
        let scope = this.scope.value;
        while (scope && scope !== this.ownScope) {
            if (scope.inits.has(name)) {
                return true;
            }
            scope = scope.parent;
        }
        return false;
    }
    computeDepth() {
        let idx = 1;
        let parent = this.ownScope.parent;
        while (parent) {
            idx++;
            parent = parent.parent;
        }
        return idx;
    }
}

/**
 * {#key expr}content{/key}   --->   {expr} content
 */
function handleKey$1(htmlx, str, keyBlock) {
    // {#key expr}   ->   {expr}
    str.overwrite(keyBlock.start, keyBlock.expression.start, '{');
    const end = htmlx.indexOf('}', keyBlock.expression.end);
    str.overwrite(withTrailingPropertyAccess$1(str.original, keyBlock.expression.end), end + 1, '} ');
    // {/key}   ->
    const endKey = htmlx.lastIndexOf('{', keyBlock.end - 1);
    str.remove(endKey, keyBlock.end);
}

/**
 * {@html ...}   --->   {...}
 */
function handleRawHtml$1(htmlx, str, rawBlock) {
    const tokenStart = htmlx.indexOf('@html', rawBlock.start);
    str.remove(tokenStart, tokenStart + '@html'.length);
}

/**
 * style:xx         --->  __sveltets_1_ensureType(String, Number, xx);
 * style:xx={yy}    --->  __sveltets_1_ensureType(String, Number, yy);
 * style:xx="yy"    --->  __sveltets_1_ensureType(String, Number, "yy");
 * style:xx="a{b}"  --->  __sveltets_1_ensureType(String, Number, `a${b}`);
 */
function handleStyleDirective$1(str, style) {
    const htmlx = str.original;
    if (style.value === true || style.value.length === 0) {
        str.overwrite(style.start, htmlx.indexOf(':', style.start) + 1, '{...__sveltets_1_ensureType(String, Number, ');
        str.appendLeft(style.end, ')}');
        return;
    }
    if (style.value.length > 1) {
        buildTemplateString(style, str, htmlx, '{...__sveltets_1_ensureType(String, Number, `', '`)}', style.start);
        return;
    }
    const styleVal = style.value[0];
    if (styleVal.type === 'Text') {
        str.overwrite(style.start, styleVal.start, '{...__sveltets_1_ensureType(String, Number, "');
        if (styleVal.end === style.end) {
            str.appendLeft(style.end, '")}');
        }
        else {
            str.overwrite(styleVal.end, style.end, '")}');
        }
    }
    else {
        // MustacheTag
        str.overwrite(style.start, styleVal.start + 1, '{...__sveltets_1_ensureType(String, Number, ');
        str.overwrite(styleVal.end - 1, style.end, ')}');
    }
}

/**
 * `<svelte:window>...</svelte:window>`   ---->    `<sveltewindow>...</sveltewindow>`
 * (same for :head, :body, :options, :fragment, :element)
 */
function handleSvelteTag(htmlx, str, node) {
    const colon = htmlx.indexOf(':', node.start);
    str.remove(colon, colon + 1);
    const closeTag = htmlx.lastIndexOf('/' + node.name, node.end);
    if (closeTag > node.start) {
        const colon = htmlx.indexOf(':', closeTag);
        str.remove(colon, colon + 1);
    }
}

/**
 *
 * @param {Node} param
 * @param {Identifier[]} nodes
 * @returns {Identifier[]}
 */
function extract_identifiers(param, nodes = []) {
	switch (param.type) {
		case 'Identifier':
			nodes.push(param);
			break;

		case 'MemberExpression':
			let object = param;
			while (object.type === 'MemberExpression') {
				object = /** @type {any} */ (object.object);
			}
			nodes.push(/** @type {any} */ (object));
			break;

		case 'ObjectPattern':
			/**
			 *
			 * @param {Property | RestElement} prop
			 */
			const handle_prop = (prop) => {
				if (prop.type === 'RestElement') {
					extract_identifiers(prop.argument, nodes);
				} else {
					extract_identifiers(prop.value, nodes);
				}
			};

			param.properties.forEach(handle_prop);
			break;

		case 'ArrayPattern':
			/**
			 *
			 * @param {Node} element
			 */
			const handle_element = (element) => {
				if (element) extract_identifiers(element, nodes);
			};

			param.elements.forEach(handle_element);
			break;

		case 'RestElement':
			extract_identifiers(param.argument, nodes);
			break;

		case 'AssignmentPattern':
			extract_identifiers(param.left, nodes);
			break;
	}

	return nodes;
}

class TemplateScope$1 {
    constructor(parent) {
        this.inits = new Set();
        this.parent = parent;
    }
    child() {
        const child = new TemplateScope$1(this);
        return child;
    }
}
class TemplateScopeManager {
    constructor() {
        this.value = new TemplateScope$1();
    }
    eachEnter(node) {
        this.value = this.value.child();
        if (node.context) {
            this.handleScope(node.context, node.children);
        }
        if (node.index) {
            this.value.inits.add(node.index);
        }
    }
    eachLeave(node) {
        if (!node.else) {
            this.value = this.value.parent;
        }
    }
    awaitEnter(node) {
        var _a;
        this.value = this.value.child();
        if (node.value) {
            this.handleScope(node.value, (_a = node.then) === null || _a === void 0 ? void 0 : _a.children);
        }
        if (node.error) {
            this.handleScope(node.error, []);
        }
    }
    awaitPendingEnter(node, parent) {
        if (node.skip || parent.type !== 'AwaitBlock') {
            return;
        }
        // Reset inits, as pending can have no inits
        this.value.inits.clear();
    }
    awaitThenEnter(node, parent) {
        if (node.skip || parent.type !== 'AwaitBlock') {
            return;
        }
        // Reset inits, this time only taking the then
        // scope into account.
        this.value.inits.clear();
        if (parent.value) {
            this.handleScope(parent.value, node.children);
        }
    }
    awaitCatchEnter(node, parent) {
        if (node.skip || parent.type !== 'AwaitBlock') {
            return;
        }
        // Reset inits, this time only taking the error
        // scope into account.
        this.value.inits.clear();
        if (parent.error) {
            this.handleScope(parent.error, node.children);
        }
    }
    awaitLeave() {
        this.value = this.value.parent;
    }
    elseEnter(parent) {
        if (parent.type === 'EachBlock') {
            this.value = this.value.parent;
        }
    }
    componentOrSlotTemplateOrElementEnter(node) {
        var _a;
        const hasConstTags = (_a = node.children) === null || _a === void 0 ? void 0 : _a.some((child) => child.type === 'ConstTag');
        if (usesLet(node) || hasConstTags) {
            this.value = this.value.child();
            this.handleScope({}, node.children);
        }
    }
    componentOrSlotTemplateOrElementLeave(node) {
        if (usesLet(node)) {
            this.value = this.value.parent;
        }
    }
    handleScope(identifierDef, children) {
        if (isIdentifier(identifierDef)) {
            this.value.inits.add(identifierDef.name);
        }
        if (isDestructuringPatterns(identifierDef)) {
            // the node object is returned as-it with no mutation
            const identifiers = extract_identifiers(identifierDef);
            identifiers.forEach((id) => this.value.inits.add(id.name));
        }
        if (children === null || children === void 0 ? void 0 : children.length) {
            children.forEach((child) => {
                if (child.type === 'ConstTag') {
                    const identifiers = extract_identifiers(child.expression.left);
                    identifiers.forEach((id) => this.value.inits.add(id.name));
                }
            });
        }
    }
}

function handleText$1(str, node) {
    if (!node.data) {
        return;
    }
    const needsRemoves = ['}', '>'];
    for (const token of needsRemoves) {
        let index = node.data.indexOf(token);
        while (index >= 0) {
            str.remove(index + node.start, index + node.start + 1);
            index = node.data.indexOf(token, index + 1);
        }
    }
}

/**
 * transition:xxx(yyy)   --->   {...__sveltets_1_ensureTransition(xxx(__sveltets_1_mapElementTag('..'),(yyy)))}
 */
function handleTransitionDirective$1(htmlx, str, attr, parent) {
    str.overwrite(attr.start, htmlx.indexOf(':', attr.start) + 1, '{...__sveltets_1_ensureTransition(');
    if (attr.modifiers.length) {
        const local = htmlx.indexOf('|', attr.start);
        str.remove(local, attr.expression ? attr.expression.start : attr.end);
    }
    const nodeType = `__sveltets_1_mapElementTag('${parent.name}')`;
    if (!attr.expression) {
        str.appendLeft(attr.end, `(${nodeType},{}))}`);
        return;
    }
    str.overwrite(htmlx.indexOf(':', attr.start) + 1 + `${attr.name}`.length, attr.expression.start, `(${nodeType},(`);
    str.appendLeft(withTrailingPropertyAccess$1(str.original, attr.expression.end), ')))');
    if (isQuote(htmlx[attr.end - 1])) {
        str.remove(attr.end - 1, attr.end);
    }
}

function stripDoctype$1(str) {
    const regex = /<!doctype(.+?)>(\n)?/i;
    const result = regex.exec(str.original);
    if (result) {
        str.remove(result.index, result.index + result[0].length);
    }
}
/**
 * Walks the HTMLx part of the Svelte component
 * and converts it to JSX
 */
function convertHtmlxToJsx$1(str, ast, onWalk = null, onLeave = null, options = {}) {
    const htmlx = str.original;
    stripDoctype$1(str);
    str.prepend('<>');
    str.append('</>');
    const templateScopeManager = new TemplateScopeManager();
    let ifScope = new IfScope(templateScopeManager);
    compiler.walk(ast, {
        enter: (node, parent, prop, index) => {
            try {
                switch (node.type) {
                    case 'IfBlock':
                        handleIf$1(htmlx, str, node, ifScope);
                        if (!node.elseif) {
                            ifScope = ifScope.getChild();
                        }
                        break;
                    case 'EachBlock':
                        templateScopeManager.eachEnter(node);
                        handleEach$1(htmlx, str, node, ifScope);
                        break;
                    case 'ElseBlock':
                        templateScopeManager.elseEnter(parent);
                        handleElse$1(htmlx, str, node, parent, ifScope);
                        break;
                    case 'AwaitBlock':
                        handleAwait$1(htmlx, str, node, ifScope, templateScopeManager);
                        break;
                    case 'PendingBlock':
                        templateScopeManager.awaitPendingEnter(node, parent);
                        handleAwaitPending(parent, htmlx, str, ifScope);
                        break;
                    case 'ThenBlock':
                        templateScopeManager.awaitThenEnter(node, parent);
                        handleAwaitThen(parent, htmlx, str, ifScope);
                        break;
                    case 'CatchBlock':
                        templateScopeManager.awaitCatchEnter(node, parent);
                        handleAwaitCatch(parent, htmlx, str, ifScope);
                        break;
                    case 'KeyBlock':
                        handleKey$1(htmlx, str, node);
                        break;
                    case 'RawMustacheTag':
                        handleRawHtml$1(htmlx, str, node);
                        break;
                    case 'DebugTag':
                        handleDebug$1(htmlx, str, node);
                        break;
                    case 'InlineComponent':
                        templateScopeManager.componentOrSlotTemplateOrElementEnter(node);
                        handleComponent(htmlx, str, node, parent, ifScope, templateScopeManager.value);
                        break;
                    case 'Element':
                        if (node.name === 'svelte:element') {
                            handleSvelteTag(htmlx, str, node);
                        }
                        templateScopeManager.componentOrSlotTemplateOrElementEnter(node);
                        handleElement(htmlx, str, node, parent, ifScope, templateScopeManager.value);
                        break;
                    case 'Comment':
                        handleComment$1(str, node);
                        break;
                    case 'Binding':
                        handleBinding$1(htmlx, str, node, parent);
                        break;
                    case 'Class':
                        handleClassDirective$1(str, node);
                        break;
                    case 'StyleDirective':
                        handleStyleDirective$1(str, node);
                        break;
                    case 'Action':
                        handleActionDirective$1(htmlx, str, node, parent);
                        break;
                    case 'Transition':
                        handleTransitionDirective$1(htmlx, str, node, parent);
                        break;
                    case 'Animation':
                        handleAnimateDirective$1(htmlx, str, node, parent);
                        break;
                    case 'Attribute':
                        handleAttribute$1(htmlx, str, node, parent, options.preserveAttributeCase);
                        break;
                    case 'EventHandler':
                        handleEventHandler$1(htmlx, str, node, parent);
                        break;
                    case 'Options':
                        handleSvelteTag(htmlx, str, node);
                        break;
                    case 'Window':
                        handleSvelteTag(htmlx, str, node);
                        break;
                    case 'Head':
                        handleSvelteTag(htmlx, str, node);
                        break;
                    case 'Body':
                        handleSvelteTag(htmlx, str, node);
                        break;
                    case 'SlotTemplate':
                        handleSvelteTag(htmlx, str, node);
                        templateScopeManager.componentOrSlotTemplateOrElementEnter(node);
                        handleSlot(htmlx, str, node, parent, getSlotName(node) || 'default', ifScope, templateScopeManager.value);
                        break;
                    case 'Text':
                        handleText$1(str, node);
                        break;
                }
                if (onWalk) {
                    onWalk(node, parent, prop, index);
                }
            }
            catch (e) {
                console.error('Error walking node ', node, e);
                throw e;
            }
        },
        leave: (node, parent, prop, index) => {
            try {
                switch (node.type) {
                    case 'IfBlock':
                        if (!node.elseif) {
                            ifScope = ifScope.getParent();
                        }
                        break;
                    case 'EachBlock':
                        templateScopeManager.eachLeave(node);
                        break;
                    case 'AwaitBlock':
                        templateScopeManager.awaitLeave();
                        break;
                    case 'InlineComponent':
                    case 'Element':
                    case 'SlotTemplate':
                        templateScopeManager.componentOrSlotTemplateOrElementLeave(node);
                        break;
                }
                if (onLeave) {
                    onLeave(node, parent, prop, index);
                }
            }
            catch (e) {
                console.error('Error leaving node ', node);
                throw e;
            }
        }
    });
}

/**
 * use:xxx={params}   --->    __sveltets_2_ensureAction(xxx(svelte.mapElementTag('ParentNodeName'),(params)));
 */
function handleActionDirective(attr, element) {
    element.addAction(attr);
}

/**
 * Moves or inserts text to the specified end in order.
 * "In order" means that the transformation of the text before
 * the given position reads exactly what was moved/inserted
 * from left to right.
 * After the transformation is done, everything inside the start-end-range that was
 * not moved will be removed. If there's a delete position given, things will be moved
 * to the end first before getting deleted. This may ensure better mappings for auto completion
 * for example.
 * Note: If you need the last char to be mapped so that it follows the previous character,
 * you may need to find a different way because MagicString does not allow us to move a range
 * that goes from `start` to `end` to the `end` position.
 */
function transform(str, start, end, _xxx, // TODO
transformations) {
    const moves = [];
    let appendPosition = end;
    let ignoreNextString = false;
    let deletePos;
    let deleteDest;
    for (let i = 0; i < transformations.length; i++) {
        const transformation = transformations[i];
        if (typeof transformation === 'number') {
            deletePos = moves.length;
            deleteDest = transformation;
        }
        else if (typeof transformation === 'string') {
            if (!ignoreNextString) {
                str.appendLeft(appendPosition, transformation);
            }
            ignoreNextString = false;
        }
        else {
            const tStart = transformation[0];
            let tEnd = transformation[1];
            if (tStart === tEnd) {
                // zero-range selection, don't move, it would
                // cause bugs and isn't necessary anyway
                continue;
            }
            if (tEnd < end - 1 &&
                // TODO can we somehow make this more performant?
                !transformations.some((t) => typeof t !== 'string' && t[0] === tEnd)) {
                tEnd += 1;
                const next = transformations[i + 1];
                ignoreNextString = typeof next === 'string';
                // Do not append the next string, rather overwrite the next character. This ensures
                // that mappings of the string afterwards are not mapped to a previous character, making
                // mappings of ranges one character too short. If there's no string in the next transformation,
                // completely delete the first character afterwards. This also makes the mapping more correct,
                // so that autocompletion triggered on the last character works correctly.
                const overwrite = typeof next === 'string' ? next : '';
                str.overwrite(tEnd - 1, tEnd, overwrite, { contentOnly: true });
            }
            appendPosition = tEnd;
            moves.push([tStart, tEnd]);
        }
    }
    deletePos = deletePos !== null && deletePos !== void 0 ? deletePos : moves.length;
    for (let i = 0; i < deletePos; i++) {
        str.move(moves[i][0], moves[i][1], end);
    }
    let removeStart = start;
    for (const transformation of [...moves].sort((t1, t2) => t1[0] - t2[0])) {
        if (removeStart < transformation[0]) {
            if (deletePos !== moves.length && removeStart > deleteDest) {
                str.move(removeStart, transformation[0], end);
            }
            // Use one space because of hover etc: This will make map deleted characters to the whitespace
            str.overwrite(removeStart, transformation[0], ' ', { contentOnly: true });
        }
        removeStart = transformation[1];
    }
    if (removeStart < end) {
        // Completely delete the first character afterwards. This makes the mapping more correct,
        // so that autocompletion triggered on the last character works correctly.
        str.overwrite(removeStart, removeStart + 1, '', { contentOnly: true });
        removeStart++;
    }
    if (removeStart < end) {
        // Use one space because of hover etc: This will map deleted characters to the whitespace
        if (deletePos !== moves.length && removeStart > deleteDest && removeStart + 1 < end) {
            // Can only move stuff up to the end, not including, else we get a "cannot move inside itself" error
            str.move(removeStart, end - 1, end);
            str.overwrite(removeStart, end - 1, ' ', { contentOnly: true });
            str.overwrite(end - 1, end, '', { contentOnly: true });
        }
        else {
            str.overwrite(removeStart, end, ' ', { contentOnly: true });
        }
    }
    for (let i = deletePos; i < moves.length; i++) {
        str.move(moves[i][0], moves[i][1], end);
    }
}
/**
 * Surrounds given range with a prefix and suffix. This is benefitial
 * for better mappings in some cases. Example: If we transform `foo` to `"foo"`
 * and if TS underlines the whole `"foo"`, we need to make sure that the quotes
 * are also mapped to the correct positions.
 * Returns the input start/end transformation for convenience.
 */
function surroundWith(str, [start, end], prefix, suffix) {
    if (start + 1 === end) {
        str.overwrite(start, end, `${prefix}${str.original.charAt(start)}${suffix}`, {
            contentOnly: true
        });
    }
    else {
        str.overwrite(start, start + 1, `${prefix}${str.original.charAt(start)}`, {
            contentOnly: true
        });
        str.overwrite(end - 1, end, `${str.original.charAt(end - 1)}${suffix}`, {
            contentOnly: true
        });
    }
    return [start, end];
}
/**
 * Returns the [start, end] indexes of a directive (action,animation,etc) name.
 * Example: use:foo --> [startOfFoo, endOfFoo]
 */
function getDirectiveNameStartEndIdx(str, node) {
    const colonIdx = str.original.indexOf(':', node.start);
    return [colonIdx + 1, colonIdx + 1 + `${node.name}`.length];
}
/**
 * Removes characters from the string that are invalid for TS variable names.
 * Careful: This does not check if the leading character
 * is valid (numerical values aren't for example).
 */
function sanitizePropName(name) {
    return name
        .split('')
        .map((char) => (/[0-9A-Za-z$_]/.test(char) ? char : '_'))
        .join('');
}
/**
 * Check if there's a member access trailing behind given expression and if yes,
 * bump the position to include it.
 * Usually it's there because of the preprocessing we do before we let Svelte parse the template.
 */
function withTrailingPropertyAccess(originalText, position) {
    let index = position;
    while (index < originalText.length) {
        const char = originalText[index];
        if (!char.trim()) {
            index++;
            continue;
        }
        if (char === '.') {
            return index + 1;
        }
        if (char === '?' && originalText[index + 1] === '.') {
            return index + 2;
        }
        break;
    }
    return position;
}
function rangeWithTrailingPropertyAccess(originalText, node) {
    return [node.start, withTrailingPropertyAccess(originalText, node.end)];
}

/**
 * animate:xxx(yyy)   --->   __sveltets_2_ensureAnimation(xxx(svelte.mapElementTag('..'),__sveltets_2_AnimationMove,(yyy)));
 */
function handleAnimateDirective(str, attr, element) {
    const transformations = [
        '__sveltets_2_ensureAnimation(',
        getDirectiveNameStartEndIdx(str, attr),
        `(${element.typingsNamespace}.mapElementTag('${element.tagName}'),__sveltets_2_AnimationMove`
    ];
    if (attr.expression) {
        transformations.push(',(', rangeWithTrailingPropertyAccess(str.original, attr.expression), ')');
    }
    transformations.push('));');
    element.appendToStartEnd(transformations);
}

var svgAttributes = 'accent-height accumulate additive alignment-baseline allowReorder alphabetic amplitude arabic-form ascent attributeName attributeType autoReverse azimuth baseFrequency baseline-shift baseProfile bbox begin bias by calcMode cap-height class clip clipPathUnits clip-path clip-rule color color-interpolation color-interpolation-filters color-profile color-rendering contentScriptType contentStyleType cursor cx cy d decelerate descent diffuseConstant direction display divisor dominant-baseline dur dx dy edgeMode elevation enable-background end exponent externalResourcesRequired fill fill-opacity fill-rule filter filterRes filterUnits flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight format from fr fx fy g1 g2 glyph-name glyph-orientation-horizontal glyph-orientation-vertical glyphRef gradientTransform gradientUnits hanging height href horiz-adv-x horiz-origin-x id ideographic image-rendering in in2 intercept k k1 k2 k3 k4 kernelMatrix kernelUnitLength kerning keyPoints keySplines keyTimes lang lengthAdjust letter-spacing lighting-color limitingConeAngle local marker-end marker-mid marker-start markerHeight markerUnits markerWidth mask maskContentUnits maskUnits mathematical max media method min mode name numOctaves offset onabort onactivate onbegin onclick onend onerror onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup onrepeat onresize onscroll onunload opacity operator order orient orientation origin overflow overline-position overline-thickness panose-1 paint-order pathLength patternContentUnits patternTransform patternUnits pointer-events points pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits r radius refX refY rendering-intent repeatCount repeatDur requiredExtensions requiredFeatures restart result rotate rx ry scale seed shape-rendering slope spacing specularConstant specularExponent speed spreadMethod startOffset stdDeviation stemh stemv stitchTiles stop-color stop-opacity strikethrough-position strikethrough-thickness string stroke stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width style surfaceScale systemLanguage tabindex tableValues target targetX targetY text-anchor text-decoration text-rendering textLength to transform type u1 u2 underline-position underline-thickness unicode unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical values version vert-adv-y vert-origin-x vert-origin-y viewBox viewTarget visibility width widths word-spacing writing-mode x x-height x1 x2 xChannelSelector xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space y y1 y2 yChannelSelector z zoomAndPan'.split(' ');

const voidTags = 'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr'.split(',');
/**
 * Handles HTML elements as well as svelte:options, svelte:head, svelte:window, svelte:body, svelte:element
 *
 * Children of this element should call the methods on this class to add themselves to the correct
 * position within the transformation.
 *
 * The transformation result does not have anything to do with HTMLx, it instead uses plan JS,
 * leveraging scoped blocks (`{ ... }`). Each element is transformed to something that is
 * contained in such a block. This ensures we can declare variables inside that do not leak
 * to the outside while preserving TypeScript's control flow.
 *
 * A transformation reads for example like this:
 * ```
 * // before
 * <div class={foo} />
 * // after
 * { const $$_div = __sveltets_2_createElement("div", {"class": foo,}); }
 * ```
 */
class Element {
    get name() {
        this.referencedName = true;
        return this._name;
    }
    /**
     * @param str The MagicString instance used to manipulate the text
     * @param node The Svelte AST node that represents this element
     * @param typingsNamespace Determines which namespace to use for the createElement function
     * @param parent The Svelte AST parent node
     */
    constructor(str, node, typingsNamespace, parent) {
        this.str = str;
        this.node = node;
        this.typingsNamespace = typingsNamespace;
        this.parent = parent;
        this.startEndTransformation = ['});'];
        this.attrsTransformation = [];
        this.actionsTransformation = [];
        this.actionIdentifiers = [];
        this.endTransformation = [];
        // Add const $$xxx = ... only if the variable name is actually used
        // in order to prevent "$$xxx is defined but never used" TS hints
        this.referencedName = false;
        if (parent) {
            parent.child = this;
        }
        this.tagName = this.node.name === 'svelte:body' ? 'body' : this.node.name;
        this.isSelfclosing = this.computeIsSelfclosing();
        this.startTagStart = this.node.start;
        this.startTagEnd = this.computeStartTagEnd();
        const tagEnd = this.startTagStart + this.node.name.length + 1;
        // Ensure deleted characters are mapped to the attributes object so we
        // get autocompletion when triggering it on a whitespace.
        if (/\s/.test(str.original.charAt(tagEnd))) {
            this.attrsTransformation.push(tagEnd);
            this.attrsTransformation.push([tagEnd, tagEnd + 1]);
            // Overwrite necessary or else we get really weird mappings
            this.str.overwrite(tagEnd, tagEnd + 1, '', { contentOnly: true });
        }
        switch (this.node.name) {
            // Although not everything that is possible to add to Element
            // is valid on the special svelte elements,
            // we still also handle them here and let the Svelte parser handle invalid
            // cases. For us it doesn't make a difference to a normal HTML element.
            case 'svelte:options':
            case 'svelte:head':
            case 'svelte:window':
            case 'svelte:body':
            case 'svelte:fragment': {
                // remove the colon: svelte:xxx -> sveltexxx
                const nodeName = `svelte${this.node.name.substring(7)}`;
                this._name = '$$_' + nodeName + this.computeDepth();
                break;
            }
            case 'svelte:element': {
                this._name = '$$_svelteelement' + this.computeDepth();
                break;
            }
            case 'slot': {
                this._name = '$$_slot' + this.computeDepth();
                break;
            }
            default: {
                this._name = '$$_' + sanitizePropName(this.node.name) + this.computeDepth();
                break;
            }
        }
    }
    /**
     * attribute={foo}  -->  "attribute": foo,
     * @param name Attribute name
     * @param value Attribute value, if present. If not present, this is treated as a shorthand attribute
     */
    addAttribute(name, value) {
        if (value) {
            this.attrsTransformation.push(...name, ':', ...value, ',');
        }
        else {
            this.attrsTransformation.push(...name, ',');
        }
    }
    /**
     * Handle the slot of `<... slot=".." />`
     * @param transformation Slot name transformation
     */
    addSlotName(transformation) {
        this.slotLetsTransformation = this.slotLetsTransformation || [[], []];
        this.slotLetsTransformation[0] = transformation;
    }
    /**
     * Handle the let: of `<... let:xx={yy} />`
     * @param transformation Let transformation
     */
    addSlotLet(transformation) {
        this.slotLetsTransformation = this.slotLetsTransformation || [['default'], []];
        this.slotLetsTransformation[1].push(...transformation, ',');
    }
    addAction(attr) {
        const id = `$$action_${this.actionIdentifiers.length}`;
        this.actionIdentifiers.push(id);
        if (!this.actionsTransformation.length) {
            this.actionsTransformation.push('{');
        }
        this.actionsTransformation.push(`const ${id} = __sveltets_2_ensureAction(`, getDirectiveNameStartEndIdx(this.str, attr), `(${this.typingsNamespace}.mapElementTag('${this.tagName}')`);
        if (attr.expression) {
            this.actionsTransformation.push(',(', rangeWithTrailingPropertyAccess(this.str.original, attr.expression), ')');
        }
        this.actionsTransformation.push('));');
    }
    /**
     * Add something right after the start tag end.
     */
    appendToStartEnd(value) {
        this.startEndTransformation.push(...value);
    }
    performTransformation() {
        this.endTransformation.push('}');
        const slotLetTransformation = [];
        if (this.slotLetsTransformation) {
            if (this.slotLetsTransformation[0][0] === 'default') {
                slotLetTransformation.push(
                // add dummy destructuring parameter because if all parameters are unused,
                // the mapping will be confusing, because TS will highlight the whole destructuring
                `{const {${surroundWithIgnoreComments('$$_$$')},`, ...this.slotLetsTransformation[1], `} = ${this.parent.name}.$$slot_def.default;$$_$$;`);
            }
            else {
                slotLetTransformation.push(
                // See comment above
                `{const {${surroundWithIgnoreComments('$$_$$')},`, ...this.slotLetsTransformation[1], `} = ${this.parent.name}.$$slot_def["`, ...this.slotLetsTransformation[0], '"];$$_$$;');
            }
            this.endTransformation.push('}');
        }
        if (this.actionIdentifiers.length) {
            this.endTransformation.push('}');
        }
        if (this.isSelfclosing) {
            transform(this.str, this.startTagStart, this.startTagEnd, this.startTagEnd, [
                // Named slot transformations go first inside a outer block scope because
                // <div let:xx {x} /> means "use the x of let:x", and without a separate
                // block scope this would give a "used before defined" error
                ...slotLetTransformation,
                ...this.actionsTransformation,
                ...this.getStartTransformation(),
                ...this.attrsTransformation,
                ...this.startEndTransformation,
                ...this.endTransformation
            ]);
        }
        else {
            transform(this.str, this.startTagStart, this.startTagEnd, this.startTagEnd, [
                ...slotLetTransformation,
                ...this.actionsTransformation,
                ...this.getStartTransformation(),
                ...this.attrsTransformation,
                ...this.startEndTransformation
            ]);
            const tagEndIdx = this.str.original
                .substring(this.node.start, this.node.end)
                .lastIndexOf(`</${this.node.name}`);
            // tagEndIdx === -1 happens in situations of unclosed tags like `<p>fooo <p>anothertag</p>`
            const endStart = tagEndIdx === -1 ? this.node.end : tagEndIdx + this.node.start;
            transform(this.str, endStart, this.node.end, this.node.end, this.endTransformation);
        }
    }
    getStartTransformation() {
        var _a, _b;
        const createElement = `${this.typingsNamespace}.createElement`;
        const addActions = () => {
            if (this.actionIdentifiers.length) {
                return `, __sveltets_2_union(${this.actionIdentifiers.join(',')})`;
            }
            else {
                return '';
            }
        };
        let createElementStatement;
        switch (this.node.name) {
            // Although not everything that is possible to add to Element
            // is valid on the special svelte elements,
            // we still also handle them here and let the Svelte parser handle invalid
            // cases. For us it doesn't make a difference to a normal HTML element.
            case 'svelte:options':
            case 'svelte:head':
            case 'svelte:window':
            case 'svelte:body':
            case 'svelte:fragment': {
                createElementStatement = [`${createElement}("${this.node.name}"${addActions()}, {`];
                break;
            }
            case 'svelte:element': {
                const nodeName = this.node.tag
                    ? typeof this.node.tag !== 'string'
                        ? [this.node.tag.start, this.node.tag.end]
                        : `"${this.node.tag}"`
                    : '""';
                createElementStatement = [`${createElement}(`, nodeName, `${addActions()}, {`];
                break;
            }
            case 'slot': {
                // If the element is a <slot> tag, create the element with the createSlot-function
                // which is created inside createRenderFunction.ts to check that the name and attributes
                // of the slot tag are correct. The check will error if the user defined $$Slots
                // and the slot definition or its attributes contradict that type definition.
                const slotName = ((_b = (_a = this.node.attributes) === null || _a === void 0 ? void 0 : _a.find((a) => a.name === 'name')) === null || _b === void 0 ? void 0 : _b.value[0]) ||
                    'default';
                createElementStatement = [
                    '__sveltets_createSlot(',
                    typeof slotName === 'string'
                        ? `"${slotName}"`
                        : surroundWith(this.str, [slotName.start, slotName.end], '"', '"'),
                    ', {'
                ];
                break;
            }
            default: {
                createElementStatement = [
                    `${createElement}("`,
                    [this.node.start + 1, this.node.start + 1 + this.node.name.length],
                    `"${addActions()}, {`
                ];
                break;
            }
        }
        if (this.referencedName) {
            createElementStatement[0] = `const ${this._name} = ` + createElementStatement[0];
        }
        createElementStatement[0] = `{ ${createElementStatement[0]}`;
        return createElementStatement;
    }
    computeStartTagEnd() {
        var _a;
        if ((_a = this.node.children) === null || _a === void 0 ? void 0 : _a.length) {
            return this.node.children[0].start;
        }
        return this.isSelfclosing
            ? this.node.end
            : this.str.original.lastIndexOf('>', this.node.end - 2) + 1;
    }
    computeIsSelfclosing() {
        var _a;
        if (this.str.original[this.node.end - 2] === '/' || voidTags.includes(this.node.name)) {
            return true;
        }
        return (!((_a = this.node.children) === null || _a === void 0 ? void 0 : _a.length) &&
            // Paranoid check because theoretically there could be other void
            // tags in different namespaces other than HTML
            !this.str.original
                .substring(this.node.start, this.node.end)
                .match(new RegExp(`</${this.node.name}\\s*>$`)));
    }
    computeDepth() {
        let idx = 0;
        let parent = this.parent;
        while (parent) {
            parent = parent.parent;
            idx++;
        }
        return idx;
    }
}

/**
 * Handles Svelte components as well as svelte:self and svelte:component
 *
 * Children of this element should call the methods on this class to add themselves to the correct
 * position within the transformation.
 *
 * The transformation result does not have anything to do with HTMLx, it instead uses plan JS,
 * leveraging scoped blocks (`{ ... }`). Each element is transformed to something that is
 * contained in such a block. This ensures we can declare variables inside that do not leak
 * to the outside while preserving TypeScript's control flow.
 *
 * A transformation reads for example like this:
 * ```
 * // before
 * <Comp prop={foo} />
 * // after
 * { const $$_Comp = new Comp({ target: __sveltets_2_any(), props: {"prop": foo,}}); }
 * ```
 */
class InlineComponent {
    get name() {
        if (this.addNameConstDeclaration) {
            this.addNameConstDeclaration();
            this.addNameConstDeclaration = undefined;
        }
        return this._name;
    }
    constructor(str, node, parent) {
        this.str = str;
        this.node = node;
        this.parent = parent;
        this.startTransformation = [];
        this.startEndTransformation = [];
        this.propsTransformation = [];
        this.eventsTransformation = [];
        this.endTransformation = [];
        if (parent) {
            parent.child = this;
        }
        this.isSelfclosing = this.computeIsSelfclosing();
        this.startTagStart = this.node.start;
        this.startTagEnd = this.computeStartTagEnd();
        const tagEnd = this.startTagStart + this.node.name.length + 1;
        // Ensure deleted characters are mapped to the attributes object so we
        // get autocompletion when triggering it on a whitespace.
        if (/\s/.test(str.original.charAt(tagEnd))) {
            this.propsTransformation.push(tagEnd);
            this.propsTransformation.push([tagEnd, tagEnd + 1]);
            // Overwrite necessary or else we get really weird mappings
            this.str.overwrite(tagEnd, tagEnd + 1, '', { contentOnly: true });
        }
        if (this.node.name === 'svelte:self') {
            // TODO try to get better typing here, maybe TS allows us to use the created class
            // even if it's used in the function that is used to create it
            this._name = '$$_svelteself' + this.computeDepth();
            this.startTransformation.push('{ __sveltets_2_createComponentAny({');
            this.addNameConstDeclaration = () => (this.startTransformation[0] = `{ const ${this._name} = __sveltets_2_createComponentAny({`);
            this.startEndTransformation.push('});');
        }
        else {
            const isSvelteComponentTag = this.node.name === 'svelte:component';
            // We don't know if the thing we use to create the Svelte component with
            // is actually a proper Svelte component, which would lead to errors
            // when accessing things like $$prop_def. Therefore widen the type
            // here, falling back to a any-typed component to ensure the user doesn't
            // get weird followup-errors all over the place. The diagnostic error
            // will be on the __sveltets_2_ensureComponent part, giving a more helpful message
            // The name is reversed here so that when the component is undeclared,
            // TypeScript won't suggest the undeclared variable to be a misspelling of the generated variable
            this._name =
                '$$_' +
                    Array.from(sanitizePropName(this.node.name)).reverse().join('') +
                    this.computeDepth();
            const constructorName = this._name + 'C';
            const nodeNameStart = isSvelteComponentTag
                ? this.node.expression.start
                : this.str.original.indexOf(this.node.name, this.node.start);
            const nodeNameEnd = isSvelteComponentTag
                ? this.node.expression.end
                : nodeNameStart + this.node.name.length;
            this.startTransformation.push(`{ const ${constructorName} = __sveltets_2_ensureComponent(`, [nodeNameStart, nodeNameEnd], `); new ${constructorName}({ target: __sveltets_2_any(), props: {`);
            this.addNameConstDeclaration = () => (this.startTransformation[2] = `); const ${this._name} = new ${constructorName}({ target: __sveltets_2_any(), props: {`);
            this.startEndTransformation.push('}});');
        }
    }
    /**
     * prop={foo}  -->  "prop": foo,
     * @param name Property name
     * @param value Attribute value, if present. If not present, this is treated as a shorthand attribute
     */
    addProp(name, value) {
        if (value) {
            this.propsTransformation.push(...name, ':', ...value, ',');
        }
        else {
            this.propsTransformation.push(...name, ',');
        }
    }
    /**
     * on:click={xxx}  -->  $$_Component.$on("click", xxx)
     * @param name Event name
     * @param expression Event handler, if present
     */
    addEvent([nameStart, nameEnd], expression) {
        this.eventsTransformation.push(`${this.name}.$on(`, surroundWith(this.str, [nameStart, nameEnd], '"', '"'), ', ', expression ? expression : '() => {}', ');');
    }
    /**
     * Handle the slot of `<... slot=".." />`
     * @param transformation Slot name transformation
     */
    addSlotName(transformation) {
        this.slotLetsTransformation = this.slotLetsTransformation || [[], []];
        this.slotLetsTransformation[0] = transformation;
    }
    /**
     * Handle the let: of `<... let:xx={yy} />`
     * @param transformation Let transformation
     */
    addSlotLet(transformation) {
        this.slotLetsTransformation = this.slotLetsTransformation || [['default'], []];
        this.slotLetsTransformation[1].push(...transformation, ',');
    }
    /**
     * Add something right after the start tag end.
     */
    appendToStartEnd(value) {
        this.startEndTransformation.push(...value);
    }
    performTransformation() {
        const namedSlotLetTransformation = [];
        const defaultSlotLetTransformation = [];
        if (this.slotLetsTransformation) {
            if (this.slotLetsTransformation[0][0] === 'default') {
                defaultSlotLetTransformation.push(
                // add dummy destructuring parameter because if all parameters are unused,
                // the mapping will be confusing, because TS will highlight the whole destructuring
                `{const {${surroundWithIgnoreComments('$$_$$')},`, ...this.slotLetsTransformation[1], `} = ${this.name}.$$slot_def.default;$$_$$;`);
            }
            else {
                namedSlotLetTransformation.push(
                // See comment above
                `{const {${surroundWithIgnoreComments('$$_$$')},`, ...this.slotLetsTransformation[1], `} = ${this.parent.name}.$$slot_def["`, ...this.slotLetsTransformation[0], '"];$$_$$;');
            }
            this.endTransformation.push('}');
        }
        if (this.isSelfclosing) {
            this.endTransformation.push('}');
            transform(this.str, this.startTagStart, this.startTagEnd, this.startTagEnd, [
                // Named slot transformations go first inside a outer block scope because
                // <Comp let:xx {x} /> means "use the x of let:x", and without a separate
                // block scope this would give a "used before defined" error
                ...namedSlotLetTransformation,
                ...this.startTransformation,
                ...this.propsTransformation,
                ...this.startEndTransformation,
                ...this.eventsTransformation,
                ...defaultSlotLetTransformation,
                ...this.endTransformation
            ]);
        }
        else {
            const endStart = this.str.original
                .substring(this.node.start, this.node.end)
                .lastIndexOf(`</${this.node.name}`) + this.node.start;
            if (!this.node.name.startsWith('svelte:')) {
                // Ensure the end tag is mapped, too. </Component> -> Component}
                this.endTransformation.push([endStart + 2, endStart + this.node.name.length + 2]);
            }
            this.endTransformation.push('}');
            transform(this.str, this.startTagStart, this.startTagEnd, this.startTagEnd, [
                // See comment above why this goes first
                ...namedSlotLetTransformation,
                ...this.startTransformation,
                ...this.propsTransformation,
                ...this.startEndTransformation,
                ...this.eventsTransformation,
                ...defaultSlotLetTransformation
            ]);
            transform(this.str, endStart, this.node.end, this.node.end, this.endTransformation);
        }
    }
    computeStartTagEnd() {
        var _a;
        if ((_a = this.node.children) === null || _a === void 0 ? void 0 : _a.length) {
            return this.node.children[0].start;
        }
        return this.isSelfclosing
            ? this.node.end
            : this.str.original.lastIndexOf('>', this.node.end - 2) + 1;
    }
    computeIsSelfclosing() {
        return this.str.original[this.node.end - 2] === '/';
    }
    computeDepth() {
        let idx = 0;
        let parent = this.parent;
        while (parent) {
            parent = parent.parent;
            idx++;
        }
        return idx;
    }
}

/**
 * List taken from `svelte-jsx.d.ts` by searching for all attributes of type number
 */
const numberOnlyAttributes = new Set([
    'cols',
    'colspan',
    'currenttime',
    'defaultplaybackrate',
    'high',
    'low',
    'marginheight',
    'marginwidth',
    'minlength',
    'maxlength',
    'optimum',
    'rows',
    'rowspan',
    'size',
    'span',
    'start',
    'tabindex',
    'results',
    'volume'
]);
/**
 * Handle various kinds of attributes and make them conform to being valid in context of a object definition
 * - {x}   --->    x
 * - x="{..}"   --->    x:..
 * - lowercase DOM attributes
 * - multi-value handling
 */
function handleAttribute(str, attr, parent, preserveCase, element) {
    if (parent.name === '!DOCTYPE' ||
        ['Style', 'Script'].includes(parent.type) ||
        (attr.name === 'name' && parent.type === 'Slot')) {
        // - <!DOCTYPE html> is already removed by now from MagicString
        // - Don't handle script / style tag attributes (context or lang for example)
        // - name=".." of <slot> tag is already handled in Element
        return;
    }
    if (attr.name === 'slot' &&
        attributeValueIsOfType(attr.value, 'Text') &&
        element.parent instanceof InlineComponent) {
        // - slot=".." in context of slots with let:xx is handled differently
        element.addSlotName([[attr.value[0].start, attr.value[0].end]]);
        return;
    }
    const addAttribute = element instanceof Element
        ? (name, value) => {
            if (attr.name.startsWith('data-') && !attr.name.startsWith('data-sveltekit-')) {
                // any attribute prefixed with data- is valid, but we can't
                // type that statically, so we need this workaround
                name.unshift('...__sveltets_2_empty({');
                if (!value) {
                    value = ['__sveltets_2_any()'];
                }
                value.push('})');
            }
            element.addAttribute(name, value);
        }
        : (name, value) => {
            if (attr.name.startsWith('--') && attr.value !== true) {
                // CSS custom properties are not part of the props
                // definition, so wrap them to not get "--xx is invalid prop" errors
                name.unshift('...__sveltets_2_cssProp({');
                if (!value) {
                    value = ['""'];
                }
                value.push('})');
            }
            element.addProp(name, value);
        };
    /**
     * lowercase the attribute name to make it adhere to our intrinsic elements definition
     */
    const transformAttributeCase = (name) => {
        if (!preserveCase && !svgAttributes.find((x) => x == name)) {
            return name.toLowerCase();
        }
        else {
            return name;
        }
    };
    // Handle attribute name
    const attributeName = [];
    if (attributeValueIsOfType(attr.value, 'AttributeShorthand')) {
        // For the attribute shorthand, the name will be the mapped part
        addAttribute([[attr.value[0].start, attr.value[0].end]]);
        return;
    }
    else {
        let name = element instanceof Element && parent.type === 'Element'
            ? transformAttributeCase(attr.name)
            : attr.name;
        // surround with quotes because dashes or other invalid property characters could be part of the name
        // Overwrite first char with "+char because TS will squiggle the whole "prop" including quotes when something is wrong
        if (name !== attr.name) {
            name = '"' + name;
            str.overwrite(attr.start, attr.start + attr.name.length, name);
        }
        else {
            str.overwrite(attr.start, attr.start + 1, '"' + str.original.charAt(attr.start), {
                contentOnly: true
            });
        }
        attributeName.push([attr.start, attr.start + attr.name.length], '"');
    }
    // Handle attribute value
    const attributeValue = [];
    if (attr.value === true) {
        attributeValue.push('true');
        addAttribute(attributeName, attributeValue);
        return;
    }
    if (attr.value.length == 0) {
        // shouldn't happen
        addAttribute(attributeName, ['""']);
        return;
    }
    //handle single value
    if (attr.value.length == 1) {
        const attrVal = attr.value[0];
        if (attrVal.type == 'Text') {
            // Handle the attr="" special case with a transformation that allows mapping of the position
            if (attrVal.start === attrVal.end) {
                addAttribute(attributeName, [[attrVal.start - 1, attrVal.end + 1]]);
                return;
            }
            const hasBrackets = str.original.lastIndexOf('}', attrVal.end) === attrVal.end - 1 ||
                str.original.lastIndexOf('}"', attrVal.end) === attrVal.end - 1 ||
                str.original.lastIndexOf("}'", attrVal.end) === attrVal.end - 1;
            const needsNumberConversion = !hasBrackets &&
                parent.type === 'Element' &&
                numberOnlyAttributes.has(attr.name.toLowerCase()) &&
                !isNaN(attrVal.data);
            const includesTemplateLiteralQuote = attrVal.data.includes('`');
            const quote = !includesTemplateLiteralQuote
                ? '`'
                : ['"', "'"].includes(str.original[attrVal.start - 1])
                    ? str.original[attrVal.start - 1]
                    : '"';
            if (!needsNumberConversion) {
                attributeValue.push(quote);
            }
            if (includesTemplateLiteralQuote && attrVal.data.split('\n').length > 1) {
                // Multiline attribute value text which can't be wrapped in a template literal
                // -> ensure it's still a valid transformation by transforming the actual line break
                str.overwrite(attrVal.start, attrVal.end, attrVal.data.split('\n').join('\\n'), {
                    contentOnly: true
                });
            }
            attributeValue.push([attrVal.start, attrVal.end]);
            if (!needsNumberConversion) {
                attributeValue.push(quote);
            }
            addAttribute(attributeName, attributeValue);
        }
        else if (attrVal.type == 'MustacheTag') {
            attributeValue.push(rangeWithTrailingPropertyAccess(str.original, attrVal.expression));
            addAttribute(attributeName, attributeValue);
        }
        return;
    }
    // We have multiple attribute values, so we build a template string out of them.
    for (const n of attr.value) {
        if (n.type === 'MustacheTag') {
            str.appendRight(n.start, '$');
        }
    }
    attributeValue.push('`', [attr.value[0].start, attr.value[attr.value.length - 1].end], '`');
    addAttribute(attributeName, attributeValue);
}
function attributeValueIsOfType(value, type) {
    return value !== true && value.length == 1 && value[0].type == type;
}

/**
 * This needs to be called on the way out, not on the way on, when walking,
 * because else the order of moves might get messed up with moves in
 * the children.
 *
 * The await block consists of these blocks:
 *- expression: the promise - has start and end
 *- value: the result of the promise - has start and end
 *- error: the error branch value - has start and end
 *- pending: start/end of the pending block (if exists), with skip boolean
 *- then: start/end of the then block (if exists), with skip boolean
 *- catch: start/end of the catch block (if exists), with skip boolean
 *
 * Implementation note:
 * As soon there's a `then` with a value, we transform that to
 * `{const $$_value = foo; {const foo = await $$_value;..}}` because
 *
 * - `{#await foo then foo}` or `{#await foo}..{:then foo}..` is valid Svelte code
 * - `{#await foo} {bar} {:then bar} {bar} {/await} is valid Svelte code`
 *
 *  Both would throw "variable used before declaration" if we didn't do the
 * transformation this way.
 */
function handleAwait(str, awaitBlock) {
    var _a, _b;
    const transforms = ['{ '];
    if (!awaitBlock.pending.skip) {
        transforms.push([awaitBlock.pending.start, awaitBlock.pending.end]);
    }
    if (awaitBlock.error || !awaitBlock.catch.skip) {
        transforms.push('try { ');
    }
    if (awaitBlock.value) {
        transforms.push('const $$_value = ');
    }
    const expressionEnd = withTrailingPropertyAccess(str.original, awaitBlock.expression.end);
    transforms.push('await (', [awaitBlock.expression.start, expressionEnd], ');');
    if (awaitBlock.value) {
        transforms.push('{ const ', [awaitBlock.value.start, awaitBlock.value.end], ' = $$_value; ');
    }
    if (!awaitBlock.then.skip) {
        if (awaitBlock.pending.skip) {
            transforms.push([awaitBlock.then.start, awaitBlock.then.end]);
        }
        else if ((_a = awaitBlock.then.children) === null || _a === void 0 ? void 0 : _a.length) {
            transforms.push([
                awaitBlock.then.children[0].start,
                awaitBlock.then.children[awaitBlock.then.children.length - 1].end
            ]);
        }
    }
    if (awaitBlock.value) {
        transforms.push('}');
    }
    if (awaitBlock.error || !awaitBlock.catch.skip) {
        transforms.push('} catch($$_e) { ');
        if (awaitBlock.error) {
            transforms.push('const ', [awaitBlock.error.start, awaitBlock.error.end], ' = __sveltets_2_any();');
        }
        if (!awaitBlock.catch.skip && ((_b = awaitBlock.catch.children) === null || _b === void 0 ? void 0 : _b.length)) {
            transforms.push([
                awaitBlock.catch.children[0].start,
                awaitBlock.catch.children[awaitBlock.catch.children.length - 1].end
            ]);
        }
        transforms.push('}');
    }
    transforms.push('}');
    transform(str, awaitBlock.start, awaitBlock.end, awaitBlock.end, transforms);
}

const oneWayBindingAttributes = new Set([
    'clientWidth',
    'clientHeight',
    'offsetWidth',
    'offsetHeight',
    'duration',
    'buffered',
    'seekable',
    'seeking',
    'played',
    'ended'
]);
/**
 * List of all binding names that are transformed to sth like `binding = variable`.
 * This applies to readonly bindings and the this binding.
 */
new Set([...oneWayBindingAttributes.keys(), 'this']);
const supportsBindThis = [
    'InlineComponent',
    'Element',
    'Body',
    'Slot' // only valid for Web Components compile target
];
/**
 * Transform bind:xxx into something that conforms to JS/TS
 */
function handleBinding(str, attr, parent, element, preserveBind) {
    // bind group on input
    if (element instanceof Element && attr.name == 'group' && parent.name == 'input') {
        element.appendToStartEnd([
            rangeWithTrailingPropertyAccess(str.original, attr.expression),
            ';'
        ]);
        return;
    }
    // bind this
    if (attr.name === 'this' && supportsBindThis.includes(parent.type)) {
        // bind:this is effectively only works bottom up - the variable is updated by the element, not
        // the other way round. So we check if the instance is assignable to the variable.
        // Note: If the component unmounts (it's inside an if block, or svelte:component this={null},
        // the value becomes null, but we don't add it to the clause because it would introduce
        // worse DX for the 99% use case, and because null !== undefined which others might use to type the declaration.
        element.appendToStartEnd([
            [attr.expression.start, attr.expression.end],
            ` = ${element.name};`
        ]);
        return;
    }
    // one way binding
    if (oneWayBindingAttributes.has(attr.name) && element instanceof Element) {
        element.appendToStartEnd([
            [attr.expression.start, attr.expression.end],
            `= ${element.name}.${attr.name};`
        ]);
        return;
    }
    // other bindings which are transformed to normal attributes/props
    const isShorthand = attr.expression.start === attr.start + 'bind:'.length;
    const name = preserveBind && element instanceof Element
        ? // HTML typings - preserve the bind: prefix
            isShorthand
                ? [`"${str.original.substring(attr.start, attr.end)}"`]
                : [
                    `"${str.original.substring(attr.start, str.original.lastIndexOf('=', attr.expression.start))}"`
                ]
        : // Other typings - remove the bind: prefix
            isShorthand
                ? [[attr.expression.start, attr.expression.end]]
                : [[attr.start + 'bind:'.length, str.original.lastIndexOf('=', attr.expression.start)]];
    const value = isShorthand
        ? preserveBind && element instanceof Element
            ? [rangeWithTrailingPropertyAccess(str.original, attr.expression)]
            : undefined
        : [rangeWithTrailingPropertyAccess(str.original, attr.expression)];
    if (element instanceof Element) {
        element.addAttribute(name, value);
    }
    else {
        element.addProp(name, value);
    }
}

/**
 * class:xx={yyy}   --->   yyy;
 */
function handleClassDirective(str, attr, element) {
    element.appendToStartEnd([rangeWithTrailingPropertyAccess(str.original, attr.expression), ';']);
}

/**
 * Removes comment altogether as it's unimportant for the output
 */
function handleComment(str, node) {
    str.overwrite(node.start, node.end, '', { contentOnly: true });
}

/**
 * `{@const x = y}` --> `const x = y;`
 *
 * The transformation happens directly in-place. This is more strict than the
 * Svelte compiler because the compiler moves all const declarations to the top.
 * This transformation results in `x used before being defined` errors if someone
 * uses a const variable before declaring it, which arguably is more helpful
 * than what the Svelte compiler does.
 */
function handleConstTag(str, constTag) {
    str.overwrite(constTag.start, constTag.expression.start, 'const ');
    str.overwrite(withTrailingPropertyAccess(str.original, constTag.expression.end), constTag.end, ';');
}

/**
 * {@debug a}		--->   ;a;
 * {@debug a, b}	--->   ;a;b;
 */
function handleDebug(str, debugBlock) {
    let cursor = debugBlock.start;
    for (const identifier of debugBlock.identifiers) {
        str.overwrite(cursor, identifier.start, ';', { contentOnly: true });
        cursor = identifier.end;
    }
    str.overwrite(cursor, debugBlock.end, ';', { contentOnly: true });
}

/**
 * Transform #each into a for-of loop
 *
 * Implementation notes:
 * - If code is
 *   `{#each items as items,i (key)}`
 *   then the transformation is
 *   `{ const $$_each = __sveltets_2_ensureArray(items); for (const items of $$_each) { let i = 0;key;`.
 *   Transform it this way because `{#each items as items}` is valid Svelte code, but the transformation
 *   `for(const items of items){..}` is invalid ("variable used before declaration"). Don't do the transformation
 *   like this everytime because `$$_each` could turn up in the auto completion.
 *
 * - The `ensureArray` method checks that only `ArrayLike` objects are passed to `#each`.
 *   `for (const ..)` wouldn't error in this case because it accepts any kind of iterable.
 *
 * - `{#each true, items as item}` is valid, we need to add braces around that expression, else
 *   `ensureArray` will error that there are more args than expected
 */
function handleEach(str, eachBlock) {
    var _a;
    const startEnd = str.original.indexOf('}', ((_a = eachBlock.key) === null || _a === void 0 ? void 0 : _a.end) || eachBlock.context.end) + 1;
    let transforms;
    // {#each true, [1,2]} is valid but for (const x of true, [1,2]) is not if not wrapped with braces
    const containsComma = str.original
        .substring(eachBlock.expression.start, eachBlock.expression.end)
        .includes(',');
    const arrayAndItemVarTheSame = str.original.substring(eachBlock.expression.start, eachBlock.expression.end) ===
        str.original.substring(eachBlock.context.start, eachBlock.context.end);
    if (arrayAndItemVarTheSame) {
        transforms = [
            `{ const $$_each = __sveltets_2_ensureArray(${containsComma ? '(' : ''}`,
            [eachBlock.expression.start, eachBlock.expression.end],
            `${containsComma ? ')' : ''}); for(let `,
            [eachBlock.context.start, eachBlock.context.end],
            ' of $$_each){'
        ];
    }
    else {
        transforms = [
            'for(let ',
            [eachBlock.context.start, eachBlock.context.end],
            ` of __sveltets_2_ensureArray(${containsComma ? '(' : ''}`,
            [eachBlock.expression.start, eachBlock.expression.end],
            `${containsComma ? ')' : ''})){`
        ];
    }
    if (eachBlock.index) {
        const indexStart = str.original.indexOf(eachBlock.index, eachBlock.context.end);
        const indexEnd = indexStart + eachBlock.index.length;
        transforms.push('let ', [indexStart, indexEnd], ' = 1;');
    }
    if (eachBlock.key) {
        transforms.push([eachBlock.key.start, eachBlock.key.end], ';');
    }
    transform(str, eachBlock.start, startEnd, startEnd, transforms);
    const endEach = str.original.lastIndexOf('{', eachBlock.end - 1);
    // {/each} -> } or {:else} -> }
    if (eachBlock.else) {
        const elseEnd = str.original.lastIndexOf('}', eachBlock.else.start);
        const elseStart = str.original.lastIndexOf('{', elseEnd);
        str.overwrite(elseStart, elseEnd + 1, '}' + (arrayAndItemVarTheSame ? '}' : ''), {
            contentOnly: true
        });
        str.remove(endEach, eachBlock.end);
    }
    else {
        str.overwrite(endEach, eachBlock.end, '}' + (arrayAndItemVarTheSame ? '}' : ''), {
            contentOnly: true
        });
    }
}

/**
 * Transform on:xxx={yyy}
 * - For DOM elements: ---> onxxx: yyy,
 * - For Svelte components/special elements: ---> componentInstance.$on("xxx", yyy)}
 */
function handleEventHandler(str, attr, element) {
    const nameStart = str.original.indexOf(':', attr.start) + 1;
    // If there's no expression, it's event bubbling (on:click)
    const nameEnd = nameStart + attr.name.length;
    if (element instanceof Element) {
        // Prefix with "on:" for better mapping.
        // Surround with quotes because event name could contain invalid prop chars.
        surroundWith(str, [nameStart, nameEnd], '"on:', '"');
        element.addAttribute([[nameStart, nameEnd]], attr.expression
            ? [rangeWithTrailingPropertyAccess(str.original, attr.expression)]
            : ['undefined']);
    }
    else {
        element.addEvent([nameStart, nameEnd], attr.expression
            ? rangeWithTrailingPropertyAccess(str.original, attr.expression)
            : undefined);
    }
}

/**
 * Transforms #if and :else if to a regular if control block.
 */
function handleIf(str, ifBlock) {
    if (ifBlock.elseif) {
        // {:else if expr}  -->  } else if(expr) {
        const start = str.original.lastIndexOf('{', ifBlock.expression.start);
        str.overwrite(start, ifBlock.expression.start, '} else if (');
    }
    else {
        // {#if expr}  -->  if (expr){
        str.overwrite(ifBlock.start, ifBlock.expression.start, 'if(');
    }
    const expressionEnd = withTrailingPropertyAccess(str.original, ifBlock.expression.end);
    const end = str.original.indexOf('}', expressionEnd);
    str.overwrite(expressionEnd, end + 1, '){');
    // {/if} -> }
    const endif = str.original.lastIndexOf('{', ifBlock.end - 1);
    str.overwrite(endif, ifBlock.end, '}');
}
/**
 * {:else}   --->   } else {
 */
function handleElse(str, elseBlock, parent) {
    if (parent.type !== 'IfBlock') {
        // This is the else branch of an #each block which is handled elsewhere
        return;
    }
    const elseEnd = str.original.lastIndexOf('}', elseBlock.start);
    const elseword = str.original.lastIndexOf(':else', elseEnd);
    const elseStart = str.original.lastIndexOf('{', elseword);
    str.overwrite(elseStart, elseStart + 1, '}');
    str.overwrite(elseEnd, elseEnd + 1, '{');
    const colon = str.original.indexOf(':', elseword);
    str.remove(colon, colon + 1);
}

/**
 * {#key expr}content{/key}   --->   expr; content
 */
function handleKey(str, keyBlock) {
    // {#key expr}   ->   expr;
    str.overwrite(keyBlock.start, keyBlock.expression.start, '', { contentOnly: true });
    const expressionEnd = withTrailingPropertyAccess(str.original, keyBlock.expression.end);
    const end = str.original.indexOf('}', expressionEnd);
    str.overwrite(expressionEnd, end + 1, '; ');
    // {/key}   ->
    const endKey = str.original.lastIndexOf('{', keyBlock.end - 1);
    str.overwrite(endKey, keyBlock.end, '', { contentOnly: true });
}

/**
 * `let:foo={bar}`  -->  `foo:bar`, which becomes `const {foo:bar} = $$_parent.$$slotDef['slotName'];`
 * @param node
 * @param element
 */
function handleLet(str, node, parent, preserveCase, element) {
    if (element instanceof InlineComponent) {
        // let:xx belongs to either the default slot or a named slot,
        // which is determined in Attribute.ts
        addSlotLet(node, element);
    }
    else {
        if (element.parent instanceof InlineComponent) {
            // let:xx is on a HTML element and belongs to a (named slot of a parent component
            addSlotLet(node, element);
        }
        else {
            // let:xx is a regular HTML attribute (probably a mistake by the user)
            handleAttribute(str, {
                start: node.start,
                end: node.end,
                type: 'Attribute',
                name: 'let:' + node.name,
                value: node.expression
                    ? [
                        {
                            type: 'MustacheTag',
                            start: node.expression.start,
                            end: node.expression.end,
                            expression: node.expression
                        }
                    ]
                    : true
            }, parent, preserveCase, element);
        }
    }
}
function addSlotLet(node, element) {
    const letTransformation = [
        [node.start + 'let:'.length, node.start + 'let:'.length + node.name.length]
    ];
    if (node.expression) {
        letTransformation.push(':', [node.expression.start, node.expression.end]);
    }
    element.addSlotLet(letTransformation);
}

/**
 * Handle mustache tags that are not part of attributes
 * {a}  -->  a;
 */
function handleMustacheTag(str, node, parent) {
    if (parent.type === 'Attribute' || parent.type === 'StyleDirective') {
        // handled inside Attribute.ts / StyleDirective.ts
        return;
    }
    str.overwrite(node.start, node.start + 1, '', { contentOnly: true });
    str.overwrite(node.end - 1, node.end, ';', { contentOnly: true });
}

/**
 * {@html ...}   --->   ...;
 */
function handleRawHtml(str, node) {
    str.overwrite(node.start, node.expression.start, ' ');
    str.overwrite(withTrailingPropertyAccess(str.original, node.expression.end), node.end, ';');
}

/**
 * Handle spreaded attributes/props on elements/components by removing the braces.
 * That way they can be added as a regular object spread.
 * `{...xx}` -> `...x`
 */
function handleSpread(node, element) {
    const transformation = [[node.start + 1, node.end - 1]];
    if (element instanceof Element) {
        element.addAttribute(transformation);
    }
    else {
        element.addProp(transformation);
    }
}

/**
 * style:xx         --->  __sveltets_2_ensureType(String, Number, xx);
 * style:xx={yy}    --->  __sveltets_2_ensureType(String, Number, yy);
 * style:xx="yy"    --->  __sveltets_2_ensureType(String, Number, "yy");
 * style:xx="a{b}"  --->  __sveltets_2_ensureType(String, Number, `a${b}`);
 */
function handleStyleDirective(str, style, element) {
    const htmlx = str.original;
    const ensureType = '__sveltets_2_ensureType(String, Number, ';
    if (style.value === true || style.value.length === 0) {
        element.appendToStartEnd([
            ensureType,
            [htmlx.indexOf(':', style.start) + 1, style.end],
            ');'
        ]);
        return;
    }
    if (style.value.length > 1) {
        // We have multiple attribute values, so we build a template string out of them.
        for (const n of style.value) {
            if (n.type === 'MustacheTag') {
                str.appendRight(n.start, '$');
            }
        }
        element.appendToStartEnd([
            ensureType + '`',
            [style.value[0].start, style.value[style.value.length - 1].end],
            '`);'
        ]);
        return;
    }
    const styleVal = style.value[0];
    if (styleVal.type === 'Text') {
        const quote = ['"', "'"].includes(str.original[styleVal.start - 1])
            ? str.original[styleVal.start - 1]
            : '"';
        element.appendToStartEnd([
            `${ensureType}${quote}`,
            [styleVal.start, styleVal.end],
            `${quote});`
        ]);
    }
    else {
        // MustacheTag
        element.appendToStartEnd([ensureType, [styleVal.start + 1, styleVal.end - 1], ');']);
    }
}

/**
 * Handles a text node transformation.
 * Removes everything except whitespace (for better visual output) when it's normal HTML text for example inside an element
 * to not clutter up the output. For attributes it leaves the text as is.
 */
function handleText(str, node, parent) {
    if (!node.data || parent.type === 'Attribute') {
        return;
    }
    let replacement = node.data.replace(/\S/g, '');
    if (!replacement && node.data.length) {
        // minimum of 1 whitespace which ensure hover or other things don't give weird results
        // where for example you hover over a text and get a hover info about the containing tag.
        replacement = ' ';
    }
    str.overwrite(node.start, node.end, replacement, {
        contentOnly: true
    });
}

/**
 * transition|modifier:xxx(yyy)   --->   __sveltets_2_ensureTransition(xxx(svelte.mapElementTag('..'),(yyy)));
 */
function handleTransitionDirective(str, attr, element) {
    const transformations = [
        '__sveltets_2_ensureTransition(',
        getDirectiveNameStartEndIdx(str, attr),
        `(${element.typingsNamespace}.mapElementTag('${element.tagName}')`
    ];
    if (attr.expression) {
        transformations.push(',(', rangeWithTrailingPropertyAccess(str.original, attr.expression), ')');
    }
    transformations.push('));');
    element.appendToStartEnd(transformations);
}

function stripDoctype(str) {
    const regex = /<!doctype(.+?)>(\n)?/i;
    const result = regex.exec(str.original);
    if (result) {
        str.remove(result.index, result.index + result[0].length);
    }
}
/**
 * Walks the HTMLx part of the Svelte component
 * and converts it to JSX
 */
function convertHtmlxToJsx(str, ast, onWalk = null, onLeave = null, options = {}) {
    str.original;
    options = { preserveAttributeCase: false, ...options };
    options.typingsNamespace = options.typingsNamespace || 'svelteHTML';
    stripDoctype(str);
    let element;
    compiler.walk(ast, {
        enter: (node, parent, prop, index) => {
            try {
                switch (node.type) {
                    case 'IfBlock':
                        handleIf(str, node);
                        break;
                    case 'EachBlock':
                        handleEach(str, node);
                        break;
                    case 'ElseBlock':
                        handleElse(str, node, parent);
                        break;
                    case 'KeyBlock':
                        handleKey(str, node);
                        break;
                    case 'MustacheTag':
                        handleMustacheTag(str, node, parent);
                        break;
                    case 'RawMustacheTag':
                        handleRawHtml(str, node);
                        break;
                    case 'DebugTag':
                        handleDebug(str, node);
                        break;
                    case 'ConstTag':
                        handleConstTag(str, node);
                        break;
                    case 'InlineComponent':
                        if (element) {
                            element.child = new InlineComponent(str, node, element);
                            element = element.child;
                        }
                        else {
                            element = new InlineComponent(str, node);
                        }
                        break;
                    case 'Element':
                    case 'Options':
                    case 'Window':
                    case 'Head':
                    case 'Title':
                    case 'Body':
                    case 'Slot':
                    case 'SlotTemplate':
                        if (node.name !== '!DOCTYPE') {
                            if (element) {
                                element.child = new Element(str, node, options.typingsNamespace, element);
                                element = element.child;
                            }
                            else {
                                element = new Element(str, node, options.typingsNamespace);
                            }
                        }
                        break;
                    case 'Comment':
                        handleComment(str, node);
                        break;
                    case 'Binding':
                        handleBinding(str, node, parent, element, options.typingsNamespace === 'svelteHTML');
                        break;
                    case 'Class':
                        handleClassDirective(str, node, element);
                        break;
                    case 'StyleDirective':
                        handleStyleDirective(str, node, element);
                        break;
                    case 'Action':
                        handleActionDirective(node, element);
                        break;
                    case 'Transition':
                        handleTransitionDirective(str, node, element);
                        break;
                    case 'Animation':
                        handleAnimateDirective(str, node, element);
                        break;
                    case 'Attribute':
                        handleAttribute(str, node, parent, options.preserveAttributeCase, element);
                        break;
                    case 'Spread':
                        handleSpread(node, element);
                        break;
                    case 'EventHandler':
                        handleEventHandler(str, node, element);
                        break;
                    case 'Let':
                        handleLet(str, node, parent, options.preserveAttributeCase, element);
                        break;
                    case 'Text':
                        handleText(str, node, parent);
                        break;
                }
                if (onWalk) {
                    onWalk(node, parent, prop, index);
                }
            }
            catch (e) {
                console.error('Error walking node ', node, e);
                throw e;
            }
        },
        leave: (node, parent, prop, index) => {
            try {
                switch (node.type) {
                    case 'IfBlock':
                        break;
                    case 'EachBlock':
                        break;
                    case 'AwaitBlock':
                        handleAwait(str, node);
                        break;
                    case 'InlineComponent':
                    case 'Element':
                    case 'Options':
                    case 'Window':
                    case 'Head':
                    case 'Title':
                    case 'Body':
                    case 'Slot':
                    case 'SlotTemplate':
                        if (node.name !== '!DOCTYPE') {
                            element.performTransformation();
                            element = element.parent;
                        }
                        break;
                }
                if (onLeave) {
                    onLeave(node, parent, prop, index);
                }
            }
            catch (e) {
                console.error('Error leaving node ', node);
                throw e;
            }
        }
    });
}

/**
 * Add this tag to a HTML comment in a Svelte component and its contents will
 * be added as a docstring in the resulting JSX for the component class.
 */
const COMPONENT_DOCUMENTATION_HTML_COMMENT_TAG = '@component';
class ComponentDocumentation {
    constructor() {
        this.componentDocumentation = '';
        this.handleComment = (node) => {
            if ('data' in node &&
                typeof node.data === 'string' &&
                node.data.includes(COMPONENT_DOCUMENTATION_HTML_COMMENT_TAG)) {
                this.componentDocumentation = node.data
                    .replace(COMPONENT_DOCUMENTATION_HTML_COMMENT_TAG, '')
                    .trim();
            }
        };
    }
    getFormatted() {
        if (!this.componentDocumentation) {
            return '';
        }
        if (!this.componentDocumentation.includes('\n')) {
            return `/** ${this.componentDocumentation} */\n`;
        }
        const lines = dedent__default['default'](this.componentDocumentation)
            .split('\n')
            .map((line) => ` *${line ? ` ${line}` : ''}`)
            .join('\n');
        return `/**\n${lines}\n */\n`;
    }
}

function isInterfaceOrTypeDeclaration(node) {
    return ts__default['default'].isTypeAliasDeclaration(node) || ts__default['default'].isInterfaceDeclaration(node);
}
function findExportKeyword(node) {
    var _a;
    return (_a = node.modifiers) === null || _a === void 0 ? void 0 : _a.find((x) => x.kind == ts__default['default'].SyntaxKind.ExportKeyword);
}
/**
 * Node is like `bla = ...` or `{bla} = ...` or `[bla] = ...`
 */
function isAssignmentBinaryExpr(node) {
    return (ts__default['default'].isBinaryExpression(node) &&
        node.operatorToken.kind == ts__default['default'].SyntaxKind.EqualsToken &&
        (ts__default['default'].isIdentifier(node.left) ||
            ts__default['default'].isObjectLiteralExpression(node.left) ||
            ts__default['default'].isArrayLiteralExpression(node.left)));
}
/**
 * Returns if node is like `$: bla = ...` or `$: ({bla} = ...)` or `$: [bla] = ...=`
 */
function getBinaryAssignmentExpr(node) {
    if (ts__default['default'].isExpressionStatement(node.statement)) {
        if (isAssignmentBinaryExpr(node.statement.expression)) {
            return node.statement.expression;
        }
        if (ts__default['default'].isParenthesizedExpression(node.statement.expression) &&
            isAssignmentBinaryExpr(node.statement.expression.expression)) {
            return node.statement.expression.expression;
        }
    }
}
/**
 * Returns true if node is like `({bla} ..)` or `([bla] ...)`
 */
function isParenthesizedObjectOrArrayLiteralExpression(node) {
    return (ts__default['default'].isParenthesizedExpression(node) &&
        ts__default['default'].isBinaryExpression(node.expression) &&
        (ts__default['default'].isObjectLiteralExpression(node.expression.left) ||
            ts__default['default'].isArrayLiteralExpression(node.expression.left)));
}
/**
 *
 * Adapted from https://github.com/Rich-Harris/periscopic/blob/d7a820b04e1f88b452313ab3e54771b352f0defb/src/index.ts#L150
 */
function extractIdentifiers(node, identifiers = []) {
    if (ts__default['default'].isIdentifier(node)) {
        identifiers.push(node);
    }
    else if (ts__default['default'].isBindingElement(node)) {
        extractIdentifiers(node.name, identifiers);
    }
    else if (isMember(node)) {
        let object = node;
        while (isMember(object)) {
            object = object.expression;
        }
        if (ts__default['default'].isIdentifier(object)) {
            identifiers.push(object);
        }
    }
    else if (ts__default['default'].isArrayBindingPattern(node) || ts__default['default'].isObjectBindingPattern(node)) {
        node.elements.forEach((element) => {
            extractIdentifiers(element, identifiers);
        });
    }
    else if (ts__default['default'].isObjectLiteralExpression(node)) {
        node.properties.forEach((child) => {
            if (ts__default['default'].isSpreadAssignment(child)) {
                extractIdentifiers(child.expression, identifiers);
            }
            else if (ts__default['default'].isShorthandPropertyAssignment(child)) {
                // in ts Ast { a = 1 } and { a } are both ShorthandPropertyAssignment
                extractIdentifiers(child.name, identifiers);
            }
            else if (ts__default['default'].isPropertyAssignment(child)) {
                // { a: b }
                extractIdentifiers(child.initializer, identifiers);
            }
        });
    }
    else if (ts__default['default'].isArrayLiteralExpression(node)) {
        node.elements.forEach((element) => {
            if (ts__default['default'].isSpreadElement(element)) {
                extractIdentifiers(element, identifiers);
            }
            else {
                extractIdentifiers(element, identifiers);
            }
        });
    }
    else if (ts__default['default'].isBinaryExpression(node)) {
        extractIdentifiers(node.left, identifiers);
    }
    return identifiers;
}
function isMember(node) {
    return ts__default['default'].isElementAccessExpression(node) || ts__default['default'].isPropertyAccessExpression(node);
}
/**
 * Returns variable at given level with given name,
 * if it is a variable declaration in the form of `const/let a = ..`
 */
function getVariableAtTopLevel(node, identifierName) {
    for (const child of node.statements) {
        if (ts__default['default'].isVariableStatement(child)) {
            const variable = child.declarationList.declarations.find((declaration) => ts__default['default'].isIdentifier(declaration.name) && declaration.name.text === identifierName);
            if (variable) {
                return variable;
            }
        }
    }
}
/**
 * Get the leading multiline trivia doc of the node.
 */
function getLastLeadingDoc(node) {
    var _a;
    const nodeText = node.getFullText();
    const comments = (_a = ts__default['default']
        .getLeadingCommentRanges(nodeText, 0)) === null || _a === void 0 ? void 0 : _a.filter((c) => c.kind === ts__default['default'].SyntaxKind.MultiLineCommentTrivia);
    const comment = comments === null || comments === void 0 ? void 0 : comments[(comments === null || comments === void 0 ? void 0 : comments.length) - 1];
    if (comment) {
        let commentText = nodeText.substring(comment.pos, comment.end);
        const typedefTags = ts__default['default'].getAllJSDocTagsOfKind(node, ts__default['default'].SyntaxKind.JSDocTypedefTag);
        typedefTags
            .filter((tag) => tag.pos >= comment.pos)
            .map((tag) => nodeText.substring(tag.pos, tag.end))
            .forEach((comment) => {
            commentText = commentText.replace(comment, '');
        });
        return commentText;
    }
}
/**
 * Returns true if given identifier is not the property name of an aliased import.
 * In other words: It is not `a` in `import {a as b} from ..`
 */
function isNotPropertyNameOfImport(identifier) {
    return (!ts__default['default'].isImportSpecifier(identifier.parent) || identifier.parent.propertyName !== identifier);
}
/**
 * Extract the variable names that are assigned to out of a labeled statement.
 */
function getNamesFromLabeledStatement(node) {
    var _a;
    const leftHandSide = (_a = getBinaryAssignmentExpr(node)) === null || _a === void 0 ? void 0 : _a.left;
    if (!leftHandSide) {
        return [];
    }
    return (extractIdentifiers(leftHandSide)
        .map((id) => id.text)
        // svelte won't let you create a variable with $ prefix (reserved for stores)
        .filter((name) => !name.startsWith('$')));
}

function is$$EventsDeclaration(node) {
    return isInterfaceOrTypeDeclaration(node) && node.name.text === '$$Events';
}
/**
 * This class accumulates all events that are dispatched from the component.
 * It also tracks bubbled/forwarded events.
 *
 * It can not track events which are not fired through a variable
 * which was not instantiated within the component with `createEventDispatcher`.
 * This means that event dispatchers which are defined outside of the component and then imported do not get picked up.
 *
 * The logic is as follows:
 * - If there exists a ComponentEvents interface definition, use that and skip the rest
 * - Else first try to find the `createEventDispatcher` import
 * - If it exists, try to find the variables where `createEventDispatcher()` is assigned to
 * - For each variable found, try to find out if it's typed.
 *   - If yes, extract the event names and the event types from it
 *   - If no, track all invocations of it to get the event names
 */
class ComponentEvents {
    get eventsClass() {
        return this.componentEventsInterface.isPresent()
            ? this.componentEventsInterface
            : this.componentEventsFromEventsMap;
    }
    constructor(eventHandler, strictEvents, str) {
        this.strictEvents = strictEvents;
        this.str = str;
        this.componentEventsInterface = new ComponentEventsFromInterface();
        this.componentEventsFromEventsMap = new ComponentEventsFromEventsMap(eventHandler);
    }
    /**
     * Collect state and create the API which will be part
     * of the return object of the `svelte2tsx` function.
     */
    createAPI() {
        const entries = [];
        const iterableEntries = this.eventsClass.events.entries();
        for (const entry of iterableEntries) {
            entries.push({ name: entry[0], ...entry[1] });
        }
        return {
            getAll() {
                return entries;
            }
        };
    }
    toDefString() {
        return this.eventsClass.toDefString();
    }
    setComponentEventsInterface(node, astOffset) {
        this.componentEventsInterface.setComponentEventsInterface(node, this.str, astOffset);
    }
    hasStrictEvents() {
        return this.componentEventsInterface.isPresent() || this.strictEvents;
    }
    checkIfImportIsEventDispatcher(node) {
        this.componentEventsFromEventsMap.checkIfImportIsEventDispatcher(node);
        this.componentEventsInterface.checkIfImportIsEventDispatcher(node);
    }
    checkIfIsStringLiteralDeclaration(node) {
        this.componentEventsFromEventsMap.checkIfIsStringLiteralDeclaration(node);
    }
    checkIfDeclarationInstantiatedEventDispatcher(node) {
        this.componentEventsFromEventsMap.checkIfDeclarationInstantiatedEventDispatcher(node);
        this.componentEventsInterface.checkIfDeclarationInstantiatedEventDispatcher(node);
    }
    checkIfCallExpressionIsDispatch(node) {
        this.componentEventsFromEventsMap.checkIfCallExpressionIsDispatch(node);
    }
}
class ComponentEventsFromInterface {
    constructor() {
        this.events = new Map();
        this.eventDispatcherImport = '';
    }
    setComponentEventsInterface(node, str, astOffset) {
        this.str = str;
        this.astOffset = astOffset;
        this.events = this.extractEvents(node);
    }
    checkIfImportIsEventDispatcher(node) {
        if (this.eventDispatcherImport) {
            return;
        }
        this.eventDispatcherImport = checkIfImportIsEventDispatcher(node);
    }
    checkIfDeclarationInstantiatedEventDispatcher(node) {
        if (!this.isPresent()) {
            return;
        }
        const result = checkIfDeclarationInstantiatedEventDispatcher(node, this.eventDispatcherImport);
        if (!result) {
            return;
        }
        const { dispatcherTyping, dispatcherCreationExpr } = result;
        if (!dispatcherTyping) {
            this.str.prependLeft(dispatcherCreationExpr.expression.getEnd() + this.astOffset, '<__sveltets_1_CustomEvents<$$Events>>');
        }
    }
    toDefString() {
        return this.isPresent() ? '{} as unknown as $$Events' : undefined;
    }
    isPresent() {
        return !!this.str;
    }
    extractEvents(node) {
        const map = new Map();
        if (ts__default['default'].isInterfaceDeclaration(node)) {
            this.extractProperties(node.members, map);
        }
        else {
            if (ts__default['default'].isTypeLiteralNode(node.type)) {
                this.extractProperties(node.type.members, map);
            }
            else if (ts__default['default'].isIntersectionTypeNode(node.type)) {
                node.type.types.forEach((type) => {
                    if (ts__default['default'].isTypeLiteralNode(type)) {
                        this.extractProperties(type.members, map);
                    }
                });
            }
        }
        return map;
    }
    extractProperties(members, map) {
        members.filter(ts__default['default'].isPropertySignature).forEach((member) => {
            var _a;
            map.set(getName(member.name), {
                type: ((_a = member.type) === null || _a === void 0 ? void 0 : _a.getText()) || 'Event',
                doc: getDoc(member)
            });
        });
    }
}
class ComponentEventsFromEventsMap {
    constructor(eventHandler) {
        this.eventHandler = eventHandler;
        this.events = new Map();
        this.dispatchedEvents = new Set();
        this.stringVars = new Map();
        this.eventDispatcherImport = '';
        this.eventDispatchers = [];
        this.events = this.extractEvents(eventHandler);
    }
    checkIfImportIsEventDispatcher(node) {
        if (this.eventDispatcherImport) {
            return;
        }
        this.eventDispatcherImport = checkIfImportIsEventDispatcher(node);
    }
    checkIfIsStringLiteralDeclaration(node) {
        if (ts__default['default'].isIdentifier(node.name) &&
            node.initializer &&
            ts__default['default'].isStringLiteral(node.initializer)) {
            this.stringVars.set(node.name.text, node.initializer.text);
        }
    }
    checkIfDeclarationInstantiatedEventDispatcher(node) {
        const result = checkIfDeclarationInstantiatedEventDispatcher(node, this.eventDispatcherImport);
        if (!result) {
            return;
        }
        const { dispatcherTyping, dispatcherName } = result;
        if (dispatcherTyping && ts__default['default'].isTypeLiteralNode(dispatcherTyping)) {
            this.eventDispatchers.push({
                name: dispatcherName,
                typing: dispatcherTyping.getText()
            });
            dispatcherTyping.members.filter(ts__default['default'].isPropertySignature).forEach((member) => {
                var _a;
                this.addToEvents(getName(member.name), {
                    type: `CustomEvent<${((_a = member.type) === null || _a === void 0 ? void 0 : _a.getText()) || 'any'}>`,
                    doc: getDoc(member)
                });
            });
        }
        else {
            this.eventDispatchers.push({ name: dispatcherName });
            this.eventHandler
                .getDispatchedEventsForIdentifier(dispatcherName)
                .forEach((evtName) => {
                this.addToEvents(evtName);
                this.dispatchedEvents.add(evtName);
            });
        }
    }
    checkIfCallExpressionIsDispatch(node) {
        if (this.eventDispatchers.some((dispatcher) => !dispatcher.typing &&
            ts__default['default'].isIdentifier(node.expression) &&
            node.expression.text === dispatcher.name)) {
            const firstArg = node.arguments[0];
            if (ts__default['default'].isStringLiteral(firstArg)) {
                this.addToEvents(firstArg.text);
                this.dispatchedEvents.add(firstArg.text);
            }
            else if (ts__default['default'].isIdentifier(firstArg)) {
                const str = this.stringVars.get(firstArg.text);
                if (str) {
                    this.addToEvents(str);
                    this.dispatchedEvents.add(str);
                }
            }
        }
    }
    addToEvents(eventName, info = { type: 'CustomEvent<any>' }) {
        if (this.events.has(eventName)) {
            // If there are multiple definitions, merge them by falling back to any-typing
            this.events.set(eventName, { type: 'CustomEvent<any>' });
            this.dispatchedEvents.add(eventName);
        }
        else {
            this.events.set(eventName, info);
        }
    }
    toDefString() {
        return ('{' +
            [
                ...this.eventDispatchers
                    .map((dispatcher) => dispatcher.typing &&
                    `...__sveltets_1_toEventTypings<${dispatcher.typing}>()`)
                    .filter((str) => !!str),
                ...this.eventHandler.bubbledEventsAsStrings(),
                ...[...this.dispatchedEvents.keys()].map((e) => `'${e}': __sveltets_1_customEvent`)
            ].join(', ') +
            '}');
    }
    extractEvents(eventHandler) {
        const map = new Map();
        for (const name of eventHandler.getBubbledEvents().keys()) {
            map.set(name, { type: 'Event' });
        }
        return map;
    }
}
function getName(prop) {
    if (ts__default['default'].isIdentifier(prop) || ts__default['default'].isStringLiteral(prop)) {
        return prop.text;
    }
    if (ts__default['default'].isComputedPropertyName(prop)) {
        if (ts__default['default'].isIdentifier(prop.expression)) {
            const identifierName = prop.expression.text;
            const identifierValue = getIdentifierValue(prop, identifierName);
            if (!identifierValue) {
                throwError$1(prop);
            }
            return identifierValue;
        }
    }
    throwError$1(prop);
}
function getIdentifierValue(prop, identifierName) {
    const variable = getVariableAtTopLevel(prop.getSourceFile(), identifierName);
    if (variable && ts__default['default'].isStringLiteral(variable.initializer)) {
        return variable.initializer.text;
    }
}
function throwError$1(prop) {
    const error = new Error('The ComponentEvents interface can only have properties of type ' +
        'Identifier, StringLiteral or ComputedPropertyName. ' +
        'In case of ComputedPropertyName, ' +
        'it must be a const declared within the component and initialized with a string.');
    error.start = toLineColumn(prop.getStart());
    error.end = toLineColumn(prop.getEnd());
    throw error;
    function toLineColumn(pos) {
        const lineChar = prop.getSourceFile().getLineAndCharacterOfPosition(pos);
        return {
            line: lineChar.line + 1,
            column: lineChar.character
        };
    }
}
function getDoc(member) {
    let doc = undefined;
    const comment = getLastLeadingDoc(member);
    if (comment) {
        doc = comment
            .split('\n')
            .map((line) => 
        // Remove /** */
        line
            .replace(/\s*\/\*\*/, '')
            .replace(/\s*\*\//, '')
            .replace(/\s*\*/, '')
            .trim())
            .join('\n');
    }
    return doc;
}
function checkIfImportIsEventDispatcher(node) {
    var _a;
    if (ts__default['default'].isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text !== 'svelte') {
        return;
    }
    const namedImports = (_a = node.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings;
    if (namedImports && ts__default['default'].isNamedImports(namedImports)) {
        const eventDispatcherImport = namedImports.elements.find(
        // If it's an aliased import, propertyName is set
        (el) => (el.propertyName || el.name).text === 'createEventDispatcher');
        if (eventDispatcherImport) {
            return eventDispatcherImport.name.text;
        }
    }
}
function checkIfDeclarationInstantiatedEventDispatcher(node, eventDispatcherImport) {
    var _a;
    if (!ts__default['default'].isIdentifier(node.name) || !node.initializer) {
        return;
    }
    if (ts__default['default'].isCallExpression(node.initializer) &&
        ts__default['default'].isIdentifier(node.initializer.expression) &&
        node.initializer.expression.text === eventDispatcherImport) {
        const dispatcherName = node.name.text;
        const dispatcherTyping = (_a = node.initializer.typeArguments) === null || _a === void 0 ? void 0 : _a[0];
        return {
            dispatcherName,
            dispatcherTyping,
            dispatcherCreationExpr: node.initializer
        };
    }
}

class EventHandler {
    constructor() {
        this.bubbledEvents = new Map();
        this.callees = [];
    }
    handleEventHandler(node, parent) {
        const eventName = node.name;
        // pass-through/ bubble
        if (!node.expression) {
            if (parent.type === 'InlineComponent') {
                if (parent.name !== 'svelte:self') {
                    this.handleEventHandlerBubble(parent, eventName);
                }
                return;
            }
            this.bubbledEvents.set(eventName, getEventDefExpressionForNonComponent(eventName, parent));
        }
    }
    handleIdentifier(node, parent, prop) {
        if (prop === 'callee') {
            this.callees.push({ name: node.name, parent });
        }
    }
    getBubbledEvents() {
        return this.bubbledEvents;
    }
    getDispatchedEventsForIdentifier(name) {
        const eventNames = new Set();
        this.callees.forEach((callee) => {
            if (callee.name === name) {
                const [name] = callee.parent.arguments;
                if (name.value !== undefined) {
                    eventNames.add(name.value);
                }
            }
        });
        return eventNames;
    }
    bubbledEventsAsStrings() {
        return Array.from(this.bubbledEvents.entries()).map(eventMapEntryToString);
    }
    handleEventHandlerBubble(parent, eventName) {
        const componentEventDef = `__sveltets_1_instanceOf(${parent.name})`;
        const exp = `__sveltets_1_bubbleEventDef(${componentEventDef}.$$events_def, '${eventName}')`;
        const exist = this.bubbledEvents.get(eventName);
        this.bubbledEvents.set(eventName, exist ? [].concat(exist, exp) : exp);
    }
}
function getEventDefExpressionForNonComponent(eventName, ele) {
    switch (ele.type) {
        case 'Element':
            return `__sveltets_1_mapElementEvent('${eventName}')`;
        case 'Body':
            return `__sveltets_1_mapBodyEvent('${eventName}')`;
        case 'Window':
            return `__sveltets_1_mapWindowEvent('${eventName}')`;
    }
}
function eventMapEntryToString([eventName, expression]) {
    return `'${eventName}':${Array.isArray(expression) ? `__sveltets_1_unionType(${expression.join(',')})` : expression}`;
}

/**
 * Prepends a string at the given index in a way that the source map maps the appended string
 * to the given character, not the previous character (as MagicString's other methods would).
 */
function preprendStr(str, index, toAppend, removeExisting) {
    const prepends = updatePrepends(str, index, toAppend, removeExisting);
    toAppend = prepends.join('');
    str.overwrite(index, index + 1, toAppend + str.original.charAt(index), { contentOnly: true });
    return str;
}
/**
 * Overwrites a string at the given range but also keeps the other preprends from `prependStr`
 * if not explicitly told otherwise.
 */
function overwriteStr(str, start, end, toOverwrite, removeExisting) {
    const prepends = updatePrepends(str, start, toOverwrite, removeExisting);
    toOverwrite = prepends.join('');
    str.overwrite(start, end, toOverwrite, { contentOnly: true });
    return str;
}
function updatePrepends(str, index, toAppend, removeExisting) {
    str.__prepends__ = str.__prepends__ || new Map();
    const prepends = removeExisting ? [] : str.__prepends__.get(index) || [];
    prepends.push(toAppend);
    str.__prepends__.set(index, prepends);
    return prepends;
}

function is$$PropsDeclaration(node) {
    return isInterfaceOrTypeDeclaration(node) && node.name.text === '$$Props';
}
class ExportedNames {
    constructor(str, astOffset) {
        this.str = str;
        this.astOffset = astOffset;
        this.uses$$Props = false;
        this.exports = new Map();
        this.possibleExports = new Map();
        this.doneDeclarationTransformation = new Set();
        this.getters = new Set();
    }
    handleVariableStatement(node, parent) {
        const exportModifier = findExportKeyword(node);
        if (exportModifier) {
            const isLet = node.declarationList.flags === ts__default['default'].NodeFlags.Let;
            const isConst = node.declarationList.flags === ts__default['default'].NodeFlags.Const;
            this.handleExportedVariableDeclarationList(node.declarationList, (_, ...args) => this.addExport(...args));
            if (isLet) {
                this.propTypeAssertToUserDefined(node.declarationList);
            }
            else if (isConst) {
                node.declarationList.forEachChild((n) => {
                    if (ts__default['default'].isVariableDeclaration(n) && ts__default['default'].isIdentifier(n.name)) {
                        this.addGetter(n.name);
                    }
                });
            }
            this.removeExport(exportModifier.getStart(), exportModifier.end);
        }
        else if (ts__default['default'].isSourceFile(parent)) {
            this.handleExportedVariableDeclarationList(node.declarationList, this.addPossibleExport.bind(this));
        }
    }
    handleExportFunctionOrClass(node) {
        const exportModifier = findExportKeyword(node);
        if (!exportModifier) {
            return;
        }
        this.removeExport(exportModifier.getStart(), exportModifier.end);
        this.addGetter(node.name);
        // Can't export default here
        if (node.name) {
            this.addExport(node.name, false);
        }
    }
    handleExportDeclaration(node) {
        const { exportClause } = node;
        if (ts__default['default'].isNamedExports(exportClause)) {
            for (const ne of exportClause.elements) {
                if (ne.propertyName) {
                    this.addExport(ne.propertyName, false, ne.name);
                }
                else {
                    this.addExport(ne.name, false);
                }
            }
            //we can remove entire statement
            this.removeExport(node.getStart(), node.end);
        }
    }
    removeExport(start, end) {
        const exportStart = this.str.original.indexOf('export', start + this.astOffset);
        const exportEnd = exportStart + (end - start);
        this.str.remove(exportStart, exportEnd);
    }
    /**
     * Appends `prop = __sveltets_1_any(prop)`  to given declaration in order to
     * trick TS into widening the type. Else for example `let foo: string | undefined = undefined`
     * is narrowed to `undefined` by TS.
     */
    propTypeAssertToUserDefined(node) {
        if (this.doneDeclarationTransformation.has(node)) {
            return;
        }
        const handleTypeAssertion = (declaration) => {
            const identifier = declaration.name;
            const tsType = declaration.type;
            const jsDocType = ts__default['default'].getJSDocType(declaration);
            const type = tsType || jsDocType;
            if (ts__default['default'].isIdentifier(identifier) &&
                // Ensure initialization for proper control flow and to avoid "possibly undefined" type errors.
                // Also ensure prop is typed as any with a type annotation in TS strict mode
                (!declaration.initializer ||
                    // Widen the type, else it's narrowed to the initializer
                    type ||
                    // Edge case: TS infers `export let bla = false` to type `false`.
                    // prevent that by adding the any-wrap in this case, too.
                    (!type &&
                        [ts__default['default'].SyntaxKind.FalseKeyword, ts__default['default'].SyntaxKind.TrueKeyword].includes(declaration.initializer.kind)))) {
                const name = identifier.getText();
                const end = declaration.end + this.astOffset;
                preprendStr(this.str, end, surroundWithIgnoreComments(`;${name} = __sveltets_1_any(${name});`));
            }
        };
        const findComma = (target) => target.getChildren().filter((child) => child.kind === ts__default['default'].SyntaxKind.CommaToken);
        const splitDeclaration = () => {
            const commas = node
                .getChildren()
                .filter((child) => child.kind === ts__default['default'].SyntaxKind.SyntaxList)
                .map(findComma)
                .reduce((current, previous) => [...current, ...previous], []);
            commas.forEach((comma) => {
                const start = comma.getStart() + this.astOffset;
                const end = comma.getEnd() + this.astOffset;
                overwriteStr(this.str, start, end, ';let ');
            });
        };
        for (const declaration of node.declarations) {
            handleTypeAssertion(declaration);
        }
        // need to be append after the type assert treatment
        splitDeclaration();
        this.doneDeclarationTransformation.add(node);
    }
    handleExportedVariableDeclarationList(list, add) {
        const isLet = list.flags === ts__default['default'].NodeFlags.Let;
        ts__default['default'].forEachChild(list, (node) => {
            if (ts__default['default'].isVariableDeclaration(node)) {
                if (ts__default['default'].isIdentifier(node.name)) {
                    add(list, node.name, isLet, node.name, node.type, !node.initializer);
                }
                else if (ts__default['default'].isObjectBindingPattern(node.name) ||
                    ts__default['default'].isArrayBindingPattern(node.name)) {
                    ts__default['default'].forEachChild(node.name, (element) => {
                        if (ts__default['default'].isBindingElement(element)) {
                            add(list, element.name, isLet);
                        }
                    });
                }
            }
        });
    }
    addGetter(node) {
        if (!node) {
            return;
        }
        this.getters.add(node.text);
    }
    createClassGetters() {
        return Array.from(this.getters)
            .map((name) => 
        // getters are const/classes/functions, which are always defined.
        // We have to remove the `| undefined` from the type here because it was necessary to
        // be added in a previous step so people are not expected to provide these as props.
        `\n    get ${name}() { return __sveltets_2_nonNullable(this.$$prop_def.${name}) }`)
            .join('');
    }
    createClassAccessors() {
        const accessors = [];
        for (const value of this.exports.values()) {
            if (this.getters.has(value.identifierText)) {
                continue;
            }
            accessors.push(value.identifierText);
        }
        return accessors
            .map((name) => `\n    get ${name}() { return this.$$prop_def.${name} }` +
            `\n    /**accessor*/\n    set ${name}(_) {}`)
            .join('');
    }
    /**
     * Marks a top level declaration as a possible export
     * which could be exported through `export { .. }` later.
     */
    addPossibleExport(declaration, name, isLet, target = null, type = null, required = false) {
        if (!ts__default['default'].isIdentifier(name)) {
            return;
        }
        if (target && ts__default['default'].isIdentifier(target)) {
            this.possibleExports.set(name.text, {
                declaration,
                isLet,
                type: type === null || type === void 0 ? void 0 : type.getText(),
                identifierText: target.text,
                required,
                doc: this.getDoc(target)
            });
        }
        else {
            this.possibleExports.set(name.text, {
                declaration,
                isLet
            });
        }
    }
    /**
     * Adds export to map
     */
    addExport(name, isLet, target = null, type = null, required = false) {
        if (name.kind != ts__default['default'].SyntaxKind.Identifier) {
            throw Error('export source kind not supported ' + name);
        }
        if (target && target.kind != ts__default['default'].SyntaxKind.Identifier) {
            throw Error('export target kind not supported ' + target);
        }
        const existingDeclaration = this.possibleExports.get(name.text);
        if (target) {
            this.exports.set(name.text, {
                isLet: isLet || (existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.isLet),
                type: (type === null || type === void 0 ? void 0 : type.getText()) || (existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.type),
                identifierText: target.text,
                required: required || (existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.required),
                doc: this.getDoc(target) || (existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.doc)
            });
        }
        else {
            this.exports.set(name.text, {
                isLet: isLet || (existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.isLet),
                type: existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.type,
                required: existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.required,
                doc: existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.doc
            });
        }
        if (existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.isLet) {
            this.propTypeAssertToUserDefined(existingDeclaration.declaration);
        }
    }
    getDoc(target) {
        var _a, _b;
        let doc = undefined;
        // Traverse `a` one up. If the declaration is part of a declaration list,
        // the comment is at this point already
        const variableDeclaration = target === null || target === void 0 ? void 0 : target.parent;
        // Traverse `a` up to `export let a`
        const exportExpr = (_b = (_a = target === null || target === void 0 ? void 0 : target.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.parent;
        if (variableDeclaration) {
            doc = getLastLeadingDoc(variableDeclaration);
        }
        if (exportExpr && !doc) {
            doc = getLastLeadingDoc(exportExpr);
        }
        return doc;
    }
    /**
     * Creates a string from the collected props
     *
     * @param isTsFile Whether this is a TypeScript file or not.
     */
    createPropsStr(isTsFile) {
        const names = Array.from(this.exports.entries());
        if (this.uses$$Props) {
            const lets = names.filter(([, { isLet }]) => isLet);
            const others = names.filter(([, { isLet }]) => !isLet);
            // We need to check both ways:
            // - The check if exports are assignable to Parial<$$Props> is necessary to make sure
            //   no props are missing. Partial<$$Props> is needed because props with a default value
            //   count as optional, but semantically speaking it is still correctly implementing the interface
            // - The check if $$Props is assignable to exports is necessary to make sure no extraneous props
            //   are defined and that no props are required that should be optional
            // __sveltets_1_ensureRightProps needs to be declared in a way that doesn't affect the type result of props
            return ('{...__sveltets_1_ensureRightProps<{' +
                this.createReturnElementsType(lets).join(',') +
                '}>(__sveltets_1_any("") as $$Props), ' +
                '...__sveltets_1_ensureRightProps<Partial<$$Props>>({' +
                this.createReturnElements(lets, false).join(',') +
                '}), ...{} as unknown as $$Props, ...{' +
                // We add other exports of classes and functions here because
                // they need to appear in the props object in order to properly
                // type bind:xx but they are not needed to be part of $$Props
                this.createReturnElements(others, false).join(', ') +
                '} as {' +
                this.createReturnElementsType(others).join(',') +
                '}}');
        }
        if (names.length === 0) {
            // Necessary, because {} roughly equals to any
            return isTsFile
                ? '{} as Record<string, never>'
                : '/** @type {Record<string, never>} */ ({})';
        }
        const dontAddTypeDef = !isTsFile || names.every(([_, value]) => !value.type && value.required);
        const returnElements = this.createReturnElements(names, dontAddTypeDef);
        if (dontAddTypeDef) {
            // Only `typeof` exports -> omit the `as {...}` completely.
            // If not TS, omit the types to not have a "cannot use types in jsx" error.
            return `{${returnElements.join(' , ')}}`;
        }
        const returnElementsType = this.createReturnElementsType(names);
        return `{${returnElements.join(' , ')}} as {${returnElementsType.join(', ')}}`;
    }
    createReturnElements(names, dontAddTypeDef) {
        return names.map(([key, value]) => {
            // Important to not use shorthand props for rename functionality
            return `${dontAddTypeDef && value.doc ? `\n${value.doc}` : ''}${value.identifierText || key}: ${key}`;
        });
    }
    createReturnElementsType(names) {
        return names.map(([key, value]) => {
            const identifier = `${value.doc ? `\n${value.doc}` : ''}${value.identifierText || key}${value.required ? '' : '?'}`;
            if (!value.type) {
                return `${identifier}: typeof ${key}`;
            }
            return `${identifier}: ${value.type}`;
        });
    }
    createOptionalPropsArray() {
        return Array.from(this.exports.entries())
            .filter(([_, entry]) => !entry.required)
            .map(([name, entry]) => `'${entry.identifierText || name}'`);
    }
    getExportsMap() {
        return this.exports;
    }
}

function handleScopeAndResolveForSlot({ identifierDef, initExpression, owner, slotHandler, templateScope }) {
    if (isIdentifier(identifierDef)) {
        templateScope.add(identifierDef, owner);
        slotHandler.resolve(identifierDef, initExpression, templateScope);
    }
    if (isDestructuringPatterns(identifierDef)) {
        // the node object is returned as-it with no mutation
        const identifiers = extract_identifiers(identifierDef);
        templateScope.addMany(identifiers, owner);
        slotHandler.resolveDestructuringAssignment(identifierDef, identifiers, initExpression, templateScope);
    }
}
function handleScopeAndResolveLetVarForSlot({ letNode, component, slotName, templateScope, slotHandler }) {
    const { expression } = letNode;
    // <Component let:a>
    if (!expression) {
        templateScope.add(letNode, component);
        slotHandler.resolveLet(letNode, letNode, component, slotName);
    }
    else {
        if (isIdentifier(expression)) {
            templateScope.add(expression, component);
            slotHandler.resolveLet(letNode, expression, component, slotName);
        }
        const expForExtract = { ...expression };
        // https://github.com/sveltejs/svelte/blob/3a37de364bfbe75202d8e9fcef9e76b9ce6faaa2/src/compiler/compile/nodes/Let.ts#L37
        if (expression.type === 'ArrayExpression') {
            expForExtract.type = 'ArrayPattern';
        }
        else if (expression.type === 'ObjectExpression') {
            expForExtract.type = 'ObjectPattern';
        }
        if (isDestructuringPatterns(expForExtract)) {
            const identifiers = extract_identifiers(expForExtract);
            templateScope.addMany(identifiers, component);
            slotHandler.resolveDestructuringAssignmentForLet(expForExtract, identifiers, letNode, component, slotName);
        }
    }
}

/**
 * Tracks all store-usages as well as all variable declarations and imports in the component.
 *
 * In the modification-step at the end, all variable declartaions and imports which
 * were used as stores are appended with `let $xx = __sveltets_1_store_get(xx)` to create the store variables.
 */
class ImplicitStoreValues {
    constructor(storesResolvedInTemplate = [], renderFunctionStart, storeFromImportsWrapper = (input) => input) {
        this.renderFunctionStart = renderFunctionStart;
        this.storeFromImportsWrapper = storeFromImportsWrapper;
        this.accessedStores = new Set();
        this.variableDeclarations = [];
        this.reactiveDeclarations = [];
        this.importStatements = [];
        this.addStoreAcess = this.accessedStores.add.bind(this.accessedStores);
        this.addVariableDeclaration = this.variableDeclarations.push.bind(this.variableDeclarations);
        this.addReactiveDeclaration = this.reactiveDeclarations.push.bind(this.reactiveDeclarations);
        this.addImportStatement = this.importStatements.push.bind(this.importStatements);
        storesResolvedInTemplate.forEach(this.addStoreAcess);
    }
    /**
     * All variable declartaions and imports which
     * were used as stores are appended with `let $xx = __sveltets_1_store_get(xx)` to create the store variables.
     */
    modifyCode(astOffset, str) {
        this.variableDeclarations.forEach((node) => this.attachStoreValueDeclarationToDecl(node, astOffset, str));
        this.reactiveDeclarations.forEach((node) => this.attachStoreValueDeclarationToReactiveAssignment(node, astOffset, str));
        this.attachStoreValueDeclarationOfImportsToRenderFn(str);
    }
    getAccessedStores() {
        return [...this.accessedStores.keys()];
    }
    attachStoreValueDeclarationToDecl(node, astOffset, str) {
        const storeNames = extractIdentifiers(node.name)
            .map((id) => id.text)
            .filter((name) => this.accessedStores.has(name));
        if (!storeNames.length) {
            return;
        }
        const storeDeclarations = surroundWithIgnoreComments(this.createStoreDeclarations(storeNames));
        const nodeEnd = ts__default['default'].isVariableDeclarationList(node.parent) && node.parent.declarations.length > 1
            ? node.parent.declarations[node.parent.declarations.length - 1].getEnd()
            : node.getEnd();
        str.appendRight(nodeEnd + astOffset, storeDeclarations);
    }
    attachStoreValueDeclarationToReactiveAssignment(node, astOffset, str) {
        const storeNames = getNamesFromLabeledStatement(node).filter((name) => this.accessedStores.has(name));
        if (!storeNames.length) {
            return;
        }
        const storeDeclarations = surroundWithIgnoreComments(this.createStoreDeclarations(storeNames));
        const endPos = node.getEnd() + astOffset;
        // Hack for quick-fixing https://github.com/sveltejs/language-tools/issues/1097
        // TODO think about a SourceMap-wrapper that does these things for us,
        // or investigate altering the inner workings of SourceMap
        if (str.original.charAt(endPos - 1) !== ';') {
            preprendStr(str, endPos, storeDeclarations);
        }
        else {
            str.appendRight(endPos, storeDeclarations);
        }
    }
    attachStoreValueDeclarationOfImportsToRenderFn(str) {
        const storeNames = this.importStatements
            .filter(({ name }) => name && this.accessedStores.has(name.getText()))
            .map(({ name }) => name.getText());
        if (!storeNames.length) {
            return;
        }
        const storeDeclarations = this.storeFromImportsWrapper(surroundWithIgnoreComments(this.createStoreDeclarations(storeNames)));
        str.appendRight(this.renderFunctionStart, storeDeclarations);
    }
    createStoreDeclarations(storeNames) {
        let declarations = '';
        for (let i = 0; i < storeNames.length; i++) {
            declarations += this.createStoreDeclaration(storeNames[i]);
        }
        return declarations;
    }
    createStoreDeclaration(storeName) {
        return `;let $${storeName} = __sveltets_1_store_get(${storeName});`;
    }
}

class Scripts {
    constructor(htmlxAst) {
        this.htmlxAst = htmlxAst;
        // All script tags, no matter at what level, are listed within the root children, because
        // of the logic in htmlxparser.ts
        // To get the top level scripts, filter out all those that are part of children's children.
        // Those have another type ('Element' with name 'script').
        this.scriptTags = this.htmlxAst.children.filter((child) => child.type === 'Script');
        this.topLevelScripts = this.scriptTags;
    }
    checkIfElementIsScriptTag(node, parent) {
        if (parent !== this.htmlxAst && node.name === 'script') {
            this.topLevelScripts = this.topLevelScripts.filter((tag) => tag.start !== node.start || tag.end !== node.end);
        }
    }
    checkIfContainsScriptTag(node) {
        this.topLevelScripts = this.topLevelScripts.filter((tag) => !(node.start <= tag.start && node.end >= tag.end));
    }
    getTopLevelScriptTags() {
        let scriptTag = null;
        let moduleScriptTag = null;
        // should be 2 at most, one each, so using forEach is safe
        this.topLevelScripts.forEach((tag) => {
            if (tag.attributes &&
                tag.attributes.find((a) => a.name == 'context' && a.value.length == 1 && a.value[0].raw == 'module')) {
                moduleScriptTag = tag;
            }
            else {
                scriptTag = tag;
            }
        });
        return { scriptTag, moduleScriptTag };
    }
    blankOtherScriptTags(str) {
        this.scriptTags
            .filter((tag) => !this.topLevelScripts.includes(tag))
            .forEach((tag) => {
            str.remove(tag.start, tag.end);
        });
    }
}

function attributeStrValueAsJsExpression(attr) {
    if (attr.value.length == 0) {
        return "''"; //wut?
    }
    //handle single value
    if (attr.value.length == 1) {
        const attrVal = attr.value[0];
        if (attrVal.type == 'Text') {
            return '"' + attrVal.raw + '"';
        }
    }
    // we have multiple attribute values, so we know we are building a string out of them.
    // so return a dummy string, it will typecheck the same :)
    return '"__svelte_ts_string"';
}
function is$$SlotsDeclaration(node) {
    return isInterfaceOrTypeDeclaration(node) && node.name.text === '$$Slots';
}
class SlotHandler {
    constructor(htmlx) {
        this.htmlx = htmlx;
        this.slots = new Map();
        this.resolved = new Map();
        this.resolvedExpression = new Map();
    }
    resolve(identifierDef, initExpression, scope) {
        let resolved = this.resolved.get(identifierDef);
        if (resolved) {
            return resolved;
        }
        resolved = this.getResolveExpressionStr(identifierDef, scope, initExpression);
        if (resolved) {
            this.resolved.set(identifierDef, resolved);
        }
        return resolved;
    }
    /**
     * Returns a string which expresses the given identifier unpacked to
     * the top level in order to express the slot types correctly later on.
     *
     * Example: {#each items as item} ---> __sveltets_1_unwrapArr(items)
     */
    getResolveExpressionStr(identifierDef, scope, initExpression) {
        const { name } = identifierDef;
        const owner = scope.getOwner(name);
        if ((owner === null || owner === void 0 ? void 0 : owner.type) === 'CatchBlock') {
            return '__sveltets_1_any({})';
        }
        // list.map(list => list.someProperty)
        // initExpression's scope should the parent scope of identifier scope
        else if ((owner === null || owner === void 0 ? void 0 : owner.type) === 'ThenBlock') {
            const resolvedExpression = this.resolveExpression(initExpression, scope.parent);
            return `__sveltets_1_unwrapPromiseLike(${resolvedExpression})`;
        }
        else if ((owner === null || owner === void 0 ? void 0 : owner.type) === 'EachBlock') {
            const resolvedExpression = this.resolveExpression(initExpression, scope.parent);
            return `__sveltets_1_unwrapArr(${resolvedExpression})`;
        }
        return null;
    }
    resolveDestructuringAssignment(destructuringNode, identifiers, initExpression, scope) {
        const destructuring = this.htmlx.slice(destructuringNode.start, destructuringNode.end);
        identifiers.forEach((identifier) => {
            const resolved = this.getResolveExpressionStr(identifier, scope, initExpression);
            if (resolved) {
                this.resolved.set(identifier, `((${destructuring}) => ${identifier.name})(${resolved})`);
            }
        });
    }
    resolveDestructuringAssignmentForLet(destructuringNode, identifiers, letNode, component, slotName) {
        const destructuring = this.htmlx.slice(destructuringNode.start, destructuringNode.end);
        identifiers.forEach((identifier) => {
            const resolved = this.getResolveExpressionStrForLet(letNode, component, slotName);
            this.resolved.set(identifier, `((${destructuring}) => ${identifier.name})(${resolved})`);
        });
    }
    getResolveExpressionStrForLet(letNode, component, slotName) {
        return `${getSingleSlotDef(component, slotName)}.${letNode.name}`;
    }
    resolveLet(letNode, identifierDef, component, slotName) {
        let resolved = this.resolved.get(identifierDef);
        if (resolved) {
            return resolved;
        }
        resolved = this.getResolveExpressionStrForLet(letNode, component, slotName);
        this.resolved.set(identifierDef, resolved);
        return resolved;
    }
    getSlotConsumerOfComponent(component) {
        var _a;
        let result = (_a = this.getLetNodes(component, 'default')) !== null && _a !== void 0 ? _a : [];
        for (const child of component.children) {
            const slotName = getSlotName(child);
            if (slotName) {
                const letNodes = this.getLetNodes(child, slotName);
                if (letNodes === null || letNodes === void 0 ? void 0 : letNodes.length) {
                    result = result.concat(letNodes);
                }
            }
        }
        return result;
    }
    getLetNodes(child, slotName) {
        var _a;
        const letNodes = ((_a = child === null || child === void 0 ? void 0 : child.attributes) !== null && _a !== void 0 ? _a : []).filter((attr) => attr.type === 'Let');
        return letNodes === null || letNodes === void 0 ? void 0 : letNodes.map((letNode) => ({
            letNode,
            slotName
        }));
    }
    /**
     * Resolves the slot expression to a string that can be used
     * in the props-object in the return type of the render function
     */
    resolveExpression(expression, scope) {
        let resolved = this.resolvedExpression.get(expression);
        if (resolved) {
            return resolved;
        }
        const strForExpression = new MagicString(this.htmlx);
        const identifiers = [];
        const objectShortHands = [];
        walk(expression, {
            enter(node, parent, prop) {
                if (node.type === 'Identifier') {
                    if (parent) {
                        if (isMember$1(parent, prop)) {
                            return;
                        }
                        if (isObjectKey(parent, prop)) {
                            return;
                        }
                        if (isObjectValue(parent, prop)) {
                            // { value }
                            if (isObjectValueShortHand(parent)) {
                                this.skip();
                                objectShortHands.push(node);
                                return;
                            }
                        }
                    }
                    this.skip();
                    identifiers.push(node);
                }
            }
        });
        const getOverwrite = (name) => {
            const init = scope.getInit(name);
            return init ? this.resolved.get(init) : name;
        };
        for (const identifier of objectShortHands) {
            const { end, name } = identifier;
            const value = getOverwrite(name);
            strForExpression.appendLeft(end, `:${value}`);
        }
        for (const identifier of identifiers) {
            const { start, end, name } = identifier;
            const value = getOverwrite(name);
            strForExpression.overwrite(start, end, value);
        }
        resolved = strForExpression.slice(expression.start, expression.end);
        this.resolvedExpression.set(expression, resolved);
        return resolved;
    }
    handleSlot(node, scope) {
        var _a;
        const nameAttr = node.attributes.find((a) => a.name == 'name');
        const slotName = nameAttr ? nameAttr.value[0].raw : 'default';
        //collect attributes
        const attributes = new Map();
        for (const attr of node.attributes) {
            if (attr.name == 'name') {
                continue;
            }
            if (attr.type === 'Spread') {
                const rawName = attr.expression.name;
                const init = scope.getInit(rawName);
                const name = init ? this.resolved.get(init) : rawName;
                attributes.set(`__spread__${name}`, name);
            }
            if (!((_a = attr.value) === null || _a === void 0 ? void 0 : _a.length)) {
                continue;
            }
            if (attributeValueIsString(attr)) {
                attributes.set(attr.name, attributeStrValueAsJsExpression(attr));
                continue;
            }
            attributes.set(attr.name, this.resolveAttr(attr, scope));
        }
        this.slots.set(slotName, attributes);
    }
    getSlotDef() {
        return this.slots;
    }
    resolveAttr(attr, scope) {
        const attrVal = attr.value[0];
        if (!attrVal) {
            return null;
        }
        if (attrVal.type == 'AttributeShorthand') {
            const { name } = attrVal.expression;
            const init = scope.getInit(name);
            const resolved = this.resolved.get(init);
            return resolved !== null && resolved !== void 0 ? resolved : name;
        }
        if (attrVal.type == 'MustacheTag') {
            return this.resolveExpression(attrVal.expression, scope);
        }
        throw Error('Unknown attribute value type:' + attrVal.type);
    }
}
function getSingleSlotDef(componentNode, slotName) {
    // In contrast to getSingleSlotDef in htmlx2jsx, use a simple instanceOf-transformation here.
    // This means that if someone forwards a slot whose type can only be infered from the input properties
    // because there's a generic relationship, then that slot type is of type any or unknown.
    // This is a limitation which could be tackled later. The problem is that in contrast to the transformation
    // in htmlx2jsx, we cannot know for sure that all properties we would generate the component with exist
    // in this scope, some could have been generated through each/await blocks or other lets.
    const componentType = getTypeForComponent(componentNode);
    return `__sveltets_1_instanceOf(${componentType}).$$slot_def['${slotName}']`;
}

const reservedNames = new Set(['$$props', '$$restProps', '$$slots']);
class Stores {
    constructor(scope, isDeclaration) {
        this.scope = scope;
        this.isDeclaration = isDeclaration;
        this.possibleStores = [];
    }
    handleDirective(node, str) {
        if (this.notAStore(node.name) || this.isDeclaration.value) {
            return;
        }
        const start = str.original.indexOf('$', node.start);
        const end = start + node.name.length;
        this.possibleStores.push({
            node: { type: 'Identifier', start, end, name: node.name },
            parent: { start: 0, end: 0, type: '' },
            scope: this.scope.current
        });
    }
    handleIdentifier(node, parent, prop) {
        if (this.notAStore(node.name)) {
            return;
        }
        //handle potential store
        if (this.isDeclaration.value) {
            if (isObjectKey(parent, prop)) {
                return;
            }
            this.scope.current.declared.add(node.name);
        }
        else {
            if (isMember$1(parent, prop) && !parent.computed) {
                return;
            }
            if (isObjectKey(parent, prop)) {
                return;
            }
            this.possibleStores.push({ node, parent, scope: this.scope.current });
        }
    }
    getStoreNames() {
        const stores = this.possibleStores.filter(({ node, scope }) => {
            const name = node.name;
            // if variable starting with '$' was manually declared by the user,
            // this isn't a store access.
            return !scope.hasDefined(name);
        });
        return stores.map(({ node }) => node.name.slice(1));
    }
    notAStore(name) {
        return name[0] !== '$' || reservedNames.has(name);
    }
}

/**
 * adopted from https://github.com/sveltejs/svelte/blob/master/src/compiler/compile/nodes/shared/TemplateScope.ts
 */
class TemplateScope {
    constructor(parent) {
        this.owners = new Map();
        this.inits = new Map();
        this.parent = parent;
        this.names = new Set(parent ? parent.names : []);
    }
    addMany(inits, owner) {
        inits.forEach((item) => this.add(item, owner));
        return this;
    }
    add(init, owner) {
        const { name } = init;
        this.names.add(name);
        this.inits.set(name, init);
        this.owners.set(name, owner);
        return this;
    }
    child() {
        const child = new TemplateScope(this);
        return child;
    }
    getOwner(name) {
        var _a;
        return this.owners.get(name) || ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.getOwner(name));
    }
    getInit(name) {
        var _a;
        return this.inits.get(name) || ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.getInit(name));
    }
    isLet(name) {
        const owner = this.getOwner(name);
        return owner && (owner.type === 'Element' || owner.type === 'InlineComponent');
    }
}

class ImplicitTopLevelNames {
    constructor(str, astOffset) {
        this.str = str;
        this.astOffset = astOffset;
        this.map = new Set();
    }
    add(node) {
        this.map.add(node);
    }
    handleReactiveStatement(node, binaryExpression) {
        if (binaryExpression) {
            this.wrapExpressionWithInvalidate(binaryExpression.right);
        }
        else {
            const start = node.getStart() + this.astOffset;
            const end = node.getEnd() + this.astOffset;
            this.str.prependLeft(start, ';() => {');
            preprendStr(this.str, end, '}');
        }
    }
    wrapExpressionWithInvalidate(expression) {
        if (!expression) {
            return;
        }
        const start = expression.getStart() + this.astOffset;
        const end = expression.getEnd() + this.astOffset;
        // $: a = { .. }..  /  $: a = .. as ..  =>   () => ( .. )
        if (ts__default['default'].isObjectLiteralExpression(expression) ||
            (expression.getText().startsWith('{') &&
                this.isNodeStartsWithObjectLiteral(expression)) ||
            ts__default['default'].isAsExpression(expression)) {
            this.str.appendLeft(start, '(');
            this.str.appendRight(end, ')');
        }
        this.str.prependLeft(start, '__sveltets_1_invalidate(() => ');
        preprendStr(this.str, end, ')');
        // Not adding ';' at the end because right now this function is only invoked
        // in situations where there is a line break of ; guaranteed to be present (else the code is invalid)
    }
    isNodeStartsWithObjectLiteral(node) {
        if (ts__default['default'].isObjectLiteralExpression(node)) {
            return true;
        }
        if (ts__default['default'].isElementAccessExpression(node)) {
            return this.isNodeStartsWithObjectLiteral(node.expression);
        }
        if (ts__default['default'].isBinaryExpression(node)) {
            return this.isNodeStartsWithObjectLiteral(node.left);
        }
        if (ts__default['default'].isConditionalExpression(node)) {
            return this.isNodeStartsWithObjectLiteral(node.condition);
        }
        return node
            .getChildren()
            .filter((e) => e.pos === node.pos)
            .some((child) => this.isNodeStartsWithObjectLiteral(child));
    }
    modifyCode(rootVariables) {
        for (const node of this.map.values()) {
            const names = getNamesFromLabeledStatement(node);
            if (names.length === 0) {
                continue;
            }
            const implicitTopLevelNames = names.filter((name) => !rootVariables.has(name));
            const pos = node.label.getStart();
            if (this.hasOnlyImplicitTopLevelNames(names, implicitTopLevelNames)) {
                // remove '$:' label
                this.str.remove(pos + this.astOffset, pos + this.astOffset + 2);
                this.str.prependRight(pos + this.astOffset, 'let ');
                this.removeBracesFromParenthizedExpression(node);
            }
            else {
                implicitTopLevelNames.forEach((name) => {
                    this.str.prependRight(pos + this.astOffset, `let ${name};\n`);
                });
            }
        }
    }
    hasOnlyImplicitTopLevelNames(names, implicitTopLevelNames) {
        return names.length === implicitTopLevelNames.length;
    }
    removeBracesFromParenthizedExpression(node) {
        // If expression is of type `$: ({a} = b);`,
        // remove the surrounding braces so that the transformation
        // to `let {a} = b;` produces valid code.
        if (ts__default['default'].isExpressionStatement(node.statement) &&
            isParenthesizedObjectOrArrayLiteralExpression(node.statement.expression)) {
            const parenthesizedExpression = node.statement.expression;
            const parenthesisStart = parenthesizedExpression.getStart() + this.astOffset;
            const expressionStart = parenthesizedExpression.expression.getStart() + this.astOffset;
            this.str.overwrite(parenthesisStart, expressionStart, '', { contentOnly: true });
            const parenthesisEnd = parenthesizedExpression.getEnd() + this.astOffset;
            const expressionEnd = parenthesizedExpression.expression.getEnd() + this.astOffset;
            // We need to keep the `)` of the "wrap with invalidate" expression above.
            // We overwrite the same range so it's needed.
            overwriteStr(this.str, expressionEnd, parenthesisEnd, ')', true);
        }
    }
}

class Scope {
    constructor(parent) {
        this.declared = new Set();
        this.parent = parent;
    }
    hasDefined(name) {
        return this.declared.has(name) || (!!this.parent && this.parent.hasDefined(name));
    }
}
class ScopeStack {
    constructor() {
        this.current = new Scope();
    }
    push() {
        this.current = new Scope(this.current);
    }
    pop() {
        this.current = this.current.parent;
    }
}

/**
 * Transform type assertion to as expression: <Type>a => a as Type
 */
function handleTypeAssertion(str, assertion, astOffset) {
    const { expression, type } = assertion;
    const assertionStart = assertion.getStart() + astOffset;
    const typeStart = type.getStart() + astOffset;
    const typeEnd = type.getEnd() + astOffset;
    const expressionStart = expression.getStart() + astOffset;
    const expressionEnd = expression.getEnd() + astOffset;
    str.appendLeft(expressionEnd, ' as ');
    // move 'HTMLElement' to the end of expression
    str.move(assertionStart, typeEnd, expressionEnd);
    str.remove(assertionStart, typeStart);
    // remove '>'
    str.remove(typeEnd, expressionStart);
}

/**
 * Throw an error with start/end pos like the Svelte compiler does
 */
function throwError(start, end, message, code) {
    const error = new Error(message);
    error.start = positionAt(start, code);
    error.end = positionAt(end, code);
    throw error;
}
/**
 * Get the line (1-offset) and character (0-offset) based on the offset
 * @param offset The index of the position
 * @param text The text for which the position should be retrived
 */
function positionAt(offset, text) {
    offset = clamp(offset, 0, text.length);
    const lineOffsets = getLineOffsets(text);
    let low = 0;
    let high = lineOffsets.length;
    if (high === 0) {
        return { line: 1, column: offset };
    }
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (lineOffsets[mid] > offset) {
            high = mid;
        }
        else {
            low = mid + 1;
        }
    }
    // low is the least x for which the line offset is larger than the current offset
    // or array.length if no line offset is larger than the current offset
    return { line: low, column: offset - lineOffsets[low - 1] };
}
function clamp(num, min, max) {
    return Math.max(min, Math.min(max, num));
}
function getLineOffsets(text) {
    const lineOffsets = [];
    let isLineStart = true;
    for (let i = 0; i < text.length; i++) {
        if (isLineStart) {
            lineOffsets.push(i);
            isLineStart = false;
        }
        const ch = text.charAt(i);
        isLineStart = ch === '\r' || ch === '\n';
        if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
            i++;
        }
    }
    if (isLineStart && text.length > 0) {
        lineOffsets.push(text.length);
    }
    return lineOffsets;
}

class Generics {
    constructor(str, astOffset) {
        this.str = str;
        this.astOffset = astOffset;
        this.definitions = [];
        this.references = [];
    }
    addIfIsGeneric(node) {
        var _a, _b;
        if (ts__default['default'].isTypeAliasDeclaration(node) && this.is$$GenericType(node.type)) {
            if (((_a = node.type.typeArguments) === null || _a === void 0 ? void 0 : _a.length) > 1) {
                throw new Error('Invalid $$Generic declaration: Only one type argument allowed');
            }
            if (((_b = node.type.typeArguments) === null || _b === void 0 ? void 0 : _b.length) === 1) {
                this.definitions.push(`${node.name.text} extends ${node.type.typeArguments[0].getText()}`);
            }
            else {
                this.definitions.push(`${node.name.text}`);
            }
            this.references.push(node.name.text);
            this.str.remove(this.astOffset + node.getStart(), this.astOffset + node.getEnd());
        }
    }
    throwIfIsGeneric(node) {
        if (ts__default['default'].isTypeAliasDeclaration(node) && this.is$$GenericType(node.type)) {
            throwError(this.astOffset + node.getStart(), this.astOffset + node.getEnd(), '$$Generic declarations are only allowed in the instance script', this.str.original);
        }
    }
    is$$GenericType(node) {
        return (ts__default['default'].isTypeReferenceNode(node) &&
            ts__default['default'].isIdentifier(node.typeName) &&
            node.typeName.text === '$$Generic');
    }
    toDefinitionString(addIgnore = false) {
        const surround = addIgnore ? surroundWithIgnoreComments : (str) => str;
        return this.definitions.length ? surround(`<${this.definitions.join(',')}>`) : '';
    }
    toReferencesString() {
        return this.references.length ? `<${this.references.join(',')}>` : '';
    }
    has() {
        return this.definitions.length > 0;
    }
}

/**
 * move imports to top of script so they appear outside our render function
 */
function handleImportDeclaration(node, str, astOffset, scriptStart, sourceFile) {
    var _a;
    const scanner = ts__default['default'].createScanner(sourceFile.languageVersion, 
    /*skipTrivia*/ false, sourceFile.languageVariant);
    const comments = (_a = ts__default['default'].getLeadingCommentRanges(node.getFullText(), 0)) !== null && _a !== void 0 ? _a : [];
    if (!comments.some((comment) => comment.hasTrailingNewLine) &&
        isNewGroup(sourceFile, node, scanner)) {
        str.appendRight(node.getStart() + astOffset, '\n');
    }
    for (const comment of comments) {
        const commentEnd = node.pos + comment.end + astOffset;
        str.move(node.pos + comment.pos + astOffset, commentEnd, scriptStart + 1);
        if (comment.hasTrailingNewLine) {
            str.overwrite(commentEnd - 1, commentEnd, str.original[commentEnd - 1] + '\n');
        }
    }
    str.move(node.getStart() + astOffset, node.end + astOffset, scriptStart + 1);
    //add in a \n
    const originalEndChar = str.original[node.end + astOffset - 1];
    str.overwrite(node.end + astOffset - 1, node.end + astOffset, originalEndChar + '\n');
}
/**
 * adopted from https://github.com/microsoft/TypeScript/blob/6e0447fdf165b1cec9fc80802abcc15bd23a268f/src/services/organizeImports.ts#L111
 */
function isNewGroup(sourceFile, topLevelImportDecl, scanner) {
    const startPos = topLevelImportDecl.getFullStart();
    const endPos = topLevelImportDecl.getStart();
    scanner.setText(sourceFile.text, startPos, endPos - startPos);
    let numberOfNewLines = 0;
    while (scanner.getTokenPos() < endPos) {
        const tokenKind = scanner.scan();
        if (tokenKind === ts__default['default'].SyntaxKind.NewLineTrivia) {
            numberOfNewLines++;
            if (numberOfNewLines >= 2) {
                return true;
            }
        }
    }
    return false;
}
/**
 * ensure it's in a newline.
 * if file has module script ensure an empty line to separate imports
 */
function handleFirstInstanceImport(tsAst, astOffset, hasModuleScript, str) {
    var _a;
    const firstImport = tsAst.statements
        .filter(ts__default['default'].isImportDeclaration)
        .sort((a, b) => a.end - b.end)[0];
    if (!firstImport) {
        return;
    }
    const firstComment = Array.from((_a = ts__default['default'].getLeadingCommentRanges(firstImport.getFullText(), 0)) !== null && _a !== void 0 ? _a : []).sort((a, b) => a.pos - b.pos)[0];
    const start = firstComment && firstComment.kind === ts__default['default'].SyntaxKind.MultiLineCommentTrivia
        ? firstComment.pos + firstImport.getFullStart()
        : firstImport.getStart();
    str.appendRight(start + astOffset, '\n' + (hasModuleScript ? '\n' : ''));
}

function processInstanceScriptContent(str, script, events, implicitStoreValues, mode, hasModuleScript) {
    const htmlx = str.original;
    const scriptContent = htmlx.substring(script.content.start, script.content.end);
    const tsAst = ts__namespace.createSourceFile('component.ts.svelte', scriptContent, ts__namespace.ScriptTarget.Latest, true, ts__namespace.ScriptKind.TS);
    const astOffset = script.content.start;
    const exportedNames = new ExportedNames(str, astOffset);
    const generics = new Generics(str, astOffset);
    const implicitTopLevelNames = new ImplicitTopLevelNames(str, astOffset);
    let uses$$props = false;
    let uses$$restProps = false;
    let uses$$slots = false;
    let uses$$SlotsInterface = false;
    //track if we are in a declaration scope
    let isDeclaration = false;
    //track $store variables since we are only supposed to give top level scopes special treatment, and users can declare $blah variables at higher scopes
    //which prevents us just changing all instances of Identity that start with $
    const pendingStoreResolutions = [];
    let scope = new Scope();
    const rootScope = scope;
    const pushScope = () => (scope = new Scope(scope));
    const popScope = () => (scope = scope.parent);
    const resolveStore = (pending) => {
        let { node, scope } = pending;
        const name = node.text;
        while (scope) {
            if (scope.declared.has(name)) {
                //we were manually declared, this isn't a store access.
                return;
            }
            scope = scope.parent;
        }
        const storename = node.getText().slice(1);
        implicitStoreValues.addStoreAcess(storename);
    };
    const handleIdentifier = (ident, parent) => {
        if (ident.text === '$$props') {
            uses$$props = true;
            return;
        }
        if (ident.text === '$$restProps') {
            uses$$restProps = true;
            return;
        }
        if (ident.text === '$$slots') {
            uses$$slots = true;
            return;
        }
        if (ts__namespace.isLabeledStatement(parent) && parent.label == ident) {
            return;
        }
        if (isDeclaration || ts__namespace.isParameter(parent)) {
            if (isNotPropertyNameOfImport(ident) &&
                (!ts__namespace.isBindingElement(ident.parent) || ident.parent.name == ident)) {
                // we are a key, not a name, so don't care
                if (ident.text.startsWith('$') || scope == rootScope) {
                    // track all top level declared identifiers and all $ prefixed identifiers
                    scope.declared.add(ident.text);
                }
            }
        }
        else {
            //track potential store usage to be resolved
            if (ident.text.startsWith('$')) {
                if ((!ts__namespace.isPropertyAccessExpression(parent) || parent.expression == ident) &&
                    (!ts__namespace.isPropertyAssignment(parent) || parent.initializer == ident) &&
                    !ts__namespace.isPropertySignature(parent) &&
                    !ts__namespace.isPropertyDeclaration(parent) &&
                    !ts__namespace.isTypeReferenceNode(parent) &&
                    !ts__namespace.isTypeAliasDeclaration(parent) &&
                    !ts__namespace.isInterfaceDeclaration(parent)) {
                    pendingStoreResolutions.push({ node: ident, parent, scope });
                }
            }
        }
    };
    const walk = (node, parent) => {
        var _a;
        const onLeaveCallbacks = [];
        generics.addIfIsGeneric(node);
        if (is$$EventsDeclaration(node)) {
            events.setComponentEventsInterface(node, astOffset);
        }
        if (is$$SlotsDeclaration(node)) {
            uses$$SlotsInterface = true;
        }
        if (is$$PropsDeclaration(node)) {
            exportedNames.uses$$Props = true;
        }
        if (ts__namespace.isVariableStatement(node)) {
            exportedNames.handleVariableStatement(node, parent);
        }
        if (ts__namespace.isFunctionDeclaration(node)) {
            exportedNames.handleExportFunctionOrClass(node);
            pushScope();
            onLeaveCallbacks.push(() => popScope());
        }
        if (ts__namespace.isClassDeclaration(node)) {
            exportedNames.handleExportFunctionOrClass(node);
        }
        if (ts__namespace.isBlock(node) || ts__namespace.isArrowFunction(node) || ts__namespace.isFunctionExpression(node)) {
            pushScope();
            onLeaveCallbacks.push(() => popScope());
        }
        if (ts__namespace.isExportDeclaration(node)) {
            exportedNames.handleExportDeclaration(node);
        }
        if (ts__namespace.isImportDeclaration(node)) {
            handleImportDeclaration(node, str, astOffset, script.start, tsAst);
            // Check if import is the event dispatcher
            events.checkIfImportIsEventDispatcher(node);
        }
        // workaround for import statement completion
        if (ts__namespace.isImportEqualsDeclaration(node)) {
            const end = node.getEnd() + astOffset;
            if (str.original[end - 1] !== ';') {
                preprendStr(str, end, ';');
            }
        }
        if (ts__namespace.isVariableDeclaration(node)) {
            events.checkIfIsStringLiteralDeclaration(node);
            events.checkIfDeclarationInstantiatedEventDispatcher(node);
            implicitStoreValues.addVariableDeclaration(node);
        }
        if (ts__namespace.isCallExpression(node)) {
            events.checkIfCallExpressionIsDispatch(node);
        }
        if (ts__namespace.isVariableDeclaration(parent) && parent.name == node) {
            isDeclaration = true;
            onLeaveCallbacks.push(() => (isDeclaration = false));
        }
        if (ts__namespace.isBindingElement(parent) && parent.name == node) {
            isDeclaration = true;
            onLeaveCallbacks.push(() => (isDeclaration = false));
        }
        if (ts__namespace.isImportClause(node)) {
            isDeclaration = true;
            onLeaveCallbacks.push(() => (isDeclaration = false));
            implicitStoreValues.addImportStatement(node);
        }
        if (ts__namespace.isImportSpecifier(node)) {
            implicitStoreValues.addImportStatement(node);
        }
        //handle stores etc
        if (ts__namespace.isIdentifier(node)) {
            handleIdentifier(node, parent);
        }
        //track implicit declarations in reactive blocks at the top level
        if (ts__namespace.isLabeledStatement(node) &&
            parent == tsAst && //top level
            node.label.text == '$' &&
            node.statement) {
            const binaryExpression = getBinaryAssignmentExpr(node);
            if (binaryExpression) {
                implicitTopLevelNames.add(node);
                implicitStoreValues.addReactiveDeclaration(node);
            }
            implicitTopLevelNames.handleReactiveStatement(node, binaryExpression);
        }
        // Defensively call function (checking for undefined) because it got added only recently (TS 4.0)
        // and therefore might break people using older TS versions
        // Don't transform in ts mode because <type>value type assertions are valid in this case
        if (mode !== 'ts' && ((_a = ts__namespace.isTypeAssertionExpression) === null || _a === void 0 ? void 0 : _a.call(ts__namespace, node))) {
            handleTypeAssertion(str, node, astOffset);
        }
        //to save a bunch of condition checks on each node, we recurse into processChild which skips all the checks for top level items
        ts__namespace.forEachChild(node, (n) => walk(n, node));
        //fire off the on leave callbacks
        onLeaveCallbacks.map((c) => c());
    };
    //walk the ast and convert to tsx as we go
    tsAst.forEachChild((n) => walk(n, tsAst));
    //resolve stores
    pendingStoreResolutions.map(resolveStore);
    // declare implicit reactive variables we found in the script
    implicitTopLevelNames.modifyCode(rootScope.declared);
    implicitStoreValues.modifyCode(astOffset, str);
    handleFirstInstanceImport(tsAst, astOffset, hasModuleScript, str);
    if (mode === 'dts') {
        // Transform interface declarations to type declarations because indirectly
        // using interfaces inside the return type of a function is forbidden.
        // This is not a problem for intellisense/type inference but it will
        // break dts generation (file will not be generated).
        transformInterfacesToTypes(tsAst, str, astOffset);
    }
    return {
        exportedNames,
        events,
        uses$$props,
        uses$$restProps,
        uses$$slots,
        uses$$SlotsInterface,
        generics
    };
}
function transformInterfacesToTypes(tsAst, str, astOffset) {
    tsAst.statements.filter(ts__namespace.isInterfaceDeclaration).forEach((node) => {
        var _a;
        str.overwrite(node.getStart() + astOffset, node.getStart() + astOffset + 'interface'.length, 'type');
        if ((_a = node.heritageClauses) === null || _a === void 0 ? void 0 : _a.length) {
            const extendsStart = node.heritageClauses[0].getStart() + astOffset;
            str.overwrite(extendsStart, extendsStart + 'extends'.length, '=');
            const extendsList = node.heritageClauses[0].types;
            let prev = extendsList[0];
            extendsList.slice(1).forEach((heritageClause) => {
                str.overwrite(prev.getEnd() + astOffset, heritageClause.getStart() + astOffset, ' & ');
                prev = heritageClause;
            });
            str.appendLeft(node.heritageClauses[0].getEnd() + astOffset, ' & ');
        }
        else {
            str.prependLeft(str.original.indexOf('{', node.getStart() + astOffset), '=');
        }
    });
}

function processModuleScriptTag(str, script, implicitStoreValues, useNewTransformation) {
    const htmlx = str.original;
    const scriptContent = htmlx.substring(script.content.start, script.content.end);
    const tsAst = ts__default['default'].createSourceFile('component.module.ts.svelte', scriptContent, ts__default['default'].ScriptTarget.Latest, true, ts__default['default'].ScriptKind.TS);
    const astOffset = script.content.start;
    const generics = new Generics(str, astOffset);
    const walk = (node) => {
        resolveImplicitStoreValue(node, implicitStoreValues, str, astOffset);
        generics.throwIfIsGeneric(node);
        throwIfIs$$EventsDeclaration(node, str, astOffset);
        throwIfIs$$SlotsDeclaration(node, str, astOffset);
        throwIfIs$$PropsDeclaration(node, str, astOffset);
        ts__default['default'].forEachChild(node, (n) => walk(n));
    };
    //walk the ast and convert to tsx as we go
    tsAst.forEachChild((n) => walk(n));
    // declare store declarations we found in the script
    implicitStoreValues.modifyCode(astOffset, str);
    const scriptStartTagEnd = htmlx.indexOf('>', script.start) + 1;
    const scriptEndTagStart = htmlx.lastIndexOf('<', script.end - 1);
    str.overwrite(script.start, scriptStartTagEnd, useNewTransformation ? ';' : '</>;', {
        contentOnly: true
    });
    str.overwrite(scriptEndTagStart, script.end, useNewTransformation ? ';' : ';<>', {
        contentOnly: true
    });
}
function resolveImplicitStoreValue(node, implicitStoreValues, str, astOffset) {
    var _a;
    if (ts__default['default'].isVariableDeclaration(node)) {
        implicitStoreValues.addVariableDeclaration(node);
    }
    if (ts__default['default'].isImportClause(node)) {
        implicitStoreValues.addImportStatement(node);
    }
    if (ts__default['default'].isImportSpecifier(node)) {
        implicitStoreValues.addImportStatement(node);
    }
    if ((_a = ts__default['default'].isTypeAssertionExpression) === null || _a === void 0 ? void 0 : _a.call(ts__default['default'], node)) {
        handleTypeAssertion(str, node, astOffset);
    }
}
function throwIfIs$$EventsDeclaration(node, str, astOffset) {
    if (is$$EventsDeclaration(node)) {
        throw$$Error(node, str, astOffset, '$$Events');
    }
}
function throwIfIs$$SlotsDeclaration(node, str, astOffset) {
    if (is$$SlotsDeclaration(node)) {
        throw$$Error(node, str, astOffset, '$$Slots');
    }
}
function throwIfIs$$PropsDeclaration(node, str, astOffset) {
    if (is$$PropsDeclaration(node)) {
        throw$$Error(node, str, astOffset, '$$Props');
    }
}
function throw$$Error(node, str, astOffset, type) {
    throwError(node.getStart() + astOffset, node.getEnd() + astOffset, `${type} can only be declared in the instance script`, str.original);
}

/**
 * A component class name suffix is necessary to prevent class name clashes
 * like reported in https://github.com/sveltejs/language-tools/issues/294
 */
const COMPONENT_SUFFIX = '__SvelteComponent_';
function addComponentExport(params) {
    if (params.generics.has()) {
        addGenericsComponentExport(params);
    }
    else {
        addSimpleComponentExport(params);
    }
}
function addGenericsComponentExport({ strictEvents, canHaveAnyProp, exportedNames, componentDocumentation, fileName, mode, usesAccessors, str, generics }) {
    const genericsDef = generics.toDefinitionString();
    const genericsRef = generics.toReferencesString();
    const doc = componentDocumentation.getFormatted();
    const className = fileName && classNameFromFilename(fileName, mode !== 'dts');
    function returnType(forPart) {
        return `ReturnType<__sveltets_Render${genericsRef}['${forPart}']>`;
    }
    let statement = `
class __sveltets_Render${genericsDef} {
    props() {
        return ${props(true, canHaveAnyProp, exportedNames, `render${genericsRef}()`)}.props;
    }
    events() {
        return ${events(strictEvents, `render${genericsRef}()`)}.events;
    }
    slots() {
        return render${genericsRef}().slots;
    }
}
`;
    if (mode === 'dts') {
        statement +=
            `export type ${className}Props${genericsDef} = ${returnType('props')};\n` +
                `export type ${className}Events${genericsDef} = ${returnType('events')};\n` +
                `export type ${className}Slots${genericsDef} = ${returnType('slots')};\n` +
                `\n${doc}export default class${className ? ` ${className}` : ''}${genericsDef} extends SvelteComponentTyped<${className}Props${genericsRef}, ${className}Events${genericsRef}, ${className}Slots${genericsRef}> {` + // eslint-disable-line max-len
                exportedNames.createClassGetters() +
                (usesAccessors ? exportedNames.createClassAccessors() : '') +
                '\n}';
    }
    else {
        statement +=
            `\n\n${doc}export default class${className ? ` ${className}` : ''}${genericsDef} extends Svelte2TsxComponent<${returnType('props')}, ${returnType('events')}, ${returnType('slots')}> {` +
                exportedNames.createClassGetters() +
                (usesAccessors ? exportedNames.createClassAccessors() : '') +
                '\n}';
    }
    str.append(statement);
}
function addSimpleComponentExport({ strictEvents, isTsFile, canHaveAnyProp, exportedNames, componentDocumentation, fileName, mode, usesAccessors, str }) {
    const propDef = props(isTsFile, canHaveAnyProp, exportedNames, events(strictEvents, 'render()'));
    const doc = componentDocumentation.getFormatted();
    const className = fileName && classNameFromFilename(fileName, mode !== 'dts');
    let statement;
    if (mode === 'dts' && isTsFile) {
        statement =
            `\nconst __propDef = ${propDef};\n` +
                `export type ${className}Props = typeof __propDef.props;\n` +
                `export type ${className}Events = typeof __propDef.events;\n` +
                `export type ${className}Slots = typeof __propDef.slots;\n` +
                `\n${doc}export default class${className ? ` ${className}` : ''} extends SvelteComponentTyped<${className}Props, ${className}Events, ${className}Slots> {` + // eslint-disable-line max-len
                exportedNames.createClassGetters() +
                (usesAccessors ? exportedNames.createClassAccessors() : '') +
                '\n}';
    }
    else if (mode === 'dts' && !isTsFile) {
        statement =
            `\nconst __propDef = ${propDef};\n` +
                `/** @typedef {typeof __propDef.props}  ${className}Props */\n` +
                `/** @typedef {typeof __propDef.events}  ${className}Events */\n` +
                `/** @typedef {typeof __propDef.slots}  ${className}Slots */\n` +
                `\n${doc}export default class${className ? ` ${className}` : ''} extends __sveltets_1_createSvelteComponentTyped(${propDef}) {` +
                exportedNames.createClassGetters() +
                (usesAccessors ? exportedNames.createClassAccessors() : '') +
                '\n}';
    }
    else {
        statement =
            `\n\n${doc}export default class${className ? ` ${className}` : ''} extends __sveltets_1_createSvelte2TsxComponent(${propDef}) {` +
                exportedNames.createClassGetters() +
                (usesAccessors ? exportedNames.createClassAccessors() : '') +
                '\n}';
    }
    str.append(statement);
}
function events(strictEvents, renderStr) {
    return strictEvents ? renderStr : `__sveltets_1_with_any_event(${renderStr})`;
}
function props(isTsFile, canHaveAnyProp, exportedNames, renderStr) {
    if (isTsFile) {
        return canHaveAnyProp ? `__sveltets_1_with_any(${renderStr})` : renderStr;
    }
    else {
        const optionalProps = exportedNames.createOptionalPropsArray();
        const partial = `__sveltets_1_partial${canHaveAnyProp ? '_with_any' : ''}`;
        return optionalProps.length > 0
            ? `${partial}([${optionalProps.join(',')}], ${renderStr})`
            : `${partial}(${renderStr})`;
    }
}
/**
 * Returns a Svelte-compatible component name from a filename. Svelte
 * components must use capitalized tags, so we try to transform the filename.
 *
 * https://svelte.dev/docs#Tags
 */
function classNameFromFilename(filename, appendSuffix) {
    var _a;
    try {
        const withoutExtensions = (_a = path__default['default'].parse(filename).name) === null || _a === void 0 ? void 0 : _a.split('.')[0];
        const withoutInvalidCharacters = withoutExtensions
            .split('')
            // Although "-" is invalid, we leave it in, pascal-case-handling will throw it out later
            .filter((char) => /[A-Za-z$_\d-]/.test(char))
            .join('');
        const firstValidCharIdx = withoutInvalidCharacters
            .split('')
            // Although _ and $ are valid first characters for classes, they are invalid first characters
            // for tag names. For a better import autocompletion experience, we therefore throw them out.
            .findIndex((char) => /[A-Za-z]/.test(char));
        const withoutLeadingInvalidCharacters = withoutInvalidCharacters.substr(firstValidCharIdx);
        const inPascalCase = pascalCase.pascalCase(withoutLeadingInvalidCharacters);
        const finalName = firstValidCharIdx === -1 ? `A${inPascalCase}` : inPascalCase;
        return `${finalName}${appendSuffix ? COMPONENT_SUFFIX : ''}`;
    }
    catch (error) {
        console.warn(`Failed to create a name for the component class from filename ${filename}`);
        return undefined;
    }
}

function createRenderFunction({ str, scriptTag, scriptDestination, slots, events, exportedNames, isTsFile, uses$$props, uses$$restProps, uses$$slots, uses$$SlotsInterface, generics, mode }) {
    const useNewTransformation = mode === 'ts';
    const htmlx = str.original;
    let propsDecl = '';
    if (uses$$props) {
        propsDecl += ' let $$props = __sveltets_1_allPropsType();';
    }
    if (uses$$restProps) {
        propsDecl += ' let $$restProps = __sveltets_1_restPropsType();';
    }
    if (uses$$slots) {
        propsDecl +=
            ' let $$slots = __sveltets_1_slotsType({' +
                Array.from(slots.keys())
                    .map((name) => `'${name}': ''`)
                    .join(', ') +
                '});';
    }
    const slotsDeclaration = slots.size > 0 && mode !== 'dts'
        ? '\n' +
            surroundWithIgnoreComments(useNewTransformation
                ? ';const __sveltets_createSlot = __sveltets_2_createCreateSlot' +
                    (uses$$SlotsInterface ? '<$$Slots>' : '') +
                    '();'
                : ';const __sveltets_ensureSlot = __sveltets_1_createEnsureSlot' +
                    (uses$$SlotsInterface ? '<$$Slots>' : '') +
                    '();')
        : '';
    if (scriptTag) {
        //I couldn't get magicstring to let me put the script before the <> we prepend during conversion of the template to jsx, so we just close it instead
        const scriptTagEnd = htmlx.lastIndexOf('>', scriptTag.content.start) + 1;
        str.overwrite(scriptTag.start, scriptTag.start + 1, useNewTransformation ? ';' : '</>;');
        str.overwrite(scriptTag.start + 1, scriptTagEnd, `function render${generics.toDefinitionString(true)}() {${propsDecl}\n`);
        const scriptEndTagStart = htmlx.lastIndexOf('<', scriptTag.end - 1);
        // wrap template with callback
        str.overwrite(scriptEndTagStart, scriptTag.end, useNewTransformation
            ? `${slotsDeclaration};\nasync () => {`
            : `${slotsDeclaration};\n() => (<>`, {
            contentOnly: true
        });
    }
    else {
        str.prependRight(scriptDestination, `${useNewTransformation ? '' : '</>'};function render${generics.toDefinitionString(true)}() {` +
            `${propsDecl}${slotsDeclaration}\n${useNewTransformation ? 'async () => {' : '<>'}`);
    }
    const slotsAsDef = uses$$SlotsInterface
        ? '{} as unknown as $$Slots'
        : '{' +
            Array.from(slots.entries())
                .map(([name, attrs]) => {
                const attrsAsString = Array.from(attrs.entries())
                    .map(([exportName, expr]) => exportName.startsWith('__spread__')
                    ? `...${expr}`
                    : `${exportName}:${expr}`)
                    .join(', ');
                return `'${name}': {${attrsAsString}}`;
            })
                .join(', ') +
            '}';
    const returnString = `\nreturn { props: ${exportedNames.createPropsStr(isTsFile)}` +
        `, slots: ${slotsAsDef}` +
        `, events: ${events.toDefString()} }}`;
    // wrap template with callback
    if (useNewTransformation) {
        str.append('};');
    }
    else if (scriptTag) {
        str.append(');');
    }
    str.append(returnString);
}

function processSvelteTemplate(str, options) {
    const { htmlxAst, tags } = parseHtmlx(str.original, {
        ...options,
        useNewTransformation: (options === null || options === void 0 ? void 0 : options.mode) === 'ts'
    });
    let uses$$props = false;
    let uses$$restProps = false;
    let uses$$slots = false;
    let usesAccessors = !!options.accessors;
    const componentDocumentation = new ComponentDocumentation();
    //track if we are in a declaration scope
    const isDeclaration = { value: false };
    //track $store variables since we are only supposed to give top level scopes special treatment, and users can declare $blah variables at higher scopes
    //which prevents us just changing all instances of Identity that start with $
    const scopeStack = new ScopeStack();
    const stores = new Stores(scopeStack, isDeclaration);
    const scripts = new Scripts(htmlxAst);
    const handleSvelteOptions = (node) => {
        for (let i = 0; i < node.attributes.length; i++) {
            const optionName = node.attributes[i].name;
            const optionValue = node.attributes[i].value;
            switch (optionName) {
                case 'accessors':
                    if (Array.isArray(optionValue)) {
                        if (optionValue[0].type === 'MustacheTag') {
                            usesAccessors = optionValue[0].expression.value;
                        }
                    }
                    else {
                        usesAccessors = true;
                    }
                    break;
            }
        }
    };
    const handleIdentifier = (node) => {
        if (node.name === '$$props') {
            uses$$props = true;
            return;
        }
        if (node.name === '$$restProps') {
            uses$$restProps = true;
            return;
        }
        if (node.name === '$$slots') {
            uses$$slots = true;
            return;
        }
    };
    const handleStyleTag = (node) => {
        str.remove(node.start, node.end);
    };
    const slotHandler = new SlotHandler(str.original);
    let templateScope = new TemplateScope();
    const handleEach = (node) => {
        templateScope = templateScope.child();
        if (node.context) {
            handleScopeAndResolveForSlotInner(node.context, node.expression, node);
        }
    };
    const handleAwait = (node) => {
        templateScope = templateScope.child();
        if (node.value) {
            handleScopeAndResolveForSlotInner(node.value, node.expression, node.then);
        }
        if (node.error) {
            handleScopeAndResolveForSlotInner(node.error, node.expression, node.catch);
        }
    };
    const handleComponentLet = (component) => {
        templateScope = templateScope.child();
        const lets = slotHandler.getSlotConsumerOfComponent(component);
        for (const { letNode, slotName } of lets) {
            handleScopeAndResolveLetVarForSlot({
                letNode,
                slotName,
                slotHandler,
                templateScope,
                component
            });
        }
    };
    const handleScopeAndResolveForSlotInner = (identifierDef, initExpression, owner) => {
        handleScopeAndResolveForSlot({
            identifierDef,
            initExpression,
            slotHandler,
            templateScope,
            owner
        });
    };
    const eventHandler = new EventHandler();
    const onHtmlxWalk = (node, parent, prop) => {
        if (prop == 'params' &&
            (parent.type == 'FunctionDeclaration' || parent.type == 'ArrowFunctionExpression')) {
            isDeclaration.value = true;
        }
        if (prop == 'id' && parent.type == 'VariableDeclarator') {
            isDeclaration.value = true;
        }
        switch (node.type) {
            case 'Comment':
                componentDocumentation.handleComment(node);
                break;
            case 'Options':
                handleSvelteOptions(node);
                break;
            case 'Identifier':
                handleIdentifier(node);
                stores.handleIdentifier(node, parent, prop);
                eventHandler.handleIdentifier(node, parent, prop);
                break;
            case 'Transition':
            case 'Action':
            case 'Animation':
                stores.handleDirective(node, str);
                break;
            case 'Slot':
                slotHandler.handleSlot(node, templateScope);
                break;
            case 'Style':
                handleStyleTag(node);
                break;
            case 'Element':
                scripts.checkIfElementIsScriptTag(node, parent);
                break;
            case 'RawMustacheTag':
                scripts.checkIfContainsScriptTag(node);
                break;
            case 'BlockStatement':
                scopeStack.push();
                break;
            case 'FunctionDeclaration':
                scopeStack.push();
                break;
            case 'ArrowFunctionExpression':
                scopeStack.push();
                break;
            case 'EventHandler':
                eventHandler.handleEventHandler(node, parent);
                break;
            case 'VariableDeclarator':
                isDeclaration.value = true;
                break;
            case 'EachBlock':
                handleEach(node);
                break;
            case 'AwaitBlock':
                handleAwait(node);
                break;
            case 'InlineComponent':
                handleComponentLet(node);
                break;
        }
    };
    const onHtmlxLeave = (node, parent, prop, _index) => {
        if (prop == 'params' &&
            (parent.type == 'FunctionDeclaration' || parent.type == 'ArrowFunctionExpression')) {
            isDeclaration.value = false;
        }
        if (prop == 'id' && parent.type == 'VariableDeclarator') {
            isDeclaration.value = false;
        }
        const onTemplateScopeLeave = () => {
            templateScope = templateScope.parent;
        };
        switch (node.type) {
            case 'BlockStatement':
                scopeStack.pop();
                break;
            case 'FunctionDeclaration':
                scopeStack.pop();
                break;
            case 'ArrowFunctionExpression':
                scopeStack.pop();
                break;
            case 'EachBlock':
                onTemplateScopeLeave();
                break;
            case 'AwaitBlock':
                onTemplateScopeLeave();
                break;
            case 'InlineComponent':
                onTemplateScopeLeave();
                break;
        }
    };
    if (options.mode === 'ts') {
        convertHtmlxToJsx(str, htmlxAst, onHtmlxWalk, onHtmlxLeave, {
            preserveAttributeCase: (options === null || options === void 0 ? void 0 : options.namespace) == 'foreign',
            typingsNamespace: options.typingsNamespace
        });
    }
    else {
        convertHtmlxToJsx$1(str, htmlxAst, onHtmlxWalk, onHtmlxLeave, {
            preserveAttributeCase: (options === null || options === void 0 ? void 0 : options.namespace) == 'foreign'
        });
    }
    // resolve scripts
    const { scriptTag, moduleScriptTag } = scripts.getTopLevelScriptTags();
    if (options.mode !== 'ts') {
        scripts.blankOtherScriptTags(str);
    }
    //resolve stores
    const resolvedStores = stores.getStoreNames();
    return {
        htmlAst: htmlxAst,
        moduleScriptTag,
        scriptTag,
        slots: slotHandler.getSlotDef(),
        events: new ComponentEvents(eventHandler, tags.some((tag) => { var _a; return (_a = tag.attributes) === null || _a === void 0 ? void 0 : _a.some((a) => a.name === 'strictEvents'); }), str),
        uses$$props,
        uses$$restProps,
        uses$$slots,
        componentDocumentation,
        resolvedStores,
        usesAccessors
    };
}
function svelte2tsx(svelte, options = {}) {
    // TODO temporary
    options.mode = options.mode || 'ts';
    const str = new MagicString(svelte);
    // process the htmlx as a svelte template
    let { htmlAst, moduleScriptTag, scriptTag, slots, uses$$props, uses$$slots, uses$$restProps, events, componentDocumentation, resolvedStores, usesAccessors } = processSvelteTemplate(str, options);
    /* Rearrange the script tags so that module is first, and instance second followed finally by the template
     * This is a bit convoluted due to some trouble I had with magic string. A simple str.move(start,end,0) for each script wasn't enough
     * since if the module script was already at 0, it wouldn't move (which is fine) but would mean the order would be swapped when the script tag tried to move to 0
     * In this case we instead have to move it to moduleScriptTag.end. We track the location for the script move in the MoveInstanceScriptTarget var
     */
    let instanceScriptTarget = 0;
    if (moduleScriptTag) {
        if (moduleScriptTag.start != 0) {
            //move our module tag to the top
            str.move(moduleScriptTag.start, moduleScriptTag.end, 0);
        }
        else {
            //since our module script was already at position 0, we need to move our instance script tag to the end of it.
            instanceScriptTarget = moduleScriptTag.end;
        }
    }
    const renderFunctionStart = scriptTag
        ? str.original.lastIndexOf('>', scriptTag.content.start) + 1
        : instanceScriptTarget;
    const implicitStoreValues = new ImplicitStoreValues(resolvedStores, renderFunctionStart);
    //move the instance script and process the content
    let exportedNames = new ExportedNames(str, 0);
    let generics = new Generics(str, 0);
    let uses$$SlotsInterface = false;
    if (scriptTag) {
        //ensure it is between the module script and the rest of the template (the variables need to be declared before the jsx template)
        if (scriptTag.start != instanceScriptTarget) {
            str.move(scriptTag.start, scriptTag.end, instanceScriptTarget);
        }
        const res = processInstanceScriptContent(str, scriptTag, events, implicitStoreValues, options.mode, 
        /**hasModuleScripts */ !!moduleScriptTag);
        uses$$props = uses$$props || res.uses$$props;
        uses$$restProps = uses$$restProps || res.uses$$restProps;
        uses$$slots = uses$$slots || res.uses$$slots;
        ({ exportedNames, events, generics, uses$$SlotsInterface } = res);
    }
    //wrap the script tag and template content in a function returning the slot and exports
    createRenderFunction({
        str,
        scriptTag,
        scriptDestination: instanceScriptTarget,
        slots,
        events,
        exportedNames,
        isTsFile: options === null || options === void 0 ? void 0 : options.isTsFile,
        uses$$props,
        uses$$restProps,
        uses$$slots,
        uses$$SlotsInterface,
        generics,
        mode: options.mode
    });
    // we need to process the module script after the instance script has moved otherwise we get warnings about moving edited items
    if (moduleScriptTag) {
        processModuleScriptTag(str, moduleScriptTag, new ImplicitStoreValues(implicitStoreValues.getAccessedStores(), renderFunctionStart, scriptTag || options.mode === 'ts' ? undefined : (input) => `</>;${input}<>`), options.mode === 'ts');
    }
    addComponentExport({
        str,
        canHaveAnyProp: !exportedNames.uses$$Props && (uses$$props || uses$$restProps),
        strictEvents: events.hasStrictEvents(),
        isTsFile: options === null || options === void 0 ? void 0 : options.isTsFile,
        exportedNames,
        usesAccessors,
        fileName: options === null || options === void 0 ? void 0 : options.filename,
        componentDocumentation,
        mode: options.mode,
        generics
    });
    if (options.mode === 'dts') {
        // Prepend the import and for JS files a single definition.
        // The other shims need to be provided by the user ambient-style,
        // for example through filenames.push(require.resolve('svelte2tsx/svelte-shims.d.ts'))
        str.prepend('import { SvelteComponentTyped } from "svelte"\n' +
            ((options === null || options === void 0 ? void 0 : options.isTsFile)
                ? ''
                : // Not part of svelte-shims.d.ts because it would throw type errors as this function assumes
                    // the presence of a SvelteComponentTyped import
                    `
declare function __sveltets_1_createSvelteComponentTyped<Props, Events, Slots>(
    render: {props: Props, events: Events, slots: Slots }
): SvelteComponentConstructor<SvelteComponentTyped<Props, Events, Slots>,Svelte2TsxComponentConstructorParameters<Props>>;
`) +
            '\n');
        let code = str.toString();
        // Remove all tsx occurences and the template part from the output
        code = code
            // prepended before each script block
            .replace('<></>;', '')
            .replace('<></>;', '')
            // tsx in render function
            .replace(/<>.*<\/>/s, '')
            .replace('\n() => ();', '');
        return {
            code
        };
    }
    else {
        str.prepend('///<reference types="svelte" />\n');
        return {
            code: str.toString(),
            map: str.generateMap({ hires: true, source: options === null || options === void 0 ? void 0 : options.filename }),
            exportedNames: exportedNames.getExportsMap(),
            events: events.createAPI(),
            // not part of the public API so people don't start using it
            htmlAst
        };
    }
}

async function emitDts(config) {
    const svelteMap = await createSvelteMap(config);
    const { options, filenames } = loadTsconfig(config, svelteMap);
    const host = await createTsCompilerHost(options, svelteMap);
    const program = ts__default['default'].createProgram(filenames, options, host);
    program.emit();
}
function loadTsconfig(config, svelteMap) {
    const libRoot = config.libRoot || process.cwd();
    const jsconfigFile = ts__default['default'].findConfigFile(libRoot, ts__default['default'].sys.fileExists, 'jsconfig.json');
    let tsconfigFile = ts__default['default'].findConfigFile(libRoot, ts__default['default'].sys.fileExists);
    if (!tsconfigFile && !jsconfigFile) {
        throw new Error('Failed to locate tsconfig or jsconfig');
    }
    tsconfigFile = tsconfigFile || jsconfigFile;
    if (jsconfigFile && isSubpath(path__namespace.dirname(tsconfigFile), path__namespace.dirname(jsconfigFile))) {
        tsconfigFile = jsconfigFile;
    }
    tsconfigFile = path__namespace.isAbsolute(tsconfigFile) ? tsconfigFile : path__namespace.join(libRoot, tsconfigFile);
    const basepath = path__namespace.dirname(tsconfigFile);
    const { error, config: tsConfig } = ts__default['default'].readConfigFile(tsconfigFile, ts__default['default'].sys.readFile);
    if (error) {
        throw new Error('Malformed tsconfig\n' + JSON.stringify(error, null, 2));
    }
    // Rewire includes and files. This ensures that only the files inside the lib are traversed and
    // that the outputted types have the correct directory depth.
    // This is a little brittle because we then may include more than the user wants
    const libPathRelative = path__namespace.relative(basepath, libRoot).split(path__namespace.sep).join('/');
    if (libPathRelative) {
        tsConfig.include = [`${libPathRelative}/**/*`];
        tsConfig.files = [];
    }
    const { options, fileNames } = ts__default['default'].parseJsonConfigFileContent(tsConfig, ts__default['default'].sys, basepath, { sourceMap: false }, tsconfigFile, undefined, [{ extension: 'svelte', isMixedContent: true, scriptKind: ts__default['default'].ScriptKind.Deferred }]);
    const filenames = fileNames.map((name) => {
        if (!isSvelteFilepath(name)) {
            return name;
        }
        // We need to trick TypeScript into thinking that Svelte files
        // are either TS or JS files in order to generate correct d.ts
        // definition files.
        const isTsFile = svelteMap.add(name);
        return name + (isTsFile ? '.ts' : '.js');
    });
    // Add ambient functions so TS knows how to resolve its invocations in the
    // code output of svelte2tsx.
    filenames.push(config.svelteShimsPath);
    return {
        options: {
            ...options,
            noEmit: false,
            moduleResolution: ts__default['default'].ModuleResolutionKind.NodeJs,
            declaration: true,
            emitDeclarationOnly: true,
            declarationDir: config.declarationDir,
            allowNonTsExtensions: true
        },
        filenames
    };
}
async function createTsCompilerHost(options, svelteMap) {
    const host = ts__default['default'].createCompilerHost(options);
    // TypeScript writes the files relative to the found tsconfig/jsconfig
    // which - at least in the case of the tests - is wrong. Therefore prefix
    // the output paths. See Typescript issue #25430 for more.
    const pathPrefix = path__namespace.relative(process.cwd(), path__namespace.dirname(options.configFilePath));
    const svelteSys = {
        ...ts__default['default'].sys,
        fileExists(originalPath) {
            const path = ensureRealSvelteFilepath(originalPath);
            const exists = ts__default['default'].sys.fileExists(path);
            if (exists && isSvelteFilepath(path)) {
                const isTsFile = svelteMap.add(path);
                if ((isTsFile && !isTsFilepath(originalPath)) ||
                    (!isTsFile && isTsFilepath(originalPath))) {
                    return false;
                }
            }
            return exists;
        },
        readFile(path, encoding = 'utf-8') {
            if (isVirtualSvelteFilepath(path) || isSvelteFilepath(path)) {
                path = ensureRealSvelteFilepath(path);
                return svelteMap.get(path);
            }
            else {
                return ts__default['default'].sys.readFile(path, encoding);
            }
        },
        readDirectory(path, extensions, exclude, include, depth) {
            const extensionsWithSvelte = (extensions || []).concat('.svelte');
            return ts__default['default'].sys.readDirectory(path, extensionsWithSvelte, exclude, include, depth);
        },
        writeFile(fileName, data, writeByteOrderMark) {
            return ts__default['default'].sys.writeFile(pathPrefix ? path__namespace.join(pathPrefix, fileName) : fileName, data, writeByteOrderMark);
        }
    };
    host.fileExists = svelteSys.fileExists;
    host.readFile = svelteSys.readFile;
    host.readDirectory = svelteSys.readDirectory;
    host.writeFile = svelteSys.writeFile;
    host.resolveModuleNames = (moduleNames, containingFile, _reusedNames, _redirectedReference, compilerOptions) => {
        return moduleNames.map((moduleName) => {
            return resolveModuleName(moduleName, containingFile, compilerOptions);
        });
    };
    function resolveModuleName(name, containingFile, compilerOptions) {
        // Delegate to the TS resolver first.
        // If that does not bring up anything, try the Svelte Module loader
        // which is able to deal with .svelte files.
        const tsResolvedModule = ts__default['default'].resolveModuleName(name, containingFile, compilerOptions, ts__default['default'].sys).resolvedModule;
        if (tsResolvedModule && !isVirtualSvelteFilepath(tsResolvedModule.resolvedFileName)) {
            return tsResolvedModule;
        }
        return ts__default['default'].resolveModuleName(name, containingFile, compilerOptions, svelteSys)
            .resolvedModule;
    }
    return host;
}
/**
 * Generates a map to which we add the transformed code of Svelte files
 * early on when we first need to look at the file contents and can read
 * those transformed source later on.
 */
async function createSvelteMap(config) {
    const svelteFiles = new Map();
    function add(path) {
        var _a, _b;
        const code = ts__default['default'].sys.readFile(path, 'utf-8');
        const isTsFile = // svelte-preprocess allows default languages
         ['ts', 'typescript'].includes((_b = (_a = config.preprocess) === null || _a === void 0 ? void 0 : _a.defaultLanguages) === null || _b === void 0 ? void 0 : _b.script) ||
            /<script\s+[^>]*?lang=('|")(ts|typescript)('|")/.test(code);
        const transformed = svelte2tsx(code, {
            filename: path,
            isTsFile,
            mode: 'dts'
        }).code;
        svelteFiles.set(path, transformed);
        return isTsFile;
    }
    return { add, get: (key) => svelteFiles.get(key) };
}
function isSvelteFilepath(filePath) {
    return filePath.endsWith('.svelte');
}
function isTsFilepath(filePath) {
    return filePath.endsWith('.ts');
}
function isVirtualSvelteFilepath(filePath) {
    return filePath.endsWith('.svelte.ts') || filePath.endsWith('svelte.js');
}
function toRealSvelteFilepath(filePath) {
    return filePath.slice(0, -3); // -'.js'.length || -'.ts'.length
}
function ensureRealSvelteFilepath(filePath) {
    return isVirtualSvelteFilepath(filePath) ? toRealSvelteFilepath(filePath) : filePath;
}
function isSubpath(maybeParent, maybeChild) {
    const relative = path__namespace.relative(maybeParent, maybeChild);
    return relative && !relative.startsWith('..') && !path__namespace.isAbsolute(relative);
}

exports.emitDts = emitDts;
exports.svelte2tsx = svelte2tsx;
//# sourceMappingURL=index.js.map
