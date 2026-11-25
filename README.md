# AI Slop Inc.

The official company website for **AI Slop Inc.** — an applied AI gaming lab building PC titles (**Nameless City**, **Starlantis**, **Paranoi**), live playable worlds on mobile and web (**Slop.game**), and an upcoming open-source project currently in redesign.

Static HTML, CSS, and JavaScript — zero build step, zero runtime package dependencies, self-hosted fonts.

## Architecture & Visual System

- **Typography:** Self-hosted `Outfit` (variable 300–700, SIL OFL) paired with `IBM Plex Mono` for section indices and release metadata.
- **Identity:** Pure white `slop.game` vector mark and wordmark over an oceanic blue grainy liquid shader (`favicon.svg`, `logo.svg`, `assets/brand/aislop-logo-light.svg`, `assets/brand/aislop-mark.svg`).
- **Atmosphere:** Native WebGL liquid-mesh & 35mm analog film grain shader (`shader.js`) built on the 6-stop oceanic blue palette (`#001e4c`, `#305888`, `#3f81c3`, `#61a6e4`, `#98c8f0`, `#bfe0fa`) with automatic CSS fallback, `prefers-reduced-motion` support, and offscreen/background pausing.
- **Gameplay Media:** Pure, silent, HUD-free, in-engine gameplay reels optimized with `+faststart` for instant desktop and mobile playback:
  - `assets/nameless-city/nameless-city-gameplay.mp4`
  - `assets/starlantis/starlantis-gameplay.mp4`
  - `assets/paranoi/paranoi-gameplay.mp4`
  - `assets/slop-current/slop-hero-loop.mp4`

## Preview Locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`.

## Deployment

GitHub Pages publishes tracked files from `main` to `https://aislopinc.com/`.
