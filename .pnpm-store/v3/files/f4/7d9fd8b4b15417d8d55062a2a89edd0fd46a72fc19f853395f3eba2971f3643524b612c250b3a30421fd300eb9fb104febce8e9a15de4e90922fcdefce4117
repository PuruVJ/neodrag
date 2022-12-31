import { isCI, name as ciName } from "ci-info";
import isDocker from "is-docker";
import isWSL from "is-wsl";
import os from "node:os";
let meta;
function getSystemInfo(versions) {
  if (meta) {
    return meta;
  }
  const cpus = os.cpus() || [];
  meta = {
    nodeVersion: process.version.replace(/^v?/, ""),
    viteVersion: versions.viteVersion,
    astroVersion: versions.astroVersion,
    systemPlatform: os.platform(),
    systemRelease: os.release(),
    systemArchitecture: os.arch(),
    cpuCount: cpus.length,
    cpuModel: cpus.length ? cpus[0].model : null,
    cpuSpeed: cpus.length ? cpus[0].speed : null,
    memoryInMb: Math.trunc(os.totalmem() / Math.pow(1024, 2)),
    isDocker: isDocker(),
    isWSL,
    isCI,
    ciName
  };
  return meta;
}
export {
  getSystemInfo
};
