
import { supabase } from './supabase';

/**
 * Save a scan to the user's history
 * @param ingredients - Array of detected ingredients
 * @param imageUri - Optional image URI (base64 or file path)
 */
export const saveScanHistory = async (
  ingredients: string[],
  imageUri?: string
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
        image_url: imageUri, // Store the image URI/base64
        created_at: new Date().toISOString(),
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

    console.log('✅ Scan history deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteScanHistory:', error);
    return false;
  }
};









