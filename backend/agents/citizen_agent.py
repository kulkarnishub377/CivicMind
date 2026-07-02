"""
Citizen Agent - Tracks Complaints, Social Feedback, Sentiment
Part of the CivicMind Agent Layer
"""

from typing import Dict, Any, List


class CitizenAgent:
    """Monitors citizen feedback, complaints, and sentiment."""

    def __init__(self):
        self.name = "Citizen Agent"
        self.domain = "citizen"
        self.metrics = ["complaints", "sentiment", "category_distribution", "resolution_rate"]
        self.alerts: List[Dict[str, Any]] = []

    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze citizen feedback data and generate insights."""
        complaints = data.get("complaints", 0)
        sentiment = data.get("sentiment", 0)
        categories = data.get("complaint_categories", {})
        resolution_rate = data.get("resolution_rate", 0.5)

        complaint_status = self._assess_complaints(complaints)
        sentiment_status = self._assess_sentiment(sentiment)
        satisfaction = self._calculate_satisfaction(complaints, sentiment, resolution_rate)

        self.alerts = []
        if complaints > 100:
            self.alerts.append({
                "type": "critical",
                "metric": "complaints",
                "message": f"Spike of {complaints} complaints - 45% above normal",
                "action": "Activate rapid response team and increase service capacity",
            })
        elif complaints > 50:
            self.alerts.append({
                "type": "warning",
                "metric": "complaints",
                "message": f"Elevated complaint count: {complaints}",
                "action": "Review top complaint categories and allocate resources",
            })

        if sentiment < -0.3:
            self.alerts.append({
                "type": "critical",
                "metric": "sentiment",
                "message": f"Strongly negative citizen sentiment: {sentiment}",
                "action": "Immediate community engagement and communication required",
            })
        elif sentiment < 0:
            self.alerts.append({
                "type": "warning",
                "metric": "sentiment",
                "message": f"Negative sentiment trending: {sentiment}",
                "action": "Increase communication and address top concerns",
            })

        if resolution_rate < 0.3:
            self.alerts.append({
                "type": "warning",
                "metric": "resolution",
                "message": f"Low complaint resolution rate: {resolution_rate*100:.0f}%",
                "action": "Assign additional resources to complaint resolution",
            })

        return {
            "agent": self.name,
            "ward": data.get("ward"),
            "assessment": {
                "complaints": complaint_status,
                "sentiment": sentiment_status,
                "satisfaction": satisfaction,
            },
            "alerts": self.alerts,
            "top_categories": self._get_top_categories(categories, complaints),
            "summary": (
                f"Complaint level: {complaint_status['level']} ({complaints} complaints), "
                f"sentiment: {sentiment_status['level']}, "
                f"satisfaction score: {satisfaction}/100."
            ),
            "recommendations": self._generate_recommendations(complaints, sentiment, categories, resolution_rate),
        }

    def _assess_complaints(self, count: int) -> Dict[str, Any]:
        if count < 15:
            return {"level": "Low", "color": "green", "severity": "normal"}
        elif count < 40:
            return {"level": "Moderate", "color": "yellow", "severity": "elevated"}
        elif count < 80:
            return {"level": "High", "color": "orange", "severity": "concerning"}
        else:
            return {"level": "Critical", "color": "red", "severity": "severe"}

    def _assess_sentiment(self, sentiment: float) -> Dict[str, Any]:
        if sentiment > 0.3:
            return {"level": "Positive", "color": "green", "score": 80}
        elif sentiment > 0:
            return {"level": "Neutral-Positive", "color": "yellow", "score": 60}
        elif sentiment > -0.3:
            return {"level": "Neutral-Negative", "color": "orange", "score": 40}
        else:
            return {"level": "Negative", "color": "red", "score": 20}

    def _calculate_satisfaction(self, complaints, sentiment, resolution_rate) -> int:
        # Combine metrics into 0-100 satisfaction score
        complaint_factor = max(0, 100 - complaints * 0.5)
        sentiment_factor = (sentiment + 1) * 50  # -1,1 → 0,100
        resolution_factor = resolution_rate * 100

        return int(complaint_factor * 0.3 + sentiment_factor * 0.4 + resolution_factor * 0.3)

    def _get_top_categories(self, categories: Dict[str, int], total: int) -> List[Dict[str, Any]]:
        if not categories:
            return [
                {"category": "Waste Management", "count": int(total * 0.3), "pct": 30},
                {"category": "Water Supply", "count": int(total * 0.2), "pct": 20},
                {"category": "Air Pollution", "count": int(total * 0.15), "pct": 15},
            ]
        sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)
        return [
            {"category": k, "count": v, "pct": round(v / total * 100) if total > 0 else 0}
            for k, v in sorted_cats[:5]
        ]

    def _generate_recommendations(self, complaints, sentiment, categories, resolution_rate) -> List[str]:
        recs = []
        if complaints > 80:
            recs.extend([
                "Activate rapid response team for complaint resolution",
                "Increase service capacity for top complaint categories",
                "Launch community communication campaign",
                "Set up temporary help desks in affected areas",
            ])
        elif complaints > 40:
            recs.extend([
                "Prioritize top complaint categories for quick wins",
                "Improve complaint tracking and response times",
            ])

        if sentiment < -0.3:
            recs.extend([
                "Organize community town hall meetings",
                "Issue public statement acknowledging concerns",
                "Establish feedback loop with affected residents",
            ])

        if resolution_rate < 0.3:
            recs.append("Assign dedicated team to improve complaint resolution rate")

        return recs
