/**
 * vCard related utility functions
 */

export interface ContactConfig {
  name: string;
  phone?: string;
  email?: string;
  org?: string;
  url?: string;
}

/**
 * Generate a vCard string (Version 3.0)
 */
export function generateVCard(contact: ContactConfig): string {
  const { name, phone, email, org, url } = contact;
  if (!name && !phone && !email) return '';

  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${name || ''}`, `FN:${name || ''}`];

  if (org) lines.push(`ORG:${org}`);
  if (phone) lines.push(`TEL:${phone}`);
  if (email) lines.push(`EMAIL:${email}`);
  if (url) lines.push(`URL:${url}`);

  lines.push('END:VCARD');

  return lines.join('\n');
}
