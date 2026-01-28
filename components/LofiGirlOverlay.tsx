
import React, { useEffect, useState } from 'react';
import './LofiGirlOverlay.css';

const images = [
  '/assests/Still_frame_305145652f.jpg',
  '/assests/lofi-girl-study-session-7endmb0g5zp6wzxb.jpg',
  '/assests/pomodoro_a224d26448.webp',
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
