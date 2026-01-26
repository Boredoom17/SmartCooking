
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqcerlwpnrnlgzuwbhof.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxY2VybHdwbnJubGd6dXdiaG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMDc3NDMsImV4cCI6MjA4NDU4Mzc0M30.EVfCkxXtKxoZ5MW6s8348aMebgb9kCWyFZKaj4P-OR8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Save a scan to the user's history
 * @param ingredients - Array of detected ingredients
 * @param imageUrl - Optional image URL
 */
export const saveScanHistory = async (
  ingredients: string[],
  imageUrl?: string
): Promise<boolean> => {
  try {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('No user logged in, skipping history save');
      return false;
    }

    // Insert scan history
    const { error } = await supabase
      .from('scan_history')
      .insert({
        user_id: session.user.id,
        ingredients: ingredients,
        image_url: imageUrl,
      });

    if (error) {
      console.error('Error saving scan history:', error);
      return false;
    }

    console.log('✅ Scan history saved successfully');
    return true;
  } catch (error) {
    console.error('Error in saveScanHistory:', error);
    return false;
  }
};

/**
 * Get user's scan history
 * @param limit - Number of records to fetch
 */
export const getScanHistory = async (limit: number = 50) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('scan_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching scan history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getScanHistory:', error);
    return [];
  }
};

/**
 * Delete a scan from history
 * @param scanId - ID of the scan to delete
 */
export const deleteScanHistory = async (scanId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('scan_history')
      .delete()
      .eq('id', scanId);

    if (error) {
      console.error('Error deleting scan history:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteScanHistory:', error);
    return false;
  }
};