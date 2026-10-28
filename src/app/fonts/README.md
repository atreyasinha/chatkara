Self-hosted fonts (latin subset, variable `wght` axis), copied from Fontsource npm packages:

| File | Package | License |
|---|---|---|
| `cormorant-garamond-latin-wght-normal.woff2` | `@fontsource-variable/cormorant-garamond@5.3.0` | OFL-1.1 |
| `source-sans-3-latin-wght-normal.woff2` | `@fontsource-variable/source-sans-3@5.3.1` | OFL-1.1 |
| `caveat-latin-wght-normal.woff2` | `@fontsource-variable/caveat@5.3.0` | OFL-1.1 |

Loaded with `next/font/local` in `src/app/layout.tsx`. We self-host instead of using
`next/font/google` because Turbopack builds on Vercel intermittently fail to parse
Google's font URLs (vercel/next.js#99114).
