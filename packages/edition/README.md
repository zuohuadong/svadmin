# @svadmin/edition

Multi-tenant edition and white-label configuration for svadmin apps.

## Features

- Runtime brand configuration (title, logo, nav labels, skills)
- Defensive parsing with safe fallbacks
- Fetch from server API endpoint

## Install

```bash
bun add @svadmin/edition
```

## Usage

```ts
import { fetchEditionConfig, normalizeEditionConfig, defaultEditionConfig } from '@svadmin/edition';

// Fetch from server at runtime
const edition = await fetchEditionConfig();

// Or parse known config
const config = normalizeEditionConfig(inputFromServer);
```
