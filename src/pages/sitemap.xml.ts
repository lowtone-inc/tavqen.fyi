import type { APIContext } from 'astro';
import { getCategoryGroups, getPosts, getTagGroups } from '@/lib/posts';
import { categoryUrl, postUrl, tagUrl, withBase } from '@/lib/url';

// 기존 Chirpy 주소(/sitemap.xml)를 유지하기 위해 직접 생성한다.
// (@astrojs/sitemap 의 sitemap-index.xml 도 함께 만들어진다)
export async function GET(context: APIContext) {
  const posts = await getPosts();
  const entries: { path: string; lastmod?: Date }[] = [
    ...['/', '/about/', '/archives/', '/categories/', '/tags/'].map((p) => ({ path: withBase(p) })),
    ...posts.map((p) => ({ path: postUrl(p.id), lastmod: p.data.updatedDate ?? p.data.pubDate })),
    ...(await getCategoryGroups()).map((g) => ({ path: categoryUrl(g.name) })),
    ...(await getTagGroups()).map((g) => ({ path: tagUrl(g.name) })),
  ];
  const urls = entries
    .map(({ path, lastmod }) => {
      const loc = new URL(path, context.site).href;
      return `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ''}</url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
