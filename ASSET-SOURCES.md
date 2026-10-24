# Website asset sources

Production selection for the October 24, 2026 redesign. Paths below are repository-relative. This inventory covers the assets used by `index.html` and `styles.css`, plus their retained source and license files.

## New and refreshed assets

| Website file                                | Source and use                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/slop-current/slop-film-web.mp4`     | Web delivery export of `slop_game_minimal_film.mp4`, from the October 22, 2026 Minimal Film production. Shows Lagoon, Whiteout, Proximity, and Skyline gameplay.                                                                                                                                                                                                                  |
| `assets/slop-current/slop-film-poster.webp` | Still from the same October 22 Minimal Film, used before video playback.                                                                                                                                                                                                                                                                                                          |
| `assets/slop-current/newest-lagoon.webp`    | October 24 capture of installed Slop.game build 2082, showing the current Newest feed. Exported from `newest-lagoon.png` at 828 × 1800.                                                                                                                                                                                                                                           |
| `assets/anki-duo-current/home-clean.webp`   | October 24 app capture `final-cover-day-1.png`, showing the Anki Duo home screen, Kado, and deck bookshelf. Resized from the clean 1080 × 2520 original to 720 × 1680 without cropping. Replaces the earlier capture with stray pixels below its gesture bar.                                                                                                                     |
| `assets/anki-duo-current/study-path.webp`   | October 24 app capture `r7-today.png`, showing the Anki Duo daily study path in dark mode. Exported at 720 × 1680.                                                                                                                                                                                                                                                                |
| `assets/brand/open-network-lab.png`         | Faithful transparent 2307 × 478 export of the [official Open Network Lab SVG](https://onlab.jp/wp-content/themes/onlab_2018/images/logo_onlab.svg), selected from the existing award announcement source kit. Preserves the branching symbol; ImageMagick's incompatible clipping render was discarded. The downloaded vector is retained as `assets/brand/open-network-lab.svg`. |
| `assets/brand/openai-wordmark.png`          | Transparent 1604 × 718 wordmark from the [official OpenAI brand kit](https://cdn.openai.com/brand/OpenAI-Logos-2025.zip), with the original proportions and clear space.                                                                                                                                                                                                          |
| `assets/site-share.png`                     | Social preview rendered from the editable `assets/site-share.svg`, using this website's typography, palette, and retained portrait artwork.                                                                                                                                                                                                                                       |
| `assets/fonts/Gabarito-Variable.ttf`        | Locally served Gabarito variable font. Copyright 2023 The Gabarito Project Authors; licensed under the SIL Open Font License 1.1. Full license retained in `assets/fonts/Gabarito-OFL.txt`. [Font project](https://github.com/naipefoundry/gabarito).                                                                                                                             |
| `favicon.svg`                               | Original AI letterform icon created for this redesign, using the website's white and red palette.                                                                                                                                                                                                                                                                                 |

The AnkiDuo images are real app captures, not illustrative store artwork or theme boards. Development is complete per the product owner's October 24 update. A GitHub URL has not yet been provided; the website does not present the captures as evidence of a public download.

Device screens preserve their original aspect ratios: 23:50 for Slop and 3:7 for AnkiDuo. The Workshop capture is no longer displayed because its source had a status-bar overlap. No AI edits were made to app screenshots.

`assets/anki-duo-current/launcher.webp` is the October 24 13:14 actual Android launcher capture `slopui-shots/final-cover-night.png`, resized from 1080 × 2520 to 720 × 1680. It shows the replacement home screen, study widgets, and app favorites. It replaces the study-path image in the visible showcase. App-blocking wording was cross-checked against the same-day `cd13-FocusSettingsActivity.png`, which shows the block-apps option and configurable review cards to unlock an app.

## Existing artwork retained

| Website file                    | Use                                                                                                                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/slop-art-portraits.png` | Existing 1536 × 1024 dotted portrait sheet, reused for the hero's single Marilyn Monroe composition. `artwork.js` adds restrained color registration and horizontal signal distortions from the original pixels; a static CSS rendition remains the fallback. |

OpenAI and Open Network Lab marks identify the organizations associated with the stated award recognition; they are not presented as an endorsement of AI Slop Inc. or its products.

## Product wording

The October 24 copy pass describes source-backed behavior, not newly measured
traction or performance. Slop's mobile source implements AI-prompt game creation,
a vertical playable feed, reviewed publishing, and native sharing. AnkiDuo's
AnkiDroid-based Android source implements an optional Home launcher and opt-in
app blocking with a review-card unlock. “Operating-system level” refers to this
home-screen and app-access experience, not a modified OS or kernel. The company's
ad-free, open-source direction is stated as a goal; no public repository or
blanket claim about every product's current licensing is implied.
