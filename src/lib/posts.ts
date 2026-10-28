import { getCollection, type CollectionEntry } from 'astro:content';
import { slugify } from './url';
import { SITE } from '@/config';

export type Post = CollectionEntry<'posts'>;

const byNewest = (a: Post, b: Post) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

/** 공개된 글을 최신순으로 반환 (draft는 dev 모드에서만 노출) */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort(byNewest);
}

export interface Group {
  name: string;
  slug: string;
  posts: Post[];
}

/** 키 추출 함수 기준으로 글을 묶어 글 수 내림차순(동률은 이름순)으로 반환 */
function groupBy(posts: Post[], keys: (post: Post) => readonly string[]): Group[] {
  const groups = new Map<string, Group>();
  for (const post of posts) {
    for (const name of keys(post)) {
      const slug = slugify(name);
      const group = groups.get(slug) ?? { name, slug, posts: [] };
      group.posts.push(post);
      groups.set(slug, group);
    }
  }
  return [...groups.values()].sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name));
}

export const getTagGroups = async () => groupBy(await getPosts(), (p) => p.data.tags);
export const getCategoryGroups = async () => groupBy(await getPosts(), (p) => [p.data.category]);

/** 이전/다음 글 계산 (posts는 최신순) */
export function getAdjacent(posts: Post[], id: string) {
  const index = posts.findIndex((p) => p.id === id);
  return {
    newer: index > 0 ? posts[index - 1] : undefined,
    older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

/** 태그가 많이 겹치는 순으로 관련 글을 반환 (겹치는 태그가 없으면 제외) */
export function getRelated(posts: Post[], post: Post, limit = 3): Post[] {
  const mine = new Set(post.data.tags);
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, score: p.data.tags.filter((t) => mine.has(t)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => p);
}

/** 연도별로 묶은 아카이브 (연도 내림차순) */
export function groupByYear(posts: Post[]): { year: number; posts: Post[] }[] {
  const years = new Map<number, Post[]>();
  for (const post of posts) {
    const year = Number(post.data.pubDate.toLocaleString('en-US', { year: 'numeric', timeZone: 'Asia/Seoul' }));
    years.set(year, [...(years.get(year) ?? []), post]);
  }
  return [...years].map(([year, list]) => ({ year, posts: list })).sort((a, b) => b.year - a.year);
}

/** 홈 페이지네이션 (Astro paginate는 /2/ 형식이라 /page2/ 유지를 위해 직접 계산) */
export function paginate(posts: Post[], currentPage: number) {
  const lastPage = Math.max(1, Math.ceil(posts.length / SITE.postsPerPage));
  const start = (currentPage - 1) * SITE.postsPerPage;
  return { data: posts.slice(start, start + SITE.postsPerPage), currentPage, lastPage };
}
