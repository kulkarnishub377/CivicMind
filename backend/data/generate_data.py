"""
Mock Data Generator for CivicMind
Generates SmartVille city data with 5 wards, 365 days
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

WARD_NAMES = ["Ward A", "Ward B", "Ward C", "Ward D", "Ward E"]

# Base configurations per ward
WARD_CONFIGS = {
    "Ward A": {
        "aqi_base": 80, "temp_base": 31, "rain_base": 10,
        "traffic_base": 42, "water_base": 75, "energy_base": 65,
        "comp_base": 20, "incidents_base": 5, "emergency_base": 12, "sentiment_base": 78,
    },
    "Ward B": {
        "aqi_base": 105, "temp_base": 33, "rain_base": 6,
        "traffic_base": 68, "water_base": 82, "energy_base": 72,
        "comp_base": 60, "incidents_base": 12, "emergency_base": 24, "sentiment_base": 58,
    },
    "Ward C": {
        "aqi_base": 52, "temp_base": 29, "rain_base": 22,
        "traffic_base": 28, "water_base": 58, "energy_base": 55,
        "comp_base": 8, "incidents_base": 2, "emergency_base": 5, "sentiment_base": 91,
    },
    "Ward D": {
        "aqi_base": 155, "temp_base": 35, "rain_base": 2,
        "traffic_base": 85, "water_base": 92, "energy_base": 82,
        "comp_base": 130, "incidents_base": 18, "emergency_base": 38, "sentiment_base": 42,
    },
    "Ward E": {
        "aqi_base": 90, "temp_base": 32, "rain_base": 13,
        "traffic_base": 52, "water_base": 68, "energy_base": 60,
        "comp_base": 30, "incidents_base": 8, "emergency_base": 15, "sentiment_base": 71,
    },
}

# Events that create interesting patterns
EVENTS = [
    {"name": "flood_week", "days": range(180, 200), "affects": ["Ward C", "Ward B"],
     "modifiers": {"rainfall": +30, "traffic_index": +20, "complaints": +15, "sentiment": -10}},
    {"name": "pollution_spike", "days": range(100, 120), "affects": ["Ward D"],
     "modifiers": {"aqi": +40, "complaints": +20, "sentiment": -15}},
    {"name": "water_crisis", "days": range(250, 270), "affects": ["Ward D", "Ward E"],
     "modifiers": {"water_usage": +15, "complaints": +10, "sentiment": -8}},
    {"name": "traffic_surge", "days": range(300, 315), "affects": ["Ward B", "Ward D"],
     "modifiers": {"traffic_index": +25, "bus_delay": +10, "complaints": +8}},
]

COMPLAINT_CATEGORIES = [
    "Waste Management", "Water Supply", "Air Pollution", "Road Conditions",
    "Noise Pollution", "Public Transport", "Drainage", "Street Lighting",
]

COMPLAINT_TEMPLATES = {
    "Waste Management": [
        "Overflowing bins in residential area",
        "Garbage not collected for 3 days",
        "Illegal dumping near park",
        "Foul smell from waste collection point",
    ],
    "Water Supply": [
        "No water supply since morning",
        "Low water pressure in apartment",
        "Contaminated water supply reported",
        "Water pipeline leakage on main road",
    ],
    "Air Pollution": [
        "Severe smog in industrial area",
        "Construction dust causing health issues",
        "Factory emissions at night",
        "Burning waste causing air pollution",
    ],
    "Road Conditions": [
        "Large pothole on main road",
        "Road flooding after rain",
        "Broken street surface causing accidents",
        "No proper drainage on highway",
    ],
}


def generate_environment_data(days: int = 365) -> List[Dict[str, Any]]:
    """Generate environment data for all wards."""
    data = []
    start_date = datetime(2024, 1, 1)

    for day in range(days):
        date = start_date + timedelta(days=day)
        date_str = date.strftime("%Y-%m-%d")

        for ward, config in WARD_CONFIGS.items():
            record = {
                "date": date_str,
                "ward": ward,
                "aqi": max(10, config["aqi_base"] + random.randint(-20, 20)),
                "temperature": config["temp_base"] + random.uniform(-3, 3),
                "rainfall": max(0, config["rain_base"] + random.uniform(-8, 12)),
                "humidity": random.randint(40, 90),
                "wind_speed": random.uniform(2, 15),
            }

            # Apply event modifiers
            for event in EVENTS:
                if day in event["days"] and ward in event["affects"]:
                    for key, mod in event["modifiers"].items():
                        if key in record and isinstance(record[key], (int, float)):
                            record[key] += mod

            data.append(record)

    return data


def generate_mobility_data(days: int = 365) -> List[Dict[str, Any]]:
    """Generate mobility/traffic data."""
    data = []
    start_date = datetime(2024, 1, 1)

    for day in range(days):
        date = start_date + timedelta(days=day)
        date_str = date.strftime("%Y-%m-%d")

        for ward, config in WARD_CONFIGS.items():
            record = {
                "date": date_str,
                "ward": ward,
                "traffic_index": max(5, min(100, config["traffic_base"] + random.randint(-15, 15))),
                "bus_delay_minutes": max(0, config.get("bus_delay", 10) + random.uniform(-5, 5)),
                "avg_speed_kmh": max(5, 50 - config["traffic_base"] * 0.3 + random.uniform(-5, 5)),
                "accidents": random.randint(0, 3),
                "public_transport_usage": random.randint(1000, 5000),
            }

            for event in EVENTS:
                if day in event["days"] and ward in event["affects"]:
                    for key, mod in event["modifiers"].items():
                        if key in record and isinstance(record[key], (int, float)):
                            record[key] += mod

            data.append(record)

    return data


def generate_utility_data(days: int = 365) -> List[Dict[str, Any]]:
    """Generate water and energy usage data."""
    data = []
    start_date = datetime(2024, 1, 1)

    for day in range(days):
        date = start_date + timedelta(days=day)
        date_str = date.strftime("%Y-%m-%d")

        for ward, config in WARD_CONFIGS.items():
            record = {
                "date": date_str,
                "ward": ward,
                "water_usage_pct": max(20, min(100, config["water_base"] + random.uniform(-10, 10))),
                "energy_usage_mwh": max(10, config["energy_base"] + random.uniform(-8, 8)),
                "reservoir_level_pct": random.randint(40, 90),
                "pipeline_pressure": random.uniform(20, 80),
            }

            for event in EVENTS:
                if day in event["days"] and ward in event["affects"]:
                    for key, mod in event["modifiers"].items():
                        if key in record and isinstance(record[key], (int, float)):
                            record[key] += mod

            data.append(record)

    return data


def generate_citizen_feedback(days: int = 365) -> List[Dict[str, Any]]:
    """Generate citizen complaint data."""
    data = []
    start_date = datetime(2024, 1, 1)
    complaint_id = 1

    for day in range(days):
        date = start_date + timedelta(days=day)
        date_str = date.strftime("%Y-%m-%d")

        for ward, config in WARD_CONFIGS.items():
            # Vary complaint count by ward
            num_complaints = max(0, int(config["comp_base"] / 30 + random.randint(-2, 3)))

            for _ in range(num_complaints):
                category = random.choice(COMPLAINT_CATEGORIES)
                templates = COMPLAINT_TEMPLATES.get(category, ["General complaint from resident"])
                text = random.choice(templates)

                # Simple sentiment based on category
                sentiment_map = {
                    "Waste Management": -0.3, "Water Supply": -0.5, "Air Pollution": -0.6,
                    "Road Conditions": -0.2, "Noise Pollution": -0.3,
                    "Public Transport": -0.2, "Drainage": -0.4, "Street Lighting": -0.1,
                }
                sentiment = sentiment_map.get(category, -0.2) + random.uniform(-0.3, 0.3)
                sentiment = max(-1, min(1, sentiment))

                data.append({
                    "id": complaint_id,
                    "date": date_str,
                    "ward": ward,
                    "complaint_text": text,
                    "category": category,
                    "sentiment": round(sentiment, 2),
                    "status": random.choice(["open", "in_progress", "resolved"]),
                })
                complaint_id += 1

    return data


def generate_safety_data(days: int = 365) -> List[Dict[str, Any]]:
    """Generate safety and incident data."""
    data = []
    start_date = datetime(2024, 1, 1)

    for day in range(days):
        date = start_date + timedelta(days=day)
        date_str = date.strftime("%Y-%m-%d")

        for ward, config in WARD_CONFIGS.items():
            record = {
                "date": date_str,
                "ward": ward,
                "incidents": max(0, config["incidents_base"] + random.randint(-3, 3)),
                "emergency_calls": max(0, config["emergency_base"] + random.randint(-5, 5)),
                "fire_incidents": random.randint(0, 2),
                "crime_reports": random.randint(0, 5),
            }
            data.append(record)

    return data


def generate_all_data(days: int = 365):
    """Generate all datasets and save to JSON files."""
    print(f"Generating {days} days of data for {len(WARD_NAMES)} wards...")

    datasets = {
        "environment": generate_environment_data(days),
        "mobility": generate_mobility_data(days),
        "utilities": generate_utility_data(days),
        "citizen_feedback": generate_citizen_feedback(days),
        "safety": generate_safety_data(days),
    }

    for name, data in datasets.items():
        filepath = f"data/{name}.json"
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
        print(f"  ✓ {name}: {len(data)} records → {filepath}")

    # Summary
    print("\n📊 Data Summary:")
    for name, data in datasets.items():
        print(f"  {name}: {len(data)} records")

    return datasets


if __name__ == "__main__":
    generate_all_data()
