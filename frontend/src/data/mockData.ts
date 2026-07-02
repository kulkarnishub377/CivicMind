// CivicMind Mock Data - SmartVille City with 5 Wards
// 30 days of data for dashboard, analytics, predictions

export interface WardData {
  ward: string;
  aqi: number;
  temperature: number;
  rainfall: number;
  trafficIndex: number;
  busDelay: number;
  waterUsage: number;
  energyUsage: number;
  complaints: number;
  incidents: number;
  emergencyCalls: number;
  sentiment: number; // 0-100
}

export interface TimeSeriesPoint {
  date: string;
  ward: string;
  aqi: number;
  temperature: number;
  rainfall: number;
  trafficIndex: number;
  waterUsage: number;
  complaints: number;
  sentiment: number;
}

export interface PredictionData {
  ward: string;
  floodRisk: 'Low' | 'Medium' | 'High';
  waterShortageRisk: 'Low' | 'Medium' | 'High';
  trafficCongestion: 'Low' | 'Medium' | 'High';
  wasteOverflow: 'Low' | 'Medium' | 'High';
  pollutionSpike: 'Low' | 'Medium' | 'High';
}

export interface Recommendation {
  id: string;
  ward: string;
  problem: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendations: string[];
  expectedImpact: string;
  confidence: number;
}

// Current ward snapshot (latest data)
export const currentWardData: WardData[] = [
  {
    ward: 'Ward A',
    aqi: 85,
    temperature: 32,
    rainfall: 12,
    trafficIndex: 45,
    busDelay: 8,
    waterUsage: 78,
    energyUsage: 65,
    complaints: 23,
    incidents: 5,
    emergencyCalls: 12,
    sentiment: 78,
  },
  {
    ward: 'Ward B',
    aqi: 112,
    temperature: 34,
    rainfall: 8,
    trafficIndex: 72,
    busDelay: 15,
    waterUsage: 85,
    energyUsage: 72,
    complaints: 67,
    incidents: 12,
    emergencyCalls: 24,
    sentiment: 58,
  },
  {
    ward: 'Ward C',
    aqi: 55,
    temperature: 30,
    rainfall: 25,
    trafficIndex: 30,
    busDelay: 3,
    waterUsage: 60,
    energyUsage: 55,
    complaints: 8,
    incidents: 2,
    emergencyCalls: 5,
    sentiment: 91,
  },
  {
    ward: 'Ward D',
    aqi: 168,
    temperature: 36,
    rainfall: 3,
    trafficIndex: 88,
    busDelay: 22,
    waterUsage: 95,
    energyUsage: 82,
    complaints: 145,
    incidents: 18,
    emergencyCalls: 38,
    sentiment: 42,
  },
  {
    ward: 'Ward E',
    aqi: 95,
    temperature: 33,
    rainfall: 15,
    trafficIndex: 55,
    busDelay: 10,
    waterUsage: 70,
    energyUsage: 60,
    complaints: 34,
    incidents: 8,
    emergencyCalls: 15,
    sentiment: 71,
  },
];

// Generate 30-day time series for each ward
export function generateTimeSeries(): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const baseDate = new Date('2024-11-01');
  const wardConfigs = {
    'Ward A': { aqiBase: 80, tempBase: 31, rainBase: 10, trafficBase: 42, waterBase: 75, compBase: 20, sentBase: 78 },
    'Ward B': { aqiBase: 105, tempBase: 33, rainBase: 6, trafficBase: 68, waterBase: 82, compBase: 60, sentBase: 58 },
    'Ward C': { aqiBase: 52, tempBase: 29, rainBase: 22, trafficBase: 28, waterBase: 58, compBase: 8, sentBase: 91 },
    'Ward D': { aqiBase: 155, tempBase: 35, rainBase: 2, trafficBase: 85, waterBase: 92, compBase: 130, sentBase: 42 },
    'Ward E': { aqiBase: 90, tempBase: 32, rainBase: 13, trafficBase: 52, waterBase: 68, compBase: 30, sentBase: 71 },
  };

  for (let day = 0; day < 30; day++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];

    // Event: Flood week around day 18-22
    const isFloodWeek = day >= 18 && day <= 22;
    // Event: Pollution spike around day 10-14 in Ward D
    const isPollutionSpike = day >= 10 && day <= 14;
    // Event: Traffic surge around day 25-28
    const isTrafficSurge = day >= 25 && day <= 28;

    for (const [ward, config] of Object.entries(wardConfigs)) {
      let aqi = config.aqiBase + Math.round((Math.random() - 0.5) * 20);
      let temp = config.tempBase + Math.round((Math.random() - 0.5) * 3);
      let rain = config.rainBase + Math.round((Math.random() - 0.3) * 8);
      let traffic = config.trafficBase + Math.round((Math.random() - 0.5) * 15);
      let water = config.waterBase + Math.round((Math.random() - 0.5) * 10);
      let comp = config.compBase + Math.round((Math.random() - 0.5) * 10);
      let sent = config.sentBase + Math.round((Math.random() - 0.5) * 8);

      if (isFloodWeek) {
        rain += 25 + Math.round(Math.random() * 20);
        traffic += 20;
        if (ward === 'Ward C') { rain += 30; comp += 15; sent -= 10; }
      }
      if (isPollutionSpike && ward === 'Ward D') {
        aqi += 40 + Math.round(Math.random() * 30);
        comp += 20;
        sent -= 15;
      }
      if (isTrafficSurge) {
        traffic += 25 + Math.round(Math.random() * 15);
        comp += 8;
      }

      data.push({
        date: dateStr,
        ward,
        aqi: Math.max(10, aqi),
        temperature: temp,
        rainfall: Math.max(0, rain),
        trafficIndex: Math.max(5, Math.min(100, traffic)),
        waterUsage: Math.max(20, Math.min(100, water)),
        complaints: Math.max(0, comp),
        sentiment: Math.max(5, Math.min(100, sent)),
      });
    }
  }
  return data;
}

// Predictions
export const predictions: PredictionData[] = [
  { ward: 'Ward A', floodRisk: 'Low', waterShortageRisk: 'Low', trafficCongestion: 'Medium', wasteOverflow: 'Low', pollutionSpike: 'Low' },
  { ward: 'Ward B', floodRisk: 'Medium', waterShortageRisk: 'Medium', trafficCongestion: 'High', wasteOverflow: 'Medium', pollutionSpike: 'Medium' },
  { ward: 'Ward C', floodRisk: 'High', waterShortageRisk: 'Low', trafficCongestion: 'Low', wasteOverflow: 'Low', pollutionSpike: 'Low' },
  { ward: 'Ward D', floodRisk: 'Low', waterShortageRisk: 'High', trafficCongestion: 'High', wasteOverflow: 'High', pollutionSpike: 'High' },
  { ward: 'Ward E', floodRisk: 'Medium', waterShortageRisk: 'Medium', trafficCongestion: 'Medium', wasteOverflow: 'Medium', pollutionSpike: 'Medium' },
];

// Recommendations
export const recommendations: Recommendation[] = [
  {
    id: 'rec-1',
    ward: 'Ward D',
    problem: 'Severe air quality deterioration (AQI: 168) with 45% increase in complaints',
    severity: 'Critical',
    recommendations: [
      'Deploy mobile air quality monitoring stations at 3 key intersections',
      'Issue health advisory for vulnerable populations',
      'Inspect and enforce emission standards on industrial units',
      'Activate smog towers in affected zones',
    ],
    expectedImpact: 'Expected AQI reduction of 25-35% within 2 weeks',
    confidence: 87,
  },
  {
    id: 'rec-2',
    ward: 'Ward D',
    problem: 'Critical water shortage risk with 95% usage capacity',
    severity: 'Critical',
    recommendations: [
      'Implement Stage 2 water conservation measures',
      'Deploy 5 emergency water tankers to affected areas',
      'Inspect water pipelines for leaks (estimated 15% loss)',
      'Schedule alternate-day supply for non-essential usage',
    ],
    expectedImpact: 'Water usage reduction of 20% within 1 week',
    confidence: 82,
  },
  {
    id: 'rec-3',
    ward: 'Ward D',
    problem: 'High waste overflow predicted within 5 days',
    severity: 'High',
    recommendations: [
      'Increase waste collection frequency by 2 pickups/week',
      'Deploy 3 additional smart bins at overflow-prone locations',
      'Launch community awareness campaign on waste segregation',
      'Activate overflow response team for monitoring',
    ],
    expectedImpact: 'Complaint reduction of 35% within 10 days',
    confidence: 79,
  },
  {
    id: 'rec-4',
    ward: 'Ward B',
    problem: 'Traffic congestion index at 72 with 15-min average bus delays',
    severity: 'High',
    recommendations: [
      'Add 3 peak-hour buses on Route B7 and B12',
      'Implement dynamic traffic signal optimization at 5 junctions',
      'Create temporary park-and-ride facility near Metro Station',
      'Deploy traffic marshals during peak hours (7-9 AM, 5-7 PM)',
    ],
    expectedImpact: 'Congestion reduction of 20% within 2 weeks',
    confidence: 75,
  },
  {
    id: 'rec-5',
    ward: 'Ward C',
    problem: 'High flood risk due to heavy rainfall forecast',
    severity: 'High',
    recommendations: [
      'Pre-position sandbags and pumps in low-lying areas',
      'Clear drainage channels and stormwater systems',
      'Issue early warning to 12,000 residents in flood-prone zones',
      'Activate emergency response teams and shelters',
    ],
    expectedImpact: 'Reduce flood damage risk by 40%',
    confidence: 84,
  },
  {
    id: 'rec-6',
    ward: 'Ward E',
    problem: 'Moderate resource inefficiency across utilities',
    severity: 'Medium',
    recommendations: [
      'Install smart meters in top 50 energy-consuming buildings',
      'Optimize water pressure in Zone E3 (estimated 12% savings)',
      'Implement LED streetlight conversion in 3 sectors',
      'Launch community solar program for residential areas',
    ],
    expectedImpact: 'Resource efficiency improvement of 15% within 1 month',
    confidence: 71,
  },
];

// Community Health Score Calculation
export function calculateCommunityScore(ward: WardData): number {
  // Environment Score (0-100) - lower AQI = better
  const envScore = Math.max(0, 100 - ward.aqi * 0.5);

  // Mobility Score (0-100) - lower traffic = better
  const mobilityScore = Math.max(0, 100 - ward.trafficIndex);

  // Water Score (0-100) - lower usage % = better
  const waterScore = Math.max(0, 100 - ward.waterUsage);

  // Safety Score (0-100) - lower incidents = better
  const safetyScore = Math.max(0, 100 - ward.incidents * 3 - ward.emergencyCalls * 0.5);

  // Citizen Satisfaction
  const citizenScore = ward.sentiment;

  const total = Math.round(
    envScore * 0.2 +
    mobilityScore * 0.2 +
    waterScore * 0.2 +
    safetyScore * 0.2 +
    citizenScore * 0.2
  );

  return Math.max(0, Math.min(100, total));
}

// Overall city score
export function calculateCityScore(): number {
  const scores = currentWardData.map(calculateCommunityScore);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// Category scores for a ward
export function getCategoryScores(ward: WardData) {
  return {
    environment: Math.max(0, Math.round(100 - ward.aqi * 0.5)),
    mobility: Math.max(0, Math.round(100 - ward.trafficIndex)),
    water: Math.max(0, Math.round(100 - ward.waterUsage)),
    safety: Math.max(0, Math.round(100 - ward.incidents * 3 - ward.emergencyCalls * 0.5)),
    satisfaction: ward.sentiment,
  };
}

// Citizen complaint categories
export const complaintCategories = [
  { category: 'Waste Management', count: 156, trend: +23 },
  { category: 'Water Supply', count: 89, trend: +15 },
  { category: 'Air Pollution', count: 72, trend: +31 },
  { category: 'Road Conditions', count: 64, trend: -5 },
  { category: 'Noise Pollution', count: 45, trend: +8 },
  { category: 'Public Transport', count: 38, trend: +12 },
  { category: 'Drainage', count: 34, trend: +18 },
  { category: 'Street Lighting', count: 21, trend: -3 },
];

// Sample chat responses for demo
export const chatResponses: Record<string, string> = {
  default: `I'm CivicMind AI, your Community Decision Intelligence assistant. I can help you analyze community data, predict risks, and recommend actions. Try asking about specific wards, risks, or recommendations!`,
  'which ward needs attention': `**Ward D** needs urgent attention. Here's why:\n\n🔴 **AQI: 168** — Well above safe threshold (100)\n🔴 **Water Shortage Risk: HIGH** — Usage at 95% capacity\n🔴 **Complaints: 145** — 45% increase this week\n🔴 **Waste Overflow Risk: HIGH** — Predicted within 5 days\n🔴 **Traffic Congestion: 88** — Severe delays reported\n\n**Confidence: 87%**\n\nRecommended immediate actions:\n1. Deploy air quality monitoring stations\n2. Implement Stage 2 water conservation\n3. Increase waste collection frequency\n4. Issue health advisory for residents`,
  'why is air quality worsening': `Air quality deterioration analysis for **SmartVille**:\n\n📈 **Ward D** is the primary concern:\n- AQI jumped from 120 to 168 (40% increase)\n- Coincides with industrial activity spike in Zone D2\n- Low rainfall (3mm) hasn't dispersed pollutants\n- Temperature at 36°C increases ground-level ozone\n\n📊 **Contributing Factors:**\n- Industrial emissions: Primary cause (45%)\n- Vehicular traffic: Secondary (30%)\n- Construction dust: Tertiary (15%)\n- Weather conditions: Aggravating (10%)\n\n**Prediction:** If no action is taken, AQI may reach 190+ within 3 days.\n\n**Recommended Action:** Enforce emission standards and deploy smog towers immediately.`,
  'flood risk': `**Flood Risk Assessment — Next 7 Days**\n\n🌊 **Ward C: HIGH RISK** ⚠️\n- Rainfall forecast: 80-120mm over next 5 days\n- Drainage capacity at 75%\n- Low-lying areas: 12,000 residents at risk\n- Historical flood data shows 3 incidents in similar conditions\n\n🔶 **Ward B: MEDIUM RISK**\n- Rainfall forecast: 40-60mm\n- Some drainage blockages reported\n\n🟢 **Ward A, D, E: LOW RISK**\n- Minimal rainfall expected\n- Drainage systems operational\n\n**Confidence: 84%**\n\n**Urgent Actions for Ward C:**\n1. Pre-position emergency equipment\n2. Clear drainage channels immediately\n3. Issue early warning to residents`,
  'recommendations': `**Priority Recommendations for SmartVille**\n\n🔴 **CRITICAL — Ward D:**\n- Air quality emergency (AQI: 168)\n- Water shortage imminent (95% usage)\n- Waste overflow in 5 days\n→ Actions: Deploy monitors, conserve water, increase collection\n\n🟠 **HIGH — Ward B:**\n- Traffic congestion severe (Index: 72)\n- Bus delays averaging 15 minutes\n→ Actions: Add buses, optimize signals, park-and-ride\n\n🟠 **HIGH — Ward C:**\n- Flood risk elevated due to rainfall\n→ Actions: Clear drains, position equipment, warn residents\n\n🟡 **MEDIUM — Ward E:**\n- Resource inefficiency across utilities\n→ Actions: Smart meters, LED conversion, solar program\n\n**Overall Impact:** Implementing all recommendations could improve city score from 68 to 82.`,
};

// What-If Simulator presets
export const simulatorPresets = [
  {
    id: 'waste',
    label: 'Increase waste collection by 20%',
    ward: 'Ward D',
    impacts: {
      complaints: -35,
      satisfaction: +10,
      environment: +5,
      overallScore: +6,
    },
    details: 'Adding 2 extra pickups per week and 3 smart bins reduces complaint volume by 35% and improves citizen satisfaction significantly.',
  },
  {
    id: 'buses',
    label: 'Add 5 new buses',
    ward: 'Ward B',
    impacts: {
      traffic: -15,
      busDelay: -40,
      pollution: -7,
      overallScore: +4,
    },
    details: 'New buses on routes B7 and B12 reduce wait times by 40%, cut congestion by 15%, and lower emissions by 7%.',
  },
  {
    id: 'water',
    label: 'Implement water conservation (25%)',
    ward: 'Ward D',
    impacts: {
      waterUsage: -25,
      waterShortage: 'High → Low',
      satisfaction: +8,
      overallScore: +5,
    },
    details: 'Stage 2 conservation with pipeline repairs reduces usage by 25%, eliminating shortage risk and improving satisfaction.',
  },
  {
    id: 'flood',
    label: 'Clear drainage + early warning',
    ward: 'Ward C',
    impacts: {
      floodRisk: 'High → Medium',
      damageEstimate: -40,
      evacuationTime: '+2 hours',
      overallScore: +3,
    },
    details: 'Proactive drainage clearing and early warning systems reduce flood damage by 40% and give residents 2 extra hours for evacuation.',
  },
  {
    id: 'solar',
    label: 'Launch community solar program',
    ward: 'Ward E',
    impacts: {
      energyCost: -30,
      carbonEmissions: -15,
      satisfaction: +12,
      overallScore: +4,
    },
    details: 'Solar panels on 500 rooftops reduce energy costs by 30%, cut emissions by 15%, and create local green jobs.',
  },
];
