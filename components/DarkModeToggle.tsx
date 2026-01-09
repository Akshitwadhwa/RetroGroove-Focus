import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface DarkModeToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ isDark, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white/20 dark:bg-charcoal/20 backdrop-blur-md border border-charcoal/10 dark:border-white/10 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl group"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <div className="relative w-6 h-6">
                {/* Sun Icon */}
                <Sun
                    size={24}
                    className={`absolute inset-0 text-retro-orange transition-all duration-500 ${isDark
                            ? 'opacity-0 rotate-90 scale-0'
                            : 'opacity-100 rotate-0 scale-100'
                        }`}
                />
                {/* Moon Icon */}
                <Moon
                    size={24}
                    className={`absolute inset-0 text-blue-300 transition-all duration-500 ${isDark
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 -rotate-90 scale-0'
                        }`}
                />
            </div>

            {/* Glow effect on hover */}
            <div className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 ${isDark ? 'bg-blue-300' : 'bg-retro-orange'
                }`} />
        </button>
    );
};

export default DarkModeToggle;
