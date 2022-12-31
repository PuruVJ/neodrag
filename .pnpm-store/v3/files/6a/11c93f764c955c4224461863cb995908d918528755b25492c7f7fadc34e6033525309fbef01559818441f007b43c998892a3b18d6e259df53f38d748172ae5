"use strict";
exports.__esModule = true;
exports.convertScssOrCss = void 0;
var regex_1 = require("../regex/regex");
var utility_1 = require("../utility");
var format_property_1 = require("./format.property");
var logger_1 = require("../logger");
/** converts scss/css to sass. */
function convertScssOrCss(text, STATE) {
    var isMultiple = regex_1.isMoreThanOneClassOrId(text);
    var lastSelector = STATE.CONTEXT.convert.lastSelector;
    // if NOT interpolated class, id or partial
    if (!/[\t ]*[#.%]\{.*?}/.test(text)) {
        if (lastSelector && new RegExp('^.*' + regex_1.escapeRegExp(lastSelector)).test(text)) {
            /*istanbul ignore if */
            if (STATE.CONFIG.debug)
                logger_1.SetConvertData({ type: 'LAST SELECTOR', text: text });
            var newText = text.replace(lastSelector, '');
            // TODO figure out what the commented code below does
            // if (isPseudoWithParenthesis(text)) {
            //   newText = newText.split('(')[0].trim() + '(&' + ')';
            // } else if (text.trim().startsWith(lastSelector)) {
            // } else {
            //   newText = newText.replace(/ /g, '') + ' &';
            // }
            newText = text.replace(lastSelector, '&');
            return {
                lastSelector: lastSelector,
                increaseTabSize: true,
                text: '\n'.concat(utility_1.replaceWithOffset(removeInvalidChars(newText).trimEnd(), STATE.CONFIG.tabSize, STATE))
            };
        }
        else if (regex_1.isCssOneLiner(text)) {
            /*istanbul ignore if */
            if (STATE.CONFIG.debug)
                logger_1.SetConvertData({ type: 'ONE LINER', text: text });
            var split = text.split('{');
            var properties = split[1].split(';');
            // Set isProp to true so that it Sets the property space.
            STATE.LOCAL_CONTEXT.isProp = true;
            var selector = split[0].trim();
            return {
                increaseTabSize: false,
                lastSelector: selector,
                text: selector.concat('\n', properties
                    .map(function (v) {
                    return utility_1.replaceWithOffset(format_property_1.setPropertyValueSpaces(STATE, removeInvalidChars(v)).trim(), STATE.CONFIG.tabSize, STATE);
                })
                    .join('\n')).trimEnd()
            };
        }
        else if (regex_1.isCssPseudo(text) && !isMultiple) {
            /*istanbul ignore if */
            if (STATE.CONFIG.debug)
                logger_1.SetConvertData({ type: 'PSEUDO', text: text });
            return {
                increaseTabSize: false,
                lastSelector: lastSelector,
                text: removeInvalidChars(text).trimEnd()
            };
        }
        else if (regex_1.isCssSelector(text)) {
            /*istanbul ignore if */
            if (STATE.CONFIG.debug)
                logger_1.SetConvertData({ type: 'SELECTOR', text: text });
            lastSelector = removeInvalidChars(text).trimEnd();
            return { text: lastSelector, increaseTabSize: false, lastSelector: lastSelector };
        }
    }
    /*istanbul ignore if */
    if (STATE.CONFIG.debug)
        logger_1.SetConvertData({ type: 'DEFAULT', text: text });
    return { text: removeInvalidChars(text).trimEnd(), increaseTabSize: false, lastSelector: lastSelector };
}
exports.convertScssOrCss = convertScssOrCss;
function removeInvalidChars(text) {
    var newText = '';
    var isInQuotes = false;
    var isInComment = false;
    var isInInterpolation = false;
    for (var i = 0; i < text.length; i++) {
        var char = text[i];
        if (!isInQuotes && char === '/' && text[i + 1] === '/') {
            isInComment = true;
        }
        else if (/['"]/.test(char)) {
            isInQuotes = !isInQuotes;
        }
        else if (/#/.test(char) && /{/.test(text[i + 1])) {
            isInInterpolation = true;
        }
        else if (isInInterpolation && /}/.test(text[i - 1])) {
            isInInterpolation = false;
        }
        if (!/[;\{\}]/.test(char) || isInQuotes || isInComment || isInInterpolation) {
            newText += char;
        }
    }
    return newText;
}
