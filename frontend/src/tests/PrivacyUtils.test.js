/**
 * Frontend Privacy Utils Tests
 */

import {
  generateFreshId,
  sanitizeCertificate,
  sanitizeNFT,
  clearSensitiveData,
  sanitizeInput,
  maskSensitive,
  getSafeErrorMessage,
  isTrackingAllowed
} from '../utils/privacyUtils';

describe('Privacy Utils', () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('generateFreshId', () => {
    test('generates unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateFreshId());
      }
      expect(ids.size).toBe(100);
    });

    test('follows VERA-2024-XXXXXX format', () => {
      const id = generateFreshId();
      expect(id).toMatch(/^VERA-2024-[A-Z0-9]{6}$/);
    });

    test('generates different IDs on each call', () => {
      const id1 = generateFreshId();
      const id2 = generateFreshId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('sanitizeCertificate', () => {
    test('removes sensitive data from certificate', () => {
      const cert = {
        _id: 'mongodb_id',
        brand: 'Chanel',
        model: 'Classic Flap',
        serialNumber: 'CH123456',
        ownerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
        transferHistory: ['tx1', 'tx2'],
        previousOwners: ['owner1', 'owner2']
      };

      const sanitized = sanitizeCertificate(cert);

      expect(sanitized.displayId).toMatch(/^VERA-2024-/);
      expect(sanitized.brand).toBe('Chanel');
      expect(sanitized.model).toBe('Classic Flap');
      expect(sanitized.status).toBe('VERIFIED');
      expect(sanitized.verifiedDate).toBeDefined();
      expect(sanitized.serialNumber).toBeUndefined();
      expect(sanitized.ownerAddress).toBeUndefined();
      expect(sanitized.transferHistory).toBeUndefined();
      expect(sanitized.previousOwners).toBeUndefined();
    });

    test('handles null certificate', () => {
      expect(sanitizeCertificate(null)).toBeNull();
    });

    test('generates fresh ID each time', () => {
      const cert = { brand: 'Test', model: 'Model' };
      const s1 = sanitizeCertificate(cert);
      const s2 = sanitizeCertificate(cert);
      expect(s1.displayId).not.toBe(s2.displayId);
    });
  });

  describe('sanitizeNFT', () => {
    test('removes sensitive NFT data', () => {
      const nft = {
        tokenId: '12345',
        ownerAddress: '0x123abc',
        brand: 'Herm챔s',
        model: 'Birkin',
        txHash: '0xtx123',
        blockNumber: 1234567
      };

      const sanitized = sanitizeNFT(nft);

      expect(sanitized.displayId).toMatch(/^VERA-2024-/);
      expect(typeof sanitized.tokenId).toBe('number');
      expect(sanitized.tokenId).not.toBe(12345);
      expect(sanitized.brand).toBe('Herm챔s');
      expect(sanitized.model).toBe('Birkin');
      expect(sanitized.network).toBe('Polygon Amoy');
      expect(sanitized.status).toBe('ACTIVE');
      expect(sanitized.ownerAddress).toBeUndefined();
      expect(sanitized.txHash).toBeUndefined();
      expect(sanitized.blockNumber).toBeUndefined();
    });

    test('generates random token ID', () => {
      const nft = { brand: 'Test' };
      const s1 = sanitizeNFT(nft);
      const s2 = sanitizeNFT(nft);
      expect(s1.tokenId).not.toBe(s2.tokenId);
    });
  });

  describe('clearSensitiveData', () => {
    test('removes sensitive keys from localStorage', () => {
      localStorage.setItem('walletAddress', '0x123');
      localStorage.setItem('privateKey', 'key123');
      localStorage.setItem('safeData', 'keep this');

      clearSensitiveData();

      expect(localStorage.getItem('walletAddress')).toBeNull();
      expect(localStorage.getItem('privateKey')).toBeNull();
      expect(localStorage.getItem('safeData')).toBe('keep this');
    });

    test('removes sensitive keys from sessionStorage', () => {
      sessionStorage.setItem('transactionHistory', 'tx1,tx2');
      sessionStorage.setItem('userEmail', 'test@test.com');
      sessionStorage.setItem('theme', 'dark');

      clearSensitiveData();

      expect(sessionStorage.getItem('transactionHistory')).toBeNull();
      expect(sessionStorage.getItem('userEmail')).toBeNull();
      expect(sessionStorage.getItem('theme')).toBe('dark');
    });
  });

  describe('sanitizeInput', () => {
    test('removes script tags', () => {
      const input = 'Hello <script>alert("XSS")</script> World';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello  World');
    });

    test('removes iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>Content';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Content');
    });

    test('removes javascript: protocol', () => {
      // eslint-disable-next-line no-script-url
      const input = 'Click <a href="javascript:alert(1)">here</a>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('javascript:');
    });

    test('removes event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('onclick');
    });

    test('handles non-string input', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe('maskSensitive', () => {
    test('masks middle portion of string', () => {
      const masked = maskSensitive('1234567890', 2);
      expect(masked).toBe('12...90');
    });

    test('masks entire short string', () => {
      const masked = maskSensitive('123', 2);
      expect(masked).toBe('****');
    });

    test('handles empty string', () => {
      expect(maskSensitive('')).toBe('');
    });

    test('handles null/undefined', () => {
      expect(maskSensitive(null)).toBe('');
      expect(maskSensitive(undefined)).toBe('');
    });

    test('uses default show chars', () => {
      const masked = maskSensitive('abcdefghijklmnop');
      expect(masked).toBe('abcd...mnop');
    });
  });

  describe('getSafeErrorMessage', () => {
    test('returns generic message for known status codes', () => {
      const errors = [
        { response: { status: 401 }, expected: 'Authentication required' },
        { response: { status: 403 }, expected: 'Access denied' },
        { response: { status: 404 }, expected: 'Not found' },
        { response: { status: 429 }, expected: 'Too many requests' },
        { response: { status: 500 }, expected: 'Service temporarily unavailable' }
      ];

      errors.forEach(({ response, expected }) => {
        expect(getSafeErrorMessage({ response })).toBe(expected);
      });
    });

    test('returns generic message for unknown status', () => {
      const error = { response: { status: 418 } }; // I'm a teapot
      expect(getSafeErrorMessage(error)).toBe('An error occurred');
    });

    test('returns generic message for no response', () => {
      expect(getSafeErrorMessage({})).toBe('An error occurred');
      expect(getSafeErrorMessage({ message: 'Network error' })).toBe('An error occurred');
    });
  });

  describe('isTrackingAllowed', () => {
    test('always returns false for privacy', () => {
      expect(isTrackingAllowed()).toBe(false);
      
      // Even if we try to enable tracking
      window.doNotTrack = '0';
      expect(isTrackingAllowed()).toBe(false);
    });
  });
});

describe('Storage Security', () => {
  test('clearAllUserData clears all storage', () => {
    // Set data in various storages
    localStorage.setItem('test', 'value');
    sessionStorage.setItem('test', 'value');
    document.cookie = 'test=value';

    // Mock IndexedDB
    const mockDeleteDatabase = jest.fn();
    global.indexedDB = {
      databases: () => Promise.resolve([{ name: 'testDB' }]),
      deleteDatabase: mockDeleteDatabase
    };

    const { clearAllUserData } = require('../utils/privacyUtils');
    clearAllUserData();

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).toBe('');
  });
});

describe('Privacy Protection', () => {
  test('tracking prevention', () => {
    const { trackEvent } = require('../utils/privacyUtils');
    
    // Mock console.log to check if events are logged
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    trackEvent('test', 'action');
    
    // Should not log anything since tracking is disabled
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('disables context menu', () => {
    const { disableContextMenu } = require('../utils/privacyUtils');
    
    const preventDefault = jest.fn();
    const event = new MouseEvent('contextmenu');
    event.preventDefault = preventDefault;
    
    disableContextMenu();
    document.dispatchEvent(event);
    
    expect(preventDefault).toHaveBeenCalled();
  });

  test('disables text selection', () => {
    const { disableTextSelection } = require('../utils/privacyUtils');
    
    const preventDefault = jest.fn();
    const event = new Event('selectstart');
    event.preventDefault = preventDefault;
    event.target = { tagName: 'DIV' };
    
    disableTextSelection();
    document.dispatchEvent(event);
    
    expect(preventDefault).toHaveBeenCalled();
  });

  test('allows text selection in input fields', () => {
    const { disableTextSelection } = require('../utils/privacyUtils');
    
    const preventDefault = jest.fn();
    const event = new Event('selectstart');
    event.preventDefault = preventDefault;
    event.target = { tagName: 'INPUT' };
    
    disableTextSelection();
    document.dispatchEvent(event);
    
    expect(preventDefault).not.toHaveBeenCalled();
  });
});

describe('Privacy Initialization', () => {
  test('sets privacy flags', () => {
    const { initializePrivacy } = require('../utils/privacyUtils');
    
    initializePrivacy();
    
    expect(window.doNotTrack).toBe('1');
    expect(window.globalPrivacyControl).toBe('1');
  });

  test('blocks navigator.sendBeacon', () => {
    const originalSendBeacon = window.navigator.sendBeacon;
    window.navigator.sendBeacon = jest.fn();
    
    const { initializePrivacy } = require('../utils/privacyUtils');
    initializePrivacy();
    
    const result = window.navigator.sendBeacon('url', 'data');
    expect(result).toBe(false);
    
    window.navigator.sendBeacon = originalSendBeacon;
  });
});
