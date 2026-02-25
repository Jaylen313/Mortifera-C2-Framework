"""
API Dependencies

FastAPI dependencies for authentication and authorization.

These are reusable functions that can be injected into routes.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.core.security import decode_token
from app.models.database.operator import Operator, OperatorRole

# ============================================
# SECURITY SCHEME
# ============================================
security = HTTPBearer()


# ============================================
# GET CURRENT USER
# ============================================
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Operator:
    """
    Get current authenticated user from JWT token.
    
    This dependency:
    1. Extracts JWT token from Authorization header
    2. Decodes and verifies the token
    3. Fetches user from database
    4. Returns the user object
    
    Usage in routes:
    @app.get("/protected")
    async def protected_route(current_user: Operator = Depends(get_current_user)):
        return {"user": current_user.username}
    
    The route is now protected - only authenticated users can access it.
    """
    
    # Extract token
    token = credentials.credentials
    
    # Decode token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user ID from token
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Fetch user from database
    result = await db.execute(
        select(Operator).where(Operator.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    return user


# ============================================
# ROLE CHECKS
# ============================================
def require_role(*allowed_roles: OperatorRole):
    """
    Dependency to require specific role(s).
    
    Usage:
    @app.delete("/agents/{agent_id}")
    async def delete_agent(
        agent_id: str,
        current_user: Operator = Depends(require_role(OperatorRole.ADMIN))
    ):
        # Only admins can access this
        ...
    
    Multiple roles:
    @app.post("/tasks")
    async def create_task(
        current_user: Operator = Depends(require_role(OperatorRole.ADMIN, OperatorRole.OPERATOR))
    ):
        # Admins and operators can access this
        ...
    """
    async def role_checker(current_user: Operator = Depends(get_current_user)) -> Operator:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {', '.join([r.value for r in allowed_roles])}"
            )
        return current_user
    
    return role_checker


# ============================================
# CONVENIENCE DEPENDENCIES
# ============================================
# These make it easy to require specific roles

async def get_current_admin(
    current_user: Operator = Depends(require_role(OperatorRole.ADMIN))
) -> Operator:
    """Dependency to require admin role"""
    return current_user


async def get_current_operator(
    current_user: Operator = Depends(
        require_role(OperatorRole.ADMIN, OperatorRole.OPERATOR)
    )
) -> Operator:
    """Dependency to require admin or operator role"""
    return current_user


async def get_current_active_user(
    current_user: Operator = Depends(get_current_user)
) -> Operator:
    """Dependency to require any authenticated user (including viewers)"""
    return current_user