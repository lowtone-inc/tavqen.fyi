const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** 외부 링크는 그대로, 내부 경로는 base 경로를 붙여 반환 */
export function withBase(path: string): string {
  if (/^(https?:)?\/\//.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${normalized}`;
}

/** 현재 경로가 해당 링크 영역에 속하는지 판별 */
export function isActive(currentPath: string, href: string): boolean {
  const target = withBase(href);
  if (href === '/') return currentPath === target || currentPath === `${target}/`;
  return currentPath.startsWith(target);
}

/** 한글을 유지한 채 URL 슬러그로 변환 (기존 Chirpy 경로와 동일: "개발 로그" -> "개발-로그") */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '');
}

export const postUrl = (id: string) => withBase(`/posts/${id}/`);
export const tagUrl = (tag: string) => withBase(`/tags/${slugify(tag)}/`);
export const categoryUrl = (category: string) => withBase(`/categories/${slugify(category)}/`);
// 홈 페이지네이션: 1페이지는 /, 이후는 Chirpy와 같은 /page2/ 형식
export const homePageUrl = (page: number) => withBase(page <= 1 ? '/' : `/page${page}/`);
