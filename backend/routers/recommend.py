"""
Recommendation API Router
AI-powered recommendation engine
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class Recommendation(BaseModel):
    id: str
    ward: str
    problem: str
    severity: str
    recommendations: List[str]
    expected_impact: str
    confidence: int


# Pre-built recommendations for demo
RECOMMENDATIONS = [
    {
        "id": "rec-1",
        "ward": "Ward D",
        "problem": "Severe air quality deterioration (AQI: 168) with 45% increase in complaints",
        "severity": "Critical",
        "recommendations": [
            "Deploy mobile air quality monitoring stations at 3 key intersections",
            "Issue health advisory for vulnerable populations (elderly, children, respiratory patients)",
            "Inspect and enforce emission standards on industrial units in Zone D2",
            "Activate smog towers in affected zones",
        ],
        "expected_impact": "Expected AQI reduction of 25-35% within 2 weeks",
        "confidence": 87,
    },
    {
        "id": "rec-2",
        "ward": "Ward D",
        "problem": "Critical water shortage risk with 95% usage capacity and reservoir at 35%",
        "severity": "Critical",
        "recommendations": [
            "Implement Stage 2 water conservation measures immediately",
            "Deploy 5 emergency water tankers to affected residential areas",
            "Inspect water pipelines for leaks (estimated 15% loss)",
            "Schedule alternate-day supply for non-essential usage",
        ],
        "expected_impact": "Water usage reduction of 20% within 1 week",
        "confidence": 82,
    },
    {
        "id": "rec-3",
        "ward": "Ward D",
        "problem": "High waste overflow predicted within 5 days based on complaint patterns",
        "severity": "High",
        "recommendations": [
            "Increase waste collection frequency by 2 pickups/week",
            "Deploy 3 additional smart bins at overflow-prone locations",
            "Launch community awareness campaign on waste segregation",
            "Activate overflow response team for monitoring",
        ],
        "expected_impact": "Complaint reduction of 35% within 10 days",
        "confidence": 79,
    },
    {
        "id": "rec-4",
        "ward": "Ward B",
        "problem": "Traffic congestion index at 72 with 15-min average bus delays",
        "severity": "High",
        "recommendations": [
            "Add 3 peak-hour buses on Route B7 and B12",
            "Implement dynamic traffic signal optimization at 5 junctions",
            "Create temporary park-and-ride facility near Metro Station",
            "Deploy traffic marshals during peak hours (7-9 AM, 5-7 PM)",
        ],
        "expected_impact": "Congestion reduction of 20% within 2 weeks",
        "confidence": 75,
    },
    {
        "id": "rec-5",
        "ward": "Ward C",
        "problem": "High flood risk due to heavy rainfall forecast (80-120mm expected)",
        "severity": "High",
        "recommendations": [
            "Pre-position sandbags and pumps in low-lying areas",
            "Clear drainage channels and stormwater systems",
            "Issue early warning to 12,000 residents in flood-prone zones",
            "Activate emergency response teams and prepare shelters",
        ],
        "expected_impact": "Reduce flood damage risk by 40%",
        "confidence": 84,
    },
    {
        "id": "rec-6",
        "ward": "Ward E",
        "problem": "Moderate resource inefficiency across utilities with improvement potential",
        "severity": "Medium",
        "recommendations": [
            "Install smart meters in top 50 energy-consuming buildings",
            "Optimize water pressure in Zone E3 (estimated 12% savings)",
            "Implement LED streetlight conversion in 3 sectors",
            "Launch community solar program for residential areas",
        ],
        "expected_impact": "Resource efficiency improvement of 15% within 1 month",
        "confidence": 71,
    },
]


@router.get("/all")
async def get_all_recommendations():
    """Get all recommendations sorted by severity."""
    severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    sorted_recs = sorted(RECOMMENDATIONS, key=lambda x: severity_order.get(x["severity"], 4))
    return {"recommendations": sorted_recs, "total": len(sorted_recs)}


@router.get("/ward/{ward_name}")
async def get_ward_recommendations(ward_name: str):
    """Get recommendations for a specific ward."""
    ward_key = ward_name.replace("_", " ").title()
    if not ward_key.startswith("Ward"):
        ward_key = f"Ward {ward_name.upper()}"

    ward_recs = [r for r in RECOMMENDATIONS if r["ward"] == ward_key]
    return {"ward": ward_key, "recommendations": ward_recs, "count": len(ward_recs)}


@router.get("/critical")
async def get_critical_recommendations():
    """Get only critical and high severity recommendations."""
    critical = [r for r in RECOMMENDATIONS if r["severity"] in ["Critical", "High"]]
    return {"recommendations": critical, "count": len(critical)}


@router.post("/generate")
async def generate_recommendations(ward: str, focus: Optional[str] = None):
    """
    Generate AI recommendations for a ward.
    In production, this would use Gemini to analyze current data and generate context-aware recommendations.
    """
    # Simulated AI-generated recommendation
    return {
        "ward": ward,
        "generated_by": "Gemini 2.5 + Agent Layer",
        "recommendations": [
            {
                "focus": focus or "overall",
                "actions": [
                    f"Conduct comprehensive assessment of {ward} infrastructure",
                    f"Prioritize citizen complaint resolution in {ward}",
                    f"Implement data-driven resource allocation for {ward}",
                ],
                "expected_impact": "Community score improvement of 5-10 points",
                "confidence": 78,
            }
        ],
    }
