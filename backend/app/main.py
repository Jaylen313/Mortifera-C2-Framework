"""
C2 Framework - Main Application

This is the entry point for the FastAPI application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.models.database.base import Base
from app.api.routes import agents, tasks, auth, operators, generator
from app.models.database import agent, task, result, operator



# ============================================
# CREATE FASTAPI APPLICATION
# ============================================
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Command and Control Framework",
    docs_url=f"{settings.API_V1_STR}/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# ============================================
# CORS MIDDLEWARE
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# STARTUP EVENT
# ============================================
@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    print(f"✅ {settings.PROJECT_NAME} starting up...")
    print(f"✅ Database: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}")
    print(f"✅ API docs: http://localhost:8000{settings.API_V1_STR}/docs")

# ============================================
# ROOT ENDPOINTS
# ============================================
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"{settings.PROJECT_NAME} API",
        "version": "1.0.0",
        "docs": f"{settings.API_V1_STR}/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# We'll add route includes here in next steps

# ============================================
# INCLUDE ROUTERS
# ============================================
app.include_router(
    agents.router,
    prefix=f"{settings.API_V1_STR}/agents",
    tags=["agents"]
)

app.include_router(
    tasks.router,
    prefix=f"{settings.API_V1_STR}/tasks",
    tags=["tasks"]
)

app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["authentication"]
)

app.include_router(
    operators.router,
    prefix=f"{settings.API_V1_STR}/operators",
    tags=["operators"]
)

app.include_router(
    generator.router,
    prefix=f"{settings.API_V1_STR}/generator",
    tags=["generator"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)