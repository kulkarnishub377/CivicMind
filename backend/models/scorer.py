"""
Community Health Score Calculator
Calculates composite score from multiple dimensions
"""

from typing import Dict, Any


def calculate_environment_score(aqi: float, rainfall: float, temperature: float) -> float:
    """Calculate environment score (0-100). Lower AQI = better."""
    aqi_score = max(0, 100 - aqi * 0.5)
    # Ideal rainfall: 10-20mm/day
    rain_score = 100 - abs(rainfall - 15) * 2
    # Ideal temperature: 25-30°C
    temp_score = 100 - abs(temperature - 27.5) * 3

    return max(0, min(100, aqi_score * 0.6 + rain_score * 0.2 + temp_score * 0.2))


def calculate_mobility_score(traffic_index: float, bus_delay: float) -> float:
    """Calculate mobility score (0-100). Lower traffic = better."""
    traffic_score = max(0, 100 - traffic_index)
    delay_score = max(0, 100 - bus_delay * 3)

    return max(0, min(100, traffic_score * 0.7 + delay_score * 0.3))


def calculate_water_score(water_usage_pct: float, reservoir_level: float) -> float:
    """Calculate water/infrastructure score (0-100)."""
    usage_score = max(0, 100 - water_usage_pct)
    reservoir_score = reservoir_level

    return max(0, min(100, usage_score * 0.6 + reservoir_score * 0.4))


def calculate_safety_score(incidents: int, emergency_calls: int, crime_reports: int) -> float:
    """Calculate safety score (0-100)."""
    incident_score = max(0, 100 - incidents * 3)
    emergency_score = max(0, 100 - emergency_calls * 0.5)
    crime_score = max(0, 100 - crime_reports * 4)

    return max(0, min(100, incident_score * 0.4 + emergency_score * 0.3 + crime_score * 0.3))


def calculate_satisfaction_score(sentiment: float, complaint_rate: float) -> float:
    """Calculate citizen satisfaction score (0-100)."""
    # sentiment is -1 to 1, convert to 0-100
    sentiment_score = (sentiment + 1) * 50
    complaint_score = max(0, 100 - complaint_rate * 0.5)

    return max(0, min(100, sentiment_score * 0.6 + complaint_score * 0.4))


def calculate_community_score(
    environment: float,
    mobility: float,
    water: float,
    safety: float,
    satisfaction: float,
    weights: Dict[str, float] = None,
) -> Dict[str, Any]:
    """
    Calculate overall community health score.

    Returns both the composite score and individual category scores.
    """
    if weights is None:
        weights = {
            "environment": 0.20,
            "mobility": 0.20,
            "water": 0.20,
            "safety": 0.20,
            "satisfaction": 0.20,
        }

    categories = {
        "environment": environment,
        "mobility": mobility,
        "water": water,
        "safety": safety,
        "satisfaction": satisfaction,
    }

    composite = sum(
        categories[k] * weights[k] for k in weights
    )

    # Determine overall status
    if composite >= 80:
        status = "Good"
        color = "green"
    elif composite >= 60:
        status = "Moderate"
        color = "yellow"
    elif composite >= 40:
        status = "Concerning"
        color = "orange"
    else:
        status = "Critical"
        color = "red"

    # Find weakest dimension
    weakest = min(categories, key=categories.get)

    return {
        "composite_score": round(composite),
        "status": status,
        "color": color,
        "categories": {k: round(v) for k, v in categories.items()},
        "weakest_dimension": weakest,
        "strongest_dimension": max(categories, key=categories.get),
        "improvement_potential": round(100 - composite),
    }


def get_score_explanation(ward_data: Dict[str, Any], score_data: Dict[str, Any]) -> str:
    """Generate AI-style explanation of the community score."""
    weakest = score_data["weakest_dimension"]
    explanations = {
        "environment": f"Environment score is low due to AQI of {ward_data.get('aqi', 'N/A')} (safe limit: 100). Air quality is the primary concern requiring immediate attention.",
        "mobility": f"Mobility score is affected by traffic congestion index of {ward_data.get('traffic_index', 'N/A')} and average bus delays of {ward_data.get('bus_delay', 'N/A')} minutes.",
        "water": f"Water infrastructure score is concerning with usage at {ward_data.get('water_usage', 'N/A')}% capacity. Conservation measures are recommended.",
        "safety": f"Safety score needs improvement with {ward_data.get('incidents', 'N/A')} incidents and {ward_data.get('emergency_calls', 'N/A')} emergency calls reported.",
        "satisfaction": f"Citizen satisfaction is the weakest dimension, likely driven by {ward_data.get('complaints', 'N/A')} active complaints and negative sentiment trends.",
    }

    return explanations.get(weakest, "Score calculated from 5 equally weighted dimensions.")
