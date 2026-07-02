'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  trend?: number;
  trendLabel?: string;
  color?: string;
  status?: 'good' | 'warning' | 'critical';
}

export default function MetricCard({ title, value, unit, icon, trend, trendLabel, color = '#3b82f6', status }: MetricCardProps) {
  const getStatusBorder = () => {
    if (status === 'critical') return 'border-red-500/40 hover:border-red-500/70';
    if (status === 'warning') return 'border-yellow-500/40 hover:border-yellow-500/70';
    if (status === 'good') return 'border-green-500/40 hover:border-green-500/70';
    return 'border-slate-700/50 hover:border-blue-500/50';
  };

  const getStatusGlow = () => {
    if (status === 'critical') return 'hover:shadow-red-500/10';
    if (status === 'warning') return 'hover:shadow-yellow-500/10';
    if (status === 'good') return 'hover:shadow-green-500/10';
    return 'hover:shadow-blue-500/10';
  };

  return (
    <div className={`glow-card p-4 ${getStatusBorder()} ${getStatusGlow()} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold" style={{ color }}>{value}</span>
        {unit && <span className="text-sm text-slate-500 mb-0.5">{unit}</span>}
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="mt-2 flex items-center gap-1.5">
          {trend !== undefined && (
            <span className={`text-xs font-medium ${trend > 0 ? 'text-red-400' : trend < 0 ? 'text-green-400' : 'text-slate-400'}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
            </span>
          )}
          {trendLabel && <span className="text-[10px] text-slate-600">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
