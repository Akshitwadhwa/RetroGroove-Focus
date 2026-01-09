import React from 'react';
import { AudiusTrack } from '../types';
import { ListMusic, X } from 'lucide-react';

interface QueueListProps {
    queue: AudiusTrack[];
    onRemove: (index: number) => void;
}

const QueueList: React.FC<QueueListProps> = ({ queue, onRemove }) => {
    if (queue.length === 0) return null;

    return (
        <div className="w-full max-w-[300px] mt-6 bg-white/40 dark:bg-charcoal/40 backdrop-blur-sm rounded-xl p-4 border border-charcoal/5 dark:border-matcha/5 transition-colors duration-500">
            <div className="flex items-center gap-2 mb-3 text-charcoal/60 dark:text-matcha/60">
                <ListMusic size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Queue ({queue.length})</span>
            </div>
            <ul className="space-y-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-charcoal/20 dark:scrollbar-thumb-matcha/20">
                {queue.map((track, index) => (
                    <li key={`${track.id}-${index}`} className="flex items-center justify-between group p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors">
                        <div className="flex-1 min-w-0 mr-2">
                            <p className="text-xs font-bold truncate text-charcoal dark:text-matcha">{track.title}</p>
                            <p className="text-[10px] text-charcoal/60 dark:text-matcha/60 truncate">{track.user.name}</p>
                        </div>
                        <button
                            onClick={() => onRemove(index)}
                            className="text-charcoal/40 dark:text-matcha/40 hover:text-retro-orange dark:hover:text-retro-orange opacity-0 group-hover:opacity-100 transition-all"
                            aria-label="Remove from queue"
                        >
                            <X size={14} />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default QueueList;
