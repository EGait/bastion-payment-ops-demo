export function formatUsd(amount: number, currency: string = "USD"): string {
  if (currency === "USDC") {
    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} USDC`;
  }
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: currency === "EUR" ? "EUR" : "USD",
    minimumFractionDigits: currency === "EUR" || currency === "USD" ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

// Plain number, no currency symbol or suffix — for tables that already
// carry a dedicated currency column, so the amount isn't repeated per cell.
export function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// Signed amount with an explicit +/- so direction reads at a glance. Zero is
// rendered plain — "+0" and "-0" both look like bugs.
export function formatSigned(amount: number): string {
  if (amount === 0) return formatAmount(0);
  const sign = amount > 0 ? "+" : "-";
  return `${sign}${formatAmount(Math.abs(amount))}`;
}

export function formatCompactUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatAge(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const rem = minutes % 60;
    return rem ? `${hours}h ${rem}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
