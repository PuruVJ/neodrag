"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = exports.printGenHelp = exports.printChanges = void 0;
const tslib_1 = require("tslib");
const chalk = require("chalk");
const enquirer_1 = require("enquirer");
const fileutils_1 = require("../utils/fileutils");
const configuration_1 = require("../config/configuration");
const workspaces_1 = require("../config/workspaces");
const tree_1 = require("../generators/tree");
const project_graph_1 = require("../project-graph/project-graph");
const logger_1 = require("../utils/logger");
const params_1 = require("../utils/params");
const local_plugins_1 = require("../utils/plugins/local-plugins");
const print_help_1 = require("../utils/print-help");
const workspace_root_1 = require("../utils/workspace-root");
function printChanges(fileChanges) {
    fileChanges.forEach((f) => {
        if (f.type === 'CREATE') {
            console.log(`${chalk.green('CREATE')} ${f.path}`);
        }
        else if (f.type === 'UPDATE') {
            console.log(`${chalk.white('UPDATE')} ${f.path}`);
        }
        else if (f.type === 'DELETE') {
            console.log(`${chalk.yellow('DELETE')} ${f.path}`);
        }
    });
}
exports.printChanges = printChanges;
function promptForCollection(generatorName, ws, interactive, projectsConfiguration) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const packageJson = (0, fileutils_1.readJsonFile)(`${workspace_root_1.workspaceRoot}/package.json`);
        const localPlugins = (0, local_plugins_1.getLocalWorkspacePlugins)(projectsConfiguration);
        const installedCollections = Array.from(new Set([
            ...Object.keys(packageJson.dependencies || {}),
            ...Object.keys(packageJson.devDependencies || {}),
        ]));
        const choicesMap = new Set();
        for (const collectionName of installedCollections) {
            try {
                const { resolvedCollectionName, normalizedGeneratorName } = ws.readGenerator(collectionName, generatorName);
                choicesMap.add(`${resolvedCollectionName}:${normalizedGeneratorName}`);
            }
            catch (_a) { }
        }
        const choicesFromLocalPlugins = [];
        for (const [name] of localPlugins) {
            try {
                const { resolvedCollectionName, normalizedGeneratorName } = ws.readGenerator(name, generatorName);
                const value = `${resolvedCollectionName}:${normalizedGeneratorName}`;
                if (!choicesMap.has(value)) {
                    choicesFromLocalPlugins.push({
                        name: value,
                        message: chalk.bold(value),
                        value,
                    });
                }
            }
            catch (_b) { }
        }
        if (choicesFromLocalPlugins.length) {
            choicesFromLocalPlugins[choicesFromLocalPlugins.length - 1].message += '\n';
        }
        const choices = choicesFromLocalPlugins.concat(...choicesMap);
        if (choices.length === 1) {
            return typeof choices[0] === 'string' ? choices[0] : choices[0].value;
        }
        else if (!interactive && choices.length > 1) {
            throwInvalidInvocation(Array.from(choicesMap));
        }
        else if (interactive && choices.length > 1) {
            const noneOfTheAbove = `\nNone of the above`;
            choices.push(noneOfTheAbove);
            let { generator, customCollection } = yield (0, enquirer_1.prompt)([
                {
                    name: 'generator',
                    message: `Which generator would you like to use?`,
                    type: 'autocomplete',
                    // enquirer's typings are incorrect here... It supports (string | Choice)[], but is typed as (string[] | Choice[])
                    choices: choices,
                },
                {
                    name: 'customCollection',
                    type: 'input',
                    message: `Which collection would you like to use?`,
                    skip: function () {
                        // Skip this question if the user did not answer None of the above
                        return this.state.answers.generator !== noneOfTheAbove;
                    },
                    validate: function (value) {
                        if (this.skipped) {
                            return true;
                        }
                        try {
                            ws.readGenerator(value, generatorName);
                            return true;
                        }
                        catch (_a) {
                            logger_1.logger.error(`\nCould not find ${value}:${generatorName}`);
                            return false;
                        }
                    },
                },
            ]);
            return customCollection
                ? `${customCollection}:${generatorName}`
                : generator;
        }
        else {
            throw new Error(`Could not find any generators named "${generatorName}"`);
        }
    });
}
function parseGeneratorString(value) {
    const separatorIndex = value.lastIndexOf(':');
    if (separatorIndex > 0) {
        return {
            collection: value.slice(0, separatorIndex),
            generator: value.slice(separatorIndex + 1),
        };
    }
    else {
        return {
            generator: value,
        };
    }
}
function convertToGenerateOptions(generatorOptions, ws, defaultCollectionName, mode, projectsConfiguration) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let collectionName = null;
        let generatorName = null;
        const interactive = generatorOptions.interactive;
        if (mode === 'generate') {
            const generatorDescriptor = generatorOptions['generator'];
            const { collection, generator } = parseGeneratorString(generatorDescriptor);
            if (collection) {
                collectionName = collection;
                generatorName = generator;
            }
            else if (!defaultCollectionName) {
                const generatorString = yield promptForCollection(generatorDescriptor, ws, interactive, projectsConfiguration);
                const parsedGeneratorString = parseGeneratorString(generatorString);
                collectionName = parsedGeneratorString.collection;
                generatorName = parsedGeneratorString.generator;
            }
            else {
                collectionName = defaultCollectionName;
                generatorName = generatorDescriptor;
            }
        }
        else {
            collectionName = generatorOptions.collection;
            generatorName = 'new';
        }
        if (!collectionName) {
            throwInvalidInvocation(['@nrwl/workspace:library']);
        }
        const res = {
            collectionName,
            generatorName,
            generatorOptions,
            help: generatorOptions.help,
            dryRun: generatorOptions.dryRun,
            interactive,
            defaults: generatorOptions.defaults,
        };
        delete generatorOptions.d;
        delete generatorOptions.dryRun;
        delete generatorOptions['dry-run'];
        delete generatorOptions.interactive;
        delete generatorOptions.help;
        delete generatorOptions.collection;
        delete generatorOptions.verbose;
        delete generatorOptions.generator;
        delete generatorOptions['--'];
        delete generatorOptions['$0'];
        return res;
    });
}
function throwInvalidInvocation(availableGenerators) {
    throw new Error(`Specify the generator name (e.g., nx generate ${availableGenerators.join(', ')})`);
}
function readDefaultCollection(nxConfig) {
    return nxConfig.cli ? nxConfig.cli.defaultCollection : null;
}
function printGenHelp(opts, schema, normalizedGeneratorName, aliases) {
    (0, print_help_1.printHelp)(`generate ${opts.collectionName}:${normalizedGeneratorName}`, Object.assign(Object.assign({}, schema), { properties: schema.properties }), {
        mode: 'generate',
        plugin: opts.collectionName,
        entity: normalizedGeneratorName,
        aliases,
    });
}
exports.printGenHelp = printGenHelp;
function generate(cwd, args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (args['verbose']) {
            process.env.NX_VERBOSE_LOGGING = 'true';
        }
        const verbose = process.env.NX_VERBOSE_LOGGING === 'true';
        const ws = new workspaces_1.Workspaces(workspace_root_1.workspaceRoot);
        const nxJson = (0, configuration_1.readNxJson)();
        const projectGraph = yield (0, project_graph_1.createProjectGraphAsync)({ exitOnError: true });
        const projectsConfiguration = (0, project_graph_1.readProjectsConfigurationFromProjectGraph)(projectGraph);
        const workspaceConfiguration = Object.assign(Object.assign({}, nxJson), projectsConfiguration);
        return (0, params_1.handleErrors)(verbose, () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const opts = yield convertToGenerateOptions(args, ws, readDefaultCollection(nxJson), 'generate', projectsConfiguration);
            if (opts.dryRun) {
                process.env.NX_DRY_RUN = 'true';
            }
            const { normalizedGeneratorName, schema, implementationFactory, aliases } = ws.readGenerator(opts.collectionName, opts.generatorName);
            logger_1.logger.info(`NX Generating ${opts.collectionName}:${normalizedGeneratorName}`);
            if (opts.help) {
                printGenHelp(opts, schema, normalizedGeneratorName, aliases);
                return 0;
            }
            const combinedOpts = yield (0, params_1.combineOptionsForGenerator)(opts.generatorOptions, opts.collectionName, normalizedGeneratorName, workspaceConfiguration, schema, opts.interactive, ws.calculateDefaultProjectName(cwd, workspaceConfiguration), ws.relativeCwd(cwd), verbose);
            if (ws.isNxGenerator(opts.collectionName, normalizedGeneratorName)) {
                const host = new tree_1.FsTree(workspace_root_1.workspaceRoot, verbose);
                const implementation = implementationFactory();
                const task = yield implementation(host, combinedOpts);
                const changes = host.listChanges();
                printChanges(changes);
                if (!opts.dryRun) {
                    (0, tree_1.flushChanges)(workspace_root_1.workspaceRoot, changes);
                    if (task) {
                        yield task();
                    }
                }
                else {
                    logger_1.logger.warn(`\nNOTE: The "dryRun" flag means no changes were made.`);
                }
            }
            else {
                require('../adapter/compat');
                return (yield Promise.resolve().then(() => require('../adapter/ngcli-adapter'))).generate(workspace_root_1.workspaceRoot, Object.assign(Object.assign({}, opts), { generatorOptions: combinedOpts }), verbose);
            }
        }));
    });
}
exports.generate = generate;
//# sourceMappingURL=generate.js.map