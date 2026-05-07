import { NextResponse } from 'next/server';
import cloudinary from '../../../lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const company = formData.get('company');
    const phone = formData.get('phone');
    const zipCode = formData.get('zipCode');
    const city = formData.get('city');
    const category = formData.get('category');
    const equipment = formData.get('equipment');
    const price = formData.get('price');
    const time = formData.get('time') || 'doba';
    const availability = formData.get('availability');
    const description = formData.get('description');
    const lokalizacja = formData.get('lokalizacja');
    const olxUrl = formData.get('olxUrl') || '';
    const email = formData.get('email') || '';
    const www = formData.get('www') || '';
    const wantsPromotion = formData.get('wantsPromotion') === 'true';
    const imageFile = formData.get('image');
    const editId = formData.get('editId');

    let imageUrl = '';

    if (imageFile && imageFile.size > 0) {
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
    
    // 1. Write to Supabase
    try {
      const { supabase } = require('../../../lib/supabaseClient');
      
      // Upsert company first
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .upsert({
          name: company,
          phone: phone,
          email: email,
          website: www,
          zip_code: zipCode,
          city: city,
          address: lokalizacja,
          status: 'active'
        }, { onConflict: 'name, phone' })
        .select('id')
        .single();

      if (companyError) throw companyError;

      // Insert equipment
      const { error: equipError } = await supabase
        .from('equipment')
        .insert({
          company_id: companyData.id,
          category: category,
          name: equipment,
          price_from: price,
          rental_period: time,
          availability: availability,
          description: description,
          image_url: imageUrl,
          external_olx_url: olxUrl,
          status: 'active',
          promotion: wantsPromotion ? 'Mozliwe' : 'Nie',
          priority: 1
        });

      if (equipError) throw equipError;
      console.log('Successfully saved to Supabase');
    } catch (sbError) {
      console.error('Error saving to Supabase:', sbError);
      // We continue to Google Sheets as fallback
    }

    // 2. Write to Google Sheets (Original Logic)
    if (!scriptUrl) {
      console.warn('GOOGLE_SCRIPT_URL is not set. Data will not be sent to Google Sheets.');
    } else {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ID_sprzetu: editId || Math.random().toString(36).substring(2, 11),
          isEdit: !!editId,
          Kategoria: category,
          equipment: equipment,
          price: price,
          time: time,
          zipCode: zipCode,
          city: city,
          lokalizacja: lokalizacja,
          availability: availability,
          company: company,
          phone: phone,
          description: description,
          OLX: olxUrl,
          email: email,
          WWW: www,
          imageContent: imageUrl,
          imageName: imageFile ? imageFile.name : '',
          imageType: imageFile ? imageFile.type : '',
          Status: 'AKTYWNE',
          Promowanie: wantsPromotion ? 'Mozliwe' : 'Nie',
          priority: 1
        })
      });
      
      const result = await response.json();
      if (!result.success) {
        console.error(`Google Script Error: ${result.error}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding listing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
