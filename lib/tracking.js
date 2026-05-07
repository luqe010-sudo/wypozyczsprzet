import { createClient } from '@/utils/supabase/client';

/**
 * Tracks a view for a specific equipment listing.
 * Implements 30-minute throttling using sessionStorage.
 * 
 * @param {string} equipmentId - The UUID of the equipment.
 * @param {boolean} isAdmin - Whether the current user is an admin (to ignore).
 */
export async function trackView(equipmentId, isAdmin = false) {
  if (isAdmin) return;
  if (!equipmentId) return;

  // Basic bot detection
  const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
  if (isBot) return;

  const storageKey = `view_track_${equipmentId}`;
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;

  const lastView = sessionStorage.getItem(storageKey);
  
  if (!lastView || (now - parseInt(lastView)) > thirtyMinutes) {
    try {
      const supabase = createClient();
      await supabase.rpc('increment_equipment_stat', { 
        eq_id: equipmentId, 
        stat_type: 'view' 
      });
      sessionStorage.setItem(storageKey, now.toString());
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }
}

/**
 * Tracks a click event (phone, website, olx).
 * 
 * @param {string} equipmentId - The UUID of the equipment.
 * @param {string} type - 'phone', 'website', or 'olx'.
 */
export async function trackClick(equipmentId, type) {
  if (!equipmentId || !['phone', 'website', 'olx', 'favorite'].includes(type)) return;

  try {
    const supabase = createClient();
    await supabase.rpc('increment_equipment_stat', { 
      eq_id: equipmentId, 
      stat_type: type 
    });
  } catch (error) {
    console.error(`Error tracking ${type} click:`, error);
  }
}

/**
 * Calculates a trending score for an equipment listing.
 * 
 * @param {Object} stats - The stats object from equipment_stats table.
 * @returns {number} - The calculated score.
 */
export function calculateTrendingScore(stats) {
  if (!stats) return 0;
  
  const weights = {
    views: 1,
    phone: 10,
    website: 5,
    olx: 5,
    favorites: 15
  };

  return (
    (stats.views_count || 0) * weights.views +
    (stats.phone_clicks || 0) * weights.phone +
    (stats.website_clicks || 0) * weights.website +
    (stats.olx_clicks || 0) * weights.olx +
    (stats.favorites_count || 0) * weights.favorites
  );
}

/**
 * Helper to get a label for popularity based on views.
 * 
 * @param {number} views - Number of views.
 * @returns {string|null} - 'Popularne', 'Trending' or null.
 */
export function getPopularityLabel(views) {
  if (views > 500) return 'Trending';
  if (views > 100) return 'Popularne';
  return null;
}
