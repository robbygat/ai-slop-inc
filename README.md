# AI Slop Inc.

The official website for AI Slop Inc., showcasing [Slop.game](https://slop.game) and AnkiDuo.
Static HTML, CSS, and JavaScript; no build step or package dependencies.

Production images and source provenance are documented in [ASSET-SOURCES.md](ASSET-SOURCES.md).
The font is served locally. The muted gameplay film loads when visible and respects reduced-motion
and data-saving preferences. AnkiDuo is marked development complete per the product owner's
October 24 update; its GitHub link is pending and no download availability is implied.

App screenshots use source-specific aspect ratios inside shared device frames. On mobile,
AnkiDuo's previews form a native, keyboard-accessible horizontal gallery. Hero artwork,
type entrances, and scroll-linked product motion respect reduced-motion preferences and
stop updating offscreen. Marilyn's original dotted color variants cycle automatically
every 3.8 seconds while visible, with no manual controls. All content remains readable
without JavaScript.

## Preview

Run any static file server from this directory. For example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

The site is published from the `main` branch with GitHub Pages. Because all internal assets use
relative paths, the same build works at both the repository Pages URL and a custom domain.
