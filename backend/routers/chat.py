"""
Chat API Router
AI-powered natural language interface using Gemini
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    ward: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    sources: list = []
    confidence: int = 0
    related_wards: list = []
    follow_up_suggestions: list = []


# Pre-built responses for demo (in production, this would use Gemini + RAG)
RESPONSES = {
    "ward_attention": {
        "response": (
            "**Ward D** needs urgent attention. Here's the analysis:\n\n"
            "🔴 **AQI: 168** — 68% above safe threshold\n"
            "🔴 **Water Shortage Risk: HIGH** — Usage at 95% capacity\n"
            "🔴 **Complaints: 145** — 45% increase this week\n"
            "🔴 **Waste Overflow Risk: HIGH** — Predicted within 5 days\n"
            "🔴 **Traffic Congestion: 88** — Severe delays\n\n"
            "**Confidence: 87%**\n\n"
            "**Recommended immediate actions:**\n"
            "1. Deploy air quality monitoring stations\n"
            "2. Implement Stage 2 water conservation\n"
            "3. Increase waste collection frequency\n"
            "4. Issue health advisory for residents"
        ),
        "confidence": 87,
        "related_wards": ["Ward D"],
        "follow_up": ["What specific actions for Ward D water shortage?", "Show flood risk predictions"],
    },
    "air_quality": {
        "response": (
            "**Air Quality Deterioration Analysis — SmartVille**\n\n"
            "📈 **Ward D** is the primary concern:\n"
            "- AQI jumped from 120 to 168 (40% increase)\n"
            "- Coincides with industrial activity spike in Zone D2\n"
            "- Low rainfall (3mm) hasn't dispersed pollutants\n"
            "- Temperature at 36°C increases ground-level ozone\n\n"
            "**Contributing Factors:**\n"
            "- Industrial emissions: 45%\n"
            "- Vehicular traffic: 30%\n"
            "- Construction dust: 15%\n"
            "- Weather conditions: 10%\n\n"
            "**Prediction:** Without action, AQI may reach 190+ within 3 days.\n\n"
            "**Recommended:** Enforce emission standards and deploy smog towers."
        ),
        "confidence": 84,
        "related_wards": ["Ward D", "Ward B"],
        "follow_up": ["What emission controls should we enforce?", "Show pollution trend for Ward D"],
    },
    "flood_risk": {
        "response": (
            "**Flood Risk Assessment — Next 7 Days**\n\n"
            "🌊 **Ward C: HIGH RISK** ⚠️\n"
            "- Rainfall forecast: 80-120mm over next 5 days\n"
            "- Drainage capacity at 75%\n"
            "- 12,000 residents in low-lying areas at risk\n\n"
            "🔶 **Ward B: MEDIUM RISK**\n"
            "- Rainfall forecast: 40-60mm\n"
            "- Some drainage blockages reported\n\n"
            "🟢 **Ward A, D, E: LOW RISK**\n\n"
            "**Confidence: 84%**\n\n"
            "**Urgent Actions for Ward C:**\n"
            "1. Pre-position emergency equipment\n"
            "2. Clear drainage channels immediately\n"
            "3. Issue early warning to residents"
        ),
        "confidence": 84,
        "related_wards": ["Ward C", "Ward B"],
        "follow_up": ["Simulate flood impact on Ward C", "Show drainage status"],
    },
    "recommendations": {
        "response": (
            "**Priority Recommendations — SmartVille**\n\n"
            "🔴 **CRITICAL — Ward D:**\n"
            "→ Air quality emergency (AQI: 168)\n"
            "→ Water shortage imminent (95% usage)\n"
            "→ Waste overflow in 5 days\n\n"
            "🟠 **HIGH — Ward B:**\n"
            "→ Traffic congestion severe (Index: 72)\n"
            "→ Bus delays averaging 15 minutes\n\n"
            "🟠 **HIGH — Ward C:**\n"
            "→ Flood risk elevated due to rainfall\n\n"
            "🟡 **MEDIUM — Ward E:**\n"
            "→ Resource inefficiency across utilities\n\n"
            "**Overall Impact:** Implementing all recommendations could improve city score from 68 to 82."
        ),
        "confidence": 82,
        "related_wards": ["Ward D", "Ward B", "Ward C", "Ward E"],
        "follow_up": ["Show Ward D action plan", "Simulate waste collection increase"],
    },
}


def classify_query(query: str) -> str:
    """Classify the user's query to route to appropriate response."""
    q = query.lower()

    if any(w in q for w in ["attention", "urgent", "vulnerable", "which ward", "which area", "needs help"]):
        return "ward_attention"
    if any(w in q for w in ["air quality", "aqi", "pollution", "worsening"]):
        return "air_quality"
    if any(w in q for w in ["flood", "rain", "water risk"]):
        return "flood_risk"
    if any(w in q for w in ["recommend", "action", "what should", "suggestion"]):
        return "recommendations"

    return "default"


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Process a natural language query about community data.
    In production, this would use Gemini + Vertex AI + RAG.
    """
    category = classify_query(request.message)

    if category == "default":
        return ChatResponse(
            response=(
                "I can help you analyze community data for SmartVille. Try asking about:\n\n"
                "🔍 **Analysis** — Specific wards, metrics, or trends\n"
                "📊 **Predictions** — Risk forecasts for flood, water, traffic\n"
                "💡 **Recommendations** — AI-generated action plans\n"
                "🔬 **Simulation** — What-if scenarios\n\n"
                "Try: 'Which ward needs urgent attention?' or 'What is the flood risk?'"
            ),
            confidence=90,
            related_wards=["Ward A", "Ward B", "Ward C", "Ward D", "Ward E"],
            follow_up_suggestions=[
                "Which ward needs urgent attention?",
                "What is the flood risk prediction?",
                "Show me all recommendations",
            ],
        )

    data = RESPONSES[category]
    return ChatResponse(
        response=data["response"],
        sources=["BigQuery: environment_data", "BigQuery: citizen_feedback", "Vertex AI: predictions"],
        confidence=data["confidence"],
        related_wards=data["related_wards"],
        follow_up_suggestions=data.get("follow_up", []),
    )


@router.get("/suggestions")
async def get_suggestions():
    """Get suggested questions for the chat interface."""
    return {
        "suggestions": [
            "Which ward needs urgent attention?",
            "Why is air quality worsening?",
            "What is the flood risk prediction?",
            "Show me all recommendations",
            "What actions for Ward D?",
            "Compare Ward C and Ward D",
        ]
    }
