# TAVQEN

넷플릭스 컨셉의 정적 블로그 템플릿. 빌드 도구 없이 HTML / CSS / Vanilla JS(ES Modules)로 동작한다.

## 실행

ES Module을 쓰므로 `file://`로 열면 안 되고 로컬 서버가 필요하다.

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## 구조

```
index.html              홈 (히어로 + 가로 스크롤 줄)
post.html               글 상세 (?id=<post-id>)
assets/css/style.css    디자인 토큰(:root) + 컴포넌트 스타일
assets/js/data.js       사이트 설정, 카테고리, 글 데이터
assets/js/repository.js PostRepository — 데이터 조회 (Repository 패턴)
assets/js/components.js UI 컴포넌트 함수 (Factory: createComponents)
assets/js/app.js        페이지 렌더러(Strategy) + 공통 이벤트 바인딩
```

## 글 추가

`assets/js/data.js`의 `POSTS` 배열에 객체를 추가한다. `cover`는 썸네일 그라디언트 색상 두 개.
`featured: true`인 글이 홈 히어로에 노출된다.

## 페이지 추가

1. HTML에 `<body data-page="이름">`과 필요한 `data-slot` 영역을 둔다.
2. `app.js`의 `pages` 객체에 같은 이름의 렌더 함수를 추가한다.
