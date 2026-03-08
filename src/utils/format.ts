const takaNumberFormatter = new Intl.NumberFormat("en-BD", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const digits = takaNumberFormatter.format(safeValue).replace(/\u00A0/g, " ");
  return `৳ ${digits}`.replace(/\s+/g, " ").trim();
}
