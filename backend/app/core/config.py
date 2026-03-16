"""
Configuration Settings

Centralized configuration using environment variables.
Falls back to secure defaults if not set.
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings.
    
    These can be overridden via environment variables.
    Example: DATABASE_URL="postgresql://..." python main.py
    """
    
    # ============================================
    # DATABASE
    # ============================================
    DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://c2user:c2password@localhost:5432/c2db"
)
    
    # ============================================
    # SECURITY
    # ============================================
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "your-super-secret-key-change-this-in-production-make-it-long-and-random"
    )
    
    # Encryption key must be 32 bytes (256 bits) when base64 decoded
    # This is a 32-byte key encoded in base64
    ENCRYPTION_KEY: str = os.getenv(
        "ENCRYPTION_KEY",
        "MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI="  # "12345678901234567890123456789012" in base64
    )
    
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24  # Token valid for 24 hours
    
    # ============================================
    # API
    # ============================================
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Mortifera C2 Framework"
    
    # ============================================
    # CORS
    # ============================================
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    class Config:
        case_sensitive = True


settings = Settings()