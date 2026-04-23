import React from 'react';

export default function DynamicPlaceholder({ title, category }) {
  let imageSrc = '/placeholders/narzedzia.png'; // default fallback

  const cat = String(category || '').toLowerCase();
  
  if (cat.includes('koparka') || cat.includes('minikoparka')) {
    imageSrc = '/placeholders/koparka.png';
  } else if (cat.includes('\u0142adowarka')) {
    imageSrc = '/placeholders/ladowarka.png';
  } else if (cat.includes('podno\u015bnik')) {
    imageSrc = '/placeholders/podnosnik.png';
  } else if (cat.includes('ogrod') || cat.includes('ogród')) {
    imageSrc = '/placeholders/ogrod.png';
  }

  return (
    <img 
      src={imageSrc} 
      alt={`Placeholder for ${category || title}`}
      className="listing-image"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
  );
}
