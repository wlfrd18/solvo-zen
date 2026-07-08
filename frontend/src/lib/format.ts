const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export function formatAmount(value: string | number): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  return currencyFormatter.format(numeric);
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
});

const dateFormatterWithYear = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(isoDate: string, withYear = false): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  return (withYear ? dateFormatterWithYear : dateFormatter).format(parsed);
}
