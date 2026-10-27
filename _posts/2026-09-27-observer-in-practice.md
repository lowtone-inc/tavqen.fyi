---
title: "2026.09.27 - 옵저버 패턴을 실무에서 처음 제대로 쓴 날"
description: "알림 배지, 헤더, 설정 화면이 같은 상태를 보게 되면서 직접 만든 작은 이벤트 구독 구조와 그 한계를 정리했다."
date: 2026-09-27 22:10:00 +0900
categories: [개발 로그]
tags: [javascript, 디자인패턴, observer, 리팩토링]
---

디자인 패턴은 책으로 읽을 때와 실무에서 필요해질 때의 거리가 꽤 멀다. 옵저버 패턴도 그랬다. 이름은 알고 있었는데 "이걸 쓰면 되겠다"가 떠오른 건 이번 주였다.

## 문제 상황

읽지 않은 알림 개수가 세 군데에 표시된다. 헤더 배지, 사이드바 메뉴, 브라우저 탭 제목이다. 이 숫자를 각자 API로 조회하고 있었다. 그래서 알림 페이지에서 하나를 읽음 처리해도 헤더 배지는 한참 뒤에야 바뀌었다.

처음엔 부모 컴포넌트에서 props로 내려주려고 했다. 그런데 세 군데가 트리상 서로 멀었다. 중간 컴포넌트 네 개를 거쳐야 해서 포기했다.

## 직접 만든 작은 스토어

상태 라이브러리를 새로 들이기엔 범위가 작았다. 그래서 구독 가능한 값 하나를 만들었다.

```js
export function createStore(initial) {
  let value = initial;
  const listeners = new Set();

  return {
    get: () => value,
    set(next) {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((fn) => fn(value));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export const unreadCount = createStore(0);
```

핵심은 `subscribe`가 구독 해제 함수를 돌려준다는 점이다. 해제 방법을 따로 외울 필요가 없고, React의 effect cleanup과 모양이 딱 맞는다.

## 컴포넌트에서 쓰기

React 18의 `useSyncExternalStore`를 쓰면 외부 스토어를 안전하게 읽을 수 있다.

```jsx
import { useSyncExternalStore } from "react";
import { unreadCount } from "./store";

export function useUnreadCount() {
  return useSyncExternalStore(unreadCount.subscribe, unreadCount.get);
}
```

이제 헤더, 사이드바, 탭 제목 훅이 모두 `useUnreadCount()`를 부른다. 알림 페이지에서 `unreadCount.set(n - 1)`을 하면 세 군데가 동시에 바뀐다.

> `useSyncExternalStore`에 넘기는 `get`은 값이 같으면 같은 참조를 돌려줘야 한다. 객체를 매번 새로 만들어 돌려주면 무한 렌더링에 빠진다.
{: .prompt-warning }

## 쓰면서 겪은 문제

- **해제 누락**: 컴포넌트가 사라져도 구독이 남으면 메모리가 샌다. 훅으로 감싸서 해제가 자동으로 되게 한 이유다.
- **순서 의존**: 구독자 호출 순서에 기대는 코드를 짜기 시작하면 위험하다. 구독자끼리는 서로 모른다는 전제를 지켜야 한다.
- **디버깅**: 값이 어디서 바뀌었는지 추적하기 어렵다. 그래서 `set`을 부르는 곳을 알림 도메인 파일 하나로 제한했다.

## 한계

이 구조는 값이 하나일 때 좋다. 값이 늘고 서로 의존하기 시작하면 직접 만든 스토어가 점점 라이브러리를 닮아 간다. 그 지점이 오면 미련 없이 검증된 걸로 갈아탈 생각이다.

패턴을 쓰는 목적은 이름을 붙이는 게 아니라 결합을 줄이는 거라는 걸 이번에 체감했다. 알림을 읽는 쪽은 헤더가 있는지도 모른다. 그게 이 패턴의 전부이자 가치였다.
