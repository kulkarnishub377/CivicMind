"""
CivicMind - Community Decision Intelligence Platform
FastAPI Backend Server
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import dashboard, chat, predict, recommend, simulate, agents, decision_center

app = FastAPI(
    title="CivicMind - Community Decision Intelligence Platform",
    description="AI-powered platform for smarter community decisions",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(predict.router, prefix="/api/predict", tags=["Predictions"])
app.include_router(recommend.router, prefix="/api/recommend", tags=["Recommendations"])
app.include_router(simulate.router, prefix="/api/simulate", tags=["Simulator"])
app.include_router(decision_center.router, prefix="/api/decision-center", tags=["Decision Center"])
app.include_router(agents.router, prefix="/api/agents", tags=["AI Agents"])


@app.get("/")
async def root():
    return {
        "platform": "CivicMind - Community Decision Intelligence Platform",
        "version": "1.0.0",
        "status": "active",
        "agents": ["environment", "mobility", "citizen", "recommendation"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "agents_active": 4}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
