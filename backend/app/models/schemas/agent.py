"""
Agent Schemas

Pydantic schemas for Agent data validation and serialization.

Used in API requests/responses to:
1. Validate incoming data
2. Serialize outgoing data
3. Auto-generate API documentation
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID


class AgentBase(BaseModel):
    """
    Base schema with common agent fields.
    
    Other schemas will inherit from this.
    """
    agent_id: str = Field(..., description="Unique agent identifier")
    hostname: str = Field(..., description="Computer hostname")
    username: Optional[str] = Field(None, description="Username agent is running as")
    domain: Optional[str] = Field(None, description="Active Directory domain")
    internal_ip: Optional[str] = Field(None, description="Internal IP address")
    external_ip: Optional[str] = Field(None, description="External IP address")
    os: Optional[str] = Field(None, description="Operating system")
    os_version: Optional[str] = Field(None, description="OS version")
    architecture: Optional[str] = Field(None, description="CPU architecture")


class AgentCreate(AgentBase):
    """
    Schema for creating a new agent (agent registration).
    
    This is what the agent sends when it first connects.
    
    Example JSON:
    {
        "agent_id": "abc-123",
        "hostname": "VICTIM-PC",
        "username": "john",
        "internal_ip": "192.168.1.100",
        "os": "Windows 11",
        "architecture": "x64"
    }
    """
    pass  # Inherits all fields from AgentBase


class AgentUpdate(BaseModel):
    """
    Schema for updating an agent.
    
    All fields are optional - only send fields you want to update.
    
    Example JSON:
    {
        "sleep_interval": 120,
        "jitter": 0.3
    }
    """
    sleep_interval: Optional[int] = Field(None, description="Beacon interval in seconds")
    jitter: Optional[float] = Field(None, ge=0, le=1, description="Sleep jitter (0.0-1.0)")
    group_id: Optional[UUID] = Field(None, description="Agent group ID")
    
    @validator('jitter')
    def validate_jitter(cls, v):
        """
        Validate jitter is between 0 and 1.
        
        Pydantic validators run automatically when data is received.
        """
        if v is not None and not 0 <= v <= 1:
            raise ValueError('Jitter must be between 0 and 1')
        return v


class AgentResponse(AgentBase):
    """
    Schema for agent data in API responses.
    
    This is what the API returns when you request agent info.
    
    Example JSON:
    {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "agent_id": "abc-123",
        "hostname": "VICTIM-PC",
        "status": "active",
        "last_seen": "2024-01-20T15:30:00",
        "created_at": "2024-01-20T10:00:00"
    }
    """
    id: UUID
    status: str
    sleep_interval: int
    jitter: float
    last_seen: datetime
    created_at: datetime
    updated_at: datetime
    privilege_level: Optional[str] = None
    process_name: Optional[str] = None
    process_id: Optional[int] = None
    
    class Config:
        """
        Pydantic configuration.
        
        orm_mode = True allows Pydantic to read data from SQLAlchemy models.
        
        This means you can do:
        agent_db = Agent(...)  # SQLAlchemy model
        agent_response = AgentResponse.from_orm(agent_db)
        """
        from_attributes = True


class AgentList(BaseModel):
    """
    Schema for list of agents (pagination support).
    
    Example JSON:
    {
        "agents": [...],
        "total": 150,
        "page": 1,
        "page_size": 50
    }
    """
    agents: list[AgentResponse]
    total: int
    page: int = 1
    page_size: int = 50