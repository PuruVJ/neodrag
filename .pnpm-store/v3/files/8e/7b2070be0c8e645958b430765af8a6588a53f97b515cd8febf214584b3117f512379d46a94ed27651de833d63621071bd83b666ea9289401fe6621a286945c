import * as msg from "../core/messages.js";
async function update(subcommand, { flags, telemetry }) {
  const isValid = ["enable", "disable", "reset"].includes(subcommand);
  if (flags.help || !isValid) {
    msg.printHelp({
      commandName: "astro telemetry",
      usage: "[command]",
      tables: {
        Commands: [
          ["enable", "Enable anonymous data collection."],
          ["disable", "Disable anonymous data collection."],
          ["reset", "Reset anonymous data collection settings."]
        ]
      }
    });
    return;
  }
  switch (subcommand) {
    case "enable": {
      telemetry.setEnabled(true);
      console.log(msg.telemetryEnabled());
      return;
    }
    case "disable": {
      telemetry.setEnabled(false);
      console.log(msg.telemetryDisabled());
      return;
    }
    case "reset": {
      telemetry.clear();
      console.log(msg.telemetryReset());
      return;
    }
  }
}
export {
  update
};
