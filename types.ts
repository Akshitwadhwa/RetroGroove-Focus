export interface AudiusTrack {
  id: string;
  title: string;
  user: {
    username: string;
    name: string;
  };
  artwork: {
    '150x150': string;
    '480x480': string;
    '1000x1000': string;
  } | null;
  duration: number;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTrack: AudiusTrack | null;
  volume: number;
  queue: AudiusTrack[];
}

export interface TimerState {
  timeLeft: number; // in seconds
  isActive: boolean;
  mode: 'focus' | 'break';
}