"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var dotenv = require("dotenv"), getGithubInfo = require("@changesets/get-github-info");

function _defineProperty(obj, key, value) {
  return key in obj ? Object.defineProperty(obj, key, {
    value: value,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : obj[key] = value, obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter((function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    }))), keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach((function(key) {
      _defineProperty(target, key, source[key]);
    })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach((function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    }));
  }
  return target;
}

dotenv.config();

const changelogFunctions = {
  getDependencyReleaseLine: async (changesets, dependenciesUpdated, options) => {
    if (!options.repo) throw new Error('Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]');
    if (0 === dependenciesUpdated.length) return "";
    return [ `- Updated dependencies [${(await Promise.all(changesets.map((async cs => {
      if (cs.commit) {
        let {links: links} = await getGithubInfo.getInfo({
          repo: options.repo,
          commit: cs.commit
        });
        return links.commit;
      }
    })))).filter((_ => _)).join(", ")}]:`, ...dependenciesUpdated.map((dependency => `  - ${dependency.name}@${dependency.newVersion}`)) ].join("\n");
  },
  getReleaseLine: async (changeset, type, options) => {
    if (!options || !options.repo) throw new Error('Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]');
    let prFromSummary, commitFromSummary, usersFromSummary = [];
    const replacedChangelog = changeset.summary.replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, ((_, pr) => {
      let num = Number(pr);
      return isNaN(num) || (prFromSummary = num), "";
    })).replace(/^\s*commit:\s*([^\s]+)/im, ((_, commit) => (commitFromSummary = commit, 
    ""))).replace(/^\s*(?:author|user):\s*@?([^\s]+)/gim, ((_, user) => (usersFromSummary.push(user), 
    ""))).trim(), [firstLine, ...futureLines] = replacedChangelog.split("\n").map((l => l.trimRight())), links = await (async () => {
      if (void 0 !== prFromSummary) {
        let {links: links} = await getGithubInfo.getInfoFromPullRequest({
          repo: options.repo,
          pull: prFromSummary
        });
        return commitFromSummary && (links = _objectSpread2(_objectSpread2({}, links), {}, {
          commit: `[\`${commitFromSummary}\`](https://github.com/${options.repo}/commit/${commitFromSummary})`
        })), links;
      }
      const commitToFetchFrom = commitFromSummary || changeset.commit;
      if (commitToFetchFrom) {
        let {links: links} = await getGithubInfo.getInfo({
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
    })(), users = usersFromSummary.length ? usersFromSummary.map((userFromSummary => `[@${userFromSummary}](https://github.com/${userFromSummary})`)).join(", ") : links.user, prefix = [ null === links.pull ? "" : " " + links.pull, null === links.commit ? "" : " " + links.commit, null === users ? "" : ` Thanks ${users}!` ].join("");
    return `\n\n-${prefix ? prefix + " -" : ""} ${firstLine}\n${futureLines.map((l => "  " + l)).join("\n")}`;
  }
};

exports.default = changelogFunctions;
