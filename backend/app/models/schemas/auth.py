"""
Authentication Schemas

Pydantic schemas for authentication requests/responses.
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional


class UserLogin(BaseModel):
    """
    Login request schema.
    
    User can login with either email or username.
    """
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: str = Field(..., min_length=8)
    
    @validator('email', 'username')
    def check_identifier(cls, v, values):
        """Ensure at least one identifier is provided"""
        if 'email' in values and not values.get('email') and not v:
            raise ValueError('Either email or username must be provided')
        return v


class UserRegister(BaseModel):
    """
    Registration request schema.
    
    Example:
    {
        "email": "admin@c2.local",
        "username": "admin",
        "password": "changethis123"
    }
    """
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    
    @validator('username')
    def username_alphanumeric(cls, v):
        """Ensure username is alphanumeric"""
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username must be alphanumeric (can include _ and -)')
        return v


class TokenResponse(BaseModel):
    """
    Authentication response.
    
    Returns JWT tokens after successful login.
    
    Example response:
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "bearer",
        "user": {
            "id": "...",
            "email": "admin@c2.local",
            "username": "admin",
            "role": "admin"
        }
    }
    """
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class TokenData(BaseModel):
    """
    Data stored inside JWT token.
    
    This is what gets encoded in the token.
    """
    user_id: str
    email: str
    username: str
    role: str