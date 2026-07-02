'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { currentWardData, predictions, calculateCommunityScore, recommendations } from '@/data/mockData';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  agentAttribution?: string;
  confidence?: number;
}

const suggestedQuestions = [
  '🔴 Which ward needs urgent attention?',
  '🌊 Why is flood risk high in Ward C?',
  '🌫️ Why is air quality worsening?',
  '💡 What should we do about Ward D?',
  '❤️ How is citizen sentiment trending?',
  '🚌 What happens if we add 5 new buses?',
];

function getAIResponse(query: string): { content: string; agent: string; confidence: number } {
  const lower = query.toLowerCase();

  if (lower.includes('ward') && (lower.includes('attention') || lower.includes('urgent') || lower.includes('vulnerable') || lower.includes('which area'))) {
    return {
      content: `**Ward D** needs urgent attention. Here's the full analysis:\n\n🔴 **AQI: 168** — Well above safe threshold (100)\n🔴 **Water Shortage Risk: HIGH** — Usage at 95% capacity\n🔴 **Complaints: 145** — 45% increase this week\n🔴 **Waste Overflow Risk: HIGH** — Predicted within 5 days\n🔴 **Traffic Congestion: 88** — Severe delays reported\n\n**🧠 Why Ward D?**\n• Industrial Zone D2 emissions surged 45%\n• Water reservoir at only 35% (critical level)\n• Waste collection frequency insufficient for population\n• 3 overlapping risks create compound vulnerability\n\n**Confidence: 87%**\n\n**Recommended immediate actions:**\n1. Deploy air quality monitoring stations\n2. Implement Stage 2 water conservation\n3. Increase waste collection frequency\n4. Issue health advisory for residents`,
      agent: 'Recommendation Agent (synthesizing Environment + Mobility + Citizen)',
      confidence: 87,
    };
  }
  if (lower.includes('air quality') || lower.includes('aqi') || lower.includes('worsening') || lower.includes('pollution')) {
    return {
      content: `**Air Quality Deterioration Analysis** 🌫️\n\n📈 **Ward D** is the primary concern:\n- AQI jumped from 120 to 168 (40% increase)\n- This is NOT random — here's why:\n\n**🧠 Root Cause Analysis:**\n• **Industrial emissions** (45% cause) — Zone D2 factory activity spike\n• **Vehicular traffic** (30% cause) — Index at 88, severe congestion\n• **Construction dust** (15% cause) — 3 active projects without covers\n• **Weather** (10% cause) — Low rainfall (3mm) + low wind (3km/h) = no dispersion\n\n**Prediction:** If no action is taken, AQI may reach **190+** within 3 days.\n\n**Recommended Action:** Enforce emission standards, halt uncovered construction, deploy smog towers.\n\n**Confidence: 84%**`,
      agent: 'Environment Agent',
      confidence: 84,
    };
  }
  if (lower.includes('flood') || lower.includes('rain') || lower.includes('ward c')) {
    return {
      content: `**Flood Risk Assessment — Next 7 Days** 🌊\n\n🌊 **Ward C: HIGH RISK** ⚠️\n- Rainfall forecast: 80-120mm over next 5 days\n- 12,000 residents in low-lying areas at risk\n\n**🧠 Why High Risk?**\n• **Rainfall +40%** above seasonal normal\n• **Drainage complaints +18%** — system under strain\n• **Water level in drains +25%** — near capacity\n• **Historical data** — 3 similar flood events in past 2 years\n• **Wind speed** — 12km/h, insufficient to disperse rain clouds\n\n🔶 **Ward B: MEDIUM RISK**\n- Rainfall forecast: 40-60mm, some drainage blockages\n\n🟢 **Ward A, D, E: LOW RISK**\n\n**Confidence: 84%**\n\n**Urgent Actions for Ward C:**\n1. Pre-position sandbags and pumps\n2. Clear drainage channels immediately\n3. Issue early warning to 12,000 residents\n4. Activate emergency shelters`,
      agent: 'Environment Agent (with Citizen Agent data)',
      confidence: 84,
    };
  }
  if (lower.includes('recommend') || lower.includes('what should') || lower.includes('action') || lower.includes('ward d')) {
    return {
      content: `**Priority Action Plan — SmartVille** 🎯\n\n🔴 **CRITICAL — Ward D (Score: ${calculateCommunityScore(currentWardData[3])}/100):**\n\n**Problem:** Compound risk — Air + Water + Waste\n\n**🧠 Why this matters:**\n• 3 overlapping crises create cascading failure risk\n• Citizen sentiment at -0.4 (very negative)\n• Complaint resolution rate only 25%\n\n**Actions (Impact → Cost):**\n→ Deploy air quality monitors — High impact, Low cost\n→ Implement Stage 2 water conservation — High impact, Medium cost\n→ Increase waste collection 2x — High impact, Medium cost\n→ Issue health advisory — High impact, Low cost\n\n**Expected Result:** Score ${calculateCommunityScore(currentWardData[3])} → 55 (+${55 - calculateCommunityScore(currentWardData[3])} points) within 2 weeks\n\n🟠 **HIGH — Ward C:**\n→ Clear drains + early warning — High impact, Low cost\n→ Activate emergency teams — High impact, Medium cost\n\n🟡 **MEDIUM — Ward B:**\n→ Add 3 peak-hour buses — Medium impact, Medium cost\n→ Optimize traffic signals — High impact, Low cost\n\n**Overall Impact:** City score 68 → 82 with all actions implemented.`,
      agent: 'Recommendation Agent',
      confidence: 87,
    };
  }
  if (lower.includes('sentiment') || lower.includes('pulse') || lower.includes('satisfaction') || lower.includes('feeling') || lower.includes('community pulse')) {
    return {
      content: `**Community Pulse Analysis** ❤️\n\n📊 **Overall Sentiment Score: 72/100** (declining)\n\n**Sentiment Breakdown:**\n👍 Positive: 55% (down from 62%)\n😐 Neutral: 25% (stable)\n👎 Negative: 20% (up from 12%)\n\n**🧠 Why Negative Sentiment is Rising:**\n• **Ward D** (60% negative) — Water supply interruptions + air pollution + waste overflow\n• **Ward B** (30% negative) — Traffic congestion + bus delays\n• **Ward C** (8% negative) — Drainage concerns, but generally satisfied with services\n\n**Ward-by-Ward Pulse:**\n• Ward A: 78 🟢 — Residents satisfied with services\n• Ward B: 55 🟡 — Traffic frustration dominating\n• Ward C: 86 🟢 — High satisfaction despite flood risk\n• Ward D: 32 🔴 — Crisis-level dissatisfaction\n• Ward E: 68 🟡 — Moderate, trending down\n\n**Key Insight:** Ward D's negative sentiment is 3x the city average. Addressing water and air quality there would improve overall city sentiment by ~15%.`,
      agent: 'Citizen Agent',
      confidence: 82,
    };
  }
  if (lower.includes('bus') || lower.includes('transport') || lower.includes('traffic')) {
    return {
      content: `**Traffic & Transit Analysis** 🚌🚗\n\n📊 **Current Congestion by Ward:**\n• Ward A: Index 45 (Moderate) 🟡\n• Ward B: Index 72 (Heavy) 🔴\n• Ward C: Index 30 (Smooth) 🟢\n• Ward D: Index 88 (Severe) 🔴🔴\n• Ward E: Index 55 (Moderate) 🟡\n\n**🧠 Why is Ward D traffic so bad?**\n• Main road construction → 2 lanes closed\n• Insufficient bus routes (only 2 serving the area)\n• No alternate routes available\n• Peak hour volume 30% above road capacity\n\n**If we add 5 new buses:**\n• Congestion: -15% in Ward B and Ward D\n• Bus delays: -40% average\n• Emissions: -7% (fewer cars)\n• Community Score: +4 points\n\n**Confidence: 79%**\n\nUse the **What-If Simulator** to test this scenario!`,
      agent: 'Mobility Agent',
      confidence: 79,
    };
  }
  if (lower.includes('water') || lower.includes('shortage')) {
    return {
      content: `**Water Crisis Analysis** 💧\n\n📊 **Water Usage by Ward:**\n• Ward A: 78% capacity ✅\n• Ward B: 85% capacity ⚠️\n• Ward C: 60% capacity ✅\n• Ward D: 95% capacity 🔴 CRITICAL\n• Ward E: 70% capacity ✅\n\n**🧠 Why is Ward D at 95%?**\n• Population density 2x city average\n• Pipeline leaks estimated at 15% loss\n• Industrial usage in Zone D2 (unregulated)\n• Reservoir at only 35% (should be 60%+)\n• Rainfall this week: 3mm (normal: 12mm)\n\n**Without intervention:**\n→ Shortage in 3-5 days\n→ Rationing required within 1 week\n→ Health risk for vulnerable populations\n\n**Recommended:**\n1. Stage 2 water conservation (immediate)\n2. 5 emergency water tankers (0-24h)\n3. Pipeline inspection & repair (1-3 days)\n4. Alternate-day supply schedule (immediate)\n\n**Expected Result:** Usage 95% → 70% within 1 week\n\n**Confidence: 82%**`,
      agent: 'Environment Agent + Citizen Agent',
      confidence: 82,
    };
  }

  return {
    content: `I'm CivicMind AI, your Community Decision Intelligence assistant. I can help with:\n\n🔍 **Analysis** — Ask about specific wards, metrics, or trends\n📊 **Predictions** — Get risk forecasts with explanations (WHY)\n💡 **Recommendations** — AI-generated action plans with impact/cost\n🔬 **Simulation** — What-if scenarios for policy decisions\n❤️ **Community Pulse** — Citizen sentiment analysis\n🤖 **Agent Insights** — Ask what any specific agent detected\n\n🔴 **Current Priority:** Ward D (compound crisis) + Ward C (flood risk)\n\nTry asking:\n• "Which ward needs urgent attention?"\n• "Why is flood risk high?"\n• "How is citizen sentiment?"`,
    agent: 'CivicMind AI Orchestrator',
    confidence: 90,
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'I\'m CivicMind AI, your Community Decision Intelligence assistant. I can help you analyze community data, predict risks, and recommend actions. Every response includes **why** the AI made that prediction.\n\n🔴 **Current Priority:** Ward D needs urgent attention — compound air/water/waste crisis detected.\n\nTry asking about specific wards, risks, or recommendations!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentAttribution: 'CivicMind AI Orchestrator',
      confidence: 90,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const { content, agent, confidence } = getAIResponse(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content,
        timestamp: new Date(),
        agentAttribution: agent,
        confidence,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
      formatted = formatted.replace(/^→ /g, '<span class="text-blue-400">→</span> ');
      if (formatted.startsWith('🔴') || formatted.startsWith('🟠') || formatted.startsWith('🟡') || formatted.startsWith('🟢') || formatted.startsWith('🏆') || formatted.startsWith('🌊') || formatted.startsWith('🌫️') || formatted.startsWith('💡') || formatted.startsWith('❤️') || formatted.startsWith('🚌') || formatted.startsWith('💧') || formatted.startsWith('🎯')) {
        formatted = `<span class="font-semibold">${formatted}</span>`;
      }
      return <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    }).reduce<React.ReactNode[]>((acc, elem, i) => {
      if (i > 0) acc.push(<br key={`br-${i}`} />);
      acc.push(elem);
      return acc;
    }, []);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[240px] flex flex-col h-screen">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              🤖 Ask Your Community
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-normal">Gemini Powered</span>
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-normal">Explainable AI</span>
            </h1>
            <p className="text-xs text-slate-500">Every response includes WHY — powered by 4 AI Agents + Gemini</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">4 Agents Active</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in-up`}
            >
              <div className={`max-w-[78%] px-4 py-3 ${msg.role === 'user' ? 'chat-user' : 'chat-ai'}`}>
                {msg.role === 'ai' && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">CD</div>
                      <span className="text-[10px] text-slate-500">{msg.agentAttribution || 'CivicMind AI'}</span>
                    </div>
                    {msg.confidence && (
                      <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">Confidence: {msg.confidence}%</span>
                    )}
                  </div>
                )}
                <div className="text-sm text-slate-300 leading-relaxed">
                  {formatMessage(msg.content)}
                </div>
                <div className={`text-[9px] text-slate-600 mt-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start fade-in-up">
              <div className="chat-ai px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">CD</div>
                  <span className="text-[10px] text-slate-500">Analyzing with AI agents...</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400 typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-blue-400 typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-blue-400 typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className="px-6 pb-2">
            <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Quick Actions</div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-lg text-xs text-slate-400 hover:text-white transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-6 py-4 border-t border-slate-800">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your community... e.g., 'Why is flood risk high?' or 'What should we do about Ward D?'"
              className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              Send
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
