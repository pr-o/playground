export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function formatPrice(price: number) {
  if (price >= 100) {
    return formatNumber(price, { maximumFractionDigits: 0 });
  }
  if (price >= 1) {
    return formatNumber(price, { maximumFractionDigits: 2 });
  }
  return price.toFixed(4);
}

export function formatPercentage(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatTradeTime(timestamp: number) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

export function formatDateLabel(dateIso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dateIso));
}
