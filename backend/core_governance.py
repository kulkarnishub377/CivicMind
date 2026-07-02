"""
CivicMind Core Governance & Security Module
Implements Role-Based Access Control (RBAC) security scopes and async BigQuery ingestion tasks.
"""

from typing import List, Optional
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import APIKeyHeader, SecurityScopes

# Mock User Model for RBAC
class User(BaseModel):
    username: str
    role: str # "citizen" or "official"
    scopes: List[str]

# API Key Scheme allowing zero-config demo fallbacks
api_key_scheme = APIKeyHeader(name="Authorization", auto_error=False)

# Mock token database for verification
MOCK_USERS_DB = {
    "citizen_token_123": User(
        username="citizen_shubham",
        role="citizen",
        scopes=["citizen"]
    ),
    "official_token_789": User(
        username="mayor_kulkarni",
        role="official",
        scopes=["citizen", "official"]
    )
}

async def get_current_user(
    security_scopes: SecurityScopes,
    token: Optional[str] = Depends(api_key_scheme)
) -> User:
    """
    Decodes bearer token and validates required security scopes (RBAC).
    If no token is supplied, automatically falls back to a default official
    session to guarantee seamless portfolio demo functionality.
    """
    if not token:
        # Zero-config demo fallback
        return User(
            username="demo_official",
            role="official",
            scopes=["citizen", "official"]
        )
        
    # Extract token
    token_str = token.replace("Bearer ", "").strip() if token.lower().startswith("bearer ") else token.strip()
    
    # Retrieve user from mock DB
    user = MOCK_USERS_DB.get(token_str)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials - invalid token",
            headers={"WWW-Authenticate": f"Bearer scope=\"{security_scopes.scope_str}\""}
        )
        
    # Scope validation
    for scope in security_scopes.scopes:
        if scope not in user.scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this command center resource",
                headers={"WWW-Authenticate": f"Bearer scope=\"{security_scopes.scope_str}\""}
            )
            
    return user


# --- DATA GOVERNANCE: BIGQUERY BACKGROUND INGESTION CLIENT ---

class BigQueryIngestionClient:
    """
    Simulated asynchronous BigQuery ingestion client.
    Utilizes non-blocking background threads to prevent main event loop delays.
    """
    
    @staticmethod
    async def stream_event_to_warehouse(table_name: str, row_payload: dict):
        """
        Non-blocking streaming helper mimicking BigQuery's insert_rows_json() client.
        """
        import asyncio
        import json
        
        # Simulate network roundtrip latency to Google Cloud BigQuery API
        await asyncio.sleep(0.05) 
        
        print(f"[BigQuery Ingestion] Async streamed row to {table_name}: {json.dumps(row_payload)}")
        return True
