# AI Slop Inc.

The official website for AI Slop Inc., showcasing [Slop.game](https://slop.game) and AnkiDuo.
Static HTML, CSS, and JavaScript; no build step or package dependencies.

The editorial hierarchy explains the lab's two-sided thesis, then shows the products:
Slop.game gives AI-made games a playable feed; AnkiDuo puts language learning into
the phone's home-screen and app-access experience. The open-source approach follows
the product evidence. Recognition is explicitly an Honorable Mention with API
credits, not funding or an endorsement. No adoption metrics or public AnkiDuo
repository/download are implied.

Production images and source provenance are documented in [ASSET-SOURCES.md](ASSET-SOURCES.md).
The font is served locally. Both muted product films buffer once within 400px of the
viewport, start independently when at least 15% visible, and keep playing until
less than 2% remains visible. They pause in a hidden tab or when reduced-motion/data-saving
preferences apply; those preferences also prevent new warm loads. AnkiDuo's section focuses on the product, without release-status
labels or placeholder links. Its GitHub URL has not yet been supplied.

App screenshots use source-specific aspect ratios inside shared device frames. Slop's
gameplay film and complete feed phone share a staggered, unboxed composition with
no overlap over the footage. On mobile, the film takes the full content width and
the smaller feed phone follows below.
AnkiDuo's 9:16 Tesseract film demonstrates a real Android Home launcher, app block,
card review, and successful unlock in one continuous 7.3-second take. Both films
are delivered at 1080p60; Slop preserves its original 60fps master, while AnkiDuo
uses a new variable-frame-rate capture with its action cadence checked before editing.
The film is displayed on its own plane rather
than squeezed into a 3:7 phone frame. One complementary deck-library screenshot
retains its full 3:7 ratio. On mobile, the complete film comes first and the library
phone follows beneath it; there is no hidden carousel or overlapping video UI. Hero artwork,
type entrances, and scroll-linked product motion respect reduced-motion preferences and
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
