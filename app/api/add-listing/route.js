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
          imageContent: imageUrl, // Now sending URL instead of base64
          imageName: imageFile ? imageFile.name : '',
          imageType: imageFile ? imageFile.type : '',
          Status: 'AKTYWNE',
          Promowanie: wantsPromotion ? 'Mozliwe' : 'Nie',
          priority: 1
        })
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(`Google Script Error: ${result.error}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding listing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
