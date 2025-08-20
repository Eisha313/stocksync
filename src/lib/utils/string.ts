/**
 * String utility functions for text manipulation and formatting
 */

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str.split(' ').map(capitalize).join(' ');
}

export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateSku(name: string, category?: string): string {
  const prefix = category ? category.slice(0, 3).toUpperCase() : 'PRD';
  const namePart = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${namePart}-${random}`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const pluralForm = plural || `${singular}s`;
  return count === 1 ? singular : pluralForm;
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  
  const maskedLocal = local.length > 2
    ? `${local.charAt(0)}${'*'.repeat(local.length - 2)}${local.charAt(local.length - 1)}`
    : '*'.repeat(local.length);
  
  return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '*'.repeat(digits.length);
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
}
