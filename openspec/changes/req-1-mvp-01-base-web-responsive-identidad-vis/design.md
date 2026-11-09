# Design

## Context

The repository is greenfield and contains approved SVG/WAV assets but no implemented game. This design realizes the web foundation described by `proposal.md` and `specs/web-base-responsive-pwa/spec.md` within the approved HTML/CSS/JavaScript, static-hosting and progressive-PWA direction.

## Goals / Non-Goals

**Goals:**

- Establish one small responsive shell for the four approved base views, with shared navigation and a consistent visual vocabulary.
- Make layout constraints, touch targets, typography fallback and accessible locked states deterministic across mobile, tablet and desktop.
- Package the approved star-derived icon and minimum manifest metadata without assuming offline caching, push notifications or identical install behavior across browsers.
- Keep the base ready for later issue-specific game, voice and local-progress work without duplicating those rules now.

**Non-Goals:**

- Implementing exercises, mathematical generation, round scoring, unlock persistence, complete voice narration or reward logic.
- Adding backend, accounts, synchronization, analytics, telemetry, advertising, native apps, heavy UI frameworks or advanced settings.
- Promising total offline operation or installation support in browsers that do not provide it.

## Decisions

1. **Use a static HTML/CSS/JavaScript shell.** This matches D-014 and the target architecture, keeps the artifact easy to host and test, and avoids a dependency or build layer without product value. A component framework was considered and rejected because four static view shells do not justify its weight.

2. **Use shared design tokens and responsive layout rules.** Palette values, spacing, type scale and minimum control sizing should have one source in the style layer so all four views behave consistently. Fixed desktop canvases and per-view ad hoc breakpoints were rejected because they risk overflow and inconsistent touch comfort.

3. **Use the repository SVGs directly and derive the installation icon from the approved star.** This preserves asset provenance and scalable rendering. New illustrative assets or runtime downloads were rejected; `normal.svg`, `celebrando.svg` and `estrella-premio.svg` cover the identity and installation needs of this change.

4. **Use progressive PWA metadata only.** Provide manifest linkage, suitable display/name/theme metadata and icon references, while leaving service-worker/offline guarantees out of this change. A browser-native page remains the fallback because installation support differs by platform.

5. **Represent locked levels as a presentation state, not progress logic.** The initial view exposes level 1 and marks 2–4 locked with text/icon semantics. Unlock computation and persistence remain owned by the later progress change, preventing this base from inventing a second source of truth.

6. **Keep text available independently of fonts and future voice.** The shell uses Spanish visible labels and system font fallback. Voice behavior is not implemented here, but no base control may depend on a webfont or audio service to be understandable.

## Risks / Trade-offs

- [Different browser install criteria] → Keep manifest/icon metadata valid and validate the ordinary web path; do not claim universal installability.
- [Webfont latency or blocked network] → Declare system fallback in the font stack and validate rendering with fonts unavailable.
- [Small screens or browser zoom causing overflow] → Use fluid widths, constrained containers, wrapping text and viewport checks at representative sizes; verify primary controls remain reachable.
- [Visual placeholder mistaken for implemented game] → Label only the approved static structure and leave game logic/progress/voice integration to their own changes and specs.
- [Inconsistent SVG sizing in constrained layouts] → Give assets intrinsic dimensions plus fluid bounds and accessible text/labels where they carry meaning.

## Migration Plan

No existing application code or durable data is being migrated. Later changes can replace the static placeholders behind the same four-view shell and connect their own state without changing the PWA fallback contract. Rollback consists of removing the new static shell and metadata files from the candidate; no database or external service rollback is needed.

## Open Questions

- The final static hosting provider and URL remain the documented D-023 decision and are intentionally deferred; they do not change this base contract.
