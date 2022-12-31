"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterUsingGlobPatterns = exports.expandNamedInput = exports.splitInputsIntoSelfAndDependencies = exports.Hasher = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const minimatch = require("minimatch");
const typescript_1 = require("../utils/typescript");
const hashing_impl_1 = require("./hashing-impl");
const fileutils_1 = require("../utils/fileutils");
const path_1 = require("../utils/path");
/**
 * The default hasher used by executors.
 */
class Hasher {
    constructor(projectGraph, nxJson, options, hashing = undefined) {
        var _a, _b;
        this.projectGraph = projectGraph;
        this.nxJson = nxJson;
        this.options = options;
        if (!hashing) {
            this.hashing = hashing_impl_1.defaultHashing;
        }
        else {
            // this is only used for testing
            this.hashing = hashing;
        }
        const legacyRuntimeInputs = (this.options && this.options.runtimeCacheInputs
            ? this.options.runtimeCacheInputs
            : []).map((r) => ({ runtime: r }));
        if (process.env.NX_CLOUD_ENCRYPTION_KEY) {
            legacyRuntimeInputs.push({ env: 'NX_CLOUD_ENCRYPTION_KEY' });
        }
        const legacyFilesetInputs = [
            ...Object.keys((_a = this.nxJson.implicitDependencies) !== null && _a !== void 0 ? _a : {}),
            'nx.json',
            // ignore files will change the set of inputs to the hasher
            '.gitignore',
            '.nxignore',
        ].map((d) => ({ fileset: `{workspaceRoot}/${d}` }));
        this.taskHasher = new TaskHasher(nxJson, legacyRuntimeInputs, legacyFilesetInputs, this.projectGraph, this.readTsConfig(), this.hashing, { selectivelyHashTsConfig: (_b = this.options.selectivelyHashTsConfig) !== null && _b !== void 0 ? _b : false });
    }
    hashTask(task) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const res = yield this.taskHasher.hashTask(task, [task.target.project]);
            const command = this.hashCommand(task);
            return {
                value: this.hashArray([res.value, command]),
                details: {
                    command,
                    nodes: res.details,
                    implicitDeps: {},
                    runtime: {},
                },
            };
        });
    }
    hashDependsOnOtherTasks(task) {
        return false;
    }
    /**
     * @deprecated use hashTask instead
     */
    hashTaskWithDepsAndContext(task) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.hashTask(task);
        });
    }
    /**
     * @deprecated hashTask will hash runtime inputs and global files
     */
    hashContext() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                implicitDeps: '',
                runtime: '',
            };
        });
    }
    hashCommand(task) {
        var _a, _b, _c;
        const overrides = Object.assign({}, task.overrides);
        delete overrides['__overrides_unparsed__'];
        const sortedOverrides = {};
        for (let k of Object.keys(overrides).sort()) {
            sortedOverrides[k] = overrides[k];
        }
        return this.hashing.hashArray([
            (_a = task.target.project) !== null && _a !== void 0 ? _a : '',
            (_b = task.target.target) !== null && _b !== void 0 ? _b : '',
            (_c = task.target.configuration) !== null && _c !== void 0 ? _c : '',
            JSON.stringify(sortedOverrides),
        ]);
    }
    /**
     * @deprecated use hashTask
     */
    hashSource(task) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const hash = yield this.taskHasher.hashTask(task, [task.target.project]);
            for (let n of Object.keys(hash.details)) {
                if (n.startsWith(`${task.target.project}:`)) {
                    return hash.details[n];
                }
            }
            return '';
        });
    }
    hashArray(values) {
        return this.hashing.hashArray(values);
    }
    hashFile(path) {
        return this.hashing.hashFile(path);
    }
    readTsConfig() {
        var _a;
        var _b;
        try {
            const res = (0, fileutils_1.readJsonFile)((0, typescript_1.getRootTsConfigFileName)());
            (_a = (_b = res.compilerOptions).paths) !== null && _a !== void 0 ? _a : (_b.paths = {});
            return res;
        }
        catch (_c) {
            return {
                compilerOptions: { paths: {} },
            };
        }
    }
}
exports.Hasher = Hasher;
Hasher.version = '3.0';
const DEFAULT_INPUTS = [
    {
        projects: 'self',
        fileset: '{projectRoot}/**/*',
    },
    {
        projects: 'dependencies',
        input: 'default',
    },
];
class TaskHasher {
    constructor(nxJson, legacyRuntimeInputs, legacyFilesetInputs, projectGraph, tsConfigJson, hashing, options) {
        this.nxJson = nxJson;
        this.legacyRuntimeInputs = legacyRuntimeInputs;
        this.legacyFilesetInputs = legacyFilesetInputs;
        this.projectGraph = projectGraph;
        this.tsConfigJson = tsConfigJson;
        this.hashing = hashing;
        this.options = options;
        this.filesetHashes = {};
        this.runtimeHashes = {};
    }
    hashTask(task, visited) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return Promise.resolve().then(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const projectNode = this.projectGraph.nodes[task.target.project];
                if (!projectNode) {
                    return this.hashExternalDependency(task.target.project);
                }
                const namedInputs = Object.assign(Object.assign({ default: [{ fileset: '{projectRoot}/**/*' }] }, this.nxJson.namedInputs), projectNode.data.namedInputs);
                const targetData = projectNode.data.targets[task.target.target];
                const targetDefaults = (this.nxJson.targetDefaults || {})[task.target.target];
                const { selfInputs, depsInputs } = splitInputsIntoSelfAndDependencies(targetData.inputs || (targetDefaults === null || targetDefaults === void 0 ? void 0 : targetDefaults.inputs) || DEFAULT_INPUTS, namedInputs);
                const selfAndInputs = yield this.hashSelfAndDepsInputs(task.target.project, selfInputs, depsInputs, visited);
                const target = this.hashTarget(task.target.project, task.target.target);
                if (target) {
                    return {
                        value: this.hashing.hashArray([selfAndInputs.value, target.value]),
                        details: Object.assign(Object.assign({}, selfAndInputs.details), target.details),
                    };
                }
                return selfAndInputs;
            }));
        });
    }
    hashNamedInput(projectName, namedInput, visited) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const projectNode = this.projectGraph.nodes[projectName];
            if (!projectNode) {
                return this.hashExternalDependency(projectName);
            }
            const namedInputs = Object.assign(Object.assign({ default: [{ fileset: '{projectRoot}/**/*' }] }, this.nxJson.namedInputs), projectNode.data.namedInputs);
            const selfInputs = expandNamedInput(namedInput, namedInputs);
            const depsInputs = [{ input: namedInput }];
            return this.hashSelfAndDepsInputs(projectName, selfInputs, depsInputs, visited);
        });
    }
    hashSelfAndDepsInputs(projectName, selfInputs, depsInputs, visited) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const projectGraphDeps = (_a = this.projectGraph.dependencies[projectName]) !== null && _a !== void 0 ? _a : [];
            const self = yield this.hashSelfInputs(projectName, selfInputs);
            const deps = yield this.hashDepsInputs(depsInputs, projectGraphDeps, visited);
            let details = {};
            for (const s of self) {
                details = Object.assign(Object.assign({}, details), s.details);
            }
            for (const s of deps) {
                details = Object.assign(Object.assign({}, details), s.details);
            }
            const value = this.hashing.hashArray([
                ...self.map((d) => d.value),
                ...deps.map((d) => d.value),
            ]);
            return { value, details };
        });
    }
    hashDepsInputs(inputs, projectGraphDeps, visited) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield Promise.all(inputs.map((input) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                return yield Promise.all(projectGraphDeps.map((d) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (visited.indexOf(d.target) > -1) {
                        return null;
                    }
                    else {
                        visited.push(d.target);
                        return yield this.hashNamedInput(d.target, input.input || 'default', visited);
                    }
                })));
            }))))
                .flat()
                .filter((r) => !!r);
        });
    }
    hashExternalDependency(projectName) {
        var _a, _b;
        const n = this.projectGraph.externalNodes[projectName];
        const version = (_a = n === null || n === void 0 ? void 0 : n.data) === null || _a === void 0 ? void 0 : _a.version;
        let hash;
        if ((_b = n === null || n === void 0 ? void 0 : n.data) === null || _b === void 0 ? void 0 : _b.hash) {
            // we already know the hash of this dependency
            hash = n.data.hash;
        }
        else {
            // unknown dependency
            // this may occur dependency is not an npm package
            // but rather symlinked in node_modules or it's pointing to a remote git repo
            // in this case we have no information about the versioning of the given package
            hash = `__${projectName}__`;
        }
        return {
            value: hash,
            details: {
                [projectName]: version || hash,
            },
        };
    }
    hashTarget(projectName, targetName) {
        var _a;
        const projectNode = this.projectGraph.nodes[projectName];
        const target = projectNode.data.targets[targetName];
        if (!target) {
            return;
        }
        // we can only vouch for @nrwl packages's executors
        // if it's "run commands" we skip traversing since we have no info what this command depends on
        // for everything else we take the hash of the @nrwl package dependency tree
        if (target.executor.startsWith(`@nrwl/`) &&
            target.executor !== `@nrwl/workspace:run-commands`) {
            const executorPackage = target.executor.split(':')[0];
            const executorNode = `npm:${executorPackage}`;
            if ((_a = this.projectGraph.externalNodes) === null || _a === void 0 ? void 0 : _a[executorNode]) {
                return this.hashExternalDependency(executorNode);
            }
        }
        const hash = this.hashing.hashArray([
            JSON.stringify(this.projectGraph.externalNodes),
        ]);
        return {
            value: hash,
            details: {
                [projectNode.name]: target.executor,
            },
        };
    }
    hashSelfInputs(projectName, inputs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const filesets = inputs
                .filter((r) => !!r['fileset'])
                .map((r) => r['fileset']);
            const projectFilesets = [];
            const workspaceFilesets = [];
            let invalidFilesetNoPrefix = null;
            let invalidFilesetWorkspaceRootNegative = null;
            for (let f of filesets) {
                if (f.startsWith('{projectRoot}/') || f.startsWith('!{projectRoot}/')) {
                    projectFilesets.push(f);
                }
                else if (f.startsWith('{workspaceRoot}/') ||
                    f.startsWith('!{workspaceRoot}/')) {
                    workspaceFilesets.push(f);
                }
                else {
                    invalidFilesetNoPrefix = f;
                }
            }
            if (invalidFilesetNoPrefix) {
                throw new Error([
                    `"${invalidFilesetNoPrefix}" is an invalid fileset.`,
                    'All filesets have to start with either {workspaceRoot} or {projectRoot}.',
                    'For instance: "!{projectRoot}/**/*.spec.ts" or "{workspaceRoot}/package.json".',
                    `If "${invalidFilesetNoPrefix}" is a named input, make sure it is defined in, for instance, nx.json.`,
                ].join('\n'));
            }
            if (invalidFilesetWorkspaceRootNegative) {
                throw new Error([
                    `"${invalidFilesetWorkspaceRootNegative}" is an invalid fileset.`,
                    'It is not possible to negative filesets starting with {workspaceRoot}.',
                ].join('\n'));
            }
            const notFilesets = inputs.filter((r) => !r['fileset']);
            return Promise.all([
                this.hashProjectFileset(projectName, projectFilesets),
                ...[
                    ...workspaceFilesets,
                    ...this.legacyFilesetInputs.map((r) => r.fileset),
                ].map((fileset) => this.hashRootFileset(fileset)),
                ...[...notFilesets, ...this.legacyRuntimeInputs].map((r) => r['runtime'] ? this.hashRuntime(r['runtime']) : this.hashEnv(r['env'])),
            ]);
        });
    }
    hashRootFileset(fileset) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const mapKey = fileset;
            const withoutWorkspaceRoot = fileset.substring(16);
            if (!this.filesetHashes[mapKey]) {
                this.filesetHashes[mapKey] = new Promise((res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const parts = [];
                    if (fileset.indexOf('*') > -1) {
                        this.projectGraph.allWorkspaceFiles
                            .filter((f) => minimatch(f.file, withoutWorkspaceRoot))
                            .forEach((f) => {
                            parts.push(f.hash);
                        });
                    }
                    else {
                        const matchingFile = this.projectGraph.allWorkspaceFiles.find((t) => t.file === withoutWorkspaceRoot);
                        if (matchingFile) {
                            parts.push(matchingFile.hash);
                        }
                    }
                    const value = this.hashing.hashArray(parts);
                    res({
                        value,
                        details: { [mapKey]: value },
                    });
                }));
            }
            return this.filesetHashes[mapKey];
        });
    }
    hashProjectFileset(projectName, filesetPatterns) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const mapKey = `${projectName}:${filesetPatterns.join(',')}`;
            if (!this.filesetHashes[mapKey]) {
                this.filesetHashes[mapKey] = new Promise((res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const p = this.projectGraph.nodes[projectName];
                    const filteredFiles = filterUsingGlobPatterns(p.data.root, p.data.files, filesetPatterns);
                    const fileNames = filteredFiles.map((f) => f.file);
                    const values = filteredFiles.map((f) => f.hash);
                    let tsConfig;
                    tsConfig = this.hashTsConfig(p);
                    const value = this.hashing.hashArray([
                        ...fileNames,
                        ...values,
                        JSON.stringify(Object.assign(Object.assign({}, p.data), { files: undefined })),
                        tsConfig,
                    ]);
                    res({
                        value,
                        details: { [mapKey]: value },
                    });
                }));
            }
            return this.filesetHashes[mapKey];
        });
    }
    hashRuntime(runtime) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const mapKey = `runtime:${runtime}`;
            if (!this.runtimeHashes[mapKey]) {
                this.runtimeHashes[mapKey] = new Promise((res, rej) => {
                    (0, child_process_1.exec)(runtime, (err, stdout, stderr) => {
                        if (err) {
                            rej(new Error(`Nx failed to execute {runtime: '${runtime}'}. ${err}.`));
                        }
                        else {
                            const value = `${stdout}${stderr}`.trim();
                            res({
                                details: { [`runtime:${runtime}`]: value },
                                value,
                            });
                        }
                    });
                });
            }
            return this.runtimeHashes[mapKey];
        });
    }
    hashEnv(envVarName) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const value = this.hashing.hashArray([(_a = process.env[envVarName]) !== null && _a !== void 0 ? _a : '']);
            return {
                details: { [`env:${envVarName}`]: value },
                value,
            };
        });
    }
    hashTsConfig(p) {
        if (this.options.selectivelyHashTsConfig) {
            return this.removeOtherProjectsPathRecords(p);
        }
        else {
            return JSON.stringify(this.tsConfigJson);
        }
    }
    removeOtherProjectsPathRecords(p) {
        var _a, _b;
        const _c = this.tsConfigJson.compilerOptions, { paths } = _c, compilerOptions = tslib_1.__rest(_c, ["paths"]);
        const rootPath = p.data.root.split('/');
        rootPath.shift();
        const pathAlias = (0, path_1.getImportPath)((_a = this.nxJson) === null || _a === void 0 ? void 0 : _a.npmScope, rootPath.join('/'));
        return JSON.stringify({
            compilerOptions: Object.assign(Object.assign({}, compilerOptions), { paths: {
                    [pathAlias]: (_b = paths[pathAlias]) !== null && _b !== void 0 ? _b : [],
                } }),
        });
    }
}
function splitInputsIntoSelfAndDependencies(inputs, namedInputs) {
    const depsInputs = [];
    const selfInputs = [];
    for (const d of inputs) {
        if (typeof d === 'string') {
            if (d.startsWith('^')) {
                depsInputs.push({ input: d.substring(1) });
            }
            else {
                selfInputs.push(d);
            }
        }
        else {
            if (d.projects === 'dependencies') {
                depsInputs.push(d);
            }
            else {
                selfInputs.push(d);
            }
        }
    }
    return { depsInputs, selfInputs: expandSelfInputs(selfInputs, namedInputs) };
}
exports.splitInputsIntoSelfAndDependencies = splitInputsIntoSelfAndDependencies;
function expandSelfInputs(inputs, namedInputs) {
    const expanded = [];
    for (const d of inputs) {
        if (typeof d === 'string') {
            if (d.startsWith('^'))
                throw new Error(`namedInputs definitions cannot start with ^`);
            if (namedInputs[d]) {
                expanded.push(...expandNamedInput(d, namedInputs));
            }
            else {
                expanded.push({ fileset: d });
            }
        }
        else {
            if (d.projects === 'dependencies') {
                throw new Error(`namedInputs definitions cannot contain any inputs with projects == 'dependencies'`);
            }
            if (d.fileset || d.env || d.runtime) {
                expanded.push(d);
            }
            else {
                expanded.push(...expandNamedInput(d.input, namedInputs));
            }
        }
    }
    return expanded;
}
function expandNamedInput(input, namedInputs) {
    namedInputs || (namedInputs = {});
    if (!namedInputs[input])
        throw new Error(`Input '${input}' is not defined`);
    return expandSelfInputs(namedInputs[input], namedInputs);
}
exports.expandNamedInput = expandNamedInput;
function filterUsingGlobPatterns(root, files, patterns) {
    const filesetWithExpandedProjectRoot = patterns
        .map((f) => f.replace('{projectRoot}', root))
        .map((r) => {
        // handling root level projects that create './' pattern that doesn't work with minimatch
        if (r.startsWith('./'))
            return r.substring(2);
        if (r.startsWith('!./'))
            return '!' + r.substring(3);
        return r;
    });
    const positive = [];
    const negative = [];
    for (const p of filesetWithExpandedProjectRoot) {
        if (p.startsWith('!')) {
            negative.push(p);
        }
        else {
            positive.push(p);
        }
    }
    if (positive.length === 0 && negative.length === 0) {
        return files;
    }
    return files.filter((f) => {
        let matchedPositive = false;
        if (positive.length === 0 ||
            (positive.length === 1 && positive[0] === `${root}/**/*`)) {
            matchedPositive = true;
        }
        else {
            matchedPositive = positive.some((pattern) => minimatch(f.file, pattern));
        }
        if (!matchedPositive)
            return false;
        return negative.every((pattern) => minimatch(f.file, pattern));
    });
}
exports.filterUsingGlobPatterns = filterUsingGlobPatterns;
//# sourceMappingURL=hasher.js.map