# AI Slop Inc.

The company website for AI Slop Inc., showing Slop.game, AnkiDuo, and Dopamask.
Static HTML, CSS, and JavaScript; no build step or package dependencies.

The hero presents software as a creative medium, using the existing Andy Warhol
portrait made from the word “slop.” `hero-art.js` holds the sharp source image,
then scatters and reforms sampled ink particles between black and red. It pauses
offscreen, when hidden, and for reduced-motion/data-saving preferences. The
transparent source image is the fallback if canvas or image sampling fails.
No new bitmap artwork or app interface was generated for this revision.

All three products share one horizontal showcase with equal typography, spacing,
and native 9:16 video stages. Desktop shows all three together. Mobile uses a
native swipe rail and automatically advances after the active clip completes;
manual interaction stops automatic movement. Hover, keyboard focus, reduced
motion, data saving, and visibility are respected. Arrow keys and Home/End let
keyboard users move through the rail. There are no media selectors or status
badges. The previous pricing and manifesto sections have been removed.

Each video buffers once within 400 px of the viewport and plays when at least 15%
is visible. It continues until less than 2% remains visible, preserving playback
position. Background tabs and reduced-motion/data-saving preferences pause it.
All source videos and their timing remain unchanged. Dopamask uses the owner's
October 29 TypingFilm at native 24 fps; mobile is 720 × 1280 and desktop 1080 × 1920.
AnkiDuo and Slop.game retain their 1080p60 web exports. No video is cropped or put
inside a decorative phone frame. Product media references are documented in
[ASSET-SOURCES.md](ASSET-SOURCES.md).

Dopamask filters short-form feeds inside its own browser. AnkiDuo's Android
launcher and app-blocking demonstration are based on AnkiDroid. Recognition
remains an Honorable Mention with $2,500 in OpenAI API credits. No adoption metrics,
new public download destinations, or endorsement claims are added.

## Preview

Run a static server from this directory, for example:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

## Deployment

GitHub Pages publishes the tracked files from `main` at https://aislopinc.com/.
Stage only the website files intended for release; local review folders and
unrelated untracked work are not publication inputs.
