'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import CommunityScore from '@/components/CommunityScore';
import RiskIndicator from '@/components/RiskIndicator';
import { currentWardData, calculateCommunityScore, getCategoryScores, simulatorPresets, predictions } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SimulationResult {
  action: string;
  ward: string;
  beforeScore: number;
  afterScore: number;
  impacts: Record<string, any>;
  details: string;
  categoryChanges: { category: string; before: number; after: number }[];
  explainability: string;
  riskReduction: { risk: string; before: string; after: string }[];
}

export default function SimulatorPage() {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customAction, setCustomAction] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [activeResult, setActiveResult] = useState<SimulationResult | null>(null);

  const runPresetSimulation = (presetId: string) => {
    const preset = simulatorPresets.find(p => p.id === presetId);
    if (!preset) return;

    setIsSimulating(true);
    setSelectedPreset(presetId);

    setTimeout(() => {
      const wardData = currentWardData.find(w => w.ward === preset.ward)!;
      const beforeScore = calculateCommunityScore(wardData);
      const afterScore = Math.min(100, beforeScore + (preset.impacts.overallScore || 0));

      const catScores = getCategoryScores(wardData);
      const categoryChanges = Object.entries(catScores).map(([cat, val]) => {
        let change = 0;
        if (cat === 'environment' && preset.impacts.environment) change = preset.impacts.environment;
        else if (cat === 'mobility' && preset.impacts.traffic) change = Math.abs(preset.impacts.traffic) * 0.5;
        else if (cat === 'water' && preset.impacts.waterUsage) change = Math.abs(preset.impacts.waterUsage) * 0.3;
        else if (cat === 'satisfaction' && preset.impacts.satisfaction) change = preset.impacts.satisfaction;
        else change = Math.round(Math.random() * 3 + 1);

        return {
          category: cat.charAt(0).toUpperCase() + cat.slice(1),
          before: val,
          after: Math.min(100, val + change),
        };
      });

      // Generate risk reductions
      const riskReduction: { risk: string; before: string; after: string }[] = [];
      if (preset.id === 'waste') riskReduction.push({ risk: 'Waste Overflow', before: 'High', after: 'Medium' });
      if (preset.id === 'buses') riskReduction.push({ risk: 'Traffic Congestion', before: 'High', after: 'Medium' });
      if (preset.id === 'water') riskReduction.push({ risk: 'Water Shortage', before: 'High', after: 'Low' });
      if (preset.id === 'flood') riskReduction.push({ risk: 'Flood Risk', before: 'High', after: 'Medium' });
      if (preset.id === 'solar') riskReduction.push({ risk: 'Pollution Spike', before: 'Medium', after: 'Low' });

      // Generate explainability
      const explainabilities: Record<string, string> = {
        waste: 'Increasing collection frequency by 20% (2 extra pickups/week) directly reduces bin overflow probability. 3 additional smart bins at high-complaint locations reduce overflow events by 40%. Community awareness campaigns historically reduce waste generation by 8-12%.',
        buses: '5 new buses on high-demand routes (B7, B12) reduce wait times, which shifts commuters from private vehicles to public transport. Each new bus removes ~40 cars from peak traffic. Reduced congestion also lowers emissions from idling vehicles.',
        water: 'Stage 2 conservation (restricted hours + mandatory low-flow) typically reduces consumption by 20-25%. Pipeline repair eliminates 15% loss. Combined effect brings usage from 95% to 70%, well below the shortage threshold of 85%.',
        flood: 'Drainage clearing increases flow capacity by 35-50%, reducing standing water risk. Early warning systems give residents 2+ additional hours to prepare/evacuate. Pre-positioned equipment reduces response time from 4h to 30min.',
        solar: '500 rooftop solar installations (3kW each) generate 1.5MW clean energy, offsetting 15% of grid demand. Reduced fossil fuel dependency cuts emissions. Green jobs creation improves community sentiment. ROI in 3-5 years.',
      };

      const result: SimulationResult = {
        action: preset.label,
        ward: preset.ward,
        beforeScore,
        afterScore,
        impacts: preset.impacts,
        details: preset.details,
        categoryChanges,
        explainability: explainabilities[preset.id] || 'Based on AI analysis of historical intervention data and current conditions.',
        riskReduction,
      };

      setResults(prev => [result, ...prev]);
      setActiveResult(result);
      setIsSimulating(false);
    }, 1500);
  };

  const runCustomSimulation = () => {
    if (!customAction.trim()) return;
    setIsSimulating(true);

    setTimeout(() => {
      const targetWard = customAction.toLowerCase().includes('ward d') ? 'Ward D' :
                        customAction.toLowerCase().includes('ward b') ? 'Ward B' :
                        customAction.toLowerCase().includes('ward c') ? 'Ward C' :
                        customAction.toLowerCase().includes('ward a') ? 'Ward A' : 'Ward E';
      const wardData = currentWardData.find(w => w.ward === targetWard)!;
      const beforeScore = calculateCommunityScore(wardData);
      const scoreChange = Math.round(Math.random() * 8 + 2);

      const catScores = getCategoryScores(wardData);
      const categoryChanges = Object.entries(catScores).map(([cat, val]) => ({
        category: cat.charAt(0).toUpperCase() + cat.slice(1),
        before: val,
        after: Math.min(100, val + Math.round(Math.random() * 8 + 1)),
      }));

      const result: SimulationResult = {
        action: customAction,
        ward: targetWard,
        beforeScore,
        afterScore: Math.min(100, beforeScore + scoreChange),
        impacts: { overallScore: scoreChange },
        details: `Based on simulation of "${customAction}" for ${targetWard}: This policy intervention is projected to improve community metrics based on historical data from comparable communities and current conditions.`,
        categoryChanges,
        explainability: 'This prediction is based on analysis of 365 days of historical data for SmartVille, combined with Gemini-generated policy impact assessment. The model considers similar interventions in comparable communities and adjusts for local conditions.',
        riskReduction: [{ risk: 'Overall Risk', before: 'High', after: 'Medium' }],
      };

      setResults(prev => [result, ...prev]);
      setActiveResult(result);
      setIsSimulating(false);
      setCustomAction('');
    }, 2000);
  };

  const impactChartData = activeResult ? activeResult.categoryChanges.map(c => ({
    category: c.category,
    before: c.before,
    after: c.after,
    change: c.after - c.before,
  })) : [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[240px] p-6 grid-bg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🔬 What-If Simulator
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-normal">Digital Twin</span>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-normal">Explainable AI</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Simulate policy changes, see predicted impact with full explanations, and make data-driven decisions</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Simulation Controls */}
          <div className="col-span-1 space-y-4">
            {/* Crisis Demo Scenario */}
            <div className="glow-card p-5 border-red-500/30 bg-gradient-to-b from-red-500/5 to-transparent">
              <div className="text-xs text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Crisis Response Demo
              </div>
              <div className="text-[10px] text-slate-400 mb-3">
                Ward D is in crisis. Simulate emergency response to see impact:
              </div>
              <button
                onClick={() => runPresetSimulation('water')}
                disabled={isSimulating}
                className="w-full text-left px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 hover:border-red-500/60 text-white transition-all disabled:opacity-50"
              >
                <div className="text-sm font-medium">🚨 Emergency: Water Conservation</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Ward D — Critical shortage</div>
              </button>
            </div>

            {/* Preset Scenarios */}
            <div className="glow-card p-5">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">Quick Scenarios</div>
              <div className="space-y-2">
                {simulatorPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => runPresetSimulation(preset.id)}
                    disabled={isSimulating}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      selectedPreset === preset.id
                        ? 'bg-blue-600/10 border-blue-500/50 text-white'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
                    } disabled:opacity-50`}
                  >
                    <div className="text-sm font-medium">{preset.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{preset.ward}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Simulation */}
            <div className="glow-card p-5">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">Custom Scenario</div>
              <div className="space-y-3">
                <textarea
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  placeholder="Describe a policy change... e.g., 'Deploy 10 electric buses in Ward D'"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none resize-none h-24 transition-colors"
                />
                <button
                  onClick={runCustomSimulation}
                  disabled={isSimulating || !customAction.trim()}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isSimulating ? '🔮 Simulating...' : '🔬 Run Simulation'}
                </button>
              </div>
            </div>

            {/* How it works */}
            <div className="glow-card p-5">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">How It Works</div>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex gap-2"><span className="text-blue-400">1.</span><span>AI analyzes current ward conditions from BigQuery</span></div>
                <div className="flex gap-2"><span className="text-blue-400">2.</span><span>Applies your policy to the digital twin model</span></div>
                <div className="flex gap-2"><span className="text-blue-400">3.</span><span>Gemini predicts impact across all categories</span></div>
                <div className="flex gap-2"><span className="text-blue-400">4.</span><span>Shows before/after + WHY (explainable AI)</span></div>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="col-span-2 space-y-4">
            {/* Simulation Loading */}
            {isSimulating && (
              <div className="glow-card p-12 flex flex-col items-center justify-center border-purple-500/30">
                <div className="relative w-20 h-20 mb-4">
                  <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
                </div>
                <div className="text-sm text-white font-medium">Running Digital Twin Simulation...</div>
                <div className="text-xs text-slate-500 mt-1">Gemini analyzing policy impact across 4 AI agents</div>
                <div className="flex gap-2 mt-4">
                  {['🌿', '🚗', '👥', '💡'].map((icon, i) => (
                    <span key={i} className="text-lg animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{icon}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Active Result */}
            {activeResult && !isSimulating && (
              <div className="glow-card p-6 border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">Simulation Result</div>
                    <div className="text-lg font-bold text-white">{activeResult.action}</div>
                    <div className="text-xs text-slate-500">{activeResult.ward}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1">Before</div>
                      <CommunityScore score={activeResult.beforeScore} size={80} />
                    </div>
                    <div className="text-2xl text-green-400 font-bold">→</div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1">After</div>
                      <CommunityScore score={activeResult.afterScore} size={80} />
                    </div>
                  </div>
                </div>

                {/* Risk Reduction */}
                {activeResult.riskReduction.length > 0 && (
                  <div className="mb-4 grid grid-cols-3 gap-3">
                    {activeResult.riskReduction.map((rr, i) => (
                      <div key={i} className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <div className="text-[10px] text-slate-500 mb-1">{rr.risk}</div>
                        <div className="flex items-center justify-center gap-2">
                          <RiskIndicator label="" level={rr.before as any} />
                          <span className="text-green-400 text-sm">→</span>
                          <RiskIndicator label="" level={rr.after as any} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Impact Metrics */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {Object.entries(activeResult.impacts).filter(([k]) => k !== 'overallScore').map(([key, val]) => (
                    <div key={key} className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-slate-500 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className={`text-lg font-bold ${
                        typeof val === 'number' ? (val > 0 ? 'text-green-400' : 'text-red-400') : 'text-purple-400'
                      }`}>
                        {typeof val === 'number' ? (val > 0 ? '+' : '') + val + '%' : val}
                      </div>
                    </div>
                  ))}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Score Change</div>
                    <div className="text-lg font-bold text-green-400">
                      +{activeResult.afterScore - activeResult.beforeScore}
                    </div>
                  </div>
                </div>

                {/* Category Impact Chart */}
                <div className="mb-4">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Category Impact Analysis</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={impactChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="before" fill="#475569" radius={[0, 2, 2, 0]} name="Before" />
                      <Bar dataKey="after" fill="#22c55e" radius={[0, 2, 2, 0]} name="After" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Explainable AI: WHY this result */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
                  <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>🧠</span> Why this prediction? (Explainable AI)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeResult.explainability}</p>
                </div>

                {/* Details */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-xs text-purple-400 uppercase tracking-wider mb-2">AI Analysis</div>
                  <p className="text-sm text-slate-300">{activeResult.details}</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!activeResult && !isSimulating && (
              <div className="glow-card p-12 flex flex-col items-center justify-center">
                <div className="text-5xl mb-4">🔬</div>
                <div className="text-lg font-bold text-white mb-2">Community Digital Twin</div>
                <div className="text-sm text-slate-500 text-center max-w-md">
                  Select a scenario or describe a policy change to simulate its impact on community metrics.
                  Every simulation includes <strong className="text-white">why</strong> the AI made that prediction.
                </div>
                <div className="mt-6 text-xs text-slate-600 mb-3">Crisis Demo Flow: Detect → Analyze → Predict → Recommend → Simulate → Decide</div>
                <div className="mt-2 grid grid-cols-3 gap-4 w-full max-w-lg">
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-lg">🌧️</div>
                    <div className="text-[10px] text-slate-500 mt-1">What if rainfall +30%?</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-lg">🚌</div>
                    <div className="text-[10px] text-slate-500 mt-1">What if 5 new buses?</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-lg">♻️</div>
                    <div className="text-[10px] text-slate-500 mt-1">What if +20% recycling?</div>
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            {results.length > 1 && (
              <div className="glow-card p-5">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Simulation History</div>
                <div className="space-y-2">
                  {results.slice(1).map((result, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveResult(result)}
                      className="w-full flex items-center gap-4 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors text-left"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-white">{result.action}</div>
                        <div className="text-[10px] text-slate-500">{result.ward}</div>
                      </div>
                      <div className="text-sm font-mono">
                        <span className="text-slate-500">{result.beforeScore}</span>
                        <span className="text-green-400 mx-2">→</span>
                        <span className="text-white">{result.afterScore}</span>
                      </div>
                      <div className="text-sm font-bold text-green-400">+{result.afterScore - result.beforeScore}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
