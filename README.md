# VANTA Cover Studio

VANTA turns local photos and captions into original multi-panel, neon-noir cover art. It is a zero-dependency Canvas app made for the make.fun `gta6-cover-art-01` competition.

## Open it

Open `app/index.html` directly in desktop Chrome. No server or build is required and it works from `file://`.

## Create a cover

Drop or pick up to three JPG, PNG, or WebP photos. Choose the classic three-panel composition, a split two-panel design, or full bleed. Click a panel, then drag on the canvas to reframe, use the mouse wheel or zoom controls to scale, and use the arrow keys for precise nudges. The reset control beside each panel restores its framing.

Edit the upper line, main title, and credit under Type. Grade offers Vice sunset, Neon night, Hot pink, and Teal & orange directions, plus restrained bloom and deterministic grain. Select portrait, square, or landscape and choose Export PNG for a full-resolution 1080×1350, 1080×1080, or 1200×630 download.

Everything, including image decoding, composition, color grading, lettering, grain, and PNG export, is drawn locally in the browser. Photos never leave the device. The built-in opening scene is original procedural Canvas art; there are no logos, game assets, font files, third-party libraries, or network requests.

## Competition handoff

Run `MAKEFUN_OUTPUT_DIR=out node main.ts` with Node.js 22.18 or newer to produce the deterministic make.fun handoff.
