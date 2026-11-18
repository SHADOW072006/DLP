import React from 'react';
import { Shield } from 'lucide-react';

export default function PlaceholderPage({ title, description, phaseBadge }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {title}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
        {phaseBadge && (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-800 border border-slate-700 text-slate-300">
            {phaseBadge}
          </span>
        )}
      </div>

      <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-3">
        <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
          <Shield className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">{title} Module Active</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Connected to the IntelliDLP core architecture. Full operational controls and interactive tables will be enabled in subsequent targeted phases.
        </p>
      </div>
    </div>
  );
}

