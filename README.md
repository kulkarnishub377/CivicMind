# CivicMind - Community Decision Intelligence Platform

<div align="center">

# 🏙️ CivicMind
## Community Decision Intelligence Platform

**AI-powered platform that helps communities make smarter decisions using real-time data, predictive analytics, and autonomous AI agents**

[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Vertex%20AI-blue)](https://cloud.google.com/vertex-ai)
[![Gemini](https://img.shields.io/badge/Gemini-2.5-orange)](https://ai.google.dev/)
[![BigQuery](https://img.shields.io/badge/BigQuery-Analytics-green)](https://cloud.google.com/bigquery)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-teal)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 🎯 Problem Statement

Communities generate massive amounts of data — citizen complaints, weather, traffic, pollution, water usage, public health — but decision-makers struggle to answer:

- **What** is happening?
- **Why** is it happening?
- **What will** happen next?
- **What should** we do?

**CivicMind** becomes the AI brain for community decision-making.

---

## 🏗️ Architecture

```
Data Sources (Mock/BigQuery)
        ↓
   Analytics Engine
        ↓
   Vertex AI + Gemini
        ↓
   Agent Layer (4 AI Agents)
   ├── 🌿 Environment Agent → AQI, Weather, Flood Risk
   ├── 🚗 Mobility Agent → Traffic, Transit, Congestion  
   ├── 👥 Citizen Agent → Complaints, Sentiment, Satisfaction
   └── 💡 Recommendation Agent → Combines all → Action Plans
        ↓
   Community Dashboard + Command Center + Chat + Simulator
```

---

## 🚀 Features

### 1. Executive Command Center (`/decision-center`)
- **Critical Issues Table** with severity, confidence, and trend indicators
- **Action Items** with Impact vs Cost priority matrix
- **Agent Collaboration Timeline** — watch AI agents detect, analyze, and collaborate in real-time
- **Community Pulse** — sentiment analysis with ward-by-ward breakdown
- **AI Executive Summary** — one-paragraph crisis overview

### 2. Community Dashboard (`/`)
- Real-time metrics: AQI, Traffic, Water Usage, Complaints, Safety, Community Pulse
- Community Health Score (0-100) with animated score drop during crisis
- 5-ward comparison bars with crisis indicators
- 30-day trend charts
- **Explainable AI** — every prediction includes WHY

### 3. AI Chat Assistant (`/chat`)
- "Ask Your Community" natural language interface
- Agent-attributed responses (Environment/Mobility/Citizen/Recommendation)
- Confidence scores on every response
- Explainable AI — every answer includes WHY
- Suggested crisis-related questions

### 4. Predictive Analytics (`/analytics`)
- Flood, Water, Traffic, Waste, Pollution risk predictions
- AQI/Rainfall/Traffic/Sentiment trend charts
- Radar ward comparison
- Time range selector + ward filters

### 5. What-If Simulator (`/simulator`)
- **Digital Twin** — simulate policy changes before implementation
- Before/After community score comparison
- Risk level reduction visualization
- **Explainable AI** — every simulation explains WHY the predicted impact
- Crisis Response Demo scenario
- Custom scenario input

### 6. Community Health Score
- **20%** Environment | **20%** Mobility | **20%** Water | **20%** Safety | **20%** Satisfaction
- Per-ward breakdown with category scores
- AI explains score changes

### 7. Live Community Health Map
- SVG city map with ward-level health visualization
- Color-coded by score (Green/Yellow/Orange/Red)
- Click to drill down into ward details
- Pulsing indicators for crisis wards

### 8. Explainable AI (贯穿所有功能)
- Every prediction answers **WHY**
- Driver analysis with contribution bars
- Confidence intervals
- Methodology transparency
- Agent attribution on all AI outputs

### 9. Community Pulse
- Sentiment analysis from citizen complaints
- Positive/Neutral/Negative breakdown
- Ward-by-ward pulse scores
- AI insight on sentiment drivers

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14 + Tailwind CSS + Recharts |
| Backend | Python FastAPI |
| LLM | Google Gemini 2.5 (via Vertex AI) |
| RAG | Vertex AI Search / Vector Search |
| Database | Google BigQuery |
| Analytics | Looker Studio |
| Storage | Google Cloud Storage |
| API Layer | Google Cloud Run |
| Agents | Agent Development Kit (ADK) |
| Automation | Cloud Functions |

---

## 📁 Project Structure

```
civicmind/
├── frontend/                    # Next.js Dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── decision-center/ # ⭐ Executive Command Center
│   │   │   ├── chat/           # AI Assistant
│   │   │   ├── analytics/      # Predictive Analytics
│   │   │   └── simulator/      # What-If Simulator
│   │   ├── components/         # Reusable UI
│   │   │   ├── Sidebar.tsx
│   │   │   ├── CommunityScore.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   └── RiskIndicator.tsx
│   │   ├── data/mockData.ts    # SmartVille mock dataset
│   │   └── lib/api.ts          # API client
│
├── backend/                     # FastAPI Server
│   ├── main.py
│   ├── routers/
│   │   ├── dashboard.py
│   │   ├── chat.py
│   │   ├── predict.py
│   │   ├── recommend.py
│   │   ├── simulate.py
│   │   ├── agents.py
│   │   └── decision_center.py  # ⭐ Command Center API
│   ├── models/
│   │   ├── scorer.py           # Community Score engine
│   │   └── predictor.py        # Prediction models
│   ├── agents/
│   │   ├── environment_agent.py
│   │   ├── mobility_agent.py
│   │   ├── citizen_agent.py
│   │   └── recommendation_agent.py
│   └── data/generate_data.py   # Mock data generator
│
└── docker-compose.yml
```

---

## ⚡ Quick Start

### Frontend
```bash
cd frontend && npm install && npm run dev
# → http://localhost:3000
```

### Backend
```bash
cd backend && pip install -r requirements.txt && python main.py
# → http://localhost:8000
# → API Docs: http://localhost:8000/docs
```

---

## 🎬 Killer Demo Flow (3 Minutes)

**Don't demo features. Demo a crisis.**

1. **Detect** → Dashboard shows score dropping 81→68, crisis alert 🔴
2. **Analyze** → Click Ward D on city map, see compound risk
3. **Predict** → AI explains: "Flood risk HIGH because rainfall +40%, drainage complaints +18%"
4. **Agent Timeline** → Watch 4 agents collaborate in real-time
5. **Recommend** → Decision Center shows 6 immediate actions with Impact/Cost
6. **Simulate** → "Deploy emergency teams" → Score 68→76, Flood Risk 86%→57%
7. **Decide** → Mayor makes data-driven decision with full AI explanation

**Detect → Analyze → Predict → Recommend → Simulate → Decide**

---



## 🔮 Future Scope

- Real-time IoT sensor data integration
- BigQuery streaming inserts
- Vertex AI RAG with community policies
- Cloud Run deployment
- ADK agent deployment
- Looker Studio dashboards
- Mobile app
- Multi-city support
- Video stream analysis for traffic/safety

---

**CivicMind transforms fragmented community data into predictive insights, explainable recommendations, and simulated outcomes, enabling governments and communities to make smarter, faster, and more resilient decisions.**

Built with ❤️ by [Shubham Kulkarni](https://kulkarnishub377.github.io/)
