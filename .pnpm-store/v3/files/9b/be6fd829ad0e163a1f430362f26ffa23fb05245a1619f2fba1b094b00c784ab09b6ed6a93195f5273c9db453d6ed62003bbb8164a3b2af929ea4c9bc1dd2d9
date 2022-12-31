"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceGeneratorSchema = exports.workspaceGenerators = void 0;
const tslib_1 = require("tslib");
const chalk = require("chalk");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path = require("path");
const yargsParser = require("yargs-parser");
const workspace_root_1 = require("../utils/workspace-root");
const fileutils_1 = require("../utils/fileutils");
const output_1 = require("../utils/output");
const generate_1 = require("./generate");
const fileutils_2 = require("../utils/fileutils");
const logger_1 = require("../utils/logger");
const package_manager_1 = require("../utils/package-manager");
const path_1 = require("../utils/path");
const nx_commands_1 = require("./nx-commands");
const rootDirectory = workspace_root_1.workspaceRoot;
const toolsDir = path.join(rootDirectory, 'tools');
const generatorsDir = path.join(toolsDir, 'generators');
const toolsTsConfigPath = path.join(toolsDir, 'tsconfig.tools.json');
function workspaceGenerators(args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const outDir = compileTools();
        const collectionFile = path.join(outDir, 'workspace-generators.json');
        const parsedArgs = parseOptions(args, outDir, collectionFile);
        if (parsedArgs.listGenerators) {
            return listGenerators(collectionFile);
        }
        else {
            process.exitCode = yield (0, generate_1.generate)(process.cwd(), parsedArgs);
        }
    });
}
exports.workspaceGenerators = workspaceGenerators;
function workspaceGeneratorSchema(name) {
    const schemaFile = path.join(generatorsDir, name, 'schema.json');
    if ((0, fileutils_1.fileExists)(schemaFile)) {
        return (0, fileutils_2.readJsonFile)(schemaFile);
    }
    else {
        logger_1.logger.error(`Cannot find schema for ${name}. Does the generator exist?`);
        process.exit(1);
    }
}
exports.workspaceGeneratorSchema = workspaceGeneratorSchema;
// compile tools
function compileTools() {
    const toolsOutDir = getToolsOutDir();
    (0, fs_extra_1.removeSync)(toolsOutDir);
    compileToolsDir(toolsOutDir);
    const generatorsOutDir = path.join(toolsOutDir, 'generators');
    const collectionData = constructCollection();
    (0, fileutils_2.writeJsonFile)(path.join(generatorsOutDir, 'workspace-generators.json'), collectionData);
    return generatorsOutDir;
}
function getToolsOutDir() {
    const outDir = toolsTsConfig().compilerOptions.outDir;
    if (!outDir) {
        logger_1.logger.error(`${toolsTsConfigPath} must specify an outDir`);
        process.exit(1);
    }
    return path.resolve(toolsDir, outDir);
}
function compileToolsDir(outDir) {
    (0, fs_extra_1.copySync)(generatorsDir, path.join(outDir, 'generators'));
    const tmpTsConfigPath = createTmpTsConfig(toolsTsConfigPath, {
        include: [path.join(generatorsDir, '**/*.ts')],
    });
    const pmc = (0, package_manager_1.getPackageManagerCommand)();
    const tsc = `${pmc.exec} tsc`;
    try {
        (0, child_process_1.execSync)(`${tsc} -p ${tmpTsConfigPath}`, {
            stdio: 'inherit',
            cwd: rootDirectory,
        });
    }
    catch (_a) {
        process.exit(1);
    }
}
function constructCollection() {
    const generators = {};
    (0, fs_1.readdirSync)(generatorsDir).forEach((c) => {
        const childDir = path.join(generatorsDir, c);
        if ((0, fs_1.existsSync)(path.join(childDir, 'schema.json'))) {
            generators[c] = {
                factory: `./${c}`,
                schema: `./${(0, path_1.normalizePath)(path.join(c, 'schema.json'))}`,
                description: `Schematic ${c}`,
            };
        }
    });
    return {
        name: 'workspace-generators',
        version: '1.0',
        generators,
        schematics: generators,
    };
}
function toolsTsConfig() {
    return (0, fileutils_2.readJsonFile)(toolsTsConfigPath);
}
function listGenerators(collectionFile) {
    try {
        const bodyLines = [];
        const collection = (0, fileutils_2.readJsonFile)(collectionFile);
        bodyLines.push(chalk.bold(chalk.green('WORKSPACE GENERATORS')));
        bodyLines.push('');
        bodyLines.push(...Object.entries(collection.generators).map(([schematicName, schematicMeta]) => {
            return `${chalk.bold(schematicName)} : ${schematicMeta.description}`;
        }));
        bodyLines.push('');
        output_1.output.log({
            title: '',
            bodyLines,
        });
    }
    catch (error) {
        logger_1.logger.fatal(error.message);
    }
}
function parseOptions(args, outDir, collectionFile) {
    const schemaPath = path.join(outDir, args[0], 'schema.json');
    let booleanProps = [];
    if ((0, fileutils_1.fileExists)(schemaPath)) {
        const { properties } = (0, fileutils_2.readJsonFile)(path.join(outDir, args[0], 'schema.json'));
        if (properties) {
            booleanProps = Object.keys(properties).filter((key) => properties[key].type === 'boolean');
        }
    }
    const parsed = yargsParser(args, {
        boolean: ['dryRun', 'listGenerators', 'interactive', ...booleanProps],
        alias: {
            dryRun: ['d'],
            listSchematics: ['l'],
        },
        default: {
            interactive: true,
        },
        configuration: nx_commands_1.parserConfiguration,
    });
    parsed['generator'] = `${collectionFile}:${parsed['_'][0]}`;
    parsed['_'] = parsed['_'].slice(1);
    return parsed;
}
function createTmpTsConfig(tsconfigPath, updateConfig) {
    const tmpTsConfigPath = path.join(path.dirname(tsconfigPath), 'tsconfig.generated.json');
    const originalTSConfig = (0, fileutils_2.readJsonFile)(tsconfigPath);
    const generatedTSConfig = Object.assign(Object.assign({}, originalTSConfig), updateConfig);
    process.on('exit', () => cleanupTmpTsConfigFile(tmpTsConfigPath));
    (0, fileutils_2.writeJsonFile)(tmpTsConfigPath, generatedTSConfig);
    return tmpTsConfigPath;
}
function cleanupTmpTsConfigFile(tmpTsConfigPath) {
    if (tmpTsConfigPath) {
        (0, fs_extra_1.removeSync)(tmpTsConfigPath);
    }
}
//# sourceMappingURL=workspace-generators.js.map