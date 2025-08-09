/**
 * Frontend Privacy Utilities
 * Ensures data privacy on the client side
 */

/**
 * Generate fresh display ID
 */
export const generateFreshId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'VERA-2024-';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

/**
 * Sanitize certificate data
 */
export const sanitizeCertificate = (cert) => {
  if (!cert) return null;
  
  return {
    displayId: generateFreshId(),
    brand: cert.brand,
    model: cert.model,
    productType: cert.productType,
    verifiedDate: new Date().toISOString(),
    status: 'VERIFIED',
    // NO history, NO owners, NO transfers
  };
};

/**
 * Sanitize NFT data
 */
export const sanitizeNFT = (nft) => {
  if (!nft) return null;
  
  return {
    displayId: generateFreshId(),
    tokenId: Math.floor(Math.random() * 100000),
    brand: nft.brand,
    model: nft.model,
    network: 'Polygon Amoy',
    status: 'ACTIVE',
    // NO real token ID, NO owner address, NO history
  };
};

/**
 * Clear sensitive data from localStorage
 */
export const clearSensitiveData = () => {
  const keysToRemove = [
    'walletAddress',
    'privateKey',
    'transactionHistory',
    'ownerHistory',
    'transferHistory',
    'userEmail',
    'userPhone',
    'sessionId',
    'trackingId'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potential XSS vectors
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Mask sensitive strings
 */
export const maskSensitive = (str, showChars = 4) => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= showChars * 2) return '****';
  
  const start = str.substring(0, showChars);
  const end = str.substring(str.length - showChars);
  return `${start}...${end}`;
};

/**
 * Privacy-safe error messages
 */
export const getSafeErrorMessage = (error) => {
  // Never expose technical details
  const genericMessages = {
    401: 'Authentication required',
    403: 'Access denied',
    404: 'Not found',
    429: 'Too many requests',
    500: 'Service temporarily unavailable'
  };
  
  if (error.response?.status) {
    return genericMessages[error.response.status] || 'An error occurred';
  }
  
  return 'An error occurred';
};

/**
 * Check if tracking is allowed
 */
export const isTrackingAllowed = () => {
  // Always return false for privacy
  return false;
};

/**
 * Privacy-safe analytics
 */
export const trackEvent = (category, action) => {
  if (!isTrackingAllowed()) return;
  
  // Only track anonymous events
  const event = {
    category,
    action,
    timestamp: Date.now(),
    // NO user identifiers
  };
  
  console.log('Analytics event (disabled):', event);
};

/**
 * Clear all user data on logout
 */
export const clearAllUserData = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  
  // Clear IndexedDB
  if ('indexedDB' in window) {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        indexedDB.deleteDatabase(db.name);
      });
    });
  }
};

/**
 * Disable right-click context menu
 */
export const disableContextMenu = () => {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
};

/**
 * Disable text selection
 */
export const disableTextSelection = () => {
  document.addEventListener('selectstart', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      return false;
    }
  });
};

/**
 * Prevent screenshots (limited effectiveness)
 */
export const preventScreenshots = () => {
  // Detect developer tools
  let devtools = { open: false, orientation: null };
  const threshold = 160;
  const emitEvent = (state, orientation) => {
    if (state) {
      console.clear();
      document.body.style.display = 'none';
    } else {
      document.body.style.display = 'block';
    }
  };
  
  setInterval(() => {
    if (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    ) {
      if (!devtools.open) {
        emitEvent(true, 'vertical');
        devtools.open = true;
      }
    } else {
      if (devtools.open) {
        emitEvent(false, null);
        devtools.open = false;
      }
    }
  }, 500);
};

/**
 * Initialize privacy protection
 */
export const initializePrivacy = () => {
  // Clear sensitive data on load
  clearSensitiveData();
  
  // Disable tracking
  window.doNotTrack = '1';
  window.globalPrivacyControl = '1';
  
  // Set privacy headers
  if (window.navigator && 'sendBeacon' in window.navigator) {
    const originalSendBeacon = window.navigator.sendBeacon;
    window.navigator.sendBeacon = () => false;
  }
  
  // Block common tracking pixels
  const blockTrackingPixels = () => {
    const images = document.getElementsByTagName('img');
    for (let img of images) {
      if (img.width === 1 && img.height === 1) {
        img.src = '';
        img.remove();
      }
    }
  };
  
  // Monitor for tracking pixels
  const observer = new MutationObserver(blockTrackingPixels);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Periodic cleanup
  setInterval(clearSensitiveData, 5 * 60 * 1000); // Every 5 minutes
};

export default {
  generateFreshId,
  sanitizeCertificate,
  sanitizeNFT,
  clearSensitiveData,
  sanitizeInput,
  maskSensitive,
  getSafeErrorMessage,
  isTrackingAllowed,
  trackEvent,
  clearAllUserData,
  disableContextMenu,
  disableTextSelection,
  preventScreenshots,
  initializePrivacy
};