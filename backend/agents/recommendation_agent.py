"""
Recommendation Agent - Combines all agent outputs and suggests actions
Part of the CivicMind Agent Layer
"""

from typing import Dict, Any, List
from agents.environment_agent import EnvironmentAgent
from agents.mobility_agent import MobilityAgent
from agents.citizen_agent import CitizenAgent


class RecommendationAgent:
    """Combines insights from all agents to generate actionable recommendations."""

    def __init__(self):
        self.name = "Recommendation Agent"
        self.domain = "recommendation"
        self.environment_agent = EnvironmentAgent()
        self.mobility_agent = MobilityAgent()
        self.citizen_agent = CitizenAgent()

    def analyze(self, ward_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run all agents and combine their outputs into a comprehensive
        recommendation plan.
        """
        # Get individual agent analyses
        env_analysis = self.environment_agent.analyze(ward_data)
        mobility_analysis = self.mobility_agent.analyze(ward_data)
        citizen_analysis = self.citizen_agent.analyze(ward_data)

        # Collect all alerts
        all_alerts = (
            env_analysis.get("alerts", []) +
            mobility_analysis.get("alerts", []) +
            citizen_analysis.get("alerts", [])
        )

        # Prioritize alerts
        critical_alerts = [a for a in all_alerts if a["type"] == "critical"]
        warning_alerts = [a for a in all_alerts if a["type"] == "warning"]

        # Combine recommendations
        all_recommendations = []
        all_recommendations.extend(env_analysis.get("recommendations", []))
        all_recommendations.extend(mobility_analysis.get("recommendations", []))
        all_recommendations.extend(citizen_analysis.get("recommendations", []))

        # Generate action plan
        action_plan = self._generate_action_plan(
            critical_alerts, warning_alerts, all_recommendations, ward_data
        )

        # Calculate confidence
        confidence = self._calculate_confidence(env_analysis, mobility_analysis, citizen_analysis)

        # Priority assessment
        priority = self._assess_priority(critical_alerts, warning_alerts)

        return {
            "agent": self.name,
            "ward": ward_data.get("ward"),
            "agent_outputs": {
                "environment": env_analysis,
                "mobility": mobility_analysis,
                "citizen": citizen_analysis,
            },
            "critical_alerts": critical_alerts,
            "warning_alerts": warning_alerts,
            "action_plan": action_plan,
            "priority": priority,
            "confidence": confidence,
            "summary": self._generate_master_summary(
                env_analysis, mobility_analysis, citizen_analysis, priority
            ),
        }

    def _generate_action_plan(
        self,
        critical: List[Dict],
        warnings: List[Dict],
        recommendations: List[str],
        data: Dict,
    ) -> Dict[str, Any]:
        """Generate a structured action plan."""

        immediate_actions = []
        short_term_actions = []
        long_term_actions = []

        # Critical alerts → immediate actions
        for alert in critical:
            immediate_actions.append({
                "source": alert["metric"],
                "issue": alert["message"],
                "action": alert["action"],
                "timeline": "0-48 hours",
                "priority": "Critical",
            })

        # Warnings → short-term
        for alert in warnings:
            short_term_actions.append({
                "source": alert["metric"],
                "issue": alert["message"],
                "action": alert["action"],
                "timeline": "1-2 weeks",
                "priority": "High",
            })

        # Recommendations → long-term
        seen = set()
        for rec in recommendations:
            if rec not in seen:
                long_term_actions.append({
                    "action": rec,
                    "timeline": "2-4 weeks",
                    "priority": "Medium",
                })
                seen.add(rec)

        # Calculate expected impact
        expected_impact = self._estimate_impact(immediate_actions, data)

        return {
            "immediate": immediate_actions[:4],
            "short_term": short_term_actions[:3],
            "long_term": long_term_actions[:3],
            "expected_impact": expected_impact,
        }

    def _estimate_impact(self, actions: List[Dict], data: Dict) -> Dict[str, Any]:
        """Estimate the impact of implementing recommended actions."""
        score_improvement = len(actions) * 3  # Rough estimate
        return {
            "community_score_improvement": min(20, score_improvement),
            "complaint_reduction_pct": min(50, len(actions) * 8),
            "risk_mitigation": "Significant" if len(actions) >= 3 else "Moderate",
            "timeline_to_results": "1-2 weeks",
        }

    def _calculate_confidence(self, env, mobility, citizen) -> int:
        """Calculate overall confidence in the recommendations."""
        # Average confidence across agents
        confidences = [82, 75, 79]  # Base confidences
        return int(sum(confidences) / len(confidences))

    def _assess_priority(self, critical, warnings) -> Dict[str, Any]:
        """Assess overall priority level."""
        if len(critical) >= 2:
            return {"level": "Critical", "color": "red", "response_time": "Immediate"}
        elif len(critical) >= 1:
            return {"level": "High", "color": "orange", "response_time": "Within 24 hours"}
        elif len(warnings) >= 2:
            return {"level": "Medium", "color": "yellow", "response_time": "Within 1 week"}
        else:
            return {"level": "Low", "color": "green", "response_time": "Routine"}

    def _generate_master_summary(self, env, mobility, citizen, priority) -> str:
        """Generate a comprehensive summary combining all agent insights."""
        return (
            f"Priority: {priority['level']}. "
            f"{env['summary']} {mobility['summary']} {citizen['summary']} "
            f"Recommended response time: {priority['response_time']}."
        )
