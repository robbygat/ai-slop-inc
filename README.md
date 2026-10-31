# AI Slop Inc.

The official website for AI Slop Inc., showcasing Dopamask, AnkiDuo, and [Slop.game](https://slop.game).
Static HTML, CSS, and JavaScript; no build step or package dependencies.

The editorial hierarchy keeps the approved "Slop has its place" hero, followed by
the company's new-app model: $1 once, no subscriptions or memberships. This is a
direction for new products, not a claim about current Slop.game store pricing.
Dopamask leads with focused social browsing, then AnkiDuo demonstrates learning
through the phone's home screen and app access. Slop.game remains the deliberate
playground for AI-made content. The open-source approach follows the product
evidence. Recognition is explicitly an Honorable Mention with API
credits, not funding or an endorsement. No adoption metrics or public AnkiDuo
repository/download are implied. Dopamask has no verified public store listing;
its section contains no invented download link. Its selective web filters work
inside Dopamask, not inside other iOS apps, and are not an AI-post detector.

Production images and source provenance are documented in [ASSET-SOURCES.md](ASSET-SOURCES.md).
The font is served locally. Both muted product films buffer once within 400px of the
viewport, start independently when at least 15% visible, and keep playing until
less than 2% remains visible. They pause in a hidden tab or when reduced-motion/data-saving
preferences apply; those preferences also prevent new warm loads. AnkiDuo's section focuses on the product, without release-status
labels or placeholder links. Its GitHub URL has not yet been supplied.

Each product has one media presentation: Dopamask's real October 28 home-screen
capture, or a complete product film, without a second floating phone screenshot
or decorative device frame. The original Dopamask screenshot is encoded as WebP
at its full 1206 × 2622 resolution, without cropping or reconstructed UI.
On desktop the title and
description sit beside the film; on mobile they stack in reading order with
aligned edges and shared spacing. The AnkiDuo film's white canvas blends into
its section, without a card border or shadow.
AnkiDuo's 9:16 Tesseract film demonstrates a real Android Home launcher, app block,
card review, and successful unlock in one continuous 7.3-second take. Both films
are delivered at 1080p60; Slop preserves its original 60fps master, while AnkiDuo
uses a new variable-frame-rate capture with its action cadence checked before editing.
Both films retain their 9:16 delivery ratio with no cropping or scroll-linked
transforms. The prior feed and deck-library screenshots remain in the repository
but are no longer displayed. Hero artwork and
type entrances respect reduced-motion preferences and
stop updating offscreen. Marilyn's original dotted color variants form a single
digital portrait with sparse displaced bands and restrained color registration.
The source transparency is preserved in every canvas frame; there is no painted
rectangle behind the artwork. An overlapping editorial grid lets the portrait
and oversized type share the page rather than occupy separate panels.
Colorways change every six seconds while visible. There are no artwork controls,
pointer effects, or continuous jitter. Reduced-motion and data-saving modes keep
a static portrait. All content remains readable without JavaScript, including a
CSS artwork fallback.

## Preview

Run any static file server from this directory. For example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

The site is published from the `main` branch with GitHub Pages. Because all internal assets use
relative paths, the same build works at both the repository Pages URL and a custom domain.
