const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'alumni-src', 'pages');
const PARTIALS_DIR = path.join(ROOT, 'alumni-src', 'partials');
const OUT_DIR = path.join(ROOT, 'alumni');

const INCLUDE_RE = /<!--\s*INCLUDE:([\w-]+)((?:\s+\w+="[^"]*")*)\s*-->/g;
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
