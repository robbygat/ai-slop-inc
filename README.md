# AI Slop Inc.

The official website for AI Slop Inc., showcasing Dopamask, AnkiDuo, and [Slop.game](https://slop.game).
Static HTML, CSS, and JavaScript; no build step or package dependencies.

The editorial hierarchy keeps the approved "Slop has its place" hero, followed by
a visual index of all three apps and their product showcases. The company's
new-app model follows the product evidence: $1 once, no subscriptions or memberships. This is a
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
The font is served locally. The three muted product films buffer once within 400px of the
viewport, start independently when at least 15% visible, and keep playing until
less than 2% remains visible. They pause in a hidden tab or when reduced-motion/data-saving
preferences apply; those preferences also prevent new warm loads. AnkiDuo's section focuses on the product, without release-status
labels or placeholder links. Its GitHub URL has not yet been supplied.

Each product has one switchable media presentation, without a second floating
phone screenshot or decorative device frame. Dopamask offers Home and Focused
Browser and The film; AnkiDuo offers Study, Launcher, and Unlock; Slop.game offers
In the app and Gameplay. All stills are real app captures, not reconstructed UI.
Dopamask's October 28 screenshots retain their full 1206 × 2622 resolution.
Tabs support arrow keys, Home/End, linked panels, and visible keyboard focus.
Each gallery preserves a stable size and shows the complete original image or
film without cropping. Switching away from a film pauses it immediately; hidden
films do not buffer. With JavaScript disabled, each product shows its first still.
Media width is bounded by the viewport height on mobile, so long phone captures
do not become arbitrarily tall. Desktop alternates the AnkiDuo composition while
mobile retains content-first reading order. The portrait hero is shorter and its
original animation and transparency are preserved.
On desktop the title and
description sit beside the film; on mobile they stack in reading order with
aligned edges and shared spacing. The AnkiDuo film's white canvas blends into
its section, without a card border or shadow.
AnkiDuo's 9:16 Tesseract film demonstrates a real Android Home launcher, app block,
card review, and successful unlock in one continuous 7.3-second take. Both films
are delivered at 1080p60; Slop preserves its original 60fps master, while AnkiDuo
uses a new variable-frame-rate capture with its action cadence checked before editing.
Dopamask uses the owner's October 29 TypingFilm, with the engraved landscapes,
protective mask, and Dopamine-to-Dopamask ending. Responsive encodes preserve its
native 24fps and 18.083-second timing; the mobile source is 720 × 1280 and desktop
is 1080 × 1920. The original Tesseract project and master remain in the app folder.
All films retain their 9:16 delivery ratio with no cropping or scroll-linked
transforms. The feed, deck-library, and Android launcher screenshots are available
alongside the films. Hero artwork and
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
