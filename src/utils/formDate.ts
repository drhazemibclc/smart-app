export function formatDate(
  date: Date | string | number,
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(
    locale,
    options ?? {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(d);
}
