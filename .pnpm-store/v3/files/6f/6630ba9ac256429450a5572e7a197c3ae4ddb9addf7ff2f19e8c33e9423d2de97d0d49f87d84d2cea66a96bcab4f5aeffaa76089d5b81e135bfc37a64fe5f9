import fs from "fs";
import * as colors from "kleur/colors";
import yargs from "yargs-parser";
import { z } from "zod";
import {
  createSettings,
  openConfig,
  resolveConfigPath,
  resolveFlags
} from "../core/config/index.js";
import { ASTRO_VERSION } from "../core/constants.js";
import { collectErrorMetadata } from "../core/errors/dev/index.js";
import { createSafeError } from "../core/errors/index.js";
import { debug, error, info } from "../core/logger/core.js";
import { enableVerboseLogging, nodeLogDestination } from "../core/logger/node.js";
import { formatConfigErrorMessage, formatErrorMessage, printHelp } from "../core/messages.js";
import * as event from "../events/index.js";
import { eventConfigError, eventError, telemetry } from "../events/index.js";
import { check } from "./check/index.js";
import { openInBrowser } from "./open.js";
function printAstroHelp() {
  printHelp({
    commandName: "astro",
    usage: "[command] [...flags]",
    headline: "Build faster websites.",
    tables: {
      Commands: [
        ["add", "Add an integration."],
        ["build", "Build your project and write it to disk."],
        ["check", "Check your project for errors."],
        ["dev", "Start the development server."],
        ["docs", "Open documentation in your web browser."],
        ["preview", "Preview your build locally."],
        ["sync", "Generate content collection types."],
        ["telemetry", "Configure telemetry settings."]
      ],
      "Global Flags": [
        ["--config <path>", "Specify your config file."],
        ["--root <path>", "Specify your project root folder."],
        ["--site <url>", "Specify your project site."],
        ["--base <pathname>", "Specify your project base."],
        ["--verbose", "Enable verbose logging."],
        ["--silent", "Disable all logging."],
        ["--version", "Show the version number and exit."],
        ["--help", "Show this help message."]
      ]
    }
  });
}
async function printVersion() {
  console.log();
  console.log(`  ${colors.bgGreen(colors.black(` astro `))} ${colors.green(`v${ASTRO_VERSION}`)}`);
}
function resolveCommand(flags) {
  const cmd = flags._[2];
  if (cmd === "add")
    return "add";
  if (cmd === "sync")
    return "sync";
  if (cmd === "telemetry")
    return "telemetry";
  if (flags.version)
    return "version";
  else if (flags.help)
    return "help";
  const supportedCommands = /* @__PURE__ */ new Set(["dev", "build", "preview", "check", "docs"]);
  if (supportedCommands.has(cmd)) {
    return cmd;
  }
  return "help";
}
async function handleConfigError(e, { cwd, flags, logging }) {
  const path = await resolveConfigPath({ cwd, flags, fs });
  if (e instanceof Error) {
    if (path) {
      error(logging, "astro", `Unable to load ${colors.bold(path)}
`);
    }
    console.error(formatErrorMessage(collectErrorMetadata(e)) + "\n");
  }
}
async function runCommand(cmd, flags) {
  var _a;
  const root = flags.root;
  switch (cmd) {
    case "help":
      printAstroHelp();
      return process.exit(0);
    case "version":
      await printVersion();
      return process.exit(0);
  }
  let logging = {
    dest: nodeLogDestination,
    level: "info"
  };
  if (flags.verbose) {
    logging.level = "debug";
    enableVerboseLogging();
  } else if (flags.silent) {
    logging.level = "silent";
  }
  switch (cmd) {
    case "add": {
      const { default: add } = await import("../core/add/index.js");
      telemetry.record(event.eventCliSession(cmd));
      const packages = flags._.slice(3);
      return await add(packages, { cwd: root, flags, logging, telemetry });
    }
    case "docs": {
      telemetry.record(event.eventCliSession(cmd));
      return await openInBrowser("https://docs.astro.build/");
    }
    case "telemetry": {
      const telemetryHandler = await import("./telemetry.js");
      const subcommand = (_a = flags._[3]) == null ? void 0 : _a.toString();
      return await telemetryHandler.update(subcommand, { flags, telemetry });
    }
  }
  let { astroConfig: initialAstroConfig, userConfig: initialUserConfig } = await openConfig({
    cwd: root,
    flags,
    cmd,
    logging
  }).catch(async (e) => {
    await handleConfigError(e, { cwd: root, flags, logging });
    return {};
  });
  if (!initialAstroConfig)
    return;
  telemetry.record(event.eventCliSession(cmd, initialUserConfig, flags));
  let settings = createSettings(initialAstroConfig, root);
  switch (cmd) {
    case "dev": {
      const { default: devServer } = await import("../core/dev/index.js");
      const configFlag = resolveFlags(flags).config;
      const configFlagPath = configFlag ? await resolveConfigPath({ cwd: root, flags, fs }) : void 0;
      await devServer(settings, {
        configFlag,
        configFlagPath,
        logging,
        telemetry,
        handleConfigError(e) {
          handleConfigError(e, { cwd: root, flags, logging });
          info(logging, "astro", "Continuing with previous valid configuration\n");
        }
      });
      return await new Promise(() => {
      });
    }
    case "build": {
      const { default: build } = await import("../core/build/index.js");
      return await build(settings, { ...flags, logging, telemetry });
    }
    case "check": {
      const ret = await check(settings);
      return process.exit(ret);
    }
    case "sync": {
      const { sync } = await import("./sync/index.js");
      const ret = await sync(settings, { logging, fs });
      return process.exit(ret);
    }
    case "preview": {
      const { default: preview } = await import("../core/preview/index.js");
      const server = await preview(settings, { logging, telemetry });
      return await server.closed();
    }
  }
  throw new Error(`Error running ${cmd} -- no command found.`);
}
async function cli(args) {
  const flags = yargs(args);
  const cmd = resolveCommand(flags);
  try {
    await runCommand(cmd, flags);
  } catch (err) {
    await throwAndExit(cmd, err);
  }
}
async function throwAndExit(cmd, err) {
  let telemetryPromise;
  let errorMessage;
  function exitWithErrorMessage() {
    console.error(errorMessage);
    process.exit(1);
  }
  if (err instanceof z.ZodError) {
    telemetryPromise = telemetry.record(eventConfigError({ cmd, err, isFatal: true }));
    errorMessage = formatConfigErrorMessage(err);
  } else {
    const errorWithMetadata = collectErrorMetadata(createSafeError(err));
    telemetryPromise = telemetry.record(eventError({ cmd, err: errorWithMetadata, isFatal: true }));
    errorMessage = formatErrorMessage(errorWithMetadata);
  }
  setTimeout(exitWithErrorMessage, 400);
  await telemetryPromise.catch((err2) => debug("telemetry", `record() error: ${err2.message}`)).then(exitWithErrorMessage);
}
export {
  cli
};
