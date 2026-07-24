import React from 'react';
import { Droplets } from 'lucide-react';

export default function NavBrandLogo({ subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
        <Droplets className="w-5.5 h-5.5" />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-black bg-gradient-to-r from-blue-900 to-indigo-950 bg-clip-text text-transparent tracking-wider leading-none">
          Novawash
        </span>
        {subtitle && (
          <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
