/*
 * CivicMind - Community Decision Intelligence Platform
 * Frontend Application Core - Vanilla JS Client
 */

// Global Application State
const state = {
  activePanel: 'dashboard',
  selectedWard: 'All', // 'All', 'Ward A', 'Ward B', 'Ward C', 'Ward D', 'Ward E'
  apiActive: false,
  apiBase: window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') ? '' : 'http://127.0.0.1:8000',
  charts: {},
  dashboardData: null,
  predictionsData: null,
  recommendationsData: null,
  
  // Simulator Parameters
  simulator: {
    rainfall: 0,
    waste: 2, // 1: Semi-weekly, 2: Weekly, 3: Alternate, 4: Daily
    transit: 0, // $0M to $10M
    water: 1, // 1: None, 2: Stage 1, 3: Stage 2
  },

  // Citizen Portal Complaints List
  myComplaints: [
    { id: 'CV-9412', title: 'Streetlight outage near Metro Station', ward: 'Ward B', category: 'Public Safety', severity: 'Medium', description: 'The streetlights on Route 7 leading to the Metro station are completely dark. Residents feel unsafe walking home after 8 PM.', status: 'Pending', date: 'Dec 01, 2024', department: 'Municipal Safety Grid' },
    { id: 'CV-9285', title: 'Missed garbage pickup on Main St', ward: 'Ward D', category: 'Waste Management', severity: 'High', description: 'Solid waste smart bins on the corner of Main St and 4th Avenue have been overflowing for 3 days. Foul smell in the area.', status: 'In Progress', date: 'Nov 30, 2024', department: 'Sanitation Division' },
    { id: 'CV-9041', title: 'Drainage blockage near Sector 4', ward: 'Ward C', category: 'Water Scarcity', severity: 'High', description: 'The main drain channel is blocked with plastic waste. Heavy rain is starting, leading to flash puddle risks.', status: 'Resolved', date: 'Nov 29, 2024', department: 'Hydrological Services' }
  ]
};

// Fallback Mock Data (For local file opening file:///... without backend API running)
const MOCK_DATA = {
  dashboard: {
    city: "SmartVille",
    city_score: 81,
    alerts_count: 3,
    wards: {
      "Ward A": { composite_score: 85, env_score: 82, mob_score: 88, water_score: 80, safety_score: 85, sat_score: 90, current_data: { aqi: 85, traffic_index: 45, water_usage_pct: 78, complaints: 23, safety: 85 } },
      "Ward B": { composite_score: 58, env_score: 55, mob_score: 42, water_score: 68, safety_score: 65, sat_score: 60, current_data: { aqi: 112, traffic_index: 72, water_usage_pct: 85, complaints: 67, safety: 65 } },
      "Ward C": { composite_score: 82, env_score: 85, mob_score: 88, water_score: 75, safety_score: 80, sat_score: 82, current_data: { aqi: 55, traffic_index: 30, water_usage_pct: 60, complaints: 8, safety: 80 } },
      "Ward D": { composite_score: 42, env_score: 38, mob_score: 30, water_score: 28, safety_score: 50, sat_score: 64, current_data: { aqi: 168, traffic_index: 88, water_usage_pct: 95, complaints: 145, safety: 50 } },
      "Ward E": { composite_score: 71, env_score: 74, mob_score: 68, water_score: 70, safety_score: 72, sat_score: 72, current_data: { aqi: 95, traffic_index: 55, water_usage_pct: 70, complaints: 34, safety: 72 } }
    }
  },
  predictions: [
    { ward: "Ward A", floodRisk: "Low", waterShortageRisk: "Low", trafficCongestion: "Medium", wasteOverflow: "Low", pollutionSpike: "Low" },
    { ward: "Ward B", floodRisk: "Medium", waterShortageRisk: "Medium", trafficCongestion: "High", wasteOverflow: "Medium", pollutionSpike: "Medium" },
    { ward: "Ward C", floodRisk: "High", waterShortageRisk: "Low", trafficCongestion: "Low", wasteOverflow: "Low", pollutionSpike: "Low", explanation: "Rainfall forecast +40% above normal drainage capacity." },
    { ward: "Ward D", floodRisk: "Low", waterShortageRisk: "High", trafficCongestion: "High", wasteOverflow: "High", pollutionSpike: "High", explanation: "Usage is at 95% capacity; reservoir level is at critical 35%." },
    { ward: "Ward E", floodRisk: "Low", waterShortageRisk: "Low", trafficCongestion: "Medium", wasteOverflow: "Low", pollutionSpike: "Low" }
  ],
  recommendations: [
    { id: "rec-1", ward: "Ward D", problem: "Severe air quality deterioration (AQI: 168) with 45% increase in complaints", severity: "Critical", recommendations: ["Deploy mobile air quality monitoring stations at 3 key intersections", "Issue health advisory for vulnerable populations", "Inspect and enforce emission standards on industrial units in Zone D2"], expected_impact: "Expected AQI reduction of 25-35% within 2 weeks", confidence: 87 },
    { id: "rec-2", ward: "Ward D", problem: "Critical water shortage risk with 95% usage capacity and reservoir at 35%", severity: "Critical", recommendations: ["Implement Stage 2 water conservation measures immediately", "Deploy 5 emergency water tankers to residential sectors", "Schedule alternate-day supply for non-essential usage"], expected_impact: "Water usage reduction of 20% within 1 week", confidence: 82 },
    { id: "rec-3", ward: "Ward D", problem: "High waste overflow predicted within 5 days based on complaints patterns", severity: "High", recommendations: ["Increase waste collection frequency by 2 pickups/week", "Deploy 3 additional smart bins at overflow-prone locations", "Launch community awareness campaign on waste segregation"], expected_impact: "Complaint reduction of 35% within 10 days", confidence: 79 },
    { id: "rec-4", ward: "Ward B", problem: "Traffic congestion index at 72 with 15-min average bus delays", severity: "High", recommendations: ["Add 3 peak-hour buses on Route B7 and B12", "Implement dynamic traffic signal optimization at 5 junctions", "Deploy traffic marshals during peak hours"], expected_impact: "Congestion reduction of 20% within 2 weeks", confidence: 75 },
    { id: "rec-5", ward: "Ward C", problem: "High flood risk due to heavy rainfall forecast (80-120mm expected)", severity: "High", recommendations: ["Pre-position sandbags and pumps in low-lying areas", "Clear drainage channels and stormwater systems", "Issue early warning to 12,000 residents in flood-prone zones"], expected_impact: "Reduce flood damage risk by 40%", confidence: 84 }
  ],
  chat: {
    "ward_attention": {
      response: "### 🚨 Ward D Strategic Analysis\n\n**Ward D** currently demands immediate municipal intervention due to critical metrics:\n* **Air Quality (AQI): 168** (Unhealthy/Critical threshold breached)\n* **Water Supply Load: 95%** (Reservoir drop to 35% indicates high scarcity)\n* **Active Complaints: 145** (Spike of 45% in citizen feedback)\n* **Waste Management Alert: HIGH** (Smart bin analytics predicts overflow within 5 days)\n\n**Recommended Policy Sequence:**\n1. Enforce water conservation directives (Stage 2).\n2. Dispatch dynamic sanitation trucks to clear waste backlog.\n3. Restrict heavy transit routing through industrial zones.",
      confidence: 87,
      related_wards: ["Ward D"],
      follow_up: ["What specific actions for Ward D water shortage?", "Show flood risk predictions"]
    },
    "air_quality": {
      response: "### 🌫️ Air Quality Deterioration Report\n\n**Ward D** is experiencing a significant pollution spike with an AQI of **168**.\n\n**Contributing Factors:**\n* **Industrial emissions (Zone D2):** 45% of particulate matter attribution.\n* **Vehicular stagnation:** 30% contribution from high traffic density (Index: 88).\n* **Climatological Stagnation:** Extremely low wind speeds (3 km/h) and high heat index (36°C) preventing particulate dispersion.\n\n**Mitigation Strategy:** Initiate automated dust suppression sprinklers along Highway D and suspend industrial work shifts in Zone D2 during high-heat hours.",
      confidence: 84,
      related_wards: ["Ward D", "Ward B"],
      follow_up: ["What emission controls should we enforce?", "Show pollution trend for Ward D"]
    },
    "flood_risk": {
      response: "### 🌊 Flood Prediction Assessment (Next 7 Days)\n\n* **Ward C: HIGH RISK** (Probability: 84%)\n  * Forecasted precipitation: 80-120mm.\n  * Current drainage capacity utilized: 75%.\n  * Vulnerable residents: 12,000 in low-elevation sectors.\n* **Ward B: MEDIUM RISK** (Probability: 55%)\n  * Expected precipitation: 40-60mm.\n* **Wards A, D, E: LOW RISK** (No immediate hydrological threat).\n\n**Immediate Mitigation Plan:** Pre-position sandbags at the lower canal banks and clear stormwater grates along main arteries.",
      confidence: 84,
      related_wards: ["Ward C", "Ward B"],
      follow_up: ["Simulate flood impact on Ward C", "Show drainage status"]
    },
    "recommendations": {
      response: "### 💡 AI Recommendations Overview\n\nI have generated **6 structural recommendations** across SmartVille wards, ranked by urgency:\n\n1. **Ward D [Critical]:** Deploy Stage 2 conservation limits to mitigate water shortage risk (-20% usage target).\n2. **Ward D [Critical]:** Deploy 3 mobile air monitoring units and inspect factories in industrial sectors.\n3. **Ward C [High]:** Proactively clean storm drains and enable the early alert system ahead of the storm cycle.\n4. **Ward B [High]:** Optimize peak scheduling on public routes B7 and B12 (-15% delays expected).",
      confidence: 82,
      related_wards: ["Ward D", "Ward B", "Ward C"],
      follow_up: ["Show Ward D action plan", "Simulate waste collection increase"]
    }
  }
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initSidebar();
  initWardSelector();
  checkBackendConnection().then(() => {
    loadData();
    initChat();
    initSimulator();
    initCitizenPortal();
  });
});

// Real-time Clock Header
function initClock() {
  const clockEl = document.getElementById('header-clock');
  const updateTime = () => {
    const now = new Date();
    clockEl.innerText = now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  updateTime();
  setInterval(updateTime, 1000);
}

// Check if FastAPI is running locally
async function checkBackendConnection() {
  try {
    const res = await fetch(`${state.apiBase}/health`);
    const data = await res.json();
    if (data.status === 'healthy') {
      state.apiActive = true;
      console.log('Connected to FastAPI backend!');
    }
  } catch (err) {
    state.apiActive = false;
    console.warn('FastAPI backend offline. Operating in self-contained Static Fallback mode.');
  }
}

// Load Application Data
async function loadData() {
  if (state.apiActive) {
    try {
      const dashboardRes = await fetch(`${state.apiBase}/api/dashboard/overview`);
      state.dashboardData = await dashboardRes.json();
      
      const predRes = await fetch(`${state.apiBase}/api/predict/all`);
      const predJson = await predRes.json();
      state.predictionsData = predJson.predictions;
      
      const recRes = await fetch(`${state.apiBase}/api/recommend/all`);
      const recJson = await recRes.json();
      state.recommendationsData = recJson.recommendations;
    } catch (err) {
      console.error('API Fetch failed, reverting to local static data mock.', err);
      useMockData();
    }
  } else {
    useMockData();
  }
  
  renderDashboard();
  renderDecisionCenter();
  renderAnalytics();
}

function useMockData() {
  state.dashboardData = MOCK_DATA.dashboard;
  state.predictionsData = MOCK_DATA.predictions;
  state.recommendationsData = MOCK_DATA.recommendations;
}

// Sidebar panel navigation mapping
function initSidebar() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.content-panel');
  const titles = {
    'dashboard': { title: 'City Dashboard', subtitle: 'SmartVille — Real-time community metrics & AI insights' },
    'decision-center': { title: 'Executive Decision Center', subtitle: 'Multi-Agent Collaboration & Strategy Dashboard' },
    'ai-chat': { title: 'AI Decision Assistant', subtitle: 'Natural language analysis & recommendation querying' },
    'citizen-portal': { title: 'Citizen Operations Portal', subtitle: 'Submit complaints, track municipal tickets, and verify resolutions' },
    'simulator': { title: 'What-If Simulation Twin', subtitle: 'Project outcomes, policy adjustments, and score forecasting' },
    'analytics': { title: 'Predictive Forecasting', subtitle: 'Vertex AI Machine Learning models & vulnerability trends' }
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const panelId = btn.getAttribute('data-panel');
      state.activePanel = panelId;
      
      // Update UI active buttons
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Toggle visibility
      panels.forEach(p => p.classList.remove('active'));
      document.getElementById(`panel-${panelId}`).classList.add('active');
      
      // Update Headers text
      document.getElementById('panel-title').innerText = titles[panelId].title;
      document.getElementById('panel-subtitle').innerText = titles[panelId].subtitle;
      
      // Re-trigger layout-specific charts to refresh size
      refreshCharts(panelId);
    });
  });
}

function refreshCharts(panelId) {
  if (panelId === 'dashboard') {
    renderDashboardCharts();
  } else if (panelId === 'simulator') {
    renderSimulatorCharts();
  } else if (panelId === 'analytics') {
    renderAnalyticsCharts();
  } else if (panelId === 'citizen-portal') {
    renderCitizenPortal();
  }
}

// Ward Dropdown handler
function initWardSelector() {
  const select = document.getElementById('global-ward-selector');
  select.addEventListener('change', (e) => {
    state.selectedWard = e.target.value;
    renderDashboard();
    renderDecisionCenter();
  });
}

// 1. RENDERING: DASHBOARD
function renderDashboard() {
  const data = state.dashboardData;
  if (!data) return;
  
  const alertsCountEl = document.getElementById('alerts-count');
  
  // Set alert count ribbon dynamically
  if (state.selectedWard === 'All') {
    alertsCountEl.innerText = `${data.active_alerts?.critical || 3} Active Alerts`;
    document.getElementById('city-score-value').innerText = data.city_score;
    updateRadialScore(data.city_score);
  } else {
    const wData = data.wards[state.selectedWard];
    const risk = state.predictionsData?.find(p => p.ward === state.selectedWard);
    let alertCount = 0;
    if (wData.current_data.aqi > 100) alertCount++;
    if (wData.current_data.water_usage_pct > 80) alertCount++;
    if (wData.current_data.traffic_index > 60) alertCount++;
    
    alertsCountEl.innerText = `${alertCount} Ward Alerts`;
    document.getElementById('city-score-value').innerText = wData.composite_score;
    updateRadialScore(wData.composite_score);
  }
  
  // Populating Metric Cards
  populateMetrics();
  
  // Render Sentiment Widget
  populateSentiment();
  
  // Update Charts
  renderDashboardCharts();
}

function updateRadialScore(score) {
  const ring = document.getElementById('city-score-ring');
  const circumference = 2 * Math.PI * 42; // Radius = 42
  const offset = circumference - (score / 100) * circumference;
  ring.style.strokeDashoffset = offset;
}

function populateMetrics() {
  const cardsContainer = document.getElementById('metric-cards-container');
  const dData = state.dashboardData;
  if (!dData) return;
  
  let aqi, traffic, water, complaints, safety;
  
  if (state.selectedWard === 'All') {
    const wards = Object.values(dData.wards);
    aqi = Math.round(wards.reduce((acc, w) => acc + w.current_data.aqi, 0) / wards.length);
    traffic = Math.round(wards.reduce((acc, w) => acc + w.current_data.traffic_index, 0) / wards.length);
    water = Math.round(wards.reduce((acc, w) => acc + w.current_data.water_usage_pct, 0) / wards.length);
    complaints = wards.reduce((acc, w) => acc + w.current_data.complaints, 0);
    safety = Math.round(wards.reduce((acc, w) => acc + w.safety_score, 0) / wards.length);
  } else {
    const ward = dData.wards[state.selectedWard];
    aqi = ward.current_data.aqi;
    traffic = ward.current_data.traffic_index;
    water = ward.current_data.water_usage_pct;
    complaints = ward.current_data.complaints;
    safety = ward.safety_score;
  }
  
  document.getElementById('card-aqi').innerText = aqi;
  document.getElementById('card-traffic').innerText = `${traffic}%`;
  document.getElementById('card-water').innerText = `${water}%`;
  document.getElementById('card-complaints').innerText = complaints;
  document.getElementById('card-safety').innerText = `${safety}/100`;
  
  // Set alert boundaries on cards
  updateMetricCardStatus('aqi', aqi, 100, 150);
  updateMetricCardStatus('traffic', traffic, 60, 80);
  updateMetricCardStatus('water', water, 80, 90);
  updateMetricCardStatus('complaints', complaints, 50, 100);
}

function updateMetricCardStatus(metricId, value, warnThreshold, critThreshold) {
  const card = document.querySelector(`.metric-card[data-metric="${metricId}"]`);
  card.className = "glass-card metric-card"; // reset styles
  
  const trendSpan = card.querySelector('.metric-trend');
  
  if (value > critThreshold) {
    card.classList.add('border-red');
    trendSpan.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Critical`;
    trendSpan.className = "metric-trend text-red";
  } else if (value > warnThreshold) {
    card.classList.add('border-orange');
    trendSpan.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Warning`;
    trendSpan.className = "metric-trend text-orange";
  } else {
    trendSpan.innerHTML = `<i class="fa-solid fa-circle-check"></i> Normal`;
    trendSpan.className = "metric-trend text-green";
  }
}

function populateSentiment() {
  const dData = state.dashboardData;
  const alertText = document.getElementById('sentiment-alert-text');
  const sentimentPct = document.getElementById('sentiment-pct');
  const sentimentEmoji = document.getElementById('sentiment-emoji');
  
  if (state.selectedWard === 'All') {
    sentimentPct.innerText = '72%';
    sentimentEmoji.innerText = '😊';
    alertText.innerText = "Public satisfaction dropped in Ward D due to municipal waste backlog and air quality.";
  } else if (state.selectedWard === 'Ward D') {
    sentimentPct.innerText = '36%';
    sentimentEmoji.innerText = '😡';
    alertText.innerText = "Active citizen backlash regarding local water outages and smog in residential zones.";
  } else if (state.selectedWard === 'Ward C') {
    sentimentPct.innerText = '85%';
    sentimentEmoji.innerText = '😁';
    alertText.innerText = "Citizen reports indicate high satisfaction with green corridor drainage clearances.";
  } else {
    sentimentPct.innerText = '78%';
    sentimentEmoji.innerText = '🙂';
    alertText.innerText = "Standard utility operations reported. Normal satisfaction rates sustained.";
  }
}

function renderDashboardCharts() {
  const data = state.dashboardData;
  if (!data) return;
  
  const wardNames = Object.keys(data.wards);
  const compositeScores = Object.values(data.wards).map(w => w.composite_score);
  
  // 1. Ward Comparison Chart
  if (state.charts.wardComp) state.charts.wardComp.destroy();
  const ctxComp = document.getElementById('wardComparisonChart').getContext('2d');
  state.charts.wardComp = new Chart(ctxComp, {
    type: 'bar',
    data: {
      labels: wardNames,
      datasets: [{
        label: 'Health Index',
        data: compositeScores,
        backgroundColor: ['rgba(59, 130, 246, 0.4)', 'rgba(6, 182, 212, 0.4)', 'rgba(16, 185, 129, 0.4)', 'rgba(239, 68, 68, 0.4)', 'rgba(139, 92, 246, 0.4)'],
        borderColor: ['#3b82f6', '#06b6d4', '#10b981', '#ef4444', '#8b5cf6'],
        borderWidth: 1.5,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' }, min: 0, max: 100 },
        x: { grid: { display: false }, ticks: { color: '#64748b' } }
      }
    }
  });

  // 2. AQI Trend Chart
  if (state.charts.aqiTrend) state.charts.aqiTrend.destroy();
  const ctxAqi = document.getElementById('aqiTrendChart').getContext('2d');
  
  // Mock historical dates
  const dates = Array.from({length: 10}, (_, i) => `Nov ${20 + i}`);
  const aqiWardsData = {
    'All': [95, 98, 102, 99, 105, 112, 108, 110, 115, 112],
    'Ward A': [75, 78, 80, 82, 85, 84, 82, 80, 83, 85],
    'Ward B': [100, 105, 108, 102, 110, 115, 112, 108, 114, 112],
    'Ward C': [50, 52, 55, 54, 53, 56, 55, 58, 56, 55],
    'Ward D': [130, 138, 145, 142, 150, 158, 155, 160, 165, 168],
    'Ward E': [85, 88, 92, 90, 94, 98, 95, 96, 94, 95]
  };

  state.charts.aqiTrend = new Chart(ctxAqi, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'AQI Level',
        data: aqiWardsData[state.selectedWard] || aqiWardsData['All'],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
        x: { grid: { display: false }, ticks: { color: '#64748b' } }
      }
    }
  });

  // 3. Complaints Trend Chart
  if (state.charts.complaintsTrend) state.charts.complaintsTrend.destroy();
  const ctxComplaints = document.getElementById('complaintsTrendChart').getContext('2d');
  
  const compWardsData = {
    'All': [150, 162, 185, 170, 192, 210, 205, 224, 215, 234],
    'Ward A': [15, 18, 22, 19, 20, 25, 24, 22, 25, 23],
    'Ward B': [45, 52, 58, 50, 62, 65, 60, 68, 65, 67],
    'Ward C': [5, 8, 12, 10, 8, 12, 10, 6, 8, 8],
    'Ward D': [80, 90, 105, 100, 115, 125, 120, 135, 130, 145],
    'Ward E': [25, 28, 34, 30, 32, 38, 35, 30, 35, 34]
  };

  state.charts.complaintsTrend = new Chart(ctxComplaints, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Tickets Created',
        data: compWardsData[state.selectedWard] || compWardsData['All'],
        backgroundColor: 'rgba(139, 92, 246, 0.4)',
        borderColor: '#8b5cf6',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
        x: { grid: { display: false }, ticks: { color: '#64748b' } }
      }
    }
  });

  // 4. Categories Pie Chart
  if (state.charts.categories) state.charts.categories.destroy();
  const ctxCat = document.getElementById('complaintCategoriesChart').getContext('2d');
  state.charts.categories = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: ['Water Leakage', 'Air Pollution', 'Road Bottleneck', 'Waste Overflow', 'Noise Complaint'],
      datasets: [{
        data: state.selectedWard === 'Ward D' ? [15, 45, 25, 50, 10] : [35, 25, 45, 20, 15],
        backgroundColor: ['#06b6d4', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: { color: '#94a3b8', font: { size: 10 } }
        }
      },
      cutout: '65%'
    }
  });
}

// 2. RENDERING: DECISION CENTER
function renderDecisionCenter() {
  const container = document.getElementById('recommendations-container');
  const alertsContainer = document.getElementById('risk-alerts-container');
  const recs = state.recommendationsData;
  if (!recs) return;

  // Filter recommendations based on active selector
  const filteredRecs = recs.filter(r => {
    if (state.selectedWard === 'All') return true;
    return r.ward === state.selectedWard;
  });

  // 1. Populate Strategic Recommendations list
  container.innerHTML = '';
  if (filteredRecs.length === 0) {
    container.innerHTML = `
      <div class="flex-center flex-column text-center py-6 text-slate-500">
        <i class="fa-regular fa-folder-open font-24 mb-2"></i>
        <p>No active recommendations for ${state.selectedWard}.</p>
      </div>
    `;
  } else {
    filteredRecs.forEach(item => {
      const severityClass = item.severity === 'Critical' ? 'red' : item.severity === 'High' ? 'orange' : 'purple';
      const stepsHtml = item.recommendations.map(step => `
        <div class="step-item">
          <span class="step-arrow">→</span>
          <span>${step}</span>
        </div>
      `).join('');

      const card = document.createElement('div');
      card.className = 'action-row';
      card.setAttribute('data-severity', item.severity);
      card.innerHTML = `
        <div class="action-row-header">
          <span class="badge ${severityClass}">${item.severity}</span>
          <span class="action-ward">${item.ward}</span>
          <span class="action-conf ml-auto">Confidence: ${item.confidence}%</span>
        </div>
        <div class="action-problem">${item.problem}</div>
        <div class="recommendations-steps">
          ${stepsHtml}
        </div>
        <div class="action-impact-footer">
          <span class="impact-label">Impact Assessment:</span>
          <span class="impact-desc">${item.expected_impact}</span>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // 2. Populate Risk Alerts Queue
  alertsContainer.innerHTML = '';
  const risks = state.predictionsData || [];
  
  let riskAlerts = [];
  risks.forEach(r => {
    if (state.selectedWard !== 'All' && r.ward !== state.selectedWard) return;
    
    if (r.floodRisk === 'High') riskAlerts.push({ label: 'Severe Flood Risk', ward: r.ward, level: 'Critical', emoji: '🌊' });
    if (r.waterShortageRisk === 'High') riskAlerts.push({ label: 'Water Resource Depletion', ward: r.ward, level: 'Critical', emoji: '💧' });
    if (r.trafficCongestion === 'High') riskAlerts.push({ label: 'Gridlock Bottle Neck', ward: r.ward, level: 'High', emoji: '🚦' });
    if (r.wasteOverflow === 'High') riskAlerts.push({ label: 'Smart Bin Waste Overflow', ward: r.ward, level: 'High', emoji: '🗑️' });
    if (r.pollutionSpike === 'High') riskAlerts.push({ label: 'Particulate Emission Alert', ward: r.ward, level: 'High', emoji: '🌫️' });
  });

  if (riskAlerts.length === 0) {
    alertsContainer.innerHTML = `
      <div class="flex-center py-4 text-slate-500 font-12">
        <i class="fa-solid fa-shield mr-2"></i> Ward Risk Factors Secure
      </div>
    `;
  } else {
    riskAlerts.forEach(alert => {
      const badgeClass = alert.level === 'Critical' ? 'red' : 'orange';
      const el = document.createElement('div');
      el.className = 'risk-alert-item';
      el.innerHTML = `
        <span class="risk-alert-emoji">${alert.emoji}</span>
        <div class="risk-alert-details">
          <h5>${alert.label}</h5>
          <p>${alert.ward} · ${alert.level} Risk</p>
        </div>
        <span class="badge ${badgeClass}">${alert.level}</span>
      `;
      alertsContainer.appendChild(el);
    });
  }

  // Add click events to decision center filters
  initDecisionCenterFilters();
}

function initDecisionCenterFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-filter');
      
      const rows = document.querySelectorAll('.action-row');
      rows.forEach(row => {
        const severity = row.getAttribute('data-severity');
        if (val === 'All' || severity === val) {
          row.style.display = 'block';
        } else {
          row.style.display = 'none';
        }
      });
    };
  });
}

// 3. AI CHAT ASSISTANT
function initChat() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const suggestionsBox = document.getElementById('chat-suggestions');
  
  const suggestions = [
    "Which ward needs urgent attention?",
    "Show flood risk prediction for Ward C",
    "Show me all strategic recommendations",
    "What factors are worsening air quality?"
  ];

  suggestionsBox.innerHTML = '';
  suggestions.forEach(prompt => {
    const btn = document.createElement('button');
    btn.className = 'suggestion-btn';
    btn.innerText = prompt;
    btn.onclick = () => {
      input.value = prompt;
      sendChatMessage(prompt);
    };
    suggestionsBox.appendChild(btn);
  });

  form.onsubmit = (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    input.value = '';
    sendChatMessage(query);
  };
}

async function sendChatMessage(message) {
  const box = document.getElementById('chat-messages');
  const indicator = document.getElementById('typing-indicator');
  
  // Append User message
  const userMsg = document.createElement('div');
  userMsg.className = 'message outgoing';
  userMsg.innerHTML = `<div class="message-bubble">${escapeHtml(message)}</div>`;
  box.appendChild(userMsg);
  box.scrollTop = box.scrollHeight;
  
  // Show thinking
  indicator.classList.remove('hide');
  
  // Classify locally or call API
  let answer = "";
  if (state.apiActive) {
    try {
      const res = await fetch(`${state.apiBase}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
      });
      const data = await res.json();
      answer = data.response;
    } catch (err) {
      console.error('Chat API error. Falling back to local classifier.', err);
      answer = getLocalChatReply(message);
    }
  } else {
    // Delay to simulate network logic
    await new Promise(r => setTimeout(r, 800));
    answer = getLocalChatReply(message);
  }
  
  // Hide thinking
  indicator.classList.add('hide');
  
  // Append AI message
  const aiMsg = document.createElement('div');
  aiMsg.className = 'message incoming';
  aiMsg.innerHTML = `<div class="message-bubble">${formatMarkdown(answer)}</div>`;
  box.appendChild(aiMsg);
  box.scrollTop = box.scrollHeight;
}

function getLocalChatReply(query) {
  const q = query.toLowerCase();
  if (q.includes('attention') || q.includes('urgent') || q.includes('vulnerable')) {
    return MOCK_DATA.chat.ward_attention.response;
  }
  if (q.includes('air quality') || q.includes('aqi') || q.includes('pollution')) {
    return MOCK_DATA.chat.air_quality.response;
  }
  if (q.includes('flood') || q.includes('rain')) {
    return MOCK_DATA.chat.flood_risk.response;
  }
  if (q.includes('recommend') || q.includes('action') || q.includes('suggest')) {
    return MOCK_DATA.chat.recommendations.response;
  }
  
  return `I can help you analyze community data for **SmartVille**. Try asking about:
  
* 🔍 **Analysis** — Specific wards or metrics ('Why is air quality worsening?')
* 📊 **Predictions** — Risk forecasts for flood or water shortage
* 💡 **Recommendations** — AI-generated action plans ('Show me all strategic recommendations')
* 🔬 **Simulation** — What-if scenarios`;
}

// Simple HTML Escaper
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Simple Markdown formatting parser (bold and bullet points)
function formatMarkdown(text) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)\n/g, '<h4 class="font-14 font-semibold mb-2">$1</h4>')
    .replace(/\n\* (.*?)/g, '<li>$1</li>')
    .replace(/\n\d\. (.*?)/g, '<li>$1</li>');
    
  if (html.includes('<li>')) {
    // wrap occurrences in ul
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul class="bullet-list">$1</ul>');
  }
  return html.replace(/\n/g, '<br>');
}


// 4. WHAT-IF SIMULATOR
function initSimulator() {
  const sliders = {
    rainfall: document.getElementById('sim-rainfall'),
    waste: document.getElementById('sim-waste'),
    transit: document.getElementById('sim-transit'),
    water: document.getElementById('sim-water')
  };
  
  const valDisplays = {
    rainfall: document.getElementById('val-rainfall'),
    waste: document.getElementById('val-waste'),
    transit: document.getElementById('val-transit'),
    water: document.getElementById('val-water-res')
  };
  
  // Set slider slide events
  sliders.rainfall.oninput = (e) => {
    const val = parseInt(e.target.value);
    state.simulator.rainfall = val;
    valDisplays.rainfall.innerText = (val >= 0 ? '+' : '') + val + '%';
  };
  
  sliders.waste.oninput = (e) => {
    const val = parseInt(e.target.value);
    state.simulator.waste = val;
    const states = { 1: 'Semi-weekly', 2: 'Weekly', 3: 'Alternate Days', 4: 'Daily' };
    valDisplays.waste.innerText = states[val];
  };
  
  sliders.transit.oninput = (e) => {
    const val = parseInt(e.target.value);
    state.simulator.transit = val;
    valDisplays.transit.innerText = `$${val}M`;
  };
  
  sliders.water.oninput = (e) => {
    const val = parseInt(e.target.value);
    state.simulator.water = val;
    const states = { 1: 'None', 2: 'Stage 1 (15%)', 3: 'Stage 2 (30%)' };
    valDisplays.water.innerText = states[val];
  };

  document.getElementById('reset-sim-btn').onclick = () => {
    sliders.rainfall.value = 0;
    sliders.waste.value = 2;
    sliders.transit.value = 0;
    sliders.water.value = 1;
    
    state.simulator.rainfall = 0;
    state.simulator.waste = 2;
    state.simulator.transit = 0;
    state.simulator.water = 1;
    
    valDisplays.rainfall.innerText = '0%';
    valDisplays.waste.innerText = 'Weekly';
    valDisplays.transit.innerText = '$0M';
    valDisplays.water.innerText = 'None';
    
    runSimulation();
  };

  document.getElementById('run-simulation-btn').onclick = () => {
    runSimulation();
  };

  // Initial Simulator Output Run
  runSimulation();
}

async function runSimulation() {
  const scoreVal = document.getElementById('sim-score-output-val');
  const deltaBadge = document.getElementById('sim-delta-badge');
  const riskBox = document.getElementById('sim-risk-outputs');
  
  // Calculate Simulated metrics based on sliders
  // Base Health index is 81 (average) or the selected ward score
  let baseScore = state.selectedWard === 'All' ? 81 : state.dashboardData.wards[state.selectedWard].composite_score;
  
  // Compute slider effects
  let delta = 0;
  
  // 1. Rainfall: storm delta degrades env score, increases flood
  const rainEffect = Math.round(state.simulator.rainfall / 10); // +10 rainfall drops score by 1
  delta -= rainEffect;
  
  // 2. Waste: daily collection improves satisfaction
  const wasteEffect = (state.simulator.waste - 2) * 3; // Daily = +6 points, Alternate = +3, Weekly = 0, Semi = -3
  delta += wasteEffect;
  
  // 3. Transit: budget allocations improve mobility
  const transitEffect = state.simulator.transit * 1.5; // Up to +15 points for $10M
  delta += transitEffect;
  
  // 4. Water Restrictions: resolves water shortage risks
  const waterEffect = (state.simulator.water - 1) * 2; // stage 1 = +2, stage 2 = +4
  delta += waterEffect;

  const finalScore = Math.min(100, Math.max(0, Math.round(baseScore + delta)));
  const diff = finalScore - baseScore;
  
  // Animate values
  scoreVal.innerText = finalScore;
  if (diff > 0) {
    deltaBadge.innerText = `+${diff} Points Improvement`;
    deltaBadge.className = 'badge green mt-3 font-12';
  } else if (diff < 0) {
    deltaBadge.innerText = `${diff} Points Drop`;
    deltaBadge.className = 'badge red mt-3 font-12';
  } else {
    deltaBadge.innerText = `Stable (No Score Change)`;
    deltaBadge.className = 'badge orange mt-3 font-12';
  }
  
  // Set risk impacts display
  const finalRain = 112 + state.simulator.rainfall; // baseline AQI/rainfall logic
  const finalAqi = Math.max(40, 112 - (state.simulator.waste * 15) - (state.simulator.transit * 3));
  const finalCongestion = Math.max(20, 58 - (state.simulator.transit * 4));
  const finalWater = Math.max(30, 74 - (state.simulator.water * 12));
  const finalComplaints = Math.max(10, 234 - (state.simulator.waste * 30) - (state.simulator.transit * 8));

  riskBox.innerHTML = `
    <div class="sim-metric-row">
      <span class="sim-m-label">🌫️ Air Quality (AQI)</span>
      <div class="sim-m-compare">
        <span class="old">112</span>
        <span class="arrow">→</span>
        <span class="new text-green">${Math.round(finalAqi)}</span>
      </div>
    </div>
    <div class="sim-metric-row">
      <span class="sim-m-label">🚦 Traffic Congestion</span>
      <div class="sim-m-compare">
        <span class="old">58%</span>
        <span class="arrow">→</span>
        <span class="new text-green">${Math.round(finalCongestion)}%</span>
      </div>
    </div>
    <div class="sim-metric-row">
      <span class="sim-m-label">💧 Water Consumption Capacity</span>
      <div class="sim-m-compare">
        <span class="old">74%</span>
        <span class="arrow">→</span>
        <span class="new text-green">${Math.round(finalWater)}%</span>
      </div>
    </div>
    <div class="sim-metric-row">
      <span class="sim-m-label">📢 Open Citizen Complaints</span>
      <div class="sim-m-compare">
        <span class="old">234</span>
        <span class="arrow">→</span>
        <span class="new text-green">${Math.round(finalComplaints)}</span>
      </div>
    </div>
  `;

  // Update simulator comparison chart
  renderSimulatorCharts(finalAqi, finalCongestion, finalWater, finalComplaints);
}

function renderSimulatorCharts(simAqi = 85, simTraffic = 45, simWater = 65, simComplaints = 150) {
  if (state.activePanel !== 'simulator') return;

  const currentAqi = 112;
  const currentTraffic = 58;
  const currentWater = 74;
  
  if (state.charts.simComp) state.charts.simComp.destroy();
  const ctx = document.getElementById('simComparisonChart').getContext('2d');
  
  state.charts.simComp = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Air Quality (AQI)', 'Traffic Congestion (%)', 'Water Load (%)'],
      datasets: [
        {
          label: 'Current State',
          data: [currentAqi, currentTraffic, currentWater],
          backgroundColor: 'rgba(94, 109, 131, 0.4)',
          borderColor: '#64748b',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'Simulated State',
          data: [Math.round(simAqi), Math.round(simTraffic), Math.round(simWater)],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
        x: { grid: { display: false }, ticks: { color: '#64748b' } }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8' } }
      }
    }
  });
}

// 5. PREDICTIVE ANALYTICS
function renderAnalytics() {
  const select = document.getElementById('analytics-metric-select');
  select.onchange = () => {
    renderAnalyticsCharts();
  };
  renderAnalyticsCharts();
}

function renderAnalyticsCharts() {
  if (state.activePanel !== 'analytics') return;
  
  const select = document.getElementById('analytics-metric-select');
  const metric = select.value;
  
  if (state.charts.forecast) state.charts.forecast.destroy();
  const ctx = document.getElementById('analyticsForecastChart').getContext('2d');

  // Timeline labels (15 historical days, 15 forecast days)
  const labels = [
    'Nov 16', 'Nov 18', 'Nov 20', 'Nov 22', 'Nov 24', 'Nov 26', 'Nov 28', 'Nov 30',
    'Dec 02 (F)', 'Dec 04 (F)', 'Dec 06 (F)', 'Dec 08 (F)', 'Dec 10 (F)', 'Dec 12 (F)', 'Dec 14 (F)'
  ];

  let historical = [];
  let forecast = [];
  let upper = [];
  let lower = [];

  if (metric === 'aqi') {
    historical = [85, 90, 88, 95, 102, 105, 110, 112, null, null, null, null, null, null, null];
    forecast = [null, null, null, null, null, null, null, 112, 118, 125, 134, 140, 148, 155, 162];
    upper = [null, null, null, null, null, null, null, 112, 125, 138, 150, 162, 175, 185, 198];
    lower = [null, null, null, null, null, null, null, 112, 110, 112, 118, 120, 122, 125, 130];
  } else if (metric === 'complaints') {
    historical = [150, 160, 175, 168, 185, 202, 215, 234, null, null, null, null, null, null, null];
    forecast = [null, null, null, null, null, null, null, 234, 240, 252, 260, 275, 290, 310, 330];
    upper = [null, null, null, null, null, null, null, 234, 255, 270, 290, 315, 340, 370, 400];
    lower = [null, null, null, null, null, null, null, 234, 225, 230, 235, 240, 245, 250, 260];
  } else {
    historical = [68, 70, 69, 71, 73, 72, 74, 74, null, null, null, null, null, null, null];
    forecast = [null, null, null, null, null, null, null, 74, 76, 78, 80, 83, 85, 88, 92];
    upper = [null, null, null, null, null, null, null, 74, 80, 85, 90, 95, 98, 100, 100];
    lower = [null, null, null, null, null, null, null, 74, 72, 73, 74, 75, 76, 78, 80];
  }

  state.charts.forecast = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Historical Data',
          data: historical,
          borderColor: '#3b82f6',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: 'AI Forecast',
          data: forecast,
          borderColor: '#8b5cf6',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          borderDash: [5, 5],
          pointRadius: 3
        },
        {
          label: 'Confidence Upper Bound',
          data: upper,
          borderColor: 'rgba(139, 92, 246, 0.15)',
          backgroundColor: 'rgba(139, 92, 246, 0.05)',
          borderWidth: 1,
          fill: '+1',
          pointRadius: 0
        },
        {
          label: 'Confidence Lower Bound',
          data: lower,
          borderColor: 'rgba(139, 92, 246, 0.15)',
          backgroundColor: 'transparent',
          borderWidth: 1,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
        x: { grid: { display: false }, ticks: { color: '#64748b' } }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8' } }
      }
    }
  });
}

// Citizen Portal Logic
let activeCompFilter = 'All';

function initCitizenPortal() {
  const form = document.getElementById('complaint-form');
  const radioLabels = document.querySelectorAll('.radio-label');
  
  // Custom Radio styling interaction
  radioLabels.forEach(label => {
    const radio = label.querySelector('input[type="radio"]');
    radio.addEventListener('change', () => {
      radioLabels.forEach(l => l.classList.remove('selected'));
      if (radio.checked) {
        label.classList.add('selected');
      }
    });
  });

  // Highlight default checked Low radio
  const defaultRadio = document.querySelector('.radio-label input[value="Low"]');
  if (defaultRadio && defaultRadio.checked) {
    defaultRadio.parentElement.classList.add('selected');
  }

  // Handle Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('comp-title').value.trim();
    const ward = document.getElementById('comp-ward').value;
    const category = document.getElementById('comp-category').value;
    const severity = document.querySelector('input[name="comp-severity"]:checked').value;
    const description = document.getElementById('comp-description').value.trim();
    
    const ticketId = `CV-${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    
    const deptMap = {
      'Water Scarcity': 'Hydrological Services',
      'Waste Management': 'Sanitation Division',
      'Air Quality': 'EcoWatch & Emissions Control',
      'Traffic Congestion': 'Transit & Signal Operations',
      'Public Safety': 'Municipal Safety Grid',
      'Other': 'General Services'
    };

    const newTicket = {
      id: ticketId,
      title: title,
      ward: ward,
      category: category,
      severity: severity,
      description: description,
      status: 'Pending',
      date: dateStr,
      department: deptMap[category] || 'General Services'
    };

    // Prepend to complaints list
    state.myComplaints.unshift(newTicket);
    
    // Update local dashboard state metrics to increment live!
    if (state.dashboardData && state.dashboardData.wards[ward]) {
      state.dashboardData.wards[ward].current_data.complaints += 1;
      
      // Update charts and dashboard metrics if active
      populateMetrics();
      renderDashboardCharts();
    }
    
    // Reset form
    form.reset();
    radioLabels.forEach(l => l.classList.remove('selected'));
    if (defaultRadio) {
      defaultRadio.checked = true;
      defaultRadio.parentElement.classList.add('selected');
    }
    
    // Render and Notify
    renderCitizenPortal();
    showToast(`Complaint filed successfully! Ticket #${ticketId} created.`);
  });

  // Handle Resolution filter buttons
  const filterBtns = document.querySelectorAll('.comp-filter-btn');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCompFilter = btn.getAttribute('data-filter');
      renderCitizenPortal();
    };
  });
}

function renderCitizenPortal() {
  const container = document.getElementById('my-complaints-list');
  if (!container) return;

  container.innerHTML = '';
  
  // Filter complaints list
  const filtered = state.myComplaints.filter(c => {
    if (activeCompFilter === 'All') return true;
    return c.status === activeCompFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="flex-center flex-column text-center py-6 text-slate-500">
        <i class="fa-solid fa-clipboard-list font-24 mb-2"></i>
        <p>No complaints found matching status: ${activeCompFilter}.</p>
      </div>
    `;
    return;
  }

  const categoryEmojis = {
    'Water Scarcity': '💧',
    'Waste Management': '🗑️',
    'Air Quality': '🌫️',
    'Traffic Congestion': '🚦',
    'Public Safety': '🛡️',
    'Other': '📋'
  };

  filtered.forEach(c => {
    const statusBadgeClass = c.status === 'Resolved' ? 'green' : c.status === 'In Progress' ? 'orange' : 'red';
    const severityBadgeClass = c.severity === 'Critical' ? 'red' : c.severity === 'High' ? 'orange' : 'purple';
    
    const severityColors = {
      'Low': '#10b981',      // Green
      'Medium': '#8b5cf6',   // Purple
      'High': '#f59e0b',     // Amber
      'Critical': '#ef4444'  // Red
    };
    const accentColor = severityColors[c.severity] || '#3b82f6';
    
    const card = document.createElement('div');
    card.className = 'complaint-log-item';
    card.style.setProperty('--accent-color', accentColor);
    card.innerHTML = `
      <div class="comp-log-header">
        <span class="badge ${severityBadgeClass}">${c.severity} Urgency</span>
        <div class="comp-log-meta">
          <span>Ticket: <strong>#${c.id}</strong></span>
          <span>${c.date}</span>
        </div>
      </div>
      <h4 class="comp-log-title">${categoryEmojis[c.category] || '📋'} ${escapeHtml(c.title)}</h4>
      <p class="comp-log-desc">${escapeHtml(c.description)}</p>
      <div class="comp-log-footer">
        <span class="comp-log-dept"><i class="fa-solid fa-building-user mr-1"></i> Assigned: ${c.department} (${c.ward})</span>
        <span class="badge ${statusBadgeClass}">${c.status}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function showToast(message) {
  // Remove existing toast if any
  const oldToast = document.querySelector('.toast-notification');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check text-green mr-2"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  // Fade out and remove after 3.5 seconds
  setTimeout(() => {
    toast.style.transition = 'opacity 0.5s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}
