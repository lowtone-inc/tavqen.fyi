# TAVQEN

Astro 5 기반 GitHub Pages 블로그입니다. (Jekyll Chirpy 에서 이전, 넷플릭스 색감 유지) → https://tavqen.fyi

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:4321/
npm run build    # astro check + astro build -> dist/
```

## 글 쓰기

`src/content/posts/<slug>.md` 를 만들면 `/posts/<slug>/` 로 발행됩니다.

```yaml
---
title: '글 제목'
description: '목록/SEO 요약'
pubDate: 2026-10-28T21:00:00+09:00
updatedDate: 2026-10-29T10:00:00+09:00   # 선택
category: '개발 로그'
tags: [react, 회고]
featured: false
draft: false   # true 면 빌드에서 제외
---
```

- 카테고리 · 태그 · 아카이브 페이지는 자동 생성됩니다. 슬러그는 한글 유지 (`개발 로그` -> `/categories/개발-로그/`).
- 안내 박스는 `<div class="prompt prompt-tip">` (`prompt-info` / `prompt-warning` / `prompt-danger`) 로 감싸고 앞뒤에 빈 줄을 둡니다.
- 사이드바 메뉴와 사이트 정보는 `src/config.ts`, 검증 코드(google/naver)도 여기서 관리합니다.

## 배포

`main` 에 merge 하면 `.github/workflows/deploy.yml` 이 빌드 후 GitHub Pages 로 배포합니다.
Pages Source 는 **GitHub Actions**, Custom domain 은 `tavqen.fyi` (`public/CNAME`) 입니다.
DNS(Spaceship): `@` A 레코드 `185.199.108.153` · `185.199.109.153` · `185.199.110.153` · `185.199.111.153`, `www` CNAME `lowtone-inc.github.io`.
