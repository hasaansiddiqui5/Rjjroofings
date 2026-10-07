import React, { useState, useRef, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  altTitle: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before · Storm Damage',
  afterLabel = 'After · RRJ Restoration',
  altTitle,
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(52);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(4, Math.min(96, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((p) => Math.max(5, p - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((p) => Math.min(95, p + 5));
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={(e) => handleMove(e.clientX)}
      role="slider"
      aria-label={`Before and after roof comparison for ${altTitle}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(sliderPosition)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative select-none overflow-hidden rounded-xl bg-[#0B1B2E] cursor-ew-resize group focus-visible:outline-2 focus-visible:outline-[#D9732B] ${className}`}
    >
      <img
        src={afterImage}
        alt={`${altTitle} - After Completed Roof`}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover block pointer-events-none"
      />

      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={`${altTitle} - Before Storm Inspection`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover block filter contrast-105 brightness-95"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0B1B2E]/80 to-transparent pointer-events-none" />

      <div className="absolute bottom-3 left-4 pointer-events-none text-xs font-medium tracking-wide text-white/90 bg-[#0B1B2E]/75 backdrop-blur-xs px-2.5 py-1 rounded">
        {beforeLabel}
      </div>
      <div className="absolute bottom-3 right-4 pointer-events-none text-xs font-medium tracking-wide text-white/90 bg-[#0B1B2E]/75 backdrop-blur-xs px-2.5 py-1 rounded">
        {afterLabel}
      </div>

      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#D9732B] text-white shadow-lg border-2 border-white flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
          <MoveHorizontal className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
