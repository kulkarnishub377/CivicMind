import sys
import os
from fastapi.testclient import TestClient

# Adjust path to import backend modules correctly regardless of run directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_dashboard_overview():
    response = client.get("/api/dashboard/overview")
    assert response.status_code == 200
    assert "city" in response.json()
    assert "wards" in response.json()

def test_predict_all():
    response = client.get("/api/predict/all")
    assert response.status_code == 200
    assert "predictions" in response.json()

def test_recommend_all():
    response = client.get("/api/recommend/all")
    assert response.status_code == 200
    assert "recommendations" in response.json()

def test_chat_suggestions():
    response = client.get("/api/chat/suggestions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_simulate_presets():
    response = client.get("/api/simulate/presets")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_ai_summary_anonymous_fallback():
    # Anonymous request falls back to default official context in portfolio mode
    response = client.get("/api/decision-center/ai-summary")
    assert response.status_code == 200
    assert "summary" in response.json()

def test_ai_summary_insufficient_citizen_role():
    # Citizen token should fail official scope check with 403
    headers = {"Authorization": "Bearer citizen_token_123"}
    response = client.get("/api/decision-center/ai-summary", headers=headers)
    assert response.status_code == 403

def test_ai_summary_official_role_success():
    # Official token passes official scope validation and retrieves summary
    headers = {"Authorization": "Bearer official_token_789"}
    response = client.get("/api/decision-center/ai-summary", headers=headers)
    assert response.status_code == 200
    assert "summary" in response.json()

