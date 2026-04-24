# N·C·T

<div align="center">
  <p><strong>NO CONVERSION THERAPY</strong></p>
  <p>Multilingual frontend for documenting, organizing, and publicly presenting information about conversion therapy institutions and lived experiences.</p>
  <p>
    <a href="./README.md">简体中文</a> ·
    <a href="./README.zh-TW.md">繁體中文</a> ·
    <a href="./README.en.md"><strong>English</strong></a>
  </p>
  <p>
    <img alt="Node.js 20+" src="https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white">
    <img alt="Vite 8" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
    <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
    <img alt="Static Content Snapshots" src="https://img.shields.io/badge/Static-Content%20Snapshots-0F766E">
  </p>
</div>

> Updated on April 23, 2026: the root `No-Torsion` directory is now a standalone `Vite + React` static frontend. The legacy `Express + EJS + Workers` stack lives in the sibling project `../NCT_old`, while backend services now belong to `../nct-api-sql` and `../nct-api-sql-sub`.

## What This Project Is

`No-Torsion` is now the public-facing frontend shell, not the backend service. It is responsible for:

- rendering frontend routes such as `/`, `/map`, `/blog`, `/port/:id`, and `/privacy`
- generating `public/content/*` static snapshots at build time
- reading public map JSON and rendering it in the browser
- redirecting `/form` to the standalone `nct-api-sql-sub` form page when `VITE_NCT_SUB_FORM_URL` is configured
- reusing the same backend origin for runtime translation of English blog articles and non-simplified-Chinese record details

The root project no longer ships:

- an `Express + EJS` server
- a Worker backend
- form submission write APIs
- institution correction submission APIs
- runtime token endpoints such as `/api/frontend-runtime`

Related sibling projects:

- [`../NCT_old`](../NCT_old): legacy `Express + EJS + Workers`
- [`../nct-api-sql`](../nct-api-sql): main database, public JSON, admin console, push/pull sync
- [`../nct-api-sql-sub`](../nct-api-sql-sub): standalone form page, No-Torsion backend APIs, translation, service reporting

## Current Capabilities

| Module | Notes |
| --- | --- |
| Home / portal | SPA shell for navigation, language switching, and route resolution |
| Map browsing | Reads the public dataset from `VITE_NCT_API_SQL_PUBLIC_DATA_URL`, falling back to `public/content/map-data.json` |
| Blog content | Converts Markdown into static JSON / HTML during the build |
| Multilingual UI | Uses `site-bootstrap.json` for messages, supported languages, and defaults |
| Form entry | `/form` is an entry route only; it redirects to `nct-api-sql-sub` when `VITE_NCT_SUB_FORM_URL` is set |
| Runtime translation | Enabled only when `VITE_NCT_SUB_FORM_URL` is configured |

## Compatibility Notes

The repo still contains some migration-phase frontend code for compatibility, but there is an important boundary:

- `/form` is no longer a local submission flow
- the institution correction UI still exists in the frontend router
- the institution correction flow expects same-origin endpoints such as `/api/frontend-runtime`, `/map/correction/submit`, or `/correction/submit`
- those endpoints are not implemented in this project

So for a direct static deployment of `No-Torsion`:

- map pages, blog pages, privacy pages, and article detail pages work on their own
- `/form` only becomes useful when `VITE_NCT_SUB_FORM_URL` is configured
- institution correction submissions still require a compatible backend or proxy, or the legacy `NCT_old` stack

## Tech Stack

| Category | Choice |
| --- | --- |
| Frontend | Vite 8 + React 19 |
| Map rendering | Leaflet |
| Content build | Node.js scripts that emit static JSON snapshots |
| Content sources | `blog/*.md`, `data.json`, `friends.json`, and public map JSON |
| Deployment target | Static hosting |

## Repository Layout

```text
.
├── frontend/src/              # React entry, router, and page logic
├── public/content/            # Build-time generated static snapshots
├── blog/                      # Markdown article sources
├── config/                    # i18n, area options, runtime config
├── scripts/                   # Content generation and config helpers
├── tests/                     # Frontend and build-script tests
├── vite.config.js             # Vite config
└── index.html                 # SPA host page
```

## Environment Variables

Create a local env file:

```bash
cp .env.example .env
```

[`./.env.example`](./.env.example) now lists all project-level environment
variables in order of how likely they need changes, plus runtime flags that are usually injected by the platform.

### Required Variables

This frontend has no universally required environment variable; a static-only
deployment can start with zero config.

Treat these as required when you enable the related features:

- `VITE_NCT_API_SQL_PUBLIC_DATA_URL` when you want live public data from `nct-api-sql` instead of the checked-in snapshot
- `VITE_NCT_SUB_FORM_URL` when you want the `/form` entry route and runtime translation features

Key variables:

| Variable | Purpose |
| --- | --- |
| `VITE_NCT_API_SQL_PUBLIC_DATA_URL` | public map dataset URL; defaults to `/content/map-data.json` |
| `VITE_NCT_SUB_FORM_URL` | standalone form URL from `nct-api-sql-sub`, for example `https://sub.example.com/form` |

Additional notes:

- `VITE_*` variables are exposed to the browser runtime
- whether `VITE_NCT_SUB_FORM_URL` is configured determines the frontend deployment mode: set means `hono`, blank means `api-only`
- build-time map data always uses the checked-in `public/content/map-data.json`; remote snapshot refresh env vars are no longer supported
- `RUNTIME_TARGET` / `CF_PAGES` are usually platform-injected flags, so local development rarely needs to set them manually
- [`.dev.vars.example`](./.dev.vars.example) is now just a reminder that the root project no longer deploys its own Worker backend

## Quick Start

```bash
cd No-Torsion
npm install
cp .env.example .env
npm run dev
```

Default local address:

- Vite dev server: `http://127.0.0.1:5173`

For a full end-to-end local setup, you usually also want:

- `../nct-api-sql` for the public dataset
- `../nct-api-sql-sub` for the standalone form page and runtime translation API

## Common Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | start the Vite dev server |
| `npm run frontend:prepare-content` | generate `public/content/*` snapshots |
| `npm run frontend:build` | generate snapshots and build the frontend |
| `npm run frontend:preview` | preview the production build locally |
| `npm run test:unit` | run Node-based unit tests |
| `npm test` | run tests and a build check |

Notes:

- `npm run dev:workers` and `npm run deploy:workers` now only print migration guidance and no longer start or deploy a backend

## Build-Time Static Content

`npm run frontend:prepare-content` generates:

- `public/content/site-bootstrap.json`
- `public/content/area-selector.json`
- `public/content/blog/index.json`
- `public/content/blog/articles/*.json`
- `public/content/map-data.json` when a remote snapshot source is configured, or when an existing checked-in snapshot is reused

This is what lets the frontend render:

- public map data
- language messages
- blog listings and article bodies

without shipping its own backend.

## Deployment

This project is intended for static hosting such as Cloudflare Pages, Netlify, Vercel static output, or an Nginx static directory.

Build command:

```bash
npm run frontend:build
```

Publish directory:

```text
dist/
```

The repo already includes:

- [`public/_redirects`](./public/_redirects) for SPA route fallback to `index.html`
- [`404.html`](./404.html) as a static-hosting fallback page

## README Audit Result

After checking the code and scripts, the README was updated to match the current frontend-only role of `No-Torsion`. Older descriptions of `Express`, `EJS`, `Workers`, and D1-backed routes no longer describe the root project accurately.
