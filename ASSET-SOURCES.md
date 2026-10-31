# Website asset sources

Production selection for the October 24, 2026 redesign. Paths below are repository-relative. This inventory covers the assets used by `index.html` and `styles.css`, plus their retained source and license files.

## October 31 brand update

`assets/dopamask/home.webp` is the current real app capture from
`/Users/rob/Documents/ChatGPT/japanese/touch_grass/screenshots/40-final-home.png`
(October 28, 23:17). Encoded at quality 92 with cwebp, retaining all 1206 × 2622
pixels and the complete screen. The original remains in the app project. No AI
edits, cropping, device frame, or fabricated app content were added.

Dopamask's README, `docs/BRAND.md`, and browser policy source establish its
focused-browser positioning and intended $1 one-time model. Reels/Shorts filtering
is described as operating inside Dopamask; it is not presented as an AI-content
detector or a way to alter other native iOS apps. The source explicitly says no
public store release has occurred, so the website adds no checkout/download link.
The prominent $1 statement is scoped to the company's new-app model, not current
store pricing for every existing product. Existing Slop and AnkiDuo films remain
unchanged. The company website keeps its own Gabarito/red/white identity while
showing Dopamask's real engraved artwork and current in-app typography.

## New and refreshed assets

| Website file                                       | Source and use                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/slop-current/slop-film-web.mp4`            | 1080 × 1920, 60fps web export of the October 22 Minimal Film master. The native Tesseract edit `review/Slop-Film-Retry-20261024/Slop-Film-Retry.tsrct` uses source 0.15–14.8s at 1×, removing the static ending and preserving the original motion frames. Shows Lagoon, Whiteout, Proximity, and Skyline gameplay. |
| `assets/slop-current/slop-film-poster.webp`        | Still from the same October 22 Minimal Film, used before video playback.                                                                                                                                                                                                                                                                                                          |
| `assets/slop-current/newest-lagoon.webp`           | October 24 capture of installed Slop.game build 2082, showing the current Newest feed. Exported from `newest-lagoon.png` at 828 × 1800.                                                                                                                                                                                                                                           |
| `assets/anki-duo-current/home-clean.webp`          | October 24 app capture `final-cover-day-1.png`, showing the Anki Duo home screen, Kado, and deck bookshelf. Resized from the clean 1080 × 2520 original to 720 × 1680 without cropping. Replaces the earlier capture with stray pixels below its gesture bar.                                                                                                                     |
| `assets/anki-duo-current/ankiduo-film-web.mp4`     | 1080 × 1920, 60fps delivery of a new October 24 real Android capture. The continuous approximately 7.3-second take shows Home → Chrome blocked → card flip → swipe Know → successful unlock → Chrome → Home at 1×. Captured at 720 × 1680 in a temporary read-only emulator, with native Gabarito captions added in Tesseract. Source animation cadence was checked separately from export FPS; no frame interpolation or reconstructed UI was used. |
| `assets/anki-duo-current/ankiduo-film-poster.webp` | Poster for the same AnkiDuo product film. The film uses the site's Gabarito typography and preserves the complete captured phone UI inside its 9:16 composition. No AI-generated interface or altered app screen is used.                                                                                                                                                         |
| `assets/anki-duo-current/study-path.webp`          | October 24 app capture `r7-today.png`, showing the Anki Duo daily study path in dark mode. Exported at 720 × 1680.                                                                                                                                                                                                                                                                |
| `assets/brand/open-network-lab.png`                | Faithful transparent 2307 × 478 export of the [official Open Network Lab SVG](https://onlab.jp/wp-content/themes/onlab_2018/images/logo_onlab.svg), selected from the existing award announcement source kit. Preserves the branching symbol; ImageMagick's incompatible clipping render was discarded. The downloaded vector is retained as `assets/brand/open-network-lab.svg`. |
| `assets/brand/openai-wordmark.png`                 | Transparent 1604 × 718 wordmark from the [official OpenAI brand kit](https://cdn.openai.com/brand/OpenAI-Logos-2025.zip), with the original proportions and clear space.                                                                                                                                                                                                          |
| `assets/site-share.png`                            | Social preview rendered from the editable `assets/site-share.svg`, using this website's typography, palette, and retained portrait artwork.                                                                                                                                                                                                                                       |
| `assets/fonts/Gabarito-Variable.ttf`               | Locally served Gabarito variable font. Copyright 2023 The Gabarito Project Authors; licensed under the SIL Open Font License 1.1. Full license retained in `assets/fonts/Gabarito-OFL.txt`. [Font project](https://github.com/naipefoundry/gabarito).                                                                                                                             |
| `favicon.svg`                                      | Original AI letterform icon created for this redesign, using the website's white and red palette.                                                                                                                                                                                                                                                                                 |

The AnkiDuo images are real app captures, not illustrative store artwork or theme boards. Development is complete per the product owner's October 24 update. A GitHub URL has not yet been provided; the website does not present the captures as evidence of a public download.

The replacement AnkiDuo film's editable source is
`review/AnkiDuo-Film-Retry-20261024/AnkiDuo-Film-Retry.tsrct`.
The original recording and earlier edits are retained locally. The new capture
uses the app's actual Android permissions and review scheduler only inside a
temporary read-only emulator; that session was closed after recording. Its final
Home screen shows updated review counts, so the loop is not pixel-identical.

The feed (`newest-lagoon.webp`), library (`home-clean.webp`), and study-path stills are retained source assets, not displayed in the current product sections. Each product now has just one film, displayed at its own 9:16 delivery ratio with `object-fit: contain`; neither is nested inside a decorative phone frame. The Workshop capture is no longer displayed because its source had a status-bar overlap. No AI edits were made to app screenshots.

`assets/anki-duo-current/launcher.webp` is the retained October 24 13:14 Android launcher capture `slopui-shots/final-cover-night.png`, resized from 1080 × 2520 to 720 × 1680. The visible showcase now uses the real interaction film instead of that still. App-blocking wording was originally cross-checked against the same-day `cd13-FocusSettingsActivity.png` and is now demonstrated by the actual Home → block → review → unlock flow. The temporary emulator used the app's Home role and accessibility permission with the product owner's approval; the demonstration is Android, not a Samsung-specific capture.

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
