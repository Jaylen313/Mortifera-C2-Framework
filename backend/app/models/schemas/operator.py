"""
Operator (User) Schemas
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


class OperatorBase(BaseModel):
    """Base operator schema"""
    email: EmailStr
    username: str


class OperatorCreate(OperatorBase):
    """Schema for creating an operator"""
    password: str
    role: str = "viewer"  # Default role


class OperatorUpdate(BaseModel):
    """Schema for updating an operator"""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class OperatorResponse(OperatorBase):
    """Schema for operator in responses"""
    id: UUID
    role: str
    is_active: bool
    last_login: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True