import { NextResponse } from 'next/server';
import cloudinary from '../../../lib/cloudinary';
import { createSupabaseAdminClient } from '../../../lib/supabaseAdmin';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SUBMISSIONS_PER_HOUR = 5;
const submissionBuckets = new Map();

function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const bucket = submissionBuckets.get(ip) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= MAX_SUBMISSIONS_PER_HOUR) {
    submissionBuckets.set(ip, recent);
    return true;
  }

  recent.push(now);
  submissionBuckets.set(ip, recent);
  return false;
}

function getRequiredString(formData, key) {
  const value = String(formData.get(key) || '').trim();
  if (!value) {
    throw new Error(`Missing required field: ${key}`);
  }
  return value;
}

function getOptionalString(formData, key) {
  return String(formData.get(key) || '').trim();
}

function parsePrice(value) {
  if (!value) return null;
  const normalized = String(value).replace(',', '.').replace(/[^\d.]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    
    const company = getRequiredString(formData, 'company');
    const phone = getRequiredString(formData, 'phone');
    const zipCode = getRequiredString(formData, 'zipCode');
    const city = getRequiredString(formData, 'city');
    const category = getRequiredString(formData, 'category');
    const equipment = getRequiredString(formData, 'equipment');
    const price = getOptionalString(formData, 'price');
    const priceFrom = parsePrice(price);
    const time = getOptionalString(formData, 'time') || 'day';
    const availability = getRequiredString(formData, 'availability');
    const description = getOptionalString(formData, 'description');
    const lokalizacja = getOptionalString(formData, 'lokalizacja');
    const olxUrl = normalizeUrl(getOptionalString(formData, 'olxUrl'));
    const email = getOptionalString(formData, 'email');
    const www = normalizeUrl(getOptionalString(formData, 'www'));
    const subcategory = getOptionalString(formData, 'subcategory');
    const wantsPromotion = formData.get('wantsPromotion') === 'true';
    const imageFile = formData.get('image');
    const editId = formData.get('editId');

    let imageUrl = '';

    if (imageFile && imageFile.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
        return NextResponse.json(
          { success: false, error: 'Unsupported image type.' },
          { status: 400 }
        );
      }

      if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: 'Image is too large.' },
          { status: 400 }
        );
      }

      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Upload to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({
            folder: 'listings',
          }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }).end(buffer);
        });
        
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
      }
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    const supabase = createSupabaseAdminClient();
    let savedToSupabase = false;
    let savedToSheets = false;
    
    // 1. Write to Supabase
    if (supabase) {
      try {
        // Public submissions create a pending company/listing pair for moderation.
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: company,
            phone,
            email,
            website: www,
            zip_code: zipCode,
            city,
            address: lokalizacja,
            status: 'pending',
          })
          .select('id')
          .single();

        if (companyError) throw companyError;

        // Insert equipment
        const { error: equipError } = await supabase
          .from('equipment')
          .insert({
            company_id: companyData.id,
            category,
            subcategory: subcategory || null,
            name: equipment,
            price_from: priceFrom,
            rental_period: time,
            availability,
            description,
            image_url: imageUrl,
            external_olx_url: olxUrl,
            status: 'pending',
            promotion: wantsPromotion,
            priority: 1,
          });

        if (equipError) throw equipError;
        savedToSupabase = true;
      } catch (sbError) {
        console.error('Error saving to Supabase:', sbError);
      }
    } else {
      console.warn('Supabase service role credentials are missing. Skipping Supabase write.');
    }

    // 2. Write to Google Sheets (Original Logic)
    if (!scriptUrl) {
      console.warn('GOOGLE_SCRIPT_URL is not set. Data will not be sent to Google Sheets.');
    } else {
      try {
        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ID_sprzetu: editId || Math.random().toString(36).substring(2, 11),
            isEdit: !!editId,
            Kategoria: category,
            equipment,
            price,
            time,
            zipCode,
            city,
            lokalizacja,
            availability,
            company,
            phone,
            description,
            OLX: olxUrl,
            email,
            WWW: www,
            imageContent: imageUrl,
            imageName: imageFile ? imageFile.name : '',
            imageType: imageFile ? imageFile.type : '',
            Status: 'OCZEKUJACE',
            Promowanie: wantsPromotion ? 'Mozliwe' : 'Nie',
            priority: 1,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          console.error(`Google Script Error: ${result.error || response.statusText}`);
        } else {
          savedToSheets = true;
        }
      } catch (sheetError) {
        console.error('Error saving to Google Sheets:', sheetError);
      }
    }

    if (!savedToSupabase && !savedToSheets) {
      return NextResponse.json(
        { success: false, error: 'Could not save listing submission.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, savedToSupabase, savedToSheets });
  } catch (error) {
    console.error('Error adding listing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
