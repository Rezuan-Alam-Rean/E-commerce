const takaFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number) {
  const raw = takaFormatter.format(value);
  return raw.replace(/\u09F3/g, "Tk").replace(/\u00A0/g, " ");
}
