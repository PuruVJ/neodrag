# Changelog
All notable changes to this project will be documented in this file. Dates are displayed in UTC.

## [4.2.2](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.2.1...v4.2.2) (2022-09-19)

## [4.2.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.2.0...v4.2.1) (2022-06-15)


### Bug Fixes

* broken type info path ([#146](https://github.com/RebeccaStevens/deepmerge-ts/issues/146)) ([b875711](https://github.com/RebeccaStevens/deepmerge-ts/commit/b8757111ccff257e7403b5d91235b965b4542afd))

# [4.2.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.1.0...v4.2.0) (2022-06-15)


### Features

* export types for module resolution node 16 ([20241c5](https://github.com/RebeccaStevens/deepmerge-ts/commit/20241c5bdffcc77025ea778257193f1afbe40768))


### Performance Improvements

* **ts:** add variance annotations ([cecc9db](https://github.com/RebeccaStevens/deepmerge-ts/commit/cecc9dbcfc68335f04372e2fa339a347f71c90bc))
* **ts:** use extends constraints on infer ([f053e76](https://github.com/RebeccaStevens/deepmerge-ts/commit/f053e76221fb790f1dead0b2b5c9a9f4432cb1d8))

# [4.1.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.0.4...v4.1.0) (2022-06-13)


### Features

* treat module imports as records ([20c0dfb](https://github.com/RebeccaStevens/deepmerge-ts/commit/20c0dfb82e4273b10e5a02ba0e74aada42b9bb7a)), closes [#133](https://github.com/RebeccaStevens/deepmerge-ts/issues/133)

## [4.0.4](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.0.3...v4.0.4) (2022-06-13)


### Bug Fixes

* drop keys that have no enumerable properties ([3363570](https://github.com/RebeccaStevens/deepmerge-ts/commit/3363570fcc53488d22a2d4b778b558173c7ee5c9))

## [4.0.3](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.0.2...v4.0.3) (2022-04-06)


### Bug Fixes

* use explict return types for function that return a HKT ([eb4183e](https://github.com/RebeccaStevens/deepmerge-ts/commit/eb4183e5441ea8b36bbb8f24ffa38ba850eb389c)), closes [#94](https://github.com/RebeccaStevens/deepmerge-ts/issues/94)

## [4.0.2](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.0.1...v4.0.2) (2022-03-31)


### Bug Fixes

* protect against prototype pollution ([d637db7](https://github.com/RebeccaStevens/deepmerge-ts/commit/d637db7e4fb2bfb113cb4bc1c85a125936d7081b))

## [4.0.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.0.0...v4.0.1) (2022-03-14)


### Bug Fixes

* **deno:** fix broken import in deno dist files ([#85](https://github.com/RebeccaStevens/deepmerge-ts/issues/85)) ([86faf2a](https://github.com/RebeccaStevens/deepmerge-ts/commit/86faf2a047488be2fbb1ff6a1edd005b5d4670cb))

# [4.0.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v3.0.1...v4.0.0) (2022-02-26)


### Bug Fixes

* improve meta data typings ([#61](https://github.com/RebeccaStevens/deepmerge-ts/issues/61)) ([9a881d3](https://github.com/RebeccaStevens/deepmerge-ts/commit/9a881d3e55762da03b0d0f465d7e958d81fd0958))


### Features

* allow for default merging via a special return value ([658d1fd](https://github.com/RebeccaStevens/deepmerge-ts/commit/658d1fd454fe095e6c7f2be22ccf4823fe0ea6ef))
* allow for implicit default merging ([1d5e617](https://github.com/RebeccaStevens/deepmerge-ts/commit/1d5e617bc4980f64a75fa9da1397979b2310fc06))
* allow for skipping properties completely via a special return value ([#64](https://github.com/RebeccaStevens/deepmerge-ts/issues/64)) ([676f2f6](https://github.com/RebeccaStevens/deepmerge-ts/commit/676f2f6593d6baf0e1b31f29c83bac7c392e7ce2))


### BREAKING CHANGES

* MetaMetaData now must extends DeepMergeBuiltInMetaData

## [3.0.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v3.0.0...v3.0.1) (2022-02-22)


### Bug Fixes

* allows readonly records in DeepMergeRecordsDefaultHKTInternalPropValueHelper ([#60](https://github.com/RebeccaStevens/deepmerge-ts/issues/60)) ([fc85dfa](https://github.com/RebeccaStevens/deepmerge-ts/commit/fc85dfa0cc579de127c8458e808f81cbca84d090))

# [3.0.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v2.0.1...v3.0.0) (2022-02-19)


### Code Refactoring

* unrequire unused types and values ([c78e373](https://github.com/RebeccaStevens/deepmerge-ts/commit/c78e3736fe725008b745a302233afacb2155db94))


### Features

* lone values will now be passed to mergeOthers rather than just returned ([#57](https://github.com/RebeccaStevens/deepmerge-ts/issues/57)) ([9c24584](https://github.com/RebeccaStevens/deepmerge-ts/commit/9c245846f8afbd8bc0fbe2a28626e6461f41ea53))
* provide customizable meta data to custom merge functions ([3d96692](https://github.com/RebeccaStevens/deepmerge-ts/commit/3d96692386c363e3f4250b267cac1d78231457ff)), closes [#33](https://github.com/RebeccaStevens/deepmerge-ts/issues/33)


### BREAKING CHANGES

* some types have changed for `deepmergeCustom`

## [2.0.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v2.0.0...v2.0.1) (2021-12-22)

# [2.0.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.7...v2.0.0) (2021-11-22)


### Bug Fixes

* add better support for readonly types ([#17](https://github.com/RebeccaStevens/deepmerge-ts/issues/17)) ([ee59064](https://github.com/RebeccaStevens/deepmerge-ts/commit/ee5906448bcc0fabef2a2b8e215d4c309d30b4db))


### BREAKING CHANGES

* interface DeepMergeMergeFunctionURItoKind's signature has changed

## [1.1.7](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.6...v1.1.7) (2021-11-22)


### Bug Fixes

* incorrect resulting type when merging 3+ readonly tuples ([#20](https://github.com/RebeccaStevens/deepmerge-ts/issues/20)) ([696a1b2](https://github.com/RebeccaStevens/deepmerge-ts/commit/696a1b21ce225e11e38ee9ef3b92a28cf3ed6a4c))

## [1.1.6](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.5...v1.1.6) (2021-11-22)


### Performance Improvements

* convert recursive types to tail-recursive versions ([#15](https://github.com/RebeccaStevens/deepmerge-ts/issues/15)) ([4401ac2](https://github.com/RebeccaStevens/deepmerge-ts/commit/4401ac2d1651093ab855d3d4bdf6c9628c0767ab))

## [1.1.5](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.4...v1.1.5) (2021-10-18)


### Bug Fixes

* **deno:** deno release fixup ([4b8ca98](https://github.com/RebeccaStevens/deepmerge-ts/commit/4b8ca9868de78228244b099dc2040c4cb16a649d))

## [1.1.4](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.3...v1.1.4) (2021-10-18)

## [1.1.3](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.2...v1.1.3) (2021-09-21)


### Bug Fixes

* order of package exports ([#12](https://github.com/RebeccaStevens/deepmerge-ts/issues/12)) ([4117460](https://github.com/RebeccaStevens/deepmerge-ts/commit/41174607ee57568f123e1a5661f635d5d54f7c0c))

## [1.1.2](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.1...v1.1.2) (2021-09-17)


### Bug Fixes

* current and legacy types trying to using the same file resulting in one being overridden ([#10](https://github.com/RebeccaStevens/deepmerge-ts/issues/10)) ([a5f334b](https://github.com/RebeccaStevens/deepmerge-ts/commit/a5f334b2c4f6735383ea419dd6d3206bcc0afe4a))


### Performance Improvements

* add early escapes to loos when merging unknown types ([17a92e1](https://github.com/RebeccaStevens/deepmerge-ts/commit/17a92e1676a6b6c20f7e3fb1cc966ed5673dccf6))
* directly request enumerable keys so that they don't need to then be filtered ([04a2a5f](https://github.com/RebeccaStevens/deepmerge-ts/commit/04a2a5fb24b1086c8130203451c2836f196e92c6))
* use imperative loops when building merged result of records ([b36f7bc](https://github.com/RebeccaStevens/deepmerge-ts/commit/b36f7bcec43858658c06f8f4ac6deb17a9d7b2fe))

## [1.1.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.0...v1.1.1) (2021-09-16)


### Bug Fixes

* add legacy type information ([#6](https://github.com/RebeccaStevens/deepmerge-ts/issues/6)) ([c7e1019](https://github.com/RebeccaStevens/deepmerge-ts/commit/c7e1019f86818fe95b9f6291f2a09f077337a7f9))
* only merge enumerable properties ([#8](https://github.com/RebeccaStevens/deepmerge-ts/issues/8)) ([0967070](https://github.com/RebeccaStevens/deepmerge-ts/commit/0967070d30427bb33f0c78793d61a9411dde3b49))

# [1.1.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.0.1...v1.1.0) (2021-09-13)


### Features

* add support for custom merging ([#4](https://github.com/RebeccaStevens/deepmerge-ts/issues/4)) ([5413b81](https://github.com/RebeccaStevens/deepmerge-ts/commit/5413b81c0a568c798ff70081966dd9a0ace5fe3f))

## [1.0.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.0.0...v1.0.1) (2021-08-25)


### Bug Fixes

* husky install no longer runs on postinstall ([7102229](https://github.com/RebeccaStevens/deepmerge-ts/commit/7102229a7078fef17ba2a24c9814a844fb525c67))

# 1.0.0 (2021-08-25)


### Features

* add "module" property to package.json ([168747d](https://github.com/RebeccaStevens/deepmerge-ts/commit/168747daef0b49ab8ac3b0491fda965776eef2c2))
* add basic functionality ([8e3ba66](https://github.com/RebeccaStevens/deepmerge-ts/commit/8e3ba66973d6e35cc421149a00a45b7c55c1de45))
