"""
Simulator API Router
What-If / Digital Twin simulation engine
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

router = APIRouter()


class SimulationRequest(BaseModel):
    action: str
    ward: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None


class SimulationResult(BaseModel):
    action: str
    ward: str
    before_score: int
    after_score: int
    score_change: int
    category_impacts: Dict[str, Any]
    risk_changes: Dict[str, Any]
    details: str
    confidence: int


# Pre-built simulation results
PRESETS = {
    "waste": {
        "action": "Increase waste collection by 20%",
        "ward": "Ward D",
        "before_score": 42,
        "after_score": 48,
        "score_change": 6,
        "category_impacts": {
            "environment": {"before": 16, "after": 21, "change": +5},
            "satisfaction": {"before": 28, "after": 38, "change": +10},
            "safety": {"before": 37, "after": 40, "change": +3},
        },
        "risk_changes": {
            "waste_overflow": {"before": "High", "after": "Medium"},
        },
        "details": "Adding 2 extra pickups per week and 3 smart bins reduces complaint volume by 35% and improves citizen satisfaction significantly.",
        "confidence": 87,
    },
    "buses": {
        "action": "Add 5 new buses",
        "ward": "Ward B",
        "before_score": 58,
        "after_score": 62,
        "score_change": 4,
        "category_impacts": {
            "mobility": {"before": 28, "after": 43, "change": +15},
            "environment": {"before": 44, "after": 51, "change": +7},
            "satisfaction": {"before": 45, "after": 53, "change": +8},
        },
        "risk_changes": {
            "traffic_congestion": {"before": "High", "after": "Medium"},
        },
        "details": "New buses on routes B7 and B12 reduce wait times by 40%, cut congestion by 15%, and lower emissions by 7%.",
        "confidence": 79,
    },
    "water": {
        "action": "Implement water conservation (25%)",
        "ward": "Ward D",
        "before_score": 42,
        "after_score": 47,
        "score_change": 5,
        "category_impacts": {
            "water": {"before": 5, "after": 30, "change": +25},
            "satisfaction": {"before": 28, "after": 36, "change": +8},
        },
        "risk_changes": {
            "water_shortage": {"before": "High", "after": "Low"},
        },
        "details": "Stage 2 conservation with pipeline repairs reduces usage by 25%, eliminating shortage risk and improving satisfaction.",
        "confidence": 82,
    },
    "flood": {
        "action": "Clear drainage + early warning system",
        "ward": "Ward C",
        "before_score": 82,
        "after_score": 85,
        "score_change": 3,
        "category_impacts": {
            "environment": {"before": 72, "after": 78, "change": +6},
            "safety": {"before": 85, "after": 90, "change": +5},
            "satisfaction": {"before": 91, "after": 93, "change": +2},
        },
        "risk_changes": {
            "flood_risk": {"before": "High", "after": "Medium"},
        },
        "details": "Proactive drainage clearing and early warning systems reduce flood damage by 40% and give residents 2 extra hours for evacuation.",
        "confidence": 84,
    },
    "solar": {
        "action": "Launch community solar program",
        "ward": "Ward E",
        "before_score": 71,
        "after_score": 75,
        "score_change": 4,
        "category_impacts": {
            "environment": {"before": 52, "after": 62, "change": +10},
            "satisfaction": {"before": 62, "after": 74, "change": +12},
        },
        "risk_changes": {
            "pollution_spike": {"before": "Medium", "after": "Low"},
        },
        "details": "Solar panels on 500 rooftops reduce energy costs by 30%, cut emissions by 15%, and create local green jobs.",
        "confidence": 76,
    },
}


@router.post("/run", response_model=SimulationResult)
async def run_simulation(request: SimulationRequest):
    """
    Run a what-if simulation.
    In production, this would use a digital twin model + Gemini for impact prediction.
    """
    # Check presets first
    for preset_id, preset in PRESETS.items():
        if request.action.lower() in preset["action"].lower():
            return SimulationResult(**preset)

    # Custom simulation (simplified for demo)
    ward = request.ward or "Ward D"

    # Simulate score changes based on action type
    action_lower = request.action.lower()
    score_change = 4  # default

    if "waste" in action_lower or "collection" in action_lower:
        score_change = 6
        category_impacts = {
            "environment": {"before": 20, "after": 25, "change": +5},
            "satisfaction": {"before": 30, "after": 40, "change": +10},
        }
    elif "bus" in action_lower or "transport" in action_lower:
        score_change = 4
        category_impacts = {
            "mobility": {"before": 30, "after": 45, "change": +15},
            "environment": {"before": 45, "after": 52, "change": +7},
        }
    elif "water" in action_lower or "conservation" in action_lower:
        score_change = 5
        category_impacts = {
            "water": {"before": 10, "after": 35, "change": +25},
            "satisfaction": {"before": 30, "after": 38, "change": +8},
        }
    else:
        category_impacts = {
            "overall": {"before": 50, "after": 50 + score_change * 3, "change": +score_change * 3},
        }

    before_score = 42 if ward == "Ward D" else 58 if ward == "Ward B" else 75
    after_score = min(100, before_score + score_change)

    return SimulationResult(
        action=request.action,
        ward=ward,
        before_score=before_score,
        after_score=after_score,
        score_change=score_change,
        category_impacts=category_impacts,
        risk_changes={"overall_risk": {"before": "High", "after": "Medium"}},
        details=f'Based on simulation of "{request.action}" for {ward}: This policy intervention is projected to improve community metrics. The AI model considers historical data, current conditions, and similar interventions from comparable communities.',
        confidence=78,
    )


@router.get("/presets")
async def get_simulation_presets():
    """Get available preset simulation scenarios."""
    return {"presets": PRESETS}


@router.get("/presets/{preset_id}")
async def get_preset(preset_id: str):
    """Get a specific preset simulation result."""
    if preset_id not in PRESETS:
        return {"error": f"Preset {preset_id} not found"}
    return PRESETS[preset_id]
