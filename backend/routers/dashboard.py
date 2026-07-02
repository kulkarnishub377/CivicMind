"""
Dashboard API Router
Provides aggregated data for the main dashboard view
"""

from fastapi import APIRouter
from typing import Dict, Any, List
from models.scorer import (
    calculate_community_score,
    calculate_environment_score,
    calculate_mobility_score,
    calculate_water_score,
    calculate_safety_score,
    calculate_satisfaction_score,
    get_score_explanation,
)

router = APIRouter()

# Current ward data (in production, this would come from BigQuery)
CURRENT_DATA = {
    "Ward A": {"ward": "Ward A", "aqi": 85, "temperature": 32, "rainfall": 12, "humidity": 65,
               "traffic_index": 45, "bus_delay_minutes": 8, "avg_speed_kmh": 35,
               "water_usage_pct": 78, "energy_usage_mwh": 65, "reservoir_level_pct": 72,
               "complaints": 23, "sentiment": 0.2, "incidents": 5, "emergency_calls": 12,
               "crime_reports": 3, "resolution_rate": 0.7, "historical_floods": 1},
    "Ward B": {"ward": "Ward B", "aqi": 112, "temperature": 34, "rainfall": 8, "humidity": 55,
               "traffic_index": 72, "bus_delay_minutes": 15, "avg_speed_kmh": 22,
               "water_usage_pct": 85, "energy_usage_mwh": 72, "reservoir_level_pct": 65,
               "complaints": 67, "sentiment": -0.1, "incidents": 12, "emergency_calls": 24,
               "crime_reports": 6, "resolution_rate": 0.5, "historical_floods": 2},
    "Ward C": {"ward": "Ward C", "aqi": 55, "temperature": 30, "rainfall": 25, "humidity": 80,
               "traffic_index": 30, "bus_delay_minutes": 3, "avg_speed_kmh": 40,
               "water_usage_pct": 60, "energy_usage_mwh": 55, "reservoir_level_pct": 82,
               "complaints": 8, "sentiment": 0.5, "incidents": 2, "emergency_calls": 5,
               "crime_reports": 1, "resolution_rate": 0.8, "historical_floods": 4},
    "Ward D": {"ward": "Ward D", "aqi": 168, "temperature": 36, "rainfall": 3, "humidity": 40,
               "traffic_index": 88, "bus_delay_minutes": 22, "avg_speed_kmh": 15,
               "water_usage_pct": 95, "energy_usage_mwh": 82, "reservoir_level_pct": 35,
               "complaints": 145, "sentiment": -0.4, "incidents": 18, "emergency_calls": 38,
               "crime_reports": 9, "resolution_rate": 0.25, "historical_floods": 0},
    "Ward E": {"ward": "Ward E", "aqi": 95, "temperature": 33, "rainfall": 15, "humidity": 60,
               "traffic_index": 55, "bus_delay_minutes": 10, "avg_speed_kmh": 28,
               "water_usage_pct": 70, "energy_usage_mwh": 60, "reservoir_level_pct": 70,
               "complaints": 34, "sentiment": 0.1, "incidents": 8, "emergency_calls": 15,
               "crime_reports": 4, "resolution_rate": 0.6, "historical_floods": 1},
}


@router.get("/overview")
async def get_dashboard_overview():
    """Get complete dashboard overview including city score and ward data."""
    ward_scores = {}
    for ward_name, data in CURRENT_DATA.items():
        env_score = calculate_environment_score(data["aqi"], data["rainfall"], data["temperature"])
        mob_score = calculate_mobility_score(data["traffic_index"], data["bus_delay_minutes"])
        water_score = calculate_water_score(data["water_usage_pct"], data["reservoir_level_pct"])
        safety_score = calculate_safety_score(data["incidents"], data["emergency_calls"], data["crime_reports"])
        sat_score = calculate_satisfaction_score(data["sentiment"], data["complaints"])

        score_result = calculate_community_score(env_score, mob_score, water_score, safety_score, sat_score)
        ward_scores[ward_name] = score_result

    # City average
    city_score = sum(s["composite_score"] for s in ward_scores.values()) // len(ward_scores)

    return {
        "city": "SmartVille",
        "city_score": city_score,
        "wards": ward_scores,
        "active_alerts": _count_alerts(),
        "last_updated": "2024-12-01T10:30:00Z",
    }


@router.get("/ward/{ward_name}")
async def get_ward_detail(ward_name: str):
    """Get detailed data for a specific ward."""
    ward_key = ward_name.replace("_", " ").title()
    if ward_key not in CURRENT_DATA:
        ward_key = f"Ward {ward_name.upper()}"

    data = CURRENT_DATA.get(ward_key)
    if not data:
        return {"error": f"Ward {ward_name} not found"}

    env_score = calculate_environment_score(data["aqi"], data["rainfall"], data["temperature"])
    mob_score = calculate_mobility_score(data["traffic_index"], data["bus_delay_minutes"])
    water_score = calculate_water_score(data["water_usage_pct"], data["reservoir_level_pct"])
    safety_score = calculate_safety_score(data["incidents"], data["emergency_calls"], data["crime_reports"])
    sat_score = calculate_satisfaction_score(data["sentiment"], data["complaints"])

    score_result = calculate_community_score(env_score, mob_score, water_score, safety_score, sat_score)
    explanation = get_score_explanation(data, score_result)

    return {
        "ward": ward_key,
        "current_data": data,
        "score": score_result,
        "explanation": explanation,
    }


@router.get("/metrics")
async def get_key_metrics():
    """Get key metrics for metric cards."""
    wards = list(CURRENT_DATA.values())
    return {
        "avg_aqi": sum(w["aqi"] for w in wards) // len(wards),
        "avg_traffic": sum(w["traffic_index"] for w in wards) // len(wards),
        "avg_water_usage": sum(w["water_usage_pct"] for w in wards) // len(wards),
        "total_complaints": sum(w["complaints"] for w in wards),
        "total_incidents": sum(w["incidents"] for w in wards),
        "wards_critical": sum(1 for w in wards if w["aqi"] > 150 or w["water_usage_pct"] > 90),
        "wards_warning": sum(1 for w in wards if w["aqi"] > 100 or w["traffic_index"] > 60),
    }


def _count_alerts() -> Dict[str, int]:
    """Count active alerts across all wards."""
    critical = 0
    warning = 0
    for data in CURRENT_DATA.values():
        if data["aqi"] > 150: critical += 1
        elif data["aqi"] > 100: warning += 1
        if data["water_usage_pct"] > 90: critical += 1
        elif data["water_usage_pct"] > 80: warning += 1
        if data["traffic_index"] > 75: critical += 1
        elif data["traffic_index"] > 55: warning += 1
    return {"critical": critical, "warning": warning, "info": 3}
