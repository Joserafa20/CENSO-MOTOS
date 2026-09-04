export function formatCurrency(amount: number, currency = 'COP', locale = 'es-CO'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number, locale = 'es-CO'): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatPercentage(value: number, decimals = 1, locale = 'es-CO'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

export function formatFileSize(bytes: number, locale = 'es-CO'): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatPlate(plate: string): string {
  const normalized = plate.toUpperCase().replace(/\s/g, '');
  if (normalized.length === 6) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
  }
  return normalized;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    return `+57 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('573')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

export function formatDocument(document: string, type: 'CC' | 'CE' | 'PA' | 'TI' = 'CC'): string {
  const cleaned = document.replace(/\D/g, '');
  if (type === 'CC' && cleaned.length >= 6) {
    // Format: 1.234.567.890
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  return cleaned;
}