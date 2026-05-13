import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Shield, Layers } from 'lucide-react';

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
      <Link 
        to="/" 
        className="flex items-center text-zinc-500 hover:text-white transition-colors group"
      >
        <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center group-hover:border-white/10 transition-colors shadow-xl">
          <Home size={18} />
        </div>
      </Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        // Replace dashes with spaces and capitalize words
        const label = value
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return (
          <React.Fragment key={to}>
            <ChevronRight size={14} className="text-zinc-800 shrink-0" />
            <Link
              to={to}
              className={`text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap px-4 py-2 rounded-xl border ${
                last 
                  ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20 shadow-xl cursor-default pointer-events-none' 
                  : 'text-zinc-500 border-white/5 hover:text-white hover:bg-zinc-950 shadow-lg'
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
