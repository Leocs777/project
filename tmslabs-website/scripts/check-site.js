const fs = require("fs");
const path = require("path");

const root = process.cwd();
const expectedFiles = [
  "index.html",
  "BRAND.md",
  "real-estate/index.html",
  "trade/index.html",
  "apps/index.html",
  "about/index.html",
  "contact/index.html",
  "privacy/index.html",
  "zh/index.html",
  "zh/real-estate/index.html",
  "zh/trade/index.html",
  "zh/apps/index.html",
  "zh/about/index.html",
  "zh/contact/index.html",
  "zh/privacy/index.html",
  "assets/css/styles.css",
  "assets/js/main.js",
  "assets/images/tms-labs-hero.svg",
  "assets/images/tmslabs-logo.svg",
  "assets/images/tmslabs-mark.svg",
  "favicon.svg",
  "site.webmanifest",
  "robots.txt",
  "sitemap.xml"
];

const htmlFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith(".html")) {
      htmlFiles.push(fullPath);
    }
  }
}

function localTarget(file, reference) {
  const clean = reference.split("#")[0].split("?")[0];
  if (!clean) return null;
  if (/^(https?:|mailto:|tel:)/.test(clean)) return null;
  const base = clean.startsWith("/") ? root : path.dirname(file);
  let target = path.resolve(base, clean.replace(/^\//, ""));
  if (clean.endsWith("/")) target = path.join(target, "index.html");
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    target = path.join(target, "index.html");
  }
  return target;
}

const failures = [];

for (const expected of expectedFiles) {
  if (!fs.existsSync(path.join(root, expected))) {
    failures.push(`Missing expected file: ${expected}`);
  }
}

walk(root);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const ref of refs) {
    const target = localTarget(file, ref);
    if (target && !fs.existsSync(target)) {
      failures.push(`${path.relative(root, file)} references missing file: ${ref}`);
    }
  }

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      failures.push(`${path.relative(root, file)} has invalid JSON-LD: ${error.message}`);
    }
  }

  if (!html.includes('rel="icon"')) {
    failures.push(`${path.relative(root, file)} is missing favicon link`);
  }
}

const scannedText = expectedFiles
  .filter((file) => /\.(html|css|js|xml|txt|json|svg)$/.test(file))
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

for (const pattern of [/trinitylabs\.net/i, /\bTODO\b/, /\bTBD\b/, /\bFIXME\b/]) {
  if (pattern.test(scannedText)) {
    failures.push(`Found forbidden pattern: ${pattern}`);
  }
}

if (htmlFiles.length !== 14) {
  failures.push(`Expected 14 HTML files, found ${htmlFiles.length}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Checked ${expectedFiles.length} expected files.`);
console.log(`Checked ${htmlFiles.length} HTML files.`);
console.log("All local references, favicon links, and JSON-LD blocks are valid.");
