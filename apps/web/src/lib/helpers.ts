export function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

const koreanWeekdayFormatter = new Intl.DateTimeFormat("ko-KR", {
  weekday: "short",
  timeZone: "Asia/Seoul",
});

export function formatKoreanWeekday(date: string) {
  return koreanWeekdayFormatter.format(new Date(`${date}T00:00:00+09:00`));
}
