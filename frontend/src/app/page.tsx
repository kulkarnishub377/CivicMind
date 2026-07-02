'use client';

import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import CommunityScore from '@/components/CommunityScore';
import MetricCard from '@/components/MetricCard';
import RiskIndicator from '@/components/RiskIndicator';
import {
  currentWardData,
  predictions,
  recommendations,
  calculateCommunityScore,
  calculateCityScore,
  getCategoryScores,
  generateTimeSeries,
  complaintCategories,
} from '@/data/mockData';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f97316', '#ef4444'];

export default function Dashboard() {
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [displayCityScore, setDisplayCityScore] = useState(81);
  const timeSeries = useMemo(() => generateTimeSeries(), []);

  const cityScore = calculateCityScore();
  const wardScores = currentWardData.map(w => ({ ward: w.ward, score: calculateCommunityScore(w) }));

  // Animate city score drop
  useEffect(() => {
    const timer = setTimeout(() => setDisplayCityScore(cityScore), 600);
    return () => clearTimeout(timer);
  }, [cityScore]);

  // Filter time series by selected ward or all
  const chartData = useMemo(() => {
    const wards = selectedWard ? [selectedWard] : ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'Ward E'];
    return timeSeries.filter(t => wards.includes(t.ward));
  }, [timeSeries, selectedWard]);

  // Aggregate daily data for charts
  const aqiTrend = useMemo(() => {
    const grouped: Record<string, any> = {};
    chartData.forEach(d => {
      if (!grouped[d.date]) grouped[d.date] = { date: d.date.slice(5) };
      grouped[d.date][d.ward] = d.aqi;
    });
    return Object.values(grouped);
  }, [chartData]);

  const complaintsTrend = useMemo(() => {
    const grouped: Record<string, any> = {};
    chartData.forEach(d => {
      if (!grouped[d.date]) grouped[d.date] = { date: d.date.slice(5) };
      grouped[d.date][d.ward] = d.complaints;
    });
    return Object.values(grouped);
  }, [chartData]);

  const selectedWardData = selectedWard ? currentWardData.find(w => w.ward === selectedWard) : null;
  const selectedWardPredictions = selectedWard ? predictions.find(p => p.ward === selectedWard) : null;
  const selectedWardRecommendations = selectedWard ? recommendations.filter(r => r.ward === selectedWard) : recommendations.slice(0, 3);

  const pieData = complaintCategories.slice(0, 6).map(c => ({ name: c.category, value: c.count }));

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[240px] p-6 grid-bg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Community Decision Intelligence Platform</h1>
            <p className="text-sm text-slate-500 mt-1">SmartVille — Real-time community monitoring & AI-powered decision support</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
              <span className="text-xs text-red-400 font-medium animate-pulse">● Crisis Active</span>
            </div>
            <div className="text-xs text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Top: City Score + Ward Map + Community Pulse */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* City Score with drop indicator */}
          <div className="col-span-2 glow-card p-5 flex flex-col items-center border-red-500/20">
            <div className="text-[10px] text-red-400 uppercase tracking-wider mb-2">Community Health</div>
            <CommunityScore score={displayCityScore} size={130} />
            <div className="text-[10px] text-red-400 mt-2 font-medium">
              81 → {displayCityScore} ▼
            </div>
          </div>

          {/* Ward Score Bars */}
          <div className="col-span-4 glow-card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">Ward Comparison</div>
            <div className="flex items-end justify-between gap-3 h-[130px]">
              {wardScores.map((w, i) => {
                const wardPred = predictions.find(p => p.ward === w.ward);
                const hasCritical = wardPred && Object.values(wardPred).some(v => v === 'High');
                return (
                  <button
                    key={w.ward}
                    onClick={() => setSelectedWard(selectedWard === w.ward ? null : w.ward)}
                    className={`flex-1 flex flex-col items-center gap-2 group transition-all ${
                      selectedWard === w.ward ? 'scale-105' : ''
                    }`}
                  >
                    <div
                      className="w-full rounded-t-lg transition-all duration-500 relative"
                      style={{
                        height: `${w.score}%`,
                        backgroundColor: COLORS[i],
                        opacity: selectedWard && selectedWard !== w.ward ? 0.3 : 1,
                      }}
                    >
                      {hasCritical && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      )}
                    </div>
                    <span className={`text-[10px] ${selectedWard === w.ward ? 'text-white' : 'text-slate-500'}`}>
                      {w.ward.replace('Ward ', '')}
                    </span>
                    <span className={`text-xs font-bold ${selectedWard === w.ward ? 'text-white' : 'text-slate-400'}`}>
                      {w.score}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Community Pulse Card */}
          <div className="col-span-3 glow-card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">❤️ Community Pulse</div>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 64 64" className="w-full h-full">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#1e293b" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="26" fill="none"
                    stroke="#22c55e"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - 0.72)}`}
                    className="score-ring"
                    transform="rotate(-90 32 32)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">72</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-8">👍</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '55%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 w-7">55%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-8">😐</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: '25%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 w-7">25%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-8">👎</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '20%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 w-7">20%</span>
                </div>
              </div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
              <p className="text-[10px] text-slate-400">
                Negative sentiment ↑ due to <strong className="text-white">water interruptions in Ward D</strong>
              </p>
            </div>
          </div>

          {/* Risk Alerts */}
          <div className="col-span-3 glow-card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">Active Risk Alerts</div>
            <div className="space-y-2">
              <RiskIndicator label="Flood Risk — Ward C" level="High" icon="🌊" />
              <RiskIndicator label="Water Shortage — Ward D" level="High" icon="💧" />
              <RiskIndicator label="Air Quality — Ward D" level="High" icon="🌫️" />
              <RiskIndicator label="Traffic — Ward B" level="High" icon="🚗" />
              <RiskIndicator label="Waste Overflow — Ward D" level="High" icon="🗑️" />
              <RiskIndicator label="Pollution Spike — Ward B" level="Medium" icon="☁️" />
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <MetricCard
            title="Air Quality Index"
            value={selectedWardData?.aqi || currentWardData.reduce((a, b) => a + b.aqi, 0) / 5}
            unit="AQI"
            icon="🌬️"
            trend={18}
            trendLabel="avg"
            color={selectedWardData && selectedWardData.aqi > 150 ? '#ef4444' : selectedWardData && selectedWardData.aqi > 100 ? '#f97316' : '#3b82f6'}
            status={selectedWardData && selectedWardData.aqi > 150 ? 'critical' : selectedWardData && selectedWardData.aqi > 100 ? 'warning' : undefined}
          />
          <MetricCard
            title="Traffic Congestion"
            value={selectedWardData?.trafficIndex || Math.round(currentWardData.reduce((a, b) => a + b.trafficIndex, 0) / 5)}
            unit="index"
            icon="🚦"
            trend={12}
            trendLabel="avg"
            color={selectedWardData && selectedWardData.trafficIndex > 70 ? '#f97316' : '#3b82f6'}
            status={selectedWardData && selectedWardData.trafficIndex > 70 ? 'warning' : undefined}
          />
          <MetricCard
            title="Water Usage"
            value={selectedWardData?.waterUsage || Math.round(currentWardData.reduce((a, b) => a + b.waterUsage, 0) / 5)}
            unit="% capacity"
            icon="💧"
            trend={8}
            trendLabel="avg"
            color={selectedWardData && selectedWardData.waterUsage > 90 ? '#ef4444' : '#06b6d4'}
            status={selectedWardData && selectedWardData.waterUsage > 90 ? 'critical' : undefined}
          />
          <MetricCard
            title="Citizen Complaints"
            value={selectedWardData?.complaints || currentWardData.reduce((a, b) => a + b.complaints, 0) / 5}
            unit="today"
            icon="📢"
            trend={23}
            trendLabel="avg"
            color={selectedWardData && selectedWardData.complaints > 100 ? '#ef4444' : '#a855f7'}
            status={selectedWardData && selectedWardData.complaints > 100 ? 'critical' : undefined}
          />
          <MetricCard
            title="Community Pulse"
            value={72}
            unit="/100"
            icon="❤️"
            trend={-8}
            trendLabel="sentiment"
            color="#a855f7"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* AQI Trend */}
          <div className="glow-card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">AQI Trend (30 Days)</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={aqiTrend}>
                <defs>
                  <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval={6} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#94a3b8' }} />
                {['Ward A', 'Ward B', 'Ward C', 'Ward D', 'Ward E'].map((ward, i) => (
                  <Area key={ward} type="monotone" dataKey={ward} stroke={COLORS[i]} fill="none" strokeWidth={2} dot={false} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Complaints Trend */}
          <div className="glow-card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Complaint Trend (30 Days)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={complaintsTrend.filter((_, i) => i % 2 === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#94a3b8' }} />
                {['Ward A', 'Ward B', 'Ward C', 'Ward D', 'Ward E'].map((ward, i) => (
                  <Bar key={ward} dataKey={ward} fill={COLORS[i]} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Complaint Categories */}
          <div className="glow-card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Complaint Categories</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-1">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-[9px] text-slate-500">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Predictions with Explainability + Recommendations */}
        <div className="grid grid-cols-2 gap-4">
          {/* Predictions with WHY */}
          <div className="glow-card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">🤖 AI Predictive Intelligence</div>
            <div className="space-y-3">
              {(selectedWardPredictions ? [selectedWardPredictions] : predictions).map(pred => (
                <div key={pred.ward} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-white">{pred.ward}</div>
                    {pred.floodRisk === 'High' && (
                      <span className="text-[9px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded border border-red-500/20 animate-pulse">CRISIS</span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    <RiskIndicator label="Flood" level={pred.floodRisk} />
                    <RiskIndicator label="Water" level={pred.waterShortageRisk} />
                    <RiskIndicator label="Traffic" level={pred.trafficCongestion} />
                    <RiskIndicator label="Waste" level={pred.wasteOverflow} />
                    <RiskIndicator label="Pollution" level={pred.pollutionSpike} />
                  </div>
                  {/* Explainability row */}
                  {pred.floodRisk === 'High' && (
                    <div className="bg-purple-500/10 border border-purple-500/15 rounded p-2 mt-2">
                      <div className="text-[9px] text-purple-400 uppercase tracking-wider mb-1">🧠 Why High Flood Risk?</div>
                      <div className="text-[10px] text-slate-400">
                        Rainfall +40% above normal · Drainage complaints +18% · Historical: 3 similar floods · Reservoir at 75% capacity
                      </div>
                    </div>
                  )}
                  {pred.waterShortageRisk === 'High' && (
                    <div className="bg-purple-500/10 border border-purple-500/15 rounded p-2 mt-2">
                      <div className="text-[9px] text-purple-400 uppercase tracking-wider mb-1">🧠 Why High Water Shortage?</div>
                      <div className="text-[10px] text-slate-400">
                        Usage at 95% capacity · Reservoir only 35% · Pipeline leaks ~15% · Rainfall 3mm (insufficient recharge)
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="glow-card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">💡 AI Recommendations</div>
            <div className="space-y-3">
              {selectedWardRecommendations.map(rec => (
                <div key={rec.id} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rec.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                      rec.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                      rec.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {rec.severity}
                    </span>
                    <span className="text-sm font-medium text-white">{rec.ward}</span>
                    <span className="ml-auto text-xs text-slate-500">Confidence: {rec.confidence}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{rec.problem}</p>
                  <div className="space-y-1">
                    {rec.recommendations.slice(0, 3).map((action, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">→</span>
                        <span className="text-xs text-slate-300">{action}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-700/50">
                    <span className="text-[10px] text-green-400">Expected Impact:</span>
                    <span className="text-[10px] text-slate-400 ml-1">{rec.expectedImpact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Ward Detail */}
        {selectedWardData && (
          <div className="mt-6 glow-card p-5 border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedWardData.ward} — Detailed Analysis</h3>
                <p className="text-xs text-slate-500">Powered by AI Agents: Environment + Mobility + Citizen + Recommendation</p>
              </div>
              <CommunityScore
                score={calculateCommunityScore(selectedWardData)}
                size={80}
                showBreakdown
                breakdown={getCategoryScores(selectedWardData)}
              />
            </div>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(getCategoryScores(selectedWardData)).map(([key, val]) => {
                const icons: Record<string, string> = { environment: '🌿', mobility: '🚗', water: '💧', safety: '🛡️', satisfaction: '😊' };
                return (
                  <div key={key} className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-lg">{icons[key]}</span>
                    <div className="text-lg font-bold" style={{ color: val >= 70 ? '#22c55e' : val >= 50 ? '#eab308' : '#ef4444' }}>{val}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{key}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
