# Design: Align alumni site visual identity with masonohioschools.com

## Goal

Make the Comet Alumni Network site (`alumni/`) look like a genuine subdomain/section of masonohioschools.com — same font, color system, button/heading treatment, hero style, and wave-divider motif — not just "inspired by" it.

## Reference material

- Live site: https://www.masonohioschools.com
- Local mirror (already in repo, appears to be a prior scrape for this exact purpose): `test/` — includes the real Finalsite `default_22` theme CSS (`test/uploaded/themes/default_22/main.css@1757953888.css`), theme image assets (wave SVGs/PNGs, logo), and mirrored HTML pages (`test/index.html`, `test/aboutmhs.html`, etc.)
- New photos in `images/` — 16 HEIC event photos + 3 MOV videos from an actual alumni/college-connection event (name badges, university signage, group photo with college-logo slideshow). Confirmed via `magick`/`ffmpeg` (already installed locally) that HEIC→JPG conversion works.

## 1. Foundation: colors, type, buttons

**Colors** — extend `alumni/styles.css` `:root`, keeping existing `--mason-blue` (#2a3d4d), `--mason-blue-light` (#415566), `--mason-green` (#4cbb17) as-is (they already match the real site exactly). Add:
- `--mason-green-link: #008a00` — real site's actual link color, distinct from the `#4cbb17` accent/button green
- `--mason-cyan: #1fb7e5` — secondary button/accent blue seen on one real-site button variant
- `--hero-overlay: #223440` — dark navy for photo-hero gradient overlays

**Font** — replace the `Outfit` Google Fonts import with `Hind` (weights 300/400/500/600/700), update all `font-family: 'Outfit', sans-serif` declarations to `'Hind', sans-serif`. Adjust type scale to match the real site's actual CSS values:
- h1: `3rem` / line-height `3.625rem`, weight 700, color `--mason-blue`
- h2: `2rem` / line-height `2.1875rem`, weight 700
- h3: `1.75rem` / line-height `1.9375rem`, weight 700
- body: `17px` / line-height `27px`, color `--mason-blue-light`

**Buttons** — add a new `.btn-outline` variant matching the real site's exact technique: `background: transparent`, border simulated via `box-shadow: inset 0 0 0 3px <color>` (not a real `border`), text color matches the shadow color, and on `:hover`/`:focus` it flips to solid `background: <color>; color: white`. Support both a blue (`--mason-blue`) and green (`--mason-green`) variant, matching the real site's two pill-button colors. Existing `.btn-primary`/`.btn-secondary` (filled pills) stay unchanged — `.btn-outline` is additive, used specifically for hero CTAs.

**Section headings** — tighten the existing `.section-title` (already has a `border-bottom: 3px solid var(--mason-green)` — same idea as the real site's h1 underline bar) to match their exact treatment: bump to `7px` thick, add `display: inline-block` so the bar spans only the heading text's width instead of the full container width.

## 2. Structure: hero, waves, photos

**Photo prep**: convert the two chosen HEIC photos to optimized web JPGs (via `magick`, already confirmed working) at a hero-appropriate resolution (long edge ~1920px, quality ~80), save into `alumni/assets/`.

**Homepage hero** (`index.html`): replace the current solid-gradient `.hero` background with a full-bleed photo (`IMG_6436` — the big group photo with the college-logos slideshow behind them), using the real site's exact overlay technique: a `::before` pseudo-element with `linear-gradient(180deg, rgba(43,43,43,0), var(--hero-overlay))` for legibility, `background-size: cover`, `background-position: center`. Existing white bold headline/paragraph stay; the Donate CTA button switches to the new `.btn-outline` (white/outline on the photo, flips solid on hover). The Mason City Schools logo currently above the heading stays as-is (it already reads correctly against a photo background per the site's own pattern of overlaying logo+text on photo heroes).

**College-level hero** (`college-level.html`): same photo-hero treatment, using `IMG_4874` (the name-badge/library photo) — thematically on point since these photos are literally from a college-connection event.

**Career-level hero** (`career-level.html`): no career-specific photo in this batch, so it keeps the current solid gradient background — stays visually consistent via the shared font/color/wave/heading treatment, so it won't look out of place next to the two photo heroes.

**Wave dividers**: add one clean wave-shaped divider between the hero and the content section on all three pages, using `test/uploaded/themes/default_22/images/wave3.svg` copied into `alumni/assets/` (SVG over the PNG alternatives so it scales cleanly across breakpoints without pixelating). This is a simplified version of the real site's homepage wave (which uses ~10 responsive breakpoint overrides for a slideshow-specific wave) — one wave, one reasonable set of responsive rules, not a pixel-for-pixel port of their slideshow-specific CSS. The footer wave (`mason-greenblueswirl.png`) already uses functionally the same technique as the real site's footer wave — no change needed there.

**Icon rail**: new sticky vertical rail fixed to the right edge of the viewport, hidden below 768px (matches the site's existing mobile breakpoint pattern — the mobile nav already covers navigation, so the rail is a supplementary strip that can drop away on small screens), circular icon buttons in Mason colors, linking to functionality that already exists on the site:
- Donate → same link as the existing Donate button (`masonschoolsfoundation.org/donate`), tracked the same way (reuses `donate-tracking.js`'s existing click handler if the ID/selector allows, or a small addition to it)
- Facebook → `facebook.com/Alumni45040`
- LinkedIn → `linkedin.com/school/william-mason-high-school`
- Share → opens the existing share popup (reuses `share.js`'s existing open logic)

No "Search" icon — there's no content on this 3-page site worth searching, so a search icon would be pure scaffolding with nothing behind it (YAGNI).

## Explicitly out of scope

- **Gallery section/page** for the remaining ~13 unused photos — only the two hero photos get used per the chosen direction; the rest stay in `images/` unused for now. Easy to revisit later.
- **Video** (`images/*.MOV`) — the real site uses a hero video slideshow, but that adds real encoding/autoplay-policy/mobile-fallback complexity that wasn't asked for. Not used in this pass.
- **Sidebar/breadcrumb interior-page navigation** — no strong pattern found in the reference CSS, and our 3 pages are flat, not deeply hierarchical, so this wouldn't add value here.
- **Literal Finalsite CMS platform chrome** — the real site's vertical icon rail is generic Finalsite-vendor UI (confirmed not present in the Mason-specific theme CSS, likely a shared CDN bundle across all Finalsite client sites), not distinctive Mason branding. We're replicating its *visual style* (sticky circular icon rail) with our *own* real functionality behind it, not the vendor chrome itself.

## Files touched

- `alumni/styles.css` — color variables, font import/family, type scale, new `.btn-outline`, `.section-title` tightening, hero photo/overlay/wave CSS, icon rail CSS
- `alumni/index.html`, `alumni/college-level.html`, `alumni/career-level.html` — hero markup changes (photo heroes where applicable), wave divider markup, icon rail markup
- `alumni/assets/` — two new converted hero JPGs, one wave asset copied from `test/uploaded/themes/default_22/images/`
- Possibly a small addition to `donate-tracking.js`/`share.js` if the icon rail's Donate/Share icons need to hook into existing click handlers by ID rather than duplicating logic

## Implementation notes

- `IMG_6436` is landscape (4032x3024) — a natural fit for a wide hero with `background-position: center`. `IMG_4874` is portrait (3024x4032) and will need a deliberate `background-position` (e.g. weighted toward the subjects' faces, likely upper-center given it's a standing group shot) — verify visually against the actual hero container dimensions once converted, adjusting position/crop as needed before treating it as final.
- Icon rail is desktop-only (hidden below 768px), consistent with the breakpoint already used elsewhere in `alumni/styles.css`.
