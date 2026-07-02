"""
Prediction API Router
AI-powered risk forecasting and predictive analytics
"""

from fastapi import APIRouter
from typing import Dict, Any, List
from models.predictor import generate_all_predictions

router = APIRouter()

# Current ward data for predictions
WARD_DATA = {
    "Ward A": {"ward": "Ward A", "aqi": 85, "temperature": 32, "rainfall": 12, "humidity": 65,
               "wind_speed": 8, "traffic_index": 45, "bus_delay_minutes": 8,
               "water_usage_pct": 78, "reservoir_level_pct": 72, "pipeline_pressure": 55,
               "complaints": 23, "sentiment": 0.2, "historical_floods": 1},
    "Ward B": {"ward": "Ward B", "aqi": 112, "temperature": 34, "rainfall": 8, "humidity": 55,
               "wind_speed": 6, "traffic_index": 72, "bus_delay_minutes": 15,
               "water_usage_pct": 85, "reservoir_level_pct": 65, "pipeline_pressure": 45,
               "complaints": 67, "sentiment": -0.1, "historical_floods": 2},
    "Ward C": {"ward": "Ward C", "aqi": 55, "temperature": 30, "rainfall": 25, "humidity": 80,
               "wind_speed": 12, "traffic_index": 30, "bus_delay_minutes": 3,
               "water_usage_pct": 60, "reservoir_level_pct": 82, "pipeline_pressure": 65,
               "complaints": 8, "sentiment": 0.5, "historical_floods": 4},
    "Ward D": {"ward": "Ward D", "aqi": 168, "temperature": 36, "rainfall": 3, "humidity": 40,
               "wind_speed": 3, "traffic_index": 88, "bus_delay_minutes": 22,
               "water_usage_pct": 95, "reservoir_level_pct": 35, "pipeline_pressure": 25,
               "complaints": 145, "sentiment": -0.4, "historical_floods": 0},
    "Ward E": {"ward": "Ward E", "aqi": 95, "temperature": 33, "rainfall": 15, "humidity": 60,
               "wind_speed": 7, "traffic_index": 55, "bus_delay_minutes": 10,
               "water_usage_pct": 70, "reservoir_level_pct": 70, "pipeline_pressure": 50,
               "complaints": 34, "sentiment": 0.1, "historical_floods": 1},
}


@router.get("/all")
async def get_all_predictions():
    """Get predictions for all wards."""
    results = []
    for ward_name, data in WARD_DATA.items():
        results.append(generate_all_predictions(data))
    return {"predictions": results, "model_version": "v1.0", "generated_at": "2024-12-01T10:30:00Z"}


@router.get("/ward/{ward_name}")
async def get_ward_predictions(ward_name: str):
    """Get predictions for a specific ward."""
    ward_key = ward_name.replace("_", " ").title()
    if ward_key not in WARD_DATA:
        ward_key = f"Ward {ward_name.upper()}"

    data = WARD_DATA.get(ward_key)
    if not data:
        return {"error": f"Ward {ward_name} not found"}

    return generate_all_predictions(data)


@router.get("/flood-risk")
async def get_flood_risk():
    """Get flood risk predictions for all wards."""
    from models.predictor import predict_flood_risk
    results = []
    for ward_name, data in WARD_DATA.items():
        prediction = predict_flood_risk(
            data["rainfall"], data["humidity"], data["wind_speed"], data["historical_floods"]
        )
        results.append({"ward": ward_name, **prediction})
    return {"flood_risk": results}


@router.get("/water-shortage")
async def get_water_shortage():
    """Get water shortage risk for all wards."""
    from models.predictor import predict_water_shortage
    results = []
    for ward_name, data in WARD_DATA.items():
        prediction = predict_water_shortage(
            data["water_usage_pct"], data["reservoir_level_pct"], data["rainfall"], data["pipeline_pressure"]
        )
        results.append({"ward": ward_name, **prediction})
    return {"water_shortage_risk": results}


@router.get("/traffic")
async def get_traffic_prediction():
    """Get traffic congestion predictions for all wards."""
    from models.predictor import predict_traffic_congestion
    results = []
    for ward_name, data in WARD_DATA.items():
        prediction = predict_traffic_congestion(data["traffic_index"], data["bus_delay_minutes"])
        results.append({"ward": ward_name, **prediction})
    return {"traffic_predictions": results}


@router.get("/pollution")
async def get_pollution_prediction():
    """Get pollution spike predictions for all wards."""
    from models.predictor import predict_pollution_spike
    results = []
    for ward_name, data in WARD_DATA.items():
        prediction = predict_pollution_spike(
            data["aqi"], data["temperature"], data["wind_speed"], data["rainfall"]
        )
        results.append({"ward": ward_name, **prediction})
    return {"pollution_predictions": results}
