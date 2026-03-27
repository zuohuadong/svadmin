# Changelog

## [0.9.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.8.0...ui-v0.9.0) (2026-03-27)


### Features

* **ui:** enhance ChatDialog with context-awareness, persistence, and action buttons ([26b40f0](https://github.com/zuohuadong/svadmin/commit/26b40f015aad5ebf7db356091fe1895db4ffac02))

## [0.8.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.7.0...ui-v0.8.0) (2026-03-27)


### Features

* **core,ui,drizzle:** enterprise features sprint - useCan type fix, responsive table, field inference ([52c44b8](https://github.com/zuohuadong/svadmin/commit/52c44b84b363aad25ee866346fd6cb3208eb29d9))


### Bug Fixes

* **core,ui:** resolve tanstack query v6 type errors and select element constraint ([30cc3ae](https://github.com/zuohuadong/svadmin/commit/30cc3ae3f2a6ebf2673465c87c5dcf74ad9e8cca))

## [0.7.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.6.0...ui-v0.7.0) (2026-03-27)


### Features

* **ui:** align basic views and buttons with refine.dev enterprise architecture ([fb40038](https://github.com/zuohuadong/svadmin/commit/fb4003832fd090831cd607fd25a58ecfbf8adadf))


### Bug Fixes

* **ui:** adapt LoginPage to generic identifier and restore core index encoding ([ee849cf](https://github.com/zuohuadong/svadmin/commit/ee849cfceeaf0f1f5e0b8ae5a227628d9d8df1e5))
* **ui:** dynamic sidebar roles and rbac for export/import buttons ([b6f8519](https://github.com/zuohuadong/svadmin/commit/b6f8519351e50518067fa866fa88131452c6208c))

## [0.6.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.5.14...ui-v0.6.0) (2026-03-26)


### Features

* **core,sso:** add AccessControlProvider, CASL/Casbin adapters, and @svadmin/sso OIDC plugin ([271e135](https://github.com/zuohuadong/svadmin/commit/271e135aead8c32cea080e807912a51dec9fb48e))
* svadmin — headless admin framework for Svelte 5 ([d67041a](https://github.com/zuohuadong/svadmin/commit/d67041a4b6aec77702b0490fe934d3207a88daac))
* **ui:** Sheet, Collapsible, 8 new components + 12 UI enhancements (v0.3.19-v0.3.22) ([58b0a57](https://github.com/zuohuadong/svadmin/commit/58b0a57e24f7caaa9cd5d445a4ada1b20edda261))
* **ui:** upgrade design tokens to Shadcn New York style with Bunny Fonts CDN ([c6191c3](https://github.com/zuohuadong/svadmin/commit/c6191c3c180329c46b6b0b4deee657c2f6f7de2e))


### Bug Fixes

* align peerDependencies to ^0.5.0 and complete release-please extra-files ([35fca5a](https://github.com/zuohuadong/svadmin/commit/35fca5a4fa0c8a3284a4f763b46f969c0634459b))
* **ci:** sync versions to 0.5.6 and add npm publish job to release workflow ([a209d20](https://github.com/zuohuadong/svadmin/commit/a209d20c01c7ae958a254f60bd04eccb3d096acf))
* **core:** resolve strict ts constraints across all data providers and stabilize tests ([028a2a6](https://github.com/zuohuadong/svadmin/commit/028a2a6205a9bbe2afd2db558546fb862a4a8bac))
* **packages:** add repository URLs to all package.json for npm provenance ([e84978c](https://github.com/zuohuadong/svadmin/commit/e84978cda2d616d37caf388d48adf5315dfe6f13))
* resolve code standards violations and add engineering config ([91b2c8a](https://github.com/zuohuadong/svadmin/commit/91b2c8a0c92b61223187b8e78900444188386cbf))
* **ui:** add [@source](https://github.com/source) directives for Tailwind 4 auto-scanning of svadmin components ([cda5982](https://github.com/zuohuadong/svadmin/commit/cda5982afd545e17b588dfb4b1a73046a66560b7))
* **ui:** add explicit element type generics to all WithElementRef usages ([0e15da6](https://github.com/zuohuadong/svadmin/commit/0e15da6dbcd2613f6dc59bac1cf90742bfd55130))
* **ui:** add Tailwind 4 [@theme](https://github.com/theme) inline mapping for design token utility classes ([ca3dd0e](https://github.com/zuohuadong/svadmin/commit/ca3dd0ef2bc20c4a746a8e278a08b8f0ece3e696))
* **ui:** align @tanstack/svelte-query peerDependency to ^6.0.0 to fix bun resolution deadlock ([c0b99d7](https://github.com/zuohuadong/svadmin/commit/c0b99d772d15e81434afe0a4799c389c9ae8376e))
* **ui:** apply shadcn New York style defaults across all components ([383aa5e](https://github.com/zuohuadong/svadmin/commit/383aa5e5eaa3ea357e0e80c2e0753790946e1bb1))
* **ui:** auto-import design tokens CSS in AdminApp ([291c6d4](https://github.com/zuohuadong/svadmin/commit/291c6d4312e95452863fc8982ecf15a039ab5225))
* **ui:** auto-import design tokens CSS in AdminApp to fix unstyled components ([ff7ff77](https://github.com/zuohuadong/svadmin/commit/ff7ff77fdd786270922c8222eb2e43f88ca77e4b))
* **ui:** complete New York style audit - dialog, table-head, badge ([81d47ec](https://github.com/zuohuadong/svadmin/commit/81d47ec9a64f1a14867015c0ee497a6c61f42c88))
* **ui:** eliminate all 77 state_referenced_locally Svelte 5 warnings ([c30e1c0](https://github.com/zuohuadong/svadmin/commit/c30e1c08570d189843bacf2d903d7696e384f626))
* **ui:** emulate new-york style shadows and radii in nova components ([cb9ff48](https://github.com/zuohuadong/svadmin/commit/cb9ff48eadbc7de5a43b905381df3585ab3033ae))
* **ui:** remove [@source](https://github.com/source) directives that crash Tailwind v4 Vite plugin on svelte-sonner ([ab340c8](https://github.com/zuohuadong/svadmin/commit/ab340c8ab1b1aa6efd8a9a4b3cb5170b5563fd8d))
* **ui:** resolve typography font loading and adjust badge styling ([c7a0c6b](https://github.com/zuohuadong/svadmin/commit/c7a0c6bea0d2ec36b3a926a547236dc254b9e6f1))
* **ui:** use [@theme](https://github.com/theme) instead of [@theme](https://github.com/theme) inline to preserve Tailwind defaults; add i18n keys ([052d436](https://github.com/zuohuadong/svadmin/commit/052d4368084c246ed92d06ebc8c945c4743ab0e1))
* **ui:** use explicit bare package [@source](https://github.com/source) glob and fix font import order ([440e2a7](https://github.com/zuohuadong/svadmin/commit/440e2a72097b547f14ceab2122bc94d7e3528a13))
* upgrade @tanstack/svelte-table to v9 for Svelte 5 compatibility ([b0be339](https://github.com/zuohuadong/svadmin/commit/b0be339b2689440c89851288015a4325dcb932e5))
* **workspace:** resolve lingering strict mode TS compiler errors, restore StepsForm headless execution, and enforce workspace deps in example app ([afc7204](https://github.com/zuohuadong/svadmin/commit/afc7204bce8625d6b5dc8b47c86be4079fc38648))
