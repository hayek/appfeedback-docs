---
title: Wire format
description: The exact GitHub issue shape every AppFeedback SDK produces and the inbox parses.
---

Every platform emits the **same** issue — a title, a body, and labels. This is the contract between the SDKs (writers) and the AppFeedback inbox (reader), pinned by a [shared spec + golden-fixture conformance suite](https://github.com/hayek/appfeedback-spec) that runs in each SDK's CI.

## Labels

`[<type>, "user-submitted"]`, where `<type>` is `bug` or `feature-request`.

## Body

Sections joined by a blank line; device-block lines by single newlines:

```
<description>

---
**Device Information:**
App: <appName>
App Version: <appVersion> (<buildNumber>)
Device: <model>
<osName> Version: <osVersion>

**Contact Email:**          ← only when supplied
<email>

**<key>:**                  ← one per extra field, keys in code-point order
<value>

<!-- attachments-v1 -->     ← only when there are attachments
## Attachments

<prefix>[<filename>](<url>) — <mimeType>, <size>

<!-- /attachments-v1 -->

---
👍 Votes: 0
```

## The pinned details

These are exact, because three independent implementations must agree byte-for-byte:

- **osName** — one of `OS, macOS, iOS, iPadOS, watchOS, tvOS, visionOS, Android, Windows, Linux, Web, ChromeOS`. The inbox keys its OS column off this set.
- **Attachment size** — a deterministic, locale-invariant, decimal (1000-based) format: `512 B`, `1.2 KB`, `2 MB` (half-up to one decimal, trailing `.0` dropped). Non-finite or `>100 TB` values parse back to "unknown".
- **Separator** — the attachment line uses a literal em-dash `—` (U+2014); the image prefix is `!` for `image/*`.
- **Extra-field order** — ascending Unicode code-point order of the key (not a locale sort).
- **Votes footer** — the literal `👍 Votes: 0`, byte-identical UTF-8.

## Reader tolerance

The parser is forgiving of hand-written / legacy bodies: it normalizes CRLF → LF, strips `**bold**` markers and stray whitespace/line-terminators, accepts an inline `**Contact Email:** you@example.com`, drops standalone `---` lines from the description, and infers a missing/empty attachment MIME from the URL (query strings stripped).

The canonical, versioned definition — with the executable fixtures — lives in [`appfeedback-spec`](https://github.com/hayek/appfeedback-spec).
