"""
Operator Model

Represents a user of the C2 system (operator/admin).

These are the people using the dashboard to control agents.
"""

import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import enum

from app.models.database.base import Base, TimeStampMixin


class OperatorRole(str, enum.Enum):
    """
    Operator roles for RBAC (Role-Based Access Control).
    
    ADMIN - Full access (can do anything)
    OPERATOR - Can manage agents and tasks (cannot manage users)
    VIEWER - Read-only access (cannot create/modify/delete)
    """
    ADMIN = "admin"
    OPERATOR = "operator"
    VIEWER = "viewer"


class Operator(Base, TimeStampMixin):
    """
    Operator (user) database model.
    """
    
    __tablename__ = "operators"
    
    # ============================================
    # PRIMARY KEY
    # ============================================
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False
    )
    
    # ============================================
    # CREDENTIALS
    # ============================================
    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )
    """
    Email address (used for login).
    
    Unique = no two users can have same email
    Indexed = fast lookup during login
    """
    
    username = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )
    """
    Username (also used for login, and display name).
    """
    
    hashed_password = Column(String(255), nullable=False)
    """
    Password hash (NEVER store plain password!).
    
    We use bcrypt to hash passwords.
    Example: "$2b$12$KIX..."
    """
    
    # ============================================
    # ROLE & PERMISSIONS
    # ============================================
    role = Column(
        Enum(OperatorRole),
        default=OperatorRole.VIEWER,
        nullable=False
    )
    """
    User's role (determines permissions).
    
    Default: VIEWER (least privileged)
    """
    
    is_active = Column(Boolean, default=True)
    """
    Whether account is active.
    
    If False, user cannot login.
    Used to disable accounts without deleting them.
    """
    
    # ============================================
    # ACTIVITY TRACKING
    # ============================================
    last_login = Column(DateTime, nullable=True)
    """
    When user last logged in.
    
    Useful for:
    - Security monitoring
    - Identifying inactive accounts
    """
    
    # ============================================
    # METHODS
    # ============================================
    def __repr__(self):
        return f"<Operator {self.username} ({self.role})>"
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
    
    def is_admin(self) -> bool:
        """Check if user is admin"""
        return self.role == OperatorRole.ADMIN
    
    def can_create_tasks(self) -> bool:
        """Check if user can create tasks"""
        return self.role in [OperatorRole.ADMIN, OperatorRole.OPERATOR]
    
    def can_manage_users(self) -> bool:
        """Check if user can manage other users"""
        return self.role == OperatorRole.ADMIN