import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Advertisement service with time-based rotation
 * Anonymous tracking, no user data
 */
export const adsService = {
  /**
   * Get current ads based on time slot
   */
  async getCurrentAds() {
    try {
      const response = await axios.get(`${API_BASE_URL}/ads/current`);
      
      // Ensure ads are returned as array
      const ads = Array.isArray(response.data.ads) 
        ? response.data.ads 
        : response.data.ad 
        ? [response.data.ad]
        : [];
      
      return {
        success: true,
        ads: ads.map(ad => ({
          id: ad._id || ad.id || Math.random().toString(36).substr(2, 9),
          brand: ad.brand,
          title: ad.title,
          mediaUrl: ad.mediaUrl,
          mediaType: ad.mediaType || 'video',
          cta: ad.cta || 'Learn More',
          link: ad.link
        }))
      };
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      return {
        success: false,
        error: 'Failed to fetch advertisements',
        ads: []
      };
    }
  },

  /**
   * Get ad schedule for the day
   */
  async getSchedule() {
    try {
      const response = await axios.get(`${API_BASE_URL}/ads/schedule`);
      
      return {
        success: true,
        schedule: response.data.schedule,
        currentHour: response.data.currentHour
      };
    } catch (error) {
      console.error('Failed to fetch ad schedule:', error);
      return {
        success: false,
        error: 'Failed to fetch schedule'
      };
    }
  },

  /**
   * Track ad impression (anonymous)
   */
  async trackImpression(adId) {
    try {
      await axios.post(`${API_BASE_URL}/ads/impression`, {
        adId
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to track impression:', error);
      return { success: false };
    }
  },

  /**
   * Track ad click (anonymous)
   */
  async trackClick(adId) {
    try {
      await axios.post(`${API_BASE_URL}/ads/click`, {
        adId
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to track click:', error);
      return { success: false };
    }
  },

  /**
   * Get time-based ad rotation
   */
  getTimeBasedAd(ads) {
    if (!ads || ads.length === 0) return null;
    
    const currentHour = new Date().getHours();
    
    // Morning (6-12): Luxury watches
    // Afternoon (12-18): Handbags
    // Evening (18-24): Jewelry
    // Night (0-6): Mixed
    
    let filteredAds = ads;
    
    if (currentHour >= 6 && currentHour < 12) {
      // Morning - prioritize watches
      filteredAds = ads.filter(ad => 
        ad.brand.toLowerCase().includes('rolex') || 
        ad.brand.toLowerCase().includes('patek') ||
        ad.brand.toLowerCase().includes('omega')
      );
    } else if (currentHour >= 12 && currentHour < 18) {
      // Afternoon - prioritize handbags
      filteredAds = ads.filter(ad => 
        ad.brand.toLowerCase().includes('chanel') || 
        ad.brand.toLowerCase().includes('herm챔s') ||
        ad.brand.toLowerCase().includes('louis')
      );
    } else if (currentHour >= 18 && currentHour < 24) {
      // Evening - prioritize jewelry
      filteredAds = ads.filter(ad => 
        ad.brand.toLowerCase().includes('cartier') || 
        ad.brand.toLowerCase().includes('tiffany') ||
        ad.brand.toLowerCase().includes('bulgari')
      );
    }
    
    // If no filtered ads, use all ads
    if (filteredAds.length === 0) {
      filteredAds = ads;
    }
    
    // Return random ad from filtered list
    return filteredAds[Math.floor(Math.random() * filteredAds.length)];
  },

  /**
   * Format ad for display
   */
  formatAd(ad) {
    return {
      id: ad.id || ad._id,
      brand: ad.brand,
      title: ad.title || `${ad.brand} Collection`,
      mediaUrl: ad.mediaUrl,
      mediaType: ad.mediaType || 'video',
      cta: ad.cta || 'Discover More',
      displayTime: new Date().toISOString(),
      // NO user tracking data
    };
  },

  /**
   * Get default ads for fallback
   */
  getDefaultAds() {
    return [
      {
        id: 'default-1',
        brand: 'Chanel',
        title: 'Timeless Elegance',
        mediaUrl: '/assets/ads/chanel_ad.mp4',
        mediaType: 'video',
        cta: 'Explore Collection'
      },
      {
        id: 'default-2',
        brand: 'Herm챔s',
        title: 'Crafted Excellence',
        mediaUrl: '/assets/ads/hermes_ad.mp4',
        mediaType: 'video',
        cta: 'View Heritage'
      },
      {
        id: 'default-3',
        brand: 'Rolex',
        title: 'Perpetual Innovation',
        mediaUrl: '/assets/ads/rolex_ad.mp4',
        mediaType: 'video',
        cta: 'Discover Timepieces'
      },
      {
        id: 'default-4',
        brand: 'Louis Vuitton',
        title: 'Journey of Style',
        mediaUrl: '/assets/ads/lv_ad.mp4',
        mediaType: 'video',
        cta: 'Shop Now'
      },
      {
        id: 'default-5',
        brand: 'Cartier',
        title: 'Maison of Luxury',
        mediaUrl: '/assets/ads/cartier_ad.mp4',
        mediaType: 'video',
        cta: 'Explore Jewelry'
      }
    ];
  },

  /**
   * Check if ad should be shown based on time
   */
  shouldShowAd(ad) {
    if (!ad.timeSlots || ad.timeSlots.length === 0) {
      return true; // Always show if no time slots specified
    }
    
    const currentHour = new Date().getHours();
    
    return ad.timeSlots.some(slot => {
      if (slot.start <= slot.end) {
        return currentHour >= slot.start && currentHour <= slot.end;
      } else {
        // Handle overnight slots (e.g., 22:00 - 02:00)
        return currentHour >= slot.start || currentHour <= slot.end;
      }
    });
  }
};

export default adsService;
