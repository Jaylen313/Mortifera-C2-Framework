"""
Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from app.core.database import create_tables
from app.core.config import settings
from app.api.routes import auth, agents, tasks, generator, operators
from app.services.agent_cleanup import cleanup_loop


# Global cleanup task reference
cleanup_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager.
    
    Runs startup/shutdown logic:
    - On startup: Create DB tables, start cleanup task
    - On shutdown: Stop cleanup task
    """
    global cleanup_task
    
    # STARTUP
    print("🚀 Starting Mortifera C2 Server...")
    await create_tables()
    print("✅ Database tables ready")
    
    # Start background cleanup task
    cleanup_task = asyncio.create_task(cleanup_loop())
    print("✅ Background cleanup task started")
    
    yield  # Server runs here
    
    # SHUTDOWN
    print("🛑 Shutting down...")
    if cleanup_task:
        cleanup_task.cancel()
        try:
            await cleanup_task
        except asyncio.CancelledError:
            pass
    print("✅ Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Mortifera C2 Server",
    description="Command and Control Framework API",
    version="1.0.0",
    lifespan=lifespan
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["Agents"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(generator.router, prefix="/api/v1/generator", tags=["Generator"])
app.include_router(operators.router, prefix="/api/v1/operators", tags=["Operators"])


@app.get("/")
async def root():
    """
    Root endpoint - health check.
    """
    return {
        "message": "Mortifera C2 Server",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health():
    """
    Health check endpoint.
    """
    return {"status": "healthy"}