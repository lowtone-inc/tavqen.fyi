import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@/config';
import { getPosts } from '@/lib/posts';
import { postUrl } from '@/lib/url';

// 기존 Chirpy 주소(/feed.xml)를 유지한다.
export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: new URL(import.meta.env.BASE_URL, context.site),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: [post.data.category, ...post.data.tags],
      link: postUrl(post.id),
    })),
  });
}
