"""
Authentication Routes

Endpoints for user authentication:
- /register - Create new user
- /login - Authenticate and get tokens
- /me - Get current user info
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token
)
from app.models.database.operator import Operator, OperatorRole
from app.models.schemas.auth import UserLogin, UserRegister, TokenResponse
from app.models.schemas.operator import OperatorResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user.
    
    Example request:
    POST /api/v1/auth/register
    {
        "email": "newuser@c2.local",
        "username": "newuser",
        "password": "securepassword123"
    }
    
    Response:
    {
        "access_token": "...",
        "refresh_token": "...",
        "token_type": "bearer",
        "user": {...}
    }
    """
    
    # Check if email already exists
    result = await db.execute(
        select(Operator).where(Operator.email == user_data.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    result = await db.execute(
        select(Operator).where(Operator.username == user_data.username)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    user = Operator(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
        role=OperatorRole.VIEWER,  # Default role
        is_active=True
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    print(f"✅ New user registered: {user.username} ({user.email})")
    
    # Create tokens
    token_data = {
        "user_id": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": user.role.value
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.role.value
        }
    }


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Login with email/username and password.
    
    Example request:
    POST /api/v1/auth/login
    {
        "email": "admin@c2framework.com",
        "password": "changethis123"
    }
    
    OR
    
    {
        "username": "admin",
        "password": "changethis123"
    }
    """
    
    # Find user by email or username
    if credentials.email:
        result = await db.execute(
            select(Operator).where(Operator.email == credentials.email)
        )
    elif credentials.username:
        result = await db.execute(
            select(Operator).where(Operator.username == credentials.username)
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username required"
        )
    
    user = result.scalar_one_or_none()
    
    # Check if user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    # Update last login
    user.update_last_login()
    await db.commit()
    
    print(f"✅ User logged in: {user.username}")
    
    # Create tokens
    token_data = {
        "user_id": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": user.role.value
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.role.value
        }
    }


@router.get("/me", response_model=OperatorResponse)
async def get_current_user_info(
    current_user: Operator = Depends(get_current_user)
):
    """
    Get current user information.
    
    Requires authentication (Bearer token in Authorization header).
    
    Example:
    GET /api/v1/auth/me
    Authorization: Bearer <token>
    
    Response:
    {
        "id": "...",
        "email": "admin@c2.local",
        "username": "admin",
        "role": "admin",
        "is_active": true,
        "last_login": "2024-01-20T15:30:00",
        "created_at": "2024-01-20T10:00:00"
    }
    """
    return current_user