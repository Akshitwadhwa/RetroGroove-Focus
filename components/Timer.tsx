import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  timeLeft: number;
  isActive: boolean;
  hasTrack: boolean;
  onToggle: () => void;
  onReset: () => void;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, isActive, hasTrack, onToggle, onReset }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const getStatusText = () => {
    if (isActive) {
      return hasTrack ? "Focus mode active. Vinyl spinning." : "Focus mode active.";
    }
    return hasTrack ? "Timer paused. Press play to focus." : "Timer paused. Select a track or start silent focus.";
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-charcoal/5 shadow-sm">
      <div className="relative">
        {/* Retro digital display background */}
        <div className="bg-[#CAD2C5] p-6 rounded-lg shadow-inner border-4 border-[#B0B8AC]">
          <div className="font-mono text-6xl md:text-7xl font-bold text-charcoal tracking-widest tabular-nums opacity-90">
            {formattedTime}
          </div>
        </div>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B0B8AC] px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-widest uppercase">
          Pomodoro
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button
          onClick={onToggle}
          className={`
            flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
            ${isActive 
              ? 'bg-charcoal text-matcha hover:bg-charcoal/90' 
              : 'bg-retro-orange text-white hover:bg-retro-orange/90'}
          `}
          aria-label={isActive ? "Pause" : "Start"}
        >
          {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-charcoal/10 text-charcoal hover:border-charcoal/30 hover:bg-charcoal/5 transition-all active:scale-95"
          aria-label="Reset"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="text-xs font-mono text-charcoal/40 text-center max-w-[200px]">
        {getStatusText()}
      </div>
    </div>
  );
};

export default Timer;