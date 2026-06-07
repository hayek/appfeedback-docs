# Contributing to AppFeedback (documentation)

Thanks for helping improve AppFeedback! This repository is the documentation
site, built with Astro + Starlight and published to
<https://hayek.github.io/appfeedback-docs/>. Typo fixes, clearer guides, and
new examples are all welcome.

## Prerequisites

- Node.js (LTS) with Corepack
- pnpm (managed via Corepack — no global install needed)

## Develop

```sh
pnpm install
pnpm dev
```

`pnpm dev` starts the Astro dev server with live reload. Most content lives
under `src/content/docs/` as Markdown/MDX.

## Build

Before opening a PR, make sure the production build succeeds:

```sh
pnpm build
```

## Conventions

- Keep the voice consistent with the existing guides: concise, task-focused.
- Make sure code samples and commands actually run against the current SDKs —
  the docs are the contract users follow first.
- Check internal and external links before submitting.

## Questions

For security issues, follow [SECURITY.md](SECURITY.md) — do not open a public
issue.
