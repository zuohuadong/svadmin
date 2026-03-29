# Changelog

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
