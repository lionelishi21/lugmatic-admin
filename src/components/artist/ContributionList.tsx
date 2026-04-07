import React from 'react';
import { Music, CheckCircle2, ChevronRight, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Contribution {
  _id: string;
  title: string;
  artist: any;
  coverImage: string;
  duration: number;
  status: string;
  share: number;
  role: string;
}

interface ContributionListProps {
  contributions: Contribution[];
  loading?: boolean;
}

const ContributionList: React.FC<ContributionListProps> = ({ contributions, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <Music className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm font-medium">No contributions yet</p>
        <p className="text-xs">When you are added to a split sheet, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contributions.map((song) => (
        <div 
          key={song._id} 
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative group/cover">
              <img
                src={song.coverImage || '/default-track-cover.jpg'}
                alt={song.title}
                className="w-12 h-12 rounded-lg object-cover shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-track-cover.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Percent className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                {song.title}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 uppercase tracking-tight">
                  {song.role}
                </span>
                <span className="text-[10px] font-medium text-gray-500">
                  {song.share}% Share
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            </div>
            <button 
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              onClick={() => navigate(`/artist/song-edit/${song._id}`)}
              title="View Split Details"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContributionList;
