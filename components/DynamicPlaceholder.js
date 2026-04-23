import React from 'react';

export default function DynamicPlaceholder({ title, category }) {
  let imageSrc = '/placeholders/narzedzia.png'; // default fallback

  const searchStr = `${category || ''} ${title || ''}`.toLowerCase();
  
  if (searchStr.includes('koparka') || searchStr.includes('minikoparka')) {
    imageSrc = '/placeholders/koparka.png';
  } else if (searchStr.includes('\u0142adowarka')) {
    imageSrc = '/placeholders/ladowarka.png';
  } else if (searchStr.includes('podno\u015bnik')) {
    imageSrc = '/placeholders/podnosnik.png';
  } else if (searchStr.includes('ogrod') || searchStr.includes('ogród')) {
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
