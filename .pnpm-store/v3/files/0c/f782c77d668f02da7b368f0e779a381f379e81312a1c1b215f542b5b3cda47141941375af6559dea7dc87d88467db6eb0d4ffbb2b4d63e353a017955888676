"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var fetch = require("node-fetch"), DataLoader = require("dataloader");

function _interopDefault(e) {
  return e && e.__esModule ? e : {
    default: e
  };
}

var fetch__default = _interopDefault(fetch), DataLoader__default = _interopDefault(DataLoader);

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

function _objectWithoutPropertiesLoose(source, excluded) {
  if (null == source) return {};
  var key, i, target = {}, sourceKeys = Object.keys(source);
  for (i = 0; i < sourceKeys.length; i++) key = sourceKeys[i], excluded.indexOf(key) >= 0 || (target[key] = source[key]);
  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (null == source) return {};
  var key, i, target = _objectWithoutPropertiesLoose(source, excluded);
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) key = sourceSymbolKeys[i], excluded.indexOf(key) >= 0 || Object.prototype.propertyIsEnumerable.call(source, key) && (target[key] = source[key]);
  }
  return target;
}

const _excluded = [ "repo" ], _excluded2 = [ "repo" ], validRepoNameRegex = /^[\w.-]+\/[\w.-]+$/;

function makeQuery(repos) {
  return `\n      query {\n        ${Object.keys(repos).map(((repo, i) => `a${i}: repository(\n            owner: ${JSON.stringify(repo.split("/")[0])}\n            name: ${JSON.stringify(repo.split("/")[1])}\n          ) {\n            ${repos[repo].map((data => "commit" === data.kind ? `a${data.commit}: object(expression: ${JSON.stringify(data.commit)}) {\n            ... on Commit {\n            commitUrl\n            associatedPullRequests(first: 50) {\n              nodes {\n                number\n                url\n                mergedAt\n                author {\n                  login\n                  url\n                }\n              }\n            }\n            author {\n              user {\n                login\n                url\n              }\n            }\n          }}` : `pr__${data.pull}: pullRequest(number: ${data.pull}) {\n                    url\n                    author {\n                      login\n                      url\n                    }\n                    mergeCommit {\n                      commitUrl\n                      abbreviatedOid\n                    }\n                  }`)).join("\n")}\n          }`)).join("\n")}\n        }\n    `;
}

const GHDataLoader = new DataLoader__default.default((async requests => {
  if (!process.env.GITHUB_TOKEN) throw new Error("Please create a GitHub personal access token at https://github.com/settings/tokens/new with `read:user` and `repo:status` permissions and add it as the GITHUB_TOKEN environment variable");
  let repos = {};
  requests.forEach((_ref => {
    let {repo: repo} = _ref, data = _objectWithoutProperties(_ref, _excluded);
    void 0 === repos[repo] && (repos[repo] = []), repos[repo].push(data);
  }));
  const data = await fetch__default.default("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: "Token " + process.env.GITHUB_TOKEN
    },
    body: JSON.stringify({
      query: makeQuery(repos)
    })
  }).then((x => x.json()));
  if (data.errors) throw new Error("An error occurred when fetching data from GitHub\n" + JSON.stringify(data.errors, null, 2));
  if (!data.data) throw new Error("An error occurred when fetching data from GitHub\n" + JSON.stringify(data));
  let cleanedData = {};
  return Object.keys(repos).forEach(((repo, index) => {
    let output = {
      commit: {},
      pull: {}
    };
    cleanedData[repo] = output, Object.entries(data.data["a" + index]).forEach((([field, value]) => {
      "a" === field[0] ? output.commit[field.substring(1)] = value : output.pull[field.replace("pr__", "")] = value;
    }));
  })), requests.map((_ref2 => {
    let {repo: repo} = _ref2, data = _objectWithoutProperties(_ref2, _excluded2);
    return cleanedData[repo][data.kind]["pull" === data.kind ? data.pull : data.commit];
  }));
}));

async function getInfo(request) {
  if (!request.commit) throw new Error("Please pass a commit SHA to getInfo");
  if (!request.repo) throw new Error("Please pass a GitHub repository in the form of userOrOrg/repoName to getInfo");
  if (!validRepoNameRegex.test(request.repo)) throw new Error(`Please pass a valid GitHub repository in the form of userOrOrg/repoName to getInfo (it has to match the "${validRepoNameRegex.source}" pattern)`);
  const data = await GHDataLoader.load(_objectSpread2({
    kind: "commit"
  }, request));
  let user = null;
  data.author && data.author.user && (user = data.author.user);
  let associatedPullRequest = data.associatedPullRequests && data.associatedPullRequests.nodes && data.associatedPullRequests.nodes.length ? data.associatedPullRequests.nodes.sort(((a, b) => null === a.mergedAt && null === b.mergedAt ? 0 : null === a.mergedAt ? 1 : null === b.mergedAt ? -1 : (a = new Date(a.mergedAt)) > (b = new Date(b.mergedAt)) ? 1 : a < b ? -1 : 0))[0] : null;
  return associatedPullRequest && (user = associatedPullRequest.author), {
    user: user ? user.login : null,
    pull: associatedPullRequest ? associatedPullRequest.number : null,
    links: {
      commit: `[\`${request.commit}\`](${data.commitUrl})`,
      pull: associatedPullRequest ? `[#${associatedPullRequest.number}](${associatedPullRequest.url})` : null,
      user: user ? `[@${user.login}](${user.url})` : null
    }
  };
}

async function getInfoFromPullRequest(request) {
  if (void 0 === request.pull) throw new Error("Please pass a pull request number");
  if (!request.repo) throw new Error("Please pass a GitHub repository in the form of userOrOrg/repoName to getInfo");
  if (!validRepoNameRegex.test(request.repo)) throw new Error(`Please pass a valid GitHub repository in the form of userOrOrg/repoName to getInfo (it has to match the "${validRepoNameRegex.source}" pattern)`);
  const data = await GHDataLoader.load(_objectSpread2({
    kind: "pull"
  }, request));
  let user = null == data ? void 0 : data.author, commit = null == data ? void 0 : data.mergeCommit;
  return {
    user: user ? user.login : null,
    commit: commit ? commit.abbreviatedOid : null,
    links: {
      commit: commit ? `[\`${commit.abbreviatedOid}\`](${commit.commitUrl})` : null,
      pull: `[#${request.pull}](https://github.com/${request.repo}/pull/${request.pull})`,
      user: user ? `[@${user.login}](${user.url})` : null
    }
  };
}

exports.getInfo = getInfo, exports.getInfoFromPullRequest = getInfoFromPullRequest;
