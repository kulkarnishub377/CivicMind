"""
Prediction Models for CivicMind
Simple models for flood risk, water shortage, traffic, and pollution prediction
"""

import random
from typing import Dict, Any, List


def predict_flood_risk(rainfall: float, humidity: float, wind_speed: float,
                       historical_floods: int = 0) -> Dict[str, Any]:
    """Predict flood risk based on weather parameters."""
    risk_score = 0

    # Rainfall contribution (heaviest weight)
    if rainfall > 50:
        risk_score += 50
    elif rainfall > 30:
        risk_score += 35
    elif rainfall > 15:
        risk_score += 20
    elif rainfall > 5:
        risk_score += 5

    # Humidity contribution
    if humidity > 85:
        risk_score += 15
    elif humidity > 70:
        risk_score += 8

    # Wind contribution (high wind + rain = more risk)
    if wind_speed > 10 and rainfall > 20:
        risk_score += 10

    # Historical data
    risk_score += min(15, historical_floods * 5)

    risk_score = min(100, risk_score)

    if risk_score >= 70:
        level = "High"
    elif risk_score >= 40:
        level = "Medium"
    else:
        level = "Low"

    return {
        "risk_level": level,
        "risk_score": risk_score,
        "confidence": random.randint(75, 92),
        "factors": {
            "rainfall_mm": round(rainfall, 1),
            "humidity_pct": round(humidity),
            "wind_speed_kmh": round(wind_speed, 1),
            "historical_incidents": historical_floods,
        },
    }


def predict_water_shortage(water_usage_pct: float, reservoir_level: float,
                           rainfall: float, pipeline_pressure: float) -> Dict[str, Any]:
    """Predict water shortage risk."""
    risk_score = 0

    # Usage contribution
    if water_usage_pct > 90:
        risk_score += 40
    elif water_usage_pct > 80:
        risk_score += 25
    elif water_usage_pct > 70:
        risk_score += 10

    # Reservoir level
    if reservoir_level < 30:
        risk_score += 30
    elif reservoir_level < 50:
        risk_score += 20
    elif reservoir_level < 70:
        risk_score += 5

    # Low rainfall
    if rainfall < 3:
        risk_score += 15
    elif rainfall < 8:
        risk_score += 8

    # Pipeline pressure
    if pipeline_pressure < 30:
        risk_score += 10

    risk_score = min(100, risk_score)

    if risk_score >= 70:
        level = "High"
    elif risk_score >= 40:
        level = "Medium"
    else:
        level = "Low"

    return {
        "risk_level": level,
        "risk_score": risk_score,
        "confidence": random.randint(72, 88),
        "days_to_shortage": max(1, int((100 - water_usage_pct) * 0.5)) if level != "Low" else None,
        "factors": {
            "current_usage_pct": round(water_usage_pct),
            "reservoir_level_pct": round(reservoir_level),
            "rainfall_mm": round(rainfall, 1),
            "pipeline_pressure": round(pipeline_pressure, 1),
        },
    }


def predict_traffic_congestion(traffic_index: float, bus_delay: float,
                                is_peak_hour: bool = False) -> Dict[str, Any]:
    """Predict traffic congestion level."""
    congestion_score = traffic_index

    if bus_delay > 15:
        congestion_score += 10
    elif bus_delay > 10:
        congestion_score += 5

    if is_peak_hour:
        congestion_score += 15

    congestion_score = min(100, congestion_score)

    if congestion_score >= 75:
        level = "High"
    elif congestion_score >= 45:
        level = "Medium"
    else:
        level = "Low"

    return {
        "risk_level": level,
        "congestion_score": round(congestion_score),
        "confidence": random.randint(70, 85),
        "peak_hour_forecast": "Severe" if level == "High" else "Moderate" if level == "Medium" else "Smooth",
        "factors": {
            "current_traffic_index": round(traffic_index),
            "bus_delay_minutes": round(bus_delay, 1),
        },
    }


def predict_waste_overflow(complaints: int, sentiment: float,
                           last_collection_days: int = 1) -> Dict[str, Any]:
    """Predict waste overflow risk based on complaint patterns."""
    risk_score = 0

    # Waste-related complaint rate
    if complaints > 100:
        risk_score += 40
    elif complaints > 50:
        risk_score += 25
    elif complaints > 20:
        risk_score += 10

    # Negative sentiment
    if sentiment < -0.3:
        risk_score += 20
    elif sentiment < 0:
        risk_score += 10

    # Days since last collection
    if last_collection_days >= 3:
        risk_score += 25
    elif last_collection_days >= 2:
        risk_score += 10

    risk_score = min(100, risk_score)

    if risk_score >= 70:
        level = "High"
    elif risk_score >= 40:
        level = "Medium"
    else:
        level = "Low"

    days_to_overflow = max(1, 7 - int(risk_score / 15)) if level != "Low" else None

    return {
        "risk_level": level,
        "risk_score": risk_score,
        "confidence": random.randint(75, 90),
        "days_to_overflow": days_to_overflow,
        "factors": {
            "waste_complaints": complaints,
            "sentiment_score": round(sentiment, 2),
            "days_since_collection": last_collection_days,
        },
    }


def predict_pollution_spike(aqi: float, temperature: float, wind_speed: float,
                            rainfall: float) -> Dict[str, Any]:
    """Predict pollution spike risk."""
    risk_score = 0

    # Current AQI
    if aqi > 150:
        risk_score += 40
    elif aqi > 100:
        risk_score += 25
    elif aqi > 80:
        risk_score += 10

    # High temperature increases ozone
    if temperature > 35:
        risk_score += 20
    elif temperature > 30:
        risk_score += 10

    # Low wind = pollutants stay
    if wind_speed < 5:
        risk_score += 15
    elif wind_speed < 8:
        risk_score += 8

    # Low rainfall = no washout
    if rainfall < 3:
        risk_score += 15
    elif rainfall < 8:
        risk_score += 5

    risk_score = min(100, risk_score)

    if risk_score >= 70:
        level = "High"
    elif risk_score >= 40:
        level = "Medium"
    else:
        level = "Low"

    return {
        "risk_level": level,
        "risk_score": risk_score,
        "confidence": random.randint(78, 93),
        "predicted_aqi_24h": min(300, int(aqi * (1 + risk_score / 200))),
        "factors": {
            "current_aqi": round(aqi),
            "temperature_c": round(temperature, 1),
            "wind_speed_kmh": round(wind_speed, 1),
            "rainfall_mm": round(rainfall, 1),
        },
    }


def generate_all_predictions(ward_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate all predictions for a ward."""
    return {
        "ward": ward_data["ward"],
        "flood_risk": predict_flood_risk(
            ward_data.get("rainfall", 0),
            ward_data.get("humidity", 60),
            ward_data.get("wind_speed", 5),
            ward_data.get("historical_floods", 0),
        ),
        "water_shortage": predict_water_shortage(
            ward_data.get("water_usage_pct", 50),
            ward_data.get("reservoir_level_pct", 70),
            ward_data.get("rainfall", 10),
            ward_data.get("pipeline_pressure", 50),
        ),
        "traffic_congestion": predict_traffic_congestion(
            ward_data.get("traffic_index", 50),
            ward_data.get("bus_delay_minutes", 10),
        ),
        "waste_overflow": predict_waste_overflow(
            ward_data.get("complaints", 20),
            ward_data.get("sentiment", 0),
        ),
        "pollution_spike": predict_pollution_spike(
            ward_data.get("aqi", 80),
            ward_data.get("temperature", 30),
            ward_data.get("wind_speed", 5),
            ward_data.get("rainfall", 10),
        ),
    }
