# Changelog

## [0.10.2](https://github.com/zuohuadong/svadmin/compare/drizzle-v0.10.1...drizzle-v0.10.2) (2026-03-31)


### 🔧 Miscellaneous Chores

* **release:** decouple workspace versions for local dev and use dynamic npm publishing ([a54fbe7](https://github.com/zuohuadong/svadmin/commit/a54fbe7270a1afd2b482bdae2684de3139379784))

## [0.10.1](https://github.com/zuohuadong/svadmin/compare/drizzle-v0.10.0...drizzle-v0.10.1) (2026-03-31)


### 🐛 Bug Fixes

* **build:** resolve playwright error and preserve semver strings for npm publish using node-workspace ([67e71d4](https://github.com/zuohuadong/svadmin/commit/67e71d4946430122fe1eea7ac06bc40cf9441a85))

## [0.10.0](https://github.com/zuohuadong/svadmin/compare/drizzle-v0.9.0...drizzle-v0.10.0) (2026-03-30)


### ⚠ BREAKING CHANGES

* Deprecated legacy useHasPermission API. usePermissions now returns immediate .has() and .can() methods and drops .data envelope. AutoTable drops global cellRenderer prop in favor of columns definitions map. Sidebar now defaults to SvelteKit path routing instead of hash-based (#).

### Code Refactoring

* modernize enterprise architecture and resolve technical debt ([860ae60](https://github.com/zuohuadong/svadmin/commit/860ae607b1d3002e3318c51047d6219bc073050f))

## [0.9.0](https://github.com/zuohuadong/svadmin/compare/drizzle-v0.8.0...drizzle-v0.9.0) (2026-03-28)


### ⚠ BREAKING CHANGES

* **core:** trigger major release for removed deprecated APIs

### Features

* **core,ui,drizzle:** enterprise features sprint - useCan type fix, responsive table, field inference ([52c44b8](https://github.com/zuohuadong/svadmin/commit/52c44b84b363aad25ee866346fd6cb3208eb29d9))
* **drizzle:** add @svadmin/drizzle data provider for Drizzle ORM via refine-sqlx ([2150689](https://github.com/zuohuadong/svadmin/commit/21506892a961553fef6fad9f2756bbc543a9ef32))


### Bug Fixes

* align peerDependencies to ^0.5.0 and complete release-please extra-files ([35fca5a](https://github.com/zuohuadong/svadmin/commit/35fca5a4fa0c8a3284a4f763b46f969c0634459b))


### Code Refactoring

* **core:** trigger major release for removed deprecated APIs ([d84d348](https://github.com/zuohuadong/svadmin/commit/d84d34862d0151ac30b52dd4a9371f5f449a2e68))

## [0.8.0](https://github.com/zuohuadong/svadmin/compare/drizzle-v0.7.0...drizzle-v0.8.0) (2026-03-28)


### ⚠ BREAKING CHANGES

* **core:** trigger major release for removed deprecated APIs

### Code Refactoring

* **core:** trigger major release for removed deprecated APIs ([d84d348](https://github.com/zuohuadong/svadmin/commit/d84d34862d0151ac30b52dd4a9371f5f449a2e68))

## [0.7.0](https://github.com/zuohuadong/svadmin/compare/drizzle-v0.6.0...drizzle-v0.7.0) (2026-03-27)


### Features

* **core,ui,drizzle:** enterprise features sprint - useCan type fix, responsive table, field inference ([52c44b8](https://github.com/zuohuadong/svadmin/commit/52c44b84b363aad25ee866346fd6cb3208eb29d9))

## [0.6.0](https://github.com/zuohuadong/svadmin/compare/drizzle-v0.5.14...drizzle-v0.6.0) (2026-03-26)


### Features

* **drizzle:** add @svadmin/drizzle data provider for Drizzle ORM via refine-sqlx ([2150689](https://github.com/zuohuadong/svadmin/commit/21506892a961553fef6fad9f2756bbc543a9ef32))


### Bug Fixes

* align peerDependencies to ^0.5.0 and complete release-please extra-files ([35fca5a](https://github.com/zuohuadong/svadmin/commit/35fca5a4fa0c8a3284a4f763b46f969c0634459b))
