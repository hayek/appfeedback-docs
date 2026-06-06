#!/usr/bin/env bash
#
# Regenerate the per-language API references that ship under
# public/reference/{swift,kotlin,typescript}/ and are served at
# https://hayek.github.io/appfeedback-docs/reference/<lang>/.
#
# The generated HTML is committed into this repo (rather than built in CI)
# because each generator needs a different heavyweight toolchain — Swift/DocC,
# JDK+Dokka, Node+TypeDoc — and provisioning all three in the Pages workflow is
# far more fragile than committing the output. Re-run this locally when a
# public API changes, then commit the diff.
#
# Assumes the four repos are siblings:
#   ../AppFeedbackSDK      ../appfeedback-android      ../appfeedback-web
#
# Requirements (see each SDK repo for the pinned toolchain):
#   - Swift:  Xcode toolchain with `swift` on PATH (swift-docc-plugin resolves itself)
#   - Kotlin: JDK 21 + the repo's Gradle wrapper (Dokka 2.0.0)
#   - Web:    Node + pnpm (via corepack); TypeDoc is a workspace devDependency
set -euo pipefail

DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="$(cd "$DOCS_DIR/.." && pwd)"
SWIFT_DIR="$ROOT/AppFeedbackSDK"
ANDROID_DIR="$ROOT/appfeedback-android"
WEB_DIR="$ROOT/appfeedback-web"
OUT="$DOCS_DIR/public/reference"

JDK21="${JAVA_HOME_21:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"

echo "==> Swift (DocC, combined AppFeedbackCore + AppFeedbackUI)"
rm -rf "$OUT/swift"; mkdir -p "$OUT/swift"
( cd "$SWIFT_DIR" && swift package --allow-writing-to-directory "$OUT/swift" \
    generate-documentation \
    --enable-experimental-combined-documentation \
    --target AppFeedbackCore --target AppFeedbackUI \
    --transform-for-static-hosting \
    --hosting-base-path appfeedback-docs/reference/swift \
    --output-path "$OUT/swift" )
# GitHub Pages serves only the site-root 404, so DocC's per-route index.html
# files (it writes a real one at every route) are what make deep links resolve.
# Keep DocC's own 404.html too as belt-and-suspenders.
cp "$OUT/swift/index.html" "$OUT/swift/404.html"

echo "==> Kotlin (Dokka, com.appfeedback.core)"
rm -rf "$OUT/kotlin"; mkdir -p "$OUT/kotlin"
( cd "$ANDROID_DIR" && JAVA_HOME="$JDK21" ./gradlew :dokkaGeneratePublicationHtml --no-daemon )
cp -R "$ANDROID_DIR/build/dokka/html/." "$OUT/kotlin/"

echo "==> TypeScript (TypeDoc, all 4 @appfeedback/* packages)"
rm -rf "$OUT/typescript"; mkdir -p "$OUT/typescript"
( cd "$WEB_DIR" && corepack enable >/dev/null 2>&1 || true; pnpm install --frozen-lockfile; \
  pnpm exec typedoc --out "$OUT/typescript" )

echo "==> Done. Review the diff under public/reference/ and commit."
