"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPromptsForSchema = exports.convertSmartDefaultsIntoNamedParams = exports.warnDeprecations = exports.combineOptionsForGenerator = exports.combineOptionsForExecutor = exports.applyVerbosity = exports.setDefaults = exports.validateObject = exports.validateOptsAgainstSchema = exports.SchemaError = exports.convertAliases = exports.coerceTypesInOptions = exports.convertToCamelCase = exports.handleErrors = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("./logger");
const output_1 = require("./output");
function handleErrors(isVerbose, fn) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            return yield fn();
        }
        catch (err) {
            err !== null && err !== void 0 ? err : (err = new Error('Unknown error caught'));
            if (err.constructor.name === 'UnsuccessfulWorkflowExecution') {
                logger_1.logger.error('The generator workflow failed. See above.');
            }
            else {
                const lines = (err.message ? err.message : err.toString()).split('\n');
                const bodyLines = lines.slice(1);
                if (err.stack && !isVerbose) {
                    bodyLines.push('Pass --verbose to see the stacktrace.');
                }
                output_1.output.error({
                    title: lines[0],
                    bodyLines,
                });
                if (err.stack && isVerbose) {
                    logger_1.logger.info(err.stack);
                }
            }
            return 1;
        }
    });
}
exports.handleErrors = handleErrors;
function camelCase(input) {
    if (input.indexOf('-') > 1) {
        return input
            .toLowerCase()
            .replace(/-(.)/g, (match, group1) => group1.toUpperCase());
    }
    else {
        return input;
    }
}
function convertToCamelCase(parsed, schema) {
    return Object.keys(parsed).reduce((m, c) => {
        if (schema.properties[camelCase(c)]) {
            return Object.assign(Object.assign({}, m), { [camelCase(c)]: parsed[c] });
        }
        else {
            return Object.assign(Object.assign({}, m), { [c]: parsed[c] });
        }
    }, {});
}
exports.convertToCamelCase = convertToCamelCase;
/**
 * Coerces (and replaces) options identified as 'boolean' or 'number' in the Schema
 *
 * @param opts The options to check
 * @param schema The schema definition with types to check against
 *
 */
function coerceTypesInOptions(opts, schema) {
    Object.keys(opts).forEach((k) => {
        const prop = findSchemaForProperty(k, schema);
        opts[k] = coerceType(prop === null || prop === void 0 ? void 0 : prop.description, opts[k]);
    });
    return opts;
}
exports.coerceTypesInOptions = coerceTypesInOptions;
function coerceType(prop, value) {
    if (!prop)
        return value;
    if (typeof value !== 'string' && value !== undefined)
        return value;
    if (prop.oneOf) {
        for (let i = 0; i < prop.oneOf.length; ++i) {
            const coerced = coerceType(prop.oneOf[i], value);
            if (coerced !== value) {
                return coerced;
            }
        }
        return value;
    }
    else if (Array.isArray(prop.type)) {
        for (let i = 0; i < prop.type.length; ++i) {
            const coerced = coerceType({ type: prop.type[i] }, value);
            if (coerced !== value) {
                return coerced;
            }
        }
        return value;
    }
    else if (normalizedPrimitiveType(prop.type) == 'boolean' &&
        isConvertibleToBoolean(value)) {
        return value === true || value == 'true';
    }
    else if (normalizedPrimitiveType(prop.type) == 'number' &&
        isConvertibleToNumber(value)) {
        return Number(value);
    }
    else if (prop.type == 'array') {
        return value.split(',').map((v) => coerceType(prop.items, v));
    }
    else {
        return value;
    }
}
/**
 * Converts any options passed in with short aliases to their full names if found
 * Unmatched options are added to opts['--']
 *
 * @param opts The options passed in by the user
 * @param schema The schema definition to check against
 */
function convertAliases(opts, schema, excludeUnmatched) {
    return Object.keys(opts).reduce((acc, k) => {
        const prop = findSchemaForProperty(k, schema);
        if (prop) {
            acc[prop.name] = opts[k];
        }
        else if (excludeUnmatched) {
            if (!acc['--']) {
                acc['--'] = [];
            }
            acc['--'].push({
                name: k,
                possible: [],
            });
        }
        else {
            acc[k] = opts[k];
        }
        return acc;
    }, {});
}
exports.convertAliases = convertAliases;
class SchemaError {
    constructor(message) {
        this.message = message;
    }
}
exports.SchemaError = SchemaError;
function validateOptsAgainstSchema(opts, schema) {
    validateObject(opts, schema, schema.definitions || {});
}
exports.validateOptsAgainstSchema = validateOptsAgainstSchema;
function validateObject(opts, schema, definitions) {
    var _a;
    if (schema.anyOf) {
        const errors = [];
        for (const s of schema.anyOf) {
            try {
                validateObject(opts, s, definitions);
            }
            catch (e) {
                errors.push(e);
            }
        }
        if (errors.length > 0) {
            throw new Error(`Options did not match schema. Please fix any of the following errors:\n${errors
                .map((e) => ' - ' + e.message)
                .join('\n')}`);
        }
    }
    if (schema.oneOf) {
        for (const s of schema.oneOf) {
            const errors = [];
            for (const s of schema.oneOf) {
                try {
                    validateObject(opts, s, definitions);
                }
                catch (e) {
                    errors.push(e);
                }
            }
            if (errors.length === schema.oneOf.length) {
                throw new Error(`Options did not match schema. Please fix 1 of the following errors:\n${errors
                    .map((e) => ' - ' + e.message)
                    .join('\n')}`);
            }
            if (errors.length < schema.oneOf.length - 1) {
                // TODO: This error could be better.
                throw new Error(`Options did not match schema.`);
            }
        }
    }
    ((_a = schema.required) !== null && _a !== void 0 ? _a : []).forEach((p) => {
        if (opts[p] === undefined) {
            throw new SchemaError(`Required property '${p}' is missing`);
        }
    });
    if (schema.additionalProperties === false) {
        Object.keys(opts).find((p) => {
            if (Object.keys(schema.properties).indexOf(p) === -1) {
                if (p === '_') {
                    throw new SchemaError(`Schema does not support positional arguments. Argument '${opts[p]}' found`);
                }
                else {
                    throw new SchemaError(`'${p}' is not found in schema`);
                }
            }
        });
    }
    Object.keys(opts).forEach((p) => {
        var _a;
        validateProperty(p, opts[p], ((_a = schema.properties) !== null && _a !== void 0 ? _a : {})[p], definitions);
    });
}
exports.validateObject = validateObject;
function validateProperty(propName, value, schema, definitions) {
    if (!schema)
        return;
    if (schema.$ref) {
        schema = resolveDefinition(schema.$ref, definitions);
    }
    if (schema.oneOf) {
        if (!Array.isArray(schema.oneOf))
            throw new Error(`Invalid schema file. oneOf must be an array.`);
        const passes = schema.oneOf.filter((r) => {
            try {
                const rule = Object.assign({ type: schema.type }, r);
                validateProperty(propName, value, rule, definitions);
                return true;
            }
            catch (e) {
                return false;
            }
        }).length === 1;
        if (!passes)
            throwInvalidSchema(propName, schema);
        return;
    }
    if (schema.anyOf) {
        if (!Array.isArray(schema.anyOf))
            throw new Error(`Invalid schema file. anyOf must be an array.`);
        let passes = false;
        schema.anyOf.forEach((r) => {
            try {
                const rule = Object.assign({ type: schema.type }, r);
                validateProperty(propName, value, rule, definitions);
                passes = true;
            }
            catch (e) { }
        });
        if (!passes)
            throwInvalidSchema(propName, schema);
        return;
    }
    if (schema.allOf) {
        if (!Array.isArray(schema.allOf))
            throw new Error(`Invalid schema file. anyOf must be an array.`);
        if (!schema.allOf.every((r) => {
            try {
                const rule = Object.assign({ type: schema.type }, r);
                validateProperty(propName, value, rule, definitions);
                return true;
            }
            catch (e) {
                return false;
            }
        })) {
            throwInvalidSchema(propName, schema);
        }
        return;
    }
    const isPrimitive = typeof value !== 'object';
    if (isPrimitive) {
        if (Array.isArray(schema.type)) {
            const passes = schema.type.some((t) => {
                try {
                    const rule = { type: t };
                    validateProperty(propName, value, rule, definitions);
                    return true;
                }
                catch (e) {
                    return false;
                }
            });
            if (!passes) {
                throw new SchemaError(`Property '${propName}' does not match the schema. '${value}' should be a '${schema.type}'.`);
            }
        }
        else if (schema.type &&
            typeof value !== normalizedPrimitiveType(schema.type)) {
            throw new SchemaError(`Property '${propName}' does not match the schema. '${value}' should be a '${schema.type}'.`);
        }
        if (schema.enum && !schema.enum.includes(value)) {
            throw new SchemaError(`Property '${propName}' does not match the schema. '${value}' should be one of ${schema.enum.join(',')}.`);
        }
        if (schema.type === 'number') {
            if (typeof schema.multipleOf === 'number' &&
                value % schema.multipleOf !== 0) {
                throw new SchemaError(`Property '${propName}' does not match the schema. ${value} should be a multiple of ${schema.multipleOf}.`);
            }
            if (typeof schema.minimum === 'number' && value < schema.minimum) {
                throw new SchemaError(`Property '${propName}' does not match the schema. ${value} should be at least ${schema.minimum}`);
            }
            if (typeof schema.exclusiveMinimum === 'number' &&
                value <= schema.exclusiveMinimum) {
                throw new SchemaError(`Property '${propName}' does not match the schema. ${value} should be greater than ${schema.exclusiveMinimum}`);
            }
            if (typeof schema.maximum === 'number' && value > schema.maximum) {
                throw new SchemaError(`Property '${propName}' does not match the schema. ${value} should be at most ${schema.maximum}`);
            }
            if (typeof schema.exclusiveMaximum === 'number' &&
                value >= schema.exclusiveMaximum) {
                throw new SchemaError(`Property '${propName}' does not match the schema. ${value} should be less than ${schema.exclusiveMaximum}`);
            }
        }
        if (schema.type === 'string') {
            if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
                throw new SchemaError(`Property '${propName}' does not match the schema. '${value}' should match the pattern '${schema.pattern}'.`);
            }
            if (typeof schema.minLength === 'number' &&
                value.length < schema.minLength) {
                throw new SchemaError(`Property '${propName}' does not match the schema. '${value}' (${value.length} character(s)) should have at least ${schema.minLength} character(s).`);
            }
            if (typeof schema.maxLength === 'number' &&
                value.length > schema.maxLength) {
                throw new SchemaError(`Property '${propName}' does not match the schema. '${value}' (${value.length} character(s)) should have at most ${schema.maxLength} character(s).`);
            }
        }
    }
    else if (Array.isArray(value)) {
        if (schema.type !== 'array')
            throwInvalidSchema(propName, schema);
        value.forEach((valueInArray) => validateProperty(propName, valueInArray, schema.items || {}, definitions));
    }
    else {
        if (schema.type !== 'object')
            throwInvalidSchema(propName, schema);
        validateObject(value, schema, definitions);
    }
}
/**
 * Unfortunately, due to use supporting Angular Devkit, we have to do the following
 * conversions.
 */
function normalizedPrimitiveType(type) {
    if (type === 'integer')
        return 'number';
    return type;
}
function throwInvalidSchema(propName, schema) {
    throw new SchemaError(`Property '${propName}' does not match the schema.\n${JSON.stringify(schema, null, 2)}'`);
}
function setDefaults(opts, schema) {
    setDefaultsInObject(opts, schema.properties || {}, schema.definitions || {});
    return opts;
}
exports.setDefaults = setDefaults;
function setDefaultsInObject(opts, properties, definitions) {
    Object.keys(properties).forEach((p) => {
        setPropertyDefault(opts, p, properties[p], definitions);
    });
}
function setPropertyDefault(opts, propName, schema, definitions) {
    if (schema.$ref) {
        schema = resolveDefinition(schema.$ref, definitions);
    }
    if (schema.type !== 'object' && schema.type !== 'array') {
        if (opts[propName] === undefined && schema.default !== undefined) {
            opts[propName] = schema.default;
        }
    }
    else if (schema.type === 'array') {
        const items = schema.items || {};
        if (opts[propName] &&
            Array.isArray(opts[propName]) &&
            items.type === 'object') {
            opts[propName].forEach((valueInArray) => setDefaultsInObject(valueInArray, items.properties || {}, definitions));
        }
        else if (!opts[propName] && schema.default) {
            opts[propName] = schema.default;
        }
    }
    else {
        const wasUndefined = opts[propName] === undefined;
        if (wasUndefined) {
            // We need an object to set values onto
            opts[propName] = {};
        }
        setDefaultsInObject(opts[propName], schema.properties || {}, definitions);
        // If the property was initially undefined but no properties were added, we remove it again instead of having an {}
        if (wasUndefined && Object.keys(opts[propName]).length === 0) {
            delete opts[propName];
        }
    }
}
function resolveDefinition(ref, definitions) {
    if (!ref.startsWith('#/definitions/')) {
        throw new Error(`$ref should start with "#/definitions/"`);
    }
    const definition = ref.split('#/definitions/')[1];
    if (!definitions[definition]) {
        throw new Error(`Cannot resolve ${ref}`);
    }
    return definitions[definition];
}
function applyVerbosity(options, schema, isVerbose) {
    if ((schema.additionalProperties || 'verbose' in schema.properties) &&
        isVerbose) {
        options['verbose'] = true;
    }
}
exports.applyVerbosity = applyVerbosity;
function combineOptionsForExecutor(commandLineOpts, config, target, schema, defaultProjectName, relativeCwd, isVerbose = false) {
    const r = convertAliases(coerceTypesInOptions(convertToCamelCase(commandLineOpts, schema), schema), schema, false);
    let combined = target.options || {};
    if (config && target.configurations && target.configurations[config]) {
        Object.assign(combined, target.configurations[config]);
    }
    combined = convertAliases(combined, schema, false);
    Object.assign(combined, r);
    convertSmartDefaultsIntoNamedParams(combined, schema, defaultProjectName, relativeCwd);
    warnDeprecations(combined, schema);
    setDefaults(combined, schema);
    validateOptsAgainstSchema(combined, schema);
    applyVerbosity(combined, schema, isVerbose);
    return combined;
}
exports.combineOptionsForExecutor = combineOptionsForExecutor;
function combineOptionsForGenerator(commandLineOpts, collectionName, generatorName, wc, schema, isInteractive, defaultProjectName, relativeCwd, isVerbose = false) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const generatorDefaults = wc
            ? getGeneratorDefaults(defaultProjectName, wc, collectionName, generatorName)
            : {};
        let combined = convertAliases(coerceTypesInOptions(Object.assign(Object.assign({}, generatorDefaults), commandLineOpts), schema), schema, false);
        convertSmartDefaultsIntoNamedParams(combined, schema, defaultProjectName, relativeCwd);
        if (isInteractive && isTTY()) {
            combined = yield promptForValues(combined, schema, wc);
        }
        warnDeprecations(combined, schema);
        setDefaults(combined, schema);
        validateOptsAgainstSchema(combined, schema);
        applyVerbosity(combined, schema, isVerbose);
        return combined;
    });
}
exports.combineOptionsForGenerator = combineOptionsForGenerator;
function warnDeprecations(opts, schema) {
    Object.keys(opts).forEach((option) => {
        var _a;
        const deprecated = (_a = schema.properties[option]) === null || _a === void 0 ? void 0 : _a['x-deprecated'];
        if (deprecated) {
            logger_1.logger.warn(`Option "${option}" is deprecated${typeof deprecated == 'string' ? ': ' + deprecated : '.'}`);
        }
    });
}
exports.warnDeprecations = warnDeprecations;
function convertSmartDefaultsIntoNamedParams(opts, schema, defaultProjectName, relativeCwd) {
    const argv = opts['_'] || [];
    const usedPositionalArgs = {};
    Object.entries(schema.properties).forEach(([k, v]) => {
        if (opts[k] === undefined &&
            v.$default !== undefined &&
            v.$default.$source === 'argv' &&
            argv[v.$default.index]) {
            usedPositionalArgs[v.$default.index] = true;
            opts[k] = coerceType(v, argv[v.$default.index]);
        }
        else if (v.$default !== undefined && v.$default.$source === 'unparsed') {
            opts[k] = opts['__overrides_unparsed__'] || [];
        }
        else if (opts[k] === undefined &&
            v.$default !== undefined &&
            v.$default.$source === 'projectName' &&
            defaultProjectName) {
            opts[k] = defaultProjectName;
        }
        else if (opts[k] === undefined &&
            v.format === 'path' &&
            v.visible === false &&
            relativeCwd) {
            opts[k] = relativeCwd.replace(/\\/g, '/');
        }
    });
    const leftOverPositionalArgs = [];
    for (let i = 0; i < argv.length; ++i) {
        if (!usedPositionalArgs[i]) {
            leftOverPositionalArgs.push(argv[i]);
        }
    }
    if (leftOverPositionalArgs.length === 0) {
        delete opts['_'];
    }
    else {
        opts['_'] = leftOverPositionalArgs;
    }
    delete opts['__overrides_unparsed__'];
}
exports.convertSmartDefaultsIntoNamedParams = convertSmartDefaultsIntoNamedParams;
function getGeneratorDefaults(projectName, wc, collectionName, generatorName) {
    var _a, _b;
    let defaults = {};
    if (wc === null || wc === void 0 ? void 0 : wc.generators) {
        if ((_a = wc.generators[collectionName]) === null || _a === void 0 ? void 0 : _a[generatorName]) {
            defaults = Object.assign(Object.assign({}, defaults), wc.generators[collectionName][generatorName]);
        }
        if (wc.generators[`${collectionName}:${generatorName}`]) {
            defaults = Object.assign(Object.assign({}, defaults), wc.generators[`${collectionName}:${generatorName}`]);
        }
    }
    if (projectName && ((_b = wc === null || wc === void 0 ? void 0 : wc.projects[projectName]) === null || _b === void 0 ? void 0 : _b.generators)) {
        const g = wc.projects[projectName].generators;
        if (g[collectionName] && g[collectionName][generatorName]) {
            defaults = Object.assign(Object.assign({}, defaults), g[collectionName][generatorName]);
        }
        if (g[`${collectionName}:${generatorName}`]) {
            defaults = Object.assign(Object.assign({}, defaults), g[`${collectionName}:${generatorName}`]);
        }
    }
    return defaults;
}
function getPromptsForSchema(opts, schema, wc) {
    const prompts = [];
    Object.entries(schema.properties).forEach(([k, v]) => {
        var _a;
        if (v['x-prompt'] && opts[k] === undefined) {
            const question = {
                name: k,
            };
            if (v.default) {
                question.initial = v.default;
            }
            // Normalize x-prompt
            if (typeof v['x-prompt'] === 'string') {
                const message = v['x-prompt'];
                v['x-prompt'] = {
                    type: v.type === 'boolean' ? 'confirm' : 'input',
                    message,
                };
            }
            question.message = v['x-prompt'].message;
            if (v.type === 'string' && v.enum && Array.isArray(v.enum)) {
                question.type = 'autocomplete';
                question.choices = [...v.enum];
            }
            else if (v.type === 'string' &&
                (((_a = v.$default) === null || _a === void 0 ? void 0 : _a.$source) === 'projectName' ||
                    k === 'project' ||
                    k === 'projectName' ||
                    v['x-dropdown'] === 'projects') &&
                wc) {
                question.type = 'autocomplete';
                question.choices = Object.keys(wc.projects);
            }
            else if (v.type === 'number' || v['x-prompt'].type == 'number') {
                question.message = v['x-prompt'].message;
                question.type = 'numeral';
            }
            else if (v['x-prompt'].type == 'confirmation' ||
                v['x-prompt'].type == 'confirm') {
                question.message = v['x-prompt'].message;
                question.type = 'confirm';
            }
            else if (v['x-prompt'].items) {
                question.message = v['x-prompt'].message;
                question.type =
                    v['x-prompt'].multiselect || v.type === 'array'
                        ? 'multiselect'
                        : 'autocomplete';
                question.choices =
                    v['x-prompt'].items &&
                        v['x-prompt'].items.map((item) => {
                            if (typeof item == 'string') {
                                return item;
                            }
                            else {
                                return {
                                    message: item.label,
                                    name: item.value,
                                };
                            }
                        });
            }
            else {
                question.message = v['x-prompt'].message;
                question.type = v.type === 'boolean' ? 'confirm' : 'input';
            }
            prompts.push(question);
        }
    });
    return prompts;
}
exports.getPromptsForSchema = getPromptsForSchema;
function promptForValues(opts, schema, wc) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return yield (yield Promise.resolve().then(() => require('enquirer')))
            .prompt(getPromptsForSchema(opts, schema, wc))
            .then((values) => (Object.assign(Object.assign({}, opts), values)))
            .catch((e) => {
            console.error(e);
            process.exit(0);
        });
    });
}
function findSchemaForProperty(propName, schema) {
    if (propName in schema.properties) {
        return {
            name: propName,
            description: schema.properties[propName],
        };
    }
    const found = Object.entries(schema.properties).find(([_, d]) => d.alias === propName ||
        (Array.isArray(d.aliases) && d.aliases.includes(propName)));
    if (found) {
        const [name, description] = found;
        return { name, description };
    }
    return null;
}
function isTTY() {
    return !!process.stdout.isTTY && process.env['CI'] !== 'true';
}
/**
 * Verifies whether the given value can be converted to a boolean
 * @param value
 */
function isConvertibleToBoolean(value) {
    if ('boolean' === typeof value) {
        return true;
    }
    if ('string' === typeof value && /true|false/.test(value)) {
        return true;
    }
    return false;
}
/**
 * Verifies whether the given value can be converted to a number
 * @param value
 */
function isConvertibleToNumber(value) {
    // exclude booleans explicitly
    if ('boolean' === typeof value) {
        return false;
    }
    return !isNaN(+value);
}
//# sourceMappingURL=params.js.map