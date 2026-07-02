'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/decision-center', label: 'Command Center', icon: '🏛️' },
  { href: '/chat', label: 'AI Assistant', icon: '🤖' },
  { href: '/analytics', label: 'Analytics', icon: '📈' },
  { href: '/simulator', label: 'What-If Simulator', icon: '🔬' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#0c1222] border-r border-[#1e293b] z-50 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[#1e293b]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          CD
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white tracking-wide">CivicMind</div>
            <div className="text-[10px] text-slate-500 leading-tight">Decision Intelligence</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Agent Status */}
      {!collapsed && (
        <div className="mt-6 px-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-3">AI Agents</div>
          <div className="space-y-2">
            {[
              { name: 'Environment', status: 'active', color: 'green' },
              { name: 'Mobility', status: 'active', color: 'blue' },
              { name: 'Citizen', status: 'active', color: 'purple' },
              { name: 'Recommendation', status: 'active', color: 'orange' },
            ].map((agent) => (
              <div key={agent.name} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  agent.color === 'green' ? 'bg-green-400' :
                  agent.color === 'blue' ? 'bg-blue-400' :
                  agent.color === 'purple' ? 'bg-purple-400' : 'bg-orange-400'
                } animate-pulse`} />
                <span className="text-xs text-slate-500">{agent.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crisis alert banner */}
      {!collapsed && (
        <div className="mt-4 mx-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] text-red-400 font-semibold uppercase">Crisis Active</span>
          </div>
          <div className="text-[10px] text-slate-400">Ward D + Ward C require immediate action</div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-4 left-0 right-0 mx-auto w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
      >
        {collapsed ? '→' : '←'}
      </button>
    </aside>
  );
}
