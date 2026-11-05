export const SITE = {
  title: 'TAVQEN',
  tagline: '오늘 밤 정주행할 글',
  description: '요즘 빠져 있는 것과 일상 에피소드를 연재하는 블로그.',
  author: 'TAVQEN',
  locale: 'ko-KR',
  postsPerPage: 10,
  // 글별 이미지가 없을 때 쓰는 공유 이미지 (public/ 기준 경로)
  ogImage: '/og-default.png',
} as const;

// 서치콘솔 소유 확인 코드. 값이 있을 때만 meta 태그를 출력한다.
export const SITE_VERIFICATION = {
  google: 'hE7vpqvHhQsa5AKZWkPvWyOK0RWgfl6SLK0W-mjSx_Y',
  naver: '668b5bbb9f36c4de96ff7789b22efd7e666769c2',
} as const;

// 사이드바 탭 (기존 Chirpy _tabs 순서 유지)
export const NAV_LINKS = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/categories/', label: 'Categories', icon: '▤' },
  { href: '/tags/', label: 'Tags', icon: '#' },
  { href: '/archives/', label: 'Archives', icon: '◷' },
  { href: '/about/', label: 'About', icon: 'i' },
] as const;

export const SOCIAL_LINKS = [
  { href: '/feed.xml', label: 'RSS' },
] as const;
