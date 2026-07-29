# Shared-Partial Templating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the duplicated `<header>`/`<footer>` blocks across `alumni/index.html`, `alumni/college-level.html`, `alumni/career-level.html` with a small build-time templating system, so future shared-markup additions (like the icon rail) require editing one partial instead of three pages.

**Architecture:** New `alumni-src/` holds page templates (with `<!-- INCLUDE:name key="value" -->` markers) and two shared partials (`header.html`, `footer.html`). A plain-Node build script (`scripts/build.js`, no new dependencies) resolves the templates into `alumni/*.html`, which become generated/gitignored output. No existing test suite exists — verification is diffing generated output against the pre-migration files (should be byte-identical except deliberate whitespace normalization at marker boundaries) plus a Playwright-driven functional regression pass (nav dropdown, share popup, donate tracking).

**Tech Stack:** Node (`fs`/`path` only), `playwright` (already added as a devDependency by the sibling brand-alignment plan's Task 1 — if that hasn't run yet in this worktree, this plan's Task 2 installs it itself).

## Global Constraints

- Never add yourself as a co-author on commits (per `CLAUDE.md`).
- Commit at each logical milestone — each task in this plan ends with a commit.
- `alumni-src/pages/*.html` and `alumni-src/partials/*.html` use tabs for indentation (matches the existing `alumni/*.html` convention). `scripts/build.js` uses 2-space indentation (matches `alumni/*.js`).
- No new frontend runtime dependencies — the build script ships zero dependencies of its own.
- `alumni/styles.css`, `alumni/*.js`, `alumni/assets/*`, and every other file currently in `alumni/` that isn't one of the 3 page HTML files stays untouched and hand-edited directly — this plan only affects how the 3 page HTML files are produced.

---

## Task 1: Extract partials, build page templates, write the build script

**Files:**
- Create: `alumni-src/partials/header.html`
- Create: `alumni-src/partials/footer.html`
- Create: `alumni-src/pages/index.html`, `alumni-src/pages/college-level.html`, `alumni-src/pages/career-level.html`
- Create: `scripts/build.js`

**Interfaces:**
- Produces: `node scripts/build.js` — reads `alumni-src/pages/*.html` + `alumni-src/partials/*.html`, writes resolved output to `alumni/index.html`, `alumni/college-level.html`, `alumni/career-level.html`. Marker syntax: `<!-- INCLUDE:header page="home|college|career" tagline="..." -->` and `<!-- INCLUDE:footer -->`. Later tasks (and the sibling icon-rail work) will add `<!-- INCLUDE:icon-rail -->` support the same way.

- [ ] **Step 1: Create the header partial**

Create `alumni-src/partials/header.html`:

```html
<header class="header">
	<div class="header-main">
		<div class="container">
			<div class="logo-section">
				<a href="index.html" class="logo-link">
					<img src="assets/alumni_network_logo.png" alt="Comet Alumni Network" class="logo">
				</a>
				<div class="site-title">
					<h1>Comet Alumni Network</h1>
					<span class="tagline">{{TAGLINE}}</span>
				</div>
			</div>
{{NAV}}
		</div>
	</div>
</header>
```

- [ ] **Step 2: Create the footer partial**

Create `alumni-src/partials/footer.html`:

```html
	<footer class="footer">
		<div class="footer-content">
			<div class="footer-main">
				<div class="footer-section">
					<h4>Comet Alumni Network</h4>
					<p>Comets Forever, Connected Always</p>
					<div class="social-icons">
						<a href="#" class="social-icon" aria-label="LinkedIn">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
						</a>
						<a href="#" class="social-icon" aria-label="Instagram">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>
						</a>
					</div>
				</div>
				<div class="footer-section">
					<h4>Share the Network</h4>
					<p>Help spread the word to fellow Comets.</p>
					<div class="share-wrapper">
						<button type="button" class="share-btn" id="shareBtn" aria-haspopup="true" aria-expanded="false">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0-3-3c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 6 15.51c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.43z"/></svg>
							Share
						</button>
						<div class="share-popup" id="sharePopup" hidden>
							<div class="share-popup-header">
								<span>Share</span>
								<button type="button" class="share-popup-close" id="shareClose" aria-label="Close">&times;</button>
							</div>
							<a href="#" class="share-option" id="shareFacebook" target="_blank" rel="noopener">
								<span class="share-icon-circle share-icon-facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.46 1.5-1.46H16.5V4.36C16.24 4.32 15.36 4.25 14.34 4.25c-2.13 0-3.59 1.3-3.59 3.68V10.5H8.25v3h2.5V21h2.75z"/></svg></span>
								Facebook
							</a>
							<a href="#" class="share-option" id="shareX" target="_blank" rel="noopener">
								<span class="share-icon-circle share-icon-x"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></span>
								X
							</a>
							<a href="#" class="share-option" id="shareLinkedIn" target="_blank" rel="noopener">
								<span class="share-icon-circle share-icon-linkedin"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg></span>
								LinkedIn
							</a>
							<button type="button" class="share-option" id="shareInstagram">
								<span class="share-icon-circle share-icon-instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg></span>
								Instagram
							</button>
							<div class="share-copy-row">
								<label for="shareLinkInput" class="share-copy-label">Click to copy link</label>
								<input type="text" id="shareLinkInput" class="share-link-input" readonly>
								<span class="share-copy-status" id="shareCopyStatus" aria-live="polite"></span>
							</div>
						</div>
					</div>
				</div>
				<div class="footer-section">
					<h4>Contact</h4>
					<p>6100 Mason Montgomery Rd<br>Mason, OH 45040</p>
					<p>(513) 398-5025</p>
					<p><a href="mailto:CometAlumniNetwork@masonohioschools.com">CometAlumniNetwork@masonohioschools.com</a></p>
				</div>
				<div class="footer-section">
					<h4>Quick Links</h4>
					<p><a href="index.html">Home</a></p>
					<p><a href="college-level.html">College Alumni</a></p>
					<p><a href="career-level.html">Professional Alumni</a></p>
				</div>
			</div>
			<div class="footer-bottom">
				<div class="footer-logo">
					<img src="assets/mason-logo-footer.svg" alt="Mason High School" class="footer-logo-img">
					<img src="assets/alumni_network_logo.png" alt="Comet Alumni Network" class="footer-alumni-logo-img">
				</div>
				<p>In partnership with Mason High School</p>
			</div>
		</div>
	</footer>
```

- [ ] **Step 3: Create the three page templates**

For each of the three pages, copy the CURRENT file from `alumni/<name>.html` to `alumni-src/pages/<name>.html` unchanged, then apply exactly these two edits:

**`alumni-src/pages/index.html`** (copied from current `alumni/index.html`):
- Replace the entire `<header class="header">...</header>` block (currently lines 17-48) with:
  ```html
  <!-- INCLUDE:header page="home" tagline="Comets Forever, Connected Always" -->
  ```
- Replace the entire `<footer class="footer">...</footer>` block (currently lines 59-132) with:
  ```html
  <!-- INCLUDE:footer -->
  ```

**`alumni-src/pages/college-level.html`** (copied from current `alumni/college-level.html`):
- Replace the `<header>...</header>` block (currently lines 17-48) with:
  ```html
  <!-- INCLUDE:header page="college" tagline="College Level" -->
  ```
- Replace the `<footer>...</footer>` block (currently lines 130-203) with:
  ```html
  <!-- INCLUDE:footer -->
  ```

**`alumni-src/pages/career-level.html`** (copied from current `alumni/career-level.html`):
- Replace the `<header>...</header>` block (currently lines 17-48) with:
  ```html
  <!-- INCLUDE:header page="career" tagline="Career Level" -->
  ```
- Replace the `<footer>...</footer>` block (currently lines 142-215) with:
  ```html
  <!-- INCLUDE:footer -->
  ```

Everything else in each file (the `<head>` block, the `<section class="hero">`, the `<section class="section">` with all its events, and the closing `<script>` tags / `</body></html>`) stays exactly as it currently is in `alumni/<name>.html` — copy it verbatim.

- [ ] **Step 4: Write the build script**

Create `scripts/build.js`:

```js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'alumni-src', 'pages');
const PARTIALS_DIR = path.join(ROOT, 'alumni-src', 'partials');
const OUT_DIR = path.join(ROOT, 'alumni');

const INCLUDE_RE = /<!--\s*INCLUDE:(\w+)((?:\s+\w+="[^"]*")*)\s*-->/g;
const ATTR_RE = /(\w+)="([^"]*)"/g;

function parseAttrs(attrString) {
  const attrs = {};
  let m;
  while ((m = ATTR_RE.exec(attrString))) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function buildNav(pageId) {
  const isHome = pageId === 'home';
  const isCollege = pageId === 'college';
  const isCareer = pageId === 'career';
  return `\t\t\t<nav class="main-nav" aria-label="level-navigation">
\t\t\t\t<a href="index.html" class="nav-tab${isHome ? ' active' : ''}">Homepage</a>
\t\t\t\t<details class="nav-dropdown"${(isCollege || isCareer) ? ' open' : ''}>
\t\t\t\t\t<summary class="nav-tab${(isCollege || isCareer) ? ' active' : ''}">Engage &amp; Experience Programs</summary>
\t\t\t\t\t<div class="nav-dropdown-menu">
\t\t\t\t\t\t<a href="college-level.html"${isCollege ? ' class="active"' : ''}>College Alumni</a>
\t\t\t\t\t\t<a href="career-level.html"${isCareer ? ' class="active"' : ''}>Professional Alumni</a>
\t\t\t\t\t</div>
\t\t\t\t</details>
\t\t\t\t<details class="nav-dropdown">
\t\t\t\t\t<summary class="nav-tab">Comet Network</summary>
\t\t\t\t\t<div class="nav-dropdown-menu">
\t\t\t\t\t\t<a href="https://www.facebook.com/Alumni45040/" target="_blank" rel="noopener">Facebook Group</a>
\t\t\t\t\t\t<a href="https://www.linkedin.com/school/william-mason-high-school/" target="_blank" rel="noopener">LinkedIn Group</a>
\t\t\t\t\t</div>
\t\t\t\t</details>
\t\t\t</nav>`;
}

function readPartial(name) {
  const file = path.join(PARTIALS_DIR, name + '.html');
  if (!fs.existsSync(file)) {
    throw new Error('Unknown partial "' + name + '" (looked for ' + file + ')');
  }
  return fs.readFileSync(file, 'utf8');
}

function resolveInclude(name, attrs) {
  if (name === 'footer') {
    return readPartial('footer');
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

function buildPage(filename) {
  const src = fs.readFileSync(path.join(PAGES_DIR, filename), 'utf8');
  const resolved = src.replace(INCLUDE_RE, (match, name, attrString) => {
    return resolveInclude(name, parseAttrs(attrString));
  });
  fs.writeFileSync(path.join(OUT_DIR, filename), resolved);
  console.log('Built ' + filename);
}

fs.readdirSync(PAGES_DIR)
  .filter(f => f.endsWith('.html'))
  .forEach(buildPage);
```

- [ ] **Step 5: Run the build and inspect the output**

Run:
```bash
node scripts/build.js
```

Expected: prints `Built index.html`, `Built college-level.html`, `Built career-level.html` with no errors, and `alumni/*.html` now contain the fully-resolved output (git will show these as modified, since they're still tracked at this point in the plan — Task 2 untracks them).

- [ ] **Step 6: Verify the generated output matches the original content**

Run, for each of the three pages:
```bash
git diff --ignore-blank-lines --ignore-space-change alumni/index.html
git diff --ignore-blank-lines --ignore-space-change alumni/college-level.html
git diff --ignore-blank-lines --ignore-space-change alumni/career-level.html
```

Expected: no output (empty diff) for all three, once blank-line and whitespace differences are ignored — confirming the generated header/footer/nav content is semantically identical to what was there before, for every page. If any diff shows an actual content change (not just whitespace), find the discrepancy between the partial/template and the original file and fix it before proceeding — this must be a faithful migration, not a rewrite.

- [ ] **Step 7: Commit**

```bash
git add alumni-src scripts/build.js alumni/index.html alumni/college-level.html alumni/career-level.html
git commit -m "Add build-time templating for header/footer partials"
```

---

## Task 2: Wire up local dev, CI, and gitignore; final regression pass

**Files:**
- Modify: `package.json` (add `build` script, `prestart`/`preserve:alumni` hooks)
- Modify: `.gitignore` (ignore the 3 generated HTML files)
- Modify: `.github/workflows/pages.yml` (add build step before the existing cache-busting step)
- Modify: git tracking — untrack the 3 generated files (`git rm --cached`)

**Interfaces:**
- Consumes: `scripts/build.js` and `alumni-src/**` from Task 1.

- [ ] **Step 1: Add the build script and pre-hooks to `package.json`**

Update the `"scripts"` block to:

```json
"scripts": {
  "build": "node scripts/build.js",
  "prestart": "npm run build",
  "preserve:alumni": "npm run build",
  "start": "http-server . -p 8000 -o /alumni/ -c-1",
  "serve:alumni": "http-server . -p 8000 -o /alumni/ -c-1",
  "serve": "http-server . -p 8000 -c-1"
}
```

- [ ] **Step 2: Add the generated files to `.gitignore`**

Append to `.gitignore`:
```
/alumni/index.html
/alumni/college-level.html
/alumni/career-level.html
```

- [ ] **Step 3: Untrack the generated files**

```bash
git rm --cached alumni/index.html alumni/college-level.html alumni/career-level.html
```

(This only removes them from git's index — the files stay on disk exactly as `node scripts/build.js` last wrote them, and `npm start`/CI regenerate them going forward.)

- [ ] **Step 4: Add the build step to the CI workflow**

In `.github/workflows/pages.yml`, insert a new step immediately after `- uses: actions/checkout@v4` and before the existing `- name: Cache-bust styles.css and share.js` step:

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Build pages from templates
        run: node scripts/build.js
```

- [ ] **Step 5: Verify `npm start` builds automatically**

Run:
```bash
rm alumni/index.html alumni/college-level.html alumni/career-level.html
npm start &
sleep 2
curl -sf http://localhost:8000/alumni/index.html | grep -o "Welcome Mason Alumni"
```

Expected: `Welcome Mason Alumni` prints, confirming `prestart` rebuilt the deleted files before `http-server` started serving. Stop the server afterward — `lsof` is not available in this environment (Windows/git-bash); use PowerShell instead:
```powershell
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
```

- [ ] **Step 6: Full functional regression pass**

Write and run a Playwright verification script (reusing the same pattern used throughout this project's development) that serves `alumni/` and checks, on all three pages: page loads with no console errors, the correct nav tab/dropdown shows `active`/`open` for that page, clicking the "Comet Network" summary opens its dropdown, the footer share button opens the share popup, and (on `index.html` only) the hero Donate button exists with the correct `href`. Example:

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('console', msg => { if (msg.type() === 'error') errors.push(page.url() + ': ' + msg.text()); });
  page.on('pageerror', err => errors.push(page.url() + ': ' + err.message));

  const checks = [
    { path: 'index.html', activeTab: 'Homepage' },
    { path: 'college-level.html', activeTab: 'Engage & Experience Programs', activeSub: 'College Alumni' },
    { path: 'career-level.html', activeTab: 'Engage & Experience Programs', activeSub: 'Professional Alumni' },
  ];

  for (const c of checks) {
    await page.goto('http://localhost:8123/' + c.path);
    await page.waitForSelector('.main-nav');
    const activeText = await page.$eval('.nav-tab.active', el => el.textContent.trim());
    console.log(c.path, 'active tab:', activeText, '(expected:', c.activeTab + ')');
    if (c.activeSub) {
      const activeSubText = await page.$eval('.nav-dropdown-menu a.active', el => el.textContent.trim());
      console.log(c.path, 'active submenu:', activeSubText, '(expected:', c.activeSub + ')');
    }
  }

  await page.goto('http://localhost:8123/index.html');
  await page.click('summary:has-text("Comet Network")');
  await page.waitForTimeout(150);
  const cometNetworkOpen = await page.evaluate(() =>
    document.querySelector('.nav-dropdown:has(summary:has-text("Comet Network"))').hasAttribute('open'));
  console.log('Comet Network dropdown opens on click:', cometNetworkOpen);

  await page.click('#shareBtn');
  await page.waitForTimeout(150);
  const popupOpen = await page.evaluate(() => !document.getElementById('sharePopup').hidden);
  console.log('share popup opens:', popupOpen);

  const donateHref = await page.$eval('#donateLink', el => el.href);
  console.log('donate href:', donateHref);

  console.log('ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
```

Expected: each page's active tab/submenu matches what's listed, the Comet Network dropdown opens, the share popup opens, the donate href is `https://www.masonschoolsfoundation.org/donate`, and `ERRORS: []`.

- [ ] **Step 7: Commit**

```bash
git add package.json .gitignore .github/workflows/pages.yml
git commit -m "Wire templating build into local dev workflow and CI"
```
