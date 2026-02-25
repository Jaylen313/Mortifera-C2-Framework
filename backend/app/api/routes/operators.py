"""
Operator Management Routes

Endpoints for managing users (admin only).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.core.database import get_db
from app.core.security import hash_password
from app.models.database.operator import Operator, OperatorRole
from app.models.schemas.operator import (
    OperatorResponse,
    OperatorCreate,
    OperatorUpdate
)
from app.api.deps import get_current_admin

router = APIRouter()


@router.get("/", response_model=List[OperatorResponse])
async def list_operators(
    current_user: Operator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    List all operators (admin only).
    
    GET /api/v1/operators
    """
    result = await db.execute(
        select(Operator).order_by(Operator.created_at.desc())
    )
    operators = result.scalars().all()
    return operators


@router.post("/", response_model=OperatorResponse)
async def create_operator(
    operator_data: OperatorCreate,
    current_user: Operator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new operator (admin only).
    
    POST /api/v1/operators
    {
        "email": "newop@c2.local",
        "username": "newop",
        "password": "password123",
        "role": "operator"
    }
    """
    
    # Check if email exists
    result = await db.execute(
        select(Operator).where(Operator.email == operator_data.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Check if username exists
    result = await db.execute(
        select(Operator).where(Operator.username == operator_data.username)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Create operator
    operator = Operator(
        email=operator_data.email,
        username=operator_data.username,
        hashed_password=hash_password(operator_data.password),
        role=OperatorRole(operator_data.role),
        is_active=True
    )
    
    db.add(operator)
    await db.commit()
    await db.refresh(operator)
    
    print(f"✅ Operator created: {operator.username} ({operator.role.value})")
    
    return operator


@router.patch("/{operator_id}", response_model=OperatorResponse)
async def update_operator(
    operator_id: str,
    update_data: OperatorUpdate,
    current_user: Operator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an operator (admin only).
    
    PATCH /api/v1/operators/{operator_id}
    {
        "role": "admin",
        "is_active": false
    }
    """
    
    operator_uuid = uuid.UUID(operator_id)
    
    # Get operator
    result = await db.execute(
        select(Operator).where(Operator.id == operator_uuid)
    )
    operator = result.scalar_one_or_none()
    
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator not found"
        )
    
    # Update fields
    if update_data.email:
        operator.email = update_data.email
    if update_data.username:
        operator.username = update_data.username
    if update_data.role:
        operator.role = OperatorRole(update_data.role)
    if update_data.is_active is not None:
        operator.is_active = update_data.is_active
    
    await db.commit()
    await db.refresh(operator)
    
    print(f"✅ Operator updated: {operator.username}")
    
    return operator


@router.delete("/{operator_id}")
async def delete_operator(
    operator_id: str,
    current_user: Operator = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an operator (admin only).
    
    DELETE /api/v1/operators/{operator_id}
    """
    
    operator_uuid = uuid.UUID(operator_id)
    
    # Cannot delete yourself
    if operator_uuid == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Get operator
    result = await db.execute(
        select(Operator).where(Operator.id == operator_uuid)
    )
    operator = result.scalar_one_or_none()
    
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator not found"
        )
    
    await db.delete(operator)
    await db.commit()
    
    print(f"🗑️  Operator deleted: {operator.username}")
    
    return {"status": "deleted", "operator_id": operator_id}