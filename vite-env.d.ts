/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID?: string;
  readonly VITE_SPOTIFY_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  Spotify?: {
    Player: new (options: {
      name: string;
      getOAuthToken: (cb: (token: string) => void) => void;
      volume?: number;
    }) => {
      connect: () => Promise<boolean>;
      disconnect: () => void;
      addListener: (event: string, callback: (data: any) => void) => void;
      setVolume: (volume: number) => Promise<void>;
      activateElement?: () => Promise<void>;
    };
  };
  onSpotifyWebPlaybackSDKReady?: () => void;
}