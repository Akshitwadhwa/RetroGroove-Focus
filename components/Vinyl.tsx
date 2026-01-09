import React from 'react';
import { motion } from 'framer-motion';
import { AudiusTrack } from '../types';
import { getArtworkUrl } from '../services/audius';

interface VinylProps {
  isPlaying: boolean;
  track: AudiusTrack | null;
}

const Vinyl: React.FC<VinylProps> = ({ isPlaying, track }) => {
  const artworkUrl = track ? getArtworkUrl(track) : 'https://picsum.photos/400/400';
  const trackTitle = track ? `${track.title} • ${track.user.name} • ` : 'SELECT TRACK • AUDIUS PLAYER • ';
  
  // Create a repeating string to fill the circle
  const circularText = (trackTitle.toUpperCase() + " ").repeat(3);

  return (
    <div className="relative w-[340px] h-[340px] sm:w-[450px] sm:h-[450px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] xl:w-[700px] xl:h-[700px] flex-shrink-0 transition-all duration-500 ease-in-out">
      {/* Shadow */}
      <div className="absolute inset-4 rounded-full bg-black/20 blur-2xl transform translate-y-4" />

      {/* The Record Container - Spins when playing */}
      <motion.div
        className="w-full h-full rounded-full relative overflow-hidden shadow-2xl"
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ 
          repeat: Infinity, 
          duration: 4, 
          ease: "linear",
          // When isPlaying becomes false, we want it to stop naturally, but for CSS vinyl typically we just stop or pause. 
          // Framer motion's animate prop will tween to 0 if we aren't careful. 
          // A better approach for continuous spinning is usually CSS animation with play-state, 
          // but we can simulate start/stop here.
          type: "tween"
        }}
        // Override animation to only spin when playing, otherwise maintain current rotation (complex with pure Framer Motion simple prop).
        // Let's use standard CSS class for spinning to handle pause/play state more gracefully without resetting rotation.
        // We will wrap the inner content in a div controlled by CSS class.
        style={{ rotate: 0 }} // Reset framer rotation to use CSS instead
      >
         <div 
           className={`w-full h-full rounded-full relative bg-vinyl-black border border-white/5 ${isPlaying ? 'animate-spin-slow' : ''}`}
           style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
         >
            {/* Vinyl Grooves (gradients) */}
            <div className="absolute inset-0 rounded-full opacity-30" 
                 style={{ 
                   background: `
                     repeating-radial-gradient(
                       #333 0, 
                       #333 2px, 
                       #111 3px, 
                       #111 4px
                     )
                   ` 
                 }} 
            />
            
            {/* Shininess / Reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent opacity-20 pointer-events-none" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-white/5 to-transparent opacity-10 pointer-events-none" />

            {/* Inner Label Container */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[45%] rounded-full bg-[#e8e0d5] shadow-lg flex items-center justify-center overflow-hidden border-4 border-dashed border-charcoal/20">
              
              {/* Artwork */}
              {track && (
                 <img 
                   src={artworkUrl} 
                   alt="Album Art" 
                   className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply"
                 />
              )}

              {/* Center Hole */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border border-gray-300 z-10" />
            </div>

            {/* Circular Text (SVG) */}
            <div className="absolute inset-0 pointer-events-none animate-spin-slower">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path
                  id="textCircle"
                  d="M 50, 50 m -28, 0 a 28, 28 0 1,1 56, 0 a 28, 28 0 1,1 -56, 0"
                  fill="none"
                />
                <text className="text-[5.5px] font-bold font-mono fill-[#e8e0d5]/80 tracking-widest">
                  <textPath href="#textCircle" startOffset="0%">
                    {circularText}
                  </textPath>
                </text>
              </svg>
            </div>
         </div>
      </motion.div>

      {/* Tonearm */}
      <motion.div
        className="absolute -top-10 -right-10 w-24 h-64 origin-[top_right] z-20 pointer-events-none hidden md:block"
        initial={{ rotate: 0 }}
        animate={{ rotate: isPlaying ? 25 : 0 }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
      >
        {/* Arm Base */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#b8b8b8] rounded-full shadow-xl border-4 border-[#999] flex items-center justify-center">
            <div className="w-4 h-4 bg-charcoal rounded-full" />
        </div>
        
        {/* Arm Rod */}
        <div className="absolute top-8 right-8 w-2 h-48 bg-[#d4d4d4] origin-top transform rotate-6 rounded-sm shadow-md border-l border-white/40"></div>
        
        {/* Headgallery / Needle */}
        <div className="absolute bottom-6 left-10 w-12 h-20 bg-retro-orange rounded-md shadow-lg transform -rotate-12 border border-black/10 flex flex-col items-center justify-end pb-2">
             <div className="w-1 h-3 bg-black/50 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};

export default Vinyl;