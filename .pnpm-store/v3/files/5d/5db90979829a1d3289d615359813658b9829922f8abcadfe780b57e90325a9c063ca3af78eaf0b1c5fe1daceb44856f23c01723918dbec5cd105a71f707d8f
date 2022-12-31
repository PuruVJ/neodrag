import { execa } from "execa";
const getPlatformSpecificCommand = () => {
  const isGitPod = Boolean(process.env.GITPOD_REPO_ROOT);
  const platform = isGitPod ? "gitpod" : process.platform;
  switch (platform) {
    case "android":
    case "linux":
      return ["xdg-open"];
    case "darwin":
      return ["open"];
    case "win32":
      return ["cmd", ["/c", "start"]];
    case "gitpod":
      return ["/ide/bin/remote-cli/gitpod-code", ["--openExternal"]];
    default:
      throw new Error(
        `It looks like your platform ("${platform}") isn't supported!
To view Astro's docs, please visit https://docs.astro.build`
      );
  }
};
async function openInBrowser(url) {
  const [command, args = []] = getPlatformSpecificCommand();
  return execa(command, [...args, encodeURI(url)]);
}
export {
  openInBrowser
};
