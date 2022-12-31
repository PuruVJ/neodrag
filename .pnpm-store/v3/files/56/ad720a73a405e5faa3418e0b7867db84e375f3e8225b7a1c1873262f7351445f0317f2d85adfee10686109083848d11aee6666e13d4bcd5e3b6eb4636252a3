"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = exports.invokeNew = exports.wrapAngularDevkitSchematic = exports.mockSchematicsForTesting = exports.overrideCollectionResolutionForTesting = exports.runMigration = exports.generate = exports.NxScopeHostUsedForWrappedSchematics = exports.NxScopedHost = exports.scheduleTarget = void 0;
const tslib_1 = require("tslib");
/* eslint-disable no-restricted-imports */
const core_1 = require("@angular-devkit/core");
const chalk = require("chalk");
const node_1 = require("@angular-devkit/core/node");
const package_manager_1 = require("../utils/package-manager");
const workspaces_1 = require("../config/workspaces");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const logger_1 = require("../utils/logger");
const fileutils_1 = require("../utils/fileutils");
const json_1 = require("../utils/json");
const project_configuration_1 = require("../generators/utils/project-configuration");
const package_json_1 = require("../utils/package-json");
function scheduleTarget(root, opts, verbose) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { Architect } = require('@angular-devkit/architect');
        const { WorkspaceNodeModulesArchitectHost, } = require('@angular-devkit/architect/node');
        const logger = (0, exports.getLogger)(verbose);
        const fsHost = new NxScopedHost(root);
        const { workspace } = yield core_1.workspaces.readWorkspace((0, workspaces_1.workspaceConfigName)(root), core_1.workspaces.createWorkspaceHost(fsHost));
        const registry = new core_1.schema.CoreSchemaRegistry();
        registry.addPostTransform(core_1.schema.transforms.addUndefinedDefaults);
        registry.addSmartDefaultProvider('unparsed', () => {
            // This happens when context.scheduleTarget is used to run a target using nx:run-commands
            return [];
        });
        const architectHost = new WorkspaceNodeModulesArchitectHost(workspace, root);
        const architect = new Architect(architectHost, registry);
        const run = yield architect.scheduleTarget({
            project: opts.project,
            target: opts.target,
            configuration: opts.configuration,
        }, opts.runOptions, { logger });
        let lastOutputError;
        return run.output.pipe((0, operators_1.tap)((output) => (lastOutputError = !output.success ? output.error : undefined), (error) => { }, // do nothing, this could be an intentional error
        () => {
            lastOutputError ? logger.error(lastOutputError) : 0;
        }));
    });
}
exports.scheduleTarget = scheduleTarget;
function createWorkflow(fsHost, root, opts) {
    const NodeWorkflow = require('@angular-devkit/schematics/tools').NodeWorkflow;
    const workflow = new NodeWorkflow(fsHost, {
        force: false,
        dryRun: opts.dryRun,
        packageManager: (0, package_manager_1.detectPackageManager)(),
        root: (0, core_1.normalize)(root),
        registry: new core_1.schema.CoreSchemaRegistry(require('@angular-devkit/schematics').formats.standardFormats),
        resolvePaths: [process.cwd(), root],
    });
    workflow.registry.addPostTransform(core_1.schema.transforms.addUndefinedDefaults);
    workflow.engineHost.registerOptionsTransform(require('@angular-devkit/schematics/tools').validateOptionsWithSchema(workflow.registry));
    if (opts.interactive) {
        workflow.registry.usePromptProvider(createPromptProvider());
    }
    return workflow;
}
function getCollection(workflow, name) {
    const collection = workflow.engine.createCollection(name);
    if (!collection)
        throw new Error(`Cannot find collection '${name}'`);
    return collection;
}
function createRecorder(host, record, logger) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const actualConfigName = yield host.workspaceConfigName();
        return (event) => {
            let eventPath = event.path.startsWith('/')
                ? event.path.slice(1)
                : event.path;
            if (eventPath === 'workspace.json' || eventPath === 'angular.json') {
                eventPath = actualConfigName;
            }
            if (event.kind === 'error') {
                record.error = true;
                logger.warn(`ERROR! ${eventPath} ${event.description == 'alreadyExist'
                    ? 'already exists'
                    : 'does not exist.'}.`);
            }
            else if (event.kind === 'update') {
                record.loggingQueue.push(core_1.tags.oneLine `${chalk.white('UPDATE')} ${eventPath}`);
            }
            else if (event.kind === 'create') {
                record.loggingQueue.push(core_1.tags.oneLine `${chalk.green('CREATE')} ${eventPath}`);
            }
            else if (event.kind === 'delete') {
                record.loggingQueue.push(`${chalk.yellow('DELETE')} ${eventPath}`);
            }
            else if (event.kind === 'rename') {
                record.loggingQueue.push(`${chalk.blue('RENAME')} ${eventPath} => ${event.to}`);
            }
        };
    });
}
function runSchematic(host, root, workflow, logger, opts, schematic, printDryRunMessage = true, recorder = null) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const record = { loggingQueue: [], error: false };
        workflow.reporter.subscribe(recorder || (yield createRecorder(host, record, logger)));
        try {
            yield workflow
                .execute({
                collection: opts.collectionName,
                schematic: opts.generatorName,
                options: opts.generatorOptions,
                debug: false,
                logger,
            })
                .toPromise();
        }
        catch (e) {
            console.log(e);
            throw e;
        }
        if (!record.error) {
            record.loggingQueue.forEach((log) => logger.info(log));
        }
        if (opts.dryRun && printDryRunMessage) {
            logger.warn(`\nNOTE: The "dryRun" flag means no changes were made.`);
        }
        return { status: 0, loggingQueue: record.loggingQueue };
    });
}
class NxScopedHost extends core_1.virtualFs.ScopedHost {
    constructor(root) {
        super(new node_1.NodeJsSyncHost(), (0, core_1.normalize)(root));
        this.root = root;
        this.__readWorkspaceConfiguration = (configFileName, overrides) => {
            const readJsonFile = (path) => super
                .read(path)
                .pipe((0, operators_1.map)((data) => JSON.parse(Buffer.from(data).toString())));
            const readWorkspaceJsonFile = (nxJson) => {
                if (overrides === null || overrides === void 0 ? void 0 : overrides.workspace) {
                    return overrides.workspace;
                }
                else if (this.__nxInMemoryWorkspace) {
                    return (0, rxjs_1.of)(this.__nxInMemoryWorkspace);
                }
                else {
                    if (configFileName) {
                        return super
                            .read(configFileName)
                            .pipe((0, operators_1.map)((data) => (0, json_1.parseJson)(Buffer.from(data).toString())));
                    }
                    else {
                        const staticProjects = (0, workspaces_1.globForProjectFiles)(this.root);
                        this.__nxInMemoryWorkspace = (0, workspaces_1.buildWorkspaceConfigurationFromGlobs)(nxJson, staticProjects.filter((x) => (0, path_1.basename)(x) !== 'package.json'));
                        Object.entries(this.__nxInMemoryWorkspace.projects).forEach(([project, config]) => {
                            this.__nxInMemoryWorkspace.projects[project] = config.root;
                        });
                        return (0, rxjs_1.of)(this.__nxInMemoryWorkspace);
                    }
                }
            };
            const readNxJsonFile = () => {
                let nxJson = (overrides === null || overrides === void 0 ? void 0 : overrides.nx) ? overrides.nx : readJsonFile('nx.json');
                return nxJson.pipe((0, operators_1.map)((json) => {
                    if (json.extends) {
                        return Object.assign(Object.assign({}, require(json.extends)), json);
                    }
                    else {
                        return json;
                    }
                }));
            };
            return super.exists('nx.json').pipe((0, operators_1.switchMap)((nxJsonExists) => {
                let nxJsonObservable = rxjs_1.NEVER;
                if (nxJsonExists) {
                    nxJsonObservable = readNxJsonFile();
                }
                else {
                    nxJsonObservable = (0, rxjs_1.of)({});
                }
                const workspaceJsonObservable = nxJsonObservable.pipe((0, operators_1.switchMap)((x) => readWorkspaceJsonFile(x)));
                return (0, rxjs_1.forkJoin)([nxJsonObservable, workspaceJsonObservable]);
            }), (0, operators_1.switchMap)(([nxJson, workspaceJson]) => {
                try {
                    // resolve inline configurations and downlevel format
                    return this.resolveInlineProjectConfigurations(workspaceJson).pipe((0, operators_1.map)((x) => {
                        var _a, _b, _c;
                        const angularJson = x;
                        // assign props ng cli expects from nx json, if it exists
                        (_a = angularJson.cli) !== null && _a !== void 0 ? _a : (angularJson.cli = nxJson === null || nxJson === void 0 ? void 0 : nxJson.cli);
                        (_b = angularJson.generators) !== null && _b !== void 0 ? _b : (angularJson.generators = nxJson === null || nxJson === void 0 ? void 0 : nxJson.generators);
                        (_c = angularJson.defaultProject) !== null && _c !== void 0 ? _c : (angularJson.defaultProject = nxJson === null || nxJson === void 0 ? void 0 : nxJson.defaultProject);
                        if (workspaceJson.version === 2) {
                            const formatted = (0, workspaces_1.toOldFormatOrNull)(workspaceJson);
                            return formatted
                                ? Buffer.from((0, json_1.serializeJson)(formatted))
                                : Buffer.from((0, json_1.serializeJson)(x));
                        }
                        return Buffer.from((0, json_1.serializeJson)(x));
                    }));
                }
                catch (_a) {
                    return (0, rxjs_1.of)(Buffer.from((0, json_1.serializeJson)(workspaceJson)));
                }
            }));
        };
    }
    read(path) {
        return this.context(path).pipe((0, operators_1.switchMap)((r) => {
            if (r.isWorkspaceConfig) {
                return this.__readWorkspaceConfiguration(r.actualConfigFileName);
            }
            else {
                return super.read(path);
            }
        }));
    }
    write(path, content) {
        return this.context(path).pipe((0, operators_1.switchMap)((r) => {
            if (r.isWorkspaceConfig) {
                return this.writeWorkspaceConfiguration(r, content);
            }
            else {
                return super.write(path, content);
            }
        }));
    }
    isFile(path) {
        return this.context(path).pipe((0, operators_1.switchMap)((r) => {
            if (r.isWorkspaceConfig) {
                return (0, rxjs_1.of)(true); // isWorkspaceConfig means its a file
            }
            else {
                return super.isFile(path);
            }
        }));
    }
    exists(path) {
        return this.context(path).pipe((0, operators_1.switchMap)((r) => {
            if (r.isWorkspaceConfig) {
                return (0, rxjs_1.of)(true);
            }
            else {
                return super.exists(path);
            }
        }));
    }
    workspaceConfigName() {
        return super
            .exists('/angular.json')
            .pipe((0, operators_1.map)((hasAngularJson) => hasAngularJson ? 'angular.json' : 'workspace.json'))
            .toPromise();
    }
    context(path) {
        if (isWorkspaceConfigPath(path)) {
            return (0, rxjs_1.forkJoin)([
                super.exists('/angular.json'),
                super.exists('/workspace.json'),
            ]).pipe((0, operators_1.switchMap)(([isAngularJson, isWorkspaceJson]) => {
                if (!isAngularJson && !isWorkspaceJson) {
                    return (0, rxjs_1.of)({
                        isWorkspaceConfig: true,
                        actualConfigFileName: null,
                        // AngularJson / WorkspaceJson v2 is always used for standalone project config
                        isNewFormat: true,
                    });
                }
                const actualConfigFileName = isAngularJson
                    ? '/angular.json'
                    : '/workspace.json';
                return super.read(actualConfigFileName).pipe((0, operators_1.map)((r) => {
                    try {
                        const w = (0, json_1.parseJson)(Buffer.from(r).toString());
                        return {
                            isWorkspaceConfig: true,
                            actualConfigFileName,
                            isNewFormat: w.version === 2,
                        };
                    }
                    catch (_a) {
                        return {
                            isWorkspaceConfig: true,
                            actualConfigFileName,
                            isNewFormat: false,
                        };
                    }
                }));
            }));
        }
        else {
            return (0, rxjs_1.of)({
                isWorkspaceConfig: false,
                actualConfigFileName: null,
                isNewFormat: false,
            });
        }
    }
    writeWorkspaceConfiguration(context, content) {
        const config = (0, json_1.parseJson)(Buffer.from(content).toString());
        if (context.isNewFormat) {
            try {
                const w = (0, json_1.parseJson)(Buffer.from(content).toString());
                const formatted = (0, workspaces_1.toNewFormatOrNull)(w);
                if (formatted) {
                    const { cli, generators, defaultProject } = formatted, workspaceJson = tslib_1.__rest(formatted, ["cli", "generators", "defaultProject"]);
                    cli === null || cli === void 0 ? true : delete cli.schematicCollections;
                    return (0, rxjs_1.merge)(this.writeWorkspaceConfigFiles(context, workspaceJson), cli || generators || defaultProject
                        ? this.__saveNxJsonProps({ cli, generators, defaultProject })
                        : (0, rxjs_1.of)(null));
                }
                else {
                    const { cli, schematics, generators, defaultProject } = w, angularJson = tslib_1.__rest(w, ["cli", "schematics", "generators", "defaultProject"]);
                    cli === null || cli === void 0 ? true : delete cli.schematicCollections;
                    return (0, rxjs_1.merge)(this.writeWorkspaceConfigFiles(context, angularJson), cli || schematics
                        ? this.__saveNxJsonProps({
                            cli,
                            defaultProject,
                            generators: schematics || generators,
                        })
                        : (0, rxjs_1.of)(null));
                }
            }
            catch (e) { }
        }
        const { cli, schematics, generators, defaultProject } = config, angularJson = tslib_1.__rest(config, ["cli", "schematics", "generators", "defaultProject"]);
        cli === null || cli === void 0 ? true : delete cli.schematicCollections;
        return (0, rxjs_1.merge)(this.writeWorkspaceConfigFiles(context, angularJson), this.__saveNxJsonProps({
            cli,
            defaultProject,
            generators: schematics || generators,
        }));
    }
    __saveNxJsonProps(props) {
        const nxJsonPath = 'nx.json';
        return super.read(nxJsonPath).pipe((0, operators_1.switchMap)((buf) => {
            const nxJson = (0, json_1.parseJson)(Buffer.from(buf).toString());
            Object.assign(nxJson, props);
            return super.write(nxJsonPath, Buffer.from((0, json_1.serializeJson)(nxJson)));
        }));
    }
    writeWorkspaceConfigFiles({ actualConfigFileName: workspaceFileName, isNewFormat }, config) {
        var _a;
        // copy to avoid removing inlined config files.
        const writeObservables = [];
        const configToWrite = Object.assign(Object.assign({}, config), { projects: Object.assign({}, config.projects) });
        const projects = Object.entries(configToWrite.projects);
        for (const [project, projectConfig] of projects) {
            if (!workspaceFileName) {
                (_a = projectConfig.configFilePath) !== null && _a !== void 0 ? _a : (projectConfig.configFilePath = `${projectConfig.root}/project.json`);
            }
            if (projectConfig.configFilePath) {
                if (workspaceFileName && !isNewFormat) {
                    throw new Error('Attempted to write standalone project configuration into a v1 workspace');
                }
                // project was read from a project.json file
                const configPath = projectConfig.configFilePath;
                const fileConfigObject = Object.assign({ name: project }, projectConfig);
                delete fileConfigObject.root; // remove the root before writing
                delete fileConfigObject.configFilePath; // remove the configFilePath before writing
                const projectJsonWrite = super.write(configPath, Buffer.from((0, json_1.serializeJson)(fileConfigObject))); // write back to the project.json file
                writeObservables.push(projectJsonWrite);
                configToWrite.projects[project] = (0, core_1.normalize)((0, path_1.dirname)(configPath)); // update the config object to point to the written file.
            }
        }
        if (workspaceFileName) {
            const workspaceJsonWrite = super.write(workspaceFileName, Buffer.from((0, json_1.serializeJson)(configToWrite)));
            writeObservables.push(workspaceJsonWrite);
        }
        return (0, rxjs_1.merge)(...writeObservables);
    }
    resolveInlineProjectConfigurations(config) {
        var _a;
        // Creates an observable where each emission is a project configuration
        // that is not listed inside workspace.json. Each time it encounters a
        // standalone config, observable is updated by concatenating the new
        // config read operation.
        const observables = [];
        Object.entries((_a = config.projects) !== null && _a !== void 0 ? _a : {}).forEach(([project, projectConfig]) => {
            if (typeof projectConfig === 'string') {
                // configFilePath is not written to files, but is stored on the config object
                // so that we know where to save the project's configuration if it was updated
                // by another angular schematic.
                const configFilePath = (0, path_1.join)(projectConfig, 'project.json');
                const next = this.read(configFilePath).pipe((0, operators_1.map)((x) => ({
                    project,
                    projectConfig: Object.assign(Object.assign({ root: (0, path_1.dirname)(configFilePath) }, (0, json_1.parseJson)(Buffer.from(x).toString())), { configFilePath }),
                })));
                observables.push(next);
            }
        });
        return (0, rxjs_1.merge)(...observables).pipe((0, operators_1.toArray)(), (0, operators_1.map)((configs) => {
            configs.forEach(({ project, projectConfig }) => {
                config.projects[project] = projectConfig;
            });
            return config;
        }));
    }
}
exports.NxScopedHost = NxScopedHost;
class NxScopeHostUsedForWrappedSchematics extends NxScopedHost {
    constructor(root, host) {
        super(root);
        this.host = host;
    }
    read(path) {
        if (isWorkspaceConfigPath(path)) {
            const nxJsonChange = findMatchingFileChange(this.host, 'nx.json');
            const match = findWorkspaceConfigFileChange(this.host);
            let workspaceJsonOverride;
            let actualConfigFileName = [
                '/workspace.json',
                '/angular.json',
            ].filter((f) => this.host.exists(f))[0];
            if (actualConfigFileName) {
                if (match) {
                    workspaceJsonOverride = (0, rxjs_1.of)((0, json_1.parseJson)(match.content.toString()));
                }
            }
            else if (!this.__nxInMemoryWorkspace) {
                // if we've already dealt with this, let NxScopedHost read the cache...
                // projects created inside a generator will not be visible
                // to glob when it runs in nx/shared/workspace, so
                // we have to add them into the file.
                const createdProjectFiles = findCreatedProjects(this.host);
                const deletedProjectFiles = findDeletedProjects(this.host);
                const nxJsonInTree = (0, project_configuration_1.readNxJson)(this.host);
                const readJsonWithHost = (file) => (Object.assign({ root: (0, path_1.dirname)(file) }, (0, json_1.parseJson)(this.host.read(file).toString())));
                const staticProjects = (0, workspaces_1.buildWorkspaceConfigurationFromGlobs)(nxJsonInTree, (0, workspaces_1.globForProjectFiles)(this.host.root).filter((x) => (0, path_1.basename)(x) !== 'package.json'), readJsonWithHost);
                const createdProjects = (0, workspaces_1.buildWorkspaceConfigurationFromGlobs)(nxJsonInTree, createdProjectFiles.map((x) => x.path), readJsonWithHost).projects;
                deletedProjectFiles.forEach((file) => {
                    const matchingStaticProject = Object.entries(staticProjects.projects).find(([, config]) => config.root === (0, path_1.dirname)(file.path));
                    if (matchingStaticProject) {
                        delete staticProjects.projects[matchingStaticProject[0]];
                    }
                });
                const workspace = Object.assign(Object.assign({}, staticProjects), { projects: Object.assign(Object.assign({}, staticProjects.projects), createdProjects) });
                workspaceJsonOverride = (0, rxjs_1.of)(Object.assign(Object.assign({}, workspace), { 
                    // all projects **must** be standalone if workspace.json doesn't exist
                    // since the NxScopedHost already handles the standalone config case,
                    // lets pass them as standalone.
                    projects: Object.fromEntries(Object.entries(workspace.projects).map(([project, config]) => [
                        project,
                        config.root,
                    ])) }));
            }
            // no match, default to existing behavior
            if (!workspaceJsonOverride && !nxJsonChange) {
                return super.read(path);
            }
            // we try to format it, if it changes, return it, otherwise return the original change
            try {
                return this.__readWorkspaceConfiguration(actualConfigFileName, {
                    // we are overriding workspaceJson + nxJson,
                    workspace: workspaceJsonOverride,
                    nx: nxJsonChange
                        ? (0, rxjs_1.of)((0, json_1.parseJson)(nxJsonChange.content.toString()))
                        : null,
                });
            }
            catch (e) {
                return super.read(path);
            }
        }
        else {
            const match = findMatchingFileChange(this.host, path);
            if (match) {
                // found a matching change in the host
                return (0, rxjs_1.of)(Buffer.from(match.content));
            }
            else if (
            // found a change to workspace config, and reading a project config file
            (0, path_1.basename)(path) === 'project.json' &&
                findWorkspaceConfigFileChange(this.host)) {
                return (0, rxjs_1.of)(this.host.read(path));
            }
            else {
                // found neither, use default read method
                return super.read(path);
            }
        }
    }
    exists(path) {
        if (isWorkspaceConfigPath(path)) {
            return findWorkspaceConfigFileChange(this.host)
                ? (0, rxjs_1.of)(true)
                : super.exists(path);
        }
        else {
            return findMatchingFileChange(this.host, path)
                ? (0, rxjs_1.of)(true)
                : super.exists(path);
        }
    }
    isDirectory(path) {
        return super.isDirectory(path).pipe((0, operators_1.catchError)(() => (0, rxjs_1.of)(false)), (0, operators_1.switchMap)((isDirectory) => isDirectory
            ? (0, rxjs_1.of)(true)
            : (0, rxjs_1.of)(this.host.exists(path) && !this.host.isFile(path))));
    }
    isFile(path) {
        if (isWorkspaceConfigPath(path)) {
            return findWorkspaceConfigFileChange(this.host)
                ? (0, rxjs_1.of)(true)
                : super.isFile(path);
        }
        else {
            return findMatchingFileChange(this.host, path)
                ? (0, rxjs_1.of)(true)
                : super.isFile(path);
        }
    }
    list(path) {
        const fragments = this.host.children(path).map((child) => (0, core_1.fragment)(child));
        return (0, rxjs_1.of)(fragments);
    }
}
exports.NxScopeHostUsedForWrappedSchematics = NxScopeHostUsedForWrappedSchematics;
function findWorkspaceConfigFileChange(host) {
    return host
        .listChanges()
        .find((f) => f.path == 'workspace.json' || f.path == 'angular.json');
}
function findCreatedProjects(host) {
    return host
        .listChanges()
        .filter((f) => f.type === 'CREATE' && (0, path_1.basename)(f.path) === 'project.json');
}
function findDeletedProjects(host) {
    return host
        .listChanges()
        .filter((f) => f.type === 'DELETE' && (0, path_1.basename)(f.path) === 'project.json');
}
function findMatchingFileChange(host, path) {
    const targetPath = (0, core_1.normalize)(path.startsWith('/') ? path.substring(1) : path.toString());
    return host
        .listChanges()
        .find((f) => f.type !== 'DELETE' && (0, core_1.normalize)(f.path) === targetPath);
}
function isWorkspaceConfigPath(p) {
    return (p === 'angular.json' ||
        p === '/angular.json' ||
        p === 'workspace.json' ||
        p === '/workspace.json');
}
function generate(root, opts, verbose) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const logger = (0, exports.getLogger)(verbose);
        const fsHost = new NxScopedHost(root);
        const workflow = createWorkflow(fsHost, root, opts);
        const collection = getCollection(workflow, opts.collectionName);
        const schematic = collection.createSchematic(opts.generatorName, true);
        return (yield runSchematic(fsHost, root, workflow, logger, Object.assign(Object.assign({}, opts), { generatorName: schematic.description.name }), schematic)).status;
    });
}
exports.generate = generate;
function createPromptProvider() {
    return (definitions) => {
        const questions = definitions.map((definition) => {
            const question = {
                name: definition.id,
                message: definition.message,
            };
            if (definition.default) {
                question.initial = definition.default;
            }
            const validator = definition.validator;
            if (validator) {
                question.validate = (input) => validator(input);
            }
            switch (definition.type) {
                case 'string':
                case 'input':
                    return Object.assign(Object.assign({}, question), { type: 'input' });
                case 'boolean':
                case 'confirmation':
                case 'confirm':
                    return Object.assign(Object.assign({}, question), { type: 'confirm' });
                case 'number':
                case 'numeral':
                    return Object.assign(Object.assign({}, question), { type: 'numeral' });
                case 'list':
                    return Object.assign(Object.assign({}, question), { type: !!definition.multiselect ? 'multiselect' : 'select', choices: definition.items &&
                            definition.items.map((item) => {
                                if (typeof item == 'string') {
                                    return item;
                                }
                                else {
                                    return {
                                        message: item.label,
                                        name: item.value,
                                    };
                                }
                            }) });
                default:
                    return Object.assign(Object.assign({}, question), { type: definition.type });
            }
        });
        return require('enquirer').prompt(questions);
    };
}
function runMigration(root, packageName, migrationName, isVerbose) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const logger = (0, exports.getLogger)(isVerbose);
        const fsHost = new NxScopedHost(root);
        const workflow = createWorkflow(fsHost, root, {});
        const collection = resolveMigrationsCollection(packageName);
        const record = { loggingQueue: [], error: false };
        workflow.reporter.subscribe(yield createRecorder(fsHost, record, logger));
        yield workflow
            .execute({
            collection,
            schematic: migrationName,
            options: {},
            debug: false,
            logger: logger,
        })
            .toPromise();
        return {
            loggingQueue: record.loggingQueue,
            madeChanges: record.loggingQueue.length > 0,
        };
    });
}
exports.runMigration = runMigration;
function resolveMigrationsCollection(name) {
    var _a;
    let collectionPath = undefined;
    if (name.startsWith('.') || name.startsWith('/')) {
        name = (0, path_1.resolve)(name);
    }
    if ((0, path_1.extname)(name)) {
        collectionPath = require.resolve(name);
    }
    else {
        const { path: packageJsonPath, packageJson } = (0, package_json_1.readModulePackageJson)(name, [
            process.cwd(),
        ]);
        let pkgJsonSchematics = (_a = packageJson['nx-migrations']) !== null && _a !== void 0 ? _a : packageJson['ng-update'];
        if (!pkgJsonSchematics) {
            throw new Error(`Could not find migrations in package: "${name}"`);
        }
        if (typeof pkgJsonSchematics != 'string') {
            pkgJsonSchematics = pkgJsonSchematics.migrations;
        }
        collectionPath = require.resolve(pkgJsonSchematics, {
            paths: [(0, path_1.dirname)(packageJsonPath)],
        });
    }
    try {
        if (collectionPath) {
            (0, fileutils_1.readJsonFile)(collectionPath);
            return collectionPath;
        }
    }
    catch (_b) {
        throw new Error(`Invalid migration file in package: "${name}"`);
    }
    throw new Error(`Collection cannot be resolved: "${name}"`);
}
function convertEventTypeToHandleMultipleConfigNames(host, eventPath, content) {
    const actualConfigName = host.exists('/angular.json')
        ? 'angular.json'
        : 'workspace.json';
    const isWorkspaceConfig = eventPath === 'angular.json' || eventPath === 'workspace.json';
    if (isWorkspaceConfig) {
        let isNewFormat = true;
        try {
            isNewFormat =
                (0, json_1.parseJson)(host.read(actualConfigName, 'utf-8')).version === 2;
        }
        catch (e) { }
        if (content && isNewFormat) {
            const formatted = (0, workspaces_1.toNewFormat)((0, json_1.parseJson)(content.toString()));
            if (formatted) {
                return {
                    eventPath: actualConfigName,
                    content: Buffer.from((0, json_1.serializeJson)(formatted)),
                };
            }
            else {
                return { eventPath: actualConfigName, content };
            }
        }
        else {
            return { eventPath: actualConfigName, content };
        }
    }
    else {
        return { eventPath, content };
    }
}
let collectionResolutionOverrides = null;
let mockedSchematics = null;
/**
 * By default, Angular Devkit schematic collections will be resolved using the Node resolution.
 * This doesn't work if you are testing schematics that refer to other schematics in the
 * same repo.
 *
 * This function can can be used to override the resolution behaviour.
 *
 * Example:
 *
 * ```typescript
 *   overrideCollectionResolutionForTesting({
 *     '@nrwl/workspace': path.join(__dirname, '../../../../workspace/generators.json'),
 *     '@nrwl/angular': path.join(__dirname, '../../../../angular/generators.json'),
 *     '@nrwl/linter': path.join(__dirname, '../../../../linter/generators.json')
 *   });
 *
 * ```
 */
function overrideCollectionResolutionForTesting(collections) {
    collectionResolutionOverrides = collections;
}
exports.overrideCollectionResolutionForTesting = overrideCollectionResolutionForTesting;
/**
 * If you have an Nx Devkit generator invoking the wrapped Angular Devkit schematic,
 * and you don't want the Angular Devkit schematic to run, you can mock it up using this function.
 *
 * Unfortunately, there are some edge cases in the Nx-Angular devkit integration that
 * can be seen in the unit tests context. This function is useful for handling that as well.
 *
 * In this case, you can mock it up.
 *
 * Example:
 *
 * ```typescript
 *   mockSchematicsForTesting({
 *     'mycollection:myschematic': (tree, params) => {
 *        tree.write('README.md');
 *     }
 *   });
 *
 * ```
 */
function mockSchematicsForTesting(schematics) {
    mockedSchematics = schematics;
}
exports.mockSchematicsForTesting = mockSchematicsForTesting;
function wrapAngularDevkitSchematic(collectionName, generatorName) {
    // This is idempotent, if it happens to get called
    // multiple times its no big deal. It ensures that some
    // patches are applied to @angular-devkit code which
    // are necessary. For the most part, our wrapped host hits
    // the necessary areas, but for some things it wouldn't make
    // sense for the adapter to be 100% accurate.
    //
    // e.g. Angular warns about tags, but some angular CLI schematics
    // were written with Nx in mind, and may care about tags.
    require('./compat');
    return (host, generatorOptions) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (mockedSchematics &&
            mockedSchematics[`${collectionName}:${generatorName}`]) {
            return yield mockedSchematics[`${collectionName}:${generatorName}`](host, generatorOptions);
        }
        const emptyLogger = {
            log: (e) => { },
            info: (e) => { },
            warn: (e) => { },
            debug: () => { },
            error: (e) => { },
            fatal: (e) => { },
        };
        emptyLogger.createChild = () => emptyLogger;
        const recorder = (event) => {
            let eventPath = event.path.startsWith('/')
                ? event.path.slice(1)
                : event.path;
            const r = convertEventTypeToHandleMultipleConfigNames(host, eventPath, event.content);
            if (event.kind === 'error') {
            }
            else if (event.kind === 'update') {
                if (r.eventPath === 'angular.json' ||
                    r.eventPath === 'workspace.json') {
                    saveWorkspaceConfigurationInWrappedSchematic(host, r);
                }
                else {
                    host.write(r.eventPath, r.content);
                }
            }
            else if (event.kind === 'create') {
                host.write(r.eventPath, r.content);
            }
            else if (event.kind === 'delete') {
                host.delete(r.eventPath);
            }
            else if (event.kind === 'rename') {
                host.rename(r.eventPath, event.to);
            }
        };
        const fsHost = new NxScopeHostUsedForWrappedSchematics(host.root, host);
        const options = {
            generatorOptions,
            dryRun: true,
            interactive: false,
            help: false,
            debug: false,
            collectionName,
            generatorName,
            force: false,
            defaults: false,
        };
        const workflow = createWorkflow(fsHost, host.root, options);
        // used for testing
        if (collectionResolutionOverrides) {
            const r = workflow.engineHost.resolve;
            workflow.engineHost.resolve = (collection, b, c) => {
                if (collectionResolutionOverrides[collection]) {
                    return collectionResolutionOverrides[collection];
                }
                else {
                    return r.apply(workflow.engineHost, [collection, b, c]);
                }
            };
        }
        const collection = getCollection(workflow, collectionName);
        const schematic = collection.createSchematic(generatorName, true);
        const res = yield runSchematic(fsHost, host.root, workflow, emptyLogger, options, schematic, false, recorder);
        if (res.status !== 0) {
            throw new Error(res.loggingQueue.join('\n'));
        }
    });
}
exports.wrapAngularDevkitSchematic = wrapAngularDevkitSchematic;
function invokeNew(root, opts, verbose) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const logger = (0, exports.getLogger)(verbose);
        const fsHost = new NxScopedHost(root);
        const workflow = createWorkflow(fsHost, root, opts);
        const collection = getCollection(workflow, opts.collectionName);
        const schematic = collection.createSchematic('new', true);
        return (yield runSchematic(fsHost, root, workflow, logger, Object.assign(Object.assign({}, opts), { generatorName: schematic.description.name }), schematic)).status;
    });
}
exports.invokeNew = invokeNew;
let logger;
const getLogger = (isVerbose = false) => {
    if (!logger) {
        logger = (0, node_1.createConsoleLogger)(isVerbose, process.stdout, process.stderr, {
            warn: (s) => chalk.bold(chalk.yellow(s)),
            error: (s) => {
                if (s.startsWith('NX ')) {
                    return `\n${logger_1.NX_ERROR} ${chalk.bold(chalk.red(s.slice(3)))}\n`;
                }
                return chalk.bold(chalk.red(s));
            },
            info: (s) => {
                if (s.startsWith('NX ')) {
                    return `\n${logger_1.NX_PREFIX} ${chalk.bold(s.slice(3))}\n`;
                }
                return chalk.white(s);
            },
        });
    }
    return logger;
};
exports.getLogger = getLogger;
function saveWorkspaceConfigurationInWrappedSchematic(host, r) {
    const workspaceJsonExists = host.exists(r.eventPath);
    const workspace = (0, json_1.parseJson)(r.content.toString());
    for (const [project, config] of Object.entries(workspace.projects)) {
        if (typeof config === 'object' &&
            (!workspaceJsonExists || config.configFilePath)) {
            const path = config.configFilePath || (0, path_1.join)(config.root, 'project.json');
            workspace.projects[project] = (0, core_1.normalize)((0, path_1.dirname)(path));
            host.write(path, (0, json_1.serializeJson)(Object.assign(Object.assign({ name: project }, config), { root: undefined, configFilePath: undefined })));
        }
    }
    const nxJson = (0, json_1.parseJson)(host.read('nx.json').toString());
    nxJson.generators = workspace.generators || workspace.schematics;
    nxJson.cli = workspace.cli || nxJson.cli;
    nxJson.defaultProject = workspace.defaultProject;
    delete workspace.cli;
    delete workspace.generators;
    delete workspace.schematics;
    if (workspaceJsonExists) {
        r.content = Buffer.from((0, json_1.serializeJson)(workspace));
        host.write(r.eventPath, r.content);
    }
}
//# sourceMappingURL=ngcli-adapter.js.map