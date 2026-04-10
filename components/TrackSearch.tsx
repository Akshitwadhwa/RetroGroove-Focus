import React, { useState, useEffect, useRef } from 'react';
import { Search, Music, Loader2, X, PlusCircle } from 'lucide-react';
import { searchTracks, getArtworkUrl } from '../services/audius';
import { searchSpotifyTracks } from '../services/spotify';
import { AudiusTrack } from '../types';

interface TrackSearchProps {
  onSelectTrack: (track: AudiusTrack) => void;
  onAddToQueue: (track: AudiusTrack) => void;
  currentTrack: AudiusTrack | null;
  musicSource?: 'audius' | 'spotify';
  onSourceChange?: (source: 'audius' | 'spotify') => void;
  spotifyAuthenticated?: boolean;
}

const TrackSearch: React.FC<TrackSearchProps> = ({
  onSelectTrack,
  onAddToQueue,
  currentTrack,
  musicSource = 'audius',
  onSourceChange,
  spotifyAuthenticated = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AudiusTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        let tracks: AudiusTrack[] = [];
        
        if (musicSource === 'spotify' && spotifyAuthenticated) {
          tracks = await searchSpotifyTracks(query);
        } else {
          tracks = await searchTracks(query);
        }
        
        setResults(tracks);
        setLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, musicSource, spotifyAuthenticated]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-md z-40 px-4" ref={searchRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/50">
          <Search size={18} />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-20 py-3 border-2 border-charcoal/10 rounded-full leading-5 bg-white/80 backdrop-blur-sm placeholder-charcoal/40 focus:outline-none focus:border-retro-orange focus:ring-0 sm:text-sm transition-colors font-mono shadow-sm"
          placeholder={`Search ${musicSource === 'spotify' ? 'Spotify' : 'Audius'}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {query && (
            <button
              className="text-charcoal/50 hover:text-retro-orange transition-colors p-1"
              onClick={() => { setQuery(''); setResults([]); }}
            >
              <X size={16} />
            </button>
          )}
          {/* Source Toggle */}
          {spotifyAuthenticated && onSourceChange && (
            <button
              onClick={() => onSourceChange(musicSource === 'spotify' ? 'audius' : 'spotify')}
              className={`text-xs font-bold px-2 py-1 rounded transition-colors ${
                musicSource === 'spotify'
                  ? 'bg-green-500 text-white'
                  : 'bg-charcoal/10 text-charcoal/60 hover:bg-charcoal/20'
              }`}
              title={`Switch to ${musicSource === 'spotify' ? 'Audius' : 'Spotify'}`}
            >
              {musicSource === 'spotify' ? '♪ SP' : 'AU'}
            </button>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      {(isOpen || loading) && (
        <div className="absolute mt-2 w-full bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-charcoal/5 overflow-hidden max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex justify-center items-center text-charcoal/50">
              <Loader2 className="animate-spin mr-2" size={20} />
              <span>Digging crates...</span>
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-charcoal/5">
              {results.map((track) => (
                <li
                  key={track.id}
                  className="hover:bg-matcha cursor-pointer transition-colors p-3 flex items-center gap-3"
                  onClick={() => {
                    onSelectTrack(track);
                    setIsOpen(false);
                    setQuery('');
                  }}
                >
                  <img
                    src={getArtworkUrl(track)}
                    alt={track.title}
                    className="w-10 h-10 rounded-md object-cover border border-charcoal/10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-charcoal">{track.title}</p>
                    <p className="text-xs text-charcoal/60 truncate">{track.user.name}</p>
                  </div>
                  {currentTrack?.id === track.id ? (
                    <div className="text-retro-orange">
                      <Music size={16} />
                    </div>
                  ) : (
                    <button
                      className="text-charcoal/40 hover:text-retro-orange transition-colors p-1"
                      title="Add to Queue"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(track);
                        setQuery(''); // Optional: clear search after adding? Maybe keep it open.
                        // Let's keep it open or close depending on UX. The user wanted to "queue in songs", implied plural.
                        // So I won't close it, but I should probably give feedback.
                        // For now just add to queue.
                      }}
                    >
                      <PlusCircle size={20} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            query.length > 2 && (
              <div className="p-4 text-center text-charcoal/50 text-sm">
                No tracks found. Try a different genre.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default TrackSearch;