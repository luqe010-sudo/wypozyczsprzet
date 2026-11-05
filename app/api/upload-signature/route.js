import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { createClient } from '@/utils/supabase/server';

const UPLOAD_FOLDER = 'listings';
const ALLOWED_FORMATS = 'jpg,jpeg,png,webp';
const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * Signs a direct browser-to-Cloudinary upload for a logged-in user. Files skip the
 * server entirely, so they are not limited by the serverless request size.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Zaloguj się.' }, { status: 401 });

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { allowed_formats: ALLOWED_FORMATS, folder: UPLOAD_FOLDER, timestamp };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

  return NextResponse.json({
    signature,
    timestamp,
    folder: UPLOAD_FOLDER,
    allowedFormats: ALLOWED_FORMATS,
    maxFileBytes: MAX_FILE_BYTES,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
