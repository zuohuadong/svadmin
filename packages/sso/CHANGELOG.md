# Changelog

## [0.8.5](https://github.com/zuohuadong/svadmin/compare/sso-v0.8.4...sso-v0.8.5) (2026-04-10)


### 🐛 Bug Fixes

* **core:** resolve regressions across SSR auth, mutation hooks, lite components and editor types ([5b716e2](https://github.com/zuohuadong/svadmin/commit/5b716e22dd1f0664b3a884b8d74a583590467065))
* **providers,auth:** lazy dynamic imports for peer deps, SSR safeguards for window.location access ([2bc5819](https://github.com/zuohuadong/svadmin/commit/2bc5819d59ad223f71e42fa208c8e717412b2552))

## [0.8.4](https://github.com/zuohuadong/svadmin/compare/sso-v0.8.3...sso-v0.8.4) (2026-04-03)


### 🐛 Bug Fixes

* **ui:** fix unclosed string literal in ConfigErrorScreen ternary ([#85](https://github.com/zuohuadong/svadmin/issues/85)) ([cee2db1](https://github.com/zuohuadong/svadmin/commit/cee2db17c87b314f8cbf7f1822b63bb57645f87d))

## [0.8.3](https://github.com/zuohuadong/svadmin/compare/sso-v0.8.2...sso-v0.8.3) (2026-03-31)


### 🔧 Miscellaneous Chores

* **release:** decouple workspace versions for local dev and use dynamic npm publishing ([a54fbe7](https://github.com/zuohuadong/svadmin/commit/a54fbe7270a1afd2b482bdae2684de3139379784))

## [0.8.2](https://github.com/zuohuadong/svadmin/compare/sso-v0.8.1...sso-v0.8.2) (2026-03-31)


### 🐛 Bug Fixes

* **build:** resolve playwright error and preserve semver strings for npm publish using node-workspace ([67e71d4](https://github.com/zuohuadong/svadmin/commit/67e71d4946430122fe1eea7ac06bc40cf9441a85))

## [0.8.1](https://github.com/zuohuadong/svadmin/compare/sso-v0.8.0...sso-v0.8.1) (2026-03-31)


### 💅 Elegance & Refactoring

* **core:** eliminate all backward-compat debt and fix reactivity… ([19996d7](https://github.com/zuohuadong/svadmin/commit/19996d7cc79365985baf9de157aac300ec62ec7d))

## [0.8.0](https://github.com/zuohuadong/svadmin/compare/sso-v0.7.0...sso-v0.8.0) (2026-03-28)


### ⚠ BREAKING CHANGES

* **core:** trigger major release for removed deprecated APIs

### Features

* **core,sso:** add AccessControlProvider, CASL/Casbin adapters, and @svadmin/sso OIDC plugin ([271e135](https://github.com/zuohuadong/svadmin/commit/271e135aead8c32cea080e807912a51dec9fb48e))


### Code Refactoring

* **core:** trigger major release for removed deprecated APIs ([d84d348](https://github.com/zuohuadong/svadmin/commit/d84d34862d0151ac30b52dd4a9371f5f449a2e68))

## [0.7.0](https://github.com/zuohuadong/svadmin/compare/sso-v0.6.0...sso-v0.7.0) (2026-03-28)


### ⚠ BREAKING CHANGES

* **core:** trigger major release for removed deprecated APIs

### Code Refactoring

* **core:** trigger major release for removed deprecated APIs ([d84d348](https://github.com/zuohuadong/svadmin/commit/d84d34862d0151ac30b52dd4a9371f5f449a2e68))

## [0.6.0](https://github.com/zuohuadong/svadmin/compare/sso-v0.5.14...sso-v0.6.0) (2026-03-26)


### Features

* **core,sso:** add AccessControlProvider, CASL/Casbin adapters, and @svadmin/sso OIDC plugin ([271e135](https://github.com/zuohuadong/svadmin/commit/271e135aead8c32cea080e807912a51dec9fb48e))
