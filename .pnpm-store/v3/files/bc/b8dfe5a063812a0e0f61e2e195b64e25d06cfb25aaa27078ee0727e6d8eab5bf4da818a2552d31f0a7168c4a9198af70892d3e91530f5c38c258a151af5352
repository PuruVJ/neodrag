"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyShell = exports.stringifyArithmeticExpression = exports.stringifyArgumentSegment = exports.stringifyValueArgument = exports.stringifyRedirectArgument = exports.stringifyArgument = exports.stringifyEnvSegment = exports.stringifyCommand = exports.stringifyCommandChainThen = exports.stringifyCommandChain = exports.stringifyCommandLineThen = exports.stringifyCommandLine = exports.stringifyShellLine = exports.parseShell = void 0;
const shell_1 = require("./grammars/shell");
function parseShell(source, options = { isGlobPattern: () => false }) {
    try {
        return (0, shell_1.parse)(source, options);
    }
    catch (error) {
        if (error.location)
            error.message = error.message.replace(/(\.)?$/, ` (line ${error.location.start.line}, column ${error.location.start.column})$1`);
        throw error;
    }
}
exports.parseShell = parseShell;
function stringifyShellLine(shellLine, { endSemicolon = false } = {}) {
    return shellLine
        .map(({ command, type }, index) => `${stringifyCommandLine(command)}${type === `;`
        ? (index !== shellLine.length - 1 || endSemicolon ? `;` : ``)
        : ` &`}`)
        .join(` `);
}
exports.stringifyShellLine = stringifyShellLine;
exports.stringifyShell = stringifyShellLine;
function stringifyCommandLine(commandLine) {
    return `${stringifyCommandChain(commandLine.chain)}${commandLine.then ? ` ${stringifyCommandLineThen(commandLine.then)}` : ``}`;
}
exports.stringifyCommandLine = stringifyCommandLine;
function stringifyCommandLineThen(commandLineThen) {
    return `${commandLineThen.type} ${stringifyCommandLine(commandLineThen.line)}`;
}
exports.stringifyCommandLineThen = stringifyCommandLineThen;
function stringifyCommandChain(commandChain) {
    return `${stringifyCommand(commandChain)}${commandChain.then ? ` ${stringifyCommandChainThen(commandChain.then)}` : ``}`;
}
exports.stringifyCommandChain = stringifyCommandChain;
function stringifyCommandChainThen(commandChainThen) {
    return `${commandChainThen.type} ${stringifyCommandChain(commandChainThen.chain)}`;
}
exports.stringifyCommandChainThen = stringifyCommandChainThen;
function stringifyCommand(command) {
    switch (command.type) {
        case `command`:
            return `${command.envs.length > 0 ? `${command.envs.map(env => stringifyEnvSegment(env)).join(` `)} ` : ``}${command.args.map(argument => stringifyArgument(argument)).join(` `)}`;
        case `subshell`:
            return `(${stringifyShellLine(command.subshell)})${command.args.length > 0 ? ` ${command.args.map(argument => stringifyRedirectArgument(argument)).join(` `)}` : ``}`;
        case `group`:
            return `{ ${stringifyShellLine(command.group, { /* Bash compat */ endSemicolon: true })} }${command.args.length > 0 ? ` ${command.args.map(argument => stringifyRedirectArgument(argument)).join(` `)}` : ``}`;
        case `envs`:
            return command.envs.map(env => stringifyEnvSegment(env)).join(` `);
        default:
            throw new Error(`Unsupported command type:  "${command.type}"`);
    }
}
exports.stringifyCommand = stringifyCommand;
function stringifyEnvSegment(envSegment) {
    return `${envSegment.name}=${envSegment.args[0] ? stringifyValueArgument(envSegment.args[0]) : ``}`;
}
exports.stringifyEnvSegment = stringifyEnvSegment;
function stringifyArgument(argument) {
    switch (argument.type) {
        case `redirection`:
            return stringifyRedirectArgument(argument);
        case `argument`:
            return stringifyValueArgument(argument);
        default:
            throw new Error(`Unsupported argument type: "${argument.type}"`);
    }
}
exports.stringifyArgument = stringifyArgument;
function stringifyRedirectArgument(argument) {
    return `${argument.subtype} ${argument.args.map(argument => stringifyValueArgument(argument)).join(` `)}`;
}
exports.stringifyRedirectArgument = stringifyRedirectArgument;
function stringifyValueArgument(argument) {
    return argument.segments.map(segment => stringifyArgumentSegment(segment)).join(``);
}
exports.stringifyValueArgument = stringifyValueArgument;
function stringifyArgumentSegment(argumentSegment) {
    const doubleQuoteIfRequested = (string, quote) => quote ? `"${string}"` : string;
    const quoteIfNeeded = (text) => {
        if (text === ``)
            return `""`;
        if (!text.match(/[(){}<>$|&; \t"']/))
            return text;
        return `$'${text
            .replace(/\\/g, `\\\\`)
            .replace(/'/g, `\\'`)
            .replace(/\f/g, `\\f`)
            .replace(/\n/g, `\\n`)
            .replace(/\r/g, `\\r`)
            .replace(/\t/g, `\\t`)
            .replace(/\v/g, `\\v`)
            .replace(/\0/g, `\\0`)}'`;
    };
    switch (argumentSegment.type) {
        case `text`:
            return quoteIfNeeded(argumentSegment.text);
        case `glob`:
            return argumentSegment.pattern;
        case `shell`:
            return doubleQuoteIfRequested(`\${${stringifyShellLine(argumentSegment.shell)}}`, argumentSegment.quoted);
        case `variable`:
            return doubleQuoteIfRequested(typeof argumentSegment.defaultValue === `undefined`
                ? typeof argumentSegment.alternativeValue === `undefined`
                    ? `\${${argumentSegment.name}}`
                    : argumentSegment.alternativeValue.length === 0
                        ? `\${${argumentSegment.name}:+}`
                        : `\${${argumentSegment.name}:+${argumentSegment.alternativeValue.map(argument => stringifyValueArgument(argument)).join(` `)}}`
                : argumentSegment.defaultValue.length === 0
                    ? `\${${argumentSegment.name}:-}`
                    : `\${${argumentSegment.name}:-${argumentSegment.defaultValue.map(argument => stringifyValueArgument(argument)).join(` `)}}`, argumentSegment.quoted);
        case `arithmetic`:
            return `$(( ${stringifyArithmeticExpression(argumentSegment.arithmetic)} ))`;
        default:
            throw new Error(`Unsupported argument segment type: "${argumentSegment.type}"`);
    }
}
exports.stringifyArgumentSegment = stringifyArgumentSegment;
function stringifyArithmeticExpression(argument) {
    const getOperator = (type) => {
        switch (type) {
            case `addition`:
                return `+`;
            case `subtraction`:
                return `-`;
            case `multiplication`:
                return `*`;
            case `division`:
                return `/`;
            default:
                throw new Error(`Can't extract operator from arithmetic expression of type "${type}"`);
        }
    };
    const parenthesizeIfRequested = (string, parenthesize) => parenthesize ? `( ${string} )` : string;
    const stringifyAndParenthesizeIfNeeded = (expression) => 
    // Right now we parenthesize all arithmetic operator expressions because it's easier
    parenthesizeIfRequested(stringifyArithmeticExpression(expression), ![`number`, `variable`].includes(expression.type));
    switch (argument.type) {
        case `number`:
            return String(argument.value);
        case `variable`:
            return argument.name;
        default:
            return `${stringifyAndParenthesizeIfNeeded(argument.left)} ${getOperator(argument.type)} ${stringifyAndParenthesizeIfNeeded(argument.right)}`;
    }
}
exports.stringifyArithmeticExpression = stringifyArithmeticExpression;
