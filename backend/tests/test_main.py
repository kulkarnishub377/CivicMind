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
