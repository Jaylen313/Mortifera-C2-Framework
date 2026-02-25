"""
Configuration Module

This file loads settings from .env file and makes them
available throughout the application.

Think of this as the "control panel" for your entire backend.
"""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator


class Settings(BaseSettings):
    """
    Application Settings
    
    This class reads environment variables and provides
    type-safe access to configuration.
    """
    
    # ============================================
    # API SETTINGS
    # ============================================
    PROJECT_NAME: str
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    
    # ============================================
    # DATABASE SETTINGS
    # ============================================
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int = 5432
    
    @property
    def DATABASE_URL(self) -> str:
        """
        Construct database connection URL
        
        Format: postgresql+asyncpg://user:password@server:port/database
        
        Why asyncpg? It allows async/await for database operations
        which makes the server faster and more efficient.
        """
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:"
            f"{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:"
            f"{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
    
    # ============================================
    # SECURITY SETTINGS
    # ============================================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Encryption key for agent communications
    ENCRYPTION_KEY: str
    
    # ============================================
    # CORS SETTINGS
    # ============================================
    BACKEND_CORS_ORIGINS: List[str] = []
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        """
        Parse CORS origins from string or list
        
        CORS = Cross-Origin Resource Sharing
        This controls which websites can call our API.
        
        Example: If frontend is at http://localhost:3000,
        we need to allow it to make requests to our API.
        """
        if isinstance(v, str):
            # If it's a string like '["url1", "url2"]', parse it
            if v.startswith("["):
                import json
                return json.loads(v)
            # If it's a comma-separated string
            return [i.strip() for i in v.split(",")]
        return v
    
    # ============================================
    # ADMIN USER
    # ============================================
    FIRST_SUPERUSER_EMAIL: str
    FIRST_SUPERUSER_PASSWORD: str
    
    class Config:
        """
        Pydantic configuration
        
        env_file tells Pydantic to load values from .env
        case_sensitive means variable names must match exactly
        """
        env_file = ".env"
        case_sensitive = True


# ============================================
# CREATE SETTINGS INSTANCE
# ============================================
# This loads all settings from .env file
settings = Settings()

# Now anywhere in your code, you can do:
# from app.core.config import settings
# print(settings.DATABASE_URL)