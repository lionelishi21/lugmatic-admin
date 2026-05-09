import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Shield } from 'lucide-react';

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-3 mb-10 overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/5 rounded text-[10px] font-black text-emerald-500 uppercase tracking-widest italic shadow-lg">
         <Shield size={10} className="animate-pulse" />
         NODE_PATH
      </div>
      
      <Link 
        to="/" 
        className="flex items-center text-zinc-600 hover:text-emerald-500 transition-colors group"
      >
        <div className="w-8 h-8 rounded bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors shadow-xl">
          <Home size={14} />
        </div>
      </Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const label = value.replace(/-/g, '_');

        return (
          <React.Fragment key={to}>
            <div className="flex flex-col items-center gap-0.5 opacity-20">
               <div className="w-1 h-1 bg-white rounded-full" />
               <ChevronRight size={10} className="text-white" />
            </div>
            <Link
              to={to}
              className={`text-[10px] font-black uppercase tracking-[0.2em] italic transition-all whitespace-nowrap px-3 py-1.5 rounded ${
                last 
                  ? 'text-emerald-500 bg-emerald-500/5 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] cursor-default pointer-events-none' 
                  : 'text-zinc-600 border border-transparent hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {label}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
