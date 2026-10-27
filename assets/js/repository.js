// Repository 패턴 — 데이터 출처(정적 배열, API 등)가 바뀌어도 화면 코드는 그대로 둔다.

const byDateDesc = (a, b) => b.date.localeCompare(a.date);

export class PostRepository {
  constructor(posts, categories) {
    this.posts = [...posts].sort(byDateDesc);
    this.categories = categories;
  }

  all() {
    return this.posts;
  }

  findById(id) {
    return this.posts.find((post) => post.id === id) ?? null;
  }

  featured() {
    return this.posts.find((post) => post.featured) ?? this.posts[0];
  }

  latest(limit = 10) {
    return this.posts.slice(0, limit);
  }

  byCategory(categoryId) {
    return this.posts.filter((post) => post.category === categoryId);
  }

  related(post, limit = 6) {
    return this.byCategory(post.category).filter((p) => p.id !== post.id).slice(0, limit);
  }

  categoryLabel(categoryId) {
    return this.categories.find((c) => c.id === categoryId)?.label ?? categoryId;
  }

  search(keyword) {
    const q = keyword.trim().toLowerCase();
    if (!q) return [];
    return this.posts.filter((post) =>
      [post.title, post.excerpt, ...post.tags].some((text) => text.toLowerCase().includes(q)),
    );
  }
}
