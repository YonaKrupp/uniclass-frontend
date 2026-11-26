// מייצר מחדש את public/sitemap.xml בכל build:
// הדפים הציבוריים הקבועים מתוך base44/shared/sitemapPages.js, והדפים הדינמיים
// (מאמרי בלוג ומסמכים משפטיים) מתוך פונקציית ה-sitemap החיה — כך שדפים חדשים
// במסד הנתונים נכנסים אליו אוטומטית.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { SITE_URL, LAST_REVIEWED, STATIC_PAGES } from "../base44/shared/sitemapPages.js";

const SITEMAP_URL =
  "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions/sitemap";
const OUT_FILE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/sitemap.xml"
);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// כל כתובת מנורמלת לדומיין הסופי, כדי שלא ייכנסו כתובות כפולות עם דומיין אחר.
function normalizeLoc(loc) {
  const path = String(loc).replace(/^https?:\/\/[^/]+/i, "");
  return `${SITE_URL}${path || "/"}`;
}

function parseEntries(xml) {
  const entries = [];
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  blocks.forEach((block) => {
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/);
    if (!loc) return;
    const lastmod = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/);
    const changefreq = block.match(/<changefreq>([\s\S]*?)<\/changefreq>/);
    const priority = block.match(/<priority>([\s\S]*?)<\/priority>/);
    entries.push({
      loc: normalizeLoc(loc[1].trim()),
      lastmod: lastmod ? lastmod[1].trim() : null,
      changefreq: changefreq ? changefreq[1].trim() : "monthly",
      priority: priority ? priority[1].trim() : "0.5",
    });
  });
  return entries;
}

// דפים דינמיים מהמסד. אם הפונקציה לא זמינה — משתמשים בקובץ הקיים כגיבוי.
let dynamicEntries = [];
try {
  const res = await fetch(SITEMAP_URL, { signal: AbortSignal.timeout(15000) });
  const xml = await res.text();
  if (!res.ok || !xml.includes("<urlset")) throw new Error(`status ${res.status}`);
  dynamicEntries = parseEntries(xml);
} catch (error) {
  const existing = await readFile(OUT_FILE, "utf8").catch(() => "");
  dynamicEntries = parseEntries(existing);
  console.warn("[sitemap] live function unavailable, reusing current file:", error.message);
}

const staticEntries = STATIC_PAGES.map((page) => ({
  loc: `${SITE_URL}${page.path}`,
  changefreq: page.changefreq,
  priority: page.priority,
  lastmod: LAST_REVIEWED,
}));

const seen = new Set();
const entries = [...staticEntries, ...dynamicEntries].filter((entry) => {
  if (seen.has(entry.loc)) return false;
  seen.add(entry.loc);
  return true;
});

const body = entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod || LAST_REVIEWED}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

await writeFile(OUT_FILE, xml, "utf8");
console.log(`[sitemap] public/sitemap.xml regenerated with ${entries.length} URLs`);