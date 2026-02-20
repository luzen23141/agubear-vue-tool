import { describe, it, expect } from 'vitest';
import { generateWifiString } from '../../utils/qrcode';

describe('qrcode utils', () => {
  describe('generateWifiString', () => {
    it('should return empty string if SSID is empty', () => {
      expect(generateWifiString({ ssid: '', encryption: 'WPA' })).toBe('');
    });

    it('should generate correct WIFI string with password', () => {
      const config = {
        ssid: 'MyHome',
        encryption: 'WPA',
        // eslint-disable-next-line sonarjs/no-hardcoded-passwords
        password: 'NOT_A_REAL_PASSWORD',
        hidden: false
      };
      expect(generateWifiString(config)).toBe(
        'WIFI:T:WPA;S:MyHome;P:NOT_A_REAL_PASSWORD;H:false;;'
      );
    });

    it('should handle hidden network', () => {
      const config = {
        ssid: 'SecretSSID',
        encryption: 'WPA2',
        // eslint-disable-next-line sonarjs/no-hardcoded-passwords
        password: 'NOT_A_REAL_PASSWORD',
        hidden: true
      };
      expect(generateWifiString(config)).toBe(
        'WIFI:T:WPA2;S:SecretSSID;P:NOT_A_REAL_PASSWORD;H:true;;'
      );
    });

    it('should handle no password (nopass)', () => {
      const config = {
        ssid: 'PublicWiFi',
        encryption: 'nopass',
        hidden: false
      };
      expect(generateWifiString(config)).toBe('WIFI:T:nopass;S:PublicWiFi;P:;H:false;;');
    });
  });
});
