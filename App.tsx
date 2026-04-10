import React, { useState, useEffect, useRef } from 'react';
import Vinyl from './components/Vinyl';
import Timer from './components/Timer';
import TrackSearch from './components/TrackSearch';
import GrainOverlay from './components/GrainOverlay';
import SettingsModal from './components/SettingsModal';
import QueueList from './components/QueueList';
import DarkModeToggle from './components/DarkModeToggle';
import LofiGirlOverlay from './components/LofiGirlOverlay';
import { AudiusTrack, PlayerState, TimerState } from './types';
import { getAuthorizationCode, getAuthorizationError, exchangeCodeForToken, storeSpotifyToken, restoreSpotifyToken, getSpotifyAccessToken } from './services/spotify';
import { Volume2, VolumeX, Settings, SkipForward } from 'lucide-react';

const DEFAULT_FOCUS_TIME = 25 * 60; // 25 minutes default
let spotifySdkLoadingPromise: Promise<void> | null = null;

const loadSpotifySdk = (): Promise<void> => {
  if ((window as any).Spotify) return Promise.resolve();
  if (spotifySdkLoadingPromise) return spotifySdkLoadingPromise;

  spotifySdkLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('spotify-player-sdk') as HTMLScriptElement | null;

    if (existingScript) {
      (window as any).onSpotifyWebPlaybackSDKReady = () => resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'spotify-player-sdk';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    script.onerror = () => reject(new Error('Failed to load Spotify Web Playback SDK.'));
    (window as any).onSpotifyWebPlaybackSDKReady = () => resolve();
    document.body.appendChild(script);
  });

  return spotifySdkLoadingPromise;
};

const App: React.FC = () => {
  const spotifyPlayerRef = useRef<any>(null);
  const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null);
  const [spotifySdkReady, setSpotifySdkReady] = useState(false);

  // Settings State
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_TIME);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  const [spotifyPremiumErrorShown, setSpotifyPremiumErrorShown] = useState(false);

  // App State
  const [player, setPlayer] = useState<PlayerState>({
    isPlaying: false,
    currentTrack: null,
    volume: 0.5,
    queue: [],
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

  // Lofi Girl Mode State
  const [isLofiGirlMode, setIsLofiGirlMode] = useState(false);
  const [spotifyPlaybackHintShown, setSpotifyPlaybackHintShown] = useState(false);

  // --- Dark Mode Logic ---

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Spotify Authentication Logic ---
  useEffect(() => {
    const initSpotify = async () => {
      const authError = getAuthorizationError();
      if (authError) {
        console.error('Spotify authorization error:', authError);
        setSpotifyAuthenticated(false);
        return;
      }

      // Check for authorization code from redirect
      const code = getAuthorizationCode();
      if (code) {
        const tokenData = await exchangeCodeForToken(code);
        if (tokenData) {
          storeSpotifyToken(tokenData.accessToken, tokenData.expiresIn);
          setSpotifyAuthenticated(true);
        }

        // Clean up URL parameters from callback route
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // Try to restore from localStorage
        if (restoreSpotifyToken()) {
          setSpotifyAuthenticated(true);
        } else {
          setSpotifyAuthenticated(false);
        }
      }
    };
    initSpotify();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // --- Spotify SDK Logic ---

  useEffect(() => {
    if (!spotifyAuthenticated || spotifyPlayerRef.current) return;

    let isMounted = true;

    const initSpotifyPlayer = async () => {
      try {
        await loadSpotifySdk();
        if (!isMounted) return;

        const spotifyToken = getSpotifyAccessToken();
        if (!spotifyToken) return;

        const SpotifyPlayer = (window as any).Spotify?.Player;
        if (!SpotifyPlayer) return;

        const sdkPlayer = new SpotifyPlayer({
          name: 'RetroGroove Focus Player',
          getOAuthToken: (cb: (token: string) => void) => {
            const token = getSpotifyAccessToken();
            cb(token || '');
          },
          volume: player.volume,
        });

        sdkPlayer.addListener('ready', async ({ device_id }: { device_id: string }) => {
          setSpotifyDeviceId(device_id);
          setSpotifySdkReady(true);

          const token = getSpotifyAccessToken();
          if (!token) return;

          const transferResponse = await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ device_ids: [device_id], play: false }),
          });

          if (!transferResponse.ok) {
            const text = await transferResponse.text();
            console.warn('Spotify transfer playback warning:', text);
          }
        });

        sdkPlayer.addListener('not_ready', () => {
          setSpotifySdkReady(false);
        });

        sdkPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
          console.error('Spotify authentication error:', message);
        });

        sdkPlayer.addListener('account_error', ({ message }: { message: string }) => {
          console.error('Spotify account error:', message);
          if (!spotifyPremiumErrorShown) {
            alert('Spotify Premium is required for full in-app playback via Web Playback SDK.');
            setSpotifyPremiumErrorShown(true);
          }
        });

        sdkPlayer.addListener('playback_error', ({ message }: { message: string }) => {
          console.error('Spotify playback error:', message);
        });

        const connected = await sdkPlayer.connect();
        if (connected) {
          spotifyPlayerRef.current = sdkPlayer;
        }
      } catch (error) {
        console.error('Failed to initialize Spotify player:', error);
      }
    };

    initSpotifyPlayer();

    return () => {
      isMounted = false;
    };
  }, [spotifyAuthenticated, player.volume, spotifyPremiumErrorShown]);

  useEffect(() => {
    if (!spotifyPlayerRef.current) return;
    spotifyPlayerRef.current.setVolume(isMuted ? 0 : player.volume);
  }, [player.volume, isMuted]);

  const getAvailableDeviceId = async (token: string): Promise<string | null> => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json() as {
        devices: Array<{ id: string; name: string; is_active: boolean }>;
      };

      const currentDevice = data.devices.find((d) => d.id === spotifyDeviceId);
      if (currentDevice?.id) return currentDevice.id;

      const activeDevice = data.devices.find((d) => d.is_active);
      if (activeDevice?.id) return activeDevice.id;

      const retroDevice = data.devices.find((d) => d.name === 'RetroGroove Focus Player');
      return retroDevice?.id || null;
    } catch {
      return null;
    }
  };

  const playTrackOnSpotify = async (track: AudiusTrack) => {
    const token = getSpotifyAccessToken();
    if (!token) return;

    const trackUri = track.uri || `spotify:track:${track.id}`;

    // Helps Safari/Chrome autoplay policies for SDK audio output.
    if (spotifyPlayerRef.current?.activateElement) {
      try {
        await spotifyPlayerRef.current.activateElement();
      } catch {
        // Non-fatal if browser doesn't require it.
      }
    }

    const resolvedDeviceId = spotifyDeviceId || await getAvailableDeviceId(token);
    if (!resolvedDeviceId) {
      if (!spotifyPlaybackHintShown) {
        alert('Spotify player is not ready yet. Wait 2-3 seconds after connecting, then press play again.');
        setSpotifyPlaybackHintShown(true);
      }
      return;
    }

    if (resolvedDeviceId !== spotifyDeviceId) {
      setSpotifyDeviceId(resolvedDeviceId);
    }

    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${resolvedDeviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [trackUri] }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Spotify play request failed:', text);
      if (response.status === 403 && !spotifyPremiumErrorShown) {
        alert('Spotify Premium is required for in-app full playback.');
        setSpotifyPremiumErrorShown(true);
      } else if (response.status === 404 || response.status === 400) {
        alert('No active Spotify playback device found yet. Keep the app tab open and try pressing play again.');
      }
    }
  };

  const pauseSpotifyPlayback = async () => {
    const token = getSpotifyAccessToken();
    if (!token) return;

    const resolvedDeviceId = spotifyDeviceId || await getAvailableDeviceId(token);
    if (!resolvedDeviceId) return;

    await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${resolvedDeviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  useEffect(() => {
    const syncSpotifyPlayback = async () => {
      if (!spotifySdkReady || !spotifyAuthenticated || !player.currentTrack) return;

      if (player.isPlaying) {
        await playTrackOnSpotify(player.currentTrack);
      } else {
        await pauseSpotifyPlayback();
      }
    };

    syncSpotifyPlayback();
  }, [player.isPlaying, player.currentTrack, spotifySdkReady, spotifyAuthenticated, spotifyDeviceId]);

  useEffect(() => {
    return () => {
      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.disconnect();
        spotifyPlayerRef.current = null;
      }
      setSpotifyDeviceId(null);
      setSpotifySdkReady(false);
    }
  }, []);

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
    if (!spotifyAuthenticated) {
      alert('Connect Spotify first from Settings.');
      return;
    }

    if (!spotifySdkReady && !spotifyPlaybackHintShown) {
      alert('Spotify player is still connecting. Please wait a moment and press play again.');
      setSpotifyPlaybackHintShown(true);
      return;
    }

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

  const handleTrackEnd = () => {
    if (player.queue.length > 0) {
      const nextTrack = player.queue[0];
      const newQueue = player.queue.slice(1);
      setPlayer(prev => ({
        ...prev,
        currentTrack: nextTrack,
        queue: newQueue,
        isPlaying: true // Keep playing next track
      }));
    } else {
      setPlayer(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const handleAddToQueue = (track: AudiusTrack) => {
    setPlayer(prev => ({
      ...prev,
      queue: [...prev.queue, track]
    }));
  };

  const handleRemoveFromQueue = (index: number) => {
    setPlayer(prev => ({
      ...prev,
      queue: prev.queue.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row overflow-hidden bg-matcha dark:bg-charcoal selection:bg-retro-orange selection:text-white transition-colors duration-500">
      {/* Lofi Girl Overlay */}
      <LofiGirlOverlay active={isLofiGirlMode} />
      <GrainOverlay />

      {/* Dark Mode Toggle */}
      <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />

      {/* Search Bar */}
      <TrackSearch
        onSelectTrack={handleTrackSelect}
        onAddToQueue={handleAddToQueue}
        currentTrack={player.currentTrack}
        spotifyAuthenticated={spotifyAuthenticated}
      />

      {/* Left / Top Section: Vinyl */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 z-10 min-h-[50vh]">
        {/* Show Vinyl and Track Info only if Lofi Girl Mode is OFF */}
        {!isLofiGirlMode && (
          <>
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
          </>
        )}
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

        {/* Lofi Girl Mode Toggle */}
        <button
          onClick={() => setIsLofiGirlMode((prev) => !prev)}
          className={`p-2 rounded-full transition-all text-charcoal/40 dark:text-matcha/40 hover:text-retro-orange hover:bg-charcoal/5 dark:hover:bg-matcha/5 active:scale-95 mb-2`}
          aria-label="Toggle Lofi Girl Mode"
        >
          {isLofiGirlMode ? 'Disable Lofi Girl Mode' : 'Enable Lofi Girl Mode'}
        </button>

        {/* Timer Module */}
        <Timer
          timeLeft={timer.timeLeft}
          isActive={timer.isActive}
          hasTrack={!!player.currentTrack}
          onToggle={toggleTimer}
          onReset={resetTimer}
        />

        {/* Media Controls */}
        <div className="flex flex-col items-center gap-4 w-full max-w-[250px]">
          {/* Volume & Skip Row */}
          <div className="flex items-center gap-4 w-full justify-between">
            <button
              onClick={handleTrackEnd}
              disabled={player.queue.length === 0}
              className={`p-2 rounded-full transition-all ${player.queue.length > 0
                  ? 'text-charcoal dark:text-matcha hover:bg-charcoal/10 dark:hover:bg-matcha/10 hover:scale-105 active:scale-95 cursor-pointer'
                  : 'text-charcoal/20 dark:text-matcha/20 cursor-not-allowed'
                }`}
              title="Skip to next track"
            >
              <SkipForward size={24} />
            </button>

            <div className="flex items-center gap-2 flex-1">
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
          </div>
        </div>

        {/* Queue List */}
        <QueueList queue={player.queue} onRemove={handleRemoveFromQueue} />

        {/* Footer Info */}
        <div className="absolute bottom-4 text-[10px] text-charcoal/30 dark:text-matcha/30 font-mono text-center w-full px-4 transition-colors duration-500">
          <p>POWERED BY SPOTIFY • BUILT FOR FOCUS</p>
        </div>
      </aside>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentDuration={focusDuration}
        onSave={handleDurationUpdate}
        spotifyAuthenticated={spotifyAuthenticated}
        onSpotifyAuth={setSpotifyAuthenticated}
      />
    </div>
  );
};

export default App;