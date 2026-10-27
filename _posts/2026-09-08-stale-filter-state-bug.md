---
title: "2026.09.08 - 필터를 바꿨는데 목록이 안 바뀌던 버그"
description: "검색 필터를 빠르게 바꾸면 이전 결과가 화면에 남던 버그. 원인은 응답 순서 역전이었고, AbortController로 고쳤다."
date: 2026-09-08 21:40:00 +0900
categories: [개발 로그]
tags: [react, fetch, abortcontroller, 버그회고]
---

지난주 QA에서 이슈가 하나 올라왔다. "필터를 빠르게 바꾸면 가끔 이전 필터 결과가 보인다"는 내용이었다. 재현이 잘 안 돼서 한참 헤맸다. 결론부터 말하면 요청 응답 순서가 뒤집히는 전형적인 race condition이었다.

## 증상

상품 목록 화면에 카테고리 탭이 있다. 탭을 누르면 해당 카테고리 상품을 API로 가져온다. 내 로컬에서는 API가 빨라서 아무 문제 없었다. 그런데 QA 환경은 응답이 300ms~2초 사이로 들쭉날쭉했다.

탭을 `의류 -> 신발` 순서로 빠르게 누르면 이런 일이 생긴다.

1. 의류 요청 전송 (서버가 느리게 처리)
2. 신발 요청 전송 (서버가 빠르게 처리)
3. 신발 응답 도착 -> 화면에 신발 목록
4. 의류 응답 도착 -> 화면이 의류 목록으로 덮어씌워짐

탭은 `신발`이 선택돼 있는데 목록은 의류다. 사용자 입장에서는 필터가 고장 난 것처럼 보인다.

## 기존 코드

```jsx
useEffect(() => {
  setLoading(true);
  fetchProducts(category)
    .then(setProducts)
    .finally(() => setLoading(false));
}, [category]);
```

의존성 배열은 맞게 적혀 있다. 문제는 "늦게 도착한 옛날 응답"을 버리는 장치가 없다는 점이었다.

## 재현 방법

개발자 도구 Network 탭에서 throttling을 Slow 3G로 두고 탭을 연타하면 된다. 이걸 몰라서 처음 하루를 날렸다. 로컬에서 안 재현되는 버그는 일단 네트워크부터 느리게 만들어 보자.

> 비동기 버그가 안 재현되면 코드를 의심하기 전에 타이밍을 의심한다.
{: .prompt-tip }

## 고친 코드

`AbortController`로 이전 요청을 취소하게 바꿨다.

```jsx
useEffect(() => {
  const controller = new AbortController();
  setLoading(true);

  fetchProducts(category, { signal: controller.signal })
    .then(setProducts)
    .catch((e) => {
      if (e.name !== "AbortError") setError(e);
    })
    .finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

  return () => controller.abort();
}, [category]);
```

포인트가 두 개다.

- cleanup에서 `abort()`를 불러서 이전 요청을 끊는다. 의존성이 바뀌면 React가 cleanup을 먼저 실행해 주니까 자연스럽게 맞물린다.
- 취소된 요청은 `AbortError`로 reject된다. 이걸 에러 화면으로 보여주면 안 되니까 걸러야 한다. 처음에 이걸 빼먹어서 탭을 누를 때마다 에러 토스트가 떴다.

`finally`의 `aborted` 체크도 중요하다. 이걸 안 하면 옛날 요청의 finally가 새 요청의 로딩 상태를 꺼버린다.

## fetch 래퍼도 확인해야 한다

우리 `fetchProducts`는 내부에서 axios 비슷한 래퍼를 쓰고 있었는데, `signal`을 그대로 넘겨주지 않고 있었다. 호출부만 고치고 한참 "왜 취소가 안 되지" 하고 있었다. 래퍼 옵션 전달부에 `signal`을 한 줄 추가하고 나서야 정상 동작했다.

## 정리

- 응답은 보낸 순서대로 도착하지 않는다.
- effect 안의 비동기 요청에는 cleanup으로 취소나 무시 처리를 붙인다.
- 취소 에러는 에러로 취급하지 않는다.
- 래퍼 함수가 signal을 전달하는지 확인한다.

사실 이런 걸 매번 직접 짜는 게 번거로워서 요즘은 데이터 패칭 라이브러리를 쓰는 편이다. 그래도 한 번은 직접 겪어 봐야 라이브러리가 뭘 해주는지 보인다. 이번 버그가 딱 그 경험이었다.
