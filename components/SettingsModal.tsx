import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDuration: number; // in seconds
  onSave: (newDuration: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentDuration, onSave }) => {
  const [minutes, setMinutes] = useState(Math.floor(currentDuration / 60));

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
      setMinutes(Math.floor(currentDuration / 60));
    }
  }, [isOpen, currentDuration]);

  if (!isOpen) return null;

  const handleSave = () => {
    const validMinutes = Math.max(1, Math.min(180, minutes)); // Clamp between 1 and 180 mins
    onSave(validMinutes * 60);
    onClose();
  };

  const presets = [15, 25, 45, 60];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F0F4E8] border-2 border-charcoal/10 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-charcoal/5 pb-4">
          <h2 className="text-lg font-bold text-charcoal tracking-widest uppercase font-mono">System Config</h2>
          <button 
            onClick={onClose} 
            className="text-charcoal/40 hover:text-retro-orange transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 font-mono">
          <div>
            <label className="block text-[10px] font-bold text-charcoal/50 uppercase tracking-widest mb-2">
              Focus Duration (Minutes)
            </label>
            <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border-2 border-charcoal/10 rounded-xl py-3 px-4 text-2xl font-bold text-charcoal focus:outline-none focus:border-retro-orange transition-colors"
                />
            </div>
            
            {/* Presets */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {presets.map(min => (
                <button
                  key={min}
                  onClick={() => setMinutes(min)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    minutes === min 
                    ? 'bg-charcoal text-[#F0F4E8] border-charcoal' 
                    : 'bg-transparent text-charcoal/60 border-charcoal/10 hover:border-retro-orange hover:text-retro-orange'
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-retro-orange text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-retro-orange/90 transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-retro-orange/20"
          >
            <Check size={18} />
            Update Timer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;