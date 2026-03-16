"""
Authentication Routes

Handles user login, registration, and token management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from jose import jwt
from typing import Any

from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_password, get_password_hash
from app.models.database.operator import Operator
from app.models.schemas.auth import TokenResponse, UserRegister, UserLogin
from app.api.deps import get_current_active_user

router = APIRouter()


def create_access_token(data: dict) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def user_to_dict(user: Operator) -> dict:
    """Convert Operator model to user dict with all fields."""
    return {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": user.role.value,  # Convert enum to string
        "is_active": user.is_active,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)) -> Any:
    """
    Login endpoint.
    
    POST /api/v1/auth/login
    {
        "email": "admin@c2framework.com",
        "password": "changethis123"
    }
    """
    result = await db.execute(
        select(Operator).where(Operator.email == credentials.email)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    
    return {
        "access_token": create_access_token(
            data={"sub": str(user.id), "email": user.email}
        ),
        "refresh_token": create_refresh_token(
            data={"sub": str(user.id), "email": user.email}
        ),
        "token_type": "bearer",
        "user": user_to_dict(user)  # ← FIXED: Now includes all fields
    }


@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)) -> Any:
    """
    Register endpoint.
    
    POST /api/v1/auth/register
    {
        "email": "newuser@c2framework.com",
        "username": "newuser",
        "password": "password123"
    }
    """
    result = await db.execute(
        select(Operator).where(Operator.email == user_in.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    user = Operator(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        role="operator"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return {
        "access_token": create_access_token(
            data={"sub": str(user.id), "email": user.email}
        ),
        "refresh_token": create_refresh_token(
            data={"sub": str(user.id), "email": user.email}
        ),
        "token_type": "bearer",
        "user": user_to_dict(user)  # ← FIXED: Now includes all fields
    }


@router.get("/me")
async def get_current_user_info(
    current_user: Operator = Depends(get_current_active_user)
) -> Any:
    """
    Get current user info.
    
    GET /api/v1/auth/me
    """
    return user_to_dict(current_user)  # ← FIXED: Now includes all fields