import { AudiusTrack } from '../types';

const APP_NAME = 'VinylFocusApp';

// In a real production app, we would query https://api.audius.co to get a list of hosts.
// For this demo, we will use a fallback list of known discovery nodes to ensure reliability if the main one fails.
const DISCOVERY_NODES = [
  'https://discoveryprovider.audius.co',
  'https://discoveryprovider2.audius.co',
  'https://discoveryprovider3.audius.co',
];

let selectedHost = DISCOVERY_NODES[0];

// Helper to try fetching from different hosts if one fails
async function fetchWithFailover(path: string): Promise<any> {
  for (const host of DISCOVERY_NODES) {
    try {
      const response = await fetch(`${host}${path}`);
      if (response.ok) {
        selectedHost = host; // Remember working host
        return await response.json();
      }
    } catch (e) {
      console.warn(`Failed to fetch from ${host}`, e);
      continue;
    }
  }
  throw new Error("All Audius discovery nodes failed.");
}

export const searchTracks = async (query: string): Promise<AudiusTrack[]> => {
  if (!query) return [];
  try {
    const data = await fetchWithFailover(`/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${APP_NAME}&limit=10`);
    return data.data;
  } catch (error) {
    console.error("Audius search error:", error);
    return [];
  }
};

export const getStreamUrl = (trackId: string): string => {
  return `${selectedHost}/v1/tracks/${trackId}/stream?app_name=${APP_NAME}`;
};

export const getArtworkUrl = (track: AudiusTrack): string => {
  if (!track.artwork) return 'https://picsum.photos/400/400';
  return track.artwork['1000x1000'] || track.artwork['480x480'] || track.artwork['150x150'] || 'https://picsum.photos/400/400';
};