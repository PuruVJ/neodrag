import { installPackage } from '@antfu/install-pkg';
import { sleep } from '@antfu/utils';
import { cyan } from 'kolorist';
import { warnOnce } from './warn.mjs';

let pending;
const tasks = {};
async function tryInstallPkg(name) {
  if (pending) {
    await pending;
  }
  if (!tasks[name]) {
    console.log(cyan(`Installing ${name}...`));
    tasks[name] = pending = installPackage(name, {
      dev: true,
      preferOffline: true
    }).then(() => sleep(300)).catch((e) => {
      warnOnce(`Failed to install ${name}`);
      console.error(e);
    }).finally(() => {
      pending = void 0;
    });
  }
  return tasks[name];
}

export { tryInstallPkg };
