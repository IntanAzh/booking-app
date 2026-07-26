import { createClient } from '@supabase/supabase-js';

const cleanSupabaseUrl = (rawUrl) => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
};

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseUrl = cleanSupabaseUrl(rawUrl);
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const bucketName = (import.meta.env.VITE_SUPABASE_BUCKET || 'service-images').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload file to Supabase Storage and return public URL
 * @param {File} file - File object to upload
 * @returns {Promise<string>} Public URL of uploaded image
 */
export const uploadImageToSupabase = async (file) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase URL & Anon Key belum dikonfigurasi di file frontend/.env.");
  }

  // Generate unique filename directly inside the bucket
  const fileExt = file.name.split('.').pop();
  const fileName = `service_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  // Upload to Supabase Storage bucket
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error uploading to Supabase Storage:', error);
    if (error.message && error.message.includes('Bucket not found')) {
      throw new Error(`Bucket '${bucketName}' tidak ditemukan di Supabase Storage Anda. Silakan buat bucket bernama '${bucketName}' (Set ke Public) pada Dashboard Supabase.`);
    }
    if (error.message && (error.message.includes('row-level security') || error.message.includes('RLS'))) {
      throw new Error(`Supabase RLS Policy belum diizinkan untuk upload. Di Dashboard Supabase -> Storage -> '${bucketName}' -> Configuration/Policies: Tambahkan Policy 'Allow public inserts' (INSERT operation = true).`);
    }
    throw new Error(`Gagal mengunggah foto ke Supabase Storage: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};
