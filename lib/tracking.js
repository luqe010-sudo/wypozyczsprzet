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
  if (!equipmentId || !['phone', 'website', 'olx'].includes(type)) return;

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
