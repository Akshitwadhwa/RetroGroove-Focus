import React, { useState, useEffect } from 'react';
import { X, Check, LogOut } from 'lucide-react';
import { getSpotifyLoginUrl, clearSpotifyToken } from '../services/spotify';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDuration: number; // in seconds
  onSave: (newDuration: number) => void;
  spotifyAuthenticated?: boolean;
  onSpotifyAuth?: (authenticated: boolean) => void;
  musicSource?: 'audius' | 'spotify';
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentDuration,
  onSave,
  spotifyAuthenticated = false,
  onSpotifyAuth,
}) => {
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

  const handleSpotifyLogin = async () => {
    try {
      const loginUrl = await getSpotifyLoginUrl();
      window.location.assign(loginUrl);
    } catch (error) {
      console.error('Spotify login error:', error);
      alert('Failed to start Spotify login. Verify redirect URI in Spotify Dashboard matches your current browser URL.');
    }
  };

  const handleSpotifyLogout = () => {
    clearSpotifyToken();
    onSpotifyAuth?.(false);
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

          {/* Spotify Section */}
          <div className="border-t border-charcoal/5 pt-4">
            <label className="block text-[10px] font-bold text-charcoal/50 uppercase tracking-widest mb-3">
              Music Services
            </label>
            {spotifyAuthenticated ? (
              <div className="space-y-2">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm">
                  <p className="text-green-700 font-bold">✓ Spotify Connected</p>
                </div>
                <button
                  onClick={handleSpotifyLogout}
                  className="w-full bg-red-500/10 text-red-600 border border-red-300 py-2 rounded-lg font-bold tracking-widest uppercase hover:bg-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Disconnect Spotify
                </button>
              </div>
            ) : (
              <button
                onClick={handleSpotifyLogin}
                className="w-full bg-green-500 text-white py-2 rounded-lg font-bold tracking-widest uppercase hover:bg-green-600 transition-all active:scale-95 shadow-lg"
              >
                Connect Spotify
              </button>
            )}
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