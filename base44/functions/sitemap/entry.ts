import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const SITE_URL = "https://uniclass.co.il";

// A future publish date keeps an article out of the sitemap until that day.
function todayIso(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function escapeXml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // Published articles whose publish date has arrived — drafts and future dates are never exposed.
    const { items } = await base44.asServiceRole.entities.Article.filter(
      { status: "published", published_at: { $lte: todayIso() } },
      { sort: "-published_at", limit: 1000, fields: ["slug", "published_at"] }
    );

    const entries = [
      { loc: `${SITE_URL}/`, changefreq: "weekly", priority: "1.0", lastmod: null },
      { loc: `${SITE_URL}/blog`, changefreq: "weekly", priority: "0.8", lastmod: null },
      ...(items || []).map((article) => ({
        loc: `${SITE_URL}/blog/${article.slug}`,
        changefreq: "monthly",
        priority: "0.7",
        lastmod: article.published_at ? String(article.published_at).slice(0, 10) : null,
      })),
    ];

    const body = entries
      .map(
        (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
${entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>\n` : ""}    <changefreq>${entry.changefreq}</changefreq>
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