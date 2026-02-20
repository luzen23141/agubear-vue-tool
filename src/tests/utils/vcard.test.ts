import { describe, it, expect } from 'vitest';
import { generateVCard } from '../../utils/vcard';

describe('vcard utils', () => {
  describe('generateVCard', () => {
    it('should return empty string if mandatory fields are missing', () => {
      expect(generateVCard({ name: '', phone: '', email: '' })).toBe('');
    });

    it('should generate a basic vCard with only name', () => {
      const vcard = generateVCard({ name: 'John Doe' });
      expect(vcard).toContain('BEGIN:VCARD');
      expect(vcard).toContain('VERSION:3.0');
      expect(vcard).toContain('N:John Doe');
      expect(vcard).toContain('FN:John Doe');
      expect(vcard).toContain('END:VCARD');
    });

    it('should generate a full vCard', () => {
      const config = {
        name: 'Jane Smith',
        org: 'Tech Corp',
        phone: '12345678',
        email: 'jane@example.com',
        url: 'https://jane.me'
      };
      const vcard = generateVCard(config);
      expect(vcard).toContain('ORG:Tech Corp');
      expect(vcard).toContain('TEL:12345678');
      expect(vcard).toContain('EMAIL:jane@example.com');
      expect(vcard).toContain('URL:https://jane.me');
    });

    it('should handle partial fields correctly', () => {
      const vcard = generateVCard({ name: 'Only Name', email: 'only@email.com' });
      expect(vcard).toContain('N:Only Name');
      expect(vcard).toContain('EMAIL:only@email.com');
      expect(vcard).not.toContain('ORG:');
      expect(vcard).not.toContain('TEL:');
    });
  });
});
