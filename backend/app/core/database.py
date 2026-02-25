"""
Database Module

This file handles database connections using SQLAlchemy.
SQLAlchemy is an ORM (Object-Relational Mapper) that lets us
work with database tables using Python classes instead of SQL.

Think of it as a translator between Python and PostgreSQL.


What's happening here?

Engine: Connection pool to database

Manages multiple connections efficiently
Reuses connections instead of creating new ones each time


Session: Workspace for database operations

Like opening a Word document, editing, then saving
Session = your workspace
Commit = save your changes
Rollback = undo if something goes wrong


Base: Parent class for all models

Every table we create will inherit from this
SQLAlchemy uses this to track all models


get_db(): Provides database session to routes

FastAPI Dependency Injection (we'll see this in action later)
Automatically handles connection lifecycle

"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker
)
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# ============================================
# CREATE DATABASE ENGINE
# ============================================
# The engine is like a "connection pool" to the database.
# It manages connections efficiently.

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # If True, prints all SQL queries (useful for debugging)
    future=True,  # Use SQLAlchemy 2.0 features
    pool_pre_ping=True,  # Verify connections are alive before using them
)

# ============================================
# CREATE SESSION FACTORY
# ============================================
# A session is like a "workspace" for database operations.
# You open a session, do your work, then close it.

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Don't expire objects after commit
    autocommit=False,  # We'll explicitly commit
    autoflush=False,  # We'll explicitly flush
)

# ============================================
# BASE CLASS FOR MODELS
# ============================================
# All our database models will inherit from this
Base = declarative_base()


# ============================================
# DATABASE SESSION DEPENDENCY
# ============================================
async def get_db():
    """
    Dependency that provides a database session.
    
    This is used in FastAPI routes like:
    
    @app.get("/items")
    async def get_items(db: AsyncSession = Depends(get_db)):
        # db is a database session
        items = await db.execute(select(Item))
        return items
    
    The session is automatically:
    - Created when function starts
    - Committed if no errors
    - Rolled back if errors occur
    - Closed when function ends
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session  # Provide session to the route
            await session.commit()  # Commit changes
        except Exception:
            await session.rollback()  # Undo changes if error
            raise  # Re-raise the error
        finally:
            await session.close()  # Always close the session


# ============================================
# UTILITY FUNCTION TO CREATE ALL TABLES
# ============================================
async def create_tables():
    """
    Create all database tables.
    
    This function creates tables based on our model definitions.
    We'll call this when the application starts.
    """
    async with engine.begin() as conn:
        # Import all models so SQLAlchemy knows about them
        from app.models.database import agent, task, operator
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Database tables created")



