'use client';

interface CommunityScoreProps {
  score: number;
  size?: number;
  label?: string;
  showBreakdown?: boolean;
  breakdown?: {
    environment: number;
    mobility: number;
    water: number;
    safety: number;
    satisfaction: number;
  };
}

export default function CommunityScore({ score, size = 120, label, showBreakdown, breakdown }: CommunityScoreProps) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#eab308';
    if (s >= 40) return '#f97316';
    return '#ef4444';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth="8"
            fill="none"
          />
          {/* Score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring transition-all duration-1000"
            style={{
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">/100</span>
        </div>
      </div>
      {label && <div className="mt-2 text-sm text-slate-400">{label}</div>}
      {showBreakdown && breakdown && (
        <div className="mt-3 w-full space-y-1.5">
          {[
            { label: 'Environment', value: breakdown.environment, color: '#22c55e' },
            { label: 'Mobility', value: breakdown.mobility, color: '#3b82f6' },
            { label: 'Water', value: breakdown.water, color: '#06b6d4' },
            { label: 'Safety', value: breakdown.safety, color: '#f97316' },
            { label: 'Satisfaction', value: breakdown.satisfaction, color: '#a855f7' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-20 text-right">{item.label}</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.value}%`, backgroundColor: item.color }}
                />
              </div>
              <span className="text-[10px] text-slate-400 w-8">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
