'use client';

import { useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import RiskIndicator from '@/components/RiskIndicator';
import {
  currentWardData,
  predictions,
  recommendations,
  calculateCommunityScore,
  getCategoryScores,
  generateTimeSeries,
  complaintCategories,
} from '@/data/mockData';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f97316', '#ef4444'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);
  const [selectedWards, setSelectedWards] = useState<string[]>(['Ward D', 'Ward C']);
  const timeSeries = useMemo(() => generateTimeSeries(), []);

  const filteredData = useMemo(() => {
    return timeSeries
      .filter(t => selectedWards.includes(t.ward))
      .slice(-timeRange);
  }, [timeSeries, selectedWards, timeRange]);

  // Prepare chart data
  const aqiData = useMemo(() => {
    const grouped: Record<string, any> = {};
    filteredData.forEach(d => {
      if (!grouped[d.date]) grouped[d.date] = { date: d.date.slice(5) };
      grouped[d.date][d.ward] = d.aqi;
    });
    return Object.values(grouped);
  }, [filteredData]);

  const rainData = useMemo(() => {
    const grouped: Record<string, any> = {};
    filteredData.forEach(d => {
      if (!grouped[d.date]) grouped[d.date] = { date: d.date.slice(5) };
      grouped[d.date][d.ward] = d.rainfall;
    });
    return Object.values(grouped);
  }, [filteredData]);

  const trafficData = useMemo(() => {
    const grouped: Record<string, any> = {};
    filteredData.forEach(d => {
      if (!grouped[d.date]) grouped[d.date] = { date: d.date.slice(5) };
      grouped[d.date][d.ward] = d.trafficIndex;
    });
    return Object.values(grouped);
  }, [filteredData]);

  const sentimentData = useMemo(() => {
    const grouped: Record<string, any> = {};
    filteredData.forEach(d => {
      if (!grouped[d.date]) grouped[d.date] = { date: d.date.slice(5) };
      grouped[d.date][d.ward] = d.sentiment;
    });
    return Object.values(grouped);
  }, [filteredData]);

  // Radar data for all wards
  const radarData = useMemo(() => {
    const categories = ['environment', 'mobility', 'water', 'safety', 'satisfaction'];
    return categories.map(cat => {
      const point: Record<string, any> = { category: cat.charAt(0).toUpperCase() + cat.slice(1) };
      currentWardData.forEach(w => {
        point[w.ward] = getCategoryScores(w)[cat as keyof ReturnType<typeof getCategoryScores>];
      });
      return point;
    });
  }, []);

  const toggleWard = (ward: string) => {
    setSelectedWards(prev =>
      prev.includes(ward)
        ? prev.filter(w => w !== ward)
        : [...prev, ward]
    );
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[240px] p-6 grid-bg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Predictive Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">AI-powered forecasting and risk assessment for SmartVille</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Time range selector */}
            <div className="flex bg-slate-800 rounded-lg p-0.5">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days as 7 | 14 | 30)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    timeRange === days ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
            {/* Ward filters */}
            <div className="flex gap-1">
              {currentWardData.map((w, i) => (
                <button
                  key={w.ward}
                  onClick={() => toggleWard(w.ward)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                    selectedWards.includes(w.ward)
                      ? 'text-white'
                      : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                  style={selectedWards.includes(w.ward) ? { backgroundColor: COLORS[i] + '30', color: COLORS[i], border: `1px solid ${COLORS[i]}50` } : {}}
                >
                  {w.ward}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Assessment Grid */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {predictions.map((pred, i) => (
            <div key={pred.ward} className="glow-card p-4">
              <div className="text-sm font-semibold text-white mb-3">{pred.ward}</div>
              <div className="space-y-1.5">
                <RiskIndicator label="Flood" level={pred.floodRisk} icon="🌊" />
                <RiskIndicator label="Water" level={pred.waterShortageRisk} icon="💧" />
                <RiskIndicator label="Traffic" level={pred.trafficCongestion} icon="🚗" />
                <RiskIndicator label="Waste" level={pred.wasteOverflow} icon="🗑️" />
                <RiskIndicator label="Pollution" level={pred.pollutionSpike} icon="☁️" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* AQI Trend */}
          <div className="glow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Air Quality Index Trend</div>
              <span className="text-xs text-slate-600">Last {timeRange} days</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={aqiData}>
                <defs>
                  {selectedWards.map((ward, i) => (
                    <linearGradient key={ward} id={`aqi-${ward}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[currentWardData.findIndex(w => w.ward === ward)]} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COLORS[currentWardData.findIndex(w => w.ward === ward)]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval={Math.floor(timeRange / 6)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {selectedWards.map((ward, idx) => {
                  const i = currentWardData.findIndex(w => w.ward === ward);
                  return (
                    <Area key={ward} type="monotone" dataKey={ward} stroke={COLORS[i]} fill={`url(#aqi-${ward})`} strokeWidth={2} dot={false} />
                  );
                })}
                {/* Safe threshold line */}
                <Line type="monotone" dataKey={() => 100} stroke="#ef4444" strokeDasharray="5 5" dot={false} name="Safe Limit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Rainfall */}
          <div className="glow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Rainfall Trend</div>
              <span className="text-xs text-slate-600">mm per day</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={rainData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval={Math.floor(timeRange / 6)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {selectedWards.map((ward) => {
                  const i = currentWardData.findIndex(w => w.ward === ward);
                  return <Bar key={ward} dataKey={ward} fill={COLORS[i]} radius={[3, 3, 0, 0]} />;
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Traffic */}
          <div className="glow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Traffic Congestion Trend</div>
              <span className="text-xs text-slate-600">Congestion index</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval={Math.floor(timeRange / 6)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {selectedWards.map((ward) => {
                  const i = currentWardData.findIndex(w => w.ward === ward);
                  return <Line key={ward} type="monotone" dataKey={ward} stroke={COLORS[i]} strokeWidth={2} dot={false} />;
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment */}
          <div className="glow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Citizen Satisfaction Trend</div>
              <span className="text-xs text-slate-600">Sentiment score (0-100)</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={sentimentData}>
                <defs>
                  {selectedWards.map((ward, idx) => (
                    <linearGradient key={ward} id={`sent-${ward}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[currentWardData.findIndex(w => w.ward === ward)]} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={COLORS[currentWardData.findIndex(w => w.ward === ward)]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval={Math.floor(timeRange / 6)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {selectedWards.map((ward) => {
                  const i = currentWardData.findIndex(w => w.ward === ward);
                  return (
                    <Area key={ward} type="monotone" dataKey={ward} stroke={COLORS[i]} fill={`url(#sent-${ward})`} strokeWidth={2} dot={false} />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar + Recommendations */}
        <div className="grid grid-cols-2 gap-4">
          {/* Radar Chart */}
          <div className="glow-card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">Ward Comparison Radar</div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis tick={{ fontSize: 8, fill: '#64748b' }} domain={[0, 100]} />
                {currentWardData.map((w, i) => (
                  <Radar key={w.ward} name={w.ward} dataKey={w.ward} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} />
                ))}
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Complaint Categories + Details */}
          <div className="glow-card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">Complaint Analysis</div>
            <div className="space-y-2">
              {complaintCategories.map((cat, i) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-32 truncate">{cat.category}</span>
                  <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(cat.count / 156) * 100}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-10 text-right">{cat.count}</span>
                  <span className={`text-[10px] w-10 text-right ${cat.trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {cat.trend > 0 ? '+' : ''}{cat.trend}%
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Prediction Summary</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="text-lg font-bold text-red-400">3</div>
                  <div className="text-[10px] text-slate-400">High Risk Alerts</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                  <div className="text-lg font-bold text-orange-400">5</div>
                  <div className="text-[10px] text-slate-400">Medium Risk Alerts</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-400">12</div>
                  <div className="text-[10px] text-slate-400">Low Risk Areas</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-400">87%</div>
                  <div className="text-[10px] text-slate-400">Avg. Confidence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
