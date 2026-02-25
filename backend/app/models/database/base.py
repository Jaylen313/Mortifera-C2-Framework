"""
Base Model

This file contains the base class for all database models.
It provides common fields that every model should have.
"""

from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declared_attr

from app.core.database import Base


class TimeStampMixin:
    """
    Mixin to add timestamp fields to models.
    
    Mixin = A class that provides functionality to other classes.
    Like adding a "plugin" to every model.
    
    Every model that uses this will automatically get:
    - created_at (when record was created)
    - updated_at (when record was last modified)
    """
    
    @declared_attr
    def created_at(cls):
        """
        Timestamp when record was created.
        
        default=datetime.utcnow means:
        When a new record is created, automatically set this to current time.
        """
        return Column(
            DateTime,
            default=datetime.utcnow,
            nullable=False
        )
    
    @declared_attr
    def updated_at(cls):
        """
        Timestamp when record was last updated.
        
        onupdate=datetime.utcnow means:
        Every time record is modified, automatically update this to current time.
        """
        return Column(
            DateTime,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
            nullable=False
        )


# Make Base available from this module
__all__ = ['Base', 'TimeStampMixin']