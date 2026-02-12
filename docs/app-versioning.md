# App Versioning

## Overview

The application version is derived from **Git tags** and injected at build time via Vite's `define` mechanism. The version is displayed in the application footer.

## How It Works

```
Git Tag (v1.2.0)
    │
    ▼
CI/CD: env VITE_APP_VERSION=$tag
    │
    ▼
vite.config.ts: define → __APP_VERSION__
    │
    ▼
Runtime: Footer displays "v1.2.0"
```

## Integration Points

### 1. Vite Config (`vite.config.ts`)

Reads the version from `VITE_APP_VERSION` environment variable. Falls back to `git describe` for local development, or `"dev"` if no tags exist.

```ts
import { execFileSync } from 'child_process'

function getAppVersion(): string {
  if (process.env.VITE_APP_VERSION) {
    return process.env.VITE_APP_VERSION
  }
  try {
    return execFileSync('git', ['describe', '--tags', '--always']).toString().trim()
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(getAppVersion()),
  },
})
```

### 2. TypeScript Declaration (`src/vite-env.d.ts`)

Declare the global constant so TypeScript recognizes it:

```ts
declare const __APP_VERSION__: string
```

### 3. Footer Component (`AuthenticatedLayout.tsx`)

Use the constant directly in JSX:

```tsx
<p>© 2024 Komunalka · {__APP_VERSION__}</p>
```

## GitHub Actions Integration

In the release workflow, pass the tag as an environment variable:

```yaml
name: Release Build

on:
  release:
    types: [published]

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      VITE_APP_VERSION: ${{ github.ref_name }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

## Version Resolution Priority

| Environment | Source | Example |
|-------------|--------|---------|
| CI/CD (release) | `VITE_APP_VERSION` env var | `v1.2.0` |
| Local (with tags) | `git describe --tags --always` | `v1.1.0-3-g1a2b3c4` |
| Local (no tags) | Fallback | `dev` |

## Tagging Convention

Use semantic versioning with `v` prefix:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The tag name becomes the version string displayed in the application as-is.
