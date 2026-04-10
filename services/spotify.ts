import SpotifyWebApi from 'spotify-web-api-js';
import { AudiusTrack } from '../types';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;
const REDIRECT_URI =
  (import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined) ||
  `${window.location.origin}/callback`;

const spotifyApi = new SpotifyWebApi();

// Generate PKCE challenge
const generateRandomString = (length: number): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => ('0' + (b % 64).toString(16)).slice(-2))
    .join('')
    .slice(0, length);
};

const base64UrlEncode = (bytes: Uint8Array): string => {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const createCodeChallenge = async (verifier: string): Promise<string> => {
  if (!crypto?.subtle) {
    throw new Error(
      'Your browser context does not support PKCE S256. Open the app on http://localhost or http://127.0.0.1 and try again.'
    );
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
};

// Get authorization code from URL params
export const getAuthorizationCode = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('code') || null;
};

export const getAuthorizationError = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('error');
};

// Generate Spotify login URL with PKCE
export const getSpotifyLoginUrl = async (): Promise<string> => {
  if (!CLIENT_ID) {
    throw new Error('Spotify Client ID missing. Set VITE_SPOTIFY_CLIENT_ID.');
  }

  const clientId = CLIENT_ID;

  const codeVerifier = generateRandomString(96);
  const challenge = await createCodeChallenge(codeVerifier);

  sessionStorage.setItem('spotify_code_verifier', codeVerifier);

  const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: scopes.join(' '),
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// Exchange authorization code for access token
export const exchangeCodeForToken = async (
  code: string
): Promise<{ accessToken: string; expiresIn: number } | null> => {
  if (!CLIENT_ID) {
    console.error('Spotify Client ID missing.');
    return null;
  }

  const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
  if (!codeVerifier) {
    console.error('Code verifier not found in session storage.');
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }).toString(),
    });

    if (!response.ok) {
      console.error('Token exchange failed:', await response.text());
      return null;
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    sessionStorage.removeItem('spotify_code_verifier');
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('Error exchanging code:', error);
    return null;
  }
};

// Set access token
export const setSpotifyAccessToken = (token: string) => {
  spotifyApi.setAccessToken(token);
  localStorage.setItem('spotify_access_token', token);
};

// Restore token from storage
export const restoreSpotifyToken = (): boolean => {
  const token = localStorage.getItem('spotify_access_token');
  if (token && !isTokenExpired()) {
    spotifyApi.setAccessToken(token);
    return true;
  }

  if (token && isTokenExpired()) {
    clearSpotifyToken();
  }

  return false;
};

// Clear token
export const clearSpotifyToken = () => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_token_expires');
  sessionStorage.removeItem('spotify_code_verifier');
  spotifyApi.setAccessToken('');
};

// Store token with expiration
export const storeSpotifyToken = (token: string, expiresIn: number = 3600) => {
  localStorage.setItem('spotify_access_token', token);
  localStorage.setItem('spotify_token_expires', (Date.now() + expiresIn * 1000).toString());
  spotifyApi.setAccessToken(token);
};

export const getSpotifyAccessToken = (): string | null => {
  return localStorage.getItem('spotify_access_token');
};

// Check if token is expired
export const isTokenExpired = (): boolean => {
  const expiresAt = localStorage.getItem('spotify_token_expires');
  if (!expiresAt) return true;
  return Date.now() > parseInt(expiresAt);
};

const toArtwork = (url?: string) => {
  if (!url) return null;
  return {
    '150x150': url,
    '480x480': url,
    '1000x1000': url,
  };
};

// Search for tracks
export const searchSpotifyTracks = async (query: string): Promise<AudiusTrack[]> => {
  if (!query) return [];
  try {
    const results = await spotifyApi.searchTracks(query, { limit: 10, market: 'from_token' });
    return results.tracks.items
      .map((track) => {
        const artistName = track.artists[0]?.name || 'Unknown Artist';
        return {
          id: track.id,
          title: track.name,
          user: {
            username: artistName.toLowerCase().replace(/\s+/g, '_'),
            name: artistName,
          },
          artwork: toArtwork(track.album.images[0]?.url),
          duration: Math.floor(track.duration_ms / 1000),
          preview_url: track.preview_url || undefined,
          spotify_url: track.external_urls?.spotify,
          uri: track.uri,
          source: 'spotify',
        };
      });
  } catch (error) {
    console.error('Spotify search error:', error);
    return [];
  }
};

// Get track preview URL (for playback)
export const getSpotifyTrackPreview = async (trackId: string): Promise<string | null> => {
  try {
    const track = await spotifyApi.getTrack(trackId);
    return track.preview_url;
  } catch (error) {
    console.error('Error fetching track preview:', error);
    return null;
  }
};

// Get user profile (to verify authentication)
export const getSpotifyUserProfile = async () => {
  try {
    return await spotifyApi.getMe();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Check if user is authenticated
export const isSpotifyAuthenticated = (): boolean => {
  return !!localStorage.getItem('spotify_access_token') && !isTokenExpired();
};
