"""
Decision Center API Router
Executive command center with critical issues, action items, agent timeline, and community pulse
"""

from fastapi import APIRouter
from typing import Dict, Any, List
from models.predictor import generate_all_predictions
from models.scorer import calculate_community_score, calculate_satisfaction_score
from agents.recommendation_agent import RecommendationAgent

router = APIRouter()

# Ward data
WARD_DATA = {
    "Ward A": {"ward": "Ward A", "aqi": 85, "temperature": 32, "rainfall": 12, "humidity": 65,
               "wind_speed": 8, "traffic_index": 45, "bus_delay_minutes": 8, "avg_speed_kmh": 35,
               "water_usage_pct": 78, "energy_usage_mwh": 65, "reservoir_level_pct": 72,
               "complaints": 23, "sentiment": 0.2, "incidents": 5, "emergency_calls": 12,
               "crime_reports": 3, "resolution_rate": 0.7, "historical_floods": 1},
    "Ward B": {"ward": "Ward B", "aqi": 112, "temperature": 34, "rainfall": 8, "humidity": 55,
               "wind_speed": 6, "traffic_index": 72, "bus_delay_minutes": 15, "avg_speed_kmh": 22,
               "water_usage_pct": 85, "energy_usage_mwh": 72, "reservoir_level_pct": 65,
               "complaints": 67, "sentiment": -0.1, "incidents": 12, "emergency_calls": 24,
               "crime_reports": 6, "resolution_rate": 0.5, "historical_floods": 2},
    "Ward C": {"ward": "Ward C", "aqi": 55, "temperature": 30, "rainfall": 25, "humidity": 80,
               "wind_speed": 12, "traffic_index": 30, "bus_delay_minutes": 3, "avg_speed_kmh": 40,
               "water_usage_pct": 60, "energy_usage_mwh": 55, "reservoir_level_pct": 82,
               "complaints": 8, "sentiment": 0.5, "incidents": 2, "emergency_calls": 5,
               "crime_reports": 1, "resolution_rate": 0.8, "historical_floods": 4},
    "Ward D": {"ward": "Ward D", "aqi": 168, "temperature": 36, "rainfall": 3, "humidity": 40,
               "wind_speed": 3, "traffic_index": 88, "bus_delay_minutes": 22, "avg_speed_kmh": 15,
               "water_usage_pct": 95, "energy_usage_mwh": 82, "reservoir_level_pct": 35,
               "complaints": 145, "sentiment": -0.4, "incidents": 18, "emergency_calls": 38,
               "crime_reports": 9, "resolution_rate": 0.25, "historical_floods": 0},
    "Ward E": {"ward": "Ward E", "aqi": 95, "temperature": 33, "rainfall": 15, "humidity": 60,
               "wind_speed": 7, "traffic_index": 55, "bus_delay_minutes": 10, "avg_speed_kmh": 28,
               "water_usage_pct": 70, "energy_usage_mwh": 60, "reservoir_level_pct": 70,
               "complaints": 34, "sentiment": 0.1, "incidents": 8, "emergency_calls": 15,
               "crime_reports": 4, "resolution_rate": 0.6, "historical_floods": 1},
}


@router.get("/critical-issues")
async def get_critical_issues():
    """Get all critical issues with explainable AI drivers."""
    issues = [
        {
            "id": "ci-1",
            "issue": "Flood Risk",
            "ward": "Ward C",
            "severity": "Critical",
            "confidence": 92,
            "drivers": [
                "Rainfall +40% above normal",
                "Drainage complaints +18%",
                "Water level in drains +25%",
                "3 historical floods in similar conditions",
            ],
            "trend": "worsening",
            "explanation": "Heavy rainfall combined with drainage system strain creates high flood probability. Historical data shows 3 similar events in past 2 years.",
        },
        {
            "id": "ci-2",
            "issue": "AQI Spike",
            "ward": "Ward D",
            "severity": "Critical",
            "confidence": 88,
            "drivers": [
                "Industrial emissions +45% in Zone D2",
                "Low rainfall (3mm) — no pollutant dispersion",
                "Temperature 36°C — ground-level ozone formation",
                "Wind speed only 3 km/h — stagnant air",
            ],
            "trend": "worsening",
            "explanation": "Industrial emissions are the primary driver (45%). Weather conditions (low rain, low wind) trap pollutants. Without intervention, AQI may reach 190+.",
        },
        {
            "id": "ci-3",
            "issue": "Water Shortage",
            "ward": "Ward D",
            "severity": "Critical",
            "confidence": 88,
            "drivers": [
                "Usage at 95% capacity",
                "Reservoir at critical 35% level",
                "Pipeline leaks estimated at 15%",
                "Rainfall only 3mm this week",
            ],
            "trend": "worsening",
            "explanation": "Water demand exceeds supply capacity. Reservoir levels are critically low. Pipeline leaks waste ~15% of water. Without conservation, shortage in 3-5 days.",
        },
        {
            "id": "ci-4",
            "issue": "Waste Overflow",
            "ward": "Ward D",
            "severity": "High",
            "confidence": 79,
            "drivers": [
                "Complaints +45% this week",
                "Collection frequency insufficient",
                "Bin capacity at 90%",
                "Overflow predicted in 5 days",
            ],
            "trend": "worsening",
            "explanation": "Current waste collection schedule cannot handle increased volume. At current rate, overflow events will begin in 5 days.",
        },
        {
            "id": "ci-5",
            "issue": "Traffic Congestion",
            "ward": "Ward B",
            "severity": "High",
            "confidence": 81,
            "drivers": [
                "Traffic index at 72 (heavy)",
                "Bus delays averaging 15 min",
                "Road construction on Route B7",
                "Peak hour volume +30%",
            ],
            "trend": "stable",
            "explanation": "Road construction has reduced capacity. Peak hour demand exceeds road capacity by 30%. Bus delays cascade to increased private vehicle usage.",
        },
    ]
    return {"issues": issues, "total": len(issues)}


@router.get("/action-items")
async def get_action_items():
    """Get prioritized action items with impact/cost analysis."""
    actions = [
        {"id": "a1", "action": "Clear drainage channels in Ward C", "ward": "Ward C", "impact": "High", "cost": "Low", "timeline": "0-24h", "type": "immediate"},
        {"id": "a2", "action": "Deploy emergency water tankers to Ward D", "ward": "Ward D", "impact": "High", "cost": "Medium", "timeline": "0-24h", "type": "immediate"},
        {"id": "a3", "action": "Issue flood advisory for Ward C residents", "ward": "Ward C", "impact": "High", "cost": "Low", "timeline": "0-12h", "type": "immediate"},
        {"id": "a4", "action": "Enforce emission standards in Zone D2", "ward": "Ward D", "impact": "High", "cost": "Low", "timeline": "0-48h", "type": "immediate"},
        {"id": "a5", "action": "Deploy traffic marshals on Route B7", "ward": "Ward B", "impact": "Medium", "cost": "Low", "timeline": "1-3 days", "type": "short-term"},
        {"id": "a6", "action": "Increase waste collection by 2x in Ward D", "ward": "Ward D", "impact": "High", "cost": "Medium", "timeline": "1-3 days", "type": "short-term"},
        {"id": "a7", "action": "Activate smog towers in affected zones", "ward": "Ward D", "impact": "Medium", "cost": "High", "timeline": "3-7 days", "type": "short-term"},
        {"id": "a8", "action": "Implement dynamic traffic signals", "ward": "Ward B", "impact": "High", "cost": "Medium", "timeline": "2-4 weeks", "type": "long-term"},
        {"id": "a9", "action": "Install smart water meters in Ward D", "ward": "Ward D", "impact": "Medium", "cost": "High", "timeline": "2-4 weeks", "type": "long-term"},
        {"id": "a10", "action": "Launch community solar program in Ward E", "ward": "Ward E", "impact": "Medium", "cost": "High", "timeline": "1-3 months", "type": "long-term"},
    ]
    return {"actions": actions, "total": len(actions)}


@router.get("/agent-timeline")
async def get_agent_timeline():
    """Get the agent collaboration timeline showing how agents detected and responded to events."""
    timeline = [
        {
            "agent": "Environment Agent",
            "color": "#22c55e",
            "icon": "🌿",
            "event": "Heavy rainfall detected — 40% above seasonal normal",
            "output": "Flood risk elevated to HIGH for Ward C",
            "timestamp": "10:02 AM",
        },
        {
            "agent": "Environment Agent",
            "color": "#22c55e",
            "icon": "🌿",
            "event": "AQI spike in Ward D — index at 168, unsafe levels",
            "output": "Air quality alert triggered for Ward D",
            "timestamp": "10:03 AM",
        },
        {
            "agent": "Mobility Agent",
            "color": "#3b82f6",
            "icon": "🚗",
            "event": "Road congestion predicted due to rainfall + construction",
            "output": "Traffic forecast: Severe delays in Ward B & C",
            "timestamp": "10:05 AM",
        },
        {
            "agent": "Mobility Agent",
            "color": "#3b82f6",
            "icon": "🚗",
            "event": "Bus delays increasing — Route B7 +18 min average",
            "output": "Public transport disruption alert issued",
            "timestamp": "10:06 AM",
        },
        {
            "agent": "Citizen Agent",
            "color": "#a855f7",
            "icon": "👥",
            "event": "Drainage complaints +18% in Ward C",
            "output": "Citizen dissatisfaction rising — sentiment dropping",
            "timestamp": "10:08 AM",
        },
        {
            "agent": "Citizen Agent",
            "color": "#a855f7",
            "icon": "👥",
            "event": "Water supply complaints spike in Ward D — 30 new reports",
            "output": "Negative sentiment threshold breached in Ward D",
            "timestamp": "10:09 AM",
        },
        {
            "agent": "Recommendation Agent",
            "color": "#f97316",
            "icon": "💡",
            "event": "Synthesizing all agent outputs...",
            "output": "Priority: CRITICAL — Ward D & Ward C need immediate intervention",
            "timestamp": "10:10 AM",
        },
        {
            "agent": "Recommendation Agent",
            "color": "#f97316",
            "icon": "💡",
            "event": "Generating action plan based on combined analysis",
            "output": "6 immediate actions + 4 short-term actions recommended",
            "timestamp": "10:11 AM",
        },
    ]
    return {"timeline": timeline, "total_steps": len(timeline)}


@router.get("/community-pulse")
async def get_community_pulse():
    """Get community sentiment pulse data."""
    ward_pulse = []
    for ward_name, data in WARD_DATA.items():
        sat_score = calculate_satisfaction_score(data["sentiment"], data["complaints"])
        positive = min(80, max(10, int(sat_score * 0.8)))
        negative = min(70, max(5, int((100 - sat_score) * 0.7)))
        neutral = 100 - positive - negative

        ward_pulse.append({
            "ward": ward_name,
            "pulse_score": int(sat_score),
            "positive_pct": positive,
            "neutral_pct": neutral,
            "negative_pct": negative,
        })

    city_positive = int(sum(w["positive_pct"] for w in ward_pulse) / len(ward_pulse))
    city_negative = int(sum(w["negative_pct"] for w in ward_pulse) / len(ward_pulse))
    city_neutral = 100 - city_positive - city_negative
    city_pulse = int(sum(w["pulse_score"] for w in ward_pulse) / len(ward_pulse))

    return {
        "city_pulse": city_pulse,
        "city_sentiment": {
            "positive": city_positive,
            "neutral": city_neutral,
            "negative": city_negative,
        },
        "ward_pulse": ward_pulse,
        "insight": "Negative sentiment increased primarily due to water supply interruptions in Ward D (60% negative) and drainage complaints in Ward C. Ward C remains most positive despite flood risk — residents report satisfaction with emergency response readiness.",
        "trend": "declining",
        "key_driver": "Water supply interruptions in Ward D",
    }


@router.get("/ai-summary")
async def get_ai_summary():
    """Get AI-generated executive summary."""
    return {
        "summary": (
            "Ward D is at highest risk due to critically elevated AQI (168), "
            "imminent water shortage (95% usage), and a 45% spike in citizen complaints. "
            "The convergence of air quality, water, and waste issues creates a compound risk "
            "scenario that could escalate rapidly. Simultaneously, Ward C faces high flood risk "
            "(92% confidence) due to heavy rainfall forecast and drainage infrastructure strain. "
            "Immediate intervention is recommended within 48 hours for both wards to prevent cascading failures."
        ),
        "confidence": 87,
        "data_sources": ["BigQuery: environment_data", "BigQuery: citizen_feedback", "BigQuery: mobility_data", "Vertex AI: predictions"],
        "model": "Gemini 2.5 + 4 AI Agents",
        "priority": "Critical",
        "wards_at_risk": ["Ward D", "Ward C"],
        "recommended_response_time": "0-48 hours",
    }
