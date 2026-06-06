---
title: Theming & localization
description: Restyle the feedback UI and pass your own localized copy.
---

The SDKs don't ship a strings table — you pass pre-localized copy from your own bundle, and theming is a small set of tokens.

## Web widget

`mountFeedbackWidget` (and `<FeedbackForm>`) accept `theme` and `copy`:

```ts
mountFeedbackWidget(el, {
  transport,
  appName: 'Acme',
  appVersion: '1.0.0',
  theme: { accent: '#e6a019' },          // drives the active type + submit button
  copy: {                                 // any subset; the rest fall back to English
    bug: 'Problème',
    feature: 'Suggestion',
    title: 'Résumé',
    description: 'Que s’est-il passé ?',
    submit: 'Envoyer',
    success: 'Merci pour votre retour !',
  },
})
```

The widget is plain DOM under a `.afb-widget` root with stable class names (`.afb-title`, `.afb-submit`, `.afb-status`, …) and a `--afb-accent` custom property, so you can also restyle it entirely from your own CSS.

## Apple sheet

`FeedbackSheet` takes a `FeedbackTheme` with accent colors and a `Copy` struct of plain `String`s — feed it `String(localized:)` values from your bundle:

```swift
let theme = FeedbackTheme(
  bugAccent: Color("BugAccent"),
  featureAccent: Color("FeatureAccent"),
  copy: FeedbackTheme.Copy(
    headerTitle: String(localized: "feedback_header"),
    bugSubtitle: String(localized: "feedback_bug_subtitle")
    // …
  )
)
FeedbackSheet(client: feedback, theme: theme)
```

## Localization, briefly

Because all user-facing strings are injected, the SDK stays locale-agnostic and your app remains the single source of translations. The on-wire issue body is **not** localized — its field labels (`App:`, `Device:`, …) are part of the [wire format](../../reference/wire-format/) the inbox parses, so they're fixed regardless of UI language.
