# Website asset sources

Production assets for the November 2, 2026 company-site update. The previous pricing section and pricing metadata/social preview are removed.

## Hero artwork

`assets/hero-slop-portrait.png` is the existing 1272 × 1431 transparent portrait of
Andy Warhol constructed from repeated “slop” words. It was already tracked in
this repository, introduced in commit `8d7a432` on September 7, 2026. No external
source/license provenance was established by this local repository review.

`hero-art.js` reuses that source alpha for a transparent black/red ink animation.
The crisp portrait holds 4.8 seconds, then a 1.2 second transition disperses and
reforms up to 1,200 sampled particles. Reduced-motion/data-saving modes use the
static portrait. Offscreen and hidden states stop animation work. No new bitmap
artwork, generated app screen, or animation footage was created.

The older Marilyn sheet, Warhol color sheet, photographic cutout and previous
animation scripts remain source assets; the page does not load them.

## Product videos

Every product uses an equal native 9:16 stage in the shared horizontal rail. No
video is cropped, retimed, reconstructed, or nested in a decorative phone frame.
Original source files and editable projects remain in their existing folders.

| Website asset | Source and delivery |
| --- | --- |
| `assets/slop-current/slop-film-web.mp4` |1080×1920,60fps web export of the October 22 Minimal Film master. Native Tesseract source `review/Slop-Film-Retry-20261024/Slop-Film-Retry.tsrct` uses source 0.15–14.8s at 1×. Shows Lagoon, Whiteout, Proximity and Skyline gameplay. |
| `assets/slop-current/slop-film-poster.webp` | Poster from the same source. |
| `assets/anki-duo-current/ankiduo-film-web.mp4` |1080×1920,60fps delivery of the October 24 real Android capture. The continuous 7.3 second take shows Home → blocked Chrome → card flip → Know → unlock → Chrome → Home at 1×. Editable project: `review/AnkiDuo-Film-Retry-20261024/AnkiDuo-Film-Retry.tsrct`. |
| `assets/anki-duo-current/ankiduo-film-poster.webp` | Poster from the same source. |
| `assets/dopamask/dopamask-film-web.mp4` |1080×1920, native 24 fps,434frames,18.083seconds. Web encode of the owner's October 29 `/Users/rob/Documents/ChatGPT/japanese/touch_grass/MarketingFilm/TypingFilm/Dopamask-Typing.mp4`. |
| `assets/dopamask/dopamask-film-mobile.mp4` |720×1280 mobile encode of the same unchanged edit and audio, retaining 24fps and 434 frames. |
| `assets/dopamask/dopamask-film-poster.webp` | Source frame at 2 seconds. |

The Dopamask source SHA-256 is
`a1a3cd0e583c3a77ca8cc21c8d2c84812e4fad86a7c559ed9bcddc030c4dfff4`.
Its editable project is `Dopamask-Typing.tsrct` in the same app folder. This is
stylized marketing artwork containing the real app capture; it is not represented
as an unedited physical-camera recording. The website plays all videos muted.

AnkiDuo's temporary Android emulator used the Home role and accessibility service
with the owner's approval. Its source demonstration is Android, not specifically
Samsung. Dopamask's filtering works inside its own browser; it does not alter
other native apps or detect every AI-created post. No new public download links
are invented for these products.

## Identity and recognition

| Website asset | Source |
| --- | --- |
| `assets/brand/open-network-lab.png` | Transparent 2307 × 478 export of the official Open Network Lab SVG from the existing award announcement source kit. Original retained as `assets/brand/open-network-lab.svg`. Source: https://onlab.jp/wp-content/themes/onlab_2018/images/logo_onlab.svg |
| `assets/brand/openai-wordmark.png` | Transparent 1604 × 718 wordmark from the official OpenAI brand kit. Source: https://cdn.openai.com/brand/OpenAI-Logos-2025.zip |
| `assets/fonts/Gabarito-Variable.ttf` | Gabarito variable font, copyright 2023 The Gabarito Project Authors, SIL Open Font License 1.1. License retained as `assets/fonts/Gabarito-OFL.txt`. Source: https://github.com/naipefoundry/gabarito |
| `assets/site-share.svg`, `assets/site-share.png` | Updated editable social preview with the new headline, existing Warhol word portrait, and equal product names. No pricing text. |
| `favicon.svg` | Existing red/white AI letterform icon. The company name is rendered as normal words: AI Slop Inc. |

The organization marks identify the stated Honorable Mention with $2,500 in OpenAI
API credits. They are not presented as endorsements or cash funding.
