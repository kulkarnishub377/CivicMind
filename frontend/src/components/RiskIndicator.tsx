'use client';

interface RiskIndicatorProps {
  label: string;
  level: 'Low' | 'Medium' | 'High';
  icon?: string;
}

export default function RiskIndicator({ label, level, icon = '⚠️' }: RiskIndicatorProps) {
  const config = {
    Low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-400' },
    Medium: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-400' },
    High: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
  };

  const c = config[level];

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${c.bg} border ${c.border}`}>
      <span>{icon}</span>
      <span className="text-xs text-slate-400 flex-1">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${c.dot} ${level === 'High' ? 'animate-pulse' : ''}`} />
        <span className={`text-xs font-semibold ${c.text}`}>{level}</span>
      </div>
    </div>
  );
}
