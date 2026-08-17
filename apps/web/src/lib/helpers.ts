function getLocale(language?: string) {
  return language?.startsWith("en") ? "en-US" : "ko-KR";
}

export function formatTime(value: string, language?: string) {
  return new Intl.DateTimeFormat(getLocale(language), {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function formatWeekday(date: string, language?: string) {
  return new Intl.DateTimeFormat(getLocale(language), {
    weekday: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(`${date}T00:00:00+09:00`));
}

export function formatMonthDay(value: string, language?: string) {
  const parts = new Intl.DateTimeFormat(getLocale(language), {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));

  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${month ?? "--"}-${day ?? "--"}`;
}

export function formatNumber(
  value: number,
  language?: string,
  maximumFractionDigits = 1,
) {
  return new Intl.NumberFormat(getLocale(language), {
    maximumFractionDigits,
  }).format(value);
}
