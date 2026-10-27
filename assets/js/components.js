// UI 컴포넌트 — 모두 "데이터 → HTML 문자열"을 돌려주는 순수 함수.
// createComponents(repo)는 Factory: 저장소에 의존하는 컴포넌트 묶음을 만든다.

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escape = (value) => String(value).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);

const join = (items, render) => items.map(render).join('');
const postUrl = (post) => `post.html?id=${encodeURIComponent(post.id)}`;
const coverStyle = ({ cover: [from, to] }) => `background: linear-gradient(135deg, ${from}, ${to});`;
const formatDate = (iso) => iso.replaceAll('-', '.');

export function createComponents(repo, site) {
  const Meta = (post) => `
    <div class="meta">
      <span class="meta__match">${escape(repo.categoryLabel(post.category))}</span>
      <span>${formatDate(post.date)}</span>
      <span class="meta__badge">${post.readTime}분</span>
    </div>`;

  const Tags = (tags) => `<ul class="tags">${join(tags, (t) => `<li>#${escape(t)}</li>`)}</ul>`;

  const Header = () => `
    <header class="header" data-header>
      <a class="logo" href="index.html">${escape(site.name)}</a>
      <nav class="nav">
        <a href="index.html">홈</a>
        ${join(repo.categories, (c) => `<a href="index.html#row-${c.id}">${escape(c.label)}</a>`)}
      </nav>
      <input class="search" type="search" placeholder="제목, 태그 검색" data-search aria-label="검색" />
    </header>`;

  const Footer = () => `
    <footer class="footer">
      <p>© ${new Date().getFullYear()} ${escape(site.author)} · ${escape(site.tagline)}</p>
    </footer>`;

  const Hero = (post) => `
    <section class="hero" style="${coverStyle(post)}">
      <div class="hero__shade"></div>
      <div class="hero__content">
        <p class="hero__label"><span class="logo-mark">N</span> 추천 시리즈</p>
        <h1 class="hero__title">${escape(post.title)}</h1>
        ${Meta(post)}
        <p class="hero__excerpt">${escape(post.excerpt)}</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="${postUrl(post)}">▶ 읽기</a>
          <button class="btn btn--ghost" type="button" data-preview="${escape(post.id)}">ⓘ 상세 정보</button>
        </div>
      </div>
    </section>`;

  const Card = (post, rank) => `
    <article class="card${rank ? ' card--ranked' : ''}">
      ${rank ? `<span class="card__rank">${rank}</span>` : ''}
      <button class="card__thumb" type="button" style="${coverStyle(post)}" data-preview="${escape(post.id)}">
        <span class="card__title">${escape(post.title)}</span>
      </button>
    </article>`;

  const Row = ({ id, title, posts, ranked = false }) =>
    posts.length === 0
      ? ''
      : `
    <section class="row" id="row-${escape(id)}">
      <h2 class="row__title">${escape(title)}</h2>
      <div class="row__viewport">
        <button class="row__arrow row__arrow--prev" type="button" data-scroll="-1" aria-label="이전">‹</button>
        <div class="row__track">${join(posts, (post, i) => Card(post, ranked && i + 1))}</div>
        <button class="row__arrow row__arrow--next" type="button" data-scroll="1" aria-label="다음">›</button>
      </div>
    </section>`;

  const Preview = (post) => `
    <div class="preview__cover" style="${coverStyle(post)}">
      <h2>${escape(post.title)}</h2>
      <a class="btn btn--primary" href="${postUrl(post)}">▶ 읽기</a>
    </div>
    <div class="preview__body">
      ${Meta(post)}
      <p>${escape(post.excerpt)}</p>
      ${Tags(post.tags)}
    </div>
    <button class="preview__close" type="button" data-close aria-label="닫기">✕</button>`;

  const Article = (post) => `
    <article class="article">
      <div class="article__cover" style="${coverStyle(post)}">
        <div class="hero__shade"></div>
        <h1 class="article__title">${escape(post.title)}</h1>
      </div>
      <div class="article__body">
        ${Meta(post)}
        ${Tags(post.tags)}
        ${join(post.body, (p) => `<p>${escape(p)}</p>`)}
      </div>
    </article>`;

  const Empty = (message) => `<p class="empty">${escape(message)}</p>`;

  return { Header, Footer, Hero, Card, Row, Preview, Article, Empty };
}
