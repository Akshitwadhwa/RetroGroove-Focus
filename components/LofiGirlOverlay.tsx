
import React, { useEffect, useState } from 'react';
import './LofiGirlOverlay.css';

const images = [
  '/assets/Frame1.jpg',
  '/assets/Frame2.webp',
  '/assets/Frame3.jpg',
];

const LofiGirlOverlay: React.FC<{ active: boolean }> = ({ active }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;
  return (
    <div className="lofi-girl-main-area">
      <img src={images[current]} alt="Lofi Girl" className="lofi-girl-main-img" />
    </div>
  );
};

export default LofiGirlOverlay;
