# Changelog

## [0.21.1](https://github.com/zuohuadong/svadmin/compare/core-v0.21.0...core-v0.21.1) (2026-04-10)


### 🐛 Bug Fixes

* **core:** complete clone routing, SSR hardening, refine-adapter safety ([e896f2a](https://github.com/zuohuadong/svadmin/commit/e896f2ae786dde01cb82dbb38ecbe2f4bc4830fa))
* **core:** resolve data provider regressions and type errors ([8728fcc](https://github.com/zuohuadong/svadmin/commit/8728fcc737cbf6ece7400de7282984e3f2dce9f0))
* **core:** resolve functional regressions in routing, forms, and live providers ([09e4f69](https://github.com/zuohuadong/svadmin/commit/09e4f69246ae96c1e4357391e2b53aaad8756902))
* **core:** resolve regressions across SSR auth, mutation hooks, lite components and editor types ([5b716e2](https://github.com/zuohuadong/svadmin/commit/5b716e22dd1f0664b3a884b8d74a583590467065))
* **core:** resolve routing, auth SSR, live events and clone logic regressions from audit ([a025c8c](https://github.com/zuohuadong/svadmin/commit/a025c8c66847dd7fae5fa9ce5bfe81d7a8550dc4))
* **ui,supabase:** clone route support, SSR localStorage guards, missing i18n key ([e1e96ad](https://github.com/zuohuadong/svadmin/commit/e1e96ad991ae1bb545aade3033b9776ae8805347))

## [0.21.0](https://github.com/zuohuadong/svadmin/compare/core-v0.20.4...core-v0.21.0) (2026-04-09)


### ⚠ BREAKING CHANGES

* **core:** useList, useOne, useShow, useMany now return the Tanstack Query result directly instead of wrapping it in { query, overtime }.

### 🚀 Features

* **core:** flatten query hook return values ([#107](https://github.com/zuohuadong/svadmin/issues/107)) ([6082bd1](https://github.com/zuohuadong/svadmin/commit/6082bd1c6290701219b2b5eaf72f4b52845cd258))

## [0.20.4](https://github.com/zuohuadong/svadmin/compare/core-v0.20.3...core-v0.20.4) (2026-04-09)


### 🐛 Bug Fixes

* **quality:** address build warnings and test noise ([19a7637](https://github.com/zuohuadong/svadmin/commit/19a7637a6cd09bc660d71d058ca275124271254f))

## [0.20.3](https://github.com/zuohuadong/svadmin/compare/core-v0.20.2...core-v0.20.3) (2026-04-09)


### 🐛 Bug Fixes

* **core:** add bun types to tsconfig.json to resolve test compilation errors ([ce6fb1e](https://github.com/zuohuadong/svadmin/commit/ce6fb1e5f0de00d844513f0d68c37ba81b2149d1))

## [0.20.2](https://github.com/zuohuadong/svadmin/compare/core-v0.20.1...core-v0.20.2) (2026-04-08)


### 🐛 Bug Fixes

* **build:** resolve vite 8 rolldown and svelte-table compatibility ([#100](https://github.com/zuohuadong/svadmin/issues/100)) ([e6d26f3](https://github.com/zuohuadong/svadmin/commit/e6d26f300312684b3831c9f7b61f4886f8dae955))

## [0.20.1](https://github.com/zuohuadong/svadmin/compare/core-v0.20.0...core-v0.20.1) (2026-04-07)


### 🐛 Bug Fixes

* **core,ui:** connect color theme switching to CSS variable overrides ([4a62936](https://github.com/zuohuadong/svadmin/commit/4a62936be2d2ab9b17d8ebb1b945cc8238d9d4f7))

## [0.20.0](https://github.com/zuohuadong/svadmin/compare/core-v0.19.5...core-v0.20.0) (2026-04-06)


### 🚀 Features

* **ui:** add siteUrl prop to optionally render a Go To Site button in the header ([#97](https://github.com/zuohuadong/svadmin/issues/97)) ([abf5de0](https://github.com/zuohuadong/svadmin/commit/abf5de07d581b1b59a8deab4e01657591dc10025))

## [0.19.5](https://github.com/zuohuadong/svadmin/compare/core-v0.19.4...core-v0.19.5) (2026-04-05)


### 🐛 Bug Fixes

* **i18n:** add missing common.noDataHint translation keys ([#91](https://github.com/zuohuadong/svadmin/issues/91)) ([7842107](https://github.com/zuohuadong/svadmin/commit/78421072c182f3076f2cf71078fc82ad0c21509b))

## [0.19.4](https://github.com/zuohuadong/svadmin/compare/core-v0.19.3...core-v0.19.4) (2026-04-03)


### 🐛 Bug Fixes

* **ui:** fix unclosed string literal in ConfigErrorScreen ternary ([#85](https://github.com/zuohuadong/svadmin/issues/85)) ([cee2db1](https://github.com/zuohuadong/svadmin/commit/cee2db17c87b314f8cbf7f1822b63bb57645f87d))

## [0.19.3](https://github.com/zuohuadong/svadmin/compare/core-v0.19.2...core-v0.19.3) (2026-03-31)


### 💅 Elegance & Refactoring

* **core:** decouple sonner-svelte from core to make it truly headless ([e9ea226](https://github.com/zuohuadong/svadmin/commit/e9ea226cd1765fe3d43a0d53705a14ec27e5be44))
* **core:** make core fully headless by decoupling sonner-svelte ([6f6c561](https://github.com/zuohuadong/svadmin/commit/6f6c5618597df5fcb8257f3bd09ba813710bce6c))
* **nestjsx-crud:** remove unused query-string dependency ([e9ea226](https://github.com/zuohuadong/svadmin/commit/e9ea226cd1765fe3d43a0d53705a14ec27e5be44))

## [0.19.2](https://github.com/zuohuadong/svadmin/compare/core-v0.19.1...core-v0.19.2) (2026-03-30)


### 💅 Elegance & Refactoring

* **core:** architectural refinements (notify, auth hooks, SSR, protective guards) ([f2e9333](https://github.com/zuohuadong/svadmin/commit/f2e93333826ab585ec1d72a2fe4d3cd8f524514f))
* **core:** architectural refinements (notify, auth hooks, SSR, protective guards) ([59a8ad1](https://github.com/zuohuadong/svadmin/commit/59a8ad1e6051cf1fea2fa816878c2ce0bd997790))

## [0.19.1](https://github.com/zuohuadong/svadmin/compare/core-v0.19.0...core-v0.19.1) (2026-03-30)


### Bug Fixes

* **core:** quality refinements — error handling, memory leaks, Svelte 5 compat ([01013db](https://github.com/zuohuadong/svadmin/commit/01013dbd3741d1e3abc11e6158e5358694ff8269))
* **core:** quality refinements — error handling, memory leaks, Svelte 5 compat ([a92829a](https://github.com/zuohuadong/svadmin/commit/a92829aa34910f4df2b850bc33c076e9f1ceb66c))

## [0.19.0](https://github.com/zuohuadong/svadmin/compare/core-v0.18.1...core-v0.19.0) (2026-03-30)


### ⚠ BREAKING CHANGES

* **core:** useTranslation now returns { t, locale, setLocale, getAvailableLocales } instead of { translate, getLocale, changeLocale }. The locale is a reactive property instead of a getter function.

### Features

* **core:** enterprise improvements for i18n and routing ([9388aa9](https://github.com/zuohuadong/svadmin/commit/9388aa92b687287f27280cff20345339107af28e))


### Code Refactoring

* **core:** adopt elegant useTranslation API ([ae97678](https://github.com/zuohuadong/svadmin/commit/ae976780076f695f013d53136fd496b7cc9a20bb))

## [0.18.1](https://github.com/zuohuadong/svadmin/compare/core-v0.18.0...core-v0.18.1) (2026-03-30)


### Bug Fixes

* **core:** sync casl and casbin adapters with AccessControlProvider CanParams update ([47dedac](https://github.com/zuohuadong/svadmin/commit/47dedac167b72bc0814367912c8709d93567363a))
* **core:** sync casl/casbin adapters with CanParams[] update ([ba2cee2](https://github.com/zuohuadong/svadmin/commit/ba2cee24882afe054582d5625321b8a5a868906f))

## [0.18.0](https://github.com/zuohuadong/svadmin/compare/core-v0.17.1...core-v0.18.0) (2026-03-30)


### ⚠ BREAKING CHANGES

* Deprecated legacy useHasPermission API. usePermissions now returns immediate .has() and .can() methods and drops .data envelope. AutoTable drops global cellRenderer prop in favor of columns definitions map. Sidebar now defaults to SvelteKit path routing instead of hash-based (#).

### Code Refactoring

* modernize enterprise architecture and resolve technical debt ([860ae60](https://github.com/zuohuadong/svadmin/commit/860ae607b1d3002e3318c51047d6219bc073050f))

## [0.17.1](https://github.com/zuohuadong/svadmin/compare/core-v0.17.0...core-v0.17.1) (2026-03-30)


### Bug Fixes

* **deps:** replace svelte-sonner with sonner-svelte to resolve Tailwind CSS v4 Vite plugin compile error ([98b330a](https://github.com/zuohuadong/svadmin/commit/98b330a8cea21bd81debd2a85b4923c5f3edf6cb))

## [0.17.0](https://github.com/zuohuadong/svadmin/compare/core-v0.16.0...core-v0.17.0) (2026-03-29)


### Features

* **core:** add AgentProvider with tool calling, approval gates, and generative UI events ([40f6952](https://github.com/zuohuadong/svadmin/commit/40f6952c9f04aecac0ea833bb0205f82cc4da30d))
* implement FieldRenderer component and initialize rich text editor package with modular toolbar and extension support ([3d99335](https://github.com/zuohuadong/svadmin/commit/3d993350c9a2b476d51bd49e9d83bcd664b6aad6))

## [0.16.0](https://github.com/zuohuadong/svadmin/compare/core-v0.15.0...core-v0.16.0) (2026-03-29)


### Features

* **ui:** add ArrayField for nested dynamic form groups ([0407757](https://github.com/zuohuadong/svadmin/commit/04077572b3d6a668df136d6a22375206735d775c))
* **ui:** add enterprise RBAC, audit logs, tenant switcher, task queue, and draggable grid ([449dfaf](https://github.com/zuohuadong/svadmin/commit/449dfaf73febe25a08073c4ea63f0d76f38a2f51))


### Bug Fixes

* **core:** migrate CanAccess and useCan logic to support Svelte 5 closures ([38d4f78](https://github.com/zuohuadong/svadmin/commit/38d4f785e2ca3d7dfc6b62445b29f230e74df284))

## [0.15.0](https://github.com/zuohuadong/svadmin/compare/core-v0.14.0...core-v0.15.0) (2026-03-29)


### Features

* **ui:** add Settings Hub with profile, appearance, and system info pages ([a1b284d](https://github.com/zuohuadong/svadmin/commit/a1b284d613ffe20234e05f2df7c052c9fd1fac00))

## [0.14.0](https://github.com/zuohuadong/svadmin/compare/core-v0.13.0...core-v0.14.0) (2026-03-28)


### ⚠ BREAKING CHANGES

* **core:** trigger major release for removed deprecated APIs

### Features

* **core,sso:** add AccessControlProvider, CASL/Casbin adapters, and @svadmin/sso OIDC plugin ([271e135](https://github.com/zuohuadong/svadmin/commit/271e135aead8c32cea080e807912a51dec9fb48e))
* **core,ui,drizzle:** enterprise features sprint - useCan type fix, responsive table, field inference ([52c44b8](https://github.com/zuohuadong/svadmin/commit/52c44b84b363aad25ee866346fd6cb3208eb29d9))
* **core,ui,lite:** add multi-level menu support with MenuItem type and recursive SidebarItem ([25603ae](https://github.com/zuohuadong/svadmin/commit/25603ae08ee576beda973ee3acfa43ff92cc1cea))
* **core:** add useHasPermission() reactive Rune closure ([4911d3b](https://github.com/zuohuadong/svadmin/commit/4911d3be9421a4a80b948717c755ed18c2279c8f))
* **core:** implement native theme preset system ([031c7b5](https://github.com/zuohuadong/svadmin/commit/031c7b53c15813bd219dfb1a16fc5a5a144fb088))
* **core:** support dark-first theme mode and custom CSS token ([8311787](https://github.com/zuohuadong/svadmin/commit/8311787b62df1252492780c7df2f7549b25c5964))
* **core:** support dark-first theme mode and custom CSS token override ([6526b58](https://github.com/zuohuadong/svadmin/commit/6526b58be3e61896101fa7faed6310f4a1bd3904))
* svadmin — headless admin framework for Svelte 5 ([d67041a](https://github.com/zuohuadong/svadmin/commit/d67041a4b6aec77702b0490fe934d3207a88daac))
* **ui:** enhance ChatDialog with context-awareness, persistence, and action buttons ([26b40f0](https://github.com/zuohuadong/svadmin/commit/26b40f015aad5ebf7db356091fe1895db4ffac02))
* **ui:** Sheet, Collapsible, 8 new components + 12 UI enhancements (v0.3.19-v0.3.22) ([58b0a57](https://github.com/zuohuadong/svadmin/commit/58b0a57e24f7caaa9cd5d445a4ada1b20edda261))


### Bug Fixes

* **core,ui:** resolve tanstack query v6 type errors and select element constraint ([30cc3ae](https://github.com/zuohuadong/svadmin/commit/30cc3ae3f2a6ebf2673465c87c5dcf74ad9e8cca))
* **core:** rename rune-using .ts files to .svelte.ts to fix runtime errors ([d007d75](https://github.com/zuohuadong/svadmin/commit/d007d75aa5ad3e1112efb568e269dba5311c2fbf))
* **core:** resolve strict ts constraints across all data providers and stabilize tests ([028a2a6](https://github.com/zuohuadong/svadmin/commit/028a2a6205a9bbe2afd2db558546fb862a4a8bac))
* **core:** update missing import paths in context.svelte.ts for live.svelte ([9b07010](https://github.com/zuohuadong/svadmin/commit/9b070108647210ded9ec94a18113d851137c913d))
* **core:** verify automatic release pipeline recovery ([8e67f4b](https://github.com/zuohuadong/svadmin/commit/8e67f4bec332b2a41483fade5a98c8299f9f9968))
* **packages:** add repository URLs to all package.json for npm provenance ([e84978c](https://github.com/zuohuadong/svadmin/commit/e84978cda2d616d37caf388d48adf5315dfe6f13))
* resolve code standards violations and add engineering config ([91b2c8a](https://github.com/zuohuadong/svadmin/commit/91b2c8a0c92b61223187b8e78900444188386cbf))
* **ui:** adapt LoginPage to generic identifier and restore core index encoding ([ee849cf](https://github.com/zuohuadong/svadmin/commit/ee849cfceeaf0f1f5e0b8ae5a227628d9d8df1e5))
* **ui:** use [@theme](https://github.com/theme) instead of [@theme](https://github.com/theme) inline to preserve Tailwind defaults; add i18n keys ([052d436](https://github.com/zuohuadong/svadmin/commit/052d4368084c246ed92d06ebc8c945c4743ab0e1))


### Code Refactoring

* **core:** trigger major release for removed deprecated APIs ([d84d348](https://github.com/zuohuadong/svadmin/commit/d84d34862d0151ac30b52dd4a9371f5f449a2e68))

## [0.13.0](https://github.com/zuohuadong/svadmin/compare/core-v0.12.0...core-v0.13.0) (2026-03-28)


### ⚠ BREAKING CHANGES

* **core:** trigger major release for removed deprecated APIs

### Code Refactoring

* **core:** trigger major release for removed deprecated APIs ([d84d348](https://github.com/zuohuadong/svadmin/commit/d84d34862d0151ac30b52dd4a9371f5f449a2e68))

## [0.12.0](https://github.com/zuohuadong/svadmin/compare/core-v0.11.0...core-v0.12.0) (2026-03-28)


### Features

* **core:** add useHasPermission() reactive Rune closure ([4911d3b](https://github.com/zuohuadong/svadmin/commit/4911d3be9421a4a80b948717c755ed18c2279c8f))

## [0.11.0](https://github.com/zuohuadong/svadmin/compare/core-v0.10.0...core-v0.11.0) (2026-03-27)


### Features

* **core,ui,lite:** add multi-level menu support with MenuItem type and recursive SidebarItem ([25603ae](https://github.com/zuohuadong/svadmin/commit/25603ae08ee576beda973ee3acfa43ff92cc1cea))

## [0.10.0](https://github.com/zuohuadong/svadmin/compare/core-v0.9.0...core-v0.10.0) (2026-03-27)


### Features

* **core:** implement native theme preset system ([031c7b5](https://github.com/zuohuadong/svadmin/commit/031c7b53c15813bd219dfb1a16fc5a5a144fb088))

## [0.9.0](https://github.com/zuohuadong/svadmin/compare/core-v0.8.0...core-v0.9.0) (2026-03-27)


### Features

* **core:** support dark-first theme mode and custom CSS token ([8311787](https://github.com/zuohuadong/svadmin/commit/8311787b62df1252492780c7df2f7549b25c5964))
* **core:** support dark-first theme mode and custom CSS token override ([6526b58](https://github.com/zuohuadong/svadmin/commit/6526b58be3e61896101fa7faed6310f4a1bd3904))

## [0.8.0](https://github.com/zuohuadong/svadmin/compare/core-v0.7.0...core-v0.8.0) (2026-03-27)


### Features

* **ui:** enhance ChatDialog with context-awareness, persistence, and action buttons ([26b40f0](https://github.com/zuohuadong/svadmin/commit/26b40f015aad5ebf7db356091fe1895db4ffac02))

## [0.7.0](https://github.com/zuohuadong/svadmin/compare/core-v0.6.1...core-v0.7.0) (2026-03-27)


### Features

* **core,ui,drizzle:** enterprise features sprint - useCan type fix, responsive table, field inference ([52c44b8](https://github.com/zuohuadong/svadmin/commit/52c44b84b363aad25ee866346fd6cb3208eb29d9))


### Bug Fixes

* **core,ui:** resolve tanstack query v6 type errors and select element constraint ([30cc3ae](https://github.com/zuohuadong/svadmin/commit/30cc3ae3f2a6ebf2673465c87c5dcf74ad9e8cca))

## [0.6.1](https://github.com/zuohuadong/svadmin/compare/core-v0.6.0...core-v0.6.1) (2026-03-27)


### Bug Fixes

* **core:** verify automatic release pipeline recovery ([8e67f4b](https://github.com/zuohuadong/svadmin/commit/8e67f4bec332b2a41483fade5a98c8299f9f9968))
* **ui:** adapt LoginPage to generic identifier and restore core index encoding ([ee849cf](https://github.com/zuohuadong/svadmin/commit/ee849cfceeaf0f1f5e0b8ae5a227628d9d8df1e5))

## [0.6.0](https://github.com/zuohuadong/svadmin/compare/core-v0.5.14...core-v0.6.0) (2026-03-26)


### Features

* **core,sso:** add AccessControlProvider, CASL/Casbin adapters, and @svadmin/sso OIDC plugin ([271e135](https://github.com/zuohuadong/svadmin/commit/271e135aead8c32cea080e807912a51dec9fb48e))
* svadmin — headless admin framework for Svelte 5 ([d67041a](https://github.com/zuohuadong/svadmin/commit/d67041a4b6aec77702b0490fe934d3207a88daac))
* **ui:** Sheet, Collapsible, 8 new components + 12 UI enhancements (v0.3.19-v0.3.22) ([58b0a57](https://github.com/zuohuadong/svadmin/commit/58b0a57e24f7caaa9cd5d445a4ada1b20edda261))


### Bug Fixes

* **core:** rename rune-using .ts files to .svelte.ts to fix runtime errors ([d007d75](https://github.com/zuohuadong/svadmin/commit/d007d75aa5ad3e1112efb568e269dba5311c2fbf))
* **core:** resolve strict ts constraints across all data providers and stabilize tests ([028a2a6](https://github.com/zuohuadong/svadmin/commit/028a2a6205a9bbe2afd2db558546fb862a4a8bac))
* **core:** update missing import paths in context.svelte.ts for live.svelte ([9b07010](https://github.com/zuohuadong/svadmin/commit/9b070108647210ded9ec94a18113d851137c913d))
* **packages:** add repository URLs to all package.json for npm provenance ([e84978c](https://github.com/zuohuadong/svadmin/commit/e84978cda2d616d37caf388d48adf5315dfe6f13))
* resolve code standards violations and add engineering config ([91b2c8a](https://github.com/zuohuadong/svadmin/commit/91b2c8a0c92b61223187b8e78900444188386cbf))
* **ui:** use [@theme](https://github.com/theme) instead of [@theme](https://github.com/theme) inline to preserve Tailwind defaults; add i18n keys ([052d436](https://github.com/zuohuadong/svadmin/commit/052d4368084c246ed92d06ebc8c945c4743ab0e1))
