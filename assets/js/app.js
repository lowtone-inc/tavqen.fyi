// 앱 진입점 — 페이지별 렌더러(Strategy)를 골라 실행하고, 공통 동작을 한 번만 바인딩한다.
import { SITE, CATEGORIES, POSTS } from './data.js';
import { PostRepository } from './repository.js';
import { createComponents } from './components.js';

const repo = new PostRepository(POSTS, CATEGORIES);
const ui = createComponents(repo, SITE);

const $ = (selector, root = document) => root.querySelector(selector);
const mount = (selector, html) => {
  const el = $(selector);
  if (el) el.innerHTML = html;
};

/* ---------- 페이지 렌더러 ---------- */

const homeRows = () => [
  { id: 'top', title: '오늘의 TOP 10', posts: repo.latest(10), ranked: true },
  { id: 'latest', title: '새로 올라온 글', posts: repo.latest(6) },
  ...repo.categories.map((c) => ({ id: c.id, title: c.label, posts: repo.byCategory(c.id) })),
];

const pages = {
  home() {
    mount('[data-slot="hero"]', ui.Hero(repo.featured()));
    mount('[data-slot="rows"]', homeRows().map(ui.Row).join(''));
  },

  post() {
    const id = new URLSearchParams(location.search).get('id');
    const post = repo.findById(id);
    if (!post) {
      mount('[data-slot="article"]', ui.Empty('글을 찾을 수 없습니다.'));
      return;
    }
    document.title = `${post.title} | ${SITE.name}`;
    mount('[data-slot="article"]', ui.Article(post));
    mount('[data-slot="rows"]', ui.Row({ id: 'related', title: '비슷한 콘텐츠', posts: repo.related(post) }));
  },
};

/* ---------- 공통 동작 ---------- */

function bindHeaderScroll() {
  const header = $('[data-header]');
  const update = () => header.classList.toggle('header--solid', window.scrollY > 40);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function bindPreviewDialog() {
  const dialog = $('[data-dialog]');
  if (!dialog) return;

  const open = (id) => {
    const post = repo.findById(id);
    if (!post) return;
    dialog.innerHTML = ui.Preview(post);
    dialog.showModal();
  };

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-preview]');
    if (trigger) open(trigger.dataset.preview);
  });
  // 닫기 버튼 또는 바깥(backdrop) 클릭 시 닫기
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
  });
}

function bindRowArrows() {
  document.addEventListener('click', (e) => {
    const arrow = e.target.closest('[data-scroll]');
    if (!arrow) return;
    const track = $('.row__track', arrow.closest('.row'));
    track.scrollBy({ left: Number(arrow.dataset.scroll) * track.clientWidth * 0.8, behavior: 'smooth' });
  });
}

function bindSearch(renderDefault) {
  const input = $('[data-search]');
  const debounce = (fn, ms = 200) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };

  input.addEventListener(
    'input',
    debounce(() => {
      const keyword = input.value;
      if (!keyword.trim()) return renderDefault();
      const results = repo.search(keyword);
      mount('[data-slot="hero"]', '');
      mount('[data-slot="article"]', '');
      mount(
        '[data-slot="rows"]',
        results.length
          ? ui.Row({ id: 'search', title: `“${keyword}” 검색 결과`, posts: results })
          : ui.Empty(`“${keyword}”에 대한 결과가 없습니다.`),
      );
    }),
  );
}

/* ---------- 부트스트랩 ---------- */

function init() {
  const render = pages[document.body.dataset.page] ?? pages.home;
  mount('[data-slot="header"]', ui.Header());
  mount('[data-slot="footer"]', ui.Footer());
  render();
  // 동적으로 그린 줄(#row-*)로의 앵커 이동 보정
  if (location.hash) $(location.hash)?.scrollIntoView();

  bindHeaderScroll();
  bindPreviewDialog();
  bindRowArrows();
  bindSearch(render);
}

init();
