import { CurrencyConfig } from '../types';

/**
 * Format currency with dynamic symbol and locale
 */
export function formatPKR(
  amount: number,
  showSymbol = true,
  currencyConfig?: CurrencyConfig,
  numberFormat?: 'lakh_crore' | 'international'
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount || 0);
  const locale = numberFormat === 'international' ? 'en-US' : 'en-PK';

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(absAmount);

  const prefix = isNegative ? '-' : '';
  if (!showSymbol) {
    return `${prefix}${formatted}`;
  }

  const symbol = currencyConfig?.symbol || 'Rs.';
  const isSuffix = currencyConfig?.position === 'suffix';

  if (isSuffix) {
    return `${prefix}${formatted} ${symbol}`;
  }
  return `${prefix}${symbol} ${formatted}`;
}

/**
 * Format full date with configurable format
 */
export function formatPakDate(
  dateInput: string | Date | number,
  formatStyle: 'DD-MM-YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' = 'DD-MM-YYYY'
): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (formatStyle === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }
  if (formatStyle === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  }
  return `${day}-${month}-${year}`;
}

/**
 * Format time in 12-hour format: hh:mm A
 */
export function formatPakTime(dateInput: string | Date | number): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');

  return `${strHours}:${minutes} ${ampm}`;
}

/**
 * Format date & time together
 */
export function formatPakDateTime(
  dateInput: string | Date | number,
  formatStyle: 'DD-MM-YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' = 'DD-MM-YYYY'
): string {
  return `${formatPakDate(dateInput, formatStyle)} ${formatPakTime(dateInput)}`;
}

/**
 * Convert Date to HTML datetime-local input string (YYYY-MM-DDTHH:mm)
 */
export function toDatetimeLocal(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
  if (!dateString) return false;
  const d = new Date(dateString);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

/**
 * Check if a date string is within the current month
 */
export function isThisMonth(dateString: string): boolean {
  if (!dateString) return false;
  const d = new Date(dateString);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

/**
 * Check if a date string is within the current year
 */
export function isThisYear(dateString: string): boolean {
  if (!dateString) return false;
  const d = new Date(dateString);
  const now = new Date();
  return d.getFullYear() === now.getFullYear();
}
