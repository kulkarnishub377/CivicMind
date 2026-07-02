/**
 * CivicMind API Client
 * Connects frontend to FastAPI backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchDashboardOverview() {
  const res = await fetch(`${API_BASE}/api/dashboard/overview`);
  return res.json();
}

export async function fetchWardDetail(wardName: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/ward/${wardName}`);
  return res.json();
}

export async function fetchKeyMetrics() {
  const res = await fetch(`${API_BASE}/api/dashboard/metrics`);
  return res.json();
}

export async function sendChatMessage(message: string, ward?: string) {
  const res = await fetch(`${API_BASE}/api/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, ward }),
  });
  return res.json();
}

export async function fetchChatSuggestions() {
  const res = await fetch(`${API_BASE}/api/chat/suggestions`);
  return res.json();
}

export async function fetchAllPredictions() {
  const res = await fetch(`${API_BASE}/api/predict/all`);
  return res.json();
}

export async function fetchWardPredictions(wardName: string) {
  const res = await fetch(`${API_BASE}/api/predict/ward/${wardName}`);
  return res.json();
}

export async function fetchFloodRisk() {
  const res = await fetch(`${API_BASE}/api/predict/flood-risk`);
  return res.json();
}

export async function fetchAllRecommendations() {
  const res = await fetch(`${API_BASE}/api/recommend/all`);
  return res.json();
}

export async function fetchWardRecommendations(wardName: string) {
  const res = await fetch(`${API_BASE}/api/recommend/ward/${wardName}`);
  return res.json();
}

export async function fetchCriticalRecommendations() {
  const res = await fetch(`${API_BASE}/api/recommend/critical`);
  return res.json();
}

export async function runSimulation(action: string, ward?: string, parameters?: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/simulate/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ward, parameters }),
  });
  return res.json();
}

export async function fetchSimulationPresets() {
  const res = await fetch(`${API_BASE}/api/simulate/presets`);
  return res.json();
}

export async function fetchAgentStatus() {
  const res = await fetch(`${API_BASE}/api/agents/status`);
  return res.json();
}

export async function analyzeWard(wardName: string) {
  const res = await fetch(`${API_BASE}/api/agents/analyze/${wardName}`);
  return res.json();
}
