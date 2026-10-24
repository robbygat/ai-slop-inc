# AI Slop Inc.

The official website for AI Slop Inc., showcasing [Slop.game](https://slop.game) and AnkiDuo.
Static HTML, CSS, and JavaScript; no build step or package dependencies.

Production images and source provenance are documented in [ASSET-SOURCES.md](ASSET-SOURCES.md).
The font is served locally. The muted gameplay film loads when visible and respects reduced-motion
and data-saving preferences. AnkiDuo's section focuses on the product, without release-status
labels or placeholder links. Its GitHub URL has not yet been supplied.

App screenshots use source-specific aspect ratios inside shared device frames. On mobile,
AnkiDuo's previews form a native, keyboard-accessible horizontal gallery. Hero artwork,
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
