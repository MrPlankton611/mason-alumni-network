# Mason Brand Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Comet Alumni Network site (`alumni/`) to visually match masonohioschools.com — font, colors, button/heading treatment, wave-divider motif, photo heroes, and a repurposed icon rail — so it reads as a genuine part of that site.

**Architecture:** Static HTML/CSS/JS site with a small build-time templating layer (added by a separate, already-completed plan: `docs/superpowers/plans/2026-07-29-partial-templating.md`). Page HTML source of truth now lives in `alumni-src/pages/*.html` (with `<!-- INCLUDE:header -->`/`<!-- INCLUDE:footer -->` markers resolved by `scripts/build.js`), NOT in `alumni/*.html` directly — those three files are generated output, gitignored, and rebuilt by `node scripts/build.js` (or automatically via `npm start`'s `prestart` hook). **Any task below that edits page HTML edits the corresponding file under `alumni-src/pages/`, then runs `node scripts/build.js` before serving/verifying.** `alumni/styles.css` and the `alumni/*.js` files are NOT templated — those stay hand-edited directly in place, exactly as before. "Tests" in this plan mean small Node scripts driving headless Chromium via the `playwright` package to screenshot pages and assert on computed styles/DOM state — the same verification technique already used throughout this project's development. These verification scripts are scratch files (not part of a permanent CI suite this project doesn't have) — write them to a scratch location, run them, then they can be discarded; only the actual site source files (`alumni-src/**`, `alumni/styles.css`, `alumni/*.js`, `alumni/assets/**`) get committed — never commit directly-edited changes to the generated `alumni/*.html` files themselves.

**Tech Stack:** HTML/CSS/vanilla JS, ImageMagick (`magick` CLI) for HEIC→JPG conversion, Node + `playwright` (Chromium) for verification, `http-server` (already a devDependency) to serve the site locally.

## Global Constraints

- Never add yourself as a co-author on commits (per `CLAUDE.md`).
- Commit at each logical milestone — this plan's tasks are already sized as commit boundaries; commit at the end of each task.
- Follow existing code conventions: tabs for HTML indentation in `alumni-src/**/*.html` (matches existing files), 2-space indentation in `alumni/styles.css` and `alumni/*.js` (matches existing files).
- Never hand-edit the generated `alumni/index.html`, `alumni/college-level.html`, `alumni/career-level.html` directly — they're gitignored build output. Edit the corresponding `alumni-src/pages/*.html` and run `node scripts/build.js` to regenerate.
- No new frontend dependencies/frameworks — vanilla JS only, matching `nav.js`/`share.js`/`donate-tracking.js`/`signup-tbd.js`.
- Reuse existing CSS custom properties (`--mason-blue`, `--mason-green`, etc.) and existing inline SVG icon paths (Facebook/LinkedIn/Share) rather than introducing new icon assets where one already exists in the codebase.

---

## Task 1: Set up verification tooling and convert photo/wave assets

**Files:**
- Modify: `package.json` (add `playwright` devDependency)
- Create: `alumni/assets/hero-home.jpg` (converted from `images/IMG_6436.HEIC`)
- Create: `alumni/assets/hero-college.jpg` (converted from `images/IMG_4874.HEIC`)
- Create: `alumni/assets/wave-divider.svg` (recolored copy of `test/uploaded/themes/default_22/images/wave3.svg`)

**Interfaces:**
- Produces: `alumni/assets/hero-home.jpg`, `alumni/assets/hero-college.jpg`, `alumni/assets/wave-divider.svg` — file paths every later task's CSS/HTML references directly.

- [ ] **Step 1: Install Playwright for verification scripts**

Run:
```bash
npm install --save-dev playwright
npx playwright install chromium
```

Expected: `playwright` appears under `devDependencies` in `package.json`, and Chromium downloads without error.

- [ ] **Step 2: Convert the two hero photos from HEIC to web-ready JPG**

`magick` (ImageMagick) is already installed and confirmed able to decode HEIC in this environment. Run from the repo root:

```bash
magick "images/IMG_6436.HEIC" -auto-orient -resize 1920x1920 -quality 82 "alumni/assets/hero-home.jpg"
magick "images/IMG_4874.HEIC" -auto-orient -resize 1920x1920 -quality 82 "alumni/assets/hero-college.jpg"
```

`-auto-orient` corrects phone EXIF rotation. `-resize 1920x1920` caps the longest edge at 1920px without upscaling (source is 4032x3024 and 3024x4032 respectively, so both shrink to fit).

- [ ] **Step 3: Verify the converted photos**

Run:
```bash
magick identify -format "%f: %wx%h, %b\n" alumni/assets/hero-home.jpg alumni/assets/hero-college.jpg
```

Expected: both print valid dimensions (hero-home.jpg should be landscape, e.g. `1920x1440`; hero-college.jpg should be portrait, e.g. `1440x1920`) and a file size well under 1MB each (JPG quality 82 on these dimensions should land around 200-400KB).

- [ ] **Step 4: Create the recolored wave divider asset**

The source wave SVG has a single path filled `#EAEAEB` (light gray). Recolor it to white so it blends with our white/light-gray content sections:

```bash
sed 's/fill="#EAEAEB"/fill="#ffffff"/' "test/uploaded/themes/default_22/images/wave3.svg" > "alumni/assets/wave-divider.svg"
```

- [ ] **Step 5: Verify the wave asset**

Run:
```bash
grep -o 'fill="[^"]*"' alumni/assets/wave-divider.svg
```

Expected output: `fill="#ffffff"` (confirms the recolor applied and the file has exactly one fill declaration to change — if this prints more than one match or the original gray, stop and check the source file before continuing).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json alumni/assets/hero-home.jpg alumni/assets/hero-college.jpg alumni/assets/wave-divider.svg
git commit -m "Add Playwright verification tooling and converted hero/wave assets"
```

---

## Task 2: Foundation CSS — colors, font, buttons, section headings, wave divider

**Files:**
- Modify: `alumni/styles.css:4` (font import), `alumni/styles.css:6-23` (`:root` color variables), `alumni/styles.css:31-49` (body/heading font-family), every `font-family: 'Outfit', sans-serif` declaration (lines 143, 209, 255, 275, 322, 376, 454, 502, 573), `alumni/styles.css:299-313` (buttons — add `.btn-outline`), `alumni/styles.css:321-329` (`.section-title`), `alumni/styles.css:228-237` (`.hero` — add wave pseudo-element)

**Interfaces:**
- Consumes: `alumni/assets/wave-divider.svg` (from Task 1)
- Produces: CSS custom properties `--mason-green-link`, `--mason-cyan`, `--hero-overlay` (used by Task 3's `.hero--photo` styles); class `.btn-outline` (used by Task 3's hero Donate button); `.hero::after` wave rule (applies automatically to every page via the shared `.hero` class — no HTML changes needed on any page for this).

- [ ] **Step 1: Write a verification script asserting the OLD state (sanity check)**

Create `C:\Users\shamgar\AppData\Local\Temp\claude\C--Coding-mason-alumni-network\8f9fe029-c44c-4465-82de-66cef4f83270\scratchpad\verify-foundation.js`:

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:8123/index.html');
  await page.waitForSelector('h2');

  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  const h1Size = await page.evaluate(() => getComputedStyle(document.querySelector('.site-title h1')).fontSize);
  const hasOutlineBtn = await page.evaluate(() => !!document.querySelector('.btn-outline'));
  const waveHeight = await page.evaluate(() => getComputedStyle(document.querySelector('.hero'), '::after').height);

  console.log('body font-family:', bodyFont);
  console.log('h1 font-size:', h1Size);
  console.log('.btn-outline exists:', hasOutlineBtn);
  console.log('.hero::after height:', waveHeight);
  console.log('ERRORS:', JSON.stringify(errors));

  await browser.close();
})();
```

- [ ] **Step 2: Run it against the current (unchanged) site and confirm it shows the old state**

Run:
```bash
npx http-server alumni -p 8123 -c-1 &
sleep 1
node "C:\Users\shamgar\AppData\Local\Temp\claude\C--Coding-mason-alumni-network\8f9fe029-c44c-4465-82de-66cef4f83270\scratchpad\verify-foundation.js"
```

Expected: `body font-family` contains `Lato` (not `Hind`), `.btn-outline exists: false`, `.hero::after height` is `0px` (the rule doesn't exist yet). This confirms the script actually detects state correctly before we change anything.

- [ ] **Step 3: Update the font import and root variables**

In `alumni/styles.css`, replace line 4:

```css
@import url('https://fonts.googleapis.com/css2?family=Hind:wght@300;400;500;600;700&display=swap');
```

Replace the `:root` block (lines 6-23):

```css
:root {
  --mason-green: #4cbb17;
  --mason-green-dark: #3da912;
  --mason-green-link: #008a00;
  --mason-blue: #2a3d4d;
  --mason-blue-light: #415566;
  --mason-cyan: #1fb7e5;
  --hero-overlay: #223440;
  --mason-gray: #eaeaeb;
  --mhon-white: #ffffff;
  --text-dark: #1a1a1a;
  --text-medium: #36363a;
  --text-light: #666666;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.12);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.15);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 9999px;
}
```

- [ ] **Step 4: Swap body and heading font-family to Hind, and switch default link color**

Replace the `body` rule (lines 31-42), keeping every property except `font-family`:

```css
body {
  font-family: 'Hind', sans-serif;
  font-size: 17px;
  line-height: 27px;
  color: var(--text-dark);
  background-color: #f8f9fa;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

Replace the `h1, h2, h3, h4, h5, h6` rule (lines 44-49):

```css
h1, h2, h3, h4, h5, h6 {
  font-family: 'Hind', sans-serif;
  font-weight: 700;
  line-height: 1.2;
  color: var(--mason-blue);
}
```

Replace the default link color, lines 51-54 (keep `a:hover` at line 57-59 unchanged):

```css
a {
  color: var(--mason-green-link);
  text-decoration: none;
  transition: color 0.2s ease;
}
```

- [ ] **Step 5: Replace every remaining `'Outfit'` font-family with `'Hind'`**

Every one of these lines currently reads `font-family: 'Outfit', sans-serif;` — change each to `font-family: 'Hind', sans-serif;`:
- `.nav-tab` (was line 143)
- `.nav-dropdown-menu a` (was line 209)
- `.hero h2` (was line 255)
- `.btn` (was line 275)
- `.section-title` (was line 322)
- `.event-bar h3` (was line 376)
- `.info-section h3` (was line 454)
- `.footer-section h4` (was line 502)
- `.share-btn` (was line 573)
- `.share-popup-header` (was around line 609)

Also change `.share-popup .share-option`'s `font-family: 'Lato', sans-serif;` to `font-family: 'Hind', sans-serif;` (this was the last remaining `Lato` reference — Hind now covers the whole site, so `Lato` is fully retired).

- [ ] **Step 6: Add the `.btn-outline` variant**

Add after the existing `.btn-secondary:hover` rule (after line 308, before `.btn-small`):

```css
.btn-outline {
  background: transparent;
  box-shadow: inset 0 0 0 3px var(--mhon-white);
  color: var(--mhon-white);
}

.btn-outline:hover {
  background: var(--mhon-white);
  color: var(--mason-blue);
  box-shadow: var(--shadow-md);
}
```

- [ ] **Step 7: Tighten `.section-title` to match the real site's underline-bar treatment**

Replace the `.section-title` rule (lines 321-329):

```css
.section-title {
  display: inline-block;
  font-family: 'Hind', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 7px solid var(--mason-green);
  color: var(--mason-blue);
}
```

- [ ] **Step 8: Add the wave divider to the shared `.hero` rule**

Replace the `.hero` rule (lines 228-237) to add `position: relative` and the wave pseudo-element:

```css
.hero {
  background: linear-gradient(135deg, var(--mason-blue) 0%, var(--mason-blue-light) 100%);
  color: var(--mhon-white);
  padding: 6rem 0;
  min-height: 400px;
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 60px;
  background: url('assets/wave-divider.svg') no-repeat bottom center;
  background-size: 100% 100%;
  pointer-events: none;
}
```

- [ ] **Step 9: Run the verification script again and confirm the new state**

Run:
```bash
node "C:\Users\shamgar\AppData\Local\Temp\claude\C--Coding-mason-alumni-network\8f9fe029-c44c-4465-82de-66cef4f83270\scratchpad\verify-foundation.js"
```

Expected: `body font-family` now contains `Hind`, `.btn-outline exists: true`, `.hero::after height` is `60px`, `ERRORS: []`.

- [ ] **Step 10: Visual check on all three pages**

Extend the script (or write a second one) to screenshot `index.html`, `college-level.html`, and `career-level.html` at 1280x900, and read each file into the conversation to confirm: font looks like Hind (rounder than the old Outfit), the green underline bar under "Programs & Events" is visibly thicker, and a subtle white wave curve is visible at the bottom edge of each hero. Confirm no layout breakage (nav dropdowns, buttons, footer all still look correct — this CSS pass touches shared rules used everywhere).

- [ ] **Step 11: Stop the local server**

`lsof` is not available in this environment (Windows/git-bash) — use PowerShell to find and kill whatever is listening on port 8123:
```powershell
Get-NetTCPConnection -LocalPort 8123 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
```

- [ ] **Step 12: Commit**

```bash
git add alumni/styles.css
git commit -m "Switch to Hind font, align color palette, add outline button and wave divider"
```

---

## Task 3: Homepage photo hero

**Files:**
- Modify: `alumni-src/pages/index.html` (hero section — the `<!-- INCLUDE:header -->`-adjacent `<section class="hero">` block)
- Modify: `alumni/styles.css` (add `.hero--photo` modifier, after the `.hero::after` rule added in Task 2)

**Interfaces:**
- Consumes: `alumni/assets/hero-home.jpg` (Task 1), `--hero-overlay` custom property (Task 2), `.btn-outline` (Task 2)
- Produces: `.hero--photo` class, reusable by Task 4's college-level hero.

- [ ] **Step 1: Add the `.hero--photo` modifier CSS**

Add to `alumni/styles.css`, directly after the `.hero::after` rule from Task 2:

```css
.hero--photo {
  background-size: cover;
  background-position: center;
}

.hero--photo::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(34, 52, 64, 0) 0%, var(--hero-overlay) 100%);
  pointer-events: none;
}

.hero--photo .hero-content {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 2: Update the homepage hero markup**

In `alumni-src/pages/index.html` (NOT `alumni/index.html` — that's generated output), replace the hero section:

```html
	<section class="hero hero--photo" style="background-image: url('assets/hero-home.jpg')">
		<div class="hero-content">
			<img src="assets/mason-logo-footer.svg" alt="Mason City Schools" class="hero-logo">
			<h2>Welcome Mason Alumni</h2>
			<p>Stay connected with your Comet community. Discover networking opportunities, mentorship programs, reunions, and events designed to bring Mason graduates together across colleges and careers.</p>
			<a href="https://www.masonschoolsfoundation.org/donate" target="_blank" rel="noopener" class="btn btn-outline" id="donateLink">Donate</a>
		</div>
	</section>
```

(Only two changes from the current markup: `class="hero hero--photo"` + inline `style` background-image on the `<section>`, and `class="btn btn-outline"` instead of `class="btn btn-primary"` on the Donate link.)

- [ ] **Step 3: Rebuild and start a local server for this task's verification**

Each task in this plan runs as an independent subagent with no server left running from a previous task — rebuild the generated HTML from your updated source template, then start your own server:
```bash
node scripts/build.js
npx http-server alumni -p 8123 -c-1 &
sleep 1
```

- [ ] **Step 4: Write a verification script for the photo hero**

Create a scratch script that navigates to `index.html`, screenshots it, and checks: `.hero` has a `background-image` computed style referencing `hero-home.jpg`, the Donate button has `background-color` transparent (rgba(0, 0, 0, 0)) by default, and there are no console errors. Example:

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:8123/index.html');
  await page.waitForSelector('#donateLink');

  const bgImage = await page.evaluate(() => getComputedStyle(document.querySelector('.hero')).backgroundImage);
  const btnBg = await page.evaluate(() => getComputedStyle(document.getElementById('donateLink')).backgroundColor);
  console.log('hero background-image includes hero-home.jpg:', bgImage.includes('hero-home.jpg'));
  console.log('donate button background (should be transparent):', btnBg);

  await page.screenshot({ path: 'hero-home-check.png' });
  console.log('ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
```

- [ ] **Step 5: Run it and confirm**

Expected: `hero background-image includes hero-home.jpg: true`, `donate button background` is a transparent/rgba(0,0,0,0) value, `ERRORS: []`. Read the screenshot back and confirm: the photo is visible, the dark gradient makes the white headline/paragraph legible, the Mason logo and Donate button both read clearly against the photo, and the wave from Task 2 is still visible at the bottom edge.

- [ ] **Step 6: Stop the local server**

```powershell
Get-NetTCPConnection -LocalPort 8123 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
```

- [ ] **Step 7: Commit**

```bash
git add alumni-src/pages/index.html alumni/styles.css
git commit -m "Add photo hero to homepage with dark overlay and outline Donate CTA"
```

(`alumni/index.html` is gitignored generated output — don't add it; only the source template and the CSS are tracked.)

---

## Task 4: College-level photo hero

**Files:**
- Modify: `alumni-src/pages/college-level.html` (hero section)

**Interfaces:**
- Consumes: `alumni/assets/hero-college.jpg` (Task 1), `.hero--photo` (Task 3)

- [ ] **Step 1: Update the college-level hero markup**

In `alumni-src/pages/college-level.html` (NOT `alumni/college-level.html` — that's generated output), replace the hero section:

```html
	<section class="hero hero--photo" style="background-image: url('assets/hero-college.jpg'); background-position: center 20%;">
		<div class="hero-content">
			<h2>College Level Events &amp; Programs</h2>
			<p>Discover opportunities designed specifically for Mason alumni navigating college life.</p>
		</div>
	</section>
```

The inline `background-position: center 20%` biases the crop toward the top of the frame — `hero-college.jpg` is a portrait photo of people standing, so this keeps faces in view rather than centering on waistlines. This value is a starting point — confirmed/adjusted visually in Step 3 below.

- [ ] **Step 2: Rebuild and start a local server for this task's verification**

```bash
node scripts/build.js
npx http-server alumni -p 8123 -c-1 &
sleep 1
```

- [ ] **Step 3: Write a verification screenshot script**

Reuse the pattern from Task 3 Step 4, pointed at `college-level.html`, checking `.hero` background-image includes `hero-college.jpg`, and screenshotting at both 1280x900 (desktop) and 400x900 (mobile) viewport sizes.

- [ ] **Step 4: Run it, read back both screenshots, and adjust the crop if needed**

Look at the screenshots. If the photo is cropping out faces or looks awkwardly centered, adjust the `background-position` value in the inline style in `alumni-src/pages/college-level.html`, run `node scripts/build.js` again to regenerate `alumni/college-level.html`, and re-run the screenshot script until the crop looks right at both viewport sizes. This is a real visual judgment call — don't skip actually looking at the rendered result.

- [ ] **Step 5: Stop the local server**

```powershell
Get-NetTCPConnection -LocalPort 8123 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
```

- [ ] **Step 6: Commit**

```bash
git add alumni-src/pages/college-level.html
git commit -m "Add photo hero to college-level page"
```

(`alumni/college-level.html` is gitignored generated output — don't add it.)

---

## Task 5: Icon rail + shared trigger generalization

This task now builds on the templating system (a separate, already-completed plan — see `docs/superpowers/plans/2026-07-29-partial-templating.md`). Instead of pasting the icon-rail HTML block into all three pages, you write it ONCE as a new partial and add a one-line include marker to each page template.

**Files:**
- Create: `alumni-src/partials/icon-rail.html` (the icon rail markup, once)
- Modify: `scripts/build.js` (extend `resolveInclude()` to handle the `icon-rail` include name)
- Modify: `alumni-src/pages/index.html`, `alumni-src/pages/college-level.html`, `alumni-src/pages/career-level.html` (add `<!-- INCLUDE:icon-rail -->` marker; add `donate-link`/`share-trigger` classes to existing buttons)
- Modify: `alumni/styles.css` (add icon rail CSS)
- Modify: `alumni/share.js` (generalize from single `#shareBtn` to all `.share-trigger` elements; scroll popup into view on open)
- Modify: `alumni/donate-tracking.js` (generalize from single `#donateLink` to all `.donate-link` elements)
- Modify: `alumni-src/pages/college-level.html`, `alumni-src/pages/career-level.html` (add `<script src="donate-tracking.js" defer></script>` — currently only `index.html` has it, but both pages will now have a Donate icon in the rail)

**Interfaces:**
- Consumes: the `INCLUDE:name` marker mechanism and `resolveInclude()`/`readPartial()` functions in `scripts/build.js`, established by the templating plan (currently handles `header` and `footer`; this task adds a third case, `icon-rail`, which takes no attributes and just returns the partial verbatim — same pattern as `footer`).
- Produces: `.icon-rail` markup defined once in `alumni-src/partials/icon-rail.html`, reused via one include marker per page.

- [ ] **Step 1: Generalize `share.js` to support multiple trigger elements**

Replace the contents of `alumni/share.js`:

```js
// SITE_URL: update this (and the og:url/og:image tags in each page's <head>) when a custom domain replaces GitHub Pages.
(function () {
  var SHARE_TEXT = 'Join the Comet Alumni Network! Stay connected with Mason High School grads through mentorship, networking events, and reunions.';

  var triggers = document.querySelectorAll('.share-trigger');
  var popup = document.getElementById('sharePopup');
  if (!triggers.length || !popup) return;

  var closeBtn = document.getElementById('shareClose');
  var linkInput = document.getElementById('shareLinkInput');
  var copyStatus = document.getElementById('shareCopyStatus');
  var fbLink = document.getElementById('shareFacebook');
  var xLink = document.getElementById('shareX');
  var liLink = document.getElementById('shareLinkedIn');
  var igBtn = document.getElementById('shareInstagram');

  var pageUrl = window.location.href;
  linkInput.value = pageUrl;
  fbLink.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrl) + '&quote=' + encodeURIComponent(SHARE_TEXT);
  xLink.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(SHARE_TEXT) + '&url=' + encodeURIComponent(pageUrl);
  liLink.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(pageUrl);

  function setOpen(open) {
    popup.hidden = !open;
    triggers.forEach(function (t) { t.setAttribute('aria-expanded', String(open)); });
    if (open) popup.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(popup.hidden);
    });
  });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('click', function (e) {
    if (!popup.hidden && !popup.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  function showStatus(message, duration) {
    copyStatus.textContent = message;
    setTimeout(function () { copyStatus.textContent = ''; }, duration);
  }

  linkInput.addEventListener('click', function () {
    navigator.clipboard.writeText(pageUrl).then(function () {
      showStatus('Copied!', 2000);
    });
  });

  // Instagram has no web share intent for prefilled posts, so copy the
  // caption and hand off to Instagram for the user to paste it in.
  igBtn.addEventListener('click', function () {
    navigator.clipboard.writeText(SHARE_TEXT + ' ' + pageUrl).then(function () {
      showStatus('Caption copied - paste it into your Instagram post!', 4000);
      window.open('https://www.instagram.com/', '_blank', 'noopener');
    });
  });

  // Facebook ignores the quote param on sharer.php in most cases (they
  // disabled prefilled post text years ago to prevent spam), so copy the
  // caption as a paste-in fallback while still opening the dialog normally.
  fbLink.addEventListener('click', function () {
    navigator.clipboard.writeText(SHARE_TEXT).then(function () {
      showStatus('Caption copied - paste it if Facebook opens without it!', 4000);
    });
  });
})();
```

(Changes from the original: `var btn = document.getElementById('shareBtn')` becomes `var triggers = document.querySelectorAll('.share-trigger')`; the single `btn.addEventListener` becomes a `triggers.forEach(...)` loop; `setOpen` now scrolls the popup into view when opening, since it may be triggered from a fixed rail button far from the popup's location in the footer.)

- [ ] **Step 2: Generalize `donate-tracking.js` to support multiple trigger elements**

Replace the contents of `alumni/donate-tracking.js`:

```js
// TEMPORARY: logs anonymous donation-link clicks (timestamp, referrer, user agent)
// to a Google Sheet via a Google Apps Script Web App. Fill in the URL below after
// deploying the Apps Script (see donate-tracking-setup.md), or leave blank to skip logging.
(function () {
  var SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyi85htLDVlhc4_Y5rrjJj5LVQmEjTSsNhaV6g5mOix3JxzShAHyyt0jwmif4e2xt4YOQ/exec';

  var links = document.querySelectorAll('.donate-link');
  if (!links.length || !SHEET_ENDPOINT) return;

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      fetch(SHEET_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        keepalive: true,
        body: JSON.stringify({
          page: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent
        })
      });
    });
  });
})();
```

- [ ] **Step 3: Add the icon rail CSS**

Add to `alumni/styles.css`, after the `.hero--photo` rules from Task 3:

```css
/* Icon Rail */
.icon-rail {
  position: fixed;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 200;
}

.icon-rail-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: var(--mhon-white);
  box-shadow: var(--shadow-md);
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.icon-rail-btn:hover {
  transform: scale(1.08);
}

.icon-rail-donate { background: var(--mason-green); }
.icon-rail-facebook { background: #1877f2; }
.icon-rail-linkedin { background: #0a66c2; }
.icon-rail-share { background: var(--mason-cyan); }

@media (max-width: 768px) {
  .icon-rail {
    display: none;
  }
}
```

- [ ] **Step 4: Create the icon rail partial**

Create `alumni-src/partials/icon-rail.html`:

```html
	<div class="icon-rail">
		<a href="https://www.masonschoolsfoundation.org/donate" target="_blank" rel="noopener" class="icon-rail-btn icon-rail-donate donate-link" aria-label="Donate">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
		</a>
		<a href="https://www.facebook.com/Alumni45040/" target="_blank" rel="noopener" class="icon-rail-btn icon-rail-facebook" aria-label="Facebook">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.46 1.5-1.46H16.5V4.36C16.24 4.32 15.36 4.25 14.34 4.25c-2.13 0-3.59 1.3-3.59 3.68V10.5H8.25v3h2.5V21h2.75z"/></svg>
		</a>
		<a href="https://www.linkedin.com/school/william-mason-high-school/" target="_blank" rel="noopener" class="icon-rail-btn icon-rail-linkedin" aria-label="LinkedIn">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
		</a>
		<button type="button" class="icon-rail-btn icon-rail-share share-trigger" aria-label="Share" aria-haspopup="true" aria-expanded="false">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0-3-3c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 6 15.51c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.43z"/></svg>
		</button>
	</div>
```

- [ ] **Step 5: Extend `scripts/build.js` to handle the `icon-rail` include**

In `scripts/build.js`, in the `resolveInclude(name, attrs)` function, add a branch for `icon-rail` alongside the existing `footer` branch (it takes no attributes, just like `footer`):

```js
function resolveInclude(name, attrs) {
  if (name === 'footer' || name === 'icon-rail') {
    return readPartial(name);
  }
  if (name === 'header') {
    if (!attrs.page) throw new Error('INCLUDE:header is missing required "page" attribute');
    if (!attrs.tagline) throw new Error('INCLUDE:header is missing required "tagline" attribute');
    return readPartial('header')
      .replace('{{TAGLINE}}', attrs.tagline)
      .replace('{{NAV}}', buildNav(attrs.page));
  }
  throw new Error('Unknown INCLUDE name "' + name + '"');
}
```

(This replaces the existing `if (name === 'footer') { return readPartial('footer'); }` branch — `icon-rail` behaves identically to `footer`, so they share one branch.)

- [ ] **Step 6: Add the icon rail include marker to all three page templates**

In `alumni-src/pages/index.html`, insert directly after the `<body>` tag, before the `<!-- INCLUDE:header ... -->` marker:

```html
<!-- INCLUDE:icon-rail -->
```

Do the same in `alumni-src/pages/college-level.html` and `alumni-src/pages/career-level.html`.

Also add `class="donate-link"` to the existing hero Donate button in `alumni-src/pages/index.html` (from Task 3) so it keeps its tracking after `donate-tracking.js` switches to class-based binding: `class="btn btn-outline donate-link"`. And add `class="share-trigger"` to the `#shareBtn` button in the footer partial, `alumni-src/partials/footer.html`: `class="share-btn share-trigger"` (this one edit in the shared partial covers all three pages, since the footer is now single-sourced).

- [ ] **Step 7: Add `donate-tracking.js` to the two page templates that don't have it yet**

In `alumni-src/pages/college-level.html`, add after the existing `<script src="signup-tbd.js" defer></script>` line:
```html
	<script src="donate-tracking.js" defer></script>
```

Do the same in `alumni-src/pages/career-level.html`.

- [ ] **Step 8: Rebuild and start a local server for this task's verification**

```bash
node scripts/build.js
npx http-server alumni -p 8123 -c-1 &
sleep 1
```

- [ ] **Step 9: Write a verification script for the icon rail**

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  for (const path of ['index.html', 'college-level.html', 'career-level.html']) {
    await page.goto('http://localhost:8123/' + path);
    await page.waitForSelector('.icon-rail');
    const iconCount = await page.$$eval('.icon-rail-btn', els => els.length);
    console.log(path, 'icon count:', iconCount);
  }

  // Desktop: rail visible
  await page.goto('http://localhost:8123/index.html');
  const desktopVisible = await page.evaluate(() => getComputedStyle(document.querySelector('.icon-rail')).display !== 'none');
  console.log('rail visible at 1280px:', desktopVisible);

  // Mobile: rail hidden
  await page.setViewportSize({ width: 400, height: 900 });
  const mobileHidden = await page.evaluate(() => getComputedStyle(document.querySelector('.icon-rail')).display === 'none');
  console.log('rail hidden at 400px:', mobileHidden);

  // Share trigger from the rail opens the popup
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.click('.icon-rail-share');
  await page.waitForTimeout(400);
  const popupOpen = await page.evaluate(() => !document.getElementById('sharePopup').hidden);
  console.log('popup opened via rail share button:', popupOpen);

  console.log('ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
```

- [ ] **Step 10: Run it and confirm**

Expected: icon count is `4` on all three pages, rail visible at 1280px, rail hidden at 400px, popup opens via the rail's share button, `ERRORS: []`.

- [ ] **Step 11: Verify Donate tracking still fires from both the rail and (on the homepage) the hero button**

Reuse the curl-based verification technique already used earlier in this project (POST directly to the Apps Script URL and confirm `{"ok":true}` / HTTP 200 — see `alumni/donate-tracking-setup.md`) is unaffected by this change; the class-based binding doesn't change the fetch call itself. Instead, confirm via Playwright that clicking each `.donate-link` element fires a request to the Apps Script domain:

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const requests = [];
  page.on('request', req => { if (req.url().includes('script.google.com')) requests.push(req.url()); });

  await page.goto('http://localhost:8123/index.html');
  await page.waitForSelector('.icon-rail-donate');
  await page.evaluate(() => {
    document.querySelectorAll('.donate-link').forEach(el => el.addEventListener('click', e => e.preventDefault()));
  });
  await page.click('.icon-rail-donate');
  await page.click('#donateLink');
  await page.waitForTimeout(500);
  console.log('tracked requests fired:', requests.length);
  await browser.close();
})();
```

Expected: `tracked requests fired: 2` (one from the rail icon, one from the hero button — confirming both elements with the `.donate-link` class independently trigger tracking).

- [ ] **Step 12: Stop the local server**

```powershell
Get-NetTCPConnection -LocalPort 8123 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
```

- [ ] **Step 13: Commit**

```bash
git add alumni-src/partials/icon-rail.html alumni-src/partials/footer.html alumni-src/pages/index.html alumni-src/pages/college-level.html alumni-src/pages/career-level.html scripts/build.js alumni/styles.css alumni/share.js alumni/donate-tracking.js
git commit -m "Add repurposed icon rail (Donate/Facebook/LinkedIn/Share) across all pages"
```

(`alumni/index.html`, `alumni/college-level.html`, `alumni/career-level.html` are gitignored generated output — don't add them.)

---

## Task 6: Full-site regression pass

**Files:** none modified — this task only verifies.

**Interfaces:** none.

- [ ] **Step 1: Rebuild and start a local server for this task's verification**

```bash
node scripts/build.js
npx http-server alumni -p 8123 -c-1 &
sleep 1
```

- [ ] **Step 2: Write a full regression script covering prior features**

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('console', msg => { if (msg.type() === 'error') errors.push(page.url() + ': ' + msg.text()); });
  page.on('pageerror', err => errors.push(page.url() + ': ' + err.message));

  for (const path of ['index.html', 'college-level.html', 'career-level.html']) {
    await page.goto('http://localhost:8123/' + path);
    await page.waitForSelector('.icon-rail');
    await page.screenshot({ path: path.replace('.html', '') + '-final-desktop.png', fullPage: true });
  }

  // Nav dropdown hover still works (regression from earlier hover-gap fix)
  await page.goto('http://localhost:8123/index.html');
  await page.hover('summary:has-text("Engage")');
  await page.waitForTimeout(150);
  const dropdownOpen = await page.evaluate(() =>
    document.querySelector('.nav-dropdown:has(summary)').hasAttribute('open'));
  console.log('nav dropdown opens on hover:', dropdownOpen);

  // signup-tbd behavior still works
  await page.goto('http://localhost:8123/college-level.html');
  await page.click('.signup-tbd >> nth=0');
  await page.waitForTimeout(200);
  const tbdMessage = await page.$('.signup-tbd-message');
  console.log('signup-tbd message appears on click:', !!tbdMessage);

  // Mobile screenshots
  await page.setViewportSize({ width: 400, height: 900 });
  for (const path of ['index.html', 'college-level.html', 'career-level.html']) {
    await page.goto('http://localhost:8123/' + path);
    await page.waitForSelector('h2');
    await page.screenshot({ path: path.replace('.html', '') + '-final-mobile.png', fullPage: true });
  }

  console.log('ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
```

- [ ] **Step 3: Run it, read back every screenshot, and confirm**

Expected: `nav dropdown opens on hover: true`, `signup-tbd message appears on click: true`, `ERRORS: []`. Read all 6 screenshots back into the conversation and visually confirm: Hind font throughout, correct colors, both photo heroes look intentional (not awkwardly cropped), the wave divider is visible under every hero, the icon rail appears on desktop and is absent on mobile, and nothing looks broken or misaligned on any page at either viewport size.

- [ ] **Step 4: Fix anything that looks wrong**

If any visual issue turns up, fix it directly in the relevant source file from the task that introduced it (`alumni-src/pages/*.html` or `alumni-src/partials/*.html` for markup, `alumni/styles.css`/`alumni/*.js` for styles/behavior — never the generated `alumni/*.html` directly), run `node scripts/build.js` to regenerate, then re-run this task's script to confirm the fix before moving on.

- [ ] **Step 5: Stop the local server**

```powershell
Get-NetTCPConnection -LocalPort 8123 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
```

- [ ] **Step 6: Final commit (only if fixes were made in Step 4)**

```bash
git add -A
git commit -m "Fix regressions found in full-site visual pass"
```

If no fixes were needed, there's nothing to commit for this task — Task 5's commit is already the final state.
