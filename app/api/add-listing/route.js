import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const company = formData.get('company');
    const phone = formData.get('phone');
    const city = formData.get('city');
    const category = formData.get('category');
    const equipment = formData.get('equipment');
    const price = formData.get('price');
    const time = formData.get('time') || 'doba';
    const availability = formData.get('availability');
    const description = formData.get('description');
    const wantsPromotion = formData.get('wantsPromotion') === 'true';
    const imageFile = formData.get('image');

    let imagePath = '';
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fullPath = path.join(uploadDir, fileName);
      fs.writeFileSync(fullPath, buffer);
      imagePath = `/uploads/${fileName}`;
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) {
      console.warn('GOOGLE_SCRIPT_URL is not set. Data will not be sent to Google Sheets.');
    } else {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ID_sprzetu: Math.random().toString(36).substring(2, 11),
          Kategoria: category,
          equipment: equipment,
          price: price,
          time: time,
          city: city,
          availability: availability,
          company: company,
          phone: phone,
          description: description,
          image: imagePath, // Path or full URL
          Status: 'NOWE',
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
