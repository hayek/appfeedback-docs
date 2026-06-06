---
title: Security model
description: Why the web SDK uses a relay, and when the direct-token escape hatch is safe.
---

AppFeedback writes to GitHub, so the question is always: **where does the writable token live?** The answer differs by platform.

## Native apps (Apple, Android)

A signed native binary is a black box. A GitHub token shipped inside it — held in the Keychain / secure storage and supplied by you — isn't trivially extractable by an ordinary user, so `GitHubDirectTransport` POSTing to the GitHub API directly is an acceptable trade-off (it's how the original SDK shipped). For higher volume or tighter blast-radius, point a custom transport at a relay instead.

## The web is different

Everything a web page runs is readable by anyone — view-source, devtools, the JS bundle. **A writable token in browser JS is published to the world.** GitHub's CORS would even *accept* a direct browser call, which makes it more dangerous, not less: any visitor (or bot) could open issues, write files, and exhaust your shared rate limit (one credential = 5,000 req/hr and 500 issues/hr across *all* visitors). GitHub auto-revokes tokens pushed to a public repo — but **not** ones merely embedded in a deployed site, so a leak stays live.

So on the web the default — and only production-safe — path is the [relay](../relay/): the browser talks to a function **you** host, and your GitHub credential never leaves the server. This mirrors how every comparable SDK works (Sentry's DSN, Bugsnag/Instabug keys): the client only ever carries a public, write-only identifier.

## The escape hatch: `dangerouslyUseClientToken`

For internal tools, prototypes, or a site behind authentication where you control who loads the page, the web SDK offers a direct-to-GitHub transport — gated behind an explicit flag so it can't be used by accident:

```ts
import { DirectGitHubTransport } from '@appfeedback/core'

const transport = new DirectGitHubTransport({
  owner: 'acme', repo: 'throwaway-feedback', token,
  dangerouslyUseClientToken: true, // required — it WILL ship the token to the browser
})
```

Constructing it without the flag throws. If you use it: scope the token to a single throwaway repo (`issues` + `contents` only), and never deploy it on a public site.

## Abuse control

A public feedback form attracts bots. The relay is where you add a CAPTCHA (Cloudflare Turnstile / hCaptcha — pass the token through `verifyCaptcha`), per-IP rate limiting, and dedupe, *before* anything reaches GitHub.
