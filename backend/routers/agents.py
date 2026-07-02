"""
AI Agents API Router
Exposes the multi-agent system
"""

from fastapi import APIRouter
from agents.recommendation_agent import RecommendationAgent

router = APIRouter()

# Initialize the master recommendation agent (which includes all sub-agents)
recommendation_agent = RecommendationAgent()

# Ward data for agent analysis
WARD_DATA = {
    "Ward A": {"ward": "Ward A", "aqi": 85, "temperature": 32, "rainfall": 12, "humidity": 65,
               "wind_speed": 8, "traffic_index": 45, "bus_delay_minutes": 8, "avg_speed_kmh": 35,
               "water_usage_pct": 78, "energy_usage_mwh": 65, "reservoir_level_pct": 72,
               "complaints": 23, "sentiment": 0.2, "incidents": 5, "emergency_calls": 12,
               "crime_reports": 3, "resolution_rate": 0.7, "historical_floods": 1,
               "complaint_categories": {"Waste Management": 8, "Water Supply": 5, "Road Conditions": 4, "Street Lighting": 6}},
    "Ward B": {"ward": "Ward B", "aqi": 112, "temperature": 34, "rainfall": 8, "humidity": 55,
               "wind_speed": 6, "traffic_index": 72, "bus_delay_minutes": 15, "avg_speed_kmh": 22,
               "water_usage_pct": 85, "energy_usage_mwh": 72, "reservoir_level_pct": 65,
               "complaints": 67, "sentiment": -0.1, "incidents": 12, "emergency_calls": 24,
               "crime_reports": 6, "resolution_rate": 0.5, "historical_floods": 2,
               "complaint_categories": {"Waste Management": 20, "Water Supply": 12, "Air Pollution": 15, "Public Transport": 10, "Noise Pollution": 10}},
    "Ward C": {"ward": "Ward C", "aqi": 55, "temperature": 30, "rainfall": 25, "humidity": 80,
               "wind_speed": 12, "traffic_index": 30, "bus_delay_minutes": 3, "avg_speed_kmh": 40,
               "water_usage_pct": 60, "energy_usage_mwh": 55, "reservoir_level_pct": 82,
               "complaints": 8, "sentiment": 0.5, "incidents": 2, "emergency_calls": 5,
               "crime_reports": 1, "resolution_rate": 0.8, "historical_floods": 4,
               "complaint_categories": {"Drainage": 3, "Street Lighting": 2, "Road Conditions": 2, "Water Supply": 1}},
    "Ward D": {"ward": "Ward D", "aqi": 168, "temperature": 36, "rainfall": 3, "humidity": 40,
               "wind_speed": 3, "traffic_index": 88, "bus_delay_minutes": 22, "avg_speed_kmh": 15,
               "water_usage_pct": 95, "energy_usage_mwh": 82, "reservoir_level_pct": 35,
               "complaints": 145, "sentiment": -0.4, "incidents": 18, "emergency_calls": 38,
               "crime_reports": 9, "resolution_rate": 0.25, "historical_floods": 0,
               "complaint_categories": {"Waste Management": 45, "Air Pollution": 35, "Water Supply": 30, "Road Conditions": 20, "Noise Pollution": 15}},
    "Ward E": {"ward": "Ward E", "aqi": 95, "temperature": 33, "rainfall": 15, "humidity": 60,
               "wind_speed": 7, "traffic_index": 55, "bus_delay_minutes": 10, "avg_speed_kmh": 28,
               "water_usage_pct": 70, "energy_usage_mwh": 60, "reservoir_level_pct": 70,
               "complaints": 34, "sentiment": 0.1, "incidents": 8, "emergency_calls": 15,
               "crime_reports": 4, "resolution_rate": 0.6, "historical_floods": 1,
               "complaint_categories": {"Waste Management": 10, "Water Supply": 8, "Road Conditions": 6, "Public Transport": 5, "Street Lighting": 5}},
}


@router.get("/status")
async def get_agent_status():
    """Get status of all AI agents."""
    return {
        "agents": [
            {"name": "Environment Agent", "status": "active", "metrics": ["aqi", "weather", "flood_risk"], "last_run": "2024-12-01T10:29:00Z"},
            {"name": "Mobility Agent", "status": "active", "metrics": ["traffic", "transit", "congestion"], "last_run": "2024-12-01T10:29:00Z"},
            {"name": "Citizen Agent", "status": "active", "metrics": ["complaints", "sentiment", "satisfaction"], "last_run": "2024-12-01T10:29:00Z"},
            {"name": "Recommendation Agent", "status": "active", "metrics": ["action_plan", "priority", "impact"], "last_run": "2024-12-01T10:30:00Z"},
        ],
        "total_active": 4,
        "system_health": "optimal",
    }


@router.get("/analyze/{ward_name}")
async def analyze_ward(ward_name: str):
    """
    Run full multi-agent analysis on a ward.
    This is the core agentic workflow - all agents analyze and the recommendation agent combines their outputs.
    """
    ward_key = ward_name.replace("_", " ").title()
    if ward_key not in WARD_DATA:
        ward_key = f"Ward {ward_name.upper()}"

    data = WARD_DATA.get(ward_key)
    if not data:
        return {"error": f"Ward {ward_name} not found"}

    # Run the full agent pipeline
    result = recommendation_agent.analyze(data)
    return result


@router.get("/environment/{ward_name}")
async def analyze_environment(ward_name: str):
    """Run only the Environment Agent analysis."""
    from agents.environment_agent import EnvironmentAgent
    agent = EnvironmentAgent()

    ward_key = ward_name.replace("_", " ").title()
    if ward_key not in WARD_DATA:
        ward_key = f"Ward {ward_name.upper()}"

    data = WARD_DATA.get(ward_key)
    if not data:
        return {"error": f"Ward {ward_name} not found"}

    return agent.analyze(data)


@router.get("/mobility/{ward_name}")
async def analyze_mobility(ward_name: str):
    """Run only the Mobility Agent analysis."""
    from agents.mobility_agent import MobilityAgent
    agent = MobilityAgent()

    ward_key = ward_name.replace("_", " ").title()
    if ward_key not in WARD_DATA:
        ward_key = f"Ward {ward_name.upper()}"

    data = WARD_DATA.get(ward_key)
    if not data:
        return {"error": f"Ward {ward_name} not found"}

    return agent.analyze(data)


@router.get("/citizen/{ward_name}")
async def analyze_citizen(ward_name: str):
    """Run only the Citizen Agent analysis."""
    from agents.citizen_agent import CitizenAgent
    agent = CitizenAgent()

    ward_key = ward_name.replace("_", " ").title()
    if ward_key not in WARD_DATA:
        ward_key = f"Ward {ward_name.upper()}"

    data = WARD_DATA.get(ward_key)
    if not data:
        return {"error": f"Ward {ward_name} not found"}

    return agent.analyze(data)


@router.get("/all-analysis")
async def analyze_all_wards():
    """Run full agent analysis on all wards."""
    results = {}
    for ward_name, data in WARD_DATA.items():
        results[ward_name] = recommendation_agent.analyze(data)
    return {"city": "SmartVille", "analysis": results}
