# Security Policy

## Supported versions

AppFeedback is pre-1.0 and evolving quickly. Updates to the documentation
site land on the latest `main`; there are no maintained back-release branches
yet. Always check against the current `main` before reporting.

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue.

- Email **hayek_dev@icloud.com**, or
- Open a [GitHub private security advisory](https://github.com/hayek/appfeedback-docs/security/advisories/new).

Include the affected page or commit and a clear description of impact. We aim
to acknowledge within a few days and will coordinate a fix and disclosure
timeline with you.

## Scope

This repository builds the AppFeedback documentation site (Astro + Starlight).
In scope: issues in the site's build or content that could expose users to
risk (for example, an XSS in a custom component, or guidance that recommends
an insecure integration). Vulnerabilities in the SDKs themselves belong in
their respective repositories.
