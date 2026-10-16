// Publication rules for the blog.
// An article is public only when it is marked published AND its publish date has
// already arrived. A future date keeps it hidden everywhere (list, article page,
// sitemap), which is what makes scheduling work by changing the date alone.

export function todayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function publishedArticleFilter(extra = {}) {
  return { ...extra, status: "published", published_at: { $lte: todayIso() } };
}