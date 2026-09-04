import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TiltCard } from './TiltCard';

interface MetricCard3DProps {
  id?: string;
  title: string;
  value: string | number;
  subValue?: string;
  subtext?: string; // alias
  trend?: string;
  badge?: string; // alias
  trendUp?: boolean;
  icon: LucideIcon;
  colorScheme?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'blue';
  color?: string; // alias
  progress?: number; // 0 to 100
}

export const MetricCard3D: React.FC<MetricCard3DProps> = ({
  id,
  title,
  value,
  subValue,
  subtext,
  trend,
  badge,
  trendUp = true,
  icon: Icon,
  colorScheme,
  color,
  progress,
}) => {
  const schemeStyles = {
    cyan: {
      border: 'border-cyan-500/20',
      glow: 'from-cyan-500/10 to-transparent',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      textAccent: 'text-cyan-400',
      progressBg: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      shadow: 'shadow-[0_0_25px_rgba(6,182,212,0.15)]',
    },
    purple: {
      border: 'border-purple-500/20',
      glow: 'from-purple-500/10 to-transparent',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      textAccent: 'text-purple-400',
      progressBg: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      shadow: 'shadow-[0_0_25px_rgba(168,85,247,0.15)]',
    },
    emerald: {
      border: 'border-emerald-500/20',
      glow: 'from-emerald-500/10 to-transparent',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      textAccent: 'text-emerald-400',
      progressBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      shadow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
    },
    amber: {
      border: 'border-amber-500/20',
      glow: 'from-amber-500/10 to-transparent',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      textAccent: 'text-amber-400',
      progressBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      shadow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
    },
    rose: {
      border: 'border-rose-500/20',
      glow: 'from-rose-500/10 to-transparent',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      textAccent: 'text-rose-400',
      progressBg: 'bg-gradient-to-r from-rose-500 to-pink-500',
      shadow: 'shadow-[0_0_25px_rgba(244,63,94,0.15)]',
    },
  };

  const rawColor = String(colorScheme || color || 'cyan').toLowerCase();
  const schemeKey = (
    rawColor === 'indigo' || rawColor === 'blue'
      ? 'purple'
      : ['cyan', 'purple', 'emerald', 'amber', 'rose'].includes(rawColor)
      ? rawColor
      : 'cyan'
  ) as 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';

  const style = schemeStyles[schemeKey] || schemeStyles.cyan;
  const displaySub = subValue || subtext;
  const displayTrend = trend || badge;

  return (
    <TiltCard
      id={id}
      glowColor={schemeKey === 'rose' ? 'default' : schemeKey}
      className={`p-5 overflow-hidden ${style.shadow}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${style.glow} rounded-full blur-2xl pointer-events-none`} />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-display">
              {value}
            </span>
            {displaySub && (
              <span className="text-xs text-slate-400 font-medium">
                {displaySub}
              </span>
            )}
          </div>
        </div>

        <div className={`p-3 rounded-xl border ${style.iconBg} shadow-inner transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-slate-300">
            <span>Tiến độ hoàn thành</span>
            <span className={style.textAccent}>{progress}%</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50 p-0.5">
            <div
              className={`h-full rounded-full ${style.progressBg} transition-all duration-700 shadow-sm`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {displayTrend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={`font-semibold ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trendUp ? '▲' : '▼'} {displayTrend}
          </span>
          <span className="text-slate-400">so với kỳ trước</span>
        </div>
      )}
    </TiltCard>
  );
};
