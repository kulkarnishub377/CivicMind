'use client';

import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import CommunityScore from '@/components/CommunityScore';
import RiskIndicator from '@/components/RiskIndicator';
import {
  currentWardData,
  predictions,
  recommendations,
  calculateCommunityScore,
  getCategoryScores,
  complaintCategories,
} from '@/data/mockData';

// ─── Types ────────────────────────────────────────────────────────

interface CriticalIssue {
  id: string;
  issue: string;
  ward: string;
  severity: 'Critical' | 'High' | 'Medium';
  confidence: number;
  drivers: string[];
  trend: 'worsening' | 'stable' | 'improving';
}

interface ActionItem {
  id: string;
  action: string;
  ward: string;
  impact: 'High' | 'Medium' | 'Low';
  cost: 'Low' | 'Medium' | 'High';
  timeline: string;
  type: 'immediate' | 'short-term' | 'long-term';
}

interface AgentStep {
  agent: string;
  color: string;
  icon: string;
  event: string;
  output: string;
  timestamp: string;
}

// ─── Data Factories ───────────────────────────────────────────────

function buildCriticalIssues(): CriticalIssue[] {
  return [
    {
      id: 'ci-1',
      issue: 'Flood Risk',
      ward: 'Ward C',
      severity: 'Critical',
      confidence: 92,
      drivers: ['Rainfall +40% above normal', 'Drainage complaints +18%', 'Water level in drains +25%', '3 historical floods in similar conditions'],
      trend: 'worsening',
    },
    {
      id: 'ci-2',
      issue: 'AQI Spike',
      ward: 'Ward D',
      severity: 'Critical',
      confidence: 88,
      drivers: ['Industrial emissions +45%', 'Low rainfall (3mm)', 'Temperature 36°C → ground-level ozone', 'Wind speed only 3 km/h'],
      trend: 'worsening',
    },
    {
      id: 'ci-3',
      issue: 'Water Shortage',
      ward: 'Ward D',
      severity: 'Critical',
      confidence: 88,
      drivers: ['Usage at 95% capacity', 'Reservoir at 35% (critical)', 'Pipeline leaks estimated 15%', 'Rainfall only 3mm this week'],
      trend: 'worsening',
    },
    {
      id: 'ci-4',
      issue: 'Waste Overflow',
      ward: 'Ward D',
      severity: 'High',
      confidence: 79,
      drivers: ['Complaints +45% this week', 'Collection frequency insufficient', 'Bin capacity at 90%', 'Overflow predicted in 5 days'],
      trend: 'worsening',
    },
    {
      id: 'ci-5',
      issue: 'Traffic Congestion',
      ward: 'Ward B',
      severity: 'High',
      confidence: 81,
      drivers: ['Traffic index 72 (heavy)', 'Bus delays averaging 15 min', 'Road construction on Route B7', 'Peak hour volume +30%'],
      trend: 'stable',
    },
    {
      id: 'ci-6',
      issue: 'Drainage Blockage',
      ward: 'Ward C',
      severity: 'Medium',
      confidence: 75,
      drivers: ['12 complaints this week', 'Debris accumulation after rain', 'Maintenance schedule overdue'],
      trend: 'improving',
    },
  ];
}

function buildActionItems(): ActionItem[] {
  return [
    { id: 'a1', action: 'Clear drainage channels in Ward C', ward: 'Ward C', impact: 'High', cost: 'Low', timeline: '0-24h', type: 'immediate' },
    { id: 'a2', action: 'Deploy emergency water tankers to Ward D', ward: 'Ward D', impact: 'High', cost: 'Medium', timeline: '0-24h', type: 'immediate' },
    { id: 'a3', action: 'Issue flood advisory for Ward C residents', ward: 'Ward C', impact: 'High', cost: 'Low', timeline: '0-12h', type: 'immediate' },
    { id: 'a4', action: 'Enforce emission standards in Zone D2', ward: 'Ward D', impact: 'High', cost: 'Low', timeline: '0-48h', type: 'immediate' },
    { id: 'a5', action: 'Deploy traffic marshals on Route B7', ward: 'Ward B', impact: 'Medium', cost: 'Low', timeline: '1-3 days', type: 'short-term' },
    { id: 'a6', action: 'Increase waste collection by 2x in Ward D', ward: 'Ward D', impact: 'High', cost: 'Medium', timeline: '1-3 days', type: 'short-term' },
    { id: 'a7', action: 'Activate smog towers in affected zones', ward: 'Ward D', impact: 'Medium', cost: 'High', timeline: '3-7 days', type: 'short-term' },
    { id: 'a8', action: 'Implement dynamic traffic signals', ward: 'Ward B', impact: 'High', cost: 'Medium', timeline: '2-4 weeks', type: 'long-term' },
    { id: 'a9', action: 'Install smart water meters in Ward D', ward: 'Ward D', impact: 'Medium', cost: 'High', timeline: '2-4 weeks', type: 'long-term' },
    { id: 'a10', action: 'Launch community solar program in Ward E', ward: 'Ward E', impact: 'Medium', cost: 'High', timeline: '1-3 months', type: 'long-term' },
  ];
}

function buildAgentTimeline(): AgentStep[] {
  return [
    { agent: 'Environment Agent', color: '#22c55e', icon: '🌿', event: 'Heavy rainfall detected — 40% above seasonal normal', output: 'Flood risk elevated to HIGH for Ward C', timestamp: '10:02 AM' },
    { agent: 'Environment Agent', color: '#22c55e', icon: '🌿', event: 'AQI spike in Ward D — index at 168, unsafe levels', output: 'Air quality alert triggered for Ward D', timestamp: '10:03 AM' },
    { agent: 'Mobility Agent', color: '#3b82f6', icon: '🚗', event: 'Road congestion predicted due to rainfall + construction', output: 'Traffic forecast: Severe delays in Ward B & C', timestamp: '10:05 AM' },
    { agent: 'Mobility Agent', color: '#3b82f6', icon: '🚗', event: 'Bus delays increasing — Route B7 +18 min average', output: 'Public transport disruption alert issued', timestamp: '10:06 AM' },
    { agent: 'Citizen Agent', color: '#a855f7', icon: '👥', event: 'Drainage complaints +18% in Ward C', output: 'Citizen dissatisfaction rising — sentiment dropping', timestamp: '10:08 AM' },
    { agent: 'Citizen Agent', color: '#a855f7', icon: '👥', event: 'Water supply complaints spike in Ward D — 30 new reports', output: 'Negative sentiment threshold breached in Ward D', timestamp: '10:09 AM' },
    { agent: 'Recommendation Agent', color: '#f97316', icon: '💡', event: 'Synthesizing all agent outputs...', output: 'Priority: CRITICAL — Ward D & Ward C need immediate intervention', timestamp: '10:10 AM' },
    { agent: 'Recommendation Agent', color: '#f97316', icon: '💡', event: 'Generating action plan based on combined analysis', output: '6 immediate actions + 4 short-term actions recommended', timestamp: '10:11 AM' },
  ];
}

// ─── Ward Map SVG ─────────────────────────────────────────────────

function WardMap({ selectedWard, onSelectWard }: { selectedWard: string | null; onSelectWard: (w: string) => void }) {
  const wards = currentWardData.map(w => ({
    name: w.ward,
    score: calculateCommunityScore(w),
  }));

  const getColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getGlow = (score: number) => {
    if (score >= 80) return 'rgba(34,197,94,0.2)';
    if (score >= 60) return 'rgba(234,179,8,0.2)';
    if (score >= 40) return 'rgba(249,115,22,0.2)';
    return 'rgba(239,68,68,0.2)';
  };

  const wardShapes = [
    { name: 'Ward A', x: 60, y: 40, w: 140, h: 110, cx: 130, cy: 95 },
    { name: 'Ward B', x: 210, y: 30, w: 150, h: 120, cx: 285, cy: 90 },
    { name: 'Ward C', x: 50, y: 160, w: 160, h: 130, cx: 130, cy: 225 },
    { name: 'Ward D', x: 220, y: 160, w: 170, h: 140, cx: 305, cy: 230 },
    { name: 'Ward E', x: 130, y: 300, w: 180, h: 100, cx: 220, cy: 350 },
  ];

  return (
    <svg viewBox="0 0 440 420" className="w-full h-full">
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59,130,246,0.05)" strokeWidth="0.5" />
        </pattern>
        {wardShapes.map((ward) => {
          const data = wards.find(w => w.name === ward.name)!;
          return (
            <filter key={`glow-${ward.name}`} id={`glow-${ward.name.replace(' ', '')}`}>
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          );
        })}
      </defs>
      <rect width="440" height="420" fill="url(#grid)" rx="8" />

      {/* Ward shapes */}
      {wardShapes.map((shape) => {
        const data = wards.find(w => w.name === shape.name)!;
        const color = getColor(data.score);
        const glow = getGlow(data.score);
        const isSelected = selectedWard === shape.name;

        return (
          <g key={shape.name} onClick={() => onSelectWard(shape.name)} className="cursor-pointer">
            {/* Glow effect */}
            <rect
              x={shape.x - 4}
              y={shape.y - 4}
              width={shape.w + 8}
              height={shape.h + 8}
              rx="12"
              fill={glow}
              opacity={isSelected ? 1 : 0.5}
            />
            {/* Ward body */}
            <rect
              x={shape.x}
              y={shape.y}
              width={shape.w}
              height={shape.h}
              rx="8"
              fill={isSelected ? color + '25' : color + '12'}
              stroke={isSelected ? color : color + '50'}
              strokeWidth={isSelected ? 2.5 : 1.5}
              style={{ transition: 'all 0.3s ease' }}
            />
            {/* Ward label */}
            <text
              x={shape.cx}
              y={shape.cy - 10}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="11"
              fontWeight="600"
            >
              {shape.name}
            </text>
            {/* Score */}
            <text
              x={shape.cx}
              y={shape.cy + 14}
              textAnchor="middle"
              fill={color}
              fontSize="26"
              fontWeight="800"
            >
              {data.score}
            </text>
            {/* Status dot */}
            <circle
              cx={shape.x + shape.w - 12}
              cy={shape.y + 12}
              r="4"
              fill={color}
              className={data.score < 50 ? 'animate-pulse' : ''}
            />
          </g>
        );
      })}

      {/* Roads/connections between wards */}
      <line x1="200" y1="95" x2="210" y2="90" stroke="#334155" strokeWidth="2" strokeDasharray="4,4" />
      <line x1="130" y1="150" x2="130" y2="160" stroke="#334155" strokeWidth="2" strokeDasharray="4,4" />
      <line x1="285" y1="150" x2="305" y2="160" stroke="#334155" strokeWidth="2" strokeDasharray="4,4" />
      <line x1="200" y1="290" x2="220" y2="300" stroke="#334155" strokeWidth="2" strokeDasharray="4,4" />
      <line x1="130" y1="290" x2="160" y2="300" stroke="#334155" strokeWidth="2" strokeDasharray="4,4" />

      {/* City label */}
      <text x="220" y="400" textAnchor="middle" fill="#475569" fontSize="10" letterSpacing="2">
        SMARTVILLE CITY MAP
      </text>
    </svg>
  );
}

// ─── Explainable AI Panel ─────────────────────────────────────────

function ExplainableAIPanel({ issue }: { issue: CriticalIssue }) {
  const severityStyles: Record<string, string> = {
    Critical: 'bg-red-500/15 text-red-400 border-red-500/30',
    High: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    Medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  };

  const trendStyles: Record<string, { icon: string; color: string }> = {
    worsening: { icon: '↗', color: 'text-red-400' },
    stable: { icon: '→', color: 'text-yellow-400' },
    improving: { icon: '↘', color: 'text-green-400' },
  };

  const trend = trendStyles[issue.trend];

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${severityStyles[issue.severity]}`}>
            {issue.severity}
          </span>
          <span className="text-sm font-semibold text-white">{issue.issue}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${trend.color}`}>{trend.icon} {issue.trend}</span>
          <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">{issue.confidence}%</span>
        </div>
      </div>
      <div className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        {issue.ward}
      </div>

      {/* Explainable AI: WHY */}
      <div className="bg-slate-900/60 rounded-lg p-3">
        <div className="text-[10px] uppercase tracking-widest text-purple-400 mb-2 flex items-center gap-1.5">
          <span>🧠</span> Why this prediction?
        </div>
        <div className="space-y-1.5">
          {issue.drivers.map((driver, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
              <span className="text-xs text-slate-300">{driver}</span>
            </div>
          ))}
        </div>
        {/* Contribution bars */}
        <div className="mt-3 space-y-1">
          {issue.drivers.map((driver, i) => {
            const widths = [90, 75, 60, 45];
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${widths[i] || 50}%`, opacity: 0.6 + (0.1 * (4 - i)) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Agent Timeline ───────────────────────────────────────────────

function AgentTimeline({ steps }: { steps: AgentStep[] }) {
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    if (visibleSteps < steps.length) {
      const timer = setTimeout(() => setVisibleSteps(v => v + 1), 400);
      return () => clearTimeout(timer);
    }
  }, [visibleSteps, steps.length]);

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-700" />

      <div className="space-y-4">
        {steps.slice(0, visibleSteps).map((step, i) => (
          <div key={i} className="flex gap-4 fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            {/* Agent dot */}
            <div
              className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 border-2"
              style={{
                backgroundColor: step.color + '20',
                borderColor: step.color + '50',
              }}
            >
              {step.icon}
            </div>

            {/* Content */}
            <div className="flex-1 bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: step.color }}>
                  {step.agent}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">{step.timestamp}</span>
              </div>
              <div className="text-xs text-slate-400 mb-1">{step.event}</div>
              <div className="text-xs text-white font-medium bg-slate-900/50 rounded px-2 py-1 inline-block">
                → {step.output}
              </div>
            </div>
          </div>
        ))}

        {visibleSteps < steps.length && (
          <div className="flex items-center gap-4 pl-1">
            <div className="w-7 h-7 rounded-full border-2 border-slate-600 border-t-blue-400 animate-spin" />
            <span className="text-xs text-slate-500">Agents collaborating...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Community Pulse ──────────────────────────────────────────────

function CommunityPulse() {
  const pulseScore = 72;
  const positive = 55;
  const neutral = 25;
  const negative = 20;

  // Per-ward sentiment
  const wardSentiment = [
    { ward: 'Ward A', positive: 62, neutral: 25, negative: 13, pulse: 78 },
    { ward: 'Ward B', positive: 40, neutral: 30, negative: 30, pulse: 55 },
    { ward: 'Ward C', positive: 72, neutral: 20, negative: 8, pulse: 86 },
    { ward: 'Ward D', positive: 18, neutral: 22, negative: 60, pulse: 32 },
    { ward: 'Ward E', positive: 50, neutral: 30, negative: 20, pulse: 68 },
  ];

  return (
    <div className="space-y-4">
      {/* Main Pulse Score */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke={pulseScore >= 70 ? '#22c55e' : pulseScore >= 50 ? '#eab308' : '#ef4444'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - pulseScore / 100)}`}
              className="score-ring"
              transform="rotate(-90 40 40)"
              style={{ filter: `drop-shadow(0 0 8px ${pulseScore >= 70 ? 'rgba(34,197,94,0.4)' : 'rgba(234,179,8,0.4)'})` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{pulseScore}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white mb-2">Community Pulse</div>
          {/* Sentiment bars */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-10">👍</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${positive}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 w-8">{positive}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-10">😐</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${neutral}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 w-8">{neutral}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-10">👎</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${negative}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 w-8">{negative}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ward sentiment breakdown */}
      <div className="space-y-2">
        {wardSentiment.map(ws => (
          <div key={ws.ward} className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-3 py-2">
            <span className="text-[10px] text-slate-500 w-12">{ws.ward.replace('Ward ', 'W')}</span>
            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-green-500/70 transition-all duration-500" style={{ width: `${ws.positive}%` }} />
              <div className="h-full bg-yellow-500/70 transition-all duration-500" style={{ width: `${ws.neutral}%` }} />
              <div className="h-full bg-red-500/70 transition-all duration-500" style={{ width: `${ws.negative}%` }} />
            </div>
            <span className={`text-xs font-bold w-6 text-right ${ws.pulse >= 70 ? 'text-green-400' : ws.pulse >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {ws.pulse}
            </span>
          </div>
        ))}
      </div>

      {/* AI Explanation */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
        <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-1">🧠 AI Insight</div>
        <p className="text-xs text-slate-300">
          Negative sentiment increased primarily due to <strong className="text-white">water supply interruptions in Ward D</strong> (60% negative)
          and <strong className="text-white">drainage complaints in Ward C</strong>. Ward C remains most positive despite flood risk — residents report
          satisfaction with emergency response readiness.
        </p>
      </div>
    </div>
  );
}

// ─── Main Decision Center Page ────────────────────────────────────

export default function DecisionCenter() {
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'actions' | 'agents' | 'pulse'>('issues');

  const criticalIssues = useMemo(() => buildCriticalIssues(), []);
  const actionItems = useMemo(() => buildActionItems(), []);
  const agentTimeline = useMemo(() => buildAgentTimeline(), []);

  const cityScore = useMemo(() => {
    const scores = currentWardData.map(calculateCommunityScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, []);

  // Score drop animation
  const [displayScore, setDisplayScore] = useState(81);
  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(cityScore), 800);
    return () => clearTimeout(timer);
  }, [cityScore]);

  const filteredIssues = selectedWard
    ? criticalIssues.filter(i => i.ward === selectedWard)
    : criticalIssues;

  const filteredActions = selectedWard
    ? actionItems.filter(a => a.ward === selectedWard)
    : actionItems;

  const impactBadge = (level: string) => {
    const styles: Record<string, string> = {
      High: 'bg-green-500/15 text-green-400 border-green-500/30',
      Medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      Low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    };
    return styles[level] || styles.Low;
  };

  const costBadge = (level: string) => {
    const styles: Record<string, string> = {
      Low: 'bg-green-500/15 text-green-400 border-green-500/30',
      Medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      High: 'bg-red-500/15 text-red-400 border-red-500/30',
    };
    return styles[level] || styles.Low;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[240px] p-6 grid-bg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              🏛️ Executive Command Center
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-normal animate-pulse">LIVE</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Real-time decision intelligence for SmartVille leadership</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase">Last Agent Sync</div>
              <div className="text-xs text-green-400 font-mono">10:11 AM — All agents active</div>
            </div>
          </div>
        </div>

        {/* Top Row: City Score + Map + Community Pulse */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* City Score + Alert */}
          <div className="col-span-2 glow-card p-4 flex flex-col items-center border-red-500/20">
            <div className="text-[10px] text-red-400 uppercase tracking-wider mb-2">Community Score</div>
            <div className="relative">
              <CommunityScore score={displayScore} size={100} />
              {displayScore < 70 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  ▼
                </div>
              )}
            </div>
            <div className="text-[10px] text-red-400 mt-2 font-medium">
              81 → {displayScore} ▼ 13pts
            </div>
            <div className="text-[9px] text-slate-600 mt-1">Alert threshold: 70</div>
          </div>

          {/* City Map */}
          <div className="col-span-5 glow-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500 uppercase tracking-wider">SmartVille Community Health Map</div>
              <div className="flex gap-2">
                <span className="text-[8px] text-slate-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Good (80+)</span>
                <span className="text-[8px] text-slate-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Moderate (60-79)</span>
                <span className="text-[8px] text-slate-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Concerning (40-59)</span>
                <span className="text-[8px] text-slate-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical (&lt;40)</span>
              </div>
            </div>
            <WardMap selectedWard={selectedWard} onSelectWard={(w) => setSelectedWard(selectedWard === w ? null : w)} />
          </div>

          {/* Community Pulse */}
          <div className="col-span-5 glow-card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">❤️ Community Pulse</div>
            <CommunityPulse />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4 bg-slate-800/50 p-1 rounded-lg w-fit">
          {[
            { id: 'issues', label: '⚠️ Critical Issues', count: criticalIssues.length },
            { id: 'actions', label: '🎯 Action Items', count: actionItems.length },
            { id: 'agents', label: '🤖 Agent Timeline', count: agentTimeline.length },
            { id: 'pulse', label: '❤️ Explainable AI', count: 0 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                  activeTab === tab.id ? 'bg-blue-500' : 'bg-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'issues' && (
          <div className="space-y-4">
            {/* Critical Issues with Explainable AI */}
            <div className="grid grid-cols-2 gap-4">
              {filteredIssues.map(issue => (
                <ExplainableAIPanel key={issue.id} issue={issue} />
              ))}
            </div>

            {/* AI Summary */}
            <div className="glow-card p-5 border-purple-500/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-sm">🧠</div>
                <div>
                  <div className="text-xs text-purple-400 uppercase tracking-wider">AI Executive Summary</div>
                  <div className="text-[10px] text-slate-600">Powered by Gemini + 4 AI Agents</div>
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-4">
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong className="text-red-400">Ward D</strong> is at <strong className="text-white">highest risk</strong> due to critically elevated AQI (168),
                  imminent water shortage (95% usage), and a 45% spike in citizen complaints. The convergence of air quality, water,
                  and waste issues creates a <strong className="text-white">compound risk scenario</strong> that could escalate rapidly.
                </p>
                <p className="text-sm text-slate-300 leading-relaxed mt-2">
                  Simultaneously, <strong className="text-orange-400">Ward C</strong> faces <strong className="text-white">high flood risk</strong> (92% confidence)
                  due to heavy rainfall forecast and drainage infrastructure strain. <strong className="text-white">Immediate intervention is recommended within 48 hours</strong> for
                  both wards to prevent cascading failures.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="text-[10px] text-slate-500">Confidence: <span className="text-purple-400 font-bold">87%</span></div>
                <div className="text-[10px] text-slate-500">Data sources: <span className="text-blue-400">BigQuery + 4 Agents</span></div>
                <div className="text-[10px] text-slate-500">Model: <span className="text-green-400">Gemini 2.5</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-4">
            {/* Action Items by Type */}
            {['immediate', 'short-term', 'long-term'].map(type => {
              const actions = filteredActions.filter(a => a.type === type);
              if (actions.length === 0) return null;

              const headerStyles: Record<string, { bg: string; text: string; icon: string }> = {
                immediate: { bg: 'bg-red-500/10', text: 'text-red-400', icon: '🔴' },
                'short-term': { bg: 'bg-orange-500/10', text: 'text-orange-400', icon: '🟠' },
                'long-term': { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: '🔵' },
              };
              const style = headerStyles[type];

              return (
                <div key={type} className="glow-card p-5">
                  <div className={`text-xs uppercase tracking-wider mb-4 flex items-center gap-2 ${style.text}`}>
                    <span>{style.icon}</span>
                    {type === 'immediate' ? 'Immediate (0-48h)' : type === 'short-term' ? 'Short-Term (1-7 days)' : 'Long-Term (2+ weeks)'}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-[10px] text-slate-500 uppercase border-b border-slate-700/50">
                          <th className="text-left py-2 pr-4">Action</th>
                          <th className="text-left py-2 pr-4">Ward</th>
                          <th className="text-center py-2 pr-4">Impact</th>
                          <th className="text-center py-2 pr-4">Cost</th>
                          <th className="text-left py-2">Timeline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actions.map(action => (
                          <tr key={action.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 pr-4 text-sm text-white">{action.action}</td>
                            <td className="py-3 pr-4 text-xs text-slate-400">{action.ward}</td>
                            <td className="py-3 pr-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${impactBadge(action.impact)}`}>
                                {action.impact}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${costBadge(action.cost)}`}>
                                {action.cost}
                              </span>
                            </td>
                            <td className="py-3 text-xs text-slate-500 font-mono">{action.timeline}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {/* Priority Matrix */}
            <div className="glow-card p-5">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">📊 Impact vs Cost Priority Matrix</div>
              <div className="relative h-[200px] border border-slate-700/30 rounded-lg bg-slate-800/30">
                {/* Axes */}
                <div className="absolute left-0 top-0 bottom-8 w-8 flex items-center justify-center">
                  <span className="text-[9px] text-slate-500 transform -rotate-90 whitespace-nowrap">Impact →</span>
                </div>
                <div className="absolute bottom-0 left-8 right-0 h-8 flex items-center justify-center">
                  <span className="text-[9px] text-slate-500">Cost →</span>
                </div>

                {/* Quadrants */}
                <div className="absolute left-8 top-0 right-0 bottom-8 grid grid-cols-3 grid-rows-3 gap-px">
                  <div className="bg-green-500/5 rounded-tl-lg flex items-center justify-center">
                    <span className="text-[8px] text-green-400/50">Quick Wins</span>
                  </div>
                  <div className="bg-green-500/3" />
                  <div className="bg-yellow-500/5 rounded-tr-lg flex items-center justify-center">
                    <span className="text-[8px] text-yellow-400/50">Major Projects</span>
                  </div>
                  <div className="bg-slate-700/10" />
                  <div className="bg-slate-700/20" />
                  <div className="bg-slate-700/10" />
                  <div className="bg-red-500/5 rounded-bl-lg flex items-center justify-center">
                    <span className="text-[8px] text-red-400/50">Fill Ins</span>
                  </div>
                  <div className="bg-slate-700/10" />
                  <div className="bg-orange-500/5 rounded-br-lg flex items-center justify-center">
                    <span className="text-[8px] text-orange-400/50">Avoid</span>
                  </div>
                </div>

                {/* Action dots */}
                {filteredActions.map((action, i) => {
                  const costX = action.cost === 'Low' ? 15 : action.cost === 'Medium' ? 50 : 85;
                  const impactY = action.impact === 'High' ? 20 : action.impact === 'Medium' ? 55 : 80;
                  const colors: Record<string, string> = {
                    immediate: '#ef4444',
                    'short-term': '#f97316',
                    'long-term': '#3b82f6',
                  };
                  return (
                    <div
                      key={action.id}
                      className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-150 transition-transform"
                      style={{
                        left: `${8 + costX * 0.9}%`,
                        top: `${impactY}%`,
                        backgroundColor: colors[action.type],
                        boxShadow: `0 0 8px ${colors[action.type]}40`,
                      }}
                      title={action.action}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="glow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">🤖 Agent Collaboration Timeline</div>
                <div className="text-[10px] text-slate-600 mt-1">Watch how AI agents detect, analyze, and collaborate in real-time</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Reset animation
                    const event = new CustomEvent('reset-timeline');
                    window.dispatchEvent(event);
                  }}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-xs text-slate-300 transition-colors"
                >
                  ↻ Replay
                </button>
              </div>
            </div>
            <AgentTimeline steps={agentTimeline} />

            {/* Agent Network Visualization */}
            <div className="mt-8 pt-6 border-t border-slate-700/30">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">Agent Network</div>
              <div className="flex items-center justify-center gap-6">
                {[
                  { name: 'Environment', color: '#22c55e', icon: '🌿', status: 'Active', alerts: 2 },
                  { name: 'Mobility', color: '#3b82f6', icon: '🚗', status: 'Active', alerts: 2 },
                  { name: 'Citizen', color: '#a855f7', icon: '👥', status: 'Active', alerts: 2 },
                  { name: 'Recommendation', color: '#f97316', icon: '💡', status: 'Active', alerts: 1 },
                ].map((agent, i) => (
                  <div key={agent.name} className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-2 border-2"
                      style={{
                        backgroundColor: agent.color + '15',
                        borderColor: agent.color + '40',
                        boxShadow: `0 0 20px ${agent.color}20`,
                      }}
                    >
                      {agent.icon}
                    </div>
                    <div className="text-xs text-white font-medium">{agent.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[9px] text-green-400">{agent.status}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-0.5">{agent.alerts} alerts</span>
                  </div>
                ))}
              </div>
              {/* Connection lines */}
              <div className="text-center mt-2">
                <svg viewBox="0 0 400 30" className="w-96 h-8 mx-auto">
                  <line x1="50" y1="15" x2="150" y2="15" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="150" y1="15" x2="250" y2="15" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="250" y1="15" x2="350" y2="15" stroke="#f97316" strokeWidth="2" strokeDasharray="4,4" />
                  <circle cx="50" cy="15" r="3" fill="#22c55e" />
                  <circle cx="150" cy="15" r="3" fill="#3b82f6" />
                  <circle cx="250" cy="15" r="3" fill="#a855f7" />
                  <circle cx="350" cy="15" r="3" fill="#f97316" />
                  <text x="200" y="28" textAnchor="middle" fill="#64748b" fontSize="8">Data flows → Combined analysis → Action plan</text>
                </svg>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pulse' && (
          <div className="space-y-4">
            {/* Full Explainable AI View */}
            <div className="glow-card p-5">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">🧠 Explainable AI — Prediction Transparency</div>
              <div className="text-xs text-slate-400 mb-4">
                Every prediction in CivicMind comes with an explanation. Decision-makers can see <strong className="text-white">why</strong> the AI
                made each prediction and <strong className="text-white">how confident</strong> it is, enabling informed decisions rather than blind trust.
              </div>
            </div>

            {filteredIssues.map(issue => (
              <ExplainableAIPanel key={issue.id} issue={issue} />
            ))}

            {/* Methodology */}
            <div className="glow-card p-5 border-blue-500/20">
              <div className="text-xs text-blue-400 uppercase tracking-wider mb-3">📐 Prediction Methodology</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-white font-medium mb-1">Data Sources</div>
                  <div className="text-[10px] text-slate-500">BigQuery: 365 days × 5 wards across 5 data domains (environment, mobility, utilities, citizen, safety)</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-white font-medium mb-1">Models</div>
                  <div className="text-[10px] text-slate-500">Risk scoring with weighted multi-factor analysis. Agent-based synthesis via Vertex AI Gemini</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-white font-medium mb-1">Confidence</div>
                  <div className="text-[10px] text-slate-500">Calibrated on historical event matching. 75-93% confidence intervals based on data quality</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
