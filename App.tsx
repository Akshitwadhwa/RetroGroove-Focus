import React, { useState, useEffect, useRef } from 'react';
import Vinyl from './components/Vinyl';
import Timer from './components/Timer';
import TrackSearch from './components/TrackSearch';
import GrainOverlay from './components/GrainOverlay';
import SettingsModal from './components/SettingsModal';
import DarkModeToggle from './components/DarkModeToggle';
import { AudiusTrack, PlayerState, TimerState } from './types';
import { getStreamUrl } from './services/audius';
import { Volume2, VolumeX, Settings } from 'lucide-react';

const DEFAULT_FOCUS_TIME = 25 * 60; // 25 minutes default

const App: React.FC = () => {
  // Audio Ref
  const audioRef = useRef<HTMLAudioElement>(null);

  // Settings State
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_TIME);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // App State
  const [player, setPlayer] = useState<PlayerState>({
    isPlaying: false,
    currentTrack: null,
    volume: 0.5,
  });

  const [timer, setTimer] = useState<TimerState>({
    timeLeft: focusDuration,
    isActive: false,
    mode: 'focus',
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to false (light mode)
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // --- Dark Mode Logic ---

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // --- Audio Logic ---

  useEffect(() => {
    if (audioRef.current) {
      if (player.isPlaying && player.currentTrack) {
        audioRef.current.play().catch(e => {
          console.warn("Autoplay prevented:", e);
          // If autoplay fails, we might need to sync state back to paused
          setPlayer(prev => ({ ...prev, isPlaying: false }));
          setTimer(prev => ({ ...prev, isActive: false }));
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [player.isPlaying, player.currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : player.volume;
    }
  }, [player.volume, isMuted]);

  // --- Timer Logic ---

  useEffect(() => {
    let interval: number | undefined;

    if (timer.isActive && timer.timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimer((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (timer.timeLeft === 0) {
      // Timer finished
      setTimer((prev) => ({ ...prev, isActive: false }));
      setPlayer((prev) => ({ ...prev, isPlaying: false })); // Stop music
      // Optional: Play a chime sound here
    }

    return () => clearInterval(interval);
  }, [timer.isActive, timer.timeLeft]);


  // --- Handlers ---

  const handleTrackSelect = (track: AudiusTrack) => {
    setPlayer(prev => ({ ...prev, currentTrack: track, isPlaying: false }));
    // Reset timer to current configured duration
    setTimer(prev => ({ ...prev, isActive: false, timeLeft: focusDuration }));
  };

  const toggleTimer = () => {
    // Removed alert blocking timer start without track
    const newActiveState = !timer.isActive;
    setTimer(prev => ({ ...prev, isActive: newActiveState }));

    // Sync music with timer ONLY if track exists
    if (player.currentTrack) {
      setPlayer(prev => ({ ...prev, isPlaying: newActiveState }));
    }
  };

  const resetTimer = () => {
    setTimer({ timeLeft: focusDuration, isActive: false, mode: 'focus' });
    setPlayer(prev => ({ ...prev, isPlaying: false }));
  };

  const handleDurationUpdate = (newDuration: number) => {
    setFocusDuration(newDuration);
    // When settings change, reset the timer to the new duration
    setTimer({ timeLeft: newDuration, isActive: false, mode: 'focus' });
    setPlayer(prev => ({ ...prev, isPlaying: false }));
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row overflow-hidden bg-matcha dark:bg-charcoal selection:bg-retro-orange selection:text-white transition-colors duration-500">
      <GrainOverlay />

      {/* Dark Mode Toggle */}
      <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />

      {/* Search Bar */}
      <TrackSearch onSelectTrack={handleTrackSelect} currentTrack={player.currentTrack} />

      {/* Hidden Audio Element */}
      {player.currentTrack && (
        <audio
          ref={audioRef}
          src={getStreamUrl(player.currentTrack.id)}
          onEnded={() => setPlayer(prev => ({ ...prev, isPlaying: false }))}
          loop
        />
      )}

      {/* Left / Top Section: Vinyl */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 z-10 min-h-[50vh]">
        <Vinyl isPlaying={player.isPlaying} track={player.currentTrack} />

        {/* Track Info (Mobile mostly, but nice generally) */}
        <div className="mt-12 text-center max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal dark:text-matcha truncate transition-colors duration-500">
            {player.currentTrack ? player.currentTrack.title : "No Track Selected"}
          </h1>
          <p className="text-charcoal/60 dark:text-matcha/60 font-mono mt-2 uppercase tracking-widest text-sm transition-colors duration-500">
            {player.currentTrack ? player.currentTrack.user.name : "Select music to begin"}
          </p>
        </div>
      </main>

      {/* Right / Bottom Section: Sidebar Controls */}
      <aside className="w-full md:w-[400px] bg-white/30 dark:bg-charcoal/30 backdrop-blur-md border-l border-charcoal/5 dark:border-matcha/5 p-8 flex flex-col items-center justify-center z-20 gap-8 relative transition-colors duration-500">

        {/* Settings Button (Absolute Top Right) */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-charcoal/5 text-charcoal/40 hover:text-charcoal transition-all active:scale-95"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>

        {/* Timer Module */}
        <Timer
          timeLeft={timer.timeLeft}
          isActive={timer.isActive}
          hasTrack={!!player.currentTrack}
          onToggle={toggleTimer}
          onReset={resetTimer}
        />

        {/* Volume Control */}
        <div className="flex items-center space-x-4 w-full max-w-[200px]">
          <button onClick={() => setIsMuted(!isMuted)} className="text-charcoal dark:text-matcha hover:text-retro-orange transition-colors">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={player.volume}
            onChange={(e) => setPlayer(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
            className="w-full h-1 bg-charcoal/20 dark:bg-matcha/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-retro-orange"
          />
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-4 text-[10px] text-charcoal/30 dark:text-matcha/30 font-mono text-center w-full px-4 transition-colors duration-500">
          <p>POWERED BY AUDIUS • BUILT FOR FOCUS</p>
        </div>
      </aside>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentDuration={focusDuration}
        onSave={handleDurationUpdate}
      />
    </div>
  );
};

export default App;