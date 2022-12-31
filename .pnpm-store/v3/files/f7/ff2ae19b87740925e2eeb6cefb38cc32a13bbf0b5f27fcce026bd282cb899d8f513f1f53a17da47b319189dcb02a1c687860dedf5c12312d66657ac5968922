import { config } from 'dotenv';
import { getInfo, getInfoFromPullRequest } from '@changesets/get-github-info';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

config();
const changelogFunctions = {
  getDependencyReleaseLine: async (changesets, dependenciesUpdated, options) => {
    if (!options.repo) {
      throw new Error('Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]');
    }

    if (dependenciesUpdated.length === 0) return "";
    const changesetLink = `- Updated dependencies [${(await Promise.all(changesets.map(async cs => {
      if (cs.commit) {
        let {
          links
        } = await getInfo({
          repo: options.repo,
          commit: cs.commit
        });
        return links.commit;
      }
    }))).filter(_ => _).join(", ")}]:`;
    const updatedDepenenciesList = dependenciesUpdated.map(dependency => `  - ${dependency.name}@${dependency.newVersion}`);
    return [changesetLink, ...updatedDepenenciesList].join("\n");
  },
  getReleaseLine: async (changeset, type, options) => {
    if (!options || !options.repo) {
      throw new Error('Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]');
    }

    let prFromSummary;
    let commitFromSummary;
    let usersFromSummary = [];
    const replacedChangelog = changeset.summary.replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
      let num = Number(pr);
      if (!isNaN(num)) prFromSummary = num;
      return "";
    }).replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
      commitFromSummary = commit;
      return "";
    }).replace(/^\s*(?:author|user):\s*@?([^\s]+)/gim, (_, user) => {
      usersFromSummary.push(user);
      return "";
    }).trim();
    const [firstLine, ...futureLines] = replacedChangelog.split("\n").map(l => l.trimRight());
    const links = await (async () => {
      if (prFromSummary !== undefined) {
        let {
          links
        } = await getInfoFromPullRequest({
          repo: options.repo,
          pull: prFromSummary
        });

        if (commitFromSummary) {
          links = _objectSpread2(_objectSpread2({}, links), {}, {
            commit: `[\`${commitFromSummary}\`](https://github.com/${options.repo}/commit/${commitFromSummary})`
          });
        }

        return links;
      }

      const commitToFetchFrom = commitFromSummary || changeset.commit;

      if (commitToFetchFrom) {
        let {
          links
        } = await getInfo({
          repo: options.repo,
          commit: commitToFetchFrom
        });
        return links;
      }

      return {
        commit: null,
        pull: null,
        user: null
      };
    })();
    const users = usersFromSummary.length ? usersFromSummary.map(userFromSummary => `[@${userFromSummary}](https://github.com/${userFromSummary})`).join(", ") : links.user;
    const prefix = [links.pull === null ? "" : ` ${links.pull}`, links.commit === null ? "" : ` ${links.commit}`, users === null ? "" : ` Thanks ${users}!`].join("");
    return `\n\n-${prefix ? `${prefix} -` : ""} ${firstLine}\n${futureLines.map(l => `  ${l}`).join("\n")}`;
  }
};

export default changelogFunctions;
