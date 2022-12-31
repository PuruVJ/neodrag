"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolateArgsIntoCommand = exports.LARGE_BUFFER = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const path = require("path");
const yargsParser = require("yargs-parser");
const npm_run_path_1 = require("npm-run-path");
const chalk = require("chalk");
exports.LARGE_BUFFER = 1024 * 1000000;
function loadEnvVars(path) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (path) {
            const result = (yield Promise.resolve().then(() => require('dotenv'))).config({ path });
            if (result.error) {
                throw result.error;
            }
        }
        else {
            try {
                (yield Promise.resolve().then(() => require('dotenv'))).config();
            }
            catch (_a) { }
        }
    });
}
const propKeys = [
    'command',
    'commands',
    'color',
    'parallel',
    'readyWhen',
    'cwd',
    'args',
    'envFile',
    'outputPath',
];
function default_1(options, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield loadEnvVars(options.envFile);
        const normalized = normalizeOptions(options);
        if (options.readyWhen && !options.parallel) {
            throw new Error('ERROR: Bad executor config for run-commands - "readyWhen" can only be used when "parallel=true".');
        }
        if (options.commands.find((c) => c.prefix || c.color || c.bgColor) &&
            !options.parallel) {
            throw new Error('ERROR: Bad executor config for run-commands - "prefix", "color" and "bgColor" can only be set when "parallel=true".');
        }
        try {
            const success = options.parallel
                ? yield runInParallel(normalized, context)
                : yield runSerially(normalized, context);
            return { success };
        }
        catch (e) {
            if (process.env.NX_VERBOSE_LOGGING === 'true') {
                console.error(e);
            }
            throw new Error(`ERROR: Something went wrong in run-commands - ${e.message}`);
        }
    });
}
exports.default = default_1;
function runInParallel(options, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const procs = options.commands.map((c) => createProcess(c, options.readyWhen, options.color, calculateCwd(options.cwd, context)).then((result) => ({
            result,
            command: c.command,
        })));
        if (options.readyWhen) {
            const r = yield Promise.race(procs);
            if (!r.result) {
                process.stderr.write(`Warning: run-commands command "${r.command}" exited with non-zero status code`);
                return false;
            }
            else {
                return true;
            }
        }
        else {
            const r = yield Promise.all(procs);
            const failed = r.filter((v) => !v.result);
            if (failed.length > 0) {
                failed.forEach((f) => {
                    process.stderr.write(`Warning: run-commands command "${f.command}" exited with non-zero status code`);
                });
                return false;
            }
            else {
                return true;
            }
        }
    });
}
function normalizeOptions(options) {
    options.parsedArgs = parseArgs(options);
    if (options.command) {
        options.commands = [{ command: options.command }];
        options.parallel = !!options.readyWhen;
    }
    else {
        options.commands = options.commands.map((c) => typeof c === 'string' ? { command: c } : c);
    }
    options.commands.forEach((c) => {
        var _a;
        c.command = interpolateArgsIntoCommand(c.command, options, (_a = c.forwardAllArgs) !== null && _a !== void 0 ? _a : true);
    });
    return options;
}
function runSerially(options, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const c of options.commands) {
            createSyncProcess(c.command, options.color, calculateCwd(options.cwd, context));
        }
        return true;
    });
}
function createProcess(commandConfig, readyWhen, color, cwd) {
    return new Promise((res) => {
        const childProcess = (0, child_process_1.exec)(commandConfig.command, {
            maxBuffer: exports.LARGE_BUFFER,
            env: processEnv(color),
            cwd,
        });
        /**
         * Ensure the child process is killed when the parent exits
         */
        const processExitListener = () => childProcess.kill();
        process.on('exit', processExitListener);
        process.on('SIGTERM', processExitListener);
        childProcess.stdout.on('data', (data) => {
            process.stdout.write(addColorAndPrefix(data, commandConfig));
            if (readyWhen && data.toString().indexOf(readyWhen) > -1) {
                res(true);
            }
        });
        childProcess.stderr.on('data', (err) => {
            process.stderr.write(addColorAndPrefix(err, commandConfig));
            if (readyWhen && err.toString().indexOf(readyWhen) > -1) {
                res(true);
            }
        });
        childProcess.on('exit', (code) => {
            if (!readyWhen) {
                res(code === 0);
            }
        });
    });
}
function addColorAndPrefix(out, config) {
    if (config.prefix) {
        out = out
            .split('\n')
            .map((l) => l.trim().length > 0 ? `${chalk.bold(config.prefix)} ${l}` : l)
            .join('\n');
    }
    if (config.color && chalk[config.color]) {
        out = chalk[config.color](out);
    }
    if (config.bgColor && chalk[config.bgColor]) {
        out = chalk[config.bgColor](out);
    }
    return out;
}
function createSyncProcess(command, color, cwd) {
    (0, child_process_1.execSync)(command, {
        env: processEnv(color),
        stdio: ['inherit', 'inherit', 'inherit'],
        maxBuffer: exports.LARGE_BUFFER,
        cwd,
    });
}
function calculateCwd(cwd, context) {
    if (!cwd)
        return context.root;
    if (path.isAbsolute(cwd))
        return cwd;
    return path.join(context.root, cwd);
}
function processEnv(color) {
    const env = Object.assign(Object.assign({}, process.env), (0, npm_run_path_1.env)());
    if (color) {
        env.FORCE_COLOR = `${color}`;
    }
    return env;
}
function interpolateArgsIntoCommand(command, opts, forwardAllArgs) {
    if (command.indexOf('{args.') > -1) {
        const regex = /{args\.([^}]+)}/g;
        return command.replace(regex, (_, group) => opts.parsedArgs[group]);
    }
    else if (forwardAllArgs) {
        return `${command}${opts.__unparsed__.length > 0 ? ' ' + opts.__unparsed__.join(' ') : ''}`;
    }
    else {
        return command;
    }
}
exports.interpolateArgsIntoCommand = interpolateArgsIntoCommand;
function parseArgs(options) {
    const args = options.args;
    if (!args) {
        const unknownOptionsTreatedAsArgs = Object.keys(options)
            .filter((p) => propKeys.indexOf(p) === -1)
            .reduce((m, c) => ((m[c] = options[c]), m), {});
        return unknownOptionsTreatedAsArgs;
    }
    return yargsParser(args.replace(/(^"|"$)/g, ''), {
        configuration: { 'camel-case-expansion': false },
    });
}
//# sourceMappingURL=run-commands.impl.js.map