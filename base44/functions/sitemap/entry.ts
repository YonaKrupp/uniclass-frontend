import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { SITE_URL, LAST_REVIEWED, STATIC_PAGES } from '../../shared/sitemapPages.js';

// A future publish date keeps an article out of the sitemap until that day.
function todayIso() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function toDate(value) {
  if (!value) return null;
  const iso = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // דפים דינמיים מהמסד: מאמרי בלוג מפורסמים + מסמכים משפטיים מפורסמים.
    const [articlesRes, docsRes] = await Promise.allSettled([
      base44.asServiceRole.entities.Article.filter(
        { status: "published", published_at: { $lte: todayIso() } },
        { sort: "-published_at", limit: 1000, fields: ["slug", "published_at"] }
      ),
      base44.asServiceRole.entities.LegalDocument.filter(
        { is_published: true },
        { limit: 200, fields: ["slug", "effective_date"] }
      ),
    ]);

    const articles = articlesRes.status === "fulfilled" ? articlesRes.value?.items || [] : [];
    const docs = docsRes.status === "fulfilled" ? docsRes.value?.items || [] : [];

    // תאריך העדכון של כל מסמך משפטי, לפי ה-slug שלו.
    const docLastmod = {};
    docs.forEach((doc) => {
      if (doc?.slug) docLastmod[String(doc.slug)] = toDate(doc.effective_date);
    });

    const entries = STATIC_PAGES.map((page) => ({
      loc: `${SITE_URL}${page.path}`,
      changefreq: page.changefreq,
      priority: page.priority,
      lastmod: docLastmod[page.path.replace(/^\/+/, "")] || LAST_REVIEWED,
    }));

    const knownPaths = new Set(STATIC_PAGES.map((page) => page.path));

    (articles || []).forEach((article) => {
      if (!article?.slug) return;
      entries.push({
        loc: `${SITE_URL}/blog/${article.slug}`,
        changefreq: "monthly",
        priority: "0.7",
        lastmod: toDate(article.published_at) || LAST_REVIEWED,
      });
    });

    // מסמכים משפטיים מפורסמים במסד שאין להם עדיין עמוד סטטי — נוספים אוטומטית.
    docs.forEach((doc) => {
      const path = `/${String(doc?.slug || "").replace(/^\/+/, "")}`;
      if (!doc?.slug || knownPaths.has(path)) return;
      entries.push({
        loc: `${SITE_URL}${path}`,
        changefreq: "monthly",
        priority: "0.5",
        lastmod: toDate(doc.effective_date) || LAST_REVIEWED,
      });
      knownPaths.add(path);
    });

    const body = entries
      .map(
        (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (error) {
    console.error("[sitemap] Error:", (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}