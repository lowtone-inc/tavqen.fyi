# TAVQEN (Jekyll · Chirpy)

[jekyll-theme-chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) 기반 GitHub Pages 블로그입니다. 넷플릭스 색감(검정 + 빨강)을 `assets/css/jekyll-theme-chirpy.scss` 에서 덮어씁니다. → https://tavqen.fyi

## 로컬 실행

```bash
bundle install
bundle exec jekyll serve --livereload
# http://localhost:4000/
```

## 글 쓰기

`_posts/YYYY-MM-DD-slug.md` 파일을 만들고 front matter 를 작성합니다.

```yaml
---
title: 글 제목
categories: [개발 로그]
tags: [태그]
description: 목록 요약 (선택)
pin: true   # 홈 상단 고정 (선택)
---
```

- 카테고리 · 태그 · 아카이브 페이지는 자동 생성됩니다.
- 사이드바 메뉴는 `_tabs/` (순서는 `order`), 연락처 아이콘은 `_data/contact.yml` 에서 관리합니다.

## 배포

`main` 브랜치에 push 하면 `.github/workflows/pages-deploy.yml` 이 빌드 · 테스트 · 배포합니다.
Pages Source 는 **GitHub Actions**, Custom domain 은 `tavqen.fyi` 입니다.
DNS(Spaceship): `@` A 레코드 `185.199.108.153` · `185.199.109.153` · `185.199.110.153` · `185.199.111.153`, `www` CNAME `lowtone-inc.github.io`.
