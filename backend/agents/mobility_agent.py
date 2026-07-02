"""
Mobility Agent - Tracks Traffic, Road Conditions, Public Transport
Part of the CivicMind Agent Layer
"""

from typing import Dict, Any, List


class MobilityAgent:
    """Monitors transportation and mobility conditions."""

    def __init__(self):
        self.name = "Mobility Agent"
        self.domain = "mobility"
        self.metrics = ["traffic_index", "bus_delay_minutes", "avg_speed_kmh", "accidents"]
        self.alerts: List[Dict[str, Any]] = []

    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze mobility data and generate insights."""
        traffic = data.get("traffic_index", 0)
        bus_delay = data.get("bus_delay_minutes", 0)
        avg_speed = data.get("avg_speed_kmh", 30)
        accidents = data.get("accidents", 0)

        traffic_status = self._assess_traffic(traffic)
        transit_status = self._assess_transit(bus_delay)
        congestion_forecast = self._forecast_congestion(traffic, bus_delay)

        self.alerts = []
        if traffic > 75:
            self.alerts.append({
                "type": "critical",
                "metric": "traffic",
                "message": f"Severe congestion at index {traffic}",
                "action": "Deploy traffic management measures immediately",
            })
        elif traffic > 55:
            self.alerts.append({
                "type": "warning",
                "metric": "traffic",
                "message": f"Heavy traffic at index {traffic}",
                "action": "Consider alternate routes and signal optimization",
            })

        if bus_delay > 15:
            self.alerts.append({
                "type": "warning",
                "metric": "transit",
                "message": f"Bus delays averaging {bus_delay} minutes",
                "action": "Deploy additional buses on affected routes",
            })

        if accidents > 2:
            self.alerts.append({
                "type": "warning",
                "metric": "safety",
                "message": f"{accidents} traffic accidents reported",
                "action": "Deploy traffic marshals and enforce speed limits",
            })

        return {
            "agent": self.name,
            "ward": data.get("ward"),
            "assessment": {
                "traffic": traffic_status,
                "transit": transit_status,
                "congestion_forecast": congestion_forecast,
            },
            "alerts": self.alerts,
            "summary": (
                f"Traffic is {traffic_status['level']} (Index: {traffic}), "
                f"transit delays: {bus_delay} min, "
                f"congestion forecast: {congestion_forecast['trend']}."
            ),
            "recommendations": self._generate_recommendations(traffic, bus_delay, accidents),
        }

    def _assess_traffic(self, index: float) -> Dict[str, Any]:
        if index < 30:
            return {"level": "Smooth", "color": "green", "score": 90}
        elif index < 50:
            return {"level": "Moderate", "color": "yellow", "score": 65}
        elif index < 75:
            return {"level": "Heavy", "color": "orange", "score": 35}
        else:
            return {"level": "Severe", "color": "red", "score": 15}

    def _assess_transit(self, delay: float) -> Dict[str, Any]:
        if delay < 5:
            return {"level": "On Time", "color": "green"}
        elif delay < 10:
            return {"level": "Minor Delays", "color": "yellow"}
        elif delay < 20:
            return {"level": "Significant Delays", "color": "orange"}
        else:
            return {"level": "Severe Delays", "color": "red"}

    def _forecast_congestion(self, traffic: float, delay: float) -> Dict[str, Any]:
        combined = traffic * 0.7 + delay * 2
        if combined > 80:
            return {"trend": "Worsening", "peak_forecast": "Severe", "confidence": 80}
        elif combined > 50:
            return {"trend": "Stable-High", "peak_forecast": "Heavy", "confidence": 72}
        else:
            return {"trend": "Stable", "peak_forecast": "Moderate", "confidence": 68}

    def _generate_recommendations(self, traffic, delay, accidents) -> List[str]:
        recs = []
        if traffic > 75:
            recs.extend([
                "Implement dynamic traffic signal optimization",
                "Activate park-and-ride facilities",
                "Deploy traffic marshals at key junctions",
                "Consider temporary vehicle restrictions",
            ])
        elif traffic > 55:
            recs.extend([
                "Optimize traffic signal timing",
                "Encourage off-peak travel",
            ])
        if delay > 15:
            recs.extend([
                "Add peak-hour buses on high-demand routes",
                "Implement real-time passenger information system",
            ])
        if accidents > 2:
            recs.append("Increase traffic enforcement and road safety measures")
        return recs
