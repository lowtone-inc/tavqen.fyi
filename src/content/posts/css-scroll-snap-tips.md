---
title: '2026.10.11 - CSS scroll-snap으로 캐러셀 만들면서 알게 된 것들'
description: 'JS 없이 가로 슬라이더를 만들 때 필요한 scroll-snap 속성과 직접 부딪힌 함정들. 패딩, 끝 정렬, 모바일 관성 스크롤 이야기.'
pubDate: 2026-10-11T19:30:00+09:00
category: '디자인 노트'
tags: [css, scroll-snap, 캐러셀, 프론트엔드]
featured: false
draft: false
---

가로로 넘기는 카드 목록을 만들 일이 있었다. 예전 같으면 슬라이더 라이브러리부터 설치했을 텐데, 이번엔 CSS만으로 해 봤다. 생각보다 잘 됐고, 생각보다 함정도 있었다.

## 기본 뼈대

필요한 건 컨테이너 쪽 속성 두 개와 아이템 쪽 속성 하나다.

```css
.rail {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.rail > .card {
  flex: 0 0 80%;
  scroll-snap-align: start;
}
```

이것만으로 손가락으로 밀면 카드가 딱딱 맞춰서 멈춘다. JS가 한 줄도 없다.

`mandatory` 대신 `proximity`를 쓰면 가까울 때만 맞춰 준다. 카드가 길어서 중간에 멈추고 싶은 경우가 아니라면 `mandatory`가 일관돼 보인다.

## 함정 1. 첫 카드가 왼쪽 끝에 딱 붙는다

스냅 지점이 컨테이너 가장자리라서, 화면 좌우에 여백을 주려고 `padding-left`를 넣으면 스냅할 때 여백이 날아간다. 이럴 때는 `scroll-padding`을 쓴다.

```css
.rail {
  padding-inline: 16px;
  scroll-padding-inline: 16px;
}
```

`padding`은 눈에 보이는 여백이고, `scroll-padding`은 스냅 기준선의 여백이다. 둘을 같이 맞춰야 한다. 이걸 몰라서 카드가 16px씩 계속 어긋나 보였다.

## 함정 2. 마지막 카드가 끝까지 안 온다

카드 폭이 80%라서 마지막 카드는 스냅해도 오른쪽에 빈 공간이 남는다. 이건 정상이다. 마지막 카드를 왼쪽에 맞추려면 그 뒤에 공간이 더 있어야 하는데 없기 때문이다. 나는 일부러 `scroll-snap-align: end`를 마지막 카드에만 주는 방법을 썼다.

```css
.rail > .card:last-child {
  scroll-snap-align: end;
}
```

## 함정 3. 카드 안의 링크와 터치

카드 전체를 링크로 만들면 스크롤하려고 밀 때 클릭으로 인식되는 경우가 있다. 브라우저가 대부분 알아서 구분해 주지만, 카드 안에 `draggable` 이미지가 있으면 이미지 드래그가 스크롤을 가로챈다. 이미지에 `-webkit-user-drag: none`을 주거나 `draggable="false"`를 달아서 해결했다.

## 스크롤바 숨기기

디자인상 스크롤바가 거슬려서 숨겼다.

```css
.rail {
  scrollbar-width: none;
}
.rail::-webkit-scrollbar {
  display: none;
}
```

<div class="prompt prompt-warning">

스크롤바를 숨기면 데스크톱 마우스 사용자는 가로로 넘길 수 있다는 걸 알 수 없다. 화살표 버튼이나 다음 카드가 살짝 보이게 하는 처리를 같이 하자.

</div>

그래서 카드 폭을 100%가 아니라 80%로 둔 것도 이유가 있다. 다음 카드가 20% 정도 삐죽 보이면 "넘길 수 있구나"가 자연스럽게 전달된다.

## 접근성 한 가지

키보드로 카드 안의 링크에 탭 이동을 하면 브라우저가 해당 카드로 자동 스크롤한다. 스냅과 같이 잘 동작한다. 다만 컨테이너가 스크롤 가능하다는 걸 스크린 리더에 알리려면 `tabindex="0"`과 적절한 `aria-label`을 주는 편이 좋다.

## 정리

- 기본은 `scroll-snap-type`, `scroll-snap-align` 두 개면 끝
- 여백이 필요하면 `padding`과 `scroll-padding`을 같이 맞춘다
- 마지막 아이템은 `end` 정렬을 고려한다
- 스크롤바를 숨기면 다음 카드를 살짝 보여 준다

라이브러리 하나를 덜 쓰게 된 것도 좋지만, 모바일에서 관성 스크롤과 스냅이 네이티브처럼 부드럽게 맞물리는 게 제일 만족스러웠다.
