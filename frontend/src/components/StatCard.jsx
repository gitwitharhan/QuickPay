import React from 'react';

export default function StatCard({ title, value, icon, trend, suffix = "" }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-white/[0.02]">
      {/* Glow Effect */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-3xl transition-opacity group-hover:opacity-100 opacity-0" />
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium tracking-wider text-white/40 uppercase font-['Syne']">{title}</span>
        {icon && <div className="text-white/60 group-hover:text-white transition-colors">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors font-['Inter']">
          {suffix && <span className="text-xl mr-1 text-white/30 font-normal">{suffix}</span>}
          {value}
        </h3>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
}
