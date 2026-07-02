"""
Environment Agent - Tracks AQI, Weather, Flood Risk
Part of the CivicMind Agent Layer
"""

from typing import Dict, Any, List


class EnvironmentAgent:
    """Monitors environmental conditions and predicts risks."""

    def __init__(self):
        self.name = "Environment Agent"
        self.domain = "environment"
        self.metrics = ["aqi", "temperature", "rainfall", "humidity", "wind_speed"]
        self.alerts: List[Dict[str, Any]] = []

    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze environmental data and generate insights."""
        aqi = data.get("aqi", 0)
        temperature = data.get("temperature", 25)
        rainfall = data.get("rainfall", 0)
        humidity = data.get("humidity", 50)

        # AQI Assessment
        aqi_status = self._assess_aqi(aqi)
        temp_status = self._assess_temperature(temperature)
        rain_status = self._assess_rainfall(rainfall)

        # Flood risk calculation
        flood_risk = self._calculate_flood_risk(rainfall, humidity)

        # Generate alerts
        self.alerts = []
        if aqi > 150:
            self.alerts.append({
                "type": "critical",
                "metric": "aqi",
                "message": f"AQI at {aqi} - Well above safe threshold of 100",
                "action": "Issue health advisory and enforce emission standards",
            })
        elif aqi > 100:
            self.alerts.append({
                "type": "warning",
                "metric": "aqi",
                "message": f"AQI at {aqi} - Above safe threshold",
                "action": "Monitor industrial emissions and increase surveillance",
            })

        if flood_risk["level"] == "High":
            self.alerts.append({
                "type": "critical",
                "metric": "flood_risk",
                "message": f"High flood risk due to {rainfall}mm rainfall",
                "action": "Activate flood response protocols",
            })

        if temperature > 40:
            self.alerts.append({
                "type": "warning",
                "metric": "temperature",
                "message": f"Heat wave conditions at {temperature}°C",
                "action": "Issue heat advisory and open cooling centers",
            })

        return {
            "agent": self.name,
            "ward": data.get("ward"),
            "assessment": {
                "aqi": aqi_status,
                "temperature": temp_status,
                "rainfall": rain_status,
                "flood_risk": flood_risk,
            },
            "alerts": self.alerts,
            "summary": self._generate_summary(aqi_status, temp_status, rain_status, flood_risk),
            "recommendations": self._generate_recommendations(aqi, temperature, rainfall, flood_risk),
        }

    def _assess_aqi(self, aqi: float) -> Dict[str, Any]:
        if aqi <= 50:
            return {"level": "Good", "color": "green", "score": 100}
        elif aqi <= 100:
            return {"level": "Moderate", "color": "yellow", "score": 70}
        elif aqi <= 150:
            return {"level": "Unhealthy for Sensitive", "color": "orange", "score": 40}
        elif aqi <= 200:
            return {"level": "Unhealthy", "color": "red", "score": 20}
        else:
            return {"level": "Hazardous", "color": "purple", "score": 5}

    def _assess_temperature(self, temp: float) -> Dict[str, Any]:
        if 20 <= temp <= 30:
            return {"level": "Comfortable", "color": "green"}
        elif 30 < temp <= 35:
            return {"level": "Warm", "color": "yellow"}
        elif 35 < temp <= 40:
            return {"level": "Hot", "color": "orange"}
        else:
            return {"level": "Extreme", "color": "red"}

    def _assess_rainfall(self, rain: float) -> Dict[str, Any]:
        if rain < 5:
            return {"level": "Dry", "concern": "water_shortage"}
        elif rain <= 20:
            return {"level": "Normal", "concern": None}
        elif rain <= 50:
            return {"level": "Heavy", "concern": "flooding"}
        else:
            return {"level": "Extreme", "concern": "severe_flooding"}

    def _calculate_flood_risk(self, rainfall: float, humidity: float) -> Dict[str, Any]:
        score = 0
        if rainfall > 50: score += 50
        elif rainfall > 30: score += 35
        elif rainfall > 15: score += 20

        if humidity > 85: score += 20
        elif humidity > 70: score += 10

        level = "High" if score >= 60 else "Medium" if score >= 30 else "Low"
        return {"level": level, "score": min(100, score)}

    def _generate_summary(self, aqi, temp, rain, flood) -> str:
        return (
            f"Air quality is {aqi['level']} (AQI score: {aqi.get('score', 'N/A')}), "
            f"temperature is {temp['level']}, rainfall is {rain['level']}. "
            f"Flood risk: {flood['level']}."
        )

    def _generate_recommendations(self, aqi, temp, rainfall_val, flood) -> List[str]:
        recs = []
        if aqi > 150:
            recs.extend([
                "Deploy mobile air quality monitoring stations",
                "Issue health advisory for vulnerable populations",
                "Enforce industrial emission standards",
                "Activate smog towers in affected zones",
            ])
        elif aqi > 100:
            recs.extend([
                "Monitor emission sources",
                "Reduce outdoor activities advisory",
            ])
        if flood["level"] == "High":
            recs.extend([
                "Pre-position sandbags and pumps",
                "Clear drainage channels",
                "Issue early warning to residents",
            ])
        if rainfall_val < 5:
            recs.append("Monitor reservoir levels and prepare conservation measures")
        return recs
