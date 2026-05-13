import Image from 'next/image';

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
    <div className="relative w-full h-full">
      <Image 
        src={imageSrc} 
        alt={`${category || title || 'Sprzęt budowlany'}`}
        fill
        sizes="(max-width: 480px) 100vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
      />
    </div>
  );
}
