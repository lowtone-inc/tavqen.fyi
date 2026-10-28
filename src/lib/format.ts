import { SITE } from '@/config';

// 빌드 서버(UTC)에서도 한국 날짜로 표시되도록 시간대를 고정한다.
const dateFormatter = new Intl.DateTimeFormat(SITE.locale, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Seoul',
});

export const formatDate = (date: Date) => dateFormatter.format(date);
export const isoDate = (date: Date) => date.toISOString();

// 한국어 글은 공백 단위 단어 수가 적게 잡히므로 글자 수 기준으로 계산한다.
const CHARS_PER_MINUTE = 500;

export function readingTime(text = ''): string {
  const chars = text.replace(/\s+/g, '').length;
  return `${Math.max(1, Math.round(chars / CHARS_PER_MINUTE))}분 읽기`;
}
