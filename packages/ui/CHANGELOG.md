# Changelog

## [0.29.5](https://github.com/zuohuadong/svadmin/compare/ui-v0.29.4...ui-v0.29.5) (2026-04-09)


### 🐛 Bug Fixes

* **quality:** address build warnings and test noise ([19a7637](https://github.com/zuohuadong/svadmin/commit/19a7637a6cd09bc660d71d058ca275124271254f))

## [0.29.4](https://github.com/zuohuadong/svadmin/compare/ui-v0.29.3...ui-v0.29.4) (2026-04-09)


### 🐛 Bug Fixes

* **ui:** build before publish to include dist ([ca25048](https://github.com/zuohuadong/svadmin/commit/ca250484a583968609e07b937ceadb1b4863249c))

## [0.29.3](https://github.com/zuohuadong/svadmin/compare/ui-v0.29.2...ui-v0.29.3) (2026-04-09)


### 🐛 Bug Fixes

* **build:** ensure dist directory is included in published ui package ([9353d64](https://github.com/zuohuadong/svadmin/commit/9353d648fa7ef888669dd614e650fed8f9e52f5e))

## [0.29.2](https://github.com/zuohuadong/svadmin/compare/ui-v0.29.1...ui-v0.29.2) (2026-04-08)


### 🐛 Bug Fixes

* **build:** resolve vite 8 rolldown and svelte-table compatibility ([#100](https://github.com/zuohuadong/svadmin/issues/100)) ([e6d26f3](https://github.com/zuohuadong/svadmin/commit/e6d26f300312684b3831c9f7b61f4886f8dae955))

## [0.29.1](https://github.com/zuohuadong/svadmin/compare/ui-v0.29.0...ui-v0.29.1) (2026-04-07)


### 🐛 Bug Fixes

* **core,ui:** connect color theme switching to CSS variable overrides ([4a62936](https://github.com/zuohuadong/svadmin/commit/4a62936be2d2ab9b17d8ebb1b945cc8238d9d4f7))

## [0.29.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.28.0...ui-v0.29.0) (2026-04-06)


### 🚀 Features

* **ui:** add siteUrl prop to optionally render a Go To Site button in the header ([#97](https://github.com/zuohuadong/svadmin/issues/97)) ([abf5de0](https://github.com/zuohuadong/svadmin/commit/abf5de07d581b1b59a8deab4e01657591dc10025))

## [0.28.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.27.1...ui-v0.28.0) (2026-04-06)


### 🚀 Features

* **ui:** enhance Sidebar group typography and expand default icon map ([#95](https://github.com/zuohuadong/svadmin/issues/95)) ([2b80b64](https://github.com/zuohuadong/svadmin/commit/2b80b64af8ae3f69eb03f3c9cb90ab80ca1634ed))

## [0.27.1](https://github.com/zuohuadong/svadmin/compare/ui-v0.27.0...ui-v0.27.1) (2026-04-05)


### 🐛 Bug Fixes

* **ui,create-svadmin:** replace residual lucide-svelte imports with @lucide/svelte ([#93](https://github.com/zuohuadong/svadmin/issues/93)) ([2e2a7dd](https://github.com/zuohuadong/svadmin/commit/2e2a7ddf865d3d3a404ebf83f3f16f85fe9c0c40))

## [0.27.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.26.3...ui-v0.27.0) (2026-04-05)


### ⚠ BREAKING CHANGES

* **deps:** @lucide/svelte replaces lucide-svelte as icon package. @tiptap/* upgraded from v2 to v3. zod upgraded from v3 to v4 in @svadmin/lite.

### 🔧 Miscellaneous Chores

* **deps:** major dependency audit - tiptap v3, zod v4, lucide unification ([4f4ca97](https://github.com/zuohuadong/svadmin/commit/4f4ca97e17e77b0aff769d14a7a8d23fb5e1c16f))

## [0.26.3](https://github.com/zuohuadong/svadmin/compare/ui-v0.26.2...ui-v0.26.3) (2026-04-04)


### 🐛 Bug Fixes

* **ui:** global search ignores multiple searchable fields ([#89](https://github.com/zuohuadong/svadmin/issues/89)) ([2b775a2](https://github.com/zuohuadong/svadmin/commit/2b775a20a25ce569cf707baa6bdceca30246a94b))

## [0.26.2](https://github.com/zuohuadong/svadmin/compare/ui-v0.26.1...ui-v0.26.2) (2026-04-04)


### 🔧 Miscellaneous Chores

* **deps:** update all dependencies and fix Svelte 5 & Tiptap breaking changes ([250f19c](https://github.com/zuohuadong/svadmin/commit/250f19c35d6fbed58f8e1710e1fab9087cf69f5a))

## [0.26.1](https://github.com/zuohuadong/svadmin/compare/ui-v0.26.0...ui-v0.26.1) (2026-04-03)


### 🐛 Bug Fixes

* **ui:** fix unclosed string literal in ConfigErrorScreen ternary ([#85](https://github.com/zuohuadong/svadmin/issues/85)) ([cee2db1](https://github.com/zuohuadong/svadmin/commit/cee2db17c87b314f8cbf7f1822b63bb57645f87d))

## [0.26.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.25.3...ui-v0.26.0) (2026-04-02)


### 🚀 Features

* **ui:** remove default border classes in favor of shadow-based depth ([b580d88](https://github.com/zuohuadong/svadmin/commit/b580d889680aa7305183211ea1f74105c834fa0b))
* **ui:** remove default border classes in favor of shadow-based depth ([748de0a](https://github.com/zuohuadong/svadmin/commit/748de0a6ecd5dc8f9e02e127fd4f6331b29f2947))


### 🐛 Bug Fixes

* **ui:** apply Stripe-style design tokens — subtler borders and card-fill inputs ([636594d](https://github.com/zuohuadong/svadmin/commit/636594dd463ded7224fd072943a615192620fed8))
* **ui:** revert borderless PR [#82](https://github.com/zuohuadong/svadmin/issues/82), apply proper Stripe-style design tokens ([492e19e](https://github.com/zuohuadong/svadmin/commit/492e19ed4419aefb68fe461813c9f18f104234ba))

## [0.25.3](https://github.com/zuohuadong/svadmin/compare/ui-v0.25.2...ui-v0.25.3) (2026-04-02)


### 🐛 Bug Fixes

* **ui:** add children snippet rendering to AlertDialog header and footer ([bfbf452](https://github.com/zuohuadong/svadmin/commit/bfbf452c0b36799380a152afbe17497757bbfbf6))
* **ui:** gracefully handle missing optional marked dependencies ([dc90d72](https://github.com/zuohuadong/svadmin/commit/dc90d72b71991d78914b36c2c6e7fb7755af0630))
* **ui:** gracefully handle missing optional marked dependencies ([d1cdcb7](https://github.com/zuohuadong/svadmin/commit/d1cdcb7b09c749c5efd80cc1b71d5e3e1c304cea))

## [0.25.2](https://github.com/zuohuadong/svadmin/compare/ui-v0.25.1...ui-v0.25.2) (2026-04-01)


### 🐛 Bug Fixes

* **create-svadmin:** fix Tailwind v4 scaffolding and broken deps ([974a314](https://github.com/zuohuadong/svadmin/commit/974a314d736236e8de8ceba846ce97cdc2d9352e))
* **create-svadmin:** fix Tailwind v4 scaffolding and broken deps ([945a611](https://github.com/zuohuadong/svadmin/commit/945a611e9bc3f8063ff47e9be598835227539241))

## [0.25.1](https://github.com/zuohuadong/svadmin/compare/ui-v0.25.0...ui-v0.25.1) (2026-04-01)


### 🐛 Bug Fixes

* **ui:** remove invalid Pagination import causing Vite dev crash ([3f9f6c3](https://github.com/zuohuadong/svadmin/commit/3f9f6c337f048b4c4a95e9355ab359f56d033e87))
* **ui:** remove invalid Pagination import causing Vite dev crash ([076aaed](https://github.com/zuohuadong/svadmin/commit/076aaed088e5ab7e7b104a629d4b0277dc673f3b))

## [0.25.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.24.1...ui-v0.25.0) (2026-03-31)


### 🚀 Features

* **ui:** add batchActions snippet prop to AutoTable for bulk operations ([c9e200d](https://github.com/zuohuadong/svadmin/commit/c9e200d65d568dd88225e71595ca68fa68efc756))


### 🐛 Bug Fixes

* **ui:** bypass svelte 5 props_invalid_value crash on undefined filter values by manually managing select and input state bindings ([c800d66](https://github.com/zuohuadong/svadmin/commit/c800d6675ee57fde7bafa3e467cb0bdf7f45b188))
* **ui:** use native html select for AutoTable filters ([43c9dfe](https://github.com/zuohuadong/svadmin/commit/43c9dfe8097366646bc5f13cb654084bf9b54232))

## [0.24.1](https://github.com/zuohuadong/svadmin/compare/ui-v0.24.0...ui-v0.24.1) (2026-03-31)


### 🐛 Bug Fixes

* **ui:** restore sidebar expand button when collapsed ([7342bf0](https://github.com/zuohuadong/svadmin/commit/7342bf06bef3c10abc79a626858df61847a4271e))
* **ui:** restore sidebar expand button when collapsed ([086fb29](https://github.com/zuohuadong/svadmin/commit/086fb29768dd7518d4677afd30e69f1428d6323d))
* **ui:** unify search and filter layout, support select options ([bc3f799](https://github.com/zuohuadong/svadmin/commit/bc3f799f93d84f8a252d5b0d254758673a488046))
* **ui:** unify search and filter layout, support select options ([ba84768](https://github.com/zuohuadong/svadmin/commit/ba847687655e3f9c292f56bec9bfd83802dc9ee6))

## [0.24.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.23.2...ui-v0.24.0) (2026-03-31)


### 🚀 Features

* **ui:** upgrade marked optional peerDependencies strictly to newest major versions (v17) ([0bab9e4](https://github.com/zuohuadong/svadmin/commit/0bab9e474d1473edfa19bbe6624a9653f250b37b))


### 🔧 Miscellaneous Chores

* **release:** decouple workspace versions for local dev and use dynamic npm publishing ([a54fbe7](https://github.com/zuohuadong/svadmin/commit/a54fbe7270a1afd2b482bdae2684de3139379784))

## [0.23.2](https://github.com/zuohuadong/svadmin/compare/ui-v0.23.1...ui-v0.23.2) (2026-03-31)


### 🐛 Bug Fixes

* **build:** resolve playwright error and preserve semver strings for npm publish using node-workspace ([67e71d4](https://github.com/zuohuadong/svadmin/commit/67e71d4946430122fe1eea7ac06bc40cf9441a85))

## [0.23.1](https://github.com/zuohuadong/svadmin/compare/ui-v0.23.0...ui-v0.23.1) (2026-03-31)


### 💅 Elegance & Refactoring

* **core:** decouple sonner-svelte from core to make it truly headless ([e9ea226](https://github.com/zuohuadong/svadmin/commit/e9ea226cd1765fe3d43a0d53705a14ec27e5be44))
* **core:** make core fully headless by decoupling sonner-svelte ([6f6c561](https://github.com/zuohuadong/svadmin/commit/6f6c5618597df5fcb8257f3bd09ba813710bce6c))
* **nestjsx-crud:** remove unused query-string dependency ([e9ea226](https://github.com/zuohuadong/svadmin/commit/e9ea226cd1765fe3d43a0d53705a14ec27e5be44))
* **ui:** encapsulate Headless UI dependencies and remove vaul-svelte ([695b42b](https://github.com/zuohuadong/svadmin/commit/695b42bafd6f94027fdab6c137f795b6eae262da))
* **ui:** encapsulate UI headless dependencies and remove vaul-svelte ([c7484fd](https://github.com/zuohuadong/svadmin/commit/c7484fd43879487cfddbf5242d712526a9518e8b))

## [0.23.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.22.1...ui-v0.23.0) (2026-03-30)


### Features

* **core:** enterprise improvements for i18n and routing ([9388aa9](https://github.com/zuohuadong/svadmin/commit/9388aa92b687287f27280cff20345339107af28e))

## [0.22.1](https://github.com/zuohuadong/svadmin/compare/ui-v0.22.0...ui-v0.22.1) (2026-03-30)


### Bug Fixes

* **ui:** `DropdownMenu` missing open state rendering constraints ([31992fe](https://github.com/zuohuadong/svadmin/commit/31992fe7145f8b591aee1f134af8a3e70f87ffc8))
* **ui:** fix DropdownMenu being open by default and unable to close ([52910ef](https://github.com/zuohuadong/svadmin/commit/52910efef0458e0dff9de38f927e36904f52356c))

## [0.22.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.21.0...ui-v0.22.0) (2026-03-30)


### ⚠ BREAKING CHANGES

* **ui:** The rich text editor is no longer bundled by default in @svadmin/ui. The static string dependency \`import('@svadmin/editor')\` inside FieldRenderer has been removed, preventing Vite from forcing its resolution during build. Users who want the Tiptap rich text editor must now explicitly provide it via global Dependency Injection.

### Code Refactoring

* **ui:** decouple @svadmin/editor from UI package ([3ea61e9](https://github.com/zuohuadong/svadmin/commit/3ea61e9c796dbad29b8eef43fb8a5252e8ad496d))

## [0.21.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.20.3...ui-v0.21.0) (2026-03-30)


### ⚠ BREAKING CHANGES

* Deprecated legacy useHasPermission API. usePermissions now returns immediate .has() and .can() methods and drops .data envelope. AutoTable drops global cellRenderer prop in favor of columns definitions map. Sidebar now defaults to SvelteKit path routing instead of hash-based (#).

### Code Refactoring

* modernize enterprise architecture and resolve technical debt ([860ae60](https://github.com/zuohuadong/svadmin/commit/860ae607b1d3002e3318c51047d6219bc073050f))

## [0.20.3](https://github.com/zuohuadong/svadmin/compare/ui-v0.20.2...ui-v0.20.3) (2026-03-30)


### Bug Fixes

* **deps:** replace svelte-sonner with sonner-svelte to resolve Tailwind CSS v4 Vite plugin compile error ([98b330a](https://github.com/zuohuadong/svadmin/commit/98b330a8cea21bd81debd2a85b4923c5f3edf6cb))

## [0.20.2](https://github.com/zuohuadong/svadmin/compare/ui-v0.20.1...ui-v0.20.2) (2026-03-30)


### Bug Fixes

* **ui:** remove static export of Editor to prevent TS missing module errors ([769299d](https://github.com/zuohuadong/svadmin/commit/769299d6cb37207461e5a78cd4c6d4062a8ba0ab))

## [0.20.1](https://github.com/zuohuadong/svadmin/compare/ui-v0.20.0...ui-v0.20.1) (2026-03-29)


### Bug Fixes

* **ui:** resolve svelte2tsx compilation errors for exported types ([f19db4f](https://github.com/zuohuadong/svadmin/commit/f19db4fc0b9cae9ce58863321fbe445b00ba22db))

## [0.20.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.19.0...ui-v0.20.0) (2026-03-29)


### Features

* implement FieldRenderer component and initialize rich text editor package with modular toolbar and extension support ([3d99335](https://github.com/zuohuadong/svadmin/commit/3d993350c9a2b476d51bd49e9d83bcd664b6aad6))
* **ui:** wire AgentProvider into ChatDialog and CommandPalette with AI mode ([fc466a6](https://github.com/zuohuadong/svadmin/commit/fc466a60cf193628134a8d5f3aa42cc39af9e813))


### Bug Fixes

* **ui:** add missing DraggableHeader import in AutoTable ([4b2555b](https://github.com/zuohuadong/svadmin/commit/4b2555b6da3c01a23c22d64d1b23a456d516c363))
* **ui:** add missing DraggableHeader import in AutoTable ([7917e3b](https://github.com/zuohuadong/svadmin/commit/7917e3bc0c9dca00b097c43aa76681b94178cb16))

## [0.19.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.18.0...ui-v0.19.0) (2026-03-29)


### Features

* **ui:** add ArrayField for nested dynamic form groups ([0407757](https://github.com/zuohuadong/svadmin/commit/04077572b3d6a668df136d6a22375206735d775c))
* **ui:** add enterprise RBAC, audit logs, tenant switcher, task queue, and draggable grid ([449dfaf](https://github.com/zuohuadong/svadmin/commit/449dfaf73febe25a08073c4ea63f0d76f38a2f51))


### Bug Fixes

* **core:** migrate CanAccess and useCan logic to support Svelte 5 closures ([38d4f78](https://github.com/zuohuadong/svadmin/commit/38d4f785e2ca3d7dfc6b62445b29f230e74df284))
* **ui:** refactor action buttons to use getter-based useCan signature and remove dead storybook configs ([a5ae668](https://github.com/zuohuadong/svadmin/commit/a5ae66818bfb172ac23425049c869ccb7fceb9de))
* **ui:** remove stale null-checks on useCan result and add AC provide… ([1825b92](https://github.com/zuohuadong/svadmin/commit/1825b92f021ed3bd2cc01ed1afba4088b9213266))
* **ui:** remove stale null-checks on useCan result and add AC provider guard to AutoTable ([93cb0c4](https://github.com/zuohuadong/svadmin/commit/93cb0c4cbad3471c3dc7d3b0989f3f2f32e3e432))

## [0.18.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.17.0...ui-v0.18.0) (2026-03-29)


### Features

* **ui:** add Settings Hub with profile, appearance, and system info pages ([a1b284d](https://github.com/zuohuadong/svadmin/commit/a1b284d613ffe20234e05f2df7c052c9fd1fac00))

## [0.17.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.16.0...ui-v0.17.0) (2026-03-28)


### ⚠ BREAKING CHANGES

* **core:** trigger major release for removed deprecated APIs

### Features

* **core,sso:** add AccessControlProvider, CASL/Casbin adapters, and @svadmin/sso OIDC plugin ([271e135](https://github.com/zuohuadong/svadmin/commit/271e135aead8c32cea080e807912a51dec9fb48e))
* **core,ui,drizzle:** enterprise features sprint - useCan type fix, responsive table, field inference ([52c44b8](https://github.com/zuohuadong/svadmin/commit/52c44b84b363aad25ee866346fd6cb3208eb29d9))
* **core,ui,lite:** add multi-level menu support with MenuItem type and recursive SidebarItem ([25603ae](https://github.com/zuohuadong/svadmin/commit/25603ae08ee576beda973ee3acfa43ff92cc1cea))
* **core:** support dark-first theme mode and custom CSS token ([8311787](https://github.com/zuohuadong/svadmin/commit/8311787b62df1252492780c7df2f7549b25c5964))
* **core:** support dark-first theme mode and custom CSS token override ([6526b58](https://github.com/zuohuadong/svadmin/commit/6526b58be3e61896101fa7faed6310f4a1bd3904))
* svadmin — headless admin framework for Svelte 5 ([d67041a](https://github.com/zuohuadong/svadmin/commit/d67041a4b6aec77702b0490fe934d3207a88daac))
* **ui:** add column visibility persistence, ARIA labels, frosted glass popovers, tooltip springs, smooth scroll ([30aaadc](https://github.com/zuohuadong/svadmin/commit/30aaadc0a9375d05784ff294c8e4e54ee38987d0))
* **ui:** add component injection via Svelte Context DI ([0f2b765](https://github.com/zuohuadong/svadmin/commit/0f2b76539be91004150729d9690e94648f3fd1f6))
* **ui:** add InlineEdit component, SVG chart suite (Bar/Line/Pie), and RTL layout support ([70290cf](https://github.com/zuohuadong/svadmin/commit/70290cf57f792898cb551551d9260eb3805f7e39))
* **ui:** add premium SaaS enhancements batch 2 - AnimatedCounter, KeyboardShortcuts, breadcrumb crossfade, gradient cards, dark glow, row stagger, shake validation, reduced-motion, optimistic delete ([077856f](https://github.com/zuohuadong/svadmin/commit/077856f0cca2e8cb69e5491ebe6719c5baab2fdd))
* **ui:** add VirtualTable, DraggableHeader, Storybook setup, and chart stories ([3a1a919](https://github.com/zuohuadong/svadmin/commit/3a1a919370b267c03cfb6ed43599a6bf18353d20))
* **ui:** align basic views and buttons with refine.dev enterprise architecture ([fb40038](https://github.com/zuohuadong/svadmin/commit/fb4003832fd090831cd607fd25a58ecfbf8adadf))
* **ui:** apply developer-native font-mono style to identifiers and shortcuts ([fdecbe3](https://github.com/zuohuadong/svadmin/commit/fdecbe3ae6f2dab25ddbf821a24eac648fbab574))
* **ui:** enable full aria-* passthrough on TooltipButton ([4aa6c97](https://github.com/zuohuadong/svadmin/commit/4aa6c97f6fb35091d32b62bc7f249c360dcb32f7))
* **ui:** enhance ChatDialog with context-awareness, persistence, and action buttons ([26b40f0](https://github.com/zuohuadong/svadmin/commit/26b40f015aad5ebf7db356091fe1895db4ffac02))
* **ui:** enhance mobile layout and touch responsiveness ([4f1a6a2](https://github.com/zuohuadong/svadmin/commit/4f1a6a2a85c3272e69c592bec418d91d89eeb83a))
* **ui:** extend component registry with more override slots ([fe6aab3](https://github.com/zuohuadong/svadmin/commit/fe6aab303354295c90b21373347b803d837a64df))
* **ui:** implement comprehensive AI component library (Phase 1-4) ([35c94b5](https://github.com/zuohuadong/svadmin/commit/35c94b537727fc12adf0fc9a1d89ca77c8e5f4d4))
* **ui:** integrate InlineEdit and DraggableHeader into AutoTable ([7dcadda](https://github.com/zuohuadong/svadmin/commit/7dcadda80365f9655ce9fec3316467b9889b4fa1))
* **ui:** Sheet, Collapsible, 8 new components + 12 UI enhancements (v0.3.19-v0.3.22) ([58b0a57](https://github.com/zuohuadong/svadmin/commit/58b0a57e24f7caaa9cd5d445a4ada1b20edda261))
* **ui:** upgrade design tokens to Shadcn New York style with Bunny Fonts CDN ([c6191c3](https://github.com/zuohuadong/svadmin/commit/c6191c3c180329c46b6b0b4deee657c2f6f7de2e))


### Bug Fixes

* align peerDependencies to ^0.5.0 and complete release-please extra-files ([35fca5a](https://github.com/zuohuadong/svadmin/commit/35fca5a4fa0c8a3284a4f763b46f969c0634459b))
* **ci:** sync versions to 0.5.6 and add npm publish job to release workflow ([a209d20](https://github.com/zuohuadong/svadmin/commit/a209d20c01c7ae958a254f60bd04eccb3d096acf))
* **core,ui:** resolve tanstack query v6 type errors and select element constraint ([30cc3ae](https://github.com/zuohuadong/svadmin/commit/30cc3ae3f2a6ebf2673465c87c5dcf74ad9e8cca))
* **core:** resolve strict ts constraints across all data providers and stabilize tests ([028a2a6](https://github.com/zuohuadong/svadmin/commit/028a2a6205a9bbe2afd2db558546fb862a4a8bac))
* **packages:** add repository URLs to all package.json for npm provenance ([e84978c](https://github.com/zuohuadong/svadmin/commit/e84978cda2d616d37caf388d48adf5315dfe6f13))
* resolve code standards violations and add engineering config ([91b2c8a](https://github.com/zuohuadong/svadmin/commit/91b2c8a0c92b61223187b8e78900444188386cbf))
* **ui:** adapt LoginPage to generic identifier and restore core index encoding ([ee849cf](https://github.com/zuohuadong/svadmin/commit/ee849cfceeaf0f1f5e0b8ae5a227628d9d8df1e5))
* **ui:** add [@source](https://github.com/source) directives for Tailwind 4 auto-scanning of svadmin components ([cda5982](https://github.com/zuohuadong/svadmin/commit/cda5982afd545e17b588dfb4b1a73046a66560b7))
* **ui:** add explicit element type generics to all WithElementRef usages ([0e15da6](https://github.com/zuohuadong/svadmin/commit/0e15da6dbcd2613f6dc59bac1cf90742bfd55130))
* **ui:** add global border-color reset to app.css ([263f821](https://github.com/zuohuadong/svadmin/commit/263f821ea2afb51a7d6e79d32f2392011874693b))
* **ui:** add global border-color reset to app.css ([00776d5](https://github.com/zuohuadong/svadmin/commit/00776d50e875c334ccf6f9fbfd6d4c16bcd2fe98))
* **ui:** add Tailwind 4 [@theme](https://github.com/theme) inline mapping for design token utility classes ([ca3dd0e](https://github.com/zuohuadong/svadmin/commit/ca3dd0ef2bc20c4a746a8e278a08b8f0ece3e696))
* **ui:** align @tanstack/svelte-query peerDependency to ^6.0.0 to fix bun resolution deadlock ([c0b99d7](https://github.com/zuohuadong/svadmin/commit/c0b99d772d15e81434afe0a4799c389c9ae8376e))
* **ui:** apply shadcn New York style defaults across all components ([383aa5e](https://github.com/zuohuadong/svadmin/commit/383aa5e5eaa3ea357e0e80c2e0753790946e1bb1))
* **ui:** auto-import design tokens CSS in AdminApp ([291c6d4](https://github.com/zuohuadong/svadmin/commit/291c6d4312e95452863fc8982ecf15a039ab5225))
* **ui:** auto-import design tokens CSS in AdminApp to fix unstyled components ([ff7ff77](https://github.com/zuohuadong/svadmin/commit/ff7ff77fdd786270922c8222eb2e43f88ca77e4b))
* **ui:** complete New York style audit - dialog, table-head, badge ([81d47ec](https://github.com/zuohuadong/svadmin/commit/81d47ec9a64f1a14867015c0ee497a6c61f42c88))
* **ui:** dynamic sidebar roles and rbac for export/import buttons ([b6f8519](https://github.com/zuohuadong/svadmin/commit/b6f8519351e50518067fa866fa88131452c6208c))
* **ui:** eliminate all 77 state_referenced_locally Svelte 5 warnings ([c30e1c0](https://github.com/zuohuadong/svadmin/commit/c30e1c08570d189843bacf2d903d7696e384f626))
* **ui:** emulate new-york style shadows and radii in nova components ([cb9ff48](https://github.com/zuohuadong/svadmin/commit/cb9ff48eadbc7de5a43b905381df3585ab3033ae))
* **ui:** highlight.js ESM compat + Tailwind v4 integration docs ([55469f4](https://github.com/zuohuadong/svadmin/commit/55469f4a97426277fd539da295c2fdd8c63afb73))
* **ui:** remove [@source](https://github.com/source) directives that crash Tailwind v4 Vite plugin on svelte-sonner ([ab340c8](https://github.com/zuohuadong/svadmin/commit/ab340c8ab1b1aa6efd8a9a4b3cb5170b5563fd8d))
* **ui:** remove style tags from Svelte components to fix Vite/Tailwind v4 parsing crashes ([0178f5a](https://github.com/zuohuadong/svadmin/commit/0178f5a0ba5ae7589c111cedb4951155e6d8fcce))
* **ui:** resolve svelte 5 and typescript strict typing errors ([313478b](https://github.com/zuohuadong/svadmin/commit/313478bc5a95a6cf1d70212e62b21f0bd24fec28))
* **ui:** resolve typography font loading and adjust badge styling ([c7a0c6b](https://github.com/zuohuadong/svadmin/commit/c7a0c6bea0d2ec36b3a926a547236dc254b9e6f1))
* **ui:** sync auth state on route change & fix Svelte 5 store query crashing Dashboard ([623f394](https://github.com/zuohuadong/svadmin/commit/623f39458c47d6d00d5b8aeacf0feb0455852f6b))
* **ui:** use [@theme](https://github.com/theme) instead of [@theme](https://github.com/theme) inline to preserve Tailwind defaults; add i18n keys ([052d436](https://github.com/zuohuadong/svadmin/commit/052d4368084c246ed92d06ebc8c945c4743ab0e1))
* **ui:** use explicit bare package [@source](https://github.com/source) glob and fix font import order ([440e2a7](https://github.com/zuohuadong/svadmin/commit/440e2a72097b547f14ceab2122bc94d7e3528a13))
* upgrade @tanstack/svelte-table to v9 for Svelte 5 compatibility ([b0be339](https://github.com/zuohuadong/svadmin/commit/b0be339b2689440c89851288015a4325dcb932e5))
* **workspace:** resolve lingering strict mode TS compiler errors, restore StepsForm headless execution, and enforce workspace deps in example app ([afc7204](https://github.com/zuohuadong/svadmin/commit/afc7204bce8625d6b5dc8b47c86be4079fc38648))


### Code Refactoring

* **core:** trigger major release for removed deprecated APIs ([d84d348](https://github.com/zuohuadong/svadmin/commit/d84d34862d0151ac30b52dd4a9371f5f449a2e68))

## [0.16.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.15.0...ui-v0.16.0) (2026-03-28)


### ⚠ BREAKING CHANGES

* **core:** trigger major release for removed deprecated APIs

### Features

* **ui:** apply developer-native font-mono style to identifiers and shortcuts ([fdecbe3](https://github.com/zuohuadong/svadmin/commit/fdecbe3ae6f2dab25ddbf821a24eac648fbab574))


### Code Refactoring

* **core:** trigger major release for removed deprecated APIs ([d84d348](https://github.com/zuohuadong/svadmin/commit/d84d34862d0151ac30b52dd4a9371f5f449a2e68))

## [0.15.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.14.0...ui-v0.15.0) (2026-03-28)


### Features

* **ui:** enable full aria-* passthrough on TooltipButton ([4aa6c97](https://github.com/zuohuadong/svadmin/commit/4aa6c97f6fb35091d32b62bc7f249c360dcb32f7))
* **ui:** enhance mobile layout and touch responsiveness ([4f1a6a2](https://github.com/zuohuadong/svadmin/commit/4f1a6a2a85c3272e69c592bec418d91d89eeb83a))


### Bug Fixes

* **ui:** highlight.js ESM compat + Tailwind v4 integration docs ([55469f4](https://github.com/zuohuadong/svadmin/commit/55469f4a97426277fd539da295c2fdd8c63afb73))

## [0.14.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.13.0...ui-v0.14.0) (2026-03-27)


### Features

* **core,ui,lite:** add multi-level menu support with MenuItem type and recursive SidebarItem ([25603ae](https://github.com/zuohuadong/svadmin/commit/25603ae08ee576beda973ee3acfa43ff92cc1cea))

## [0.13.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.12.0...ui-v0.13.0) (2026-03-27)


### Features

* **ui:** add column visibility persistence, ARIA labels, frosted glass popovers, tooltip springs, smooth scroll ([30aaadc](https://github.com/zuohuadong/svadmin/commit/30aaadc0a9375d05784ff294c8e4e54ee38987d0))
* **ui:** add InlineEdit component, SVG chart suite (Bar/Line/Pie), and RTL layout support ([70290cf](https://github.com/zuohuadong/svadmin/commit/70290cf57f792898cb551551d9260eb3805f7e39))
* **ui:** add premium SaaS enhancements batch 2 - AnimatedCounter, KeyboardShortcuts, breadcrumb crossfade, gradient cards, dark glow, row stagger, shake validation, reduced-motion, optimistic delete ([077856f](https://github.com/zuohuadong/svadmin/commit/077856f0cca2e8cb69e5491ebe6719c5baab2fdd))
* **ui:** add VirtualTable, DraggableHeader, Storybook setup, and chart stories ([3a1a919](https://github.com/zuohuadong/svadmin/commit/3a1a919370b267c03cfb6ed43599a6bf18353d20))
* **ui:** integrate InlineEdit and DraggableHeader into AutoTable ([7dcadda](https://github.com/zuohuadong/svadmin/commit/7dcadda80365f9655ce9fec3316467b9889b4fa1))

## [0.12.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.11.2...ui-v0.12.0) (2026-03-27)


### Features

* **core:** support dark-first theme mode and custom CSS token ([8311787](https://github.com/zuohuadong/svadmin/commit/8311787b62df1252492780c7df2f7549b25c5964))
* **core:** support dark-first theme mode and custom CSS token override ([6526b58](https://github.com/zuohuadong/svadmin/commit/6526b58be3e61896101fa7faed6310f4a1bd3904))
* **ui:** extend component registry with more override slots ([fe6aab3](https://github.com/zuohuadong/svadmin/commit/fe6aab303354295c90b21373347b803d837a64df))

## [0.11.2](https://github.com/zuohuadong/svadmin/compare/ui-v0.11.1...ui-v0.11.2) (2026-03-27)


### Bug Fixes

* **ui:** add global border-color reset to app.css ([263f821](https://github.com/zuohuadong/svadmin/commit/263f821ea2afb51a7d6e79d32f2392011874693b))
* **ui:** add global border-color reset to app.css ([00776d5](https://github.com/zuohuadong/svadmin/commit/00776d50e875c334ccf6f9fbfd6d4c16bcd2fe98))
* **ui:** remove style tags from Svelte components to fix Vite/Tailwind v4 parsing crashes ([0178f5a](https://github.com/zuohuadong/svadmin/commit/0178f5a0ba5ae7589c111cedb4951155e6d8fcce))

## [0.11.1](https://github.com/zuohuadong/svadmin/compare/ui-v0.11.0...ui-v0.11.1) (2026-03-27)


### Bug Fixes

* **ui:** sync auth state on route change & fix Svelte 5 store query crashing Dashboard ([623f394](https://github.com/zuohuadong/svadmin/commit/623f39458c47d6d00d5b8aeacf0feb0455852f6b))

## [0.11.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.10.0...ui-v0.11.0) (2026-03-27)


### Features

* **ui:** add component injection via Svelte Context DI ([0f2b765](https://github.com/zuohuadong/svadmin/commit/0f2b76539be91004150729d9690e94648f3fd1f6))

## [0.10.0](https://github.com/zuohuadong/svadmin/compare/ui-v0.9.0...ui-v0.10.0) (2026-03-27)


### Features

* **ui:** implement comprehensive AI component library (Phase 1-4) ([35c94b5](https://github.com/zuohuadong/svadmin/commit/35c94b537727fc12adf0fc9a1d89ca77c8e5f4d4))


### Bug Fixes

* **ui:** resolve svelte 5 and typescript strict typing errors ([313478b](https://github.com/zuohuadong/svadmin/commit/313478bc5a95a6cf1d70212e62b21f0bd24fec28))

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
