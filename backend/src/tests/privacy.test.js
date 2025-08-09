/**
 * Privacy Protection Tests
 * Ensures NO sensitive data is ever exposed
 */

const { 
  deepClean, 
  generateFreshId, 
  sanitizeCertificate, 
  sanitizeNFT 
} = require('../middleware/privacyProtection');

describe('Privacy Protection', () => {
  describe('Deep Clean', () => {
    test('should remove all private fields', () => {
      const dirty = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
        privateKey: '0xprivatekey123',
        transferHistory: ['tx1', 'tx2'],
        previousOwners: ['owner1', 'owner2'],
        publicData: 'This is public'
      };
      
      const cleaned = deepClean(dirty);
      
      expect(cleaned.name).toBe('Test User');
      expect(cleaned.publicData).toBe('This is public');
      expect(cleaned.email).toBeUndefined();
      expect(cleaned.password).toBeUndefined();
      expect(cleaned.walletAddress).toBeUndefined();
      expect(cleaned.privateKey).toBeUndefined();
      expect(cleaned.transferHistory).toBeUndefined();
      expect(cleaned.previousOwners).toBeUndefined();
    });
    
    test('should remove fields starting with underscore', () => {
      const dirty = {
        publicField: 'public',
        _privateField: 'private',
        _id: 'mongodb_id',
        __internal: 'internal'
      };
      
      const cleaned = deepClean(dirty);
      
      expect(cleaned.publicField).toBe('public');
      expect(cleaned._privateField).toBeUndefined();
      expect(cleaned._id).toBeUndefined();
      expect(cleaned.__internal).toBeUndefined();
    });
    
    test('should sanitize sensitive patterns in strings', () => {
      const dirty = {
        description: 'Wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8 transferred',
        serial: 'Serial: ABC12345678',
        certNumber: 'CERT-2024-123456'
      };
      
      const cleaned = deepClean(dirty);
      
      expect(cleaned.description).toContain('[REDACTED]');
      expect(cleaned.serial).toContain('[REDACTED]');
      expect(cleaned.certNumber).toContain('[REDACTED]');
    });
    
    test('should handle nested objects', () => {
      const dirty = {
        user: {
          name: 'Test',
          wallet: {
            address: '0x123',
            privateKey: '0xabc'
          }
        },
        product: {
          brand: 'Chanel',
          serialNumber: '12345'
        }
      };
      
      const cleaned = deepClean(dirty);
      
      expect(cleaned.user.name).toBe('Test');
      expect(cleaned.user.wallet).toBeUndefined();
      expect(cleaned.product.brand).toBe('Chanel');
      expect(cleaned.product.serialNumber).toBeUndefined();
    });
    
    test('should handle arrays', () => {
      const dirty = [
        { name: 'Item 1', privateKey: 'key1' },
        { name: 'Item 2', walletAddress: '0x123' }
      ];
      
      const cleaned = deepClean(dirty);
      
      expect(cleaned[0].name).toBe('Item 1');
      expect(cleaned[0].privateKey).toBeUndefined();
      expect(cleaned[1].name).toBe('Item 2');
      expect(cleaned[1].walletAddress).toBeUndefined();
    });
  });
  
  describe('Fresh ID Generation', () => {
    test('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateFreshId());
      }
      
      expect(ids.size).toBe(1000); // All unique
    });
    
    test('should follow correct format', () => {
      const id = generateFreshId();
      
      expect(id).toMatch(/^VERA-2024-[A-Z0-9]{6}$/);
    });
    
    test('should generate different IDs each time', () => {
      const id1 = generateFreshId();
      const id2 = generateFreshId();
      const id3 = generateFreshId();
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });
  
  describe('Certificate Sanitization', () => {
    test('should sanitize certificate data', () => {
      const cert = {
        _id: 'mongodb_id',
        brand: 'Hermès',
        model: 'Birkin 35',
        serialNumber: 'HER123456',
        previousOwners: ['owner1', 'owner2'],
        transferHistory: ['tx1', 'tx2'],
        blockchainTx: '0xabc123'
      };
      
      const sanitized = sanitizeCertificate(cert);
      
      expect(sanitized.displayId).toMatch(/^VERA-2024-/);
      expect(sanitized.brand).toBe('Hermès');
      expect(sanitized.model).toBe('Birkin 35');
      expect(sanitized.status).toBe('VERIFIED');
      expect(sanitized.verifiedDate).toBeDefined();
      expect(sanitized.serialNumber).toBeUndefined();
      expect(sanitized.previousOwners).toBeUndefined();
      expect(sanitized.transferHistory).toBeUndefined();
      expect(sanitized.blockchainTx).toBeUndefined();
    });
    
    test('should handle null certificate', () => {
      const sanitized = sanitizeCertificate(null);
      expect(sanitized).toBeNull();
    });
    
    test('should always generate fresh display ID', () => {
      const cert = { brand: 'Chanel', model: 'Classic' };
      
      const sanitized1 = sanitizeCertificate(cert);
      const sanitized2 = sanitizeCertificate(cert);
      
      expect(sanitized1.displayId).not.toBe(sanitized2.displayId);
    });
  });
  
  describe('NFT Sanitization', () => {
    test('should sanitize NFT data', () => {
      const nft = {
        tokenId: '12345',
        ownerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
        brand: 'Rolex',
        model: 'Submariner',
        txHash: '0xtransaction123',
        previousOwners: ['0x111', '0x222']
      };
      
      const sanitized = sanitizeNFT(nft);
      
      expect(sanitized.displayId).toMatch(/^VERA-2024-/);
      expect(typeof sanitized.tokenId).toBe('number');
      expect(sanitized.tokenId).not.toBe(12345); // Different from real
      expect(sanitized.brand).toBe('Rolex');
      expect(sanitized.model).toBe('Submariner');
      expect(sanitized.network).toBe('Polygon Amoy');
      expect(sanitized.status).toBe('ACTIVE');
      expect(sanitized.ownerAddress).toBeUndefined();
      expect(sanitized.txHash).toBeUndefined();
      expect(sanitized.previousOwners).toBeUndefined();
    });
    
    test('should generate random display token ID', () => {
      const nft = { brand: 'Cartier', model: 'Tank' };
      
      const sanitized1 = sanitizeNFT(nft);
      const sanitized2 = sanitizeNFT(nft);
      
      expect(sanitized1.tokenId).not.toBe(sanitized2.tokenId);
    });
  });
});

describe('Privacy Headers', () => {
  test('should set correct privacy headers', () => {
    const headers = {
      'X-Privacy-Protected': 'true',
      'X-No-History': 'true',
      'X-Fresh-ID': 'true',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private'
    };
    
    Object.entries(headers).forEach(([key, value]) => {
      expect(headers[key]).toBe(value);
    });
  });
});

describe('Sensitive Pattern Detection', () => {
  test('should detect Ethereum addresses', () => {
    const patterns = [
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
      '0x0000000000000000000000000000000000000000',
      '0xaBcDeF1234567890aBcDeF1234567890aBcDeF12'
    ];
    
    patterns.forEach(pattern => {
      const cleaned = deepClean({ data: pattern });
      expect(cleaned.data).toContain('[REDACTED]');
    });
  });
  
  test('should detect private keys and hashes', () => {
    const patterns = [
      'a'.repeat(64), // 64 hex chars
      '0x' + 'f'.repeat(64),
      'ABC123DEF456' + '7'.repeat(52)
    ];
    
    patterns.forEach(pattern => {
      const cleaned = deepClean({ data: pattern });
      expect(cleaned.data).toContain('[REDACTED]');
    });
  });
  
  test('should detect serial numbers', () => {
    const patterns = [
      'ABC12345678',
      'SERIAL90123456',
      'XYZ987654321'
    ];
    
    patterns.forEach(pattern => {
      const cleaned = deepClean({ data: pattern });
      expect(cleaned.data).toContain('[REDACTED]');
    });
  });
});

describe('Edge Cases', () => {
  test('should handle circular references', () => {
    const obj = { name: 'Test' };
    obj.circular = obj; // Create circular reference
    
    const cleaned = deepClean(obj);
    expect(cleaned.name).toBe('Test');
    // Should not crash
  });
  
  test('should handle very deep nesting', () => {
    let deep = { value: 'bottom' };
    for (let i = 0; i < 20; i++) {
      deep = { nested: deep, privateKey: 'key' + i };
    }
    
    const cleaned = deepClean(deep);
    expect(cleaned.privateKey).toBeUndefined();
    // Should stop at depth limit
  });
  
  test('should handle special JavaScript objects', () => {
    const special = {
      date: new Date(),
      regex: /test/g,
      func: () => 'function',
      undef: undefined,
      nil: null,
      num: 123,
      bool: true
    };
    
    const cleaned = deepClean(special);
    
    expect(cleaned.date).toBeDefined();
    expect(cleaned.regex).toBeDefined();
    expect(cleaned.func).toBeDefined();
    expect(cleaned.undef).toBeUndefined();
    expect(cleaned.nil).toBeNull();
    expect(cleaned.num).toBe(123);
    expect(cleaned.bool).toBe(true);
  });
});

module.exports = {
  // Export for use in other tests
};