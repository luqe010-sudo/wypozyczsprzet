import React from 'react';

const gradients = [
  'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // blue
  'linear-gradient(135deg, #10b981 0%, #059669 100%)', // green
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // amber
  'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // red
  'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', // violet
  'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', // pink
  'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', // indigo
];

const getGradientIndex = (str) => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % gradients.length;
};

export default function DynamicPlaceholder({ title, category }) {
  const gradient = gradients[getGradientIndex(category || title)];
  const firstLetter = (title || category || '?').charAt(0).toUpperCase();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: gradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'var(--font-sans)',
        padding: '1rem',
        boxSizing: 'border-box',
        minHeight: '200px'
      }}
    >
      <div style={{
        fontSize: '4rem',
        fontWeight: '800',
        opacity: 0.8,
        marginBottom: '0.5rem',
        lineHeight: 1
      }}>
        {firstLetter}
      </div>
      <div style={{
        fontSize: '1rem',
        fontWeight: '600',
        textAlign: 'center',
        opacity: 0.9,
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {category || title}
      </div>
    </div>
  );
}
