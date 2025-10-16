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

export function formatDurationMs(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatPlayCount(count: number) {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return formatNumber(count, { maximumFractionDigits: 0 });
}

export function formatRelativeDate(dateIso: string) {
  const date = new Date(dateIso);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
